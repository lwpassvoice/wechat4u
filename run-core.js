'use strict'
require('babel-register')
const Wechat = require('./src/wechat.js')
const qrcode = require('qrcode-terminal')
const fs = require('fs')
const request = require('request')

const bindUserUrl = "http://192.168.1.103:8080/"
const uploadService = require('./src/5i/upload.js')
const authService = require('./src/5i/auth.js')

const axios = require('axios')
const FormData = require('form-data')

const LRU = require("lru-cache")
let LRUOptions = {
  // max: 1000, // 最大cache
  maxAge: 30 * 24 * 60 * 60 * 1000,
},
cache = LRU(LRUOptions);

let bot
/**
 * 尝试获取本地登录数据，免扫码
 * 这里演示从本地文件中获取数据
 */
try {
  bot = new Wechat(require('./sync-data.json'))
} catch (e) {
  bot = new Wechat()
}
/**
 * 启动机器人
 */
if (bot.PROP.uin) {
  // 存在登录数据时，可以随时调用restart进行重启
  bot.restart()
} else {
  bot.start()
}
/**
 * uuid事件，参数为uuid，根据uuid生成二维码
 */
bot.on('uuid', uuid => {
  qrcode.generate('https://login.weixin.qq.com/l/' + uuid, {
    small: true
  })
  console.log('二维码链接：', 'https://login.weixin.qq.com/qrcode/' + uuid)
})
/**
 * 登录用户头像事件，手机扫描后可以得到登录用户头像的Data URL
 */
bot.on('user-avatar', avatar => {
  console.log('登录用户头像Data URL：', avatar)
})
/**
 * 登录成功事件
 */
bot.on('login', () => {
  console.log('登录成功')
  // 保存数据，将数据序列化之后保存到任意位置
  fs.writeFileSync('./sync-data.json', JSON.stringify(bot.botData))
})
/**
 * 登出成功事件
 */
bot.on('logout', () => {
  console.log('登出成功')
  // 清除数据
  fs.unlinkSync('./sync-data.json')
})
/**
 * 联系人更新事件，参数为被更新的联系人列表
 */
bot.on('contacts-updated', contacts => {
  console.log(contacts)
  console.log('联系人数量：', Object.keys(bot.contacts).length)
})
/**
 * 错误事件，参数一般为Error对象
 */
bot.on('error', err => {
  console.error('错误：', err)
})
/**
 * 如何发送消息
 */
bot.on('login', () => {
  /**
   * 演示发送消息到文件传输助手
   * 通常回复消息时可以用 msg.FromUserName
   */
  let ToUserName = 'filehelper'

  /**
   * 发送文本消息，可以包含emoji(😒)和QQ表情([坏笑])
   */
  bot.sendMsg('发送文本消息，可以包含emoji(😒)和QQ表情([坏笑])', ToUserName)
    .catch(err => {
      bot.emit('error', err)
    })

  /**
   * 通过表情MD5发送表情
   */
  bot.sendMsg({
    emoticonMd5: '00c801cdf69127550d93ca52c3f853ff'
  }, ToUserName)
    .catch(err => {
      bot.emit('error', err)
    })

  /**
   * 以下通过上传文件发送图片，视频，附件等
   * 通用方法为入下
   * file为多种类型
   * filename必填，主要为了判断文件类型
   */
  // bot.sendMsg({
  //   file: Stream || Buffer || ArrayBuffer || File || Blob,
  //   filename: 'bot-qrcode.jpg'
  // }, ToUserName)
  //   .catch(err => {
  //     bot.emit('error',err)
  //   })

  /**
   * 发送图片
   */
  bot.sendMsg({
    file: request('https://raw.githubusercontent.com/nodeWechat/wechat4u/master/bot-qrcode.jpg'),
    filename: 'bot-qrcode.jpg'
  }, ToUserName)
    .catch(err => {
      bot.emit('error', err)
    })

  /**
   * 发送表情
   */
  bot.sendMsg({
    file: fs.createReadStream('./media/test.gif'),
    filename: 'test.gif'
  }, ToUserName)
    .catch(err => {
      bot.emit('error', err)
    })

  /**
   * 发送视频
   */
  bot.sendMsg({
    file: fs.createReadStream('./media/test.mp4'),
    filename: 'test.mp4'
  }, ToUserName)
    .catch(err => {
      bot.emit('error', err)
    })

  /**
   * 发送文件
   */
  bot.sendMsg({
    file: fs.createReadStream('./media/test.txt'),
    filename: 'test.txt'
  }, ToUserName)
    .catch(err => {
      bot.emit('error', err)
    })

  /**
   * 发送撤回消息请求
   */
  bot.sendMsg('测试撤回', ToUserName)
     .then(res => {
       // 需要取得待撤回消息的MsgID
       return bot.revokeMsg(res.MsgID, ToUserName)
     })
     .catch(err => {
       console.log(err)
     })
})
/**
 * 如何处理会话消息
 */
