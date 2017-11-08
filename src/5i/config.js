/* const base = {
  storage: "http://192.168.1.171:8224",
  rest: "http://192.168.1.171:8225"
} */

const base = {
  storage: "https://wx-storage.bubaocloud.com",
  rest: "https://wx-rest.bubaocloud.com"
}

export const bindUserUrl = "https://wx-web.bubaocloud.com/bind/";
export const redis_config = {
  host: '127.0.0.1',
  port: 6379
};

let host = base.rest;

export const api = {
  get_filesFolder: (folderType) => {
    host = base.storage;
    return `/api/Files/folder/type/${folderType}`
  },

  post_fileUploadRobotFile: (opt) => {
    host = base.storage;
    return `/api/File?dirId=${opt.treeId}-${opt.folderId}&fileName=${opt.fileName}&chunkSize=${opt.chunkSize}&etag=${opt.etag}`
  },

  post_userInsert: () => {
    return `/api/WxRobot/User/File/Insert`
  },

  get_authKey: (opt) => {
    return `/api/Company/${opt.appId}/noncestr/${opt.noncestr}/sign/${opt.sign}`
  },

  get_sessionKey: (opt) => {
    return `/api/WxRobot/SessionKey?wxTypeId=${opt.wxTypeId}&userName=${opt.userName}`
  }
}

export function getApi(uri){
  let url = `${host}${uri}`;
  host = base.rest;
  return url
}


