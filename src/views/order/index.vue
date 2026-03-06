<template>
  <div class="order-page">

    <!-- 顶部导航 -->
    <div class="header">
      <!-- 点击调用$router.back()返回上一页 -->
      <i class="el-icon-arrow-left" @click="$router.back()"></i>
      <span style="text-align: center;">我的订单</span>
      <!-- 更多操作图标，点击时显示更多菜单 -->
      <i class="el-icon-more" @click="showMoreMenu"></i>
    </div>

    <!-- 状态标签 - 修复key值的问题 -->
    <div class="tabs">
      <!-- v-for循环遍历tabs数组生成每一个状态标签 -->
      <div class="tab-item" v-for="tab in tabs" :key="'tab-' + tab.value" :class="{ active: currentTab === tab.value }"
        @click="switchTab(tab.value)">
        {{ tab.label }}
      </div>
    </div>

    <!-- 加载状态 v-if="loading"为true时显示加载中-->
    <div class="loading-state" v-if="loading">
      <i class="el-icon-loading"></i>
      <p>加载中...</p>
    </div>

    <!-- 订单列表 - 修复key -->
    <div class="order-list-container" v-else-if="orders.length > 0">
      <div class="order-item" v-for="order in filteredOrders" :key="'order-' + order.id" @click="goToDetail(order.id)">
        <!-- 订单头部 -->
        <div class="order-header">
          <div class="order-type-tag">
            <span class="order-type">{{ getOrderType(order.goodsType) }}</span>
            <span class="order-status" :class="'status-' + order.status">{{ getStatusText(order.status) }}</span>
          </div>
          <span class="order-price">¥{{ order.amount }}</span>
        </div>

        <!-- 地址信息 -->
        <div class="order-address">
          <div class="address-item">
            <span class="address-label take">取</span>
            <span class="address-text">{{ order.pickupAddress }}</span>
          </div>
          <div class="address-item" style="margin-left: 20px;">
            <span class="address-label send">送</span>
            <span class="address-text">{{ order.deliveryAddress }}</span>
          </div>
        </div>

        <!-- 底部信息 -->
        <div class="order-footer">
          <span class="order-time">{{ formatTime(order.createTime) }}</span>
          <span class="order-no">订单号: {{ order.orderNo.slice(-8) }}</span>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <!-- v-else-if="!loading"表示非加载状态并且没有订单数据时显示 -->
    <div class="empty-state" v-else-if="!loading">
      <i class="el-icon-s-order"></i>
      <p>{{ emptyStateMessage }}</p>
      <el-button type="primary" @click="$router.push('/create')">去下单</el-button>
    </div>

    <!-- 底部导航 - 修复key -->
    <div class="bottom-nav" v-if="bottomNav.length > 0">
      <div class="nav-item" v-for="item in bottomNav" :key="'nav-' + item.id"
        :class="{ active: $route.path === item.path }" @click="goToNav(item)">
        <i :class="item.icon"></i>
        <span>{{ item.name }}</span>
      </div>
    </div>
  </div>
</template>

<script>
//导入订单相关的api
import { orderApi } from '@/api/order'

