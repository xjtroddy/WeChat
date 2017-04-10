"use strict";
const fs = require('fs');
const Promise = require('bluebird');
const xml2js = require('xml2js');
let utils = {

};

utils.getTimeStamp = ()=>{
  return ~~(new Date().getTime()/1000);
};

utils.readFileAsync = function(fpath, encoding) {
  return new Promise ((resolve, reject) => {
    fs.readFile(fpath, encoding, (err, content) => {
      if (err) reject(err);
      else resolve(content);
    });
  });
};

utils.writeFileAsync = function(fpath, content) {
  return new Promise ((resolve, reject) => {
    fs.writeFile(fpath, content, (err, content) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

utils.parseXMLAsync = function(xml) {
  return new Promise ((resolve, reject) => {
    xml2js.parseString(xml, {trim: true}, (err, content) => {
      if (err) {
        reject(err);
      } else {
        resolve(content);
      }
    });
  });
};

utils.formatMessage = function(result) {
  let message = {};
  if (typeof result === 'object') {
    for (let key in result) {
      let item = result[key];
      if (result.hasOwnProperty(key)) {
        if (!(item instanceof Array) || item.length === 0) {
          continue;
        }
        if (item.length === 1) {
          let val = item[0];

          if (typeof val === 'object') {
            message[key] = this.formatMessage(val);
          } else {
            message[key] = (val || '').trim();
          }
        } else {
          message[key] = [];
          for (let i = 0, len = item.length; i < len; ++i) {
            message[key].push(this.formatMessage(item[i]));
          }
        }
      }
    }
  }

  return message;
}

module.exports = utils;
