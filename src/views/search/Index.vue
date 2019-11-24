<template>
  <div class='container'>
    <van-nav-bar title="搜索中心" left-arrow @click-left="$router.back()" />
    <van-search v-model.trim="q" placeholder="请输入搜索关键词" shape="round" @search="onSearch"/>

    <!-- 联想词条 -->
    <van-cell-group class="suggest-box" v-if="q">
      <van-cell @click="onSearch(item.replace(`<span>${q}</span>`,q))" icon="search" v-for="item in options" :key="item">
        <p v-html="item"></p>
      </van-cell>
    </van-cell-group>

    <!-- 历史记录 -->
    <div class="history-box" v-else-if="historyList.length">
      <div class="head">
        <span>历史记录</span>
        <van-icon @click="clearHistory()" name="delete"></van-icon>
      </div>
      <van-cell-group>
        <van-cell v-for="key in historyList" :key="key">
          <a @click="toSearch(key)" class="word_btn">{{key}}</a>
          <van-icon @click="delHistory(key)" class="close_btn" slot="right-icon" name="cross" />
        </van-cell>
      </van-cell-group>
    </div>
  </div>
</template>

<script>
import { suggest } from '@/api/article'
// import { suggest } from '@/api/article'
// 约定本地存储的key     hm-toutiao-mobile-history
const KEY = 'hm-toutiao-mobile-history'
export default {
  name: 'search-index',
  data () {
    return {
      // 搜索关键字
      q: '',
      // 历史记录列表
      historyList: JSON.parse(window.localStorage.getItem(KEY) || '[]'),
      // 词条数据
      options: [],
      // 计时器
      timer: null

    }
  },
  watch: {
    q () {
      if (!this.q) {
        window.clearTimeout(this.timer)
        return false
      }
      window.clearTimeout(this.timer)
      this.timer = window.setTimeout(async () => {
        const data = await suggest(this.q)
        this.options = data.options.map(item => {
          return item.toLowerCase().replace(this.q, `<span>${this.q}</span>`)
        })
      }, 200)
    }
  },
  methods: {
    // 根据输入框信息搜索
    onSearch (key) {
      if (!key.trim()) return false
      // 存储搜索历史(key不能重复) 使用set集合
      const keySet = new Set(this.historyList)
      keySet.add(key)
      this.historyList = Array.from(keySet) // 或者 [...keySet]
      // 存储在本地  需要的是数组格式
      window.localStorage.setItem(KEY, JSON.stringify(this.historyList))
      // 跳转搜索结果
      this.$router.push({ path: '/search/result', query: { q: key } })
    },
    // 删除历史记录
    delHistory (key) {
      const index = this.historyList.findIndex(item => item === key)
      this.historyList.splice(index, 1)
      window.localStorage.setItem(KEY, JSON.stringify(this.historyList))
    },
    // 清空历史记录
    clearHistory () {
      this.historyList = []
      window.localStorage.setItem(KEY, JSON.stringify(this.historyList))
    },
    // 根据历史记录去搜索
    toSearch (key) {
      this.$router.push({ path: '/search/result', query: { q: key } })
    }
  }
}
</script>

<style scoped lang='less'>
.history-box {
  padding: 0 20px;
  .head {
    line-height: 36px;
    color: #999;
    .van-icon {
      font-size: 16px;
      float: right;
      margin-top: 10px;
    }
  }
  .van-cell {
    padding: 10px 0;
  }
  .word_btn {
    color: #3296fa;
  }
  .close_btn {
    margin-top: 5px;
    color: #999;
  }
}
.suggest-box{
  /deep/ .van-cell{
    padding: 10px 20px;
    color: #999;
    p{
      span{
        color: red;
      }
    }
  }
}
</style>
