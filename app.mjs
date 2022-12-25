"use strict";

import express from "express";

const app = express();

app.use('/', express.static('dist/bundle'));

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
