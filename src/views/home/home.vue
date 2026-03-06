<template>
  <div class="home">
    <!-- 容器 -->
    <el-container>
      <!-- 头部 -->
      <el-header>
        <h2>飞飞跑单平台</h2>
      </el-header>


      <!-- 搜素框 -->
      <div class="search">
        <!-- 绑定搜索内容到searchText变量，带搜索图标，按回车触发handleSearch方法 -->
        <el-input type="text" prefix-icon="el-icon-search" v-model="searchText" placeholder="请输入"
          style="width: 270px; cursor: pointer" @enter="handleSearch"></el-input>
      </div>


      <!-- 轮播图 -->
      <div class="banner" v-if="banners.length > 0">
        <!-- 轮播图组件，间隔3秒切换，指示器在外侧，无切换箭头，高度165px -->
        <el-carousel :interval="3000" indicator-position="outside" arrow="never" height="165px">
          <!-- v-for循环遍历banners数组，生成每一个轮播项，：key绑定唯一标识item.id -->
          <el-carousel-item v-for="item in banners" :key="item.id">
            <div class="banner-item" @click="goToLink()">
              <img :src="item.imageUrl" :alt="item.title" class="banner-img">
            </div>
          </el-carousel-item>
        </el-carousel>
      </div>


      <!-- 卡片区域 -->
      <div class="card" v-if="cards.length > 0">
        <!-- 标题 -->
        <div class="title">
          <span class="text">快捷下单</span>
        </div>
        <!-- 卡片网络布局 -->
        <div class="card-grid">
          <!-- v-for循环遍历cards数组，生成卡片项，点击时执行goToPage(item)方法并传入当前项 -->
          <div class="card-item" v-for="item in cards" :key="item.id" @click="goToPage(item)">
            <!-- 卡片图片容器，动态绑定类名：'bg-'+((item.id%4)+1)，根据id取得到1-4的背景色类 -->
             <!-- 'bg-'+这是固定的前缀字串，item.id除以4的除数，结果是0，1，2，3，+1后变成1，2，3，4。 -->
            <div class="card-icon" :class="'bg-' + ((item.id % 4) + 1)">
              <!-- 图标的字体图标类，动态绑定自item.icon -->
              <i :class="item.icon"></i>
            </div>
            <span class="card-name">{{ item.name }}</span>
          </div>
        </div>
      </div>



      <!-- 订单区域 -->
      <div class="order" v-if="latestOrders.length > 0">

        <!-- 标题 -->
        <div class="title">
          <span class="text">最新订单</span>
        </div>

        <!-- 列表 -->
        <div class="order-list">
          <!-- v-for循环指令，遍历数组，只用前5条数据，每次循环把当前赋值交给变量order -->
          <div class="order-item" v-for="order in latestOrders.slice(0, 5)" :key="order.id"
            @click="$router.push(`/order/detail/${order.id}`)">

            <!-- 订单头部：类型+价格 -->
            <div class="order-header" @click="goToOrderDetail(orderId)">
              <div class="order-type-tag">
                <!-- 调用方法，把物品类型（如'快递'）转换成友好文字（如'代拿快递'） -->
                <span class="order-type">{{ getOrderType(order.goodsType) }}</span>
                <!-- 动态绑定类名，不同状态显示不同颜色。把状态码（0,1,2,3,4n'p'm）转换成文字（待接单、已接单等） -->
                <span class="order-status" :class="'status-' + order.status">{{ getStatusText(order.status) }}</span>
              </div>
              <!-- 显示订单金额，前面加人民币符号 -->
              <span class="order-price">¥{{ order.amount }}</span>
            </div>

            <!-- 地址信息 -->
            <div class="order-address">
              <div class="address-item">
                <span class="address-label take">取</span>
                <span class="address-text">{{ order.pickupAddress }}</span>
              </div>
              <div class="address-item" style="  margin-left: 20px;">
                <span class="address-label send">送</span>
                <span class="address-text">{{ order.deliveryAddress }}</span>
              </div>
            </div>

            <!-- 底部信息 -->
            <div class="order-footer">
              <!-- 下单时间，调用formatTime方法格式化 -->
              <span class="order-time">{{ formatTime(order.createTime) }}</span>
              <!-- 订单号，取orderNo的后8位(.slice(-8)) -->
              <span class="order-no">订单号: {{ order.orderNo.slice(-8) }}</span>
            </div>
          </div>
        </div>
      </div>

    </el-container>

    <!-- 底部导航 -->
    <!-- 只有当底部导航数据不为空时才显示，bottomNav是从后端获取的导航数据数组 -->
    <div class="bottom-nav" v-if="bottomNav.length > 0">
      <!-- v-for循环遍历bottomNav数组，生成导航项 -->
       <!-- 动态绑定active类，如果当前路由路径等于item.path，则激活 -->
      <div class="nav-item" v-for="item in bottomNav" :key="item.id" :class="{ active: $route.path === item.path }"
        @click="goToNav(item)">
        <i :class="item.icon"></i>
        <span>{{ item.name }}</span>
      </div>
    </div>

  </div>
