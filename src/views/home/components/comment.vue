<template>
  <div class="comment">
    <!-- 评论列表 -->
    <van-list @load="loadComments" :immediate-check="false" v-model="loading" :finished="finished" finished-text="没有更多评论了">
      <div class="item van-hairline--bottom van-hairline--top" v-for="item in comments" :key="item.com_id.toString()">
        <van-image round width="1rem" height="1rem" fit="fill"  :src="item.aut_photo" />
        <div class="info">
          <p>
            <span class="name">{{item.aut_name}}</span>
            <span style="float:right">
              <span class="van-icon van-icon-good-job-o zan"></span>
              <span class="count">{{item.like_count}}</span>
            </span>
          </p>
          <p>{{item.content}}</p>
          <p>
            <span class="time">{{item.pubdate|realTime}}</span>&nbsp;
            <van-tag plain @click="openReplyDialog(item.com_id.toString())">{{item.reply_count}} 回复</van-tag>
          </p>
        </div>
      </div>
    </van-list>
    <!-- 底部输入框 -->
    <div class="reply-container van-hairline--top">
      <van-field v-model="value" placeholder="写评论..." @keyup.enter="submit()">
        <van-loading v-if="submiting" slot="button" type="spinner" size="16px"></van-loading>
        <span class="submit" @click="submit()" v-else slot="button">提交</span>
      </van-field>
    </div>

    <!-- 回复的对话框 -->
    <van-action-sheet v-model="showReply" @close="commentId=null" class="reply_dailog" title="回复评论">
      <van-list @load="loadReplys" :immediate-check="false" v-model="reply.loading" :finished="reply.finished" finished-text="没有更多回复了">
        <div class="item van-hairline--bottom van-hairline--top" v-for="item in reply.list" :key="item.com_id.toString()">
          <van-image round width="1rem" height="1rem" fit="fill" :src="item.aut_photo" />
          <div class="info">
            <p><span class="name">{{item.aut_name}}</span></p>
            <p>{{item.content}}</p>
            <p><span class="time">{{item.pubdate|realTime}}</span></p>
          </div>
        </div>
      </van-list>
    </van-action-sheet>
  </div>
</template>

<script>
import { getCommentsOrReplys, commentOrReply } from '@/api/article'
export default {
  data () {
    return {
      // 输入内容
      value: '',
      // 提交评论或回复内容 提交状态
      submiting: false,
      // ----------- 评论列表相关数据 --------------
      loading: false,
      finished: false,
      offset: null,
      comments: [],
      // 显示回复列表
      showReply: false,
      reply: {
        loading: false,
        finished: false,
        offset: null,
        list: []
      },
      // 如果点击回复，记录当前评论ID
      commentId: null
    }
  },
  // 渲染评论列在什么时候获取数据？
  // 每次进入文章详情，都应该看到最新的评论。
  // 结论：activated 激活组件的时候获取数据
  // 但是：van-list 组件，在组件初始化（第一次激活）主动触发@load事件，获取数据
  // 操作：禁用van-list的默认加载行为  :immediate-check="false"
  activated () {
    // 重置评论列表
    this.comments = []
    // 重置数据全部加载完毕的状态
    this.finished = false
    // 开启加载中效果
    this.loading = true
    // 获取评论列表
    this.loadComments()
  },
  methods: {
    // 获取评论列表
    async loadComments () {
      await this.$sleep()
      // 调用API获取评论列表数据
      const data = await getCommentsOrReplys({
        type: 'a',
        source: this.$route.params.id,
        offset: this.offset
      })
      // 追加数据
      this.comments.push(...data.results)
      // 结束加载
      this.loading = false
      if (data.last_id > data.end_id) {
        this.offset = data.last_id
      } else {
        this.finished = true
      }
    },
    // 打开回复对话框
    openReplyDialog (comId) {
      this.showReply = true
      this.commentId = comId
      // 重置一些数据
      this.reply.list = []
      this.reply.finished = false
      this.reply.loading = true
      // 加载回复
      this.loadReplys()
    },

    // 加载回复
    async loadReplys () {
      await this.$sleep()
      const data = await getCommentsOrReplys({
        type: 'c',
        source: this.commentId,
        offset: this.reply.offset
      })
      this.reply.list.push(...data.results)
      // 上拉加载逻辑
      this.reply.loading = false
      if (data.last_id > data.end_id) {
        this.reply.offset = data.last_id
      } else {
        this.reply.finished = true
      }
    },

    // 提交 评论或者回复
    async submit () {
      try {
        if (!this.value) return false
        // 显示提交效果
        this.submiting = true
        if (this.commentId) {
          // 提交回复
          const data = await commentOrReply(this.commentId, this.value, this.$route.params.id)
          // 成功
          this.$toast.success('回复成功')
          // 追加当前回复在回复列表最顶部  new_obj 是提交成功后返回的数据和list中每一项属性结构相同
          this.reply.list.unshift(data.new_obj)
          // 需要给当前的评论总回复数据加1
          const currCom = this.comments.find(item => item.com_id.toString() === this.commentId)
          currCom.reply_count++
        } else {
          // 提交评论
          const data = await commentOrReply(this.$route.params.id, this.value)
          // 成功
          this.$toast.success('评论成功')
          this.comments.unshift(data.new_obj)
        }
        // 结束提交效果
        this.submiting = false
        this.value = ''
      } catch (error) {
        this.$toast.fail('操作失败')
        // 结束提交效果
        this.submiting = false
      }
    }
  }
}
</script>

<style scoped lang='less'>
// 评论列表
.comment {
  margin-top: 10px;
  /deep/ .item {
    display: flex;
    padding: 10px 0;
    .info {
      flex: 1;
      padding-left: 10px;
      .name{
        color:#069;
      }
      .zan{
        vertical-align:middle;
        padding-right:2px;
      }
      .count{
        vertical-align:middle;
        font-size:10px;
        color: #666;
      }
      .time{
        color: #666;
      }
      p {
        padding: 5px 0;
        margin: 0;
      }
    }
  }
  /deep/ .van-button:active::before {
    background: transparent;
  }
}
// 输入框
.reply-container {
  position: fixed;
  left: 0;
  bottom: 0;
  height: 44px;
  width: 100%;
  background: #f5f5f5;
  z-index: 9999;
  .submit {
    font-size: 12px;
    color: #3296fa;
  }
}
// 回复列表
.van-popup--bottom{
  &.van-popup--round{
    border-radius: 0;
  }
}
.reply_dailog {
  height: 100%;
  max-height: 100%;
  display: flex;
  overflow: hidden;
  flex-direction: column;
  .van-action-sheet__header {
    background: #3296fa;
    color: #fff;
    .van-icon-close {
      color: #fff;
    }
  }
  .van-action-sheet__content{
    flex: 1;
    overflow-y: auto;
    padding: 0 10px 44px;
  }
}
</style>
