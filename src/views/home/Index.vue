<template>
  <div class="container">
     <!-- tab容器  swipeable 允许手势滑动 :lazy-render="false"关闭懒加载,自己实现加载-->
    <van-tabs swipeable animated v-model="activeIndex" :lazy-render="false" @change="changeChannel">
      <!-- 选项卡 + 对应的内容 -->
      <van-tab :key="item.id" v-for="item in myChannels" :title="item.name">
        <!-- 文章列表（滚动容器） -->
        <div class="scroll-wrapper" @scroll="remember($event)" ref="scroll-wrapper">
          <van-pull-refresh
            v-model="activeChannel.downLoading"
            @refresh="onRefresh"
            :success-text="refreshSuccessText"
          >
            <van-list v-model="activeChannel.upLoading" :finished="activeChannel.finished" finished-text="没有更多了" @load="onLoad">
              <van-cell :to="{name:'article',params:{id:item.art_id.toString()}}" v-for="item in activeChannel.articles" :key="item.art_id.toString()">
                <div class="article_item">
                  <h3 class="van-ellipsis">{{item.title}}</h3>
                  <div class="img_box" v-if="item.cover.type===3">
                    <van-image lazy-load class="w33" fit="cover" :src="item.cover.images[0]" />
                    <van-image lazy-load class="w33" fit="cover" :src="item.cover.images[1]" />
                    <van-image lazy-load class="w33" fit="cover" :src="item.cover.images[2]" />
                  </div>
                  <div class="img_box" v-if="item.cover.type===1">
                    <van-image lazy-load class="w100" fit="cover" :src="item.cover.images[0]" />
                  </div>
                  <div class="info_box">
                    <span>{{item.aut_name}}</span>
                    <span>{{item.comm_count}}评论</span>
                    <span>{{item.pubdate | realTime}}</span>
                    <span class="close" @click.stop="openMoreAction(item.art_id.toString())" v-if="user.token">
                      <van-icon name="cross"></van-icon>
                    </span>
                  </div>
                </div>
              </van-cell>
            </van-list>
          </van-pull-refresh>
        </div>
      </van-tab>
    </van-tabs>
    <!-- 频道按钮 -->
    <span class="bar_btn" slot="nav-right" @click="openChannelEdit">
      <van-icon name="wap-nav"></van-icon>
    </span>
    <!-- 使用组件：更多操作 -->
    <more-action v-if="user.token" v-model="showMoreAction" :articleId="articleId" @on-dislikes="removeArticle" @on-report="removeArticle"></more-action>
    <!-- 使用频道编辑组件 原来的传值方式:activeIndex="activeIndex" @update="activeIndex=$event" 改为:activeIndex.sync="activeIndex"-->
    <!-- 1. 如果一个组件显示多个数据的双向绑定  v-model 不够使用 -->
    <!-- 2. vue提供 sync修饰符  双向数据绑定（同步父组件和子组件数据） -->
    <!-- 3. 绑定属性  :attrName.sync="数据"  触发事件 $emit('update:attrName',数据) -->
    <channel-edit v-model="showChannelEdit" :myChannels="myChannels" :activeIndex.sync="activeIndex"></channel-edit>
  </div>
</template>

<script>
import { getMyChannels } from '@/api/channel'
import { getArticles } from '@/api/article'
import { mapState } from 'vuex'
import MoreAction from './components/MoreAction'
import ChannelEdit from './components/channel-edit'

