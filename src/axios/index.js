import axios from 'axios'
import store from '@/store'
import { Toast } from 'vant'
// Toast.allowMultiple()// 允许同时存在多个 Toast
export const RESPONSE_CODE = {
  SUCCESS: 200,
  TOKEN_FAIL: 401,
  ERROR: 404,
  FAIL: 500
}
/**
 * 开放接口（/api/open/**）专用实例（沿用原文件名 src/axios/index.js）
 * 与旧版（自定义 token 请求头）的差异：
 * - 鉴权：Authorization: Bearer {token}
 * - 成功响应无业务码包装，直接返回数据
 * - 错误通过 HTTP 状态码 + { status, code, message } 表达
 * - baseURL 取 VUE_APP_BASE_API：开发环境 '/sys' 由 devServer 代理转发到 VUE_APP_BASE_URL，避免跨域
 */
const request = axios.create({
  baseURL: process.env.VUE_APP_BASE_API,
  withCredentials: true,
  timeout: 10000 // 设置超时时间
})
// request拦截器
request.interceptors.request.use(
  config => {
    const token = store.getters.token
    // console.log('token:', token)
    token && (config.headers.Authorization = `Bearer ${token}`)
    // 超过一秒的请求才出现Toast
    // config.timer = setTimeout(() => {
    //   config.loadingToast = Toast.loading({
    //     message: '加载中...',
    //     forbidClick: true,
    //     duration: 0
    //   })
    // }, 1000)
    return config
  },
  error => {
    const { config } = error
    clearTimeout(config.timer)
    config.timer = null
    config.loadingToast && config.loadingToast.clear()
    return Promise.reject(error)
  }
)

// respone拦截器
request.interceptors.response.use(
  async response => {
    const { config } = response
    clearTimeout(config.timer)
    config.timer = null
    config.loadingToast && config.loadingToast.clear()
    // 开放接口成功响应无业务码包装，直接返回数据体
    return Promise.resolve(response.data)
  },
  async error => {
    const { response, config, code } = error
    clearTimeout(config.timer)
    config.timer = null
    config.loadingToast && config.loadingToast.clear()
    let msg = 'Error'
    switch (code) {
      case 'ERR_BAD_REQUEST':
      case 'ERR_BAD_RESPONSE': {
        const { status, data } = response
        if (status === RESPONSE_CODE.TOKEN_FAIL) {
          // 令牌失效，清登录态回登录页（不再调用注销接口）
          store.dispatch('user/logout', { callApi: false })
          msg = (data && data.message) || '请重新登录'
        } else if (status === RESPONSE_CODE.ERROR) {
          msg = (data && data.message) || '网络请求不存在'
        } else if (status === RESPONSE_CODE.FAIL) {
          msg = (data && data.message) || '网络请求错误'
        } else {
          msg = (data && data.message) || '请求失败'
        }
        break
      }
      case 'ERR_NETWORK':
        msg = '当前无网络，请检查配置'
        break
      case 'ECONNABORTED':
        msg = '请求超时，请重试'
        break
      default:
        msg = (error && error.message) || '请求失败'
    }
    // 延迟到下一个宏任务再弹提示：页面 catch 中的 $toast.clear()（清"加载中"）
    // 会先于本提示执行，若同步弹出会被其一并清掉，导致错误提示"显示后秒消失"
    setTimeout(() => Toast(msg), 0)
    // 业务错误时把 { status, code, message } 抛给页面处理（如 ALREADY_SUBMITTED）
    return Promise.reject(response ? response.data : error)
  }
)

export {
  request
}
