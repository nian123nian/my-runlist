<template>
  <div class="express-order-page">
    <!-- 顶部导航栏 -->
    <div class="header">
      <i class="el-icon-arrow-left" @click="goBack"></i>
      <span>代拿快递</span>
      <i class="el-icon-service" @click="showCustomerService"></i>
    </div>

    <!-- 下单流程步骤条 -->
    <div class="steps">
      <div class="step-item" :class="{ active: currentStep >= 1 }">
        <div class="step-circle">1</div>
        <div class="step-text">填写信息</div>
      </div>
      <div class="step-line" :class="{ active: currentStep >= 2 }"></div>
      <div class="step-item" :class="{ active: currentStep >= 2 }">
        <div class="step-circle">2</div>
        <div class="step-text">确认支付</div>
      </div>
      <div class="step-line" :class="{ active: currentStep >= 3 }"></div>
      <div class="step-item" :class="{ active: currentStep >= 3 }">
        <div class="step-circle">3</div>
        <div class="step-text">完成</div>
      </div>
    </div>

    <!-- 步骤1：填写订单信息 -->
    <div class="step-content" v-if="currentStep === 1">
      <!-- 快递信息卡片 -->
      <div class="form-card">
        <div class="card-header">
          <i class="el-icon-s-order"></i>
          <span>快递信息</span>
        </div>

        <!-- 快递公司 -->
        <div class="form-item">
          <span class="form-label">快递公司 <span class="required">*</span></span>
          <el-select 
            v-model="formData.expressCompany" 
            placeholder="请选择快递公司"
            size="large"
            @change="handleExpressCompanyChange"
          >
            <el-option 
              v-for="item in expressCompanies" 
              :key="item.value" 
              :label="item.label" 
              :value="item.value"
            >
              <div class="express-option">
                <img :src="item.icon" alt="" class="express-icon">
                <span>{{ item.label }}</span>
              </div>
            </el-option>
          </el-select>
        </div>

        <!-- 快递单号 -->
        <div class="form-item">
          <span class="form-label">快递单号 <span class="required">*</span></span>
          <el-input 
            v-model="formData.trackingNumber" 
            placeholder="请输入快递单号"
            size="large"
            clearable
          >
            <i slot="prefix" class="el-icon-barcode"></i>
          </el-input>
          <div class="input-tip" v-if="formData.trackingNumber">
            <i class="el-icon-info"></i>
            <span>请确认单号正确，以便骑手取件</span>
          </div>
        </div>

        <!-- 取件码（可选） -->
        <div class="form-item">
          <span class="form-label">取件码 <span class="optional">(选填)</span></span>
          <el-input 
            v-model="formData.pickupCode" 
            placeholder="请输入取件码（如有）"
            size="large"
            clearable
          >
            <i slot="prefix" class="el-icon-key"></i>
          </el-input>
        </div>

        <!-- 包裹数量 -->
        <div class="form-item">
          <span class="form-label">包裹数量 <span class="required">*</span></span>
          <el-input-number 
            v-model="formData.packageCount" 
            :min="1" 
            :max="10"
            size="large"
            controls-position="right"
          ></el-input-number>
        </div>

        <!-- 包裹照片 -->
        <div class="form-item">
          <span class="form-label">包裹照片 <span class="optional">(选填)</span></span>
          <div class="upload-area">
            <el-upload
              action="#"
              list-type="picture-card"
              :auto-upload="false"
              :on-change="handleUploadChange"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              :file-list="formData.images"
              accept="image/*"
            >
              <i class="el-icon-plus"></i>
              <!-- <div class="upload-tip">上传照片<br><small>方便骑手识别</small></div> -->
            </el-upload>
            <el-dialog :visible.sync="dialogVisible" append-to-body>
              <img width="100%" :src="dialogImageUrl" alt="">
            </el-dialog>
          </div>
        </div>
      </div>

      <!-- 取件地址卡片 -->
      <div class="form-card">
        <div class="card-header">
          <i class="el-icon-location-outline"></i>
          <span>取件地址</span>
        </div>

        <!-- 常用取件地址 -->
        <div class="address-quick-select" v-if="userPickupAddresses.length > 0">
          <div 
            class="quick-address-item" 
            v-for="addr in userPickupAddresses" 
            :key="addr.id"
            :class="{ selected: selectedPickupAddress === addr.id }"
            @click="selectPickupAddress(addr)"
          >
            <i class="el-icon-location"></i>
            <span>{{ addr.shortName }}</span>
          </div>
        </div>

        <!-- 取件详细地址 -->
        <div class="form-item">
          <span class="form-label">取件地址 <span class="required">*</span></span>
          <div class="address-selector" @click="openAddressSelector('pickup')">
            <div class="address-info" v-if="formData.pickupAddress">
              <div class="address-name">{{ formData.pickupAddress.name }}</div>
              <div class="address-detail">{{ formData.pickupAddress.address }} {{ formData.pickupAddress.detail }}</div>
            </div>
            <div class="address-placeholder" v-else>
              请选择取件地址
            </div>
            <i class="el-icon-arrow-right"></i>
          </div>
        </div>

        <!-- 取件时间 -->
        <div class="form-item">
          <span class="form-label">取件时间 <span class="required">*</span></span>
          <el-radio-group v-model="formData.pickupTimeType" size="large">
            <el-radio-button label="asap">尽快取件</el-radio-button>
            <el-radio-button label="scheduled">预约时间</el-radio-button>
          </el-radio-group>
          
          <el-date-picker
            v-if="formData.pickupTimeType === 'scheduled'"
            v-model="formData.pickupTime"
            type="datetime"
            placeholder="选择预约取件时间"
            size="large"
            :picker-options="pickerOptions"
            format="yyyy-MM-dd HH:mm"
            value-format="yyyy-MM-dd HH:mm"
            class="time-picker"
          >
          </el-date-picker>
        </div>

        <!-- 取件备注 -->
        <div class="form-item">
          <span class="form-label">取件备注</span>
          <el-input 
            v-model="formData.pickupRemark" 
            placeholder="例如：快递在丰巢快递柜3号柜"
            size="large"
            clearable
          ></el-input>
        </div>
      </div>

      <!-- 送达地址卡片 -->
      <div class="form-card">
        <div class="card-header">
          <i class="el-icon-location"></i>
          <span>送达地址</span>
        </div>

        <!-- 常用送达地址 -->
        <div class="address-quick-select" v-if="userDeliveryAddresses.length > 0">
          <div 
            class="quick-address-item" 
            v-for="addr in userDeliveryAddresses" 
            :key="addr.id"
            :class="{ selected: selectedDeliveryAddress === addr.id }"
            @click="selectDeliveryAddress(addr)"
          >
            <i class="el-icon-location"></i>
            <span>{{ addr.shortName }}</span>
          </div>
        </div>

        <!-- 送达详细地址 -->
        <div class="form-item">
          <span class="form-label">送达地址 <span class="required">*</span></span>
          <div class="address-selector" @click="openAddressSelector('delivery')">
            <div class="address-info" v-if="formData.deliveryAddress">
              <div class="address-name">{{ formData.deliveryAddress.name }}</div>
              <div class="address-detail">{{ formData.deliveryAddress.address }} {{ formData.deliveryAddress.detail }}</div>
            </div>
            <div class="address-placeholder" v-else>
              请选择送达地址
            </div>
            <i class="el-icon-arrow-right"></i>
          </div>
        </div>

        <!-- 收件人信息（如果和取件人不同） -->
        <div class="form-item">
          <span class="form-label">收件人</span>
          <el-radio-group v-model="formData.receiverType" size="large">
            <el-radio-button label="self">本人</el-radio-button>
            <el-radio-button label="other">他人</el-radio-button>
          </el-radio-group>
        </div>

        <!-- 他人收件信息 -->
        <div class="receiver-info" v-if="formData.receiverType === 'other'">
          <div class="form-item">
            <el-input 
              v-model="formData.receiverName" 
              placeholder="收件人姓名"
              size="large"
            ></el-input>
          </div>
          <div class="form-item">
            <el-input 
              v-model="formData.receiverPhone" 
              placeholder="收件人电话"
              size="large"
            ></el-input>
          </div>
        </div>

        <!-- 送达备注 -->
        <div class="form-item">
          <span class="form-label">送达备注</span>
          <el-input 
            v-model="formData.deliveryRemark" 
            placeholder="例如：放在门口、电话联系等"
            size="large"
            clearable
          ></el-input>
        </div>
      </div>

      <!-- 增值服务卡片 -->
      <div class="form-card">
        <div class="card-header">
          <i class="el-icon-star-on"></i>
          <span>增值服务</span>
        </div>

        <!-- 小费激励 -->
        <div class="form-item service-item">
          <div class="service-info">
            <span class="service-name">小费激励</span>
            <span class="service-desc">打赏骑手，接单更快</span>
          </div>
          <div class="tip-options">
            <el-radio-group v-model="formData.tip" size="medium">
              <el-radio-button :label="0">无</el-radio-button>
              <el-radio-button :label="2">¥2</el-radio-button>
              <el-radio-button :label="5">¥5</el-radio-button>
              <el-radio-button :label="10">¥10</el-radio-button>
              <el-radio-button :label="20">¥20</el-radio-button>
            </el-radio-group>
          </div>
        </div>

        <!-- 保险服务 -->
        <div class="form-item service-item2">
          <div class="service-info2">
            <span class="service-name">物品保险</span>
            <span class="service-desc">保价¥1000，仅需¥1</span>
          </div>
          <el-switch
            v-model="formData.insurance"
            active-color="#409EFF"
            inactive-color="#dcdfe6">
          </el-switch>
        </div>

        <!-- 隐私保护 -->
        <div class="form-item service-item2">
          <div class="service-info2">
            <span class="service-name">隐私保护</span>
            <span class="service-desc">隐藏真实号码</span>
          </div>
          <el-switch
            v-model="formData.privacyProtection"
            active-color="#409EFF"
            inactive-color="#dcdfe6">
          </el-switch>
        </div>
      </div>

      <!-- 费用预估卡片 -->
      <div class="fee-card">
        <div class="fee-item">
          <span>基础跑腿费</span>
          <span>¥{{ baseFee }}</span>
        </div>
        <div class="fee-item" v-if="formData.tip > 0">
          <span>小费</span>
          <span>¥{{ formData.tip }}</span>
        </div>
        <div class="fee-item" v-if="formData.insurance">
          <span>保险费</span>
          <span>¥1</span>
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
        >
          确认下单
        </el-button>
      </div>
    </div>

    <!-- 步骤2：确认支付 -->
    <div class="step-content" v-if="currentStep === 2">
      <div class="confirm-card">
        <!-- 订单信息汇总 -->
        <div class="order-summary">
          <div class="summary-header">
            <i class="el-icon-success"></i>
            <span>订单提交成功，请完成支付</span>
          </div>

          <div class="summary-content">
            <div class="summary-item">
              <span class="label">订单编号：</span>
              <span class="value">{{ tempOrder.orderNo }}</span>
              <el-button type="text" size="small" @click="copyOrderNo">复制</el-button>
            </div>
            <div class="summary-item">
              <span class="label">订单金额：</span>
              <span class="value price">¥{{ estimatedTotal }}</span>
            </div>
            <div class="summary-item">
              <span class="label">支付方式：</span>
              <span class="value">{{ paymentMethodText }}</span>
            </div>
          </div>
        </div>

        <!-- 支付方式选择 -->
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
              <span class="balance-amount">(可用余额: ¥{{ userBalance }})</span>
            </div>
          </div>
        </div>

        <!-- 倒计时提示 -->
        <div class="timeout-tip">
          <i class="el-icon-time"></i>
          <span>请在 <span class="time">{{ countdownText }}</span> 内完成支付，超时订单将自动取消</span>
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

    <!-- 步骤3：完成 -->
    <div class="step-content success-step" v-if="currentStep === 3">
      <div class="success-animation">
        <i class="el-icon-success"></i>
      </div>
      <h3>下单成功！</h3>
      <p class="success-desc">您的代拿快递订单已提交，正在等待骑手接单</p>
      
      <div class="order-info-card">
        <div class="info-row">
          <span class="info-label">订单编号：</span>
          <span class="info-value">{{ finalOrder.orderNo }}</span>
          <el-button type="text" size="small" @click="copyOrderNo">复制</el-button>
        </div>
        <div class="info-row">
          <span class="info-label">取件地址：</span>
          <span class="info-value">{{ finalOrder.pickupAddress?.address }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">送达地址：</span>
          <span class="info-value">{{ finalOrder.deliveryAddress?.address }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">预计送达：</span>
          <span class="info-value">{{ estimatedDeliveryTime }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">支付金额：</span>
          <span class="info-value price">¥{{ estimatedTotal }}</span>
        </div>
      </div>

      <!-- 推荐骑手（如果有） -->
      <div class="rider-recommend" v-if="recommendedRider">
        <div class="recommend-title">推荐骑手</div>
        <div class="rider-card">
          <img :src="recommendedRider.avatar" alt="" class="rider-avatar">
          <div class="rider-info">
            <div class="rider-name">{{ recommendedRider.name }}</div>
            <div class="rider-stats">
              <span>接单率 {{ recommendedRider.acceptRate }}%</span>
              <span>好评 {{ recommendedRider.goodReviews }}条</span>
            </div>
          </div>
          <el-button type="primary" size="small" plain @click="assignRider">指定TA</el-button>
        </div>
      </div>

      <div class="success-actions">
        <el-button size="large" @click="viewOrderDetail">查看订单详情</el-button>
        <el-button type="primary" size="large" @click="goHome">返回首页</el-button>
      </div>
    </div>

    <!-- 地址选择弹窗 -->
    <el-dialog 
      title="选择地址" 
      :visible.sync="addressDialog.visible" 
      width="90%"
      class="address-dialog"
    >
      <div class="address-list">
        <div 
          class="address-item" 
          v-for="addr in addressDialog.list" 
          :key="addr.id"
          @click="selectAddressFromDialog(addr)"
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
export default {
  name: 'ExpressOrderPage',
  data() {
    return {
      // 当前步骤 1-填写信息 2-确认支付 3-完成
      currentStep: 1,
      
      // 表单数据
      formData: {
        expressCompany: '',
        trackingNumber: '',
        pickupCode: '',
        packageCount: 1,
        images: [],
        pickupAddress: null,
        pickupTimeType: 'asap',
        pickupTime: '',
        pickupRemark: '',
        deliveryAddress: null,
        receiverType: 'self',
        receiverName: '',
        receiverPhone: '',
        deliveryRemark: '',
        tip: 0,
        insurance: false,
        privacyProtection: false,
        agreement: false
      },
      
      // 快递公司列表
      expressCompanies: [
        { value: 'sf', label: '顺丰速运', icon: 'https://example.com/sf.png' },
        { value: 'yt', label: '圆通速递', icon: 'https://example.com/yt.png' },
        { value: 'zt', label: '中通快递', icon: 'https://example.com/zt.png' },
        { value: 'sto', label: '申通快递', icon: 'https://example.com/sto.png' },
        { value: 'yd', label: '韵达快递', icon: 'https://example.com/yd.png' },
        { value: 'ems', label: 'EMS', icon: 'https://example.com/ems.png' },
        { value: 'jd', label: '京东快递', icon: 'https://example.com/jd.png' },
        { value: 'other', label: '其他', icon: 'https://example.com/other.png' }
      ],
      
      // 用户取件地址列表
      userPickupAddresses: [],
      
      // 用户送达地址列表
      userDeliveryAddresses: [],
      
      // 选中的地址ID
      selectedPickupAddress: null,
      selectedDeliveryAddress: null,
      
      // 地址选择弹窗
      addressDialog: {
        visible: false,
        type: 'pickup', // pickup 或 delivery
        list: []
      },
      selectedAddressId: null,
      
      // 图片上传相关
      dialogImageUrl: '',
      dialogVisible: false,
      
      // 基础跑腿费
      baseFee: 8,
      
      // 临时订单（支付前）
      tempOrder: {},
      
      // 最终订单（支付后）
      finalOrder: {},
      
      // 支付方式
      paymentMethod: 'wechat',
      
      // 用户余额
      userBalance: 100,
      
      // 支付中状态
      paying: false,
      
      // 倒计时
      countdown: 900, // 15分钟 = 900秒
      countdownTimer: null,
      
      // 推荐骑手
      recommendedRider: null,
      
      // 预计送达时间
      estimatedDeliveryTime: '',
      
      // 时间选择器配置
      pickerOptions: {
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
        }, {
          text: '明天',
          onClick(picker) {
            const date = new Date()
            date.setTime(date.getTime() + 3600 * 1000 * 24)
            picker.$emit('pick', date)
          }
        }]
      }
    }
  },
  
  computed: {
    // 预估总价
    estimatedTotal() {
      let total = this.baseFee
      if (this.formData.tip) total += this.formData.tip
      if (this.formData.insurance) total += 1
      return total.toFixed(2)
    },
    
    // 是否可以提交
    canSubmit() {
      return (
        this.formData.expressCompany &&
        this.formData.trackingNumber &&
        this.formData.pickupAddress &&
        this.formData.deliveryAddress &&
        this.formData.agreement
      )
    },
    
    // 支付方式文本
    paymentMethodText() {
      const map = {
        wechat: '微信支付',
        alipay: '支付宝',
        balance: '余额支付'
      }
      return map[this.paymentMethod] || '微信支付'
    },
    
    // 倒计时文本
    countdownText() {
      const minutes = Math.floor(this.countdown / 60)
      const seconds = this.countdown % 60
      return `${minutes}:${seconds.toString().padStart(2, '0')}`
    }
  },
  
  created() {
    this.loadUserInfo()
    this.loadUserAddresses()
    this.loadRecommendedRider()
  },
  
  destroyed() {
    this.clearCountdown()
  },
  
  methods: {
    // 加载用户信息
    loadUserInfo() {
      try {
        const userInfoStr = localStorage.getItem('userInfo')
        const userInfo = JSON.parse(userInfoStr || '{}')
        this.userBalance = userInfo.balance || 100
      } catch (e) {
        console.error('加载用户信息失败', e)
      }
    },
    
    // 加载用户地址
    loadUserAddresses() {
      // 模拟数据，实际应从后端获取
      this.userPickupAddresses = [
        { id: 1, shortName: '公司', name: '公司', phone: '13800138001', address: '北京市朝阳区某某大厦', detail: 'A座8层', isDefault: true },
        { id: 2, shortName: '家里', name: '家', phone: '13800138002', address: '北京市海淀区某某小区', detail: '3号楼202', isDefault: false }
      ]
      
      this.userDeliveryAddresses = [
        { id: 3, shortName: '公司', name: '公司', phone: '13800138001', address: '北京市朝阳区某某大厦', detail: 'A座8层', isDefault: true },
        { id: 4, shortName: '家里', name: '家', phone: '13800138002', address: '北京市海淀区某某小区', detail: '3号楼202', isDefault: false }
      ]
    },
    
    // 加载推荐骑手
    loadRecommendedRider() {
      // 模拟数据
      this.recommendedRider = {
        id: 1001,
        name: '王小明',
        avatar: 'https://example.com/avatar1.jpg',
        acceptRate: 98,
        goodReviews: 1250
      }
    },
    
    // 处理快递公司变更
    handleExpressCompanyChange(value) {
      console.log('选择快递公司:', value)
    },
    
    // 图片上传处理
    handleUploadChange(file, fileList) {
      this.formData.images = fileList
    },
    
    handlePreview(file) {
      this.dialogImageUrl = file.url
      this.dialogVisible = true
    },
    
    handleRemove(file, fileList) {
      this.formData.images = fileList
    },
    
    // 选择常用取件地址
    selectPickupAddress(addr) {
      this.selectedPickupAddress = addr.id
      this.formData.pickupAddress = addr
    },
    
    // 选择常用送达地址
    selectDeliveryAddress(addr) {
      this.selectedDeliveryAddress = addr.id
      this.formData.deliveryAddress = addr
    },
    
    // 打开地址选择器
    openAddressSelector(type) {
      this.addressDialog.type = type
      this.addressDialog.list = type === 'pickup' ? this.userPickupAddresses : this.userDeliveryAddresses
      this.addressDialog.visible = true
    },
    
    // 从弹窗选择地址
    selectAddressFromDialog(addr) {
      if (this.addressDialog.type === 'pickup') {
        this.formData.pickupAddress = addr
        this.selectedPickupAddress = addr.id
      } else {
        this.formData.deliveryAddress = addr
        this.selectedDeliveryAddress = addr.id
      }
      this.addressDialog.visible = false
    },
    
    // 新增地址
    addNewAddress() {
      this.$message.info('跳转到地址管理页面')
      this.addressDialog.visible = false
      // this.$router.push('/address/add')
    },
    
    // 提交订单
    async submitOrder() {
      try {
        // 构建订单数据
        const orderData = {
          orderType: 'express',
          expressCompany: this.formData.expressCompany,
          trackingNumber: this.formData.trackingNumber,
          pickupCode: this.formData.pickupCode,
          packageCount: this.formData.packageCount,
          images: this.formData.images.map(img => img.url),
          pickupAddress: this.formData.pickupAddress,
          pickupTimeType: this.formData.pickupTimeType,
          pickupTime: this.formData.pickupTime,
          pickupRemark: this.formData.pickupRemark,
          deliveryAddress: this.formData.deliveryAddress,
          receiverType: this.formData.receiverType,
          receiverName: this.formData.receiverName,
          receiverPhone: this.formData.receiverPhone,
          deliveryRemark: this.formData.deliveryRemark,
          tip: this.formData.tip,
          insurance: this.formData.insurance,
          privacyProtection: this.formData.privacyProtection,
          amount: this.estimatedTotal
        }
        
        // 发送创建订单请求
        const res = await this.$axios.post('/api/order/express/create', orderData)
        
        if (res.data?.code === 200) {
          this.tempOrder = res.data.data
          this.currentStep = 2
          this.startCountdown()
        } else {
          this.$message.error(res.data?.message || '创建订单失败')
        }
      } catch (error) {
        console.error('创建订单失败:', error)
        this.$message.error('网络错误，请稍后重试')
      }
    },
    
    // 开始倒计时
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
    
    // 清除倒计时
    clearCountdown() {
      if (this.countdownTimer) {
        clearInterval(this.countdownTimer)
        this.countdownTimer = null
      }
    },
    
    // 处理支付
    async handlePay() {
      this.paying = true
      
      try {
        // 模拟支付请求
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        // 支付成功
        this.clearCountdown()
        this.finalOrder = {
          ...this.tempOrder,
          pickupAddress: this.formData.pickupAddress,
          deliveryAddress: this.formData.deliveryAddress
        }
        this.estimatedDeliveryTime = this.calcEstimatedDeliveryTime()
        this.currentStep = 3
        
        this.$message.success('支付成功')
      } catch (error) {
        this.$message.error('支付失败，请重试')
      } finally {
        this.paying = false
      }
    },
    
    // 计算预计送达时间
    calcEstimatedDeliveryTime() {
      const now = new Date()
      now.setMinutes(now.getMinutes() + 45) // 预计45分钟送达
      const hours = now.getHours().toString().padStart(2, '0')
      const minutes = now.getMinutes().toString().padStart(2, '0')
      return `今天 ${hours}:${minutes}`
    },
    
    // 指定骑手
    assignRider() {
      this.$message.success('已指定骑手，正在等待接单')
    },
    
    // 复制订单号
    copyOrderNo() {
      const orderNo = this.finalOrder.orderNo || this.tempOrder.orderNo
      navigator.clipboard?.writeText(orderNo)
      this.$message.success('订单号已复制')
    },
    
    // 查看订单详情
    viewOrderDetail() {
      this.$router.push(`/order/detail/${this.finalOrder.id}`)
    },
    
    // 显示客服
    showCustomerService() {
      this.$message.info('客服热线：400-123-4567')
    },
    
    // 显示协议
    showAgreement() {
      this.$message.info('显示用户服务协议')
    },
    
    // 显示隐私政策
    showPrivacy() {
      this.$message.info('显示隐私政策')
    },
    
    // 返回上一页
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
    
    // 返回首页
    goHome() {
      this.$router.push('/home')
    }
  }
}
</script>

<style scoped lang="scss">
.express-order-page {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding-bottom: 80px;

  // 顶部导航
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

  // 步骤条
  .steps {
    display: flex;
    align-items: center;
    padding: 20px 15px;
    background-color: white;
    margin-bottom: 10px;

    .step-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex: 1;

      .step-circle {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background-color: #f0f0f0;
        color: #999;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        font-weight: 600;
        margin-bottom: 5px;
      }

      .step-text {
        font-size: 12px;
        color: #999;
      }

      &.active {
        .step-circle {
          background-color: #409EFF;
          color: white;
        }
        .step-text {
          color: #409EFF;
          font-weight: 500;
        }
      }
    }

    .step-line {
      flex: 0.5;
      height: 2px;
      background-color: #f0f0f0;
      margin: 0 5px;
      transform: translateY(-10px);

      &.active {
        background-color: #409EFF;
      }
    }
  }

  // 表单卡片
  .form-card {
    background-color: white;
    margin: 10px 15px;
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);

    .card-header {
      display: flex;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 1px solid #f0f0f0;

      i {
        font-size: 20px;
        color: #409EFF;
        margin-right: 8px;
      }

      span {
        font-size: 16px;
        font-weight: 600;
        color: #333;
      }
    }

    .form-item {
      margin-bottom: 20px;

      &:last-child {
        margin-bottom: 0;
      }

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
          font-size: 12px;
          margin-left: 2px;
        }
      }

      .input-tip {
        margin-top: 5px;
        font-size: 12px;
        color: #909399;
        display: flex;
        align-items: center;

        i {
          margin-right: 4px;
          font-size: 14px;
        }
      }
    }

    // 快递选项
    .express-option {
      display: flex;
      align-items: center;
      
      .express-icon {
        width: 20px;
        height: 20px;
        margin-right: 8px;
        border-radius: 4px;
      }
    }

    // 地址快速选择
    .address-quick-select {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-bottom: 15px;

      .quick-address-item {
        padding: 8px 15px;
        background-color: #f5f7fa;
        border-radius: 20px;
        font-size: 13px;
        color: #666;
        display: flex;
        align-items: center;
        cursor: pointer;
        transition: all 0.3s;

        i {
          margin-right: 4px;
          font-size: 14px;
        }

        &:hover {
          background-color: #ecf5ff;
        }

        &.selected {
          background-color: #409EFF;
          color: white;
        }
      }
    }

    // 地址选择器
    .address-selector {
      background-color: #f5f7fa;
      border-radius: 8px;
      padding: 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        background-color: #ecf5ff;
      }

      .address-info {
        flex: 1;

        .address-name {
          font-weight: 600;
          color: #333;
          margin-bottom: 4px;
        }

        .address-detail {
          font-size: 13px;
          color: #999;
        }
      }

      .address-placeholder {
        color: #999;
        font-size: 14px;
      }

      i {
        color: #999;
        font-size: 16px;
      }
    }

    // 时间选择器
    .time-picker {
      width: 100%;
      margin-top: 10px;
    }

    // 服务项目
    .service-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-direction: column;

      .service-info {
        .service-name {
          font-weight: 600;
          color: #333;
          margin-right: 8px;
        }

        .service-desc {
          font-size: 12px;
          color: #999;
        }
      }

      .tip-options {
        .el-radio-group {
          display: flex;
          gap: 5px;
        }
      }
    }

    .service-item2 {
      display: flex;
      align-items: center;
      justify-content: space-between;
      // flex-direction: column;

      .service-info {
        .service-name {
          font-weight: 600;
          color: #333;
          margin-right: 8px;
        }

        .service-desc {
          font-size: 12px;
          color: #999;
        }
      }

      .tip-options {
        .el-radio-group {
          display: flex;
          gap: 5px;
        }
      }
    }

    // 上传区域
    .upload-area {
      .upload-tip {
        text-align: center;
        color: #999;
        font-size: 12px;
        margin-top: 5px;

        small {
          font-size: 10px;
        }
      }
    }
  }

  // 费用卡片
  .fee-card {
    background-color: white;
    margin: 10px 15px;
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);

    .fee-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      color: #666;
      font-size: 14px;

      &:last-child {
        margin-bottom: 0;
      }

      &.total {
        margin-top: 10px;
        padding-top: 10px;
        border-top: 1px dashed #f0f0f0;
        font-weight: 600;
        color: #333;
        font-size: 16px;
      }
    }
  }

  // 协议确认
  .agreement {
    margin: 15px;
    display: flex;
    align-items: center;

    .agreement-text {
      margin-left: 8px;
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

  // 底部按钮
  .bottom-actions {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: white;
    padding: 12px 15px;
    display: flex;
    gap: 12px;
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
    z-index: 100;

    .el-button {
      flex: 1;
      height: 44px;
      font-size: 16px;
      border-radius: 22px;
    }
  }

  // 确认支付卡片
  .confirm-card {
    background-color: white;
    margin: 15px;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);

    .order-summary {
      margin-bottom: 25px;

      .summary-header {
        display: flex;
        align-items: center;
        margin-bottom: 15px;

        i {
          font-size: 24px;
          color: #67c23a;
          margin-right: 8px;
        }

        span {
          font-size: 18px;
          font-weight: 600;
          color: #333;
        }
      }

      .summary-content {
        background-color: #f5f7fa;
        border-radius: 8px;
        padding: 15px;

        .summary-item {
          display: flex;
          align-items: center;
          margin-bottom: 10px;

          &:last-child {
            margin-bottom: 0;
          }

          .label {
            width: 80px;
            color: #999;
            font-size: 14px;
          }

          .value {
            flex: 1;
            color: #333;
            font-size: 14px;

            &.price {
              color: #f56c6c;
              font-weight: 600;
              font-size: 16px;
            }
          }

          .el-button {
            margin-left: 10px;
          }
        }
      }
    }

    .payment-section {
      margin-bottom: 20px;

      .section-title {
        font-size: 16px;
        font-weight: 600;
        color: #333;
        margin-bottom: 15px;
      }

      .payment-methods {
        .payment-method {
          display: flex;
          align-items: center;
          padding: 15px;
          border: 1px solid #dcdfe6;
          border-radius: 8px;
          margin-bottom: 10px;
          cursor: pointer;
          transition: all 0.3s;
          position: relative;

          &:hover {
            border-color: #409EFF;
          }

          &.active {
            border-color: #409EFF;
            background-color: #ecf5ff;
          }

          i:first-child {
            font-size: 24px;
            margin-right: 12px;
          }

          .el-icon-wechat {
            color: #07c160;
          }

          .el-icon-alipay {
            color: #1677ff;
          }

          .el-icon-money {
            color: #f5a623;
          }

          span {
            flex: 1;
            font-size: 15px;
            color: #333;
          }

          .balance-amount {
            font-size: 12px;
            color: #999;
            margin-left: 5px;
          }

          .el-icon-check {
            color: #409EFF;
            font-size: 18px;
          }
        }
      }
    }

    .timeout-tip {
      text-align: center;
      padding: 15px;
      background-color: #fff5e6;
      border-radius: 8px;
      color: #e6a23c;

      i {
        margin-right: 5px;
      }

      .time {
        font-weight: 600;
        font-size: 16px;
      }
    }
  }

  // 成功步骤
  .success-step {
    padding: 20px 15px;
    text-align: center;

    .success-animation {
      margin: 30px 0 20px;

      i {
        font-size: 80px;
        color: #67c23a;
        animation: scaleIn 0.5s ease;
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
      background-color: white;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 20px;
      text-align: left;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);

      .info-row {
        display: flex;
        align-items: flex-start;
        margin-bottom: 12px;

        &:last-child {
          margin-bottom: 0;
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

          &.price {
            color: #f56c6c;
            font-weight: 600;
          }
        }

        .el-button {
          margin-left: 10px;
        }
      }
    }

    .rider-recommend {
      margin-bottom: 20px;
      text-align: left;

      .recommend-title {
        font-size: 16px;
        font-weight: 600;
        color: #333;
        margin-bottom: 10px;
      }

      .rider-card {
        background-color: white;
        border-radius: 12px;
        padding: 15px;
        display: flex;
        align-items: center;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);

        .rider-avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          margin-right: 12px;
          object-fit: cover;
        }

        .rider-info {
          flex: 1;

          .rider-name {
            font-weight: 600;
            color: #333;
            margin-bottom: 5px;
          }

          .rider-stats {
            font-size: 12px;
            color: #999;

            span {
              margin-right: 10px;
            }
          }
        }
      }
    }

    .success-actions {
      display: flex;
      gap: 12px;

      .el-button {
        flex: 1;
        height: 44px;
        border-radius: 22px;
      }
    }
  }

  // 地址弹窗
  .address-dialog {
    .address-list {
      max-height: 400px;
      overflow-y: auto;

      .address-item {
        padding: 15px;
        border-bottom: 1px solid #f0f0f0;
        display: flex;
        align-items: center;
        cursor: pointer;

        &:last-child {
          border-bottom: none;
        }

        .address-content {
          flex: 1;

          .address-name {
            margin-bottom: 5px;

            span {
              font-weight: 600;
              color: #333;
              margin-right: 10px;
            }

            .address-phone {
              font-weight: normal;
              color: #999;
              font-size: 14px;
            }

            .address-tag {
              font-size: 10px;
              padding: 2px 6px;
              background-color: #409EFF;
              color: white;
              border-radius: 10px;
              font-weight: normal;
            }
          }

          .address-detail {
            font-size: 13px;
            color: #999;
          }
        }

        .el-icon-check {
          color: #409EFF;
          font-size: 18px;
        }
      }
    }

    .add-address {
      padding: 15px;
      text-align: center;
      border-top: 1px solid #f0f0f0;
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
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }
}
</style>