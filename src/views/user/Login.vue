<template>
  <div class="container">
    <van-nav-bar left-arrow @click-left="$router.back()" title="登录"></van-nav-bar>
    <!-- 单元格 -->
    <van-cell-group>
      <!-- 输入框 -->
      <van-field @blur="checkMobile" :error-message="errMsg.mobile" v-model="loginForm.mobile" label="手机号" placeholder="请输入手机号" />
      <van-field @blur="checkCode" :error-message="errMsg.code" v-model="loginForm.code" label="验证码" placeholder="请输入验证码">
        <van-button class="p5" slot="button" size="mini" type="primary">发送验证码</van-button>
      </van-field>
    </van-cell-group>
    <div class="btn_box">
      <van-button type="info" @click="submitLogin" block round>登 录</van-button>
    </div>
  </div>
</template>

<script>
import { login } from '@/api/user'
import { mapMutations } from 'vuex'
export default {
  name: 'login',
  data () {
    return {
      // 表单数据
      loginForm: {
        mobile: '13911111111',
        code: '246810'
      },
      // 错误提示
      errMsg: {
        mobile: '',
        code: ''
      }
    }
  },
  // 单个表单元素 当失去焦点的时候，获取当前输入框的值，进行校验，如果失败给error-message赋值，如果成功，清空值。
  methods: {
    checkMobile () {
      const value = this.loginForm.mobile
      // 1. 非空
      if (!value) {
        // 提示
        this.errMsg.mobile = '请输入手机号'
        return false
      }
      // 2. 格式
      if (!/^1[3-9]\d{9}$/.test(value)) {
        // 提示
        this.errMsg.mobile = '请输入正确手机号'
        return false
      }
      // 3. 成功
      this.errMsg.mobile = ''
    },
    checkCode () {
      const value = this.loginForm.code
      // 1. 非空
      if (!value) {
        // 提示
        this.errMsg.code = '请输入验证码'
        return false
      }
      // 2. 格式
      if (!/^\d{6}$/.test(value)) {
        // 提示
        this.errMsg.code = '请输入6个数字'
        return false
      }
      // 3. 成功
      this.errMsg.code = ''
    },
    // 进行整体表单的校验  当点击登录的时候
    // 调用 checkMobile checkCode 后
    // 判断成功的标准：errMsg中没有错误信息
    async submitLogin () {
      this.checkMobile()
      this.checkCode()
      // 判断 errMsg 中没有任何错误信息 代表成功
      if (this.errMsg.mobile || this.errMsg.code) {
        return false
      }
      try {
        // 校验完毕  进行登录
        // 1. 封装一个登录的API 在api目录user模块
        // 2. 在当前组件下导入
        // 3. 调用函数发请求
        const data = await login(this.loginForm)
        // 登录成功
        // 1. 更新vuex和本地存储的token相关的数据
        this.setUser(data)
        // 2. 回跳 （地址栏有回跳地址，根据地址跳转，如果没有，默认个人中心）
        // 回跳地址  this.$route.query.redirectUrl
        // 个人中心的地址  /user
        // | 或  || 短路或   & 与  &&短路与
        this.$router.push(this.$route.query.redirectUrl || '/user')
      } catch (e) {
        // 错误提示
        this.$toast.fail('手机号或验证码错误')
      }
    },
    ...mapMutations(['setUser'])
  }
}
</script>

<style scoped lang='less'>
.p5{
  padding: 0 5px;
}
.btn_box{
  padding: 10px;
  .van-button{
    height: 32px;
    line-height: 30px;
  }
}
</style>