</template>




<script>
export default {
  name: 'home',//组件名称
  data() {//组件数据函数
    return {
      banners: [],//轮播图数组
      cards: [],//快捷下单卡片数据数组
      bottomNav: [],//底部导航数据数组
      latestOrders: [],//最新订单数据数组
      searchText: '',//搜索框绑定的文本
      cards: [
  { 
    id: 1, 
    name: '代拿快递', 
    type: 'express', 
    icon: 'el-icon-s-order',
    path: '/create/express' // 也可以直接在数据中包含路径
  },
  { 
    id: 2, 
    name: '代取餐品', 
    type: 'meal', 
    icon: 'el-icon-food',
    path: '/create/meal'
  },
  { 
    id: 3, 
    name: '代买零食', 
    type: 'snack', 
    icon: 'el-icon-goods',
    path: '/create/snack'
  },
  { 
    id: 4, 
    name: '代送鲜花', 
    type: 'flower', 
    icon: 'el-icon-flower',
    path: '/create/flower'
  }
]

    };
  },
  //组件方法定义
  methods: {
    // 搜索框
    handleSearch() {
      console.log('搜索内容：', this.searchText);
    },
    //异步获取首页数据的方法
    async fetchHomeData() {
      try {
         // 使用axios发送GET请求到'/api/home/data'接口，await等待返回结果
        const res = await this.$axios.get('/api/home/data')
        console.log('首页数据', res)//打印返回的数据
        const data = res.data  //提取data部分

         // 将从后端获取的数据赋值给对应的响应式变量，如果没有则赋值为空数组
        this.banners = data.banners || []
        this.cards = data.cards || []
        this.bottomNav = data.bottomNav || []
        this.latestOrders = data.latestOrders || []

        console.log(this.cards)//打印cards数据
      } catch (error) {
        console.error('获取首页数据失败:', error)
      }
    },
    goToLink() {

    },
     goToPage(item) {
    console.log('点击卡片:', item) // 调试用，可以查看点击的卡片信息
    
    // 根据卡片的类型或ID进行不同的跳转
    switch (item.type) {
      case 'express':
        // 代拿快递
        this.$router.push({
          path: '/create/express',
          query: {
            type: item.type,
            name: item.name,
            id: item.id
          }
        })
        break
        
      case 'meal':
        // 代取餐品
        this.$router.push({
          path: '/create/meal',
          query: {
            type: item.type,
            name: item.name,
            id: item.id
          }
        })
        break
        
      case 'snack':
        // 代买零食
        this.$router.push({
          path: '/create/snack',
          query: {
            type: item.type,
            name: item.name,
            id: item.id
          }
        })
        break
        
      case 'flower':
        // 代送鲜花
        this.$router.push({
          path: '/create/flower',
          query: {
            type: item.type,
            name: item.name,
            id: item.id
          }
        })
        break
        
      default:
        // 默认跳转到通用下单页，并传递参数
        this.$router.push({
          path: '/create',
          query: {
            type: item.type || 'unknown',
            name: item.name,
            id: item.id
          }
        })
    }},
    goToOrderDetail(orderId) {

    },
    // 新增：获取订单类型显示文本
    // 定义方法，接收一个参数type
    getOrderType(type) {
      // 创建一个映射表(对象)，把后端返回类型转换成前端显示的文字
      const typeMap = {
        '快递': '代拿快递',
        '餐品': '代取餐品',
        '零食': '代买零食',
        '鲜花': '代送鲜花',
        '饮品': '代买饮品'
      }
      // 返回结果：如果typeMap中有这个类型，就返回对应的文字
      // 如果没有，就返回原型type
      // 如果type也没有，就返回跑腿订单
      return typeMap[type] || type || '跑腿订单'
    },

    // 新增：获取订单状态文本
    // 定义方法，接收一个参数status(订单状态码)
    getStatusText(status) {
      // 创建状态码映射表，把数字状态码转换成文字
      const statusMap = {
        0: '待接单',
        1: '已接单',
        2: '配送中',
        3: '已完成',
        4: '已取消'
      }
      // 返回：如果状态码存在，返回对应文字，否则返回未知
      return statusMap[status] || '未知'
    },


    // 新增：格式化时间显示
    // 定义方法，接收一个参数times(时间字符串)
    formatTime(time) {
      // 如果time为空，直接返回空字符串
      if (!time) return ''
      // 把传入的时间字符串转换成Date对象
      const date = new Date(time)
      // 获取当前时间
      const now = new Date()

      //判断是否是今天
      if (date.toDateString() === now.toDateString()) {
        const hours = date.getHours().toString().padStart(2, '0')
        const minutes = date.getMinutes().toString().padStart(2, '0')
        return `今天 ${hours}:${minutes}`
      }

      // 判断是否是昨天
      // 创建一个昨天的时间对象
      const yesterday = new Date(now)
      yesterday.setDate(yesterday.getDate() - 1)//当前时间减一天

      // 如果时间是昨天
      if (date.toDateString() === yesterday.toDateString()) {
        const hours = date.getHours().toString().padStart(2, '0')
        const minutes = date.getMinutes().toString().padStart(2, '0')
        // 返回
        return `昨天 ${hours}:${minutes}`
      }

      //更早
      // 月份要+1，因为getMonth()返回0-11
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const day = date.getDate().toString().padStart(2, '0')
      return `${month}-${day}`
    },

    // 底部导航点击处理方法
    goToNav(item) {
      //如果存在，则跳转
      if (item.path) {
        console.log('点击了导航:', item)
        console.log('当前路由对象:', this.$router)
        console.log('要跳转的路径:', item.path)
        this.$router.push(item.path)
      } else {
        console.warn('缺少路径', item)
      }
    }
  },
  created() {
    this.fetchHomeData()
  }
}
</script>



