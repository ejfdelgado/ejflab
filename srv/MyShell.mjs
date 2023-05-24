import path from "path";
import fs from "fs";
import { spawn } from "child_process";
import { General } from "./common/General.mjs";

export class MyShell {

    //http://localhost:80/srv/shell?cmd=solvePnP&payload={"a": 4}
    //http://localhost:80/srv/shell?cmd=ls%20-la
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
    static async runLocal(command, payload = null) {
        console.log(`command = ${command} payload = ${payload}`);
        const args = command.split(/\s+/g);
        const command1 = args.splice(0, 1)[0];
        let execPath = path.join(process.cwd(), `/bin/${command1}`);
        if (!MyShell.existsExecutable(execPath)) {
            execPath = command1;
        }
        console.log(`command1 = ${command1}`);
        if (payload !== null) {
            args.push(payload);
        }
        const dirPath = path.join(process.cwd(), '/bin/libs');
        const options = { env: { LD_LIBRARY_PATH: dirPath } };
        console.log(`execPath = ${execPath} args = ${JSON.stringify(args)} options = ${JSON.stringify(options)}`);
        const ls = spawn(execPath, args, options);

        return new Promise((resolve, reject) => {
            let total = "";
            let isError = false;
            ls.stdout.on("data", data => {
                total += data.toString();
            });

            ls.stderr.on("data", data => {
                console.log(`stderr: ${data}`);
                //reject(new Error(data));
                total += data.toString();
                isError = true;
            });

            ls.on('error', (error) => {
                console.log(`error: ${error.message}`);
                reject(error);
            });

            ls.on("close", code => {
                console.log(`child process exited with code ${code}`);
                if (isError) {
                    reject(total);
                } else {
                    resolve(total);
                }
            });
        });

    }
}