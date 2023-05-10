"use strict";

import express from "express";
import { PageSrv } from "./srv/PageSrv.mjs";
import { cors, commonHeaders, handleErrorsDecorator, handleErrors } from "./srv/Network.mjs";
import { MainHandler } from "./srv/MainHandler.mjs";
import { checkAuthenticated, checkAuthenticatedSilent } from "./srv/common/FirebasConfig.mjs";
import { MyFileService } from "./srv/MyFileService.mjs";
import * as http from 'http'
import { Server } from "socket.io";
import { MySocketStream } from "./srv/MySocketStream.mjs";
import { TupleSrv } from "./srv/TupleSrv.mjs";
import { AuthorizationSrv } from "./srv/AuthorizationSrv.mjs";
import { UtilesSrv } from "./srv/UtilesSrv.mjs";
import { KeysSrv } from "./srv/KeysSrv.mjs";
import { Usuario } from "./srv/common/Usuario.mjs";
import { SecretsSrv } from "./srv/SecretsSrv.mjs";
import { PayUSrv } from "./srv/PayUSrv.mjs";
import { MyPdf } from "./srv/MyPdf.mjs";

import { MyShell } from "./srv/MyShell.mjs";

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:4200",
        methods: ["GET", "POST", "DELETE"],
    }
});

app.use(cors);
app.use(MainHandler.addGetUrl);
app.use('/assets', express.static('src/assets'));

// Services
app.get('/srv/pdf/render', [commonHeaders, checkAuthenticatedSilent, handleErrorsDecorator(MyPdf.render)]);
app.get('/srv/shell', [commonHeaders, checkAuthenticatedSilent, handleErrorsDecorator(MyShell.run)]);

app.get('/srv/payu/ping', [commonHeaders, checkAuthenticatedSilent, handleErrorsDecorator(PayUSrv.ping)]);
app.get('/srv/payu/paymentmethods', [commonHeaders, checkAuthenticatedSilent, handleErrorsDecorator(PayUSrv.paymentmethods)]);
app.get('/srv/payu/psebanks', [commonHeaders, checkAuthenticatedSilent, handleErrorsDecorator(PayUSrv.psebanks)]);

app.post('/srv/sec/r', [commonHeaders, checkAuthenticated, express.json(), handleErrorsDecorator(SecretsSrv.read)]);
app.post('/srv/sec/w', [commonHeaders, checkAuthenticated, express.json(), handleErrorsDecorator(SecretsSrv.save)]);
app.post('/srv/sec/pub', [commonHeaders, checkAuthenticated, express.json(), handleErrorsDecorator(SecretsSrv.getPubKey)]);

app.get('/srv/usr/me', [commonHeaders, checkAuthenticated, handleErrorsDecorator(Usuario.getCurrentUser)]);
app.post('/srv/usr/me', [commonHeaders, checkAuthenticated, express.json(), handleErrorsDecorator(MyFileService.uploadFile), handleErrorsDecorator(Usuario.saveMyUser)]);
app.get('/srv/date', [commonHeaders, handleErrorsDecorator(UtilesSrv.fecha)]);
app.get('/srv/pg/:pageType/:idUser/:pageId/*', [commonHeaders, checkAuthenticatedSilent, AuthorizationSrv.hasPagePermisions([["fil_r"]]), handleErrorsDecorator(MyFileService.readFile)]);
app.delete('/srv/pg/:pageType/:idUser/:pageId/*', [commonHeaders, checkAuthenticatedSilent, AuthorizationSrv.hasPagePermisions([["fil_w"]]), handleErrorsDecorator(MyFileService.deleteFile)]);
app.get('/srv/pg', [commonHeaders, checkAuthenticatedSilent, express.json(), handleErrorsDecorator(PageSrv.getCurrentPage)]);
app.post('/srv/pg/new', [commonHeaders, checkAuthenticatedSilent, express.json(), handleErrorsDecorator(PageSrv.createNewPage)]);
app.get('/srv/pg/mines', [commonHeaders, checkAuthenticated, express.json(), handleErrorsDecorator(PageSrv.iterateMyPages)]);
app.get('/srv/pg/all', [commonHeaders, checkAuthenticatedSilent, express.json(), handleErrorsDecorator(PageSrv.iterateAllPages)]);
app.get('/srv/:pageId/keys', [commonHeaders, checkAuthenticatedSilent, AuthorizationSrv.hasPagePermisions([["tup_r"]]), handleErrorsDecorator(KeysSrv.getPageKeys)]);
app.post('/srv/:pageId/pg', [commonHeaders, checkAuthenticatedSilent, AuthorizationSrv.hasPagePermisions([["pg_w"]]), express.json(), handleErrorsDecorator(MyFileService.uploadFile), handleErrorsDecorator(PageSrv.savePage)]);
app.delete('/srv/:pageId/pg', [commonHeaders, checkAuthenticatedSilent, AuthorizationSrv.hasPagePermisions([["pg_w"]]), express.json(), handleErrorsDecorator(PageSrv.deletePage)]);
app.get('/srv/:pageId/tup', [commonHeaders, checkAuthenticatedSilent, AuthorizationSrv.hasPagePermisions([["tup_r"]]), handleErrorsDecorator(TupleSrv.read)]);
app.post('/srv/:pageId/tup', [commonHeaders, checkAuthenticatedSilent, AuthorizationSrv.hasPagePermisions([["tup_w"]]), express.json(), handleErrorsDecorator(TupleSrv.save)]);
app.get('/srv/:pageId/auth', [commonHeaders, checkAuthenticatedSilent, AuthorizationSrv.hasPagePermisions([["per_r"]]), handleErrorsDecorator(AuthorizationSrv.readAll)]);
app.post('/srv/:pageId/auth', [commonHeaders, checkAuthenticatedSilent, AuthorizationSrv.hasPagePermisions([["per_w"]]), express.json(), handleErrorsDecorator(AuthorizationSrv.save)]);
app.post('/srv/:pageId/file', [commonHeaders, checkAuthenticatedSilent, AuthorizationSrv.hasPagePermisions([["fil_w"]]), express.json(), handleErrorsDecorator(MyFileService.uploadFile), MyFileService.uploadFileResponse]);
app.post('/srv/:pageId/makegif', [commonHeaders, checkAuthenticatedSilent, AuthorizationSrv.hasPagePermisions([["fil_w"]]), express.json(), handleErrorsDecorator(MyFileService.uploadFile), handleErrorsDecorator(MyFileService.makegif)]);
app.use("/", handleErrorsDecorator(MainHandler.handle));// Esto solo funciona sin el npm run angular
io.on('connection', MySocketStream.handle(io));

// fuser 8081/tcp
// fuser -k 8081/tcp
const PORT = process.env.PORT || 8081;
httpServer.listen(PORT, () => {
    console.log(
        `App listening on http://localhost:${PORT} Press Ctrl+C to quit.`
    );
});

export default app;
