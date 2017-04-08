"use strict";
const fs = require('fs');
const Promise = require('bluebird');
let utils = {

};

utils.getTimeStamp = ()=>{
  return ~~(new Date().getTime()/1000);
};

utils.readFileAsync = (fpath, encoding) => {
  return new Promise ((resolve, reject) => {
    fs.readFile(fpath, encoding, (err, content) => {
      if (err) reject(err);
      else resolve(content);
    });
  });
};

utils.writeFileAsync = (fpath, content) => {
  return new Promise ((resolve, reject) => {
    fs.writeFile(fpath, content, (err, content) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

module.exports = utils;
