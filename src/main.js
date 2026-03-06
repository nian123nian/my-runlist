import Vue from 'vue'
import App from './App.vue'
// 引入路由
import router from './router'
import store from './store'
// import ElementUI from 'element-ui'
// import 'element-ui/lib/theme-chalk/index.css'
// import axios from 'axios'

// 1. 引入 ElementUI
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

// 2. 使用 ElementUI
Vue.use(ElementUI)

// 3. 引入 axios（后面会封装 request，先用这个测试）
import axios from 'axios'
Vue.prototype.$axios = axios

// 配置 axios 基础地址
axios.defaults.baseURL = '/api'  // 保持这个不变

Vue.config.productionTip = false

new Vue({
  // 挂载路由
  router,
  store,
  render: h => h(App)
}).$mount('#app')