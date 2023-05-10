import { spawn } from "child_process";
import { General } from "./common/General.mjs";

export class MyShell {
    static async run(req, res, next) {
        const cmd = General.readParam(req, "cmd");
        const dato = await MyShell.runLocal(cmd);
        res.setHeader('content-type', 'text/plain');
        res.end(dato);
    }
    static async runLocal(command) {
        const args = command.split(/\s+/g);
        const command1 = args.splice(0, 1);
        const ls = spawn(command1[0], args);

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