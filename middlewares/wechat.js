"use strict";
const utils = require('./../utils/utils');
const Promise = require('bluebird');
const request = Promise.promisify(require('request'));
const sha1 = require('sha1');
const path = require('path');
const wechat_file = path.join(__dirname, './../config/wechat.txt');
const fs = require('fs');


let prefix = 'https://api.weixin.qq.com/cgi-bin/';
let api = {
  accessToken : `${prefix}token?grant_type=client_credential`,
  upload: `${prefix}media/upload?`
};

function Wechat(opts) {
  let self = this;
  this.appId = opts.appId;
  this.appSecret = opts.appSecret;

  this.fetchAccessToken();
  }

Wechat.prototype.getAccessToken = function(){
  return utils.readFileAsync(wechat_file);
};

Wechat.prototype.saveAccessToken = function(data){
  data = JSON.stringify(data);
  return utils.writeFileAsync(wechat_file, data);
};

Wechat.prototype.isValidAccessToken = function(data) {
  if (!data || !data.access_token || !data.expires_in) {
    return false;
  }

  let access_token = data.access_token;
  let expires_in = data.expires_in;
  let now = utils.getTimeStamp();

  return (now < expires_in);
};

Wechat.prototype.updateAccessToken = function() {
  let appId = this.appId;
  let appSecret = this.appSecret;
  let url = api.accessToken + `&appid=${appId}&secret=${appSecret}`;
  return new Promise((resolve, reject) => {
    request({url: url, json: true}).then((response) => {
      let data = response.body;
      let now = utils.getTimeStamp();
      let expires_in = now + data.expires_in - 20;

      data.expires_in = expires_in;

      resolve(data);
    });
  });
};

Wechat.prototype.uploadMaterial = function(type, filepath) {
  console.log("file:"+filepath);
  let self = this;
  let form = {
    media: fs.createReadStream(filepath)
  };
  return new Promise((resolve, reject) => {
    self.fetchAccessToken().then(data => {
      let url = api.upload + `access_token=${data.access_token}&type=${type}`;
      console.log('utl:' + url);
      request({method: 'POST', url: url, formData: form, json:true}).then((response) => {
        let _data = response.body;
        if (_data) {
          resolve(_data);
        } else {
          throw new Error('Upload material failed');
        }
      })
      .catch(function(err) {
        reject(err);
      });
    });
  });
};

Wechat.prototype.fetchAccessToken = function () {
  let self = this;
  if (this.isValidAccessToken(self)) {
    return Promise.resolve(this);
  }
  this.getAccessToken()
    .then(data => {
      try {
        data = JSON.parse(data);
      }
      catch(e) {
        return self.updateAccessToken();
      }
      if (self.isValidAccessToken(data)) {
        return Promise.resolve(data);
      } else {
        return self.updateAccessToken();
      }
    })
    .then(data => {
      self.access_token = data.access_token;
      self.expires_in = data.expires_in;

      self.saveAccessToken(data);
      return Promise.resolve(data);
    });
};

Wechat.prototype.reply = function(ctx, message){
  console.log("ctx:"+ctx);
  console.log("message:"+message.toString());

  let content = ctx.body;
  let xml = utils.tpl(content, message);

  ctx.status = 200;
  ctx.type = 'application/xml';
  ctx.body = xml;
};

module.exports = Wechat;
