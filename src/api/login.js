import {postRequest, getRequest, imgRequest} from '@/utils/request'

// 登录方法
export function login (username, password, uuid, code) {
  return postRequest('/doLogin', {username, password, uuid, code})
}

// 获取用户详细信息
export function getInfo () {
  return getRequest('/getInfo')
}

// 退出方法
export function logout () {
  return postRequest('/logout')
}

// 获取验证码
export function getCodeImg (uuid) {
  return imgRequest('/verifyCode?uuid=' + uuid)
}

// 获取路由
export const getRouters = () => {
  return getRequest('/getRouters')
}