export default {
  name: 'home-index',
  components: { MoreAction, ChannelEdit },
  data () {
    return {
      // 是否是加载中状态
      // upLoading: false,
      // 是否所有数据加载完毕
      // finished: false,
      // 文章列表
      // articles: [],

      // 我的频道列表(推荐频道默认拥有第一个频道)
      myChannels: [],
      // 刷新完成的提示  文案（暂无更新|更新成功）
      refreshSuccessText: '',
      // 当前激活的频道索引
      activeIndex: 0,
      // 显示更多操作
      showMoreAction: false,
      // 记录当前点击文章ID
      articleId: null,
      // 控制频道编辑组件显示隐藏
      showChannelEdit: false

    }
  },

  created () {
    // 获取频道数据
    this.getMyChannels()
  },
  // 激活组件钩子（组件缓存） 初始化组件也会执行
  activated () {
    // 当前激活的频道的文章列表容器 scroll-wrapper 滚动之前记录的位置
    // scroll-wrapper 有几个频道就有几个容器 是一个数组[dom,dam,。。。]
    if (this.$refs['scroll-wrapper']) {
      const dom = this.$refs['scroll-wrapper'][this.activeIndex]
      dom.scrollTop = this.activeChannel.scrollTop
    }
  },
  computed: {
    // 当前频道
    activeChannel () {
      return this.myChannels[this.activeIndex]
    },
    ...mapState(['user'])
  },
  watch: {
    user () {
      // 更新当前频道 (默认激活推荐)
      this.activeIndex = 0
      this.getMyChannels()
      this.onLoad()
    }
  },
  methods: {
    // 获取频道列表
    async getMyChannels () {
      const data = await getMyChannels()
      // 目前 myChannels： 频道id  频道名称
      // 扩展 myChannels： 频道id  频道名称  +文章列表 +加载中 +刷新中 +是否全部加载 +时间戳
      this.myChannels = [] // 清除tabs组件的缓存
      this.$nextTick(() => {
        this.myChannels = data.channels.map(item => {
          return {
            id: item.id,
            name: item.name,
            articles: [],
            upLoading: false,
            downLoading: false,
            finished: false,
            timestamp: Date.now(),
            // 记录阅读位置
            scrollTop: 0
          }
        })
      })
    },
    // 上拉加载
    async onLoad () {
      // window.setTimeout(() => {
      //   // 1. 获取数据 （模拟数据） 1-10  11-20  21-30 ...数据
      //   const data = []
      //   for (let i = this.articles.length; i < this.articles.length + 10; i++) {
      //     data.push(i + 1)
      //   }
      //   // 2. 结束上拉加载效果
      //   this.upLoading = false
      //   // 3. 渲染页面（追加内容）
      //   this.articles.push(...data)
      //   // 4. 判断所有数据是否加载完毕   假设加载了50条就是所有数据
      //   if (this.articles.length >= 50) {
      //     // 加载所有数据完毕
      //     this.finished = true
      //   }
      // }, 1000)
      await this.$sleep()
      const data = await getArticles(this.activeChannel.id, this.activeChannel.timestamp)
      // data.resutls 列表 data.pre_timestamp 时间戳
      this.activeChannel.upLoading = false
      this.activeChannel.articles.push(...data.results)
      // 有数据
      if (data.pre_timestamp) {
        // 下一次请求要使用
        this.activeChannel.timestamp = data.pre_timestamp
      } else {
        // 加载全部数据结束
        this.activeChannel.finished = true
      }
    },

    // 下拉刷新
    async onRefresh () {
      // @refresh 当你下拉刷新 松开手指的时候触发
      // window.setTimeout(() => {
      //   // 1. 获取数据
      //   const data = [1, 2, 3, 4, 5]
      //   // const data = []
      //   // 2. 结束刷新中效果
      //   this.downLoading = false
      //   if (data.length) {
      //     // 情况一  有数据
      //     // 3. 渲染页面（替换内容）
      //     this.articles = data
      //     // 4. 提示 更新成功
      //     this.refreshSuccessText = '更新成功'
      //     // 5. 主动加载下一屏数据 (防止不足一屏内容)
      //     this.onLoad()
      //     // 6. 重置 加载全部数据的状态
      //     this.finished = false
      //   } else {
      //     // 情况二  没有数据
      //     // 3. 提示 暂无更新
      //     this.refreshSuccessText = '暂无更新'
      //   }
      // }, 1000)
      await this.$sleep()
      this.activeChannel.timestamp = Date.now()
      const data = await getArticles(this.activeChannel.id, this.activeChannel.timestamp)
      this.activeChannel.downLoading = false
      if (data.results.length) {
        this.activeChannel.articles = data.results
        this.activeChannel.finished = false
        this.refreshSuccessText = '更新成功'
        // 设置请求下一页数据的时间戳
        this.activeChannel.timestamp = data.pre_timestamp
        this.onLoad()
      } else {
        this.refreshSuccessText = '暂无更新'
      }
    },

    // 切换频道
    changeChannel () {
      // 当前频道下无文章数据，自己主动加载一次数据
      if (!this.activeChannel.articles.length) {
        // 显示加载中效果
        this.activeChannel.upLoading = true
        this.onLoad()
      } else {
        // vue项目中  使用 $nextTick() 下一帧
        // 情况1：当你同时操作dom时候，前面的操作效果生效
        // 情况2：当你修改数据驱动视图更新（慢）,后面操作dom可能失败
        this.$nextTick(() => {
          const dom = this.$refs['scroll-wrapper'][this.activeIndex]
          dom.scrollTop = this.activeChannel.scrollTop
        })
      }
    },

    // 记住滚动位置
    remember (e) {
      // 给当前频道记录阅读位置
      this.activeChannel.scrollTop = e.target.scrollTop
    },
    // 打开更多操作对话框
    openMoreAction (articleId) {
      this.showMoreAction = true
      // 记录文章Id
      this.articleId = articleId
    },

    // 删除文章
    removeArticle () {
      const articles = this.activeChannel.articles
      const index = articles.findIndex(item => item.art_id.toString() === this.articleId)
      articles.splice(index, 1)
    },

    // 打开编辑频道
    openChannelEdit () {
      this.showChannelEdit = true
    }

  }
}
</script>

