const state = {
  cachedViews: []
}
const mutations = {
  ADD_CACHED_VIEW: (state, view) => {
    if (state.cachedViews.includes(view.name)) return
    if (view.meta.keepAlive) {
      state.cachedViews.push(view.name)
    }
  },
  DEL_CACHED_VIEW: (state, viewName) => {
    const index = state.cachedViews.indexOf(viewName)
    index > -1 && state.cachedViews.splice(index, 1)
  },
  DEL_ALL_CACHED_VIEWS: state => {
    state.cachedViews = []
  }
}
const actions = {}
export default {
  namespaced: true,
  state,
  mutations,
  actions
}
