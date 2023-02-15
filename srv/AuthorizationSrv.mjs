import {
    MalaPeticionException,
    NoExisteException,
    NoAutorizadoException
} from "./MyError.mjs";
import { General } from "./common/General.mjs";
import { MyStore } from "./common/MyStore.mjs";
import { MyDates } from "../srcJs/MyDates.js";

const AUTH_TYPE = "auth";
const MAX_READ_SIZE = 30;

/**
 * Roles:
 * 
 * Reader, Editor, Owner
 * 
 * Capacidades
 * r
 * w
 * 
 * Recursos
 * 
 * fil - los archivos
 * pg - la página
 * tup - las tuplas
 * per - los permisos
 */

/**
 * {
 *      id: "${recurso}:${identidad}"//Esta será la llave de búsqueda, cuando no hay identidad se refiere al valor por defecto
 *      rsc: "${recurso}",
 *      who: "${identidad}",
 *      act: number,
 *      cre: number,
 *      auth: ["fil_r"],
 * }
 */

/**
 * [{
 *      who: "${identidad}",
 *      auth: ["fil_r"],
 *      erase: true,
 * }]
 */
export class AuthorizationSrv {
    static async save(req, res) {
        const AHORA = MyDates.getDayAsContinuosNumberHmmSSmmm(new Date());
        // Se lee el id del recurso}
        const idResource = req.params['pageId'];
        const lista = General.readParam(req, "lista");

        if (!idResource) {
            throw new MalaPeticionException("Falta el id");
        }
        if (!(lista instanceof Array)) {
            throw new MalaPeticionException("Falta la lista");
        }

        // Se lee el token
        // Se valida que el usuario esté autorizado para modificar los permisos del recurso

        await MyStore.runTransaction(async (firebaseInstance) => {
            // Se buscan los existentes
            const ids = [];
            for (let i = 0; i < lista.length; i++) {
                const permiso = lista[i];
                ids.push(`${idResource}:${permiso.who}`);
            }
            // Se guardan los permisos
            const existentes = await MyStore.readByIds(AUTH_TYPE, ids, firebaseInstance);
            const promesas = [];
            for (let i = 0; i < lista.length; i++) {
                const permiso = lista[i];
                const compundId = `${idResource}:${permiso.who}`;
                const existente = existentes[compundId];
                if (existente !== undefined) {
                    if (permiso.erase === true) {
                        // Se debe borrar
                        promesas.push(MyStore.deleteById(AUTH_TYPE, compundId, firebaseInstance));
                    } else {
                        // Se debe actualizar
                        promesas.push(MyStore.updateById(AUTH_TYPE, compundId, {
                            act: AHORA,
                            auth: permiso.auth,
                            role: permiso.role,
                        }, firebaseInstance));
                    }
                } else {
                    // Toca crear
                    promesas.push(MyStore.createById(AUTH_TYPE, compundId, {
                        act: AHORA,
                        cre: AHORA,
                        rsc: idResource,
                        who: permiso.who,
                        auth: permiso.auth,
                        role: permiso.role,
                    }, firebaseInstance));
                }
            }
            await Promise.all(promesas);
        });
        res.status(204).send();
    }

    static async readAll(req, res) {
        const idResource = req.params['pageId'];

        const { max, offset } = General.readMaxOffset(req, MAX_READ_SIZE);
        if (!idResource) {
            throw new MalaPeticionException("Falta el id");
        }

        const where = [
            { key: "rsc", oper: "==", value: idResource },
        ];

        const response = await MyStore.paginate(AUTH_TYPE, [], offset, max, where);
        res.status(200).send({
            payload: response,
        });
    }

    static async getPermisions(idResource, who) {
        const llavePublica = `${idResource}:`;
        const llavePersonal = `${idResource}:${who}`;
        const resultado = await MyStore.readByIds(AUTH_TYPE, [llavePublica, llavePersonal]);
        let respuesta = [];
        if (llavePublica in resultado) {
            respuesta = resultado[llavePublica].auth;
        }
        if (llavePersonal in resultado) {
            const permiso = resultado[llavePersonal];
            for (let i = 0; i < permiso.auth.length; i++) {
                const unPermiso = permiso.auth[i];
                if (respuesta.indexOf(unPermiso) < 0) {
                    respuesta.push(unPermiso);
                }
            }
        }
        return respuesta;
    }
}