"use strict";

import express from "express";
import { PageSrv } from "./srv/PageSrv.mjs";
import { cors, commonHeaders, handleErrorsDecorator, handleErrors } from "./srv/Network.mjs";
import { MainHandler } from "./srv/MainHandler.mjs";
import { checkAuthenticated, checkAuthenticatedSilent } from "./srv/common/FirebasConfig.mjs";
import { MyFileService } from "./srv/MyFileService.mjs";

const app = express();

app.use(cors);
app.get('/srv/pg', [commonHeaders, checkAuthenticatedSilent, express.json(), handleErrorsDecorator(PageSrv.getCurrentPage)]);
app.post('/srv/pg', [commonHeaders, checkAuthenticated, express.json(), handleErrorsDecorator(MyFileService.uploadFile), handleErrorsDecorator(PageSrv.savePage)]);
app.use('/assets', express.static('src/assets'));
app.use(MainHandler.addGetUrl);
app.use("/", handleErrorsDecorator(MainHandler.handle));

app.use(handleErrors);

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
    console.log(
        `App listening on http://127.0.0.1:${PORT} Press Ctrl+C to quit.`
    );
});

export default app;
