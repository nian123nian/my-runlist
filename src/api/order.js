import request from '@/utils/request'

export const orderApi = {
  // 获取用户的订单列表
  getUserOrders(userId) {
    return request({
      url: `/order/user/${userId}`,
      method: 'get'
    })
  },

  // 获取骑手的订单列表
  getRiderOrders(riderId) {
    return request({
      url: `/order/rider/${riderId}`,
      method: 'get'
    })
  },

  // 获取订单详情
  getOrderDetail(orderId) {
    return request({
      url: `/order/detail/${orderId}`,
      method: 'get'
    })
  },

  // 取消订单
  cancelOrder(orderId, userId) {
    return request({
      url: '/order/cancel',
      method: 'post',
      params: { orderId, userId }
    })
  },

  // 骑手接单
  acceptOrder(orderId, riderId) {
    return request({
      url: '/order/accept',
      method: 'post',
      params: { orderId, riderId }
    })
  },

  // 完成订单
  completeOrder(orderId, riderId) {
    return request({
      url: '/order/complete',
      method: 'post',
      params: { orderId, riderId }
    })
  }
}