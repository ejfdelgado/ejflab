class MyConstants {
    static SRV_ROOT = "http://localhost:8081/";
    //static SRV_ROOT = "/";
    static BUCKET = {
        URL_BASE: "https://storage.googleapis.com",
        PUBLIC: `labs-pro-public`,
        MAX_MB: 5,
    }
}

module.exports = {
    MyConstants
};