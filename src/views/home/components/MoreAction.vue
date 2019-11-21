<template>
  <!-- 弹出框  默认隐藏 -->
  <van-popup :value="value" @input="$emit('input',$event)" @open="isReport=false">
    <van-cell-group v-if="!isReport">
      <van-cell @click="disLikes">不感兴趣</van-cell>
      <van-cell is-link @click="isReport=true">反馈垃圾内容</van-cell>
      <van-cell>拉黑作者</van-cell>
    </van-cell-group>
    <van-cell-group v-else>
      <van-cell icon="arrow-left"  @click="isReport=false">返回</van-cell>
      <van-cell v-for="item in reports" :key="item.value" @click="report(item.value)">{{item.label}}</van-cell>
    </van-cell-group>
  </van-popup>
</template>

<script>
import { disLikes, report } from '@/api/article.js'
import { reports } from '@/api/constants/constants.js'
export default {
  // props: ['value'],
  props: {
    value: {
      type: Boolean,
      default: false
    },
    // 当前点击文章ID
    articleId: {
      type: String,
      default: null
    }
  },
  data () {
    return {
      // 默认状态 未点击举报
      isReport: false,
      // 举报类型
      reports
    }
  },
  methods: {
    async disLikes () {
      try {
        // 1、获取文章的ID
      // 2、发请求进行不感兴趣的操作
        await disLikes(this.articleId)
        // 3、提示信息
        this.$toast.success('操作成功')
        // 4、通知父组件 关闭对话框
        this.$emit('input', false)
        // 5、通知父组件 当前文章列表删除文章
        this.$emit('on-dislikes')
      } catch (error) {
        this.$toast.fail('操作失败')
      }
    },
    // 举报
    async report (type) {
      try {
        // 1、文章ID
        // 2、发请求举报
        await report(this.articleId, type)
        // 3、提示
        this.$toast.success('举报成功')
        // 4、通知父组件 关闭对话框
        this.$emit('input', false)
        // 5、通知父组件 当前文章列表删除文章
        this.$emit('on-report')
      } catch (error) {
        if (error.response && error.response.status === 409) {
          return this.$toast.fail('已经举报')
        }
        this.$toast.fail('举报失败')
      }
    }
  }
}
</script>

<style scoped lang='less'>
.van-popup {
  width: 80%;
  border-radius: 4px;
}
</style>
