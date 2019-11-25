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

/**
 * 获取个人中心用户信息
 */
export const getUserInfo = () => {
  return request('/app/v1_0/user', 'get')
}

/**
 * 获取编辑用户资料信息
 */
export const getUserProfile = () => {
  return request(`/app/v1_0/user/profile`, 'get')
}

/**
 * 上传头像
 * @param {Obejct} formData - 上传对象（包含字段photo）
 */
export const saveUserPhoto = (formData) => {
  return request('/app/v1_0/user/photo', 'patch', formData)
}

/**
 * 保存信息
 * @param {String} name
 * @param {Integer} gender
 * @param {String} birthday
 */
export const saveUserInfo = (name, gender = 0, birthday) => {
  return request('/app/v1_0/user/profile', 'patch', { name, gender, birthday })
}
