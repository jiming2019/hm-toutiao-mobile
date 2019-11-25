<template>
  <div class='container' @scroll="remember($event)" ref="container">
    <van-nav-bar fixed title="文章详情" left-arrow @click-left="$router.back()" right-text="分享" @click-right="share" />
    <!-- 文章详情容器 -->
    <div class="detail">
      <h3 class="title">{{article.title}}</h3>
      <div class="author">
        <van-image round width="1rem" height="1rem" fit="fill" src="https://img.yzcdn.cn/vant/cat.jpeg" />
        <div class="text">
          <p class="name">{{article.aut_name}}</p>
          <p class="time">{{article.pubdate|realTime}}</p>
        </div>
        <van-button round size="small" type="info" @click="followed()">
          {{article.is_followed?'已关注':'关注'}}
        </van-button>
      </div>
      <div class="content" v-html="article.content"></div>
      <div class="zan">
        <van-button @click="toggleAttitude(1)" round size="small" :class="{active:article.attitude===1}" plain icon="like-o">点赞</van-button>&nbsp;&nbsp;&nbsp;&nbsp;
        <van-button @click="toggleAttitude(0)" round size="small" :class="{active:article.attitude===0}" plain icon="delete">不喜欢</van-button>
      </div>

      <!-- 评论组件 -->
      <comment></comment>
    </div>
  </div>
</template>

<script>
import { getArticleDetail, disLikes, unDisLikes, likings, unLikings } from '@/api/article'
import { followed, unFollowed } from '@/api/user'
import Comment from './components/comment'
export default {
  name: 'article-detail',
  components: { Comment },
  data () {
    return {
      // 文章详情
      article: {
        art_id: ''
      },
      // 阅读位置
      scrollTop: 0
    }
  },
  activated () {
    // 获取文章数据
    this.getArticleDetail()

    if (this.$route.params.id !== this.article.art_id.toString()) {
      // 重置阅读位置
      this.scrollTop = 0
      // 获取文章数据
      this.getArticleDetail()
    } else {
      // 如果一样跳转到阅读位置
      this.$refs['container'].scrollTop = this.scrollTop
    }
  },
  methods: {
    // 获取文章详情
    async getArticleDetail () {
      const data = await getArticleDetail(this.$route.params.id)
      this.article = data
    },

    // 记录阅读位置
    remember (e) {
      this.scrollTop = e.target.scrollTop
    },

    // 关注  取消关注
    async followed () {
      try {
        if (this.article.is_followed) {
        // 取消关注
          await unFollowed(this.article.aut_id)
          this.$toast.success('取消关注')
          this.article.is_followed = false
        } else {
        // 进行关注
          await followed(this.article.aut_id)
          this.$toast.success('关注成功')
          this.article.is_followed = true
        }
      } catch (e) {
        if (e.response.status !== 401) {
          this.$toast.fail('操作失败')
        }
      }
    },

    // 点赞 取消点赞  不喜欢  取消不喜欢
    async toggleAttitude (btnType) {
      try {
        if (btnType === 1) { // 点击点赞按钮--点赞逻辑
          if (this.article.attitude === 1) {
            // 取消点赞
            await unLikings(this.article.art_id)
            this.article.attitude = -1
          } else {
            // 点赞
            await likings(this.article.art_id)
            this.article.attitude = 1
          }
        } else { // 点击不喜欢--不喜欢逻辑
          if (this.article.attitude === 0) {
            // 取消不喜欢
            await unDisLikes(this.article.art_id)
            this.article.attitude = -1
          } else {
            // 不喜欢
            await disLikes(this.article.art_id)
            this.article.attitude = 0
          }
        }

        // 统一提示
        this.$toast.success('操作成功')
      } catch (error) {
        if (error.response.status !== 401) {
          this.$toast.fail('操作失败')
        }
      }
    }

    // 分享
    // share () {
    //   // 通过分享组件分享 App打包用
    //   plus.share.sendWithSystem({
    //     content: '分享内容',
    //     href: 'http://www.dcloud.io/'
    //   }, function () {
    //     console.log('分享成功')
    //   }, function (e) {
    //     console.log('分享失败：' + JSON.stringify(e))
    //   })
    // }
  }
}
</script>

<style scoped lang='less'>
.container {
  height: 100%;
  overflow-y: auto;
  box-sizing: border-box;
}
.detail {
  padding: 46px 10px 44px;
  height: 100%;
  .title {
    font-size: 18px;
    line-height: 2;
  }
  .zan{
    text-align: center;
    padding: 10px 0;
    .active{
      border-color:red;
      color: red;
    }
  }
  .author {
    padding: 10px 0;
    display: flex;
    .text {
      flex: 1;
      padding-left: 10px;
      line-height: 1.5;
      .name {
        font-size: 14px;
        margin: 0;
      }
      .time {
        margin: 0;
        font-size: 12px;
        color: #999;
      }
    }
  }
  .content {
    padding: 20px 0;
    overflow: hidden;
    white-space: pre-wrap;
    word-break: break-all;
    /deep/ img{
      max-width:100%;
      background: #f9f9f9;
    }
    /deep/ code{
      white-space: pre-wrap;
    }
  }
}</style>
