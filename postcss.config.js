module.exports = {
  plugins: {
    'postcss-pxtorem': {
      rootValue: 39.3, // 设计稿宽度的1/10,表示根元素字体大小
      propList: ['*'], // 需要做转化处理的属性，如`hight`、`width`、`margin`等，`*`表示全部
      unitPrecision: 5, // 允许REM单位增长到的十进制数字
      selectorBlackList: ['padding', 'margin', 'border'], // 将哪些html元素排除在外，
      replace: true, // 替换包含rems的规则
      minPixelValue: 0 // 最小的转化单位
      // exclude: /node_modules/i//要忽略并保留为px的文件路径
    }
  }
}