bot.on('message', msg => {
  let fromUserInfo = {
    userName: msg.FromUserName
  }

  global.userName = msg.FromUserName
/* 
  if(!cache.get(msg.FromUserName).sessionKey){
    authService.getSessionKey({
      wxTypeId: 1,
      userName: msg.RecommendInfo.UserName
    })
  } */

  /**
   * 获取消息时间
   */
  console.log(`----------${msg.getDisplayTime()}----------`)
  /**
   * 获取消息发送者的显示名
   */
  console.log(bot.contacts[msg.FromUserName].getDisplayName())
  /**
   * 判断消息类型
   */
  console.log('msg --- ', msg);
  switch (msg.MsgType) {
    case bot.CONF.MSGTYPE_TEXT:
      /**
       * 文本消息
       */
      console.log(msg.Content)
      break
    case bot.CONF.MSGTYPE_APP:
      console.log(msg.MsgType, msg.FileName)

      uploadService.postUserInsert({
        Type: 0,
        Url: msg.Url,
        Text: msg.Content,
        Title: msg.FileName,
        FileName: msg.FileName
      })
      break
    case bot.CONF.MSGTYPE_IMAGE:
      /**
       * 图片消息
       */
      console.log('图片消息，保存到本地')
      bot.getMsgImg(msg.MsgId).then(res => {
        fs.writeFileSync(`./media/${msg.MsgId}.jpg`, res.data);
        // console.log(res.data);
        // let data = {

        // };

        // let blob = new Blob(res.data);
        uploadService.getFolder().then(res => {
          console.log('文件夹数据', res);
          let data = res.data;
          let treeId = data.TreeId,
              folderId = data.FolderId;

          uploadService.postUploadFile({
            opt: {
              userId: '', //msg.FromUserName,
              treeId: treeId,
              folderId: folderId,
              fileName: `${msg.MsgId}.jpg`,
              chunkSize: 5242880,
              etag: new Date().getTime()
            },
            data: res.data
          }).catch(err => {console.log('err ', err)})
        })

      }).catch(err => {
        bot.emit('error', err)
      })
      
      break
    case bot.CONF.MSGTYPE_VOICE:
      /**
       * 语音消息
       */
      console.log('语音消息，保存到本地')
      bot.getVoice(msg.MsgId).then(res => {
        fs.writeFileSync(`./media/${msg.MsgId}.mp3`, res.data)
      }).catch(err => {
        bot.emit('error', err)
      })
      break
    case bot.CONF.MSGTYPE_EMOTICON:
      /**
       * 表情消息
       */
      console.log('表情消息，保存到本地')
      bot.getMsgImg(msg.MsgId).then(res => {
        fs.writeFileSync(`./media/${msg.MsgId}.gif`, res.data)
      }).catch(err => {
        bot.emit('error', err)
      })
      break
    case bot.CONF.MSGTYPE_VIDEO:
    case bot.CONF.MSGTYPE_MICROVIDEO:
      /**
       * 视频消息
       */
      console.log('视频消息，保存到本地')
      bot.getVideo(msg.MsgId).then(res => {
        fs.writeFileSync(`./media/${msg.MsgId}.mp4`, res.data)
      }).catch(err => {
        bot.emit('error', err)
      })
      break
    case bot.CONF.MSGTYPE_APP:
      if (msg.AppMsgType == 6) {
        /**
         * 文件消息
         */
        console.log('文件消息，保存到本地')
        bot.getDoc(msg.FromUserName, msg.MediaId, msg.FileName).then(res => {
          fs.writeFileSync(`./media/${msg.FileName}`, res.data)
          console.log(res.type);
        }).catch(err => {
          bot.emit('error', err)
        })
      }
      break
    default:
      break
  }
})
/**
 * 如何处理红包消息
 */
