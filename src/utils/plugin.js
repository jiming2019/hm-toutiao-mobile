// 扩展vue实例
const sleep = () => {
  return new Promise((resolve, reject) => {
    window.setTimeout(() => {
      resolve()
    }, 1000)
  })
}

export default {
  install (Vue) {
    // 注册组件  挂载函数  注册过滤器  注册自定义指令
    Vue.prototype.$sleep = sleep
  }
}
