<template>
  <div class="container">
    <van-nav-bar fixed left-arrow @click-left="$router.back()" title="小智同学"></van-nav-bar>
    <div class="chat-list" ref="scollList">
      <div class="chat-item" :class="{left:item.name==='xz',right:item.name==='self'}" v-for="(item,i) in list" :key="i">
        <van-image v-if="item.name==='xz'" fit="cover" round :src="xzAvatar"/>
        <div class="chat-pao">{{item.msg}}</div>
        <van-image v-if="item.name==='self'" fit="cover" round :src="photo||'https://img.yzcdn.cn/vant/cat.jpeg'" />
      </div>
    </div>
    <div class="reply-container van-hairline--top">
      <van-field v-model="value" placeholder="说点什么..." @keyup.enter="send()">
        <span @click="send()" slot="button" style="font-size:12px;color:#999">提交</span>
      </van-field>
    </div>
  </div>
</template>

<script>
import xzAvatar from '../../assets/images/xz.png'
import { mapState } from 'vuex'
import io from 'socket.io-client'
export default {
  name: 'user-chat',
  data () {
    return {
      xzAvatar,
      value: '',
      // 小智说话：{name:'xz',msg:''}
      // 自己说话：{name:'self',msg:''}
      // 聊天记录
      list: [],
      socketio: null
    }
  },

  created () {
    // 建立连接
    this.socketio = io('http://ttapi.research.itcast.cn', {
      query: {
        token: this.user.token
      }
    })
    // 小智同学 默认在连接成功后 发一条消息(模拟) 必须时connect
    this.socketio.on('connect', () => {
      // 建了链接后默认  小智给你打招呼
      this.list.push({ name: 'xz', msg: '你好' })
    })
    // 绑定接受消息的事件
    this.socketio.on('message', (data) => {
      this.list.push({ name: 'xz', msg: data.msg })
      this.scrollBottom()
    })
  },
  // 销毁组件前 关闭连接
  beforeDestroy () {
    // this.socket.close()
    this.socketio.connected = false
    console.log(this.socketio)
  },
  computed: {
    ...mapState(['photo', 'user'])
  },
  methods: {
    // 有新消息时,滚动条滚动到最底部
    scrollBottom () {
      // 获取滚动容器，获取可以滚动的高度，设置给scrollTop
      this.$nextTick(() => {
        this.$refs.scollList.scrollTop = this.$refs.scollList.scrollHeight // 可以滚动的高度
      })
    },
    send () {
      if (!this.value) return false
      // 使用socketio发送信息
      this.socketio.emit('message', { msg: this.value, timestamp: Date.now() })
      // 存入聊天记录
      this.list.push({ name: 'self', msg: this.value })
      this.value = ''
      this.scrollBottom()
    }
  }
}
</script>

<style scoped lang='less'>
.container {
  height: 100%;
  width: 100%;
  position: absolute;
  left: 0;
  top: 0;
  box-sizing: border-box;
  background:#fafafa;
  padding: 46px 0 50px 0;
  .chat-list {
    height: 100%;
    overflow-y: scroll;
    .chat-item{
      padding: 10px;
      .van-image{
        vertical-align: top;
        width: 40px;
        height: 40px;
      }
      .chat-pao{
        vertical-align: top;
        display: inline-block;
        min-width: 40px;
        max-width: 70%;
        min-height: 40px;
        line-height: 38px;
        border: 0.5px solid #c2d9ea;
        border-radius: 4px;
        position: relative;
        padding: 0 10px;
        background-color: #e0effb;
        word-break: break-all;
        font-size: 14px;
        color: #333;
        &::before{
          content: "";
          width: 10px;
          height: 10px;
          position: absolute;
          top: 12px;
          border-top:0.5px solid #c2d9ea;
          border-right:0.5px solid #c2d9ea;
          background: #e0effb;
        }
      }
    }
  }
}
.chat-item.right{
  text-align: right;
  .chat-pao{
    margin-left: 0;
    margin-right: 15px;
    &::before{
      right: -6px;
      transform: rotate(45deg);
    }
  }
}
.chat-item.left{
  text-align: left;
  .chat-pao{
    margin-left: 15px;
    margin-right: 0;
    &::before{
      left: -5px;
      transform: rotate(-135deg);
    }
  }
}
.reply-container {
  position: fixed;
  left: 0;
  bottom: 0;
  height: 44px;
  width: 100%;
  background: #f5f5f5;
  z-index: 9999;
}
</style>
