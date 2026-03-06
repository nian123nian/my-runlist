<template>
  <div class="create-order-index">
    <!-- 顶部导航 -->
    <div class="header">
      <i class="el-icon-arrow-left" @click="goBack"></i>
      <span>选择服务类型</span>
      <i class="el-icon-service" @click="showCustomerService"></i>
    </div>

    <!-- 快捷下单卡片网格 -->
    <div class="order-types">
      <div 
        class="type-card" 
        v-for="item in orderTypes" 
        :key="item.type"
        @click="selectOrderType(item)"
      >
        <div class="card-icon" :class="item.iconClass">
          <i :class="item.icon"></i>
        </div>
        <div class="card-info">
          <h3>{{ item.name }}</h3>
          <p>{{ item.desc }}</p>
        </div>
        <div class="card-price">
          <span>¥{{ item.basePrice }}起</span>
          <i class="el-icon-arrow-right"></i>
        </div>
      </div>
    </div>

    <!-- 最近常用服务 -->
    <div class="recent-section" v-if="recentOrders.length > 0">
      <div class="section-header">
        <span class="title">最近常用</span>
        <span class="more" @click="showAllRecent">查看更多 <i class="el-icon-arrow-right"></i></span>
      </div>
      <div class="recent-list">
        <div 
          class="recent-item" 
          v-for="order in recentOrders.slice(0, 3)" 
          :key="order.id"
          @click="reuseOrder(order)"
        >
          <div class="recent-icon" :class="order.iconClass">
            <i :class="order.icon"></i>
          </div>
          <div class="recent-info">
            <span class="recent-type">{{ order.typeName }}</span>
            <span class="recent-address">{{ order.pickupAddress }}</span>
          </div>
          <i class="el-icon-d-caret"></i>
        </div>
      </div>
    </div>

    <!-- 服务保障 -->
    <div class="guarantee">
      <div class="guarantee-item">
        <i class="el-icon-success"></i>
        <span>准时送达</span>
      </div>
      <div class="guarantee-item">
        <i class="el-icon-success"></i>
        <span>价格透明</span>
      </div>
      <div class="guarantee-item">
        <i class="el-icon-success"></i>
        <span>全程保险</span>
      </div>
      <div class="guarantee-item">
        <i class="el-icon-success"></i>
        <span>24h客服</span>
      </div>
    </div>


  </div>
</template>

<script>
export default {
  name: 'CreateOrderIndex',
  data() {
    return {
      // 下单类型列表
      orderTypes: [
        {
          type: 'express',
          name: '代拿快递',
          desc: '帮您取快递，送到指定位置',
          icon: 'el-icon-s-order',
          iconClass: 'bg-express',
          basePrice: 8,
          path: '/create/express'
        },
        {
          type: 'meal',
          name: '代取餐品',
          desc: '帮您取餐，准时送达',
          icon: 'el-icon-food',
          iconClass: 'bg-meal',
          basePrice: 10,
          path: '/create/meal'
        },
        {
          type: 'snack',
          name: '代买零食',
          desc: '帮您购买零食，送到手中',
          icon: 'el-icon-goods',
          iconClass: 'bg-snack',
          basePrice: 12,
          path: '/create/snack'
        },
        {
          type: 'flower',
          name: '代送鲜花',
          desc: '帮您送花，传递心意',
          icon: 'el-icon-flowera',
          iconClass: 'bg-flower',
          basePrice: 15,
          path: '/create/flower'
        }
      ],
      // 最近订单
      recentOrders: []
    }
  },
  created() {
    this.loadRecentOrders()
  },
  methods: {
    // 加载最近订单
    loadRecentOrders() {
      // 模拟数据，实际应从后端获取
      this.recentOrders = [
        {
          id: 1,
          type: 'express',
          typeName: '代拿快递',
          icon: 'el-icon-s-order',
          iconClass: 'bg-express',
          pickupAddress: '菜鸟驿站',
          deliveryAddress: 'A栋201室'
        },
        {
          id: 2,
          type: 'meal',
          typeName: '代取餐品',
          icon: 'el-icon-food',
          iconClass: 'bg-meal',
          pickupAddress: '麦当劳',
          deliveryAddress: 'B栋302室'
        },
        {
          id: 3,
          type: 'snack',
          typeName: '代买零食',
          icon: 'el-icon-goods',
          iconClass: 'bg-snack',
          pickupAddress: '便利店',
          deliveryAddress: 'C栋103室'
        }
      ]
    },
    
    // 选择下单类型
    selectOrderType(item) {
      this.$router.push({
        path: item.path,
        query: {
          type: item.type,
          basePrice: item.basePrice
        }
      })
    },
    
    // 复用订单
    reuseOrder(order) {
      this.$router.push({
        path: `/create/${order.type}`,
        query: { reuseId: order.id }
      })
    },
    
    // 显示所有最近订单
    showAllRecent() {
      this.$message.info('查看更多最近订单')
    },
    
    // 显示客服
    showCustomerService() {
      this.$message.info('客服热线：400-123-4567')
    },
    
    // 返回上一页
    goBack() {
      this.$router.back()
    }
  }
}
</script>

