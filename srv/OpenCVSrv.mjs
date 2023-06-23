import { General } from "./common/General.mjs";
import { InesperadoException } from "./MyError.mjs";
import { MyShell } from "./MyShell.mjs";

export class OpenCVSrv {
    //await OpenCVSrv.solvePnPLocal({"v2": [[282, 274], [397, 227], [577, 271], [462, 318], [270, 479], [450, 523], [566, 475]], "v3": [[0.5, 0.5, -0.5], [0.5, 0.5, 0.5], [-0.5, 0.5, 0.5], [-0.5, 0.5, -0.5], [0.5, -0.5, -0.5], [-0.5, -0.5, -0.5], [-0.5, -0.5, 0.5]]});
    static async solvePnPLocal(payload) {
        const cmd = "solvePnP";
        const dato = await MyShell.runLocal(cmd, JSON.stringify(payload));
        return dato;
    }
    static async solvePnP(req, res, next) {
        const payload = General.readParam(req, "payload");
        const dato = await OpenCVSrv.solvePnPLocal(payload);
        res.setHeader('content-type', 'text/json');
        const parsed = JSON.parse(dato);
        if (typeof parsed.error == "string") {
            throw new InesperadoException(parsed.error);
        }
        res.end(dato);
    }
}