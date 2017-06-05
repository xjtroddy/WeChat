"use strict";
const _ = require('lodash');
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
  temporary: {
    upload: `${prefix}media/upload?`,
    fetch: `${prefix}media/get?`
  },
  permanent: {
    upload: `${prefix}material/add_material?`,
    uploadNews: `${prefix}material/add_news?`,
    uploadNewsPic: `${prefix}media/uploadimg?`,
    fetch: `${prefix}material/get_material?`,
    del: `${prefix}material/delete_material?`,
    update: `${prefix}material/update_news?`,
    count: `${prefix}material/get_materialcount?`,
    batch: `${prefix}material/batchget_material?`
  }
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

Wechat.prototype.uploadMaterial = function(type, material, permanent) {
  console.log("upload material:"+material);
  let self = this;
  let form = {};
  let uploadUrl = api.temporary.upload;
  if (permanent){
    uploadUrl = api.permanent.upload;
    _.extend(form, permanent);
  }

  if (type === 'pic') {
    uploadUrl = api.permanent.uploadNewsPic;
  } else if (type === 'news') {
    uploadUrl = api.permanent.uploadNews;
    form = material;
  } else {
    form.media = fs.createReadStream(material);
  }
  return new Promise((resolve, reject) => {
    self.fetchAccessToken().then(data => {
      let url = uploadUrl += `access_token=${data.access_token}&type=${type}`;
      if (permanent) {
        form.access_token = data.access_token;
      }

      let options = {
        method: "POST",
        url: url,
        json: true
      }
      if(type === 'news') {
        options.body = form;
      } else {
        options.formData = form;
      }


      console.log('uploadUrl:' + url);
      request(options).then((response) => {
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

Wechat.prototype.fetchMaterial = function(mediaId, type, permanent) {
  console.log("fetch material:"+mediaId);
  let self = this;
  let fetchUrl = api.temporary.fetch;
  if (permanent){
    fetchUrl = api.permanent.fetch;
  }

  return new Promise((resolve, reject) => {
    self.fetchAccessToken().then(data => {
      let url = fetchUrl += `access_token=${data.access_token}`;
      console.log('fetchUrl:' + url);
      let options = {method: 'POST', url: url, json: true};
      let form = {};
      if (permanent) {
        form.media_id = mediaId;
        form.access_token = data.access_token;
        options.body = form;
      } else {
        if (type === 'video') {
          url.replace('https://', 'http://');
        }
        url += `&media_id=${mediaId}`;
      }

      if (type === 'news' || type === 'video') {
        request(options).then((response) => {
          let _data = response.body;
          if (_data) {
            resolve(_data);
          } else {
            throw new Error('Delete material failed');
          }
        })
        .catch(function(err) {
          reject(err);
        });
      } else {
        resolve(url);
      }


    });
  });
};

Wechat.prototype.deleteMaterial = function(mediaId) {
  console.log("delete material:"+mediaId);
  let self = this;
  let form = {
    media_id: mediaId
  };

  return new Promise((resolve, reject) => {
    self.fetchAccessToken().then(data => {
      let url = api.permanent.del += `access_token=${data.access_token}&media_id=${mediaId}`;
      console.log('deleteUrl:' + url);
      request({method: 'POST', url: url, body: form, json: true}).then((response) => {
        let _data = response.body;
        if (_data) {
          resolve(_data);
        } else {
          throw new Error('Delete material failed');
        }
      })
      .catch(function(err) {
        reject(err);
      });
    });
  });
};

Wechat.prototype.updateMaterial = function(mediaId, news) {
  console.log("update material:"+mediaId);
  let self = this;
  let form = {
    media_id: mediaId
  };

  _.extend(form, news);
  return new Promise((resolve, reject) => {
    self.fetchAccessToken().then(data => {
      let url = api.permanent.update += `access_token=${data.access_token}&media_id=${mediaId}`;
      console.log('updateUrl:' + url);
      request({method: 'POST', url: url, body: form, json: true}).then((response) => {
        let _data = response.body;
        if (_data) {
          resolve(_data);
        } else {
          throw new Error('Update material failed');
        }
      })
      .catch(function(err) {
        reject(err);
      });
    });
  });
};

Wechat.prototype.countMaterial = function() {
  console.log("get material count");
  let self = this;
  return new Promise((resolve, reject) => {
    self.fetchAccessToken().then(data => {
      let url = api.permanent.count += `access_token=${data.access_token}`;
      console.log('countUrl:' + url);
      request({method: 'GET', url: url, json: true}).then((response) => {
        let _data = response.body;
        if (_data) {
          resolve(_data);
        } else {
          throw new Error('count material failed');
        }
      })
      .catch(function(err) {
        reject(err);
      });
    });
  });
};

Wechat.prototype.batchMaterial = function(options) {
  console.log("batch material");
  let self = this;

  options.type = options.type || 'image';
  options.offset = options.offset || 0;
  options.count = options.count || 1;

  return new Promise((resolve, reject) => {
    self.fetchAccessToken().then(data => {
      let url = api.permanent.batch + `access_token=${data.access_token}`;
      console.log('batchUrl:' + url);
      request({method: 'POST', url: url, body: options, json: true}).then((response) => {
        let _data = response.body;
        if (_data) {
          resolve(_data);
        } else {
          throw new Error('batch material failed');
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

  let content = ctx.body;
  let xml = utils.tpl(content, message);

  ctx.status = 200;
  ctx.type = 'application/xml';
  ctx.body = xml;
};

module.exports = Wechat;
