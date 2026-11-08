import {
  getRootSize,
  setRootSize
} from '@/cache/setting'
const state = {
  rootSize: getRootSize()
}
const mutations = {
  SET_ROOTSIZE(state, rootSize) {
    state.rootSize = rootSize
    setRootSize(rootSize)
  }
}
const actions = {
  initRootSize({ state, commit }, val) {
    const rootSize = val || state.rootSize
    if (rootSize) {
      commit('SET_ROOTSIZE', rootSize)
      document.documentElement.style.fontSize = `${rootSize}px`
    }
  }
}
export default {
  namespaced: true,
  state,
  mutations,
  actions
}
