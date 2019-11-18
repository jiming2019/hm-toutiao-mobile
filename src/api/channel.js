// 导出  频道相关的API函数
import request from '@/utils/request'

/**
 * 获取用户的频道列表 （未登录状态，系统给的默认频道列表）
 */

export const getMyChannels = () => {
  return request('/app/v1_0/user/channels', 'get')
}
