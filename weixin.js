'use strict';
const config = require('./config/config');
const Wechat = require('./middlewares/wechat');
const wechat = new Wechat(config);


let weixin = {};

exports = module.exports = weixin;

weixin.reply = async function (ctx, message) {
  if (message.MsgType === 'event') {
    if (message.Event === 'subscribe') {
      if (message.EventKey) {
        console.log("通过扫描二维码关注，二维码：" + message.EventKey + ' ' + message.Ticket);
      }
      ctx.body = '你订阅了这个sb公众号，\r\n 消息id：' + message.MsgId;
    } else if (message.Event === 'unsubscribe') {
      ctx.body = "";
      console.log('无情取关');
    } else if (message.Event === 'LOCATION') {
      ctx.body = `上报位置是:纬度:${message.Latitude},经度:${message.Longitude},精度:${message.Precision}`;
    } else if (message.Event === 'CLICK') {
      ctx.body = '点击了菜单:' + message.EventKey;
    } else if (message.Event === 'SCAN') {
      console.log('关注后扫二维码' + message.EventKey + ' ' + message.Ticket);
      ctx.body = "你扫描了二维码";
    } else if (message.Event === 'VIEW') {
      ctx.body = '你点击了菜单中的链接:' + message.EventKey;
    }
  } else if (message.MsgType === 'text'){
      let content = message.Content;
      let reply = '你说的 ' + content + ' 太复杂了';

      if (content === '1') {
        reply = '1111111111';
      } else if (content === '2') {
        reply = '2222222222';
      } else if (content === '3') {
        reply = '3333333333';
      } else if (content === '4') {
        reply = [{
          title: '6666',
          description: 'miaoshu1',
          picUrl: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1493235146842&di=7a552f566d3255666a00e0d382f07836&imgtype=0&src=http%3A%2F%2Fimg27.51tietu.net%2Fpic%2F2017-011500%2F20170115001256mo4qcbhixee164299.jpg',
          url: 'www.baidu.com'
        }]
      } else if (content === '图片') {
        let data = await wechat.uploadMaterial('image', __dirname + '/2.jpg');
        if (data.errcode) {
          reply = data.errcode + ' ' + data.errmsg;
        } else {
          reply = {
            type: 'image',
            mediaId: data.media_id
          }
        }
      } else if (content === '视频') {
        let data = await wechat.uploadMaterial('video', __dirname + '/3.mp4');
        if (data.errcode) {
          reply = data.errcode + ' ' + data.errmsg;
        } else {
          reply = {
            type: 'video',
            title: '小视频',
            description: '妈个鸡',
            mediaId: data.media_id
          }
        }
      } else if (content === '音乐') {
        let data = await wechat.uploadMaterial('image', __dirname + '/2.jpg');
        if (data.errcode) {
          reply = data.errcode + ' ' + data.errmsg;
        } else {
          reply = {
            type: 'music',
            title: '音乐',
            description: '小音乐',
            musicUrl: __dirname + '/4.mp3',
            thumbMediaId: data.media_id
          }
        }
      }

      ctx.body = reply;
  }
}
