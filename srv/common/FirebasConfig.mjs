import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { MyError } from '../MyError.mjs';
import { Usuario } from './Usuario.mjs';

function getFirebaseConfig() {
    return {
        apiKey: 'AIzaSyCApCHEeXtyMp-Ud3j4qkUaup1kwfH_wJE',
        authDomain: 'ejfexperiments.firebaseapp.com',
        projectId: 'ejfexperiments',
        storageBucket: 'ejfexperiments.appspot.com',
        messagingSenderId: '1066977671859',
        appId: '1:1066977671859:web:6d688407ab6cf306094ec6',
        measurementId: 'G-5LTBBBHRX3',
    };
}

const firebaseApp = initializeApp(getFirebaseConfig());

function getOAuthToken(req) {
    if ('authentication' in req.headers) {
        return req.headers.authentication.replace(/bearer\s*/ig, '');
    }
    if ('rawHeaders' in req) {
        const lista = req.rawHeaders;
        const tamanio = lista.length / 2;
        for (let i = 0; i < tamanio; i++) {
            const key = lista[i * 2];
            const value = lista[i * 2 + 1];
            //'authorization' es interno!
            if (['x-forwarded-authorization'].indexOf(key.toLowerCase()) >= 0) {
                return value.replace(/bearer\s*/ig, '');
            }
        }
    }
    if ('authorization' in req.headers) {
        return req.headers.authorization.replace(/bearer\s*/ig, '');
    }
    if ('Authorization' in req.headers) {
        return req.headers.Authorization.replace(/bearer\s*/ig, '');
    }
    return null;
}

async function checkAutenticated(req) {
    const sessionToken = getOAuthToken(req);
    return new Promise((resolve, reject) => {
        if (!sessionToken) {
            reject(new MyError("Missing Authorization header.", 403));
            return;
        }
        getAuth()
            .verifyIdToken(sessionToken)
            .then((decodedToken) => {
                resolve(decodedToken);
            })
            .catch((error) => {
                reject(new MyError(error.message, 403));
            });
    });
}

async function disableUser(uid) {
    return new Promise((resolve, reject) => {
        getAuth()
            .updateUser(uid, { disabled: true, })
            .then(() => {
                resolve();
            })
            .catch((error) => {
                reject(new MyError(error.message, 403));
            });
    });
}

async function checkAuthenticated(req, res, next) {
    try {
        res.locals.token = await checkAutenticated(req);
        res.locals.user = new Usuario(res.locals.token);
        await next();
    } catch (err) {
        res.status(428).send({ message: err.message });
    }
}

async function checkAuthenticatedSilent(req, res, next) {
    try {
        res.locals.token = await checkAutenticated(req);
        res.locals.user = new Usuario(res.locals.token);
        await next();
    } catch (err) {
        res.locals.token = null;
        res.locals.user = null;
        await next();
    }
}

async function isAdmin(req, res, next) {
    const fixedAdmins = [
        "edgar.jose.fernando.delgado@gmail.com",
        "info@pais.tv",
    ];
    try {
        const token = res.locals.token;
        const estaEnListaAdmins = (fixedAdmins.indexOf(token.email) >= 0);
        const esDominioPanal = token.email.endsWith("@pais.tv");
        if (!(esDominioPanal || estaEnListaAdmins)) {
            res.status(403).send({ message: `Acción no permitida para ${token.email}` });
        } else {
            await next();
        }

    } catch (err) {
        res.status(428).send({ message: err.message });
    }
}

async function checkVerified(req, res, next) {
    try {
        const token = res.locals.token;
        if (token.email_verified == false) {
            res.status(424).send({ message: "Para continuar primero debes verificar tu correo" });
        } else {
            await next();
        }

    } catch (err) {
        res.status(428).send({ message: err.message });
    }
}

export {
    getFirebaseConfig,
    getOAuthToken,
    checkAutenticated,
    checkAuthenticated,
    checkAuthenticatedSilent,
    checkVerified,
    isAdmin,
    disableUser,
}