<template>
  <!-- @closed="editing=false" 关闭屉式菜单  重置编辑状态为不编辑 -->
  <van-action-sheet
    :value="value"
    @closed="editing=false"
    @input="$emit('input', $event)"
    title="编辑频道"
  >
    <div class="channel">
      <div class="tit">
        我的频道：
        <span class="tip">点击可进入频道</span>
        <van-button v-if="!editing" @click="editing=true" size="mini" type="info" plain>编辑</van-button>
        <van-button v-else @click="editing=false" size="mini" type="danger" plain>完成</van-button>
      </div>
      <van-grid class="van-hairline--left">
        <van-grid-item v-for="(item,index) in myChannels" :key="item.id">
          <span class="f12" :class="{red:activeIndex===index}" @click="enterChannel(index)">{{item.name}}</span>
          <van-icon v-show="editing && index!==0" class="btn" name="cross"></van-icon>
        </van-grid-item>
      </van-grid>
    </div>
    <div class="channel">
      <div class="tit">可选频道：</div>
      <van-grid class="van-hairline--left">
        <van-grid-item v-for="item in optionalChannels" :key="item.id">
          <span class="f12">{{item.name}}</span>
          <van-icon class="btn" name="plus"></van-icon>
        </van-grid-item>
      </van-grid>
    </div>
  </van-action-sheet>
</template>

<script>
import { getAllChannels } from '@/api/channel'
export default {
  props: {
    // 控制显示与隐藏
    value: {
      type: Boolean,
      default: false
    },
    // 我的频道数据
    myChannels: {
      type: Array,
      default: () => []
    },
    // 当前频道激活索引
    activeIndex: {
      type: Number,
      default: 0
    }
  },

  data () {
    return {
      // 默认是未编辑状态
      editing: false,
      // 全部频道
      allChannels: []
    }
  },
  computed: {
    // 可选频道
    optionalChannels () {
      // 公式： 可选频道 = 全部频道 - 我的频道
      // 遍历全部频道，遍历过程中：
      // 根据当前频道的ID去我的频道中找：
      // 如果找到了 false，就不是可选频道，抛弃。不放到新数组中
      // 如果没找到 true，就是可选频道，留下。放到新数组中
      // this.allChannels.filter(item => '布尔类型的值')
      return this.allChannels.filter(item => this.myChannels.findIndex(myItem => myItem.id === item.id) === -1)
    }
  },
  created () {
    // 获取全部数据
    this.getAllChannels()
  },
  methods: {
    // 获取全部数据
    async getAllChannels () {
      const data = await getAllChannels()
      this.allChannels = data.channels
    },

    // 进入频道
    enterChannel (index) {
      // index 就是当前你需要去激活的频道的索引
      // 父组件才能去激活频道，tabs组件是父组件控制
      // 把index数据传递给父组件，修改activeIndex的值 即可。
      // update是给activeIndex传值   activeIndex是标识
      this.$emit('update:activeIndex', index)
      // 关闭对话框
      this.$emit('input', false)
    }
  }
}
</script>

<style scoped lang='less'>
.van-popup--bottom {
  &.van-popup--round {
    border-radius: 0;
  }
}
.van-action-sheet {
  max-height: 100%;
  height: 100%;
  .van-action-sheet__header {
    background: #3296fa;
    color: #fff;
    .van-icon-close {
      color: #fff;
    }
  }
}
.channel {
  padding: 10px;
  .tit {
    line-height: 3;
    .tip {
      font-size: 10px;
      color: #999;
    }
  }
  .van-button {
    float: right;
    margin-top: 7px;
  }
  .btn {
    position: absolute;
    bottom: 0;
    right: 0;
    background: #ddd;
    font-size: 12px;
    color: #fff;
  }
  .f12 {
    font-size: 12px;
    color: #555;
  }
  .red {
    color: red;
  }
}
</style>
