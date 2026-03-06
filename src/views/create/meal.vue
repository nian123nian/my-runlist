<template>
  <div class="meal-order-page">
    <!-- 顶部导航 -->
    <div class="header">
      <i class="el-icon-arrow-left" @click="goBack"></i>
      <span>代取餐品</span>
      <i class="el-icon-service" @click="showCustomerService"></i>
    </div>

    <!-- 步骤进度条 -->
    <StepProgress :current-step="currentStep" />

    <!-- 步骤1：填写信息 -->
    <div class="step-content" v-if="currentStep === 1">
      <!-- 餐厅选择卡片 -->
      <div class="form-card">
        <div class="card-header">
          <i class="el-icon-food"></i>
          <span>选择餐厅</span>
        </div>

        <!-- 搜索餐厅 -->
        <div class="search-box">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索餐厅名称"
            prefix-icon="el-icon-search"
            clearable
            @input="handleSearch"
          ></el-input>
        </div>

        <!-- 热门餐厅 -->
        <div class="hot-restaurants">
          <div class="section-label">热门餐厅</div>
          <div class="restaurant-grid">
            <div 
              class="restaurant-item" 
              v-for="rest in hotRestaurants" 
              :key="rest.id"
              @click="selectRestaurant(rest)"
            >
              <img :src="rest.logo" :alt="rest.name" class="restaurant-logo">
              <span class="restaurant-name">{{ rest.name }}</span>
            </div>
          </div>
        </div>

        <!-- 附近餐厅列表 -->
        <div class="restaurant-list">
          <div class="section-label">附近餐厅</div>
          <div 
            class="restaurant-card" 
            v-for="rest in nearbyRestaurants" 
            :key="rest.id"
            @click="selectRestaurant(rest)"
          >
            <img :src="rest.image" :alt="rest.name" class="restaurant-img">
            <div class="restaurant-info">
              <div class="restaurant-name">{{ rest.name }}</div>
              <div class="restaurant-rating">
                <el-rate v-model="rest.rating" disabled show-score text-color="#ff9900" score-template="{value}分">
                </el-rate>
              </div>
              <div class="restaurant-address">{{ rest.address }}</div>
              <div class="restaurant-distance">{{ rest.distance }}km</div>
            </div>
            <i class="el-icon-check" v-if="selectedRestaurantId === rest.id"></i>
          </div>
        </div>
      </div>

      <!-- 选中的餐厅 -->
      <div class="form-card" v-if="selectedRestaurant">
        <div class="card-header">
          <i class="el-icon-check"></i>
          <span>已选餐厅：{{ selectedRestaurant.name }}</span>
          <el-button type="text" @click="changeRestaurant">更换</el-button>
        </div>

        <!-- 餐品信息 -->
        <div class="form-item">
          <span class="form-label">餐品名称 <span class="required">*</span></span>
          <el-input 
            v-model="formData.foodName" 
            placeholder="请输入餐品名称"
            size="large"
            clearable
          ></el-input>
        </div>

        <!-- 餐品规格 -->
        <div class="form-item">
          <span class="form-label">餐品规格</span>
          <el-select v-model="formData.foodSpec" placeholder="请选择规格" size="large" clearable>
            <el-option label="小份" value="small"></el-option>
            <el-option label="中份" value="medium"></el-option>
            <el-option label="大份" value="large"></el-option>
            <el-option label="单人餐" value="single"></el-option>
            <el-option label="双人餐" value="double"></el-option>
          </el-select>
        </div>

        <!-- 餐品数量 -->
        <div class="form-item">
          <span class="form-label">数量 <span class="required">*</span></span>
          <el-input-number 
            v-model="formData.quantity" 
            :min="1" 
            :max="20"
            size="large"
            controls-position="right"
          ></el-input-number>
        </div>

        <!-- 口味要求 -->
        <div class="form-item">
          <span class="form-label">口味要求</span>
          <el-input 
            v-model="formData.taste" 
            placeholder="例如：微辣、不要香菜等"
            size="large"
            clearable
          ></el-input>
        </div>

        <!-- 餐品照片 -->
        <div class="form-item">
          <span class="form-label">餐品照片 <span class="optional">(选填)</span></span>
          <el-upload
            action="#"
            list-type="picture-card"
            :auto-upload="false"
            :on-change="handleUploadChange"
            :file-list="formData.images"
            accept="image/*"
          >
            <i class="el-icon-plus"></i>
          </el-upload>
        </div>
      </div>

      <!-- 取餐信息 -->
      <div class="form-card" v-if="selectedRestaurant">
        <div class="card-header">
          <i class="el-icon-location-outline"></i>
          <span>取餐信息</span>
        </div>

        <!-- 取餐方式 -->
        <div class="form-item">
          <span class="form-label">取餐方式</span>
          <el-radio-group v-model="formData.pickupMethod" size="large">
            <el-radio-button label="counter">柜台取餐</el-radio-button>
            <el-radio-button label="takeaway">外卖取餐</el-radio-button>
          </el-radio-group>
        </div>

        <!-- 取餐号/桌号 -->
        <div class="form-item" v-if="formData.pickupMethod === 'counter'">
          <span class="form-label">取餐号</span>
          <el-input 
            v-model="formData.pickupNumber" 
            placeholder="请输入取餐号（如：A001）"
            size="large"
            clearable
          ></el-input>
        </div>

        <!-- 桌号 -->
        <div class="form-item" v-else>
          <span class="form-label">桌号</span>
          <el-input 
            v-model="formData.tableNumber" 
            placeholder="请输入桌号（如：8号桌）"
            size="large"
            clearable
          ></el-input>
        </div>

        <!-- 取餐备注 -->
        <div class="form-item">
          <span class="form-label">取餐备注</span>
          <el-input 
            v-model="formData.pickupRemark" 
            placeholder="例如：在取餐台左边"
            size="large"
            clearable
          ></el-input>
        </div>
      </div>

      <!-- 送达信息 -->
      <AddressSelector 
        ref="addressSelector"
        :type="'delivery'"
        @address-selected="handleAddressSelected"
      />

      <!-- 增值服务 -->
      <ServiceItems 
        ref="serviceItems"
        @service-change="handleServiceChange"
      />

      <!-- 费用预估 -->
      <FeeCard 
        :base-fee="baseFee"
        :tip="formData.tip"
        :insurance="formData.insurance"
      />

      <!-- 协议确认 -->
      <div class="agreement">
        <el-checkbox v-model="formData.agreement"></el-checkbox>
        <span class="agreement-text">
          我已阅读并同意
          <span class="link" @click="showAgreement">《用户服务协议》</span>
        </span>
      </div>

      <!-- 底部按钮 -->
      <div class="bottom-actions">
        <el-button size="large" @click="goBack">取消</el-button>
        <el-button 
          type="primary" 
          size="large" 
          :disabled="!canSubmit"
          @click="submitOrder"
        >
          确认下单
        </el-button>
      </div>
    </div>

    <!-- 步骤2：确认支付（复用ExpressOrder的支付步骤） -->
    <!-- 步骤3：完成（复用ExpressOrder的完成步骤） -->
  </div>
