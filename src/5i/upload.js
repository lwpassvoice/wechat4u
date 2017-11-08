const axios = require('axios')

const getApi = require('./config').getApi
const api = require('./config').api
const getSessionKey = require('./auth').getSessionKey

const redisClient = require('./redisCommand.js')

const request = axios.create();

let sessionKey = '';

request.interceptors.request.use(
  config => {
    // console.log('config', config)
    // getSessionKey({
    //   wxTypeId: 1,
    //   userName: global.userName
    // }).then(res => {
    //   console.log('ssKey', res, global.userName)
    // })
    // console.log('global.userName config', config, global.userName)
/*     redisClient.redis_hgetall(global.userName)
    .then(res => {
      if(!res['SessionKey']){
        getSessionKey({
          wxTypeId: 1,
          userName: global.userName
        })
        .then(key => {
          console.log('sessionkey', key)
          redisClient.redis_hmset(global.userName, key);
          config.hearders['Authorization'] = `SessionKey ${key}`
        })
      }
    }) */
    // .then(() => {return config})
    config.headers['Authorization'] = "SessionKey " + sessionKey;
    console.log('global.userName config', config, global.userName)
    return config
  },
  (error) => {
    return Promise.reject(error);
  }
)

function checkSessionKey(){
  console.log('checkSessionKey...')
  return new Promise((resolve, reject) => {
    redisClient.redis_hgetall(global.userName)
    .then(res => {
      console.log('res', res)
      if(!res || !res['SessionKey']){
        console.log('no sessionkey')
        getSessionKey({
          wxTypeId: 4,
          userName: global.userName //'cd74cdb0-c2b6-11e7-9ce4-793c1af45c49'
        })
        .then(key => {
          console.log('sessionkey', key)
          redisClient.redis_hmset(global.userName, {
            userName: global.userName,
            sessionKey: key
          }, 100000) //最长108000s
          sessionKey = key;
          resolve(key)
        })
        .catch(err => {
          reject(err)
        })
      }else{
        sessionKey = res;
        resolve()
      }
    })
  })
}

function getFolder(type = 10){
  return new Promise((resolve, reject) => {
    checkSessionKey().then(() => {
      request({
        method: 'GET',
        url: getApi(api.get_filesFolder(type))
      })
      .then(res => {
        console.log(res)
        resolve(res)
      })
      .catch(err => {
        console.log(err)
        reject(err)
      })      
    })
  })
}

function postUploadFile(options){
  console.log('upload config ', options.opt);
  return new Promise((resolve, reject) => {
    checkSessionKey().then(() => {
      request({
        method: 'POST',
        url: getApi(api.post_fileUploadRobotFile(options.opt)),
        data: options.data
      })
      .then(res => {
        console.log('res', res);
        resolve(res)
      })
      .catch(err => {
        console.log('post_fileUploadRobotFile fail ', err)
        reject(err)
      })
    })
  })
}

function postUserInsert(data){
  return new Promise((resolve, reject) => {
    checkSessionKey().then(() => {
      request({
        method: "POST",
        url: getApi(api.post_userInsert()),
        data
      })
      .then(res => {
        console.log('res', res);
        resolve(res)
      })
      .catch(err => {
        console.log('post_userInsert fail ', err)
        reject(err)
      })
    })
  })
}

module.exports = {
  getFolder,
  postUploadFile,
  postUserInsert
}
