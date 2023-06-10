import path from "path";
import fs from "fs";
import { spawn } from "child_process";
import { General } from "./common/General.mjs";

export class MyShell {

    //http://localhost:8081/srv/shell?cmd=solvePnP&payload={"v2": [[282, 274], [397, 227], [577, 271], [462, 318], [270, 479], [450, 523], [566, 475]], "v3": [[0.5, 0.5, -0.5], [0.5, 0.5, 0.5], [-0.5, 0.5, 0.5], [-0.5, 0.5, -0.5], [0.5, -0.5, -0.5], [-0.5, -0.5, -0.5], [-0.5, -0.5, 0.5]]}
    //http://localhost:8081/srv/shell?cmd=ls%20-la
    static async run(req, res, next) {
        const cmd = General.readParam(req, "cmd");
        const payload = General.readParam(req, "payload");
        const dato = await MyShell.runLocal(cmd, payload);
        res.setHeader('content-type', 'text/plain');
        res.end(dato);
    }
    static existsExecutable(execPath) {
        try {
            if (fs.lstatSync(execPath).isFile()) {
                return true;
            }
        } catch (err) { }
        return false;
    }
    //MyShell.getBinDir()
    static getBinDir() {
        const DIR = process.env.BIN_DIR || "bin-docker";
        return DIR;
    }
    static async runLocal(command, payload = null) {
        const args = command.split(/\s+/g);
        const command1 = args.splice(0, 1)[0];
        let execPath = path.join(process.cwd(), `/${MyShell.getBinDir()}/${command1}`);
        if (!MyShell.existsExecutable(execPath)) {
            execPath = command1;
        }
        if (payload !== null) {
            args.push(payload);
        }
        const dirPath = path.join(process.cwd(), `/${MyShell.getBinDir()}/libs`);
        const options = { env: { LD_LIBRARY_PATH: dirPath } };
        const ls = spawn(execPath, args, options);

        return new Promise((resolve, reject) => {
            let total = "";
            let isError = false;
            ls.stdout.on("data", data => {
                total += data.toString();
            });

            ls.stderr.on("data", data => {
                //console.log(`stderr: ${data}`);
                //reject(new Error(data));
                total += data.toString();
                isError = true;
            });

            ls.on('error', (error) => {
                //console.log(`error: ${error.message}`);
                reject(error);
            });

            ls.on("close", code => {
                //console.log(`child process exited with code ${code}`);
                if (isError) {
                    reject(total);
                } else {
                    resolve(total);
                }
            });
        });

    }
}