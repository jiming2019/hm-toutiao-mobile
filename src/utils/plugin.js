// 时间格式化插件
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
// 时间中文语言包
import 'dayjs/locale/zh-cn'
// 使用相对时间
dayjs.extend(relativeTime)

// 扩展vue实例
const sleep = () => {
  return new Promise((resolve, reject) => {
    window.setTimeout(() => {
      resolve()
    }, 1000)
  })
}

// 相对时间过滤器函数
const realTime = (value) => {
  return dayjs().locale('zh-cn').from(value)
}

export default {
  install (Vue) {
    // 注册组件  挂载函数  注册过滤器  注册自定义指令
    Vue.prototype.$sleep = sleep
    // 相对时间过滤器
    Vue.filter('realTime', realTime)
  }
}
