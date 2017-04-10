"use strict";
const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const path = require('path');


const g = require('./middlewares/g');
const config = require('./config/config');


const app = new Koa();

//app.use(bodyParser());
app.use(g(config));

app.listen(1234);

console.log('listen 1234');
