import request from '@/utils/request'

export const homeApi = {
  // 获取首页数据
  getHomeData() {
    return request({
      url: '/home/data',
      method: 'get'
    })
  }
}