<style lang="scss" scoped>
// 全局重置
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;

}

.home {
  background-color: #fafafa;
}

.el-header {
  background-color: #409EFF;
  color: white;
  text-align: center;
  line-height: 60px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

// 输入框
.search {
  display: flex;
  justify-content: center;
  padding: 5px 0;
  //   background-color: white;
  //   border-bottom: 1px solid #eee;
}

.el-input {
  width: 100%;
  margin: 10px auto;
  border-radius: 5px;
}

// 轮播图
.banner {
  width: 98%;
  margin: 6px auto;
  background-color: white;
}

.banner-item {
  height: 160px;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
}

.banner-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

// 卡片区域
.card {
  padding: 10px;
  width: 98%;
  margin: 6px auto;
  background-color: white;
}

.card-grid {

  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
}

.card-item {
  display: flex;
  flex-direction: column; //主轴方向为列(垂直排列)
  align-items: center; 
  cursor: pointer; //鼠标手型
}

.card-icon {
  margin: 5px 0;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  color: white;
  font-size: 24px;
}

.card-name {
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 2px;
}

//卡片背景颜色类，渐变色
.bg-1 {
  background: linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%);
}

.bg-2 {
  background: linear-gradient(135deg, #4ECDC4 0%, #6EE7E7 100%);
}

.bg-3 {
  background: linear-gradient(135deg, #45B7D1 0%, #6CD9F2 100%);
}

.bg-4 {
  background: linear-gradient(135deg, #96CEB4 0%, #B8E0C2 100%);
}

//订单区域整体样式
.order {
  padding: 10px;
  width: 98%;
  margin: 6px auto;
  background-color: white;
}

//订单
// .order-list{
//     display: flex;
//     flex-direction: column;
//     align-items: center;
// }
// .order-item{
//     width: 98%;
//     height: 60px;
//     background-color: rgb(251, 7, 7);
//     margin-top: 10px;
//     border-radius: 10px;
//     padding: 5px;
// }

// 订单区域样式
.order-section {
  background-color: white;
  padding: 15px;
  margin: 10px 15px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.order-list {
  margin-top: 10px;
}

.order-item {
  border-bottom: 1px solid #f0f0f0;
  padding: 12px 0;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f9f9f9;
  }

  &:last-child {
    border-bottom: none;
  }
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.order-type-tag {
  display: flex;
  align-items: center;
  gap: 8px;
}

.order-type {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

//订单状态基础样式
.order-status {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
  background-color: #f0f0f0;

  &.status-0 {
    background-color: #fef0f0;
    color: #f56c6c;
  }

  &.status-1 {
    background-color: #fdf6ec;
    color: #e6a23c;
  }

  &.status-2 {
    background-color: #ecf5ff;
    color: #409EFF;
  }

  &.status-3 {
    background-color: #f0f9eb;
    color: #67c23a;
  }

  &.status-4 {
    background-color: #f4f4f5;
    color: #999;
  }
}

.order-price {
  font-size: 16px;
  font-weight: 500;
  color: #f56c6c;
}

.order-address {
  margin-bottom: 8px;
  display: flex;
  justify-content: flex-start;
}

.address-item {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
  font-size: 13px;

  .address-label {
    width: 20px;
    height: 20px;
    border-radius: 4px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-right: 8px;
    font-size: 12px;
    flex-shrink: 0;

    //取件标签样式
    &.take {
      background-color: #f0f9eb;
      color: #67c23a;
    }

    &.send {
      background-color: #fef0f0;
      color: #f56c6c;
    }
  }

  .address-text {
    color: #666;
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

//订单底部样式
.order-footer {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #999;
  margin-top: 8px;
}

.order-time {
  color: #999;
}
//订单号
.order-no {
  color: #ccc;
}

// 标题区域样式复用
.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;

  .title-text {
    font-size: 16px;
    font-weight: 500;
    color: #333;
    position: relative;
    padding-left: 10px;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 3px;
      height: 16px;
      background-color: #409EFF;
      border-radius: 2px;
    }
  }

  .more {
    color: #999;
    font-size: 13px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 2px;

    &:hover {
      color: #409EFF;
    }
  }
}

// 底部导航容器
.bottom-nav {
  position: fixed; // 固定定位，始终在底部
  bottom: 0; // 贴在底部
  left: 0; // 从左边缘开始
  right: 0; // 到右边缘结束
  height: 60px; // 高度60px
  background-color: white; // 白色背景
  display: flex; // 弹性布局，子元素水平排列
  border-top: 1px solid #eee; // 顶部细线边框
  z-index: 100; // 高层级，保证在其他元素之上
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05); // 顶部阴影，增加立体感

  // 每个导航项
  .nav-item {
    flex: 1; // 平均分配宽度
    display: flex; // 弹性布局
    flex-direction: column; // 垂直排列（图标在上，文字在下）
    align-items: center; // 水平居中
    justify-content: center; // 垂直居中
    cursor: pointer; // 鼠标变成小手
    color: #999; // 默认字体颜色为灰色
    transition: all 0.3s; // 所有变化0.3秒过渡（平滑动画）

    // 图标样式
    i {
      font-size: 22px; // 图标大小22px
      margin-bottom: 4px; // 图标和文字之间的间距
    }

    // 文字样式
    span {
      font-size: 12px; // 文字大小12px
    }

    // 激活状态（当前页面所在的导航）
    &.active {
      color: #409EFF; // 激活时字体变为蓝色

      i {
        color: #409EFF; // 激活时图标也变蓝色
      }
    }

    // 鼠标悬停效果
    &:hover {
      color: #409EFF; // 悬停时字体变蓝色

      i {
        color: #409EFF; // 悬停时图标变蓝色
      }
    }
  }
}
</style>