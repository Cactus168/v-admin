import hasAuth from './hasAuth'

const install = function(Vue) {
  Vue.directive('hasAuth', hasAuth)
}

if (window.Vue) {
  window['hasAuth'] = hasAuth
  Vue.use(install); // eslint-disable-line
}

export default install
