// 配置axios  使用配置好的axios发请求
// 处理js最大安全数值   在每次请求携带token  响应后获取有效数据   响应失败token失效（TODO）
// 导出一个发请求的工具函数

import axios from 'axios'
import JSONBIGINT from 'json-bigint'
// 数据仓库   vuex的数据仓库  解决组件间数据共享
import store from '@/store'

// 以前使用的是默认导入的axios实例
// 以前是一个前端项目对应一个后台项目  一个默认的axios足够
// 现在是一个前端项目对应多个后台项目  使用axios.carete() 创建多个实例 配置不同的请求配置
// instance 新axios实例  功能和默认导入的axios一样
const instance = axios.create({
  // 基准地址
  baseURL: 'http://ttapi.research.itcast.cn/',
  // 转换原始数据格式
  transformResponse: [(data) => {
    // data 原始数据(json格式字符串)
    try {
      return JSONBIGINT.parse(data)
    } catch (error) {
      // 无法转换,返回原始data
      return data
    }
  }]
})

// 请求拦截器 在每次请求头中携带token
instance.interceptors.request.use(config => {
  // 拦截到修改请求配置  修改的是headers  获取token  配置token
  if (store.state.user.token) {
    config.headers.Authorization = `Bearer ${store.state.user.token}`
  }
  return config
}, err => {
  return Promise.reject(err)
})

// 响应拦截 响应后获取有效数据
instance.interceptors.response.use(res => {
  // 处理响应
  // res.data响应内容 res.data.data 才是有效数据
  try {
    return res.data.data
  } catch (error) {
    return res
  }
}, error => Promise.reject(error))

// 导出一个使用配置好的axios来发送请求的函数
// 请求地址 url 请求方式 methdo  传参 data

export default (url, method, data) => {
  return instance({
    url,
    method,
    // 当请求方式是get 是params来传参
    // 其他请求方式   是data来传参
    // 动态插入 属性 params|data
    // [] 写任意表达式  返回结果一定要是字符串类型
    // 不够严谨：用户传入请求方式 get Get GET,需要统一转换为小写
    // 相当于下面的代码
    // if (method === 'get') {
    //     params = data
    //   } else {
    //     data = data
    //   }
    [method.toLowerCase() === 'get' ? 'params' : 'data']: data
  })
}
