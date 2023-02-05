class MyConstants {
    static SRV_ROOT = "http://localhost:8081/";
    //static SRV_ROOT = "/";
    static BUCKET = {
        URL_BASE: "https://storage.googleapis.com",
        PUBLIC: `labs-pro-public`,
        MAX_MB: 5,
    }

    static PAGE = {
        DEFAULT_IMAGE: '/assets/img/defaultPage.jpg',
    };
    static AUTH_READ = ["fil_r", "pg_r", "tup_r", "pg_r"];
    static AUTH_WRITE = ["fil_w", "pg_w", "tup_w", "pg_w"];
    static AUTH_OWNER = ["per_r", "per_w"];
    static ROLES = [
        { id: "none", txt: "Ninguno", auth: [] },
        { id: "reader", txt: "Lector", auth: MyConstants.AUTH_READ },
        { id: "editor", txt: "Editor", auth: MyConstants.AUTH_READ.concat(MyConstants.AUTH_WRITE) },
        { id: "owner", txt: "Dueño", auth: MyConstants.AUTH_READ.concat(MyConstants.AUTH_WRITE).concat(MyConstants.AUTH_OWNER) },
    ];
}

module.exports = {
    MyConstants
};