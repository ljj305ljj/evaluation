import axios from 'axios'
import store from '@/store'
import { TokenKey } from '@/cache/user'
import { Toast } from 'vant'
// Toast.allowMultiple()// 允许同时存在多个 Toast
export const RESPONSE_CODE = {
  SUCCESS: 200,
  TOKEN_FAIL: 401,
  ERROR: 404,
  FAIL: 500
}
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
    token && (config.headers[TokenKey] = token)
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
    const { config, data } = response
    clearTimeout(config.timer)
    config.timer = null
    config.loadingToast && config.loadingToast.clear()
    if (data.code === 10001) {
      store.dispatch('user/logout')
      Toast('请重新登录')
      return Promise.reject(data)
    } else {
      return Promise.resolve(data)
    }
  },
  async error => {
    const { response, config, code } = error
    clearTimeout(config.timer)
    config.timer = null
    config.loadingToast && config.loadingToast.clear()
    let msg = 'Error'
    switch (code) {
      case 'ERR_BAD_REQUEST':
      case 'ERR_BAD_RESPONSE':
        const { status, data } = response
        if (status == RESPONSE_CODE.TOKEN_FAIL) {
          msg = data.message || '请重新登录'
          store.dispatch('user/logout')
        } else if (status == RESPONSE_CODE.ERROR) {
          msg = data.message || '网络请求不存在'
        } else if (status == RESPONSE_CODE.FAIL) {
          msg = data.message || '网络请求错误'
        } else {
          msg = error.message || '请求失败'
        }
        break
      case 'ERR_NETWORK':
        msg = '当前无网络，请检查配置'
        store.dispatch('user/logout')
        break
      case 'ECONNABORTED':
        msg = `请求超时，请重试`
        break
      default:
        msg = error.message || '请求失败'
    }
    Toast(msg)
    return Promise.reject(data)
  }
)

export {
  request
}
