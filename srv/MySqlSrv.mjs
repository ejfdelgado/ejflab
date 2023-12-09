import * as mysql from "mysql2/promise";

export class MySqlSrv {
    connectionPromise = null;
    connection = null;
    constructor() {
    }

    getConnectionParams() {
        const host = process.env.PMA_HOST || "localhost";
        const port = parseInt(process.env.PMA_PORT || "6033");
        const database = process.env.MYSQL_DATABASE || "policia_vr";
        const user = process.env.MYSQL_ROOT_USER || "root";
        const password = process.env.MYSQL_ROOT_PASSWORD || "p0l1c14";
        return {
            host,
            port,
            user,
            database,
            password,
            waitForConnections: true,
            connectionLimit: 10,
            maxIdle: 10, // max idle connections, the default value is the same as `connectionLimit`
            idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
            queueLimit: 0,
            enableKeepAlive: true,
            keepAliveInitialDelay: 0
        };
    }

    async connect() {
        this.connectionPromise = mysql.createPool(this.getConnectionParams());
        this.connection = await this.connectionPromise;
    }

    async checkConnection() {
        await this.connectionPromise;
    }

    async disconnect() {
        this.connection.end();
    }
}

export class PoliciaVrMySql extends MySqlSrv {
    async createScore(personId, sceneId) {
        const theQuery = `\
        INSERT INTO puntaje \
        (puntaje_participante, puntaje_escenario) \
        VALUES (?, ?)\
        `;
        const [rows] = await this.connection.execute(theQuery, [personId, sceneId]);
        const insertedId = rows.insertId;
        return insertedId;
    }
    async readScore(id) {
        const theQuery = `\
        SELECT * FROM puntaje \
        WHERE puntaje_id = ?\
        `;
        const [rows] = await this.connection.execute(theQuery, [id]);
        if (rows.length > 0) {
            return rows[0];
        } else {
            return null;
        }
    }
    async updateScore(id, column, value) {
        const theQuery = `\
        UPDATE puntaje \
        SET ${column} = ? \
        WHERE puntaje_id = ?\
        `;
        const [rows] = await this.connection.execute(theQuery, [value, id]);
    }
    async getParticipantsByLastNameLetter(someWord, limit = 10, offset = 0) {
        const theQuery = `\
        SELECT \
        par.participante_apellidos AS ape, \
        par.participante_nombres AS nom, \
        uni.unidad_nombre AS uni, \
        par.participante_id AS id \
        \
        FROM participante par \
        INNER JOIN unidad uni \
        ON uni.unidad_id = par.participante_unidad \
        \
        WHERE par.participante_apellidos REGEXP ?\
        LIMIT ${offset}, ${limit}\
        `;
        const [rows] = await this.connection.execute(theQuery, [`^${someWord}|[[:space:]]+${someWord}`]);
        return rows;
    }
    async getAllParticipantsByLastNameLetter(someWord, page = 10) {
        let resultadoParcial = [];
        let resultadoTotal = [];
        let offset = 0;
        while (true) {
            resultadoParcial = await this.getParticipantsByLastNameLetter(someWord, page, offset);
            if (resultadoParcial.length > 0) {
                resultadoTotal = resultadoTotal.concat(resultadoParcial);
                offset += resultadoParcial.length;
            } else {
                break;
            }
        }
        return resultadoTotal;
    }
    static async test() {
        console.log("Test started");
        const client = new PoliciaVrMySql();
        await client.connect();
        const response = await client.getAllParticipantsByLastNameLetter('le', 1);
        console.log(JSON.stringify(response, null, 4));
        await client.disconnect();
        console.log("Test finished");
    }
    static async test2() {
        console.log("Test started");
        const client = new PoliciaVrMySql();
        await client.connect();
        try {
            await client.createScore("CC1010166710", 2);
            await client.updateScore(2, "puntaje_segundos", 100);
        } catch (err) {
            console.log(err);
        }
        await client.disconnect();
        console.log("Test finished");
    }
}

// PoliciaVrMySql.test();
// PoliciaVrMySql.test2();
