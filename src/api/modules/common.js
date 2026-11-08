import { request } from '@/axios'
const common = {
  login: (data) => {
    return request({
      url: '/api/User/login',
      method: 'post',
      data
    })
  },
  // 退出登录
  logout: (params) => {
    return request({
      url: '/api/User/logout',
      method: 'get',
      params
    })
  },
  // 获取用户信息
  getInfo: (params) => {
    return request({
      url: '/api/User/getInfo',
      method: 'get',
      params
    })
  },
  // 获取被考评教师列表
  teacherList: (params) => {
    return request({
      url: '/api/eva/teacherList',
      method: 'get',
      params
    })
  },
  // 获取考评卷列表
  getEvaList: (params) => {
    return request({
      url: '/api/eva/getList',
      method: 'get',
      params
    })
  },
  // 获取考评卷详情模板
  getDetailTemplate: (params) => {
    return request({
      url: '/api/eva/getDetail',
      method: 'get',
      params
    })
  },
  // 获取被考评对象列表
  getEvaItemList: (params) => {
    return request({
      url: '/api/evaItem/getList',
      method: 'get',
      params
    })
  },
  // 获取考评对象提交数据
  getVoteInfo: (params) => {
    return request({
      url: '/api/evaItem/getVoteInfo',
      method: 'get',
      params
    })
  },
  // 提交考评数据
  submitVote: (data) => {
    return request({
      url: '/api/evaItem/submitVote',
      method: 'post',
      data
    })
  },

  // 获取学院未完成考评人员列表
  getProgressData: (params) => {
    return request({
      url: '/api/eva/getProgressData',
      method: 'get',
      params
    })
  }
}

export default common
