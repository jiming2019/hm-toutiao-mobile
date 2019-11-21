import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

// 使用vant组件库 默认导入vant ,指定成员导入图片懒加载Lazyload
import Vant, { Lazyload } from 'vant'
import 'vant/lib/index.css'

// 使用rem插件
import 'amfe-flexible'
// 覆盖vant的样式
import '@/styles/index.less'
// 引入自定义插件
import myPlugin from '@/utils/plugin'

Vue.use(Vant)
Vue.use(Lazyload)
Vue.use(myPlugin)
Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
