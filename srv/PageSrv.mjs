import { MyRoutes } from "../srcJs/MyRoutes.js"
import { General } from "./common/General.mjs";
import { MyStore } from "./common/MyStore.mjs";
import { Utilidades } from "./common/Utilidades.mjs";
import { MalaPeticionException, NoExisteException } from "./MyError.mjs";

const PAGE_TYPE = "page";

export class PageSrv {
    static async savePage(req, res, next) {
        const respuesta = {};
        const pageId = parseInt(General.readParam(req, "id"));
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
            await MyStore.updateById(PAGE_TYPE, pageId, {
                tit,
                desc,
            });
            response.tit = tit;
            response.desc = desc;
            respuesta = response;
        } else {
            throw new NoExisteException(`Does not exists ${pageId}`);
        }
        res.status(200).send(respuesta);
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
}