</template>

<script>
import StepProgress from './components/StepProgress.vue'
import AddressSelector from './components/AddressSelector.vue'
import ServiceItems from './components/ServiceItems.vue'
import FeeCard from './components/FeeCard.vue'

export default {
  name: 'MealOrderPage',
  components: {
    StepProgress,
    AddressSelector,
    ServiceItems,
    FeeCard
  },
  data() {
    return {
      currentStep: 1,
      searchKeyword: '',
      hotRestaurants: [
        { id: 1, name: '麦当劳', logo: 'https://example.com/mcd.png', rating: 4.5 },
        { id: 2, name: '肯德基', logo: 'https://example.com/kfc.png', rating: 4.4 },
        { id: 3, name: '海底捞', logo: 'https://example.com/hdl.png', rating: 4.8 },
        { id: 4, name: '必胜客', logo: 'https://example.com/pizza.png', rating: 4.3 }
      ],
      nearbyRestaurants: [
        { 
          id: 5, 
          name: '海底捞火锅(朝阳门店)', 
          image: 'https://example.com/hdl1.jpg',
          rating: 4.8,
          address: '朝阳区朝阳门大街1号',
          distance: 0.5
        },
        { 
          id: 6, 
          name: '麦当劳(王府井店)', 
          image: 'https://example.com/mcd1.jpg',
          rating: 4.5,
          address: '东城区王府井大街2号',
          distance: 0.8
        }
      ],
      selectedRestaurant: null,
      selectedRestaurantId: null,
      formData: {
        foodName: '',
        foodSpec: '',
        quantity: 1,
        taste: '',
        images: [],
        pickupMethod: 'counter',
        pickupNumber: '',
        tableNumber: '',
        pickupRemark: '',
        tip: 0,
        insurance: false,
        agreement: false
      },
      baseFee: 10
    }
  },
  computed: {
    canSubmit() {
      return this.selectedRestaurant && 
             this.formData.foodName && 
             this.formData.quantity &&
             this.formData.agreement
    }
  },
  methods: {
    handleSearch() {
      // 搜索餐厅逻辑
    },
    selectRestaurant(rest) {
      this.selectedRestaurant = rest
      this.selectedRestaurantId = rest.id
    },
    changeRestaurant() {
      this.selectedRestaurant = null
      this.selectedRestaurantId = null
    },
    handleUploadChange(file, fileList) {
      this.formData.images = fileList
    },
    handleAddressSelected(address) {
      this.formData.deliveryAddress = address
    },
    handleServiceChange(data) {
      this.formData.tip = data.tip
      this.formData.insurance = data.insurance
    },
    submitOrder() {
      // 提交订单逻辑
      this.currentStep = 2
    },
    goBack() {
      this.$router.back()
    },
    showCustomerService() {
      this.$message.info('客服热线：400-123-4567')
    },
    showAgreement() {
      this.$message.info('显示用户服务协议')
    }
  }
}
</script>