<style scoped lang='less'>
.van-tabs {
  height: 100%;
  display: flex;
  flex-direction: column;
  /deep/ .van-tabs__wrap {
    height: 36px;
    padding-right: 36px;
    .van-tab {
      line-height: 36px;
    }
    .van-tabs__line {
      background-color: #3296fa;
      height: 2px;
    }
  }
  /deep/ .van-tabs__content {
    flex: 1;
    overflow: hidden;
  }
  /deep/ .van-tab__pane {
    height: 100%;
    .scroll-wrapper {
      height: 100%;
      overflow-y: auto;
    }
  }
}

// 按钮
.bar_btn {
  width: 36px;
  height: 35px;
  position: absolute;
  top: 0;
  right: 0;
  &::before {
    content: "";
    width: 100%;
    height: 100%;
    position: absolute;
    z-index: 999;
    box-shadow: 0 0 10px #999;
    transform: scale(1, 0.6);
  }
  .van-icon-wap-nav {
    width: 100%;
    height: 100%;
    background: #fff;
    text-align: center;
    line-height: 35px;
    position: relative;
    z-index: 1000;
    &::before {
      font-size: 20px;
    }
  }
}

// 文章列表
.article_item {
  h3 {
    font-weight: normal;
    line-height: 2;
  }
  .img_box {
    display: flex;
    justify-content: space-between;
    .w33 {
      width: 33%;
      height: 90px;
    }
    .w100 {
      width: 100%;
      height: 180px;
    }
  }
  .info_box {
    color: #999;
    line-height: 2;
    position: relative;
    font-size: 12px;
    span {
      padding-right: 10px;
      &.close {
        border: 1px solid #ddd;
        border-radius: 2px;
        line-height: 15px;
        height: 12px;
        width: 16px;
        text-align: center;
        padding-right: 0;
        font-size: 8px;
        position: absolute;
        right: 0;
        top: 7px;
      }
    }
  }
}
</style>
