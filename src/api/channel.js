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

/**
 * 删除频道
 * @param {Integer} channelId - 频道ID
 */
export const delChannel = (channelId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { user } = store.state
      if (user.token) {
      // 已登录
        await request(`/app/v1_0/user/channels/${channelId}`, 'delete')
        resolve()
      } else {
        // 未登录
        // 1. 获取本地的频道
        const localChannels = JSON.parse(window.localStorage.getItem(CHANNEL_KEY))
        // 2. 进行删除
        localChannels.splice(localChannels.findIndex(item => item.id === channelId), 1)
        // 3. 存入本地
        window.localStorage.setItem(CHANNEL_KEY, JSON.stringify(localChannels))
        resolve()
      }
    } catch (e) {
      reject(e)
    }
  })
}

/**
 * 添加频道
 * @param {Array} orderChannels - 排好序的频道数组
 */
export const addChannel = (orderChannels) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { user } = store.state
      if (user.token) {
        // 已经登录
        await request('/app/v1_0/user/channels', 'put', {
          channels: orderChannels
        })
        resolve()
      } else {
        // 未登录
        // 1、获取本地的频道
        const localChannels = JSON.parse(window.localStorage.getItem(CHANNEL_KEY))
        // 2. 追加频道  orderChannels最后一项中的 id name
        const { id, name } = orderChannels[orderChannels.length - 1]
        localChannels.push({ id, name })
        // 3、存入本地
        window.localStorage.setItem(CHANNEL_KEY, JSON.stringify(localChannels))
        resolve()
      }
    } catch (error) {
      reject(error)
    }
  })
}
