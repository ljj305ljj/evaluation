import axios from 'axios'
import store from '@/store'
import { Toast } from 'vant'

/**
 * 开放接口（/api/open/**）专用实例（沿用原文件名 src/axios/index.js）
 * 与旧版（自定义 token 请求头）的差异：
 * - 鉴权：Authorization: Bearer {token}
 * - 成功响应无业务码包装，直接返回数据
 * - 错误通过 HTTP 状态码 + { status, code, message } 表达
 * - baseURL 取 VUE_APP_BASE_API：开发环境 '/api' 由 devServer 代理转发到 VUE_APP_BASE_URL，避免跨域
 */
const request = axios.create({
  baseURL: process.env.VUE_APP_BASE_API,
  timeout: 10000
})

// request拦截器
request.interceptors.request.use(
  (config) => {
    const token = store.getters.token
    token && (config.headers.Authorization = `Bearer ${token}`)
    return config
  },
  (error) => Promise.reject(error)
)

// response拦截器
request.interceptors.response.use(
  (response) => Promise.resolve(response.data),
  (error) => {
    const { response } = error
    let msg = '请求失败'
    if (response) {
      const { status, data } = response
      msg = (data && data.message) || msg
      if (status === 401) {
        // 令牌失效，清登录态回登录页（不再调用注销接口）
        store.dispatch('user/logout', { callApi: false })
      }
    } else if (error.code === 'ECONNABORTED') {
      msg = '请求超时，请重试'
    } else if (error.code === 'ERR_NETWORK') {
      msg = '当前无网络，请检查配置'
    }
    Toast(msg)
    // 业务错误时把 { status, code, message } 抛给页面处理（如 ALREADY_SUBMITTED）
    return Promise.reject(response ? response.data : error)
  }
)

export { request }