export default {
  name: 'OrderPage',
  data() {
    return {
      orders: [], //存储从后端获取的订单数据数组
      loading: false, //加载状态标识，true标识正在加载数据
      bottomNav: [],
      currentTab: 'all', //当前选中的标签值，默认为全部
      tabs: [
        { label: '全部', value: 'all' },
        { label: '待接单', value: 0 },
        { label: '进行中', value: 'processing' }, // 改成字符串
        { label: '已完成', value: 3 },
        { label: '已取消', value: 4 }
      ],
      userId: null, //当前登录用户的ID
      userRole: null, //当前登录用户的角色
      userInfo: {} // 完整的用户信息
    }
  },
  //计算属性
  computed: {
    // 根据当前选中的标签过滤订单数据
    filteredOrders() {
      // 如果没有订单数据，直接返回空数组
      if (!this.orders || this.orders.length === 0) return []
      // 如果当前标签是'all'，返回所有订单
      if (this.currentTab === 'all') {
        return this.orders
      }
      // 如果当前标签是'processing'（进行中），返回状态为1（已接单）或2（配送中）的订单
      if (this.currentTab === 'processing') {
        return this.orders.filter(order => order.status === 1 || order.status === 2)
      }
      // 其他情况，根据具体状态码过滤（0、3、4）
      return this.orders.filter(order => order.status === this.currentTab)
    },

    // 根据用户ID显示不同的空状态消息
    emptyStateMessage() {
      if (this.userId === 1) {
        return '管理员暂无订单，试试用其他账号登录'
      } else if (this.userId) {
        return '您还没有订单，快去下单吧'
      } else {
        return '请先登录后再查看订单'
      }
    }
  },
  // 组件创建完成后的生命周期钩子
  created() {
    this.loadUserInfo() //加载用户信息
    this.fetchOrders() //获取订单列表
    this.fetchBottomNav() //获取底部导航函数
  },
  //组件方法定义
  methods: {
    //从localStorage加载用户信息
    loadUserInfo() {
      // 从localStorage获取用户信息字符串
      const userInfoStr = localStorage.getItem('userInfo')
      console.log('用户信息字符串:', userInfoStr)

      try {
        // 解析JSON字符串，如果为空则解析空对象
        const userInfo = JSON.parse(userInfoStr || '{}')
        console.log('解析后的用户信息:', userInfo)

        // 保存完整的用户信息
        this.userInfo = userInfo

        // 将用户ID和角色赋值给组件数据
        this.userId = userInfo.id
        this.userRole = userInfo.role

        console.log('当前用户ID:', this.userId)
        console.log('当前用户角色:', this.userRole)

        // 如果没有用户ID，提示登录
        if (!this.userId) {
          this.$message.warning('请先登录')
        }
      } catch (e) {
        console.error('解析用户信息失败', e)
        this.userId = null
        this.userInfo = {}
      }
    },

    // 异步获取订单列表数据 - 根据用户ID获取对应用户的订单
    async fetchOrders() {
      this.loading = true

      // 如果没有用户ID，直接返回空数据并提示
      if (!this.userId) {
        console.log('用户未登录，无法获取订单')
        this.orders = []
        this.loading = false
        this.$message.warning('请先登录后再查看订单')
        return
      }

      try {
        // 构建请求参数，传入用户ID
        const params = {
          userId: this.userId // 传递当前登录用户的ID
        }

        // 发送GET请求，带上用户ID参数
        const res = await this.$axios.get('/api/order/list', { params })

        console.log('========== 订单数据调试 ==========')
        console.log('1. 完整响应:', res)
        console.log('2. res.data:', res.data)
        console.log('3. res.data.code:', res.data?.code)
        console.log('4. res.data.data:', res.data?.data)
        console.log('5. 请求用户ID:', this.userId)

        // ✅ 正确判断
        if (res.data?.code === 200) {
          // ✅ 正确取数据 - 这里假设后端已经根据userId过滤了数据
          const orderData = res.data?.data || []

          // 为了安全起见，前端也可以再次过滤，确保只显示当前用户的订单
          // 如果后端没有过滤，这行代码会起作用
          this.orders = orderData.filter(order => order.userId === this.userId)

          console.log('6. 过滤后的订单数据:', this.orders)
          console.log('7. 订单数量:', this.orders.length)

          // 如果订单数量为0，根据用户角色显示不同提示
          if (this.orders.length === 0) {
            if (this.userId === 1) {
              console.log('管理员账号暂无订单')
            } else {
              console.log('该用户暂无订单')
            }
          }
        } else {
          this.$message.error(res.data?.message || '获取订单失败')
          this.orders = []
        }
      } catch (error) {
        console.error('获取订单失败:', error)
        this.$message.error('网络错误，请稍后重试')
        this.orders = []
      } finally {
        this.loading = false
      }
    },

    // 异步获取底部导航数据
    async fetchBottomNav() {
      try {
        const res = await this.$axios.get('/api/home/data')
        const data = res.data || res
        if (data.bottomNav && data.bottomNav.length > 0) {
          this.bottomNav = data.bottomNav
        }
      } catch (error) {
        console.log('使用默认底部导航')
        // 可以设置默认底部导航
        this.bottomNav = [
          { id: 1, name: '首页', icon: 'el-icon-s-home', path: '/home' },
          { id: 2, name: '订单', icon: 'el-icon-s-order', path: '/order' },
          { id: 3, name: '我的', icon: 'el-icon-user', path: '/user' }
        ]
      }
    },

    // 切换标签页的方法
    switchTab(tabValue) {
      this.currentTab = tabValue
    },

    //跳转到订单详情页
    goToDetail(orderId) {
      // 跳转前可以检查订单是否属于当前用户
      const order = this.orders.find(o => o.id === orderId)
      if (order && order.userId !== this.userId) {
        this.$message.error('无权查看此订单')
        return
      }
      this.$router.push(`/order/detail/${orderId}`)
    },

    //底部导航点击处理方法
    goToNav(item) {
      if (item.path) {
        // 路径映射表
        let path = item.path

        // 小程序风格路径转换为 web 路径
        if (path.includes('/pages/')) {
          if (path === '/pages/order/list') {
            path = '/order'
          } else if (path === '/pages/user/index') {
            path = '/user'
          } else if (path === '/pages/home/home' || path === '/pages/index/index') {
            path = '/home' // 统一映射到 /home
          }
        }

        console.log('原始路径:', item.path)
        console.log('转换后路径:', path)
        this.$router.push(path)
      }
    },

    //显示更多菜单的方法
    showMoreMenu() {
      this.$message.info('更多功能开发中...')
    },

    //获取订单类型显示文本
    getOrderType(type) {
      const typeMap = {
        '快递': '代拿快递',
        '餐品': '代取餐品',
        '零食': '代买零食',
        '鲜花': '代送鲜花',
        '饮品': '代买饮品'
      }
      return typeMap[type] || type || '跑腿订单'
    },

    //获取订单状态文本
    getStatusText(status) {
      const statusMap = {
        0: '待接单',
        1: '已接单',
        2: '配送中',
        3: '已完成',
        4: '已取消'
      }
      return statusMap[status] || '未知'
    },

    //格式化时间显示
    formatTime(time) {
      if (!time) return ''
      const date = new Date(time)
      const now = new Date()

      if (date.toDateString() === now.toDateString()) {
        const hours = date.getHours().toString().padStart(2, '0')
        const minutes = date.getMinutes().toString().padStart(2, '0')
        return `今天 ${hours}:${minutes}`
      }

      const yesterday = new Date(now)
      yesterday.setDate(yesterday.getDate() - 1)
      if (date.toDateString() === yesterday.toDateString()) {
        const hours = date.getHours().toString().padStart(2, '0')
        const minutes = date.getMinutes().toString().padStart(2, '0')
        return `昨天 ${hours}:${minutes}`
      }

      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const day = date.getDate().toString().padStart(2, '0')
      return `${month}-${day}`
    },

    // 刷新订单数据（可被父组件调用）
    refreshOrders() {
      this.fetchOrders()
    },

    // 切换用户（用于测试不同用户的订单）
    switchUser(userId) {
      this.userId = userId
      this.fetchOrders()
    }
  },

  // 监听路由变化，当参数变化时重新加载数据
  watch: {
    '$route': {
      handler() {
        // 重新加载用户信息和订单
        this.loadUserInfo()
        this.fetchOrders()
      },
      deep: true
    }
  }
}
</script>

