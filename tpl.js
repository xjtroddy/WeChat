"use strict";
const utils = require('./utils/utils');

let tpl = {};

tpl.complie = function(info){
  let toUserName = info.toUserName;
  let fromUserName = info.fromUserName;
  let createTime = info.createTime;
  let msgType = info.msgType;
  let content = info.content;
  let xml = `<xml>
    <ToUserName><![CDATA[${toUserName}]]></ToUserName>
    <FromUserName><![CDATA[${fromUserName}]]></FromUserName>
    <CreateTime>${createTime}</CreateTime>`;

  if (msgType === "text") {
    xml += `<MsgType><![CDATA[text]]></MsgType>
            <Content><![CDATA[${content}]]></Content>
            </xml>`;
  } else if (msgType === "image") {
    xml += `<MsgType><![CDATA[image]]></MsgType>
            <Image>
            <MediaId><![CDATA[${content.media_id}]]></MediaId>
            </Image>`;
  } else if (msgType === "voice") {
    xml += `<MsgType><![CDATA[voice]]></MsgType>
            <Voice>
            <MediaId><![CDATA[${content.media_id}]]></MediaId>
            </Voice>`;
  } else if (msgType === "video") {
    xml += `<MsgType><![CDATA[video]]></MsgType>
            <Video>
            <MediaId><![CDATA[${content.media_id}]]></MediaId>
            <Title><![CDATA[${content.title}]]></Title>
            <Description><![CDATA[${content.description}]]></Description>
            </Video> `;
  } else if (msgType === "music") {
    xml += `<MsgType><![CDATA[music]]></MsgType>
            <Music>
            <Title><![CDATA[${content.title}]]></Title>
            <Description><![CDATA[${content.description}]]></Description>
            <MusicUrl><![CDATA[${content.music_url}]]></MusicUrl>
            <HQMusicUrl><![CDATA[${content.hq_music_url}]]></HQMusicUrl>
            <ThumbMediaId><![CDATA[${content.media_id}]]></ThumbMediaId>
            </Music>`;
  } else if (msgType === "news") {
    xml += `<MsgType><![CDATA[news]]></MsgType>
            <ArticleCount>${content.length}</ArticleCount>
            <Articles>`;
    content.forEach((item) => {
      xml += `<item>
              <Title><![CDATA[${item.title}]]></Title>
              <Description><![CDATA[${item.description}]]></Description>
              <PicUrl><![CDATA[${item.picUrl}]]></PicUrl>
              <Url><![CDATA[${item.url}]]></Url>
              </item>`;
    });
    xml += "</Articles>";
  } else {
    console.error("msgType error:" + msgType);
  }
  xml += "</xml>";

  return xml;
};

exports = module.exports = tpl;
