import url from "url";
import fs from "fs";
import path from "path";
import { guessMimeType } from "./common/MimeTypeMap.mjs";
import { MainReplacer } from "./MainReplacer.mjs";
import { MyRoutes } from "../srcJs/MyRoutes.js";
import { PageSrv } from "./PageSrv.mjs";

export class MainHandler {
    static LOCAL_FOLDER = path.resolve() + "/dist/bundle";
    static async handle(req, res, next) {
        const originalUrl = req.getUrl();
        const theUrl = url.parse(originalUrl);
        if (theUrl.pathname == "/socket.io/") {
            return next();
        }
        const rutas = MainHandler.decodeUrl(theUrl);
        const encoding = req.query.encoding;
        const rta = await MainHandler.resolveLocalFile(rutas, encoding);

        if (
            rta != null &&
            typeof rta.data == "string" &&
            rta.metadata.filename == "index.html"
        ) {
            const partes = MyRoutes.splitPageData(theUrl.path);
            const replaces = await PageSrv.loadCurrentPage(partes.pageType, partes.pageId);
            MainReplacer.replace(rta, replaces, theUrl);
        }
        MainHandler.makeResponse(rta, req, res);
    }

    static decodeUrl(localPath) {
        const respuestas = [];
        respuestas.push(localPath.pathname);
        respuestas.push("/index.html");
        const ans = {
            files: respuestas,
            pageType: null,
            pageId: null,
        };
        return ans;
    }

    static makeResponse(rta, req, res) {
        const downloadFlag = (req.query && req.query.download);
        if (rta != null) {
            if (rta.redirect) {
                res.redirect(rta.redirect);
            } else {
                res.writeHead(200, {
                    "Content-Type": rta.metadata.contentType,
                    "Content-disposition":
                        downloadFlag ? "attachment;filename=" + rta.metadata.filename : "inline",
                });
                res.end(rta.data);
            }
        } else {
            res.status(202).end();
        }
    }

    static async resolveLocalFile(localPath, encoding = "utf8") {
        for (let i = 0; i < localPath.files.length; i++) {
            const filename = localPath.files[i];
            const contentType = guessMimeType(filename);
            let contenido;
            if (["text/html"].indexOf(contentType) >= 0) {
                contenido = await MainHandler.resolveLocalFileSingle(
                    filename,
                    encoding
                );
            } else {
                contenido = await MainHandler.resolveLocalFileSingle(filename);
            }
            if (contenido != null) {
                return {
                    data: contenido,
                    metadata: {
                        contentType: contentType,
                        filename: /[^/]*$/.exec(filename)[0],
                        fullPath: filename,
                    },
                };
            }
        }
        return null;
    }

    static async resolveLocalFileSingle(filename, encoding) {
        return new Promise((resolve, reject) => {
            const somePath = path.join(MainHandler.LOCAL_FOLDER, filename);

            fs.access(somePath, (err) => {
                if (err) {
                    resolve(null);
                } else {
                    if (!fs.lstatSync(somePath).isFile()) {
                        resolve(null);
                        return;
                    }
                    if (typeof encoding == "string") {
                        fs.readFile(somePath, encoding, function (err, data) {
                            if (err) {
                                reject(err);
                                return;
                            }
                            resolve(data);
                        });
                    } else {
                        fs.readFile(somePath, function (err, data) {
                            if (err) {
                                reject(err);
                                return;
                            }
                            resolve(data);
                        });
                    }
                }
            });
        });
    }

    static addGetUrl(req, res, next) {
        req.getUrl = function () {
            return req.protocol + "://" + req.get("host") + req.originalUrl;
        };
        return next();
    }
}
