import axios from 'axios'
import { Message } from 'element-ui'
import router from '@/router'

const request = axios.create({
  baseURL: 'http://localhost:8081/api',  // 直接写完整后端地址
  // baseURL: '/api',  // 如果用了 proxy 才用这个
  timeout: 10000
})

// 请求拦截器 - 每次请求都会自动执行
request.interceptors.request.use(
  config => {
    // 从 localStorage 读取 token
    const token = localStorage.getItem('token')
    
    // 如果 token 存在，添加到请求头
    if (token) {
      config.headers['token'] = token  // 根据后端要求修改字段名
      config.headers['Authorization'] = `Bearer ${token}` // 另一种常见格式
      
      console.log('请求携带token:', token)
    }
    
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    // 如果返回 401，说明 token 无效或过期
    if (error.response && error.response.status === 401) {
      Message.error('登录已过期，请重新登录')
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
      router.push('/login')
    } else {
      Message.error('网络错误，请稍后重试')
    }
    return Promise.reject(error)
  }
)

export default request