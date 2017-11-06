// import axios from 'axios'
// import { getApi, api } from './config'

const axios = require('axios')
// const LRU = require("lru-cache");
const crypto = require('crypto');
const uuidV1 = require('uuid/v1');

const getApi = require('./config').getApi
const api = require('./config').api

// let authKeyOptions = {
//   maxAge: 60 * 60 * 1000  // 1 hour
// },
// authKeyCache = LRU(authKeyOptions);

// let sskeyOptions = {
//   maxAge: 7 * 60 * 60 * 1000 // 7 hour
// },
// sskeyCache = LRU(sskeyCache);

const redisClient = require('./redisCommand.js')

const request = axios.create();

let authKey = '';

request.interceptors.request.use(
  config => {
/*     redisClient.redis_get('AuthKey')
    .then(res => {
      console.log('authkey', res)
      if(!res['AuthKey']){
        getAuthKey(createSign()).then(res => {
          redisClient.redis_set('AuthKey', res['AuthKey'], 3600) //最长7200s
          config.hearders['Authorization'] = "Auth " + res['AuthKey']
        })
      }
    }) */
    // .then(() => {return config})
    console.log("Authorization", authKey,1);
    config.headers['Authorization'] = 'Auth ' + authKey;
    return config
  },
  (error) => {
    return Promise.reject(error);
  }
)

//创建sign
function createSign(){
  const sha1 = crypto.createHash('sha1');
  const appId = 'bbca7c989897e16514a';
  const secrect = 'c1c28f80de214db0a1a6680c390f601a';
  const noncestr = Math.random();
  sha1.update(appId + noncestr + secrect);
  return {
    appId,
    noncestr,
    sign: sha1.digest('hex')
  }
}

//创建用户唯一标示--remarkName 备注名
function createRemarkName(){
  return uuidV1()
}

function checkAuthKey(){
  return new Promise((resolve, reject) => {
    redisClient.redis_get('AuthKey')
    .then(res => {
      console.log('authkey', res)
      if(!res){
        getAuthKey(createSign()).then(key => {
          redisClient.redis_set('AuthKey', key, 3600) //最长7200s
          authKey = key;
          resolve(key)
        })
        .catch(err => {
          reject(err)
        })
      }else{
        authKey = res;
        resolve()
      }
    })
  })
}

function getAuthKey(options){
  return new Promise((resolve, reject) => {
    request({
      method: 'GET',
      url: getApi(api.get_authKey(options))
    })
    .then(res => {
      console.log('AuthKey ', res)
      if(res.data['AuthKey']){
        resolve(res.data['AuthKey'])
      }else{
        reject()
      }
    })
    .catch(err => {
      console.log('getAuthKey ', err)
      reject(err)
    })
  })
}

function getSessionKey(options){
  return new Promise((resolve, reject) => {
    checkAuthKey().then(() => {
      request({
        method: 'GET',
        url: getApi(api.get_sessionKey(options))
      })
      .then(res => {
        console.log("SessionKey", res)
        if(res.data['SessionKey']){
          resolve(res.data['SessionKey'])
        }else{
          reject()
        }
      })
      .catch(err => {
        console.log(err)
        reject(err)
      })
    })
  })

/*   request({
    method: 'GET',
    url: getApi(api.get_sessionKey(options))
  })
  .then(res => {
    console.log('getSessionKey res', res);
    return res
  })
  .catch(err => {
    console.log('getSessionKey err', err)
  }) */
}

module.exports = {
  getAuthKey,
  getSessionKey,
  createRemarkName
}