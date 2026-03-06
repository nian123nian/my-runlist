<template>
  <div class="user-center">
    <!-- 顶部导航 -->
    <div class="header">
      <i  @click="$router.back()"></i>
      <span>个人中心</span>
      <i class="el-icon-more" @click="showMoreMenu"></i>
    </div>

    <!-- 用户信息卡片 -->
    <div class="user-card">
      <div class="user-avatar">
        <img 
          :src="avatar" 
          alt="头像" 
          @error="handleAvatarError"
        >
        <div class="avatar-overlay" @click="showUploadDialog">
          <i class="el-icon-camera"></i>
          <span>点击修改</span>
        </div>
      </div>
      <div class="user-info">
        <h3>{{ username }}</h3>
        <p class="phone">{{ phone || '暂无手机号' }}</p>
      </div>
    </div>

    <!-- 资产统计 -->
    <div class="asset-section">
      <div class="asset-item" @click="goToWallet">
        <span class="label">余额</span>
        <span class="value">¥{{ balance }}</span>
      </div>
      <div class="asset-item" @click="goToCoupon">
        <span class="label">优惠券</span>
        <span class="value">{{ couponCount }}张</span>
      </div>
      <div class="asset-item" @click="goToPoints">
        <span class="label">积分</span>
        <span class="value">{{ points }}</span>
      </div>
    </div>

    <!-- 功能菜单 -->
    <div class="menu-section">
      <div class="menu-item" @click="goToAddress">
        <i class="el-icon-location"></i>
        <span>地址管理</span>
        <i class="el-icon-arrow-right"></i>
      </div>
      <div class="menu-item" @click="goToOrder">
        <i class="el-icon-s-order"></i>
        <span>我的订单</span>
        <i class="el-icon-arrow-right"></i>
      </div>
      <div class="menu-item" @click="goToSettings">
        <i class="el-icon-setting"></i>
        <span>设置</span>
        <i class="el-icon-arrow-right"></i>
      </div>
    </div>

    <!-- 退出按钮 -->
    <div class="logout-btn">
      <el-button type="danger" @click="logout" plain>退出登录</el-button>
    </div>

    <!-- 底部导航 -->
    <div class="bottom-nav" v-if="bottomNav.length > 0">
      <div 
        class="nav-item"
        v-for="item in bottomNav" 
        :key="'nav-' + item.id"  
        :class="{ active: isActive(item) }"
        @click="goToNav(item)"
      >
        <i :class="item.icon"></i>
        <span>{{ item.name }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UserCenter',
  data() {
    return {
      userId: null,
      username: '',
      phone: '',
      avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
      balance: 0,
      couponCount: 0,
      points: 0,
      // 底部导航数据
      bottomNav: [
        { id: 1, name: '首页', icon: 'el-icon-s-home', path: '/home' },
        { id: 2, name: '订单', icon: 'el-icon-s-order', path: '/order' },
        { id: 3, name: '我的', icon: 'el-icon-user', path: '/user' }
      ]
    }
  },
  created() {
    this.loadUserInfo()
    this.fetchBottomNav()
  },
  methods: {
    // 加载用户信息
    loadUserInfo() {
      const userInfoStr = localStorage.getItem('userInfo')
      console.log('用户信息:', userInfoStr)
      
      try {
        const userInfo = JSON.parse(userInfoStr || '{}')
        this.userId = userInfo.id
        this.username = userInfo.nickname || userInfo.username || '用户'
        this.phone = userInfo.phone || ''
        this.balance = userInfo.balance || 0
        
        // 如果有头像就用头像，否则用默认的
        if (userInfo.avatar) {
          this.avatar = userInfo.avatar
        }
      } catch (e) {
        console.error('解析用户信息失败', e)
      }
    },

    // 获取底部导航
    async fetchBottomNav() {
      try {
        const res = await this.$axios.get('/api/home/data')
        const responseData = res.data || res
        if (responseData.bottomNav && responseData.bottomNav.length > 0) {
          this.bottomNav = responseData.bottomNav
        }
      } catch (error) {
        console.log('使用默认底部导航')
      }
    },

    // 头像加载错误处理
    handleAvatarError(e) {
      e.target.src = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
    },

    // 显示上传对话框
    showUploadDialog() {
      this.$message.info('头像上传功能开发中...')
    },

    // 显示更多菜单
    showMoreMenu() {
      this.$message.info('更多功能开发中...')
    },

    // 跳转到钱包
    goToWallet() {
      this.$message.info('钱包功能开发中')
    },

    // 跳转到优惠券
    goToCoupon() {
      this.$message.info('优惠券功能开发中')
    },

    // 跳转到积分
    goToPoints() {
      this.$message.info('积分功能开发中')
    },

    // 跳转到地址管理
    goToAddress() {
      this.$router.push('/add')
    },

    // 跳转到订单列表
    goToOrder() {
      this.$router.push('/order')
    },

    // 跳转到设置
    goToSettings() {
      this.$message.info('设置功能开发中')
    },

    // 底部导航点击
    goToNav(item) {
      if (!item.path) return
      
      // 路径映射
      const pathMap = {
        '/pages/order/list': '/order',
        '/pages/user/index': '/user',
        '/pages/home/home': '/home',
        '/pages/index/index': '/home'
      }
      
      const targetPath = pathMap[item.path] || item.path
      console.log('跳转到:', targetPath)
      this.$router.push(targetPath)
    },

    // 判断导航是否激活
    isActive(item) {
      const pathMap = {
        '/pages/order/list': '/order',
        '/pages/user/index': '/user',
        '/pages/home/home': '/home',
        '/pages/index/index': '/home'
      }
      
      const itemPath = pathMap[item.path] || item.path
      const currentPath = this.$route.path
      
      if (itemPath === '/home') {
        return currentPath === '/home' || currentPath === '/'
      }
      return currentPath === itemPath
    },

    // 退出登录
    logout() {
      this.$confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        localStorage.removeItem('token')
        localStorage.removeItem('userInfo')
        localStorage.removeItem('rememberedUser')
        
        this.$message.success('已退出登录')
        this.$router.push('/login')
      }).catch(() => {
        this.$message.info('已取消退出')
      })
    }
  }
}
</script>

