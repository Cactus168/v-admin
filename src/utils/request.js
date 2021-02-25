import http from '@/utils/axios.config'

export function imgRequest (url) {
  return http.get(`${url}`, {
    responseType: 'arraybuffer'
  }).then(response => {
    // 将后台的图片二进制流转化为base64
    return 'data:image/png;base64,' + btoa(
      new Uint8Array(response).reduce((data, byte) => data + String.fromCharCode(byte), '')
    )
  })
}

export function postRequest (url, params) {
  return http({
    method: 'post',
    url: `${url}`,
    data: params
  })
}
export function putRequest (url, params) {
  return http({
    method: 'put',
    url: `${url}`,
    data: params
  })
}
export function putRequestParams (url, params) {
  return http({
    method: 'put',
    url: `${url}`,
    params: params
  })
}
export function getRequest (url, params) {
  return http({
    method: 'get',
    url: `${url}`,
    params: params
  })
}
export function deleteRequest (url, params) {
  return http({
    method: 'delete',
    url: `${url}`,
    params: params
  })
}
