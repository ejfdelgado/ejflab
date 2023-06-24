import { General } from "./common/General.mjs";
import { ExecFolder, MyShell } from "./MyShell.mjs";

export class OpenCVSrv {
    //await OpenCVSrv.solvePnPLocal({"v2": [[282, 274], [397, 227], [577, 271], [462, 318], [270, 479], [450, 523], [566, 475]], "v3": [[0.5, 0.5, -0.5], [0.5, 0.5, 0.5], [-0.5, 0.5, 0.5], [-0.5, 0.5, -0.5], [0.5, -0.5, -0.5], [-0.5, -0.5, -0.5], [-0.5, -0.5, 0.5]]});
    static async solvePnPLocal(payload) {
        const cmd = "solvePnP";
        const points3d = payload.points3d;
        const folder = new ExecFolder();
        folder.writeTextFile("points3d.json", JSON.stringify(points3d));
        delete payload.points3d;
        const dato = await MyShell.runLocal(cmd, JSON.stringify(payload));
        folder.destroyFolder();
        return dato;
    }
    static async solvePnP(req, res, next) {
        const payload = General.readParam(req, "payload");
        const dato = await OpenCVSrv.solvePnPLocal(payload);
        res.setHeader('content-type', 'text/json');
        res.end(dato);
    }
}