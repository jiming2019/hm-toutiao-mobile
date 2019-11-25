module.exports = {
// vueCLI默认打包后的代码，必须以服务器方式运行
// 也可以通过publicPath来改变这个默认情形
  publicPath: './',
  // 覆盖vant的主体蓝色
  css: {
    loaderOptions: {
      less: {
        // 配置覆盖变量的选项
        modifyVars: {
          blue: '#3296fa'
        }
      }
    }
  }
}
