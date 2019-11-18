<template>
  <div class="container">
     <!-- tab容器  swipeable 允许手势滑动 -->
    <van-tabs swipeable>
      <!-- 选项卡 + 对应的内容 -->
      <van-tab v-model="activeIndex" :key="item.id" v-for="item in myChannels" :title="item.name">
        <!-- 文章列表（滚动容器） -->
        <div class="scroll-wrapper">
          <van-pull-refresh
            v-model="activeChannel.downLoading"
            @refresh="onRefresh"
            :success-text="refreshSuccessText"
          >
            <van-list v-model="activeChannel.upLoading" :finished="activeChannel.finished" finished-text="没有更多了" @load="onLoad">
              <van-cell v-for="item in activeChannel.articles" :key="item.art_id.toString()">
                <div class="article_item">
                  <h3 class="van-ellipsis">{{item.title}}</h3>
                  <div class="img_box" v-if="item.cover.type===3">
                    <van-image class="w33" fit="cover" :src="item.cover.images[0]" />
                    <van-image class="w33" fit="cover" :src="item.cover.images[1]" />
                    <van-image class="w33" fit="cover" :src="item.cover.images[2]" />
                  </div>
                  <div class="img_box" v-if="item.cover.type===1">
                    <van-image class="w100" fit="cover" :src="item.cover.images[0]" />
                  </div>
                  <div class="info_box">
                    <span>{{item.aut_name}}</span>
                    <span>{{item.comm_count}}评论</span>
                    <span>{{item.pubdate}}</span>
                    <span class="close">
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
    <span class="bar_btn" slot="nav-right">
      <van-icon name="wap-nav"></van-icon>
    </span>
  </div>
</template>

<script>
import { getMyChannels } from '@/api/channel'
import { getArticles } from '@/api/article'
export default {
  name: 'home-index',
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
      activeIndex: 0
    }
  },

  created () {
    this.getMyChannels()
  },
  computed: {
    // 当前频道
    activeChannel () {
      return this.myChannels[this.activeIndex]
    }
  },

  methods: {
    // 获取频道列表
    async getMyChannels () {
      const data = await getMyChannels()
      // 目前 myChannels： 频道id  频道名称
      // 扩展 myChannels： 频道id  频道名称  +文章列表 +加载中 +刷新中 +是否全部加载 +时间戳
      this.myChannels = data.channels.map(item => {
        return {
          id: item.id,
          name: item.name,
          articles: [],
          upLoading: false,
          downLoading: false,
          finished: false,
          timestamp: Date.now()
        }
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
