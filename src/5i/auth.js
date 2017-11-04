import axios from 'axios'
import { getApi, api } from './config'

const LRU = require("lru-cache");
const crypto = require('crypto');

let authKeyOptions = {
  maxAge: 60 * 60 * 1000  // 1 hour
},
authKeyCache = LRU(authKeyOptions);

let sskeyOptions = {
  maxAge: 7 * 60 * 60 * 1000 // 7 hour
},
sskeyCache = LRU(sskeyCache);

axios.interceptors.request.use(
  config => {
    if(!authKeyCache.get('authKey')){
      config.hearders['AuthKey'] = getAuthKey(createSign())
    }
  }
)

const request = axios.create();

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

function getAuthKey(optionss){
  return new Promise((resolve, reject) => {
    request({
      method: 'GET',
      url: getApi(api.get_authKey(options))
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
}

function getSessionKey(options){
  return new Promise((resolve, reject) => {
    request({
      method: 'GET',
      url: getApi(api.get_sessionKey(options))
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
}

module.exports = {
  getAuthKey,
  getSessionKey
}