<style scoped lang="scss">
.create-order-index {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding-bottom: 70px;

  .header {
    background-color: white;
    padding: 15px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: sticky;
    top: 0;
    z-index: 10;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

    i {
      font-size: 22px;
      color: #333;
      cursor: pointer;
      padding: 5px;
      
      &:hover {
        color: #409EFF;
      }
    }

    span {
      font-size: 18px;
      font-weight: 600;
      color: #333;
    }
  }

  .order-types {
    padding: 15px;

    .type-card {
      background-color: white;
      border-radius: 12px;
      padding: 15px;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
      cursor: pointer;
      transition: all 0.3s;
      border: 1px solid #f0f0f0;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
        border-color: #409EFF;
      }

      .card-icon {
        width: 50px;
        height: 50px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 12px;
        color: white;
        font-size: 24px;

        &.bg-express {
          background: linear-gradient(135deg, #409EFF, #66b1ff);
        }
        &.bg-meal {
          background: linear-gradient(135deg, #67c23a, #85ce61);
        }
        &.bg-snack {
          background: linear-gradient(135deg, #e6a23c, #ffc062);
        }
        &.bg-flower {
          background: linear-gradient(135deg, #f56c6c, #f78989);
        }
      }

      .card-info {
        flex: 1;

        h3 {
          font-size: 16px;
          font-weight: 600;
          color: #333;
          margin: 0 0 4px;
        }

        p {
          font-size: 12px;
          color: #999;
          margin: 0;
        }
      }

      .card-price {
        display: flex;
        align-items: center;
        gap: 5px;
        color: #f56c6c;
        font-weight: 600;

        i {
          color: #999;
          font-size: 14px;
        }
      }
    }
  }

  .recent-section {
    background-color: white;
    margin: 15px;
    padding: 15px;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      .title {
        font-size: 16px;
        font-weight: 600;
        color: #333;
      }

      .more {
        font-size: 13px;
        color: #999;
        cursor: pointer;

        &:hover {
          color: #409EFF;
        }
      }
    }

    .recent-list {
      .recent-item {
        display: flex;
        align-items: center;
        padding: 10px 0;
        border-bottom: 1px solid #f0f0f0;
        cursor: pointer;

        &:last-child {
          border-bottom: none;
        }

        .recent-icon {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 10px;
          color: white;
          font-size: 18px;

          &.bg-express {
            background: linear-gradient(135deg, #409EFF, #66b1ff);
          }
          &.bg-meal {
            background: linear-gradient(135deg, #67c23a, #85ce61);
          }
          &.bg-snack {
            background: linear-gradient(135deg, #e6a23c, #ffc062);
          }
          &.bg-flower {
            background: linear-gradient(135deg, #f56c6c, #f78989);
          }
        }

        .recent-info {
          flex: 1;
          display: flex;
          flex-direction: column;

          .recent-type {
            font-size: 14px;
            font-weight: 500;
            color: #333;
            margin-bottom: 2px;
          }

          .recent-address {
            font-size: 12px;
            color: #999;
          }
        }

        i {
          color: #999;
          font-size: 16px;
        }
      }
    }
  }

  .guarantee {
    display: flex;
    justify-content: space-around;
    padding: 20px 15px;
    background-color: white;
    margin: 15px;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);

    .guarantee-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 5px;

      i {
        color: #67c23a;
        font-size: 20px;
      }

      span {
        font-size: 12px;
        color: #666;
      }
    }
  }

  
}
</style>