<style scoped lang="scss">
.order-page {
  min-height: 100vh;
  background-color: #f8f8f8;
  padding-bottom: 60px; // 为底部导航留出空间

  // 顶部导航
  .header {
    background-color: white;
    padding: 15px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid #f0f0f0;
    position: sticky;
    top: 0;
    z-index: 10;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);

    i {
      font-size: 20px;
      cursor: pointer;
      padding: 5px;
      border-radius: 50%;
      transition: all 0.3s;

      &:hover {
        background-color: #f5f5f5;
        color: #409EFF;
      }
    }

    span {
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }
  }

  // 状态标签
  .tabs {
    display: flex;
    background-color: white;
    padding: 10px 15px;
    border-bottom: 1px solid #f0f0f0;
    position: sticky;
    top: 60px;
    z-index: 9;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);

    .tab-item {
      flex: 1;
      text-align: center;
      font-size: 14px;
      color: #666;
      padding: 8px 0;
      cursor: pointer;
      transition: all 0.3s;
      position: relative;
      font-weight: 500;

      &:hover {
        color: #409EFF;
      }

      &.active {
        color: #409EFF;
        font-weight: 600;

        &::after {
          content: '';
          position: absolute;
          bottom: -8px;
          left: 50%;
          transform: translateX(-50%);
          width: 30px;
          height: 3px;
          background-color: #409EFF;
          border-radius: 3px;
          box-shadow: 0 2px 4px rgba(64, 158, 255, 0.3);
        }
      }
    }
  }

  // 加载状态
  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    background-color: white;
    margin: 15px;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);

    i {
      font-size: 40px;
      color: #409EFF;
      margin-bottom: 15px;
      animation: rotating 1.5s linear infinite;
    }

    p {
      color: #999;
      font-size: 14px;
      margin: 0;
    }
  }

  @keyframes rotating {
    from {
      transform: rotate(0deg);
    }

    to {
      transform: rotate(360deg);
    }
  }

  // 订单列表容器
  .order-list-container {
    padding: 15px;
  }

  // 订单项
  .order-item {
    background-color: white;
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 15px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    cursor: pointer;
    transition: all 0.3s;
    border: 1px solid #f0f0f0;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
      border-color: #409EFF;
    }

    .order-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .order-type-tag {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .order-type {
      font-size: 15px;
      font-weight: 600;
      color: #333;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .order-status {
      font-size: 11px;
      padding: 4px 8px;
      border-radius: 20px;
      font-weight: 500;
      letter-spacing: 0.3px;

      &.status-0 {
        background-color: #fff2f0;
        color: #f56c6c;
        border: 1px solid #ffd9d9;
      }

      &.status-1 {
        background-color: #fff7e6;
        color: #e6a23c;
        border: 1px solid #ffe7ba;
      }

      &.status-2 {
        background-color: #ecf5ff;
        color: #409EFF;
        border: 1px solid #d9ecff;
      }

      &.status-3 {
        background-color: #f0f9eb;
        color: #67c23a;
        border: 1px solid #d7f0cc;
      }

      &.status-4 {
        background-color: #f4f4f5;
        color: #999;
        border: 1px solid #e4e4e7;
      }
    }

    .order-price {
      font-size: 18px;
      font-weight: 700;
      color: #f56c6c;
      letter-spacing: -0.5px;

      &::before {
        content: '¥';
        font-size: 14px;
        font-weight: 500;
        margin-right: 2px;
        color: #f56c6c;
      }
    }

    .order-address {
      margin-bottom: 12px;
      display: flex;
      justify-content: flex-start;
      background-color: #fafafa;
      padding: 12px;
      border-radius: 8px;
    }

    .address-item {
      display: flex;
      align-items: flex-start;
      font-size: 13px;
      flex: 1;

      .address-label {
        width: 22px;
        height: 22px;
        border-radius: 6px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        margin-right: 8px;
        font-size: 12px;
        flex-shrink: 0;
        font-weight: 600;

        &.take {
          background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
          color: white;
          box-shadow: 0 2px 4px rgba(103, 194, 58, 0.3);
        }

        &.send {
          background: linear-gradient(135deg, #f56c6c 0%, #f78989 100%);
          color: white;
          box-shadow: 0 2px 4px rgba(245, 108, 108, 0.3);
        }
      }

      .address-text {
        color: #666;
        font-size: 13px;
        line-height: 1.5;
        flex: 1;
        word-break: break-word;
      }
    }

    .order-footer {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: #999;
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px dashed #f0f0f0;
    }

    .order-time {
      color: #999;
      display: flex;
      align-items: center;

      &::before {
        content: '⏱️';
        margin-right: 4px;
        font-size: 12px;
      }
    }

    .order-no {
      color: #ccc;
      font-family: monospace;
      background-color: #f8f8f8;
      padding: 2px 8px;
      border-radius: 4px;

      &::before {
        content: '#';
        margin-right: 2px;
        color: #ddd;
      }
    }
  }

  // 空状态
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 100px 20px;
    background-color: white;
    margin: 15px;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);

    i {
      font-size: 80px;
      color: #ddd;
      margin-bottom: 20px;
      opacity: 0.6;
    }

    p {
      color: #999;
      margin-bottom: 24px;
      font-size: 16px;
      font-weight: 500;
    }

    .el-button {
      width: 200px;
      height: 44px;
      border-radius: 22px;
      font-size: 15px;
      background: linear-gradient(135deg, #409EFF 0%, #66b1ff 100%);
      border: none;
      box-shadow: 0 4px 8px rgba(64, 158, 255, 0.3);
      transition: all 0.3s;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 12px rgba(64, 158, 255, 0.4);
      }
    }
  }

  // 底部导航
  .bottom-nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 60px;
    background-color: white;
    display: flex;
    border-top: 1px solid #f0f0f0;
    z-index: 100;
    box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.05);
    backdrop-filter: blur(10px);
    background-color: rgba(255, 255, 255, 0.95);

    .nav-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: #999;
      transition: all 0.3s;
      position: relative;

      i {
        font-size: 22px;
        margin-bottom: 4px;
        transition: all 0.3s;
      }

      span {
        font-size: 12px;
        font-weight: 500;
        transition: all 0.3s;
      }

      &.active {
        color: #409EFF;

        i {
          transform: translateY(-2px);
          text-shadow: 0 2px 4px rgba(64, 158, 255, 0.3);
        }

        span {
          font-weight: 600;
        }
      }

      &:hover {
        color: #409EFF;

        i {
          transform: scale(1.1);
        }
      }

      &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 0;
        height: 3px;
        background: linear-gradient(135deg, #409EFF 0%, #66b1ff 100%);
        transition: width 0.3s;
        border-radius: 0 0 3px 3px;
      }

      &.active::after {
        width: 30px;
      }
    }
  }
}
</style>