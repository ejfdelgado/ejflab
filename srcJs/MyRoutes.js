
class MyRoutes {
    static splitPageData(path) {
        const partes = /(\/[^/]+)(\/[^/]+|\/)?/ig.exec(path);
        if (partes == null) {
            return {
                pageId: null,
                pageType: null,
            };
        }
        let pageId = null;
        if (typeof partes[2] == "string") {
            pageId = (partes[2].replace("/", ""));
        }
        return {
            pageId,
            pageType: partes[1],
        };
    }
}

module.exports = {
    MyRoutes
};