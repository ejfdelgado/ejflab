class MyConstants {
    static SRV_ROOT = "http://localhost:8081/";
    //static SRV_ROOT = "/";
    static BUCKET = {
        URL_BASE: "https://storage.googleapis.com",
        PUBLIC: `labs-pro-public`,
        PRIVATE: `labs-pro-private`,
        MAX_MB: 5,
    }
    static PAGE = {
        DEFAULT_IMAGE: '/assets/img/defaultPage.jpg',
        defaults: {
            cv: {
                publicRole: "reader",
                image: '/assets/img/defaultPage.jpg',
            }
        }
    };
    static AUTH_READ = ["fil_r", "pg_r", "tup_r"];
    static AUTH_WRITE = ["fil_w", "tup_w"];
    static AUTH_OWNER = ["per_r", "per_w", "pg_w"];
    static ROLES = [
        { id: "none", txt: "Ninguno", auth: [] },
        { id: "reader", txt: "Lector", auth: MyConstants.AUTH_READ },
        { id: "editor", txt: "Editor", auth: MyConstants.AUTH_READ.concat(MyConstants.AUTH_WRITE) },
        { id: "owner", txt: "Dueño", auth: MyConstants.AUTH_READ.concat(MyConstants.AUTH_WRITE).concat(MyConstants.AUTH_OWNER) },
    ];
    
    static getDefaultPageImage(pageType) {
        pageType = pageType.replace(/^\//, '');
        if (pageType in MyConstants.PAGE.defaults) {
            const actual = MyConstants.PAGE.defaults[pageType];
            if (actual.image) {
                return actual.image;
            }
        }
        return MyConstants.PAGE.DEFAULT_IMAGE;
    }
    static getDefaultPublicPageRole(pageType) {
        pageType = pageType.replace(/^\//, '');
        if (pageType in MyConstants.PAGE.defaults) {
            const actual = MyConstants.PAGE.defaults[pageType];
            if (actual.publicRole) {
                return actual.publicRole;
            }
        }
        return "none";
    }
    static getAuthByRole(role) {
        for (let i = 0; i < MyConstants.ROLES.length; i++) {
            const actual = MyConstants.ROLES[i];
            if (role == actual.id) {
                return actual.auth;
            }
        }
        return [];
    }
}

module.exports = {
    MyConstants
};