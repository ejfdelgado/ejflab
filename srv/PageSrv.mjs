import { MyRoutes } from "../srcJs/MyRoutes.js"
import { MyStore } from "./common/MyStore.mjs";
import { Utilidades } from "./common/Utilidades.mjs";
import { NoExisteException } from "./MyError.mjs";

const PAGE_TYPE = "page";

export class PageSrv {
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
    static async getCurrentPage(req, res, next) {
        const user = res.locals.user;
        const elpath = Utilidades.leerRefererPath(req);
        const partes = MyRoutes.splitPageData(elpath);
        const respuesta = await PageSrv.loadCurrentPage(partes.pageType, partes.pageId, user);
        res.status(200).send(respuesta);
    }
}