"use strict";
require('babel-register');
const Koa = require('koa');
const path = require('path');


const basic = require('./middlewares/basic');
const config = require('./config/config');


const app = new Koa();

app.use(basic(config));

app.listen(1234);

console.log('listen 1234');
