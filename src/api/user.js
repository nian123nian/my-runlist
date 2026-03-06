import request from '@/utils/request'

export const userApi = {
  // 登录
  login(data) {
    return request({
      url: '/user/login',
      method: 'post',
      data
    })
  },

  // 注册
  register(data) {
    return request({
      url: '/user/register',
      method: 'post',
      data
    })
  },

  // 获取用户信息
  getUserInfo(id) {
    return request({
      url: `/user/info/${id}`,
      method: 'get'
    })
  },

  // 更新用户信息
  updateUser(data) {
    return request({
      url: '/user/update',
      method: 'put',
      data
    })
  },

  // 充值
  recharge(userId, amount) {
    return request({
      url: '/user/recharge',
      method: 'post',
      params: { userId, amount }
    })
  },

  // 获取用户列表（管理员用）
  getUserList() {
    return request({
      url: '/user/list',
      method: 'get'
    })
  }
}