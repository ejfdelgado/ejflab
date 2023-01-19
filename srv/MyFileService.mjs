import axios from "axios";
import sharp from "sharp";
import { Buffer } from 'buffer';
import { Storage } from '@google-cloud/storage';
import { General } from '../utils/General.mjs'
import { CONSTANTES } from "../Constants.mjs"
import ReadableStreamClone from 'readable-stream-clone'

const storage = new Storage();

const defaultBucket = storage.bucket(CONSTANTES.BUCKET.PUBLIC);

export class MyFileService {

    async setFilePublic(fileName) {
        await defaultBucket
            .file(fileName)
            .makePublic();
    }

    static async deleteDonationFiles(keyName) {
        keyName = keyName.replace(/^.*storage.googleapis.com\/[^/]+\//ig, "");
        const keyNameXs = General.getSuffixPath(keyName, "_xs");
        const file = defaultBucket.file(keyName);
        const fileXs = defaultBucket.file(keyNameXs);
        const reporte = [];
        try {
            const detalle = { url: keyName };
            reporte.push(detalle);
            await file.delete();
            detalle.ok = true;
        } catch (error) { }
        try {
            const detalle = { url: keyNameXs };
            reporte.push(detalle);
            await fileXs.delete();
            detalle.ok = true;
        } catch (error) { }
        return reporte;
    }

    static async cloneFile(token, orig, dest) {
        const origPath = MyFileService.getKeyBucketPath(token, orig.folder, orig.filename, orig.type);
        const destPath = MyFileService.getKeyBucketPath(token, dest.folder, dest.filename, dest.type);
        const origFile = defaultBucket.file(origPath);
        const destFile = defaultBucket.file(destPath);
        const copyOptions = {};
        await origFile.copy(destFile, copyOptions);
        await destFile.makePublic();
    }

    static async fetchUrl2Bucket(url, token, folder, filename, type) {
        const keyName = MyFileService.getKeyBucketPath(token, folder, filename, type);
        const options = { responseType: 'stream' };
        const response = await new Promise((resolve, reject) => {
            axios.get(url, options)
                .then(res => { resolve(res) })
                .catch(error => { reject(error) });
        });
        const stream = response.data;
        const file = defaultBucket.file(keyName);
        await MyFileService.sendFile2Bucket(stream, file);
        await file.makePublic();
        const uri = `${CONSTANTES.BUCKET.URL_BASE}/${CONSTANTES.BUCKET.PUBLIC}/${keyName}`;
        return uri;
    }

    static async sendFile2Bucket(req, file) {
        return new Promise((resolve, reject) => {
            req.pipe(file.createWriteStream()).on('finish', () => {
                resolve();
            }).on('error', (error) => {
                reject(error);
            });
        });
    }

    static getKeyBucketPath(token, folder = "general", fileName, type) {
        const mp = General.getNameParts();
        let keyName;
        if (type == "FIRST_YEAR_MONTH") {
            keyName = `${folder}/${mp.year}/${mp.month}/${token.email}/${mp.day}/${mp.hours}/${mp.minutes}/${mp.seconds}/${mp.millis}/${fileName}`;
        } else if (type == "FIRST_EMAIL") {
            keyName = `${folder}/${token.email}/${mp.year}/${mp.month}/${mp.day}/${mp.hours}/${mp.minutes}/${mp.seconds}/${mp.millis}/${fileName}`;
        } else {
            keyName = `${folder}/${token.email}${fileName}`;
        }
        return keyName;
    }

    static async uploadFile(req, res, next) {
        const token = res.locals.token;

        const extra = req.headers.extra;
        if (extra) {
            try {
                const buffer = Buffer.from(extra, 'base64');
                const texto = buffer.toString("utf8");
                if (!req.locals) {
                    req.locals = {};
                }
                req.locals.extra = JSON.parse(texto);
            } catch (e) {
                console.log(e);
                console.log("Can't decode extra header, but present.");
            }
        }

        let folderType = "FIRST_YEAR_MONTH";

        if (req.headers.folder_type) {
            folderType = req.headers.folder_type;
        }

        const keyName = MyFileService.getKeyBucketPath(
            token,
            req.headers.folder,
            req.headers.filename,
            folderType,
        );
        const keyNameXs = General.getSuffixPath(keyName, "_xs");

        const file = defaultBucket.file(keyName);
        const fileXs = defaultBucket.file(keyNameXs);

        let sizeBig = 1024;
        let sizeSmall = 256;

        if (req.headers.size_big) {
            const numero = parseInt(req.headers.size_big);
            if (!isNaN(numero)) {
                sizeBig = numero;
            }
        }
        if (req.headers.size_small) {
            const numero = parseInt(req.headers.size_small);
            if (!isNaN(numero)) {
                sizeSmall = numero;
            }
        }

        const bigImage = sharp().resize(null, sizeBig).withMetadata().jpeg({ mozjpeg: true });
        const smallImage = sharp().resize(null, sizeSmall).withMetadata().jpeg({ mozjpeg: true });

        const readClone1 = new ReadableStreamClone(req);
        const readClone2 = new ReadableStreamClone(req);

        await MyFileService.sendFile2Bucket(readClone1.pipe(bigImage), file);
        await file.makePublic();

        await MyFileService.sendFile2Bucket(readClone2.pipe(smallImage), fileXs);
        await fileXs.makePublic();

        res.locals.bucket = CONSTANTES.BUCKET.PUBLIC;
        res.locals.key = `${keyName}`;
        const uri = `${CONSTANTES.BUCKET.URL_BASE}/${CONSTANTES.BUCKET.PUBLIC}/${keyName}`;
        res.locals.uri = uri;

        if (typeof next != "undefined") {
            await next();
        } else {
            res.status(200).send({ uri: res.locals.uri, key: res.locals.key, bucket: res.locals.bucket });
        }
    }
}