<style scoped lang="scss">
.user-center {
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

    i {
      font-size: 20px;
      cursor: pointer;
      
      &:hover {
        color: #409EFF;
      }
    }

    span {
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }
  }

  // 用户卡片
  .user-card {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 30px 20px;
    display: flex;
    align-items: center;
    color: white;

    .user-avatar {
      position: relative;
      margin-right: 20px;

      img {
        width: 70px;
        height: 70px;
        border-radius: 50%;
        border: 3px solid white;
        object-fit: cover;
      }

      .avatar-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: white;
        opacity: 0;
        transition: opacity 0.3s;
        cursor: pointer;

        i {
          font-size: 20px;
          margin-bottom: 2px;
        }

        span {
          font-size: 12px;
        }
      }

      &:hover .avatar-overlay {
        opacity: 1;
      }
    }

    .user-info {
      h3 {
        font-size: 20px;
        margin-bottom: 5px;
      }

      .phone {
        font-size: 14px;
        opacity: 0.9;
      }
    }
  }

  // 资产卡片
  .asset-section {
    background-color: white;
    margin: 15px;
    padding: 20px;
    border-radius: 12px;
    display: flex;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    margin-top: -20px;

    .asset-item {
      flex: 1;
      text-align: center;
      cursor: pointer;
      position: relative;

      &:not(:last-child)::after {
        content: '';
        position: absolute;
        right: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 1px;
        height: 30px;
        background-color: #f0f0f0;
      }

      .label {
        display: block;
        font-size: 13px;
        color: #999;
        margin-bottom: 5px;
      }

      .value {
        display: block;
        font-size: 18px;
        font-weight: 600;
        color: #333;
      }

      &:hover .value {
        color: #409EFF;
      }
    }
  }

  // 功能菜单
  .menu-section {
    background-color: white;
    margin: 15px;
    padding: 0 15px;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

    .menu-item {
      display: flex;
      align-items: center;
      padding: 15px 0;
      border-bottom: 1px solid #f0f0f0;
      cursor: pointer;

      &:last-child {
        border-bottom: none;
      }

      i:first-child {
        font-size: 20px;
        color: #409EFF;
        margin-right: 15px;
      }

      span {
        flex: 1;
        font-size: 15px;
        color: #333;
      }

      i:last-child {
        color: #999;
        font-size: 14px;
      }

      &:hover {
        span {
          color: #409EFF;
        }
        i:last-child {
          color: #409EFF;
        }
      }
    }
  }

  // 退出按钮
  .logout-btn {
    margin: 30px 15px 20px;
    text-align: center;

    .el-button {
      width: 100%;
      height: 44px;
      border-radius: 22px;
      font-size: 15px;
      
      &:hover {
        background-color: #f56c6c;
        color: white;
        border-color: #f56c6c;
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