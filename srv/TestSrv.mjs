
export class TestSrv {
    static prueba(req, res, next) {
        const AHORA = new Date().getTime();
        const respuesta = {};
        respuesta.now = AHORA;
        res.status(200).send(respuesta);
    }
}