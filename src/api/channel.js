// 导出  频道相关的API函数
import request from '@/utils/request'
import store from '@/store'

/**
 * 获取用户的频道列表 （未登录状态，系统给的默认频道列表）
 */
// 约定本地存储的key和value(数组类型的json字符串)
const CHANNEL_KEY = 'hm-toutiao-mobile-channel'
export const getMyChannels = () => {
  // 该函数的返回值一定是promise对象 return new Promise()
  // 1. 当是登录状态   获取我的频道数据  返回数据
  // 2. 当未登录状态且本地没有频道   获取默认频道且存储在本地  返回数据
  // 3. 当未登录状态但是本地有频道   获取本地的频道 返回数据
  // return request('/app/v1_0/user/channels', 'get')

  return new Promise(async (resolve, reject) => {
    const { user } = store.state
    if (user.token) {
      // 第一种情况
      const data = await request('/app/v1_0/user/channels', 'get')
      resolve(data)
    } else {
      const str = window.localStorage.getItem(CHANNEL_KEY) || '[]'
      const localChannel = JSON.parse(str)
      // 第二种情况
      if (!localChannel.length) {
        const data = await request('/app/v1_0/user/channels', 'get')
        window.localStorage.setItem(CHANNEL_KEY, JSON.stringify(data.channels))
        resolve(data)
      } else {
        // 第三种情况
        resolve({ channels: localChannel })
      }
    }
  })
}

/**
 * 获取全部频道
 */
export const getAllChannels = () => {
  return request('/app/v1_0/channels', 'get')
}
