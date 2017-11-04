const axios = require('axios')
// import FormData from 'form-data'

// import {
//   getCONF,
//   Request,
//   isStandardBrowserEnv,
//   assert,
//   getClientMsgId,
//   getDeviceID
// } from '../util'

// import { getApi, api } from './config.js'
// import { getSessionKey } from './auth.js'

const getApi = require('./config').getApi
const api = require('./config').api

const getSessionKey = require('./auth').getSessionKey

const LRU = require("lru-cache");

let authKeyCache = LRU();

let headers = {
  'Host': '192.168.1.171:8224',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:56.0) Gecko/20100101 Firefox/56.0',
  'Accept': 'application/json',
  'Accept-Language': 'zh-CN,zh;q=0.8,en-US;q=0.5,en;q=0.3',
  'Accept-Encoding': 'gzip, deflate',
  'Authorization': 'SessionKey SQB6YPAEM1RNMFYJHEQMJCAUPUTEPQWDHCHHT0WYSOANY6OJOEAKYVUODPNPSPDL',
  'Referer': 'http://192.168.1.171:8224/swagger/ui/index',
  'Connection': 'keep-alive'
}


const request = axios.create();
request.interceptors.request.use(
  config => {
    // console.log('config', config)
    console.log('ssKey', getSessionKey({
        wxTypeId: 1,
        userName: global.userName
      }), global.userName)
    if(!authKeyCache.get(global.userName)){
      let ssKey = getSessionKey({
        wxTypeId: 1,
        userName: global.userName
      });
      if(typeof ssKey === 'string'){
        config.hearders['Authorization'] = `SessionKey ${ssKey}`
      }
    }
  }
)





// let headers = {
//   'Host': '192.168.1.171:8224',
//   'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:56.0) Gecko/20100101 Firefox/56.0',
//   'Accept': 'application/json',
//   'Accept-Language': 'zh-CN,zh;q=0.8,en-US;q=0.5,en;q=0.3',
//   'Accept-Encoding': 'gzip, deflate',
//   'Authorization': 'SessionKey SQB6YPAEM1RNMFYJHEQMJCAUPUTEPQWDHCHHT0WYSOANY6OJOEAKYVUODPNPSPDL',
//   'Referer': 'http://192.168.1.171:8224/swagger/ui/index',
//   'Connection': 'keep-alive',
//   'Content-Length': '0'
// }

// Authorization: SessionKey RGAJL5OWEFSUTDRWOKXONZAQIWE0E08QNRATPJSFFA6PABVTJWE1IQPBIF0LMRQG

// SessionKey KCZFRHA20V0QUNZX1QUK3TJA7JIHEFWAXDRCSB1KXJAHBFSD0TF8OKTUXRBXA2WW


// const request = axios.create({headers});


function getFolder(type = 2){
  return new Promise((resolve, reject) => {
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
}


function postUploadFile(options){
  console.log('upload config ', options.opt);
  return new Promise((resolve, reject) => {
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
}

function postUserInsert(data){
  return new Promise((resolve, reject) => {
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
}

module.exports = {
  getFolder,
  postUploadFile,
  postUserInsert
}

/*         let url = "http://192.168.1.171:8224/api/File/UploadRobotFile"

        let header = {
          'Host': '192.168.1.171:8224',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:56.0) Gecko/20100101 Firefox/56.0',
          'Accept': 'application/json',
          'Accept-Language': 'zh-CN,zh;q=0.8,en-US;q=0.5,en;q=0.3',
          'Accept-Encoding': 'gzip, deflate',
          'Authorization': 'SessionKey RGAJL5OWEFSUTDRWOKXONZAQIWE0E08QNRATPJSFFA6PABVTJWE1IQPBIF0LMRQG',
          'Referer': 'http://192.168.1.171:8224/swagger/ui/index',
          'Connection': 'keep-alive'
        }

        let data = fs.createReadStream(`./media/${msg.MsgId}.jpg`)
        let form = new FormData()
        form.append('type','image')
        form.append('media',data,'test.jpg')

        let getHeaders = (form=>{
          return new Promise((resolve,reject)=>{
            form.getLength((err,length)=>{
              if(err) reject(err)
              let headers = Object.assign({'Content-Length':length},form.getHeaders())
              headers = Object.assign(header, headers)
              resolve(headers)
            })
          })
        })

        getHeaders(form)
        .then(headers=>{
          return axios.post(url + "?treeId=&fileName",form,{headers:headers})
        })
        .then((response)=>{
          console.log(response.data)
        })
        .catch(e=>{console.log(e)}) */