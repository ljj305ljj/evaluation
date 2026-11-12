import { request } from '@/axios'

/**
 * 开放接口（参评人测评链路），沿用原文件名 common.js
 * 文档：EVA 福建理工大学考评系统 · 参评人开放接口文档 v1.0
 */
const common = {
  // 换取令牌（PASSWORD 模式，入参由 utils/openAuth.buildTokenPayload 构建）
  getToken: (data) => {
    return request({
      url: '/open/auth/token',
      method: 'post',
      data
    })
  },
  // 注销令牌
  deleteToken: () => {
    return request({
      url: '/open/auth/token',
      method: 'delete'
    })
  },
  // 我的测评任务列表
  getVoteTasks: () => {
    return request({
      url: '/open/eva/vote/tasks',
      method: 'get'
    })
  },
  // 我的测评进度
  getVoteProgress: (taskId) => {
    return request({
      url: `/open/eva/vote/${taskId}/progress`,
      method: 'get'
    })
  },
  // 待测评对象列表
  getVoteObjects: (taskId) => {
    return request({
      url: `/open/eva/vote/${taskId}/objects`,
      method: 'get'
    })
  },
  // 测评详情（对象信息 + 述职报告 + 题目 + 已作答回显）
  getVoteObjectDetail: (taskId, objectUserId) => {
    return request({
      url: `/open/eva/vote/${taskId}/objects/${objectUserId}`,
      method: 'get'
    })
  },
  // 提交测评答卷（submitToken 幂等；重复提交返回 400 + ALREADY_SUBMITTED）
  submitVote: (data) => {
    return request({
      url: '/open/eva/vote/submit',
      method: 'post',
      data
    })
  },
  // 本部门参评人测评进度（仅部门管理员可用，非管理员返回 400 + DEPT_ADMIN_REQUIRED；始终排除本人）
  getDeptRaters: (taskId) => {
    return request({
      url: `/open/eva/vote/${taskId}/dept-raters`,
      method: 'get'
    })
  }
}

export default common
