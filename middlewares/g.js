const sha1 = require('sha1');
const Wechat = require('./wechat');
const getRawBody = require('raw-body');
const utils = require('./../utils/utils');


module.exports = function(opts, handler) {
  let wechat = new Wechat(opts);
  return async ctx => {
  	let query = ctx.query;
  	let token = opts.token;
  	let signature = query.signature;
  	let echostr = query.echostr;
  	let timestamp = query.timestamp;
  	let nonce = query.nonce;

  	let str = [token, timestamp, nonce].sort().join("");
  	let shaStr = sha1(str);
    if (ctx.method === 'GET') {
      if (shaStr === signature) {
        ctx.body = echostr;
      } else {
        ctx.body = 'false';
      }
    } else if (ctx.method === 'POST') {
      if (shaStr !== signature) {
        ctx.body = 'false';
        return false;
      }

      let data = await getRawBody(ctx.req, {
        length: ctx.length,
        limit: '1mb',
        encoding: ctx.charset
      });

      let content = await utils.parseXMLAsync(data);
      let message = utils.formatMessage(content.xml);
      console.log("get message:" + JSON.stringify(message));
      await handler(ctx, message);
      wechat.reply(ctx, message);
    }
  }
};
