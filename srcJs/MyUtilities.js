class MyUtilities {
    static stringify(circ) {
        const cache = [];
        const text = JSON.stringify(circ, (key, value) => {
            if (typeof value === 'object' && value !== null) {
                if (cache.includes(value)) return;
                cache.push(value);
            }
            return value;
        });
        cache = null;
        return text;
    };
    static htmlEntities(str) {
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }
    static splitPageData(path) {
        const partes = /(\/[^/]+)(\/\d+|\/)?/ig.exec(path);
        let pageId = null;
        if (typeof partes[2] == "string") {
            pageId = parseInt(partes[2].replace("/", ""));
        }
        return {
            pageId,
            pageType: partes[1],
        };
    }
}

module.exports = {
    MyUtilities
};