import debug from 'debug'
import { log } from 'util';

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
    // console.log('global.userName config', config, global.userName)
    return config
  },
  (error) => {
    return Promise.reject(error);
  }
)

function checkSessionKey(userId){
  log('checkSessionKey...', userId)
  debug('checkSessionKey...', userId)
  console.log('checkSessionKey...', userId)
  return new Promise((resolve, reject) => {
    redisClient.redis_hgetall(userId)
    .then(res => {
      console.log('isHasSessionKey', res)
      if(!res || !res['sessionKey']){
        getSessionKey({
          wxTypeId: 4,
          userName: userId
        })
        .then(key => {
          console.log('sessionkey', key)
          redisClient.redis_hmset(userId, {
            userName: userId,
            sessionKey: key
          }, 100000) //最长108000s
          sessionKey = key;
          resolve(key)
        })
        .catch(err => {
          reject(err)
        })
      }else{
        sessionKey = res.sessionKey;
        resolve()
      }
    })
  })
}

function getFolder(userId, type = 10){
  return new Promise((resolve, reject) => {
    checkSessionKey(userId).then(() => {
      request({
        method: 'GET',
        url: getApi(api.get_filesFolder(type))
      })
      .then(res => {
        console.log('get_filesFolder', res.data)
        resolve(res)
      })
      .catch(err => {
        console.log('get_filesFolder', err)
        reject(err)
      })      
    })
  })
}

function postUploadFile(options){
  // console.log('upload config ', options.opt);
  return new Promise((resolve, reject) => {
    // checkSessionKey().then(() => {
      request({
        method: 'POST',
        url: getApi(api.post_fileUploadRobotFile(options.opt)),
        data: options.data
      })
      .then(res => {
        console.log('post_fileUploadRobotFile:', res.data);
        resolve(res)
      })
      .catch(err => {
        console.log('post_fileUploadRobotFile fail ', err)
        reject(err)
      })
    // })
  })
}

function postUserInsert(userId, data){
  return new Promise((resolve, reject) => {
    checkSessionKey(userId).then(() => {
      request({
        method: "POST",
        url: getApi(api.post_userInsert()),
        data
      })
      .then(res => {
        console.log('postUserInsert', res.data);
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
