"use strict";

import express from "express";
import path from 'path';
import cookieParser from "cookie-parser";
import { PageSrv } from "./srv/PageSrv.mjs";
import { cors, commonHeaders, handleErrorsDecorator } from "./srv/Network.mjs";
import { MainHandler } from "./srv/MainHandler.mjs";
import { checkAuthenticatedSilent } from "./srv/common/FirebasConfig.mjs";

const app = express();

app.use(cors);
app.get('/srv/pg', [commonHeaders, checkAuthenticatedSilent, express.json(), handleErrorsDecorator(PageSrv.getCurrentPage)]);
app.use(MainHandler.addGetUrl);
app.use("/", MainHandler.handle);
//app.use('/', express.static('dist/bundle'));

app.use((error, req, res, next) => {
    return res.status(500).json({ error: error.toString() });
});

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
    console.log(
        `App listening on http://127.0.0.1:${PORT} Press Ctrl+C to quit.`
    );
});

export default app;
