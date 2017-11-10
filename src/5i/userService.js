const fs = require('fs');

const express = require('express');
const app = express();

const bodyParser = require("body-parser");

const bot = require('../../run-core.js')
const redisClient = require('./redisCommand.js')

//默认情况下Express并不知道该如何处理该请求体，因此我们需要增加bodyParser中间件，用于分析  
//application/x-www-form-urlencoded和application/json  
//请求体，并把变量存入req.body。我们可以像下面的样子来“使用”中间件[这个保证POST能取到请求参数的值]：     
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extend: false }));

//允许跨域
app.all("*", function(req, res, next){
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  //让options请求快速返回
  if(req.method === "OPTIONS") res.sendStatus(200);
  else  next();
})

app.post('/fileUrl/send', function (req, resp) {
  console.log(req.body);
  let body = req.body;

  redisClient.redis_hmget('remarkToUser', `${body.userName}`)
  .then(res => {
    if(res[0]){
      bot.sendMsg('qwer', res[0])
      resp.send({
        Status: 1,
        Msg: 'message sended'
      })
    }else{
      resp.send({
        Status: -1,
        Msg: "the user doesn't exist"
      })
    }
  })
  .catch(err => {
    resp.send({
      Status: 0,
      Msg: err
    })
  })
})

export let server = app.listen(8080, function(){
  let host = server.address().address;
  let port = server.address().port;

  console.log('Listening at http://%s:%s', host, port)
})


