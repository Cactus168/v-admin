import Vue from 'vue'

import Cookies from 'js-cookie'

import App from './App'
import store from './store'
import router from './router'
import auth from './directive/auth'
import Pagination from "@/components/Pagination";

import 'normalize.css/normalize.css'

import ElementUI from 'element-ui'
import '@/assets/styles/element-variables.scss'

import '@/assets/styles/index.scss' // global css
import '@/assets/styles/main.scss' // global css

import '@/assets/icons' // icon

import './permission'
import { getDicts } from "@/api/dict";
import { resetForm, download, handleTree } from "@/utils/tools";
import {imgRequest, postRequest, putRequest, putRequestParams, deleteRequest, getRequest} from '@/utils/request'

Vue.prototype.getDicts = getDicts
Vue.prototype.download = download
Vue.prototype.resetForm = resetForm
Vue.prototype.handleTree = handleTree

Vue.prototype.httpImg = imgRequest
Vue.prototype.httpPost = postRequest
Vue.prototype.httpPut = putRequest
Vue.prototype.httpPutParams = putRequestParams
Vue.prototype.httpDel = deleteRequest
Vue.prototype.httpGet = getRequest

Vue.prototype.msgSuccess = function (msg) {
  this.$message({ showClose: true, message: msg, type: "success" });
}

Vue.prototype.msgError = function (msg) {
  this.$message({ showClose: true, message: msg, type: "error" });
}

Vue.prototype.msgInfo = function (msg) {
  this.$message.info(msg);
}

// 全局分页组件挂载
Vue.component('Pagination', Pagination)
// 全局权限认证指令注册
Vue.use(auth)

Vue.use(ElementUI, {
  size: Cookies.get('size') || 'medium' // set element-ui default size
})

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
