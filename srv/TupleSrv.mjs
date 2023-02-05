import { MyStore } from "./common/MyStore.mjs";
import { MalaPeticionException, NoExisteException } from "./MyError.mjs";
import { General } from "./common/General.mjs";
import { MyDates } from "../srcJs/MyDates.js";

const TUPLE_TYPE = "tuple";
const TUPLE_TEMP_TYPE = "tuple-temp";
const MAX_READ_SIZE = 30;

/*
{
    id: "${pageId}:${actual.k}",
    v: { },
    act: YYYYMMddHHmmSSmmm,
    cre: YYYYMMddHHmmSSmmm
}
*/
export class TupleSrv {
    static async read(req, res, next) {
        const AHORA = MyDates.getDayAsContinuosNumberHmmSSmmm(new Date());
        // Se debe leer el parametro id, offset, max
        const pageId = General.readParam(req, "id");
        const offsetR = parseInt(General.readParam(req, "offset"));
        const maxR = parseInt(General.readParam(req, "max"));
        let offset = 0;
        if (!isNaN(offsetR)) {
            offset = Math.max(0, offsetR);
        }
        let max = 0;
        if (!isNaN(maxR)) {
            max = Math.min(MAX_READ_SIZE, maxR);
        }

        if (!pageId) {
            throw new MalaPeticionException("Falta el id");
        }

        // Se debe validar el permiso de lectura
        // TODO

        // Se debe realizar la lectura como tal
        const where = [
            { key: "pg", oper: "==", value: pageId },
        ];
        const response = await MyStore.paginate(TUPLE_TYPE, [{ name: "act", dir: 'asc' }], offset, max, where);
        res.status(200).send({
            t: AHORA,
            payload: response,
        });
    }
    static async save(req, res, next) {
        const token = res.locals.token;
        const AHORA = MyDates.getDayAsContinuosNumberHmmSSmmm(new Date());
        // Se debe leer el parametro id y body
        const pageId = General.readParam(req, "id");
        const live = General.readParam(req, "live");
        const body = General.readParam(req, "body", undefined);

        if (!pageId) {
            throw new MalaPeticionException("Falta el id");
        }
        if (body === undefined) {
            throw new MalaPeticionException("Falta el body");
        }

        // Se debe validar el permiso de esritura
        // TODO

        const batch = MyStore.getBatch();
        // Se deben escribir los borrados
        const borrados = body["-"];
        for (let i = 0; i < borrados.length; i++) {
            const actual = borrados[i];
            MyStore.deleteById(TUPLE_TYPE, `${pageId}:${actual.k}`, batch);
        }
        // Se deben escribir las adiciones
        const adiciones = body["+"];
        for (let i = 0; i < adiciones.length; i++) {
            const actual = adiciones[i];
            const payload = {
                v: actual.v,
                act: AHORA,
                cre: AHORA,
                pg: pageId,
                k: actual.k,
            };
            MyStore.createById(TUPLE_TYPE, `${pageId}:${actual.k}`, payload, batch);
        }

        // Se deben escribir las actualizaciones
        const actualizaciones = body["*"];
        for (let i = 0; i < actualizaciones.length; i++) {
            const actual = actualizaciones[i];
            const payload = {
                v: actual.v,
                act: AHORA,
            };
            MyStore.updateById(TUPLE_TYPE, `${pageId}:${actual.k}`, payload, batch);
        }

        // Place the live changes
        if (live == "1") {
            const nuevo = { pg: pageId, body, who: token.uid, t: AHORA };
            MyStore.createById(TUPLE_TEMP_TYPE, `${pageId}:${token.uid}`, nuevo, batch);
        }

        // Commit the batch
        await batch.commit();
        res.status(204).send();
    }
}