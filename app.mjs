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

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:4200",
        methods: ["GET", "POST"],
    }
});

app.use(cors);
app.use(MainHandler.addGetUrl);
app.use('/assets', express.static('src/assets'));

// Services
app.get('/srv/date', [commonHeaders, handleErrorsDecorator(UtilesSrv.fecha)]);
app.get('/srv/:pageId/keys', [commonHeaders, checkAuthenticatedSilent, handleErrorsDecorator(KeysSrv.getPageKeys)]);
app.get('/srv/pg', [commonHeaders, checkAuthenticatedSilent, express.json(), handleErrorsDecorator(PageSrv.getCurrentPage)]);
app.post('/srv/pg/new', [commonHeaders, checkAuthenticatedSilent, express.json(), handleErrorsDecorator(PageSrv.createNewPage)]);
app.get('/srv/pg/mines', [commonHeaders, checkAuthenticated, express.json(), handleErrorsDecorator(PageSrv.iterateMyPages)]);
app.get('/srv/pg/all', [commonHeaders, checkAuthenticatedSilent, express.json(), handleErrorsDecorator(PageSrv.iterateAllPages)]);
app.post('/srv/:pageId/pg', [commonHeaders, checkAuthenticatedSilent, express.json(), handleErrorsDecorator(MyFileService.uploadFile), handleErrorsDecorator(PageSrv.savePage)]);
app.get('/srv/:pageId/tup', [commonHeaders, checkAuthenticatedSilent, handleErrorsDecorator(TupleSrv.read)]);
app.post('/srv/:pageId/tup', [commonHeaders, checkAuthenticatedSilent, express.json(), handleErrorsDecorator(TupleSrv.save)]);
app.get('/srv/:pageId/auth', [commonHeaders, checkAuthenticatedSilent, handleErrorsDecorator(AuthorizationSrv.readAll)]);
app.post('/srv/:pageId/auth', [commonHeaders, checkAuthenticatedSilent, express.json(), handleErrorsDecorator(AuthorizationSrv.save)]);
app.use("/", handleErrorsDecorator(MainHandler.handle));
io.on('connection', MySocketStream.handle(io));

const PORT = process.env.PORT || 8081;
httpServer.listen(PORT, () => {
    console.log(
        `App listening on http://127.0.0.1:${PORT} Press Ctrl+C to quit.`
    );
});

export default app;
