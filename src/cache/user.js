import Cookies from 'js-cookie'
import Storage from 'good-storage'
const UserInfoKey = 'userInfo' // 用户信息
const HomeInfoKey = 'homeInfo' // 考核表信息
export const TokenKey = 'token' // 设置token名称
export const getToken = () => Cookies.get(TokenKey)// 获取token
export const setToken = (token) => Cookies.set(TokenKey, token, { expires: 7 })// 保存token
export const removeToken = () => { Cookies.remove(TokenKey) } // 删除token
export const getUserInfo = () => Storage.get(UserInfoKey) // 获取登录信息
export const setUserInfo = (userInfo) => Storage.set(UserInfoKey, userInfo) // 保存登录信息
export const getLoginForm = () => Cookies.get('loginForm') // 获取登录信息
export const setLoginForm = (loginForm) => Cookies.set('loginForm', loginForm, { expires: 7 }) // 保存登录信息
export const getHomeInfo = () => Storage.get(HomeInfoKey) // 获取考核表信息
export const setHomeInfo = (homeInfo) => Storage.set(HomeInfoKey, homeInfo) // 保存考核表信息
export const clearStorage = () => Storage.clear() // 清除所有缓存
