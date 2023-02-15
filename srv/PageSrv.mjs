import { MyUtilities } from "../srcJs/MyUtilities.js";
import { MyRoutes } from "../srcJs/MyRoutes.js"
import { General } from "./common/General.mjs";
import { MyStore } from "./common/MyStore.mjs";
import { Utilidades } from "./common/Utilidades.mjs";
import { MalaPeticionException, NoExisteException } from "./MyError.mjs";

const PAGE_TYPE = "page";
const MAX_READ_SIZE = 30;

export class PageSrv {
    static async savePage(req, res, next) {
        let respuesta = {};
        const pageId = req.params['pageId'];
        const datos = General.readParam(req, "datos");
        if (!pageId) {
            throw new MalaPeticionException("Falta el id");
        }
        if (!datos || !(typeof datos == "object")) {
            throw new MalaPeticionException("Falta datos");
        }
        const response = await MyStore.readById(PAGE_TYPE, pageId);
        if (response) {
            const { tit, desc } = datos;
            const q = MyUtilities.partirTexto(`${typeof tit == 'string' ? tit : ''} ${typeof desc == 'string' ? desc : ''}`, true);
            //Se agrega al buscable el correo del autor
            q.push(response.usr);
            const updated = {
                tit,
                desc,
                q,
            };
            if (res.locals && res.locals.uri) {
                updated.img = res.locals.uri;
            }
            await MyStore.updateById(PAGE_TYPE, pageId, updated);
            Object.assign(response, updated);
            respuesta = response;
        } else {
            throw new NoExisteException(`Does not exists ${pageId}`);
        }
        res.status(200).send(respuesta);
    }
    static async createNewPage(req, res, next) {
        const AHORA = new Date().getTime() / 1000;
        const user = res.locals.user;
        const elpath = Utilidades.leerRefererPath(req);
        const partes = MyRoutes.splitPageData(elpath);
        const elUsuario = user.metadatos.email;
        const nueva = {
            usr: elUsuario,
            path: partes.pageType,
            date: AHORA,
            act: AHORA,
            tit: "Título",
            desc: "Descripción",
            img: "",
            kw: "",
        };
        await MyStore.create(PAGE_TYPE, nueva);
        res.status(200).send(nueva);
    }
    static async getCurrentPage(req, res, next) {
        const user = res.locals.user;
        const elpath = Utilidades.leerRefererPath(req);
        const partes = MyRoutes.splitPageData(elpath);
        const respuesta = await PageSrv.loadCurrentPage(partes.pageType, partes.pageId, user);
        res.status(200).send(respuesta);
    }
    static async loadCurrentPage(pageType, pageId, usuario = null) {
        const AHORA = new Date().getTime() / 1000;
        if (usuario == null && pageId == null) {
            return {};
        }
        if (typeof pageId == "string") {
            // Si hay id se debe buscar con Id y listo
            const response = await MyStore.readById(PAGE_TYPE, pageId);
            if (response) {
                return response;
            } else {
                throw new NoExisteException(`Does not exists ${pageId}`);
            }
        } else {
            if (usuario) {
                const elUsuario = usuario.metadatos.email;
                const where = [
                    { key: "usr", oper: "==", value: elUsuario },
                    { key: "path", oper: "==", value: pageType },
                ];
                const max = 1;
                // Si no hay id pero hay usuario logeado se debe buscar por aut y pageType
                const response = await MyStore.paginate(PAGE_TYPE, [{ name: "act", dir: 'desc' }], 0, max, where);
                if (response.length > 0) {
                    return response[0];
                } else {
                    // Si no existe lo crea y devuelve el valor por defecto
                    const nueva = {
                        usr: elUsuario,
                        path: pageType,
                        date: AHORA,
                        act: AHORA,
                        tit: "Título",
                        desc: "Descripción",
                        img: "",
                        kw: "",
                    };
                    await MyStore.create(PAGE_TYPE, nueva);
                    return nueva;
                }
            }
        }
    }
    static async iterateMyPages(req, res, next) {
        const token = res.locals.token;
        const { max, offset } = General.readMaxOffset(req, MAX_READ_SIZE);
        const q = General.readParam(req, "q");
        const path = General.readParam(req, "path");
        if (!path) {
            throw new MalaPeticionException("Falta el path");
        }
        // Que sea mio
        const where = [
            { key: "usr", oper: "==", value: token.email },
            { key: "path", oper: "==", value: path },
        ];
        if (typeof q == 'string' && q.trim().length > 0) {
            const partes = MyUtilities.partirTexto(q, false, true);
            where.push({
                key: "q", oper: "array-contains-any", value: partes
            });
        }
        const response = await MyStore.paginate(PAGE_TYPE, [{ name: "act", dir: 'desc' }], offset, max, where);
        res.status(200).send(response);
    }
    static async iterateAllPages(req, res, next) {
        const { max, offset } = General.readMaxOffset(req, MAX_READ_SIZE);
        const q = General.readParam(req, "q");
        const path = General.readParam(req, "path");
        if (!path) {
            throw new MalaPeticionException("Falta el path");
        }
        const where = [
            { key: "path", oper: "==", value: path },
        ];
        if (typeof q == 'string' && q.trim().length > 0) {
            const partes = MyUtilities.partirTexto(q, false, true);
            where.push({
                key: "q", oper: "array-contains-any", value: partes
            });
        }
        const response = await MyStore.paginate(PAGE_TYPE, [{ name: "act", dir: 'desc' }], offset, max, where);
        res.status(200).send(response);
    }
}