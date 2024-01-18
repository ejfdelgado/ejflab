class MyConstants {
    static SRV_ROOT = "/";
    static SPEECH_TO_TEXT_SERVER = `wss://${location.hostname}/ws`;
    static CLOUD_RUN_URL = "https://mainapp-7b6hvjg6ia-uc.a.run.app/";
    static DOMAIN_ROUTER = {
        "srv/opencv/solvepnp": MyConstants.CLOUD_RUN_URL
    };
    static ANONYMOUS_PATHS = ['/uechat'];
    static BUCKET = {
        URL_BASE: "https://storage.googleapis.com",
        PUBLIC: `labs-pro-public`,
        PRIVATE: `labs-pro-private`,
        MAX_MB: 50,
    }
    static USER = {
        DEFAULT_IMAGE: '/assets/img/defavatar.jpg',
        DEFAULT_FOLDER: "profile",
        DEFAULT_FILE: "/me.jpg",
    };
    static PAGE = {
        DEFAULT_IMAGE: '/assets/img/defaultPage.jpg',
        NO_IMAGE: '/assets/img/noimage.jpg',
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
    static resolveDomain(path) {
        if (/https?:\/\//.test(path)) {
            return '';
        }
        if (location.hostname == "localhost") {
            return MyConstants.SRV_ROOT;
        }
        let domain = MyConstants.DOMAIN_ROUTER[path];
        if (!domain) {
            return MyConstants.SRV_ROOT;
        } else {
            return domain;
        }
    }
    //MyConstants.getPublicUrl()
    static getPublicUrl(keyName, addRandom = true) {
        keyName = keyName.replace(/\?.*$/, "");
        if (addRandom) {
            const time = new Date().getTime();
            return `${MyConstants.BUCKET.URL_BASE}/${MyConstants.BUCKET.PUBLIC}/${keyName}?t=${time}`;
        } else {
            return `${MyConstants.BUCKET.URL_BASE}/${MyConstants.BUCKET.PUBLIC}/${keyName}`;
        }
    }
}

try {
    if (location.hostname == "localhost") {
        MyConstants.SRV_ROOT = "http://localhost:8081/";
        MyConstants.SPEECH_TO_TEXT_SERVER = "ws://localhost:2700";
    }
} catch (err) {

}

module.exports = {
    MyConstants
};