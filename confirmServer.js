"use strict";
require('babel-register');
const Koa = require("koa");
const sha1 = require("sha1");
const config = require("./config");
const app = new Koa();

app.use(ctx => {
	let query = this.query;
	let token = config.token;
	let signature = query.signature;
	let echostr = query.echostr;
	let timestamp = query.timestamp;
	
	let str = [token, timestamp, nonce].sort().join("");
	let shaStr = sha1(str);
	
	if (shaStr === signature) {
		ctx.body = echostr;
	} else {
		ctx.body = 'false';
	}
});

app.listen(1234);
