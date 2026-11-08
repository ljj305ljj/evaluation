import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import Vant from 'vant'
// import VConsole from 'vconsole'
import api from '@/api'
import 'vant/lib/index.css'
import 'amfe-flexible'
// import '@/filters'
Vue.use(Vant)
Vue.config.productionTip = false
Vue.prototype.$api = api
Vue.prototype.$bus = new Vue()
// new VConsole()
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
