const getters = {
  token: state => state.user.token,
  userInfo: state => state.user.userInfo,
  loginForm: state => state.user.loginForm,
  rootSize: state => state.setting.rootSize,
  homeInfo: state => state.user.homeInfo
}
export default getters