<style scoped lang="scss">
.meal-order-page {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding-bottom: 80px;

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

  .step-content {
    padding: 15px;
  }

  .form-card {
    background-color: white;
    border-radius: 12px;
    padding: 15px;
    margin-bottom: 15px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);

    .card-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 1px solid #f0f0f0;

      i {
        font-size: 18px;
        color: #409EFF;
      }

      span {
        font-size: 15px;
        font-weight: 600;
        color: #333;
        flex: 1;
      }
    }

    .form-item {
      margin-bottom: 15px;

      .form-label {
        display: block;
        font-size: 14px;
        color: #666;
        margin-bottom: 8px;

        .required {
          color: #f56c6c;
          margin-left: 2px;
        }

        .optional {
          color: #999;
          margin-left: 2px;
        }
      }
    }

    .section-label {
      font-size: 14px;
      font-weight: 500;
      color: #333;
      margin-bottom: 10px;
    }

    .search-box {
      margin-bottom: 15px;
    }

    .restaurant-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin-bottom: 20px;

      .restaurant-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 5px;
        cursor: pointer;
        padding: 8px;
        border-radius: 8px;
        transition: all 0.3s;

        &:hover {
          background-color: #f5f7fa;
        }

        .restaurant-logo {
          width: 40px;
          height: 40px;
          border-radius: 20px;
          object-fit: cover;
        }

        .restaurant-name {
          font-size: 12px;
          color: #666;
          text-align: center;
        }
      }
    }

    .restaurant-card {
      display: flex;
      padding: 12px 0;
      border-bottom: 1px solid #f0f0f0;
      cursor: pointer;
      position: relative;

      &:last-child {
        border-bottom: none;
      }

      .restaurant-img {
        width: 60px;
        height: 60px;
        border-radius: 8px;
        object-fit: cover;
        margin-right: 12px;
      }

      .restaurant-info {
        flex: 1;

        .restaurant-name {
          font-size: 15px;
          font-weight: 600;
          color: #333;
          margin-bottom: 4px;
        }

        .restaurant-rating {
          margin-bottom: 4px;
        }

        .restaurant-address {
          font-size: 12px;
          color: #999;
          margin-bottom: 2px;
        }

        .restaurant-distance {
          font-size: 12px;
          color: #409EFF;
        }
      }

      .el-icon-check {
        position: absolute;
        right: 0;
        top: 50%;
        transform: translateY(-50%);
        color: #67c23a;
        font-size: 20px;
      }
    }
  }

  .agreement {
    padding: 15px;
    display: flex;
    align-items: center;
    gap: 8px;

    .agreement-text {
      font-size: 13px;
      color: #666;

      .link {
        color: #409EFF;
        cursor: pointer;

        &:hover {
          text-decoration: underline;
        }
      }
    }
  }

  .bottom-actions {
    display: flex;
    gap: 10px;
    padding: 15px;

    .el-button {
      flex: 1;
      height: 44px;
      border-radius: 22px;
    }
  }
}
</style>