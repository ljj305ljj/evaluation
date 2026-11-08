import api from '@/api'
import {
  setToken,
  removeToken,
  getToken,
  clearStorage,
  // getUserInfo,
  // setUserInfo,
  setLoginForm,
  getLoginForm,
  setHomeInfo,
  getHomeInfo
} from '@/cache/user'
import router from '@/router'
import { Toast } from 'vant'
const state = {
  // userInfo: getUserInfo(), // 用户登录返回信息
  token: getToken(),
  loginForm: getLoginForm(), // 登录帐号和密码
  homeInfo: getHomeInfo() // 获取考核表信息
}
const mutations = {
  SET_TOKEN: (state, token) => {
    state.token = token
    setToken(token)
  },
  // SET_USERINFO: (state, userInfo) => {
  //   state.userInfo = userInfo
  //   setUserInfo(userInfo)
  // },
  SET_LOGINFORM: (state, loginForm) => {
    state.loginForm = loginForm
    setLoginForm(loginForm)
  },
  SET_HOMEINFO: (state, homeInfo) => {
    state.homeInfo = homeInfo
    setHomeInfo(homeInfo)
  }
}
const actions = {
  login({ commit }, loginForm) {
    return new Promise((resolve, reject) => {
      Toast.loading({
        message: '登录中...',
        forbidClick: true,
        duration: 0
      })
      api.common.login(loginForm).then(res => {
        Toast.clear()
        if (res.code === 1) {
          res.data && commit('SET_TOKEN', res.data.token)
          // commit('SET_USERINFO', res.user)
          resolve(res)
        } else {
          Toast(res.msg)
          reject(res.msg)
        }
      }).catch(error => {
        Toast.clear()
        reject(error)
        removeToken()
      })
    })
  },
  logout({ commit }) {
    commit('SET_TOKEN', '')
    removeToken()
    router.replace('/login')
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
