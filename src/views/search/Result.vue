<template>
  <div class="container">
    <van-nav-bar title="搜索结果" left-arrow @click-left="$router.back()" />
    <!-- 文章列表 -->
    <van-list v-model="loading" @load="onLoad" :finished="finished" finished-text="没有更多了">
      <van-cell-group>
        <van-cell :to="{name:'article',params:{id:item.art_id.toString()}}" v-for="item in articles" :key="item.art_id.toString()">
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
              <span>{{item.comm_count}}</span>
              <span>{{item.pubdate|realTime}}</span>
            </div>
          </div>
        </van-cell>
      </van-cell-group>
    </van-list>
  </div>
</template>

<script>
import { searchArticles } from '@/api/article'
export default {
  name: 'search-result',
  data () {
    return {
      loading: false,
      finished: false,
      // 查询条件
      reqParams: {
        page: 1,
        q: this.$route.query.q
      },
      // 文章列表
      articles: []
    }
  },
  methods: {
    // 加载数据
    async onLoad () {
      const data = await searchArticles(this.reqParams)
      this.articles.push(...data.results)
      // 结束加载中效果
      this.loading = false
      // 加载下一页 page自增
      if (data.results.length) {
        this.reqParams.page++
      } else {
        this.finished = true
      }
    }
  }
}
</script>

<style scoped lang='less'>
.container {
  height: 100%;
  overflow-y: auto;
  box-sizing: border-box;
}
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
      height: 180px;
      width: 100%;
    }
  }
  .info_box {
    color: #999;
    line-height: 2;
    position: relative;
    span {
      padding-right: 10px;
    }
  }
}</style>
