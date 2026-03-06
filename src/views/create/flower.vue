<template>
  <div class="flower-order-page">
    <!-- 顶部导航栏 -->
    <div class="header">
      <i class="el-icon-arrow-left" @click="goBack"></i>
      <span>代送鲜花</span>
      <i class="el-icon-service" @click="showCustomerService"></i>
    </div>

    <!-- 下单流程步骤条 -->
    <StepProgress :current-step="currentStep" />

    <!-- 步骤1：填写订单信息 -->
    <div class="step-content" v-if="currentStep === 1">
      <!-- 鲜花选择卡片 -->
      <div class="form-card">
        <div class="card-header">
          <i class="el-icon-flower"></i>
          <span>选择鲜花</span>
          <el-button type="text" @click="showRecommendations">推荐款式</el-button>
        </div>

        <!-- 鲜花分类 -->
        <div class="flower-categories">
          <div 
            class="category-item" 
            v-for="cat in categories" 
            :key="cat.id"
            :class="{ active: selectedCategory === cat.id }"
            @click="selectedCategory = cat.id"
          >
            <i :class="cat.icon"></i>
            <span>{{ cat.name }}</span>
          </div>
        </div>

        <!-- 鲜花列表 -->
        <div class="flower-list">
          <div 
            class="flower-card" 
            v-for="flower in filteredFlowers" 
            :key="flower.id"
            @click="selectFlower(flower)"
          >
            <img :src="flower.image" :alt="flower.name" class="flower-img">
            <div class="flower-info">
              <div class="flower-name">{{ flower.name }}</div>
              <div class="flower-desc">{{ flower.description }}</div>
              <div class="flower-price">¥{{ flower.price }}</div>
              <div class="flower-sold">{{ flower.soldCount }}人最近购买</div>
            </div>
            <div class="flower-badge" v-if="flower.hot">🔥 热卖</div>
            <div class="flower-badge" v-else-if="flower.recommend">✨ 推荐</div>
            <i class="el-icon-check" v-if="selectedFlowerId === flower.id"></i>
          </div>
        </div>

        <!-- 选中的鲜花 -->
        <div class="selected-flower" v-if="selectedFlower">
          <div class="flower-detail">
            <span class="label">已选花束：</span>
            <span class="value">{{ selectedFlower.name }}</span>
          </div>
          <div class="flower-detail">
            <span class="label">数量：</span>
            <el-input-number 
              v-model="formData.quantity" 
              :min="1" 
              :max="99"
              size="medium"
            ></el-input-number>
          </div>
          <div class="flower-detail" v-if="selectedFlower.hasPackaging">
            <span class="label">包装选择：</span>
            <el-radio-group v-model="formData.packaging" size="small">
              <el-radio-button label="simple">简约包装</el-radio-button>
              <el-radio-button label="luxury">豪华包装</el-radio-button>
              <el-radio-button label="custom">定制包装</el-radio-button>
            </el-radio-group>
          </div>
        </div>

        <!-- 自定义花束 -->
        <div class="custom-flower">
          <el-checkbox v-model="formData.isCustom">自定义花束</el-checkbox>
          <div class="custom-inputs" v-if="formData.isCustom">
            <el-input 
              v-model="formData.customFlower" 
              placeholder="请输入花束要求（如：11朵红玫瑰+满天星）"
              size="large"
            ></el-input>
            <div class="custom-tips">
              <span>常见搭配：</span>
              <el-tag size="small" @click="quickCustom('11朵红玫瑰')">11朵红玫瑰</el-tag>
              <el-tag size="small" @click="quickCustom('19朵粉玫瑰')">19朵粉玫瑰</el-tag>
              <el-tag size="small" @click="quickCustom('33朵康乃馨')">33朵康乃馨</el-tag>
              <el-tag size="small" @click="quickCustom('混搭花束')">混搭花束</el-tag>
            </div>
          </div>
        </div>
      </div>

      <!-- 花店选择卡片 -->
      <div class="form-card">
        <div class="card-header">
          <i class="el-icon-shop"></i>
          <span>选择花店</span>
          <span class="header-tip">按距离排序</span>
        </div>

        <div class="shop-list">
          <div 
            class="shop-card" 
            v-for="shop in flowerShops" 
            :key="shop.id"
            :class="{ selected: selectedShopId === shop.id }"
            @click="selectShop(shop)"
          >
            <img :src="shop.logo" :alt="shop.name" class="shop-logo">
            <div class="shop-info">
              <div class="shop-name">
                {{ shop.name }}
                <span class="shop-tag" v-if="shop.tag">{{ shop.tag }}</span>
              </div>
              <div class="shop-rating">
                <el-rate v-model="shop.rating" disabled show-score text-color="#ff9900"></el-rate>
              </div>
              <div class="shop-address">{{ shop.address }}</div>
              <div class="shop-meta">
                <span class="shop-distance">{{ shop.distance }}km</span>
                <span class="shop-time">约{{ shop.deliveryTime }}分钟送达</span>
              </div>
            </div>
            <div class="shop-price" v-if="shop.minPrice">
              起送 ¥{{ shop.minPrice }}
            </div>
            <i class="el-icon-check" v-if="selectedShopId === shop.id"></i>
          </div>
        </div>

        <div class="form-item" v-if="selectedShop">
          <span class="form-label">花店地址</span>
          <el-input 
            v-model="formData.shopAddress" 
            :placeholder="selectedShop.address"
            size="large"
            readonly
          >
            <i slot="prefix" class="el-icon-location"></i>
          </el-input>
        </div>
      </div>

      <!-- 取花信息卡片 -->
      <div class="form-card">
        <div class="card-header">
          <i class="el-icon-location-outline"></i>
          <span>取花信息</span>
        </div>

        <div class="form-item">
          <span class="form-label">取花时间 <span class="required">*</span></span>
          <el-date-picker
            v-model="formData.pickupTime"
            type="datetime"
            placeholder="选择取花时间"
            size="large"
            :picker-options="pickupPickerOptions"
            format="yyyy-MM-dd HH:mm"
            value-format="yyyy-MM-dd HH:mm"
            style="width: 100%;"
          >
          </el-date-picker>
        </div>

        <div class="form-item">
          <span class="form-label">取花备注</span>
          <el-input 
            v-model="formData.pickupRemark" 
            placeholder="例如：需要丝带、贺卡、保鲜等"
            size="large"
            clearable
          >
            <i slot="prefix" class="el-icon-edit"></i>
          </el-input>
        </div>
      </div>

      <!-- 贺卡信息卡片 -->
      <div class="form-card">
        <div class="card-header">
          <i class="el-icon-message"></i>
          <span>贺卡信息</span>
        </div>

        <div class="form-item">
          <span class="form-label">是否需要贺卡</span>
          <el-radio-group v-model="formData.needCard" size="large">
            <el-radio-button :label="true">
              <i class="el-icon-check"></i> 需要
            </el-radio-button>
            <el-radio-button :label="false">
              <i class="el-icon-close"></i> 不需要
            </el-radio-button>
          </el-radio-group>
        </div>

        <div class="form-item" v-if="formData.needCard">
          <span class="form-label">贺卡类型</span>
          <el-select v-model="formData.cardType" placeholder="选择贺卡风格" size="large">
            <el-option label="温馨祝福" value="warm"></el-option>
            <el-option label="浪漫爱情" value="romantic"></el-option>
            <el-option label="友谊长存" value="friendship"></el-option>
            <el-option label="商务礼仪" value="business"></el-option>
          </el-select>
        </div>

        <div class="form-item" v-if="formData.needCard">
          <span class="form-label">祝福语</span>
          <el-input
            type="textarea"
            :rows="4"
            v-model="formData.cardMessage"
            placeholder="请输入祝福语（如：生日快乐、我爱你、感谢等）"
            maxlength="200"
            show-word-limit
          ></el-input>
          <div class="suggestions" v-if="formData.cardType">
            <span>常用祝福：</span>
            <el-tag 
              size="small" 
              v-for="(msg, index) in cardSuggestions" 
              :key="index"
              @click="formData.cardMessage = msg"
            >
              {{ msg }}
            </el-tag>
          </div>
        </div>

        <div class="form-item" v-if="formData.needCard">
          <span class="form-label">署名</span>
          <el-input 
            v-model="formData.signature" 
            placeholder="例如：爱你的XX、你的朋友XX等"
            size="large"
          ></el-input>
        </div>
      </div>

      <!-- 送达信息卡片 -->
      <div class="form-card">
        <div class="card-header">
          <i class="el-icon-location"></i>
          <span>送达信息</span>
        </div>

        <div class="form-item">
          <span class="form-label">收花人 <span class="required">*</span></span>
          <el-input 
            v-model="formData.receiverName" 
            placeholder="请输入收花人姓名"
            size="large"
            clearable
          >
            <i slot="prefix" class="el-icon-user"></i>
          </el-input>
        </div>

        <div class="form-item">
          <span class="form-label">联系电话 <span class="required">*</span></span>
          <el-input 
            v-model="formData.receiverPhone" 
            placeholder="请输入收花人电话"
            size="large"
            clearable
          >
            <i slot="prefix" class="el-icon-phone"></i>
          </el-input>
        </div>

        <div class="form-item">
          <span class="form-label">送达地址 <span class="required">*</span></span>
          <div class="address-selector" @click="openDeliveryAddressDialog">
            <div class="address-info" v-if="formData.deliveryAddress">
              <div class="address-name">{{ formData.deliveryAddress.name }} {{ formData.deliveryAddress.phone }}</div>
              <div class="address-detail">{{ formData.deliveryAddress.address }} {{ formData.deliveryAddress.detail }}</div>
            </div>
            <div class="address-placeholder" v-else>
              请选择送达地址
            </div>
            <i class="el-icon-arrow-right"></i>
          </div>
        </div>

        <div class="form-item">
          <span class="form-label">送达时间要求</span>
          <el-radio-group v-model="formData.deliveryTimeType" size="large">
            <el-radio-button label="asap">尽快送达</el-radio-button>
            <el-radio-button label="scheduled">指定时间</el-radio-button>
            <el-radio-button label="timing">定时送达</el-radio-button>
          </el-radio-group>
        </div>

        <div class="form-item" v-if="formData.deliveryTimeType === 'scheduled'">
          <el-date-picker
            v-model="formData.deliveryTime"
            type="datetime"
            placeholder="选择送达时间"
            size="large"
            :picker-options="deliveryPickerOptions"
            format="yyyy-MM-dd HH:mm"
            value-format="yyyy-MM-dd HH:mm"
            style="width: 100%;"
          >
          </el-date-picker>
        </div>

        <div class="form-item" v-if="formData.deliveryTimeType === 'timing'">
          <el-time-select
            v-model="formData.deliveryTime"
            :picker-options="{
              start: '08:00',
              step: '00:30',
              end: '22:00'
            }"
            placeholder="选择送达时间"
            size="large"
            style="width: 100%;"
          >
          </el-time-select>
        </div>

        <div class="form-item">
          <span class="form-label">送达备注</span>
          <el-input 
            v-model="formData.deliveryRemark" 
            placeholder="例如：请提前电话联系、放在前台等"
            size="large"
            clearable
          >
            <i slot="prefix" class="el-icon-edit"></i>
          </el-input>
        </div>
      </div>

      <!-- 增值服务卡片 -->
      <div class="form-card">
        <div class="card-header">
          <i class="el-icon-star-on"></i>
          <span>增值服务</span>
        </div>

        <!-- 小费激励 -->
        <div class="service-item">
          <div class="service-info">
            <span class="service-name">小费激励</span>
            <span class="service-desc">打赏骑手，接单更快</span>
          </div>
          <div class="tip-options">
            <el-radio-group v-model="formData.tip" size="medium">
              <el-radio-button :label="0">无</el-radio-button>
              <el-radio-button :label="3">¥3</el-radio-button>
              <el-radio-button :label="5">¥5</el-radio-button>
              <el-radio-button :label="8">¥8</el-radio-button>
              <el-radio-button :label="10">¥10</el-radio-button>
            </el-radio-group>
          </div>
        </div>

        <!-- 保鲜服务 -->
        <div class="service-item">
          <div class="service-info">
            <span class="service-name">鲜花保鲜</span>
            <span class="service-desc">专业保鲜处理，保持鲜花新鲜</span>
          </div>
          <el-switch
            v-model="formData.freshness"
            active-color="#409EFF"
            inactive-color="#dcdfe6"
          >
          </el-switch>
          <span class="service-fee" v-if="formData.freshness">+¥5</span>
        </div>

        <!-- 精美包装 -->
        <div class="service-item">
          <div class="service-info">
            <span class="service-name">精美包装</span>
            <span class="service-desc">升级为礼品级包装</span>
          </div>
          <el-switch
            v-model="formData.giftWrapping"
            active-color="#409EFF"
            inactive-color="#dcdfe6"
          >
          </el-switch>
          <span class="service-fee" v-if="formData.giftWrapping">+¥8</span>
        </div>

        <!-- 保险服务 -->
        <div class="service-item">
          <div class="service-info">
            <span class="service-name">鲜花保险</span>
            <span class="service-desc">保价¥500，保障鲜花安全</span>
          </div>
          <el-switch
            v-model="formData.insurance"
            active-color="#409EFF"
            inactive-color="#dcdfe6"
          >
          </el-switch>
          <span class="service-fee" v-if="formData.insurance">+¥2</span>
        </div>
      </div>

      <!-- 费用预估卡片 -->
      <div class="fee-card">
        <div class="fee-item">
          <span>基础跑腿费</span>
          <span>¥{{ baseFee }}</span>
        </div>
        <div class="fee-item" v-if="selectedFlower && !formData.isCustom">
          <span>鲜花费用 ({{ formData.quantity }}束)</span>
          <span>¥{{ flowerTotal }}</span>
        </div>
        <div class="fee-item" v-if="formData.isCustom && formData.customFlower">
          <span>自定义花束</span>
          <span>待协商</span>
        </div>
        <div class="fee-item" v-if="formData.tip > 0">
          <span>小费</span>
          <span>+¥{{ formData.tip }}</span>
        </div>
        <div class="fee-item" v-if="formData.freshness">
          <span>保鲜服务</span>
          <span>+¥5</span>
        </div>
        <div class="fee-item" v-if="formData.giftWrapping">
          <span>精美包装</span>
          <span>+¥8</span>
        </div>
        <div class="fee-item" v-if="formData.insurance">
          <span>鲜花保险</span>
          <span>+¥2</span>
        </div>
        <div class="fee-item total">
          <span>预估总价</span>
          <span>¥{{ estimatedTotal }}</span>
        </div>
      </div>

      <!-- 协议确认 -->
      <div class="agreement">
        <el-checkbox v-model="formData.agreement"></el-checkbox>
        <span class="agreement-text">
          我已阅读并同意
          <span class="link" @click="showAgreement">《用户服务协议》</span>
          和
          <span class="link" @click="showPrivacy">《隐私政策》</span>
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
          :loading="submitting"
        >
          确认下单
        </el-button>
      </div>
    </div>

    <!-- 步骤2：确认支付（简化版） -->
    <div class="step-content" v-if="currentStep === 2">
      <div class="confirm-card">
        <div class="confirm-header">
          <i class="el-icon-success"></i>
          <span>订单提交成功，请完成支付</span>
        </div>

        <div class="order-summary">
          <div class="summary-item">
            <span class="label">订单编号：</span>
            <span class="value">{{ tempOrder.orderNo }}</span>
            <el-button type="text" size="small" @click="copyOrderNo">复制</el-button>
          </div>
          <div class="summary-item">
            <span class="label">鲜花信息：</span>
            <span class="value">{{ tempOrder.flowerInfo }}</span>
          </div>
          <div class="summary-item">
            <span class="label">订单金额：</span>
            <span class="value price">¥{{ estimatedTotal }}</span>
          </div>
        </div>

        <!-- 支付方式 -->
        <div class="payment-section">
          <div class="section-title">选择支付方式</div>
          <div class="payment-methods">
            <div 
              class="payment-method" 
              :class="{ active: paymentMethod === 'wechat' }"
              @click="paymentMethod = 'wechat'"
            >
              <i class="el-icon-wechat"></i>
              <span>微信支付</span>
              <i class="el-icon-check" v-if="paymentMethod === 'wechat'"></i>
            </div>
            <div 
              class="payment-method" 
              :class="{ active: paymentMethod === 'alipay' }"
              @click="paymentMethod = 'alipay'"
            >
              <i class="el-icon-alipay"></i>
              <span>支付宝</span>
              <i class="el-icon-check" v-if="paymentMethod === 'alipay'"></i>
            </div>
            <div 
              class="payment-method" 
              :class="{ active: paymentMethod === 'balance' }"
              @click="paymentMethod = 'balance'"
            >
              <i class="el-icon-money"></i>
              <span>余额支付</span>
              <i class="el-icon-check" v-if="paymentMethod === 'balance'"></i>
              <span class="balance-amount">(可用: ¥{{ userBalance }})</span>
            </div>
          </div>
        </div>

        <!-- 倒计时 -->
        <div class="timeout-tip">
          <i class="el-icon-time"></i>
          <span>请在 <span class="time">{{ countdownText }}</span> 内完成支付</span>
        </div>

        <!-- 底部按钮 -->
        <div class="bottom-actions">
          <el-button size="large" @click="currentStep = 1">返回修改</el-button>
          <el-button 
            type="primary" 
            size="large" 
            :loading="paying"
            @click="handlePay"
          >
            ￥{{ estimatedTotal }} 确认支付
          </el-button>
        </div>
      </div>
    </div>

    <!-- 步骤3：完成（简化版） -->
    <div class="step-content success-step" v-if="currentStep === 3">
      <div class="success-animation">
        <i class="el-icon-success"></i>
      </div>
      <h3>下单成功！</h3>
      <p class="success-desc">您的鲜花订单已提交，骑手正在前往花店</p>
      
      <div class="order-info-card">
        <div class="info-row">
          <span class="info-label">订单编号：</span>
          <span class="info-value">{{ finalOrder.orderNo }}</span>
          <el-button type="text" size="small" @click="copyOrderNo">复制</el-button>
        </div>
        <div class="info-row">
          <span class="info-label">收花人：</span>
          <span class="info-value">{{ finalOrder.receiverName }} {{ finalOrder.receiverPhone }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">送达地址：</span>
          <span class="info-value">{{ finalOrder.deliveryAddress?.address }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">预计送达：</span>
          <span class="info-value">{{ estimatedDeliveryTime }}</span>
        </div>
      </div>

      <div class="success-actions">
        <el-button size="large" @click="viewOrderDetail">查看订单详情</el-button>
        <el-button type="primary" size="large" @click="goHome">返回首页</el-button>
        <el-button size="large" @click="createAnother" plain>再下一单</el-button>
      </div>
    </div>

    <!-- 地址选择弹窗 -->
    <el-dialog 
      title="选择送达地址" 
      :visible.sync="addressDialog.visible" 
      width="90%"
      class="address-dialog"
    >
      <div class="address-list">
        <div 
          class="address-item" 
          v-for="addr in userAddresses" 
          :key="addr.id"
          @click="selectAddress(addr)"
        >
          <div class="address-content">
            <div class="address-name">
              <span>{{ addr.name }}</span>
              <span class="address-phone">{{ addr.phone }}</span>
              <span class="address-tag" v-if="addr.isDefault">默认</span>
            </div>
            <div class="address-detail">{{ addr.address }} {{ addr.detail }}</div>
          </div>
          <i class="el-icon-check" v-if="selectedAddressId === addr.id"></i>
        </div>
      </div>
      <div class="add-address" @click="addNewAddress">
        <i class="el-icon-plus"></i>
        <span>新增地址</span>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import StepProgress from './components/StepProgress.vue'

export default {
  name: 'FlowerOrderPage',
  components: {
    StepProgress
  },
  data() {
    return {
      currentStep: 1,
      submitting: false,
      paying: false,
      selectedCategory: 1,
      selectedFlower: null,
      selectedFlowerId: null,
      selectedShop: null,
      selectedShopId: null,
      
      categories: [
        { id: 1, name: '玫瑰', icon: 'el-icon-flower' },
        { id: 2, name: '百合', icon: 'el-icon-flower' },
        { id: 3, name: '康乃馨', icon: 'el-icon-flower' },
        { id: 4, name: '向日葵', icon: 'el-icon-flower' },
        { id: 5, name: '混搭', icon: 'el-icon-flower' }
      ],
      
      flowers: [
        { 
          id: 1, 
          categoryId: 1, 
          name: '红玫瑰', 
          description: '热情似火，表达爱意', 
          price: 99, 
          image: 'https://via.placeholder.com/80',
          soldCount: 128,
          hot: true,
          hasPackaging: true
        },
        { 
          id: 2, 
          categoryId: 1, 
          name: '粉玫瑰', 
          description: '初恋般的感觉', 
          price: 89, 
          image: 'https://via.placeholder.com/80',
          soldCount: 96,
          hasPackaging: true
        },
        { 
          id: 3, 
          categoryId: 1, 
          name: '白玫瑰', 
          description: '纯洁的爱情', 
          price: 89, 
          image: 'https://via.placeholder.com/80',
          soldCount: 72,
          hasPackaging: true
        },
        { 
          id: 4, 
          categoryId: 2, 
          name: '白百合', 
          description: '纯洁、庄严', 
          price: 79, 
          image: 'https://via.placeholder.com/80',
          soldCount: 54,
          recommend: true,
          hasPackaging: true
        },
        { 
          id: 5, 
          categoryId: 3, 
          name: '康乃馨', 
          description: '母爱、温馨', 
          price: 69, 
          image: 'https://via.placeholder.com/80',
          soldCount: 88,
          hasPackaging: true
        },
        { 
          id: 6, 
          categoryId: 4, 
          name: '向日葵', 
          description: '阳光、希望', 
          price: 59, 
          image: 'https://via.placeholder.com/80',
          soldCount: 65,
          hasPackaging: true
        },
        { 
          id: 7, 
          categoryId: 5, 
          name: '浪漫混搭', 
          description: '玫瑰+百合+满天星', 
          price: 129, 
          image: 'https://via.placeholder.com/80',
          soldCount: 103,
          hot: true,
          hasPackaging: true
        }
      ],
      
      flowerShops: [
        { 
          id: 1, 
          name: '花间小筑', 
          logo: 'https://via.placeholder.com/50',
          rating: 4.8,
          address: '朝阳区朝阳门外大街18号',
          distance: 1.2,
          deliveryTime: 25,
          minPrice: 59,
          tag: '网红店'
        },
        { 
          id: 2, 
          name: '玫瑰人生', 
          logo: 'https://via.placeholder.com/50',
          rating: 4.7,
          address: '东城区王府井大街138号',
          distance: 1.8,
          deliveryTime: 30,
          minPrice: 69,
          tag: '品牌店'
        },
        { 
          id: 3, 
          name: '花点时间', 
          logo: 'https://via.placeholder.com/50',
          rating: 4.6,
          address: '海淀区中关村大街15号',
          distance: 2.3,
          deliveryTime: 35,
          minPrice: 49
        },
        { 
          id: 4, 
          name: '鲜花小镇', 
          logo: 'https://via.placeholder.com/50',
          rating: 4.5,
          address: '西城区西单北大街120号',
          distance: 2.5,
          deliveryTime: 35,
          minPrice: 39
        }
      ],
      
      userAddresses: [
        { id: 1, name: '张三', phone: '13800138001', address: '北京市朝阳区某某大厦', detail: 'A座8层801室', isDefault: true },
        { id: 2, name: '张三', phone: '13800138001', address: '北京市海淀区某某小区', detail: '3号楼202室', isDefault: false }
      ],
      
      formData: {
        quantity: 1,
        packaging: 'simple',
        isCustom: false,
        customFlower: '',
        shopAddress: '',
        pickupTime: '',
        pickupRemark: '',
        needCard: true,
        cardType: 'warm',
        cardMessage: '',
        signature: '',
        receiverName: '',
        receiverPhone: '',
        deliveryAddress: null,
        deliveryTimeType: 'asap',
        deliveryTime: '',
        deliveryRemark: '',
        tip: 0,
        freshness: false,
        giftWrapping: false,
        insurance: false,
        agreement: false
      },
      
      baseFee: 15,
      tempOrder: {},
      finalOrder: {},
      paymentMethod: 'wechat',
      userBalance: 100,
      countdown: 900,
      countdownTimer: null,
      addressDialog: {
        visible: false
      },
      selectedAddressId: null,
      estimatedDeliveryTime: '',
      
      pickupPickerOptions: {
        disabledDate(time) {
          return time.getTime() < Date.now() - 8.64e7
        },
        shortcuts: [{
          text: '1小时后',
          onClick(picker) {
            const date = new Date()
            date.setTime(date.getTime() + 3600 * 1000)
            picker.$emit('pick', date)
          }
        }, {
          text: '2小时后',
          onClick(picker) {
            const date = new Date()
            date.setTime(date.getTime() + 7200 * 1000)
            picker.$emit('pick', date)
          }
        }]
      },
      
      deliveryPickerOptions: {
        disabledDate(time) {
          return time.getTime() < Date.now()
        }
      },
      
      cardSuggestions: {
        warm: ['祝您生日快乐，万事如意', '感谢您的帮助，祝好', '祝您身体健康，天天开心'],
        romantic: ['我爱你，一生一世', '遇见你是我最大的幸福', '愿我们的爱情长长久久'],
        friendship: ['感谢你的陪伴', '友谊长存', '祝你前程似锦'],
        business: ['祝生意兴隆', '合作愉快', '感谢支持']
      }
    }
  },
  computed: {
    filteredFlowers() {
      return this.flowers.filter(f => f.categoryId === this.selectedCategory)
    },
    
    flowerTotal() {
      if (this.selectedFlower && !this.formData.isCustom) {
        return (this.selectedFlower.price * this.formData.quantity).toFixed(2)
      }
      return '0.00'
    },
    
    estimatedTotal() {
      let total = this.baseFee
      
      if (this.selectedFlower && !this.formData.isCustom) {
        total += parseFloat(this.flowerTotal)
      }
      
      if (this.formData.tip > 0) total += this.formData.tip
      if (this.formData.freshness) total += 5
      if (this.formData.giftWrapping) total += 8
      if (this.formData.insurance) total += 2
      
      return total.toFixed(2)
    },
    
    canSubmit() {
      const hasFlower = this.selectedFlower || (this.formData.isCustom && this.formData.customFlower)
      return hasFlower && 
             this.selectedShop &&
             this.formData.pickupTime &&
             this.formData.receiverName &&
             this.formData.receiverPhone &&
             this.formData.deliveryAddress &&
             this.formData.agreement
    },
    
    countdownText() {
      const minutes = Math.floor(this.countdown / 60)
      const seconds = this.countdown % 60
      return `${minutes}:${seconds.toString().padStart(2, '0')}`
    }
  },
  created() {
    this.loadUserInfo()
  },
  destroyed() {
    this.clearCountdown()
  },
  methods: {
    loadUserInfo() {
      try {
        const userInfoStr = localStorage.getItem('userInfo')
        const userInfo = JSON.parse(userInfoStr || '{}')
        this.userBalance = userInfo.balance || 100
      } catch (e) {
        console.error('加载用户信息失败', e)
      }
    },
    
    selectFlower(flower) {
      this.selectedFlower = flower
      this.selectedFlowerId = flower.id
      this.formData.isCustom = false
    },
    
    selectShop(shop) {
      this.selectedShop = shop
      this.selectedShopId = shop.id
      this.formData.shopAddress = shop.address
    },
    
    quickCustom(text) {
      this.formData.customFlower = text
    },
    
    showRecommendations() {
      this.$message.info('显示推荐款式')
    },
    
    openDeliveryAddressDialog() {
      this.addressDialog.visible = true
    },
    
    selectAddress(addr) {
      this.formData.deliveryAddress = addr
      this.selectedAddressId = addr.id
      this.addressDialog.visible = false
    },
    
    addNewAddress() {
      this.$message.info('跳转到地址管理页面')
      this.addressDialog.visible = false
    },
    
    async submitOrder() {
      this.submitting = true
      
      try {
        const flowerInfo = this.formData.isCustom 
          ? this.formData.customFlower 
          : `${this.selectedFlower.name} x${this.formData.quantity}`
        
        const orderData = {
          orderType: 'flower',
          flowerInfo,
          shopName: this.selectedShop.name,
          shopAddress: this.selectedShop.address,
          pickupTime: this.formData.pickupTime,
          pickupRemark: this.formData.pickupRemark,
          needCard: this.formData.needCard,
          cardType: this.formData.cardType,
          cardMessage: this.formData.cardMessage,
          signature: this.formData.signature,
          receiverName: this.formData.receiverName,
          receiverPhone: this.formData.receiverPhone,
          deliveryAddress: this.formData.deliveryAddress,
          deliveryTimeType: this.formData.deliveryTimeType,
          deliveryTime: this.formData.deliveryTime,
          deliveryRemark: this.formData.deliveryRemark,
          tip: this.formData.tip,
          freshness: this.formData.freshness,
          giftWrapping: this.formData.giftWrapping,
          insurance: this.formData.insurance,
          amount: this.estimatedTotal
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        this.tempOrder = {
          id: Date.now(),
          orderNo: 'FL' + Date.now().toString().slice(-8),
          flowerInfo,
          receiverName: this.formData.receiverName,
          receiverPhone: this.formData.receiverPhone,
          deliveryAddress: this.formData.deliveryAddress,
          ...orderData
        }
        
        this.currentStep = 2
        this.startCountdown()
      } catch (error) {
        this.$message.error('提交订单失败，请重试')
      } finally {
        this.submitting = false
      }
    },
    
    startCountdown() {
      this.countdown = 900
      this.countdownTimer = setInterval(() => {
        if (this.countdown > 0) {
          this.countdown--
        } else {
          this.clearCountdown()
          this.$message.warning('支付超时，订单已自动取消')
          this.currentStep = 1
        }
      }, 1000)
    },
    
    clearCountdown() {
      if (this.countdownTimer) {
        clearInterval(this.countdownTimer)
        this.countdownTimer = null
      }
    },
    
    async handlePay() {
      this.paying = true
      
      try {
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        this.clearCountdown()
        this.finalOrder = { ...this.tempOrder }
        this.estimatedDeliveryTime = this.calcEstimatedDeliveryTime()
        this.currentStep = 3
        
        this.$message.success('支付成功')
      } catch (error) {
        this.$message.error('支付失败，请重试')
      } finally {
        this.paying = false
      }
    },
    
    calcEstimatedDeliveryTime() {
      const now = new Date()
      now.setMinutes(now.getMinutes() + 50)
      const hours = now.getHours().toString().padStart(2, '0')
      const minutes = now.getMinutes().toString().padStart(2, '0')
      return `今天 ${hours}:${minutes}`
    },
    
    copyOrderNo() {
      const orderNo = this.finalOrder.orderNo || this.tempOrder.orderNo
      navigator.clipboard?.writeText(orderNo)
      this.$message.success('订单号已复制')
    },
    
    viewOrderDetail() {
      this.$router.push(`/order/detail/${this.finalOrder.id}`)
    },
    
    createAnother() {
      this.currentStep = 1
      this.selectedFlower = null
      this.selectedFlowerId = null
      this.selectedShop = null
      this.selectedShopId = null
      this.formData = {
        quantity: 1,
        packaging: 'simple',
        isCustom: false,
        customFlower: '',
        shopAddress: '',
        pickupTime: '',
        pickupRemark: '',
        needCard: true,
        cardType: 'warm',
        cardMessage: '',
        signature: '',
        receiverName: '',
        receiverPhone: '',
        deliveryAddress: null,
        deliveryTimeType: 'asap',
        deliveryTime: '',
        deliveryRemark: '',
        tip: 0,
        freshness: false,
        giftWrapping: false,
        insurance: false,
        agreement: false
      }
    },
    
    goHome() {
      this.$router.push('/home')
    },
    
    goBack() {
      if (this.currentStep === 1) {
        this.$confirm('确定要取消创建订单吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$router.back()
        }).catch(() => {})
      } else if (this.currentStep === 2) {
        this.currentStep = 1
        this.clearCountdown()
      } else {
        this.$router.back()
      }
    },
    
    showCustomerService() {
      this.$message.info('客服热线：400-123-4567')
    },
    
    showAgreement() {
      this.$message.info('显示用户服务协议')
    },
    
    showPrivacy() {
      this.$message.info('显示隐私政策')
    }
  }
}
</script>

<style scoped lang="scss">
.flower-order-page {
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

      .header-tip {
        font-size: 12px;
        color: #999;
        font-weight: normal;
      }
    }

    .flower-categories {
      display: flex;
      gap: 10px;
      margin-bottom: 15px;
      overflow-x: auto;
      padding-bottom: 5px;

      &::-webkit-scrollbar {
        display: none;
      }

      .category-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 5px;
        padding: 8px 12px;
        background-color: #f5f7fa;
        border-radius: 8px;
        min-width: 60px;
        cursor: pointer;
        transition: all 0.3s;

        i {
          font-size: 20px;
          color: #999;
        }

        span {
          font-size: 12px;
          color: #666;
        }

        &.active {
          background-color: #ecf5ff;

          i, span {
            color: #409EFF;
          }
        }
      }
    }

    .flower-list {
      .flower-card {
        display: flex;
        padding: 12px;
        border-bottom: 1px solid #f0f0f0;
        cursor: pointer;
        position: relative;

        &:hover {
          background-color: #f5f7fa;
        }

        .flower-img {
          width: 70px;
          height: 70px;
          border-radius: 8px;
          object-fit: cover;
          margin-right: 12px;
        }

        .flower-info {
          flex: 1;

          .flower-name {
            font-size: 15px;
            font-weight: 600;
            color: #333;
            margin-bottom: 4px;
          }

          .flower-desc {
            font-size: 12px;
            color: #999;
            margin-bottom: 4px;
          }

          .flower-price {
            font-size: 16px;
            color: #f56c6c;
            font-weight: 600;
            margin-bottom: 2px;
          }

          .flower-sold {
            font-size: 11px;
            color: #999;
          }
        }

        .flower-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          padding: 2px 6px;
          background-color: #fef0f0;
          color: #f56c6c;
          font-size: 10px;
          border-radius: 4px;
        }

        .el-icon-check {
          position: absolute;
          bottom: 12px;
          right: 12px;
          color: #67c23a;
          font-size: 20px;
        }
      }
    }

    .selected-flower {
      margin-top: 15px;
      padding: 12px;
      background-color: #f5f7fa;
      border-radius: 8px;

      .flower-detail {
        display: flex;
        align-items: center;
        margin-bottom: 10px;

        &:last-child {
          margin-bottom: 0;
        }

        .label {
          width: 80px;
          font-size: 13px;
          color: #666;
        }

        .value {
          flex: 1;
          font-size: 14px;
          color: #333;
          font-weight: 500;
        }
      }
    }

    .custom-flower {
      margin-top: 15px;

      .custom-inputs {
        margin-top: 10px;

        .custom-tips {
          margin-top: 8px;

          span {
            font-size: 12px;
            color: #999;
            margin-right: 8px;
          }

          .el-tag {
            margin-right: 5px;
            margin-bottom: 5px;
            cursor: pointer;
          }
        }
      }
    }

    .shop-list {
      .shop-card {
        display: flex;
        padding: 12px;
        border-bottom: 1px solid #f0f0f0;
        cursor: pointer;
        position: relative;

        &:hover {
          background-color: #f5f7fa;
        }

        &.selected {
          background-color: #ecf5ff;
        }

        .shop-logo {
          width: 50px;
          height: 50px;
          border-radius: 8px;
          object-fit: cover;
          margin-right: 12px;
        }

        .shop-info {
          flex: 1;

          .shop-name {
            font-size: 15px;
            font-weight: 600;
            color: #333;
            margin-bottom: 4px;

            .shop-tag {
              margin-left: 5px;
              padding: 2px 4px;
              background-color: #ecf5ff;
              color: #409EFF;
              font-size: 10px;
              border-radius: 4px;
            }
          }

          .shop-rating {
            margin-bottom: 4px;
          }

          .shop-address {
            font-size: 12px;
            color: #999;
            margin-bottom: 4px;
          }

          .shop-meta {
            font-size: 11px;
            color: #999;

            .shop-time {
              margin-left: 10px;
            }
          }
        }

        .shop-price {
          position: absolute;
          top: 12px;
          right: 12px;
          font-size: 13px;
          color: #f56c6c;
        }

        .el-icon-check {
          position: absolute;
          bottom: 12px;
          right: 12px;
          color: #67c23a;
          font-size: 18px;
        }
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
      }

      .address-selector {
        background-color: #f5f7fa;
        border-radius: 8px;
        padding: 12px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        cursor: pointer;
        border: 1px solid #e4e7ed;

        .address-info {
          .address-name {
            font-size: 14px;
            font-weight: 500;
            color: #333;
            margin-bottom: 4px;
          }

          .address-detail {
            font-size: 12px;
            color: #666;
          }
        }

        .address-placeholder {
          color: #999;
          font-size: 14px;
        }

        i {
          color: #999;
        }
      }

      .suggestions {
        margin-top: 8px;

        span {
          font-size: 12px;
          color: #999;
          margin-right: 8px;
        }

        .el-tag {
          margin-right: 5px;
          margin-bottom: 5px;
          cursor: pointer;
        }
      }
    }

    .service-item {
      display: flex;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #f5f5f5;

      &:last-child {
        border-bottom: none;
      }

      .service-info {
        flex: 1;

        .service-name {
          font-size: 14px;
          font-weight: 500;
          color: #333;
          display: block;
          margin-bottom: 2px;
        }

        .service-desc {
          font-size: 11px;
          color: #999;
        }
      }

      .service-fee {
        margin-left: 10px;
        color: #f56c6c;
        font-size: 13px;
        font-weight: 500;
      }

      .tip-options {
        ::v-deep .el-radio-button__inner {
          padding: 8px 12px;
        }
      }
    }
  }

  .fee-card {
    background-color: white;
    border-radius: 12px;
    padding: 15px;
    margin-bottom: 15px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);

    .fee-item {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      color: #666;
      font-size: 14px;

      &.total {
        border-top: 1px solid #f0f0f0;
        margin-top: 8px;
        padding-top: 15px;
        font-size: 16px;
        font-weight: 600;
        color: #333;
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

  .confirm-card {
    background-color: white;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 15px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);

    .confirm-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding-bottom: 15px;
      border-bottom: 1px solid #f0f0f0;
      margin-bottom: 15px;

      i {
        font-size: 24px;
        color: #67c23a;
      }

      span {
        font-size: 16px;
        font-weight: 600;
        color: #333;
      }
    }

    .order-summary {
      margin-bottom: 20px;

      .summary-item {
        display: flex;
        align-items: center;
        margin-bottom: 10px;
        font-size: 14px;

        .label {
          width: 80px;
          color: #999;
        }

        .value {
          flex: 1;
          color: #333;

          &.price {
            color: #f56c6c;
            font-weight: 600;
            font-size: 18px;
          }
        }
      }
    }

    .payment-section {
      .section-title {
        font-size: 14px;
        font-weight: 500;
        color: #333;
        margin-bottom: 12px;
      }

      .payment-methods {
        .payment-method {
          display: flex;
          align-items: center;
          padding: 15px;
          border: 1px solid #e4e7ed;
          border-radius: 8px;
          margin-bottom: 10px;
          cursor: pointer;
          position: relative;

          i:first-child {
            font-size: 24px;
            margin-right: 10px;
          }

          span {
            font-size: 14px;
            color: #333;
          }

          .balance-amount {
            margin-left: 10px;
            color: #999;
            font-size: 12px;
          }

          .el-icon-check {
            position: absolute;
            right: 15px;
            color: #67c23a;
            font-size: 18px;
          }

          &.active {
            border-color: #409EFF;
            background-color: #ecf5ff;
          }
        }
      }
    }

    .timeout-tip {
      text-align: center;
      padding: 15px;
      background-color: #fef0f0;
      border-radius: 8px;
      margin: 15px 0;
      color: #f56c6c;

      .time {
        font-size: 18px;
        font-weight: 600;
        margin: 0 5px;
      }
    }
  }

  .success-step {
    text-align: center;

    .success-animation {
      margin: 40px 0 20px;

      i {
        font-size: 80px;
        color: #67c23a;
        animation: scaleIn 0.5s;
      }
    }

    h3 {
      font-size: 24px;
      color: #333;
      margin-bottom: 10px;
    }

    .success-desc {
      color: #999;
      margin-bottom: 30px;
    }

    .order-info-card {
      background-color: #f8f9fa;
      border-radius: 12px;
      padding: 20px;
      margin: 20px 15px;
      text-align: left;

      .info-row {
        display: flex;
        align-items: center;
        padding: 8px 0;
        border-bottom: 1px solid #f0f0f0;

        &:last-child {
          border-bottom: none;
        }

        .info-label {
          width: 80px;
          color: #999;
          font-size: 14px;
        }

        .info-value {
          flex: 1;
          color: #333;
          font-size: 14px;
        }
      }
    }

    .success-actions {
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding: 0 15px;

      .el-button {
        height: 44px;
        border-radius: 22px;
      }
    }
  }

  .address-dialog {
    .address-list {
      max-height: 400px;
      overflow-y: auto;

      .address-item {
        display: flex;
        align-items: center;
        padding: 15px;
        border-bottom: 1px solid #f0f0f0;
        cursor: pointer;

        &:hover {
          background-color: #f5f7fa;
        }

        .address-content {
          flex: 1;

          .address-name {
            margin-bottom: 5px;

            span {
              font-size: 14px;
              font-weight: 500;
              color: #333;
            }

            .address-phone {
              margin-left: 10px;
              color: #666;
              font-weight: normal;
            }

            .address-tag {
              margin-left: 10px;
              padding: 2px 6px;
              background-color: #ecf5ff;
              color: #409EFF;
              font-size: 10px;
              border-radius: 4px;
            }
          }

          .address-detail {
            font-size: 13px;
            color: #666;
          }
        }

        .el-icon-check {
          color: #67c23a;
          font-size: 18px;
        }
      }
    }

    .add-address {
      padding: 15px;
      text-align: center;
      color: #409EFF;
      cursor: pointer;

      i {
        margin-right: 5px;
      }
    }
  }

  @keyframes scaleIn {
    from {
      transform: scale(0);
    }
    to {
      transform: scale(1);
    }
  }
}
</style>