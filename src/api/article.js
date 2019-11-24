// 提供  文章相关API函数
import request from '@/utils/request'

/**
 * 获取文章列表
 * @param {Integer} channelId - 频道ID
 * @param {Integer} timestamp - 时间戳
 */
export const getArticles = (channelId, timestamp) => {
  return request('/app/v1_1/articles', 'get', {
    channel_id: channelId,
    timestamp,
    with_top: 1
  })
}

/**
 * 对文章不感兴趣d的操作
 * @param {String} articleId - 文章ID
 */
export const disLikes = (articleId) => {
  return request('app/v1_0/article/dislikes', 'post', {
    target: articleId
  })
}

/**
 * 取消对文章不喜欢
 * @param {String} articleId - 文章的ID
 */
export const unDisLikes = (articleId) => {
  return request(`/app/v1_0/article/dislikes/${articleId}`, 'delete')
}

/**
 * 对文章点赞
 * @param {String} articleId - 文章的ID
 */
export const likings = (articleId) => {
  return request('/app/v1_0/article/likings', 'post', {
    target: articleId
  })
}
/**
 * 取消对文章点赞
 * @param {String} articleId - 文章的ID
 */
export const unLikings = (articleId) => {
  return request(`/app/v1_0/article/likings/${articleId}`, 'delete')
}

/**
 * 举报文章
 * @param {String} articleId -文章ID
 * @param {Integer} type - 举报类型
 */
export const report = (articleId, type) => {
  return request('app/v1_0/article/reports', 'post', {
    target: articleId,
    type
  })
}

/**
 * 获取联想词条
 * @param {String} q - 搜索关键字
 */
export const suggest = (q) => {
  return request('/app/v1_0/suggestion', 'get', {
    q
  })
}

/**
 * 搜索文章
 * @param {Integer} param.page - 页码
 * @param {Integer} param.perPage - 每页多少条
 * @param {String} param.q - 搜索关键字
 */
export const searchArticles = ({ page, perPage = 20, q }) => {
  return request('app/v1_0/search', 'get', {
    page,
    per_page: perPage,
    q
  })
}

/**
 * 获取文章详情
 * @param {String} articleId - 文章ID
 */
export const getArticleDetail = (articleId) => {
  return request(`/app/v1_0/articles/${articleId}`, 'get')
}

/**
 * 获取评论或回复
 * @param {String} type - a 查询文章的评论  c 查询评论的回复
 * @param {String} source - 如果查询评论是文章的ID  如果查询回复是评论的ID
 * @param {String} offset - 查询每一页数据的最后一个数据的ID，当作下一页的偏移量
 * @param {String} limit - 每页显示多少条
 */
export const getCommentsOrReplys = ({ type, source, offset, limit = 10 }) => {
  return request('/app/v1_0/comments', 'get', { type, source, offset, limit })
}

/**
 * 提交评论或者回复
 * @param {String} target - 做评论的时候：文章ID  做回复的时候：评论ID
 * @param {String} content - 内容
 * @param {String} artId - 文章的ID 当你的做回复的时候
 */
export const commentOrReply = (target, content, artId = null) => {
  return request('/app/v1_0/comments', 'post', { target, content, art_id: artId })
}
