import { MyRoutes } from "../srcJs/MyRoutes.js"
import { Utilidades } from "./common/Utilidades.mjs";

export class PageSrv {
    static async loadCurrentPage(pageType, pageId, usuario = null) {
        const AHORA = new Date().getTime() / 1000;
        if (usuario == null && pageId == null) {
            return {};
        }
        if (typeof pageId == "number") {
            // Si hay id se debe buscar con Id y listo

        } else {
            if (usuario) {
                const elUsuario = usuario.metadatos.uid;
                // Si no hay id pero hay usuario logeado se debe buscar por aut y pageType
                // Si no existe lo crea y devuelve el valor por defecto
            }
        }
        return {
            id: null,
            act: null,
            aut: "google.com/edgar.jose.fernando.delgado@gmail.com",
            date: null,
            desc: "Es mi descripción",
            img: "Es una imagen",
            kw: "my key words",
            path: "/customers",
            q: null,
            tit: "Es un título",
            usr: null,
        };
    }
    static async getCurrentPage(req, res, next) {
        const user = res.locals.user;
        const elpath = Utilidades.leerRefererPath(req);
        const partes = MyRoutes.splitPageData(elpath);
        const respuesta = await PageSrv.loadCurrentPage(partes.pageType, partes.pageId, user);
        res.status(200).send(respuesta);
    }
}