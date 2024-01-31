import fs from "fs";
import { General } from "./common/General.mjs";
import { ParametrosIncompletosException } from "./MyError.mjs";

const FOLDER_LOCALS = "assets/";
const PATH_LOCALS = `./src/${FOLDER_LOCALS}`;

export class MyFileServiceLocal {

    static async uploadFile(req, res, next) {

    }

    static async readFile(req, res, next) {
        console.log("1");
        const downloadFlag = req.query ? req.query.download : false;
        const encoding = req.query ? req.query.encoding : null;
        const rta = await MyFileServiceLocal.read(req.originalUrl, encoding);
        const MAPEO_CHARSET = {
            "utf8": "; charset=utf-8",
        };
        let charset = MAPEO_CHARSET[encoding];
        if (!charset) {
            charset = "";
        }
        res.writeHead(200, {
            "Content-Type": rta.metadata.contentType + charset,
            "Content-disposition":
                downloadFlag != undefined
                    ? "attachment;filename=" + rta.metadata.filename
                    : "inline",
        });
        res.end(rta.data);
    }

    static async readBinary(filePath) {
        filePath = filePath.replace(/^[/]/, "");
        const contents = fs.readFileSync(`${PATH_LOCALS}${filePath}`);
        return contents;
    }

    static async readString(filePath, encoding = "utf8") {
        const respuesta = await MyFileServiceLocal.readBinary(filePath);
        if (respuesta != null) {
            return respuesta.toString(encoding);
        }
        return null;
    }

    static async read(originalUrl, encoding = null) {
        const filePath = decodeURIComponent(originalUrl.replace(/^\//, "").replace(/\?.*$/, ""));
        const fileName = /[^/]+$/.exec(filePath)[0];

        const metadataPromise = new Promise((resolve, reject) => {
            fs.stat(`${PATH_LOCALS}${filePath}`, (err, stats) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(stats);
                }
            });
        });
        let contentPromise;
        if (encoding == null) {
            contentPromise = MyFileServiceLocal.readBinary(filePath);
        } else {
            contentPromise = MyFileServiceLocal.readString(filePath, encoding);
        }
        return new Promise((resolve, reject) => {
            Promise.all([metadataPromise, contentPromise]).then(
                function (respuesta) {
                    const metadata = respuesta[0];
                    metadata.filename = fileName;
                    metadata.fullPath = originalUrl;
                    const content = respuesta[1];
                    resolve({
                        metadata: metadata,
                        data: content,
                    });
                },
                function (err) {
                    metadataPromise
                        .then(() => {
                            reject(err);
                        })
                        .catch((error) => {
                            if (error.code == 404) {
                                resolve(null);
                            } else {
                                reject(err);
                            }
                        });
                }
            );
        });
    }

    static async deleteFile(req, res, next) {

    }

    static async listFiles(req, res, next) {
        let localPath = General.readParam(req, "path");
        if (localPath == null) {
            throw new ParametrosIncompletosException("Falta path");
        }
        // Use only slashes
        localPath = localPath.replace(/\\/g, "/");
        // Avoid end with slash
        localPath = localPath.replace(/\/\s*$/g, "");
        // Avoid starts with slash
        localPath = localPath.replace(/^\//, "");
        //passsing directoryPath and callback function
        const fileObjs = fs.readdirSync(`${PATH_LOCALS}${localPath}`, { withFileTypes: true });
        const response = [];
        fileObjs.forEach(function (file) {
            response.push({ name: file.name, path: `${FOLDER_LOCALS}${localPath}/${file.name}` });
        });
        res.status(200).send({ data: response });
    }
}