const base = "http://192.168.1.171:8224"

export const api = {
  get_filesFolder: (folderType) => {
    return `/api/Files/folder/type/${folderType}`
  },

  post_fileUploadRobotFile: (opt) => {
    return `/api/File/UploadRobotFile?treeId=${opt.treeId}&dirId=${opt.dirId}&fileName=${opt.fileName}&chunkSize=${opt.chunkSize}`
  }
}

export function getApi(uri){
  return `${base}${uri}`
}

