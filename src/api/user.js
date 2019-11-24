// 负责导出用户相关的API函数
import request from '@/utils/request'

/**
 * 登录
 * @param {String} mobile - 手机号
 * @param {String} code - 验证码
 */
export const login = ({ mobile, code }) => {
  return request('/app/v1_0/authorizations', 'post', { mobile, code })
}

/**
 * 关注
 * @param {Integer} userId - 用户的ID  作者的ID
 */
export const followed = (userId) => {
  return request('/app/v1_0/user/followings', 'post', {
    target: userId
  })
}
/**
 * 取消关注
 * @param {Integer} userId - 用户的ID  作者的ID
 */
export const unFollowed = (userId) => {
  return request(`/app/v1_0/user/followings/${userId}`, 'delete')
}