bot.on('message', msg => {
  if (msg.MsgType == bot.CONF.MSGTYPE_SYS && /红包/.test(msg.Content)) {
    // 若系统消息中带有‘红包’，则认为是红包消息
    // wechat4u并不能自动收红包
  }
})
/**
 * 如何处理转账消息
 */
bot.on('message', msg => {
  if (msg.MsgType == bot.CONF.MSGTYPE_APP && msg.AppMsgType == bot.CONF.APPMSGTYPE_TRANSFERS) {
    // 转账
  }
})
/**
 * 如何处理撤回消息
 */
bot.on('message', msg => {
  if (msg.MsgType == bot.CONF.MSGTYPE_RECALLED) {
    // msg.Content是一个xml，关键信息是MsgId
    let MsgId = msg.Content.match(/<msgid>(.*?)<\/msgid>.*?<replacemsg><!\[CDATA\[(.*?)\]\]><\/replacemsg>/)[0]
    // 得到MsgId后，根据MsgId，从收到过的消息中查找被撤回的消息
  }
})
/**
 * 如何处理好友请求消息
 */
bot.on('message', msg => {
  if (msg.MsgType == bot.CONF.MSGTYPE_VERIFYMSG) {
    bot.verifyUser(msg.RecommendInfo.UserName, msg.RecommendInfo.Ticket)
      .then(res => {
        console.log(`通过了 ${bot.Contact.getDisplayName(msg.RecommendInfo)} 好友请求`);

        //TODO 发送唯一认证链接
        console.log('msg.RecommendInfo.UserName ===== ', msg.RecommendInfo.UserName)
        
        //通过好友后，发送认证链接
        bot.sendMsg(`${bindUserUrl}?uName=${msg.RecommendInfo.UserName}`, msg.RecommendInfo.UserName)
          .catch(err => {
            bot.emit('error', err)
          })

        cache.set(msg.RecommendInfo.UserName, {
          userName: msg.RecommendInfo.UserName,
          sessionKey: authService.getSessionKey({
            wxTypeId: 1,
            userName: msg.RecommendInfo.UserName
          })
        })

        let testUser = cache.get(msg.RecommendInfo.UserName);
        console.log('sessionkey & user', testUser)

      })
      .catch(err => {
        bot.emit('error', err)
      })
  }
})
/**
 * 如何直接转发消息
 */
bot.on('message', msg => {
  // 不是所有消息都可以直接转发
  bot.forwardMsg(msg, 'filehelper')
    .catch(err => {
      bot.emit('error', err)
    })
})
/**
 * 如何获取联系人头像
 */
bot.on('message', msg => {
  bot.getHeadImg(bot.contacts[msg.FromUserName].HeadImgUrl).then(res => {
    fs.writeFileSync(`./media/${msg.FromUserName}.jpg`, res.data)
  }).catch(err => {
    bot.emit('error', err)
  })
})

//普通请求
function http(options){
  return new Promise((resolve, reject) => {
    request(options).then(res => {
      resolve(res)
    }).catch(err => {
      console.log('request failed: ', err);
      reject(err)
    })
  })
}


//发送文件
function upload(callback) {
  let boundaryKey = '----' + new Date().getTime();    // 用于标识请求数据段
  let options = {
      host: 'localhost', // 远端服务器域名
      port: 80, // 远端服务器端口号
      method: 'POST',
      path: `/upload`, // 上传服务路径
      headers: {
          'Content-Type': 'multipart/form-data; boundary=' + boundaryKey,
          'Connection': 'keep-alive'
      }
  };
  let req = http.request(options).then(res => {
      res.setEncoding('utf8');

      res.on('data', function(chunk) {
          console.log('body: ' + chunk);
      });

      res.on('end', function() {
          console.log('res end.');
      });
  });
  /*req.write(
       '--' + boundaryKey + 'rn' +
       'Content-Disposition: form-data; name="upload"; filename="test.txt"rn' +
       'Content-Type: text/plain'
   );*/
  req.write(
      `--${boundaryKey}rn Content-Disposition: form-data; name="${self.path}"; filename="${self.file}"rn Content-Type: text/plain`
  );

  // 创建一个读取操作的数据流
  let fileStream = fs.createReadStream(this.filePath);
  fileStream.pipe(req, {end: false});
  fileStream.on('end', function() {
      req.end('rn--' + boundaryKey + '--');
      callback && callback(null);
  });
}
