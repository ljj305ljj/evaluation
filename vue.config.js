const path = require('path')
const resolve = (dir) => path.join(__dirname, dir)
const CompressionWebpackPlugin = require('compression-webpack-plugin') // 开启gzip压缩
const productionGzipExtensions = /\.(js|css|json|txt|html|ico|svg)(\?.*)?$/i // 开启gzip压缩
const isProduction = ['production'].includes(process.env.NODE_ENV)
const TerserPlugin = require('terser-webpack-plugin')
module.exports = {
  publicPath: './', // 基本路径
  indexPath: 'index.html', // 相对于打包路径index.html的路径
  outputDir: 'mobile', // 输出文件目录
  lintOnSave: false, // eslint-loader 是否在保存的时候检查
  assetsDir: 'static', // 放置生成的静态资源 (js、css、img、fonts) 的 (相对于 outputDir 的) 目录。
  // 是否使用包含运行时编译器的 Vue 构建版本。设置为 true 后你就可以在 Vue 组件中使用 template 选项了，但是这会让你的应用额外增加 10kb 左右。
  runtimeCompiler: true,
  productionSourceMap: false, // 生产环境关闭 source map
  // parallel: require('os').cpus().length > 1, // 是否为 Babel 或 TypeScript 使用 thread-loader。该选项在系统的 CPU 有多于一个内核时自动启用，仅作用于生产构建。
  pwa: {},
  configureWebpack: (config) => {
    const plugins = []
    if (isProduction) {
      // 开启gzip压缩
      plugins.push(
        new CompressionWebpackPlugin({
          algorithm: 'gzip', // 采用的压缩算法
          test: productionGzipExtensions, // 哪些文件需要压缩
          threshold: 10240, // 设置文件多大开始压缩
          minRatio: 0.8 // 至少压缩的比例
        })
      )
      plugins.push(
        new TerserPlugin({
          terserOptions: {
            compress: {
              warnings: false,
              drop_console: true,
              drop_debugger: false,
              pure_funcs: ['console.log'] // 移除console
            }
          }
        })
      )
    }
    config.plugins = [...config.plugins, ...plugins]
  },
  chainWebpack: (config) => {
    // 修复热更新失效
    config.resolve.symlinks(true)
    // 修改文件引入自定义路径
    config.resolve.alias.set('@', resolve('src'))
    config.plugin('html').tap((args) => {
      args[0].title = '福建理工大学中层干部学年度考评系统'
      return args
    })
  },
  css: {
    extract: isProduction,
    requireModuleExtension: true,
    sourceMap: false,
    loaderOptions: {
      scss: {
        prependData: '@import "~@/styles/index.scss";'
      }
    }
  },
  devServer: {
    port: 8081,
    open: false, // 配置自动启动浏览器
    hot: true, // 热更新
    proxy: {
      [process.env.VUE_APP_BASE_API]: {
        target: `${process.env.VUE_APP_BASE_URL}`,
        changeOrigin: true,
        ws: true,
        pathRewrite: {
          [`^${process.env.VUE_APP_BASE_API}`]: ``
        }
      }
    }
  }
}
