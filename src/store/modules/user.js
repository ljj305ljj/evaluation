import api from '@/api'
import {
  setToken,
  removeToken,
  getToken,
  clearStorage,
  getUserInfo,
  setUserInfo,
  setLoginForm,
  getLoginForm,
  setHomeInfo,
  getHomeInfo
} from '@/cache/user'
import router from '@/router'
import { Toast } from 'vant'
import { buildTokenPayload } from '@/utils/openAuth'

const state = {
  token: getToken(),
  userInfo: getUserInfo(), // 换取令牌接口返回的用户信息（nickName/deptName 等）
  loginForm: getLoginForm(),
  homeInfo: getHomeInfo()
}
const mutations = {
  SET_TOKEN: (state, token) => {
    state.token = token
    setToken(token)
  },
  SET_USERINFO: (state, userInfo) => {
    state.userInfo = userInfo
    setUserInfo(userInfo)
  },
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
  // PASSWORD 模式：工号 + 口令（RSA 加密）+ 签名，换取开放接口 JWT
  login({ commit }, loginForm) {
    return new Promise((resolve, reject) => {
      Toast.loading({
        message: '登录中...',
        forbidClick: true,
        duration: 0
      })
      api.common.getToken(buildTokenPayload(loginForm)).then(res => {
        Toast.clear()
        if (res && res.token) {
          commit('SET_TOKEN', res.token)
          commit('SET_USERINFO', {
            userId: res.userId,
            username: res.username,
            nickName: res.nickName,
            deptName: res.deptName,
            postRoleCode: res.postRoleCode, // 岗位角色编码（TEACHER 受"优秀不超过2/3"限制）
            postRoleName: res.postRoleName
          })
          resolve(res)
        } else {
          Toast('登录失败，请稍后重试')
          reject(new Error('登录响应缺少 token'))
        }
      }).catch(error => {
        Toast.clear()
        reject(error)
      })
    })
  },
  // callApi=false：令牌已失效等场景，仅清本地状态，不再调用注销接口
  logout({ commit }, { callApi = true } = {}) {
    if (callApi && getToken()) {
      api.common.deleteToken().catch(() => {})
    }
    commit('SET_TOKEN', '')
    removeToken()
    clearStorage()
    router.replace('/login')
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
