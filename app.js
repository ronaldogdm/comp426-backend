import express from "express";
import path from "path";
import fs from "fs";
import cookieParser from "cookie-parser";
import logger from "morgan";
import debug from 'debug';
import Store from 'data-store';

export const store = new Store({path: './data/example.json'});

const debugAutoWire = debug('auto-wire');
const debugAutoWireWarning = debug('auto-wire-warning');

const app = express();

// Will throw a depreciated warning. Ignore.
app.use(logger('dev'));

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());

// auto-wire routes. Must export default router, and a prefix.
fs.readdir('./routes', (err, files) => {
    files.forEach(file => {
        const router = require(path.join(__dirname, './routes', file));

        if (!router.default) {
            debugAutoWireWarning(`'${file}' did not have a default export. Skipped`);
            return;
        }
        if (!router.prefix) {
            debugAutoWireWarning(`'${file}' did not export a 'prefix' path. Defaulting to '/'`);
        }

        app.use(router.prefix || '/', router.default);
        debugAutoWire(`registered '${file}' to route '${router.prefix || '/'}'`);
    });
});

export default app;