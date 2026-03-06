<template>
  <div class="snack-order-page">
    <!-- 顶部导航栏 -->
    <div class="header">
      <i class="el-icon-arrow-left" @click="goBack"></i>
      <span>代买零食</span>
      <i class="el-icon-service" @click="showCustomerService"></i>
    </div>

    <!-- 下单流程步骤条 -->
    <StepProgress :current-step="currentStep" />

    <!-- 步骤1：填写订单信息 -->
    <div class="step-content" v-if="currentStep === 1">
      <!-- 商品信息卡片 -->
      <div class="form-card">
        <div class="card-header">
          <i class="el-icon-goods"></i>
          <span>商品清单</span>
          <el-button type="text" @click="showProductHistory" v-if="historyProducts.length > 0">历史常买</el-button>
        </div>

        <!-- 快捷搜索 -->
        <div class="search-section">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索商品名称（如：乐事薯片）"
            prefix-icon="el-icon-search"
            clearable
            @keyup.enter="handleSearch"
            size="large"
          >
            <el-button slot="append" @click="handleSearch">搜索</el-button>
          </el-input>
        </div>

        <!-- 热门商品推荐 -->
        <div class="hot-products" v-if="hotProducts.length > 0">
          <div class="section-label">🔥 热门推荐</div>
          <div class="product-grid">
            <div 
              class="product-card" 
              v-for="product in hotProducts" 
              :key="product.id"
              @click="quickAddProduct(product)"
            >
              <img :src="product.image" :alt="product.name" class="product-img">
              <div class="product-info">
                <div class="product-name">{{ product.name }}</div>
                <div class="product-spec">{{ product.spec }}</div>
                <div class="product-price">¥{{ product.price }}</div>
              </div>
              <div class="quick-add">
                <i class="el-icon-plus"></i>
              </div>
            </div>
          </div>
        </div>

        <!-- 分类商品 -->
        <div class="category-section">
          <div class="category-tabs">
            <div 
              class="category-tab" 
              v-for="cat in categories" 
              :key="cat.id"
              :class="{ active: selectedCategory === cat.id }"
              @click="selectedCategory = cat.id"
            >
              {{ cat.name }}
            </div>
          </div>

          <div class="category-products">
            <div 
              class="product-item" 
              v-for="product in categoryProducts" 
              :key="product.id"
              @click="quickAddProduct(product)"
            >
              <span class="product-name">{{ product.name }}</span>
              <span class="product-spec">{{ product.spec }}</span>
              <span class="product-price">¥{{ product.price }}</span>
              <i class="el-icon-circle-plus"></i>
            </div>
          </div>
        </div>

        <!-- 已选商品列表 -->
        <div class="selected-products" v-if="formData.products.length > 0">
          <div class="section-label">🛒 购物清单</div>
          <div 
            class="selected-item" 
            v-for="(item, index) in formData.products" 
            :key="index"
          >
            <div class="item-info">
              <span class="item-name">{{ item.name }}</span>
              <span class="item-spec">{{ item.spec }}</span>
            </div>
            <div class="item-control">
              <el-input-number 
                v-model="item.quantity" 
                :min="1" 
                :max="99"
                size="small"
                @change="updateProductTotal"
              ></el-input-number>
              <span class="item-price">¥{{ (item.price * item.quantity).toFixed(2) }}</span>
              <i class="el-icon-delete" @click="removeProduct(index)"></i>
            </div>
          </div>

          <!-- 商品小计 -->
          <div class="products-subtotal">
            <span>商品小计</span>
            <span class="subtotal-price">¥{{ productsTotal }}</span>
          </div>
        </div>

        <!-- 手动添加商品 -->
        <div class="manual-add">
          <div class="section-label">✏️ 手动添加</div>
          <div class="manual-form">
            <el-row :gutter="10">
              <el-col :span="12">
                <el-input 
                  v-model="manualProduct.name" 
                  placeholder="商品名称"
                  size="large"
                  clearable
                ></el-input>
              </el-col>
              <el-col :span="6">
                <el-input 
                  v-model="manualProduct.spec" 
                  placeholder="规格"
                  size="large"
                  clearable
                ></el-input>
              </el-col>
              <el-col :span="6">
                <el-input 
                  v-model="manualProduct.price" 
                  placeholder="单价"
                  size="large"
                  clearable
                >
                  <template slot="prepend">¥</template>
                </el-input>
              </el-col>
            </el-row>
            <el-row :gutter="10" class="manual-row">
              <el-col :span="6">
                <el-input-number 
                  v-model="manualProduct.quantity" 
                  :min="1" 
                  :max="99"
                  size="large"
                  controls-position="right"
                ></el-input-number>
              </el-col>
              <el-col :span="18">
                <el-button type="primary" @click="addManualProduct" :disabled="!canAddManual">
                  <i class="el-icon-plus"></i> 添加到清单
                </el-button>
              </el-col>
            </el-row>
          </div>
        </div>
      </div>

      <!-- 购买商店卡片 -->
      <div class="form-card">
        <div class="card-header">
          <i class="el-icon-shop"></i>
          <span>购买商店</span>
        </div>

        <div class="form-item">
          <span class="form-label">商店名称 <span class="required">*</span></span>
          <el-select 
            v-model="formData.shopName" 
            placeholder="请选择或输入商店名称"
            size="large"
            filterable
            allow-create
            default-first-option
            clearable
          >
            <el-option 
              v-for="shop in nearbyShops" 
              :key="shop.id" 
              :label="shop.name" 
              :value="shop.name"
            >
              <span>{{ shop.name }}</span>
              <span class="shop-distance">{{ shop.distance }}km</span>
            </el-option>
          </el-select>
        </div>

        <div class="form-item" v-if="formData.shopName && !isNearbyShop">
          <span class="form-label">商店地址</span>
          <el-input 
            v-model="formData.shopAddress" 
            placeholder="请输入商店详细地址"
            size="large"
            clearable
          >
            <i slot="prefix" class="el-icon-location"></i>
          </el-input>
        </div>

        <div class="form-item">
          <span class="form-label">取货方式</span>
          <el-radio-group v-model="formData.pickupMethod" size="large">
            <el-radio-button label="instore">
              <i class="el-icon-shop"></i> 店内取货
            </el-radio-button>
            <el-radio-button label="takeout">
              <i class="el-icon-truck"></i> 外卖取货
            </el-radio-button>
          </el-radio-group>
        </div>

        <div class="form-item">
          <span class="form-label">取货备注</span>
          <el-input 
            v-model="formData.pickupRemark" 
            placeholder="例如：在收银台、需要购物袋、冰袋等"
            size="large"
            clearable
          >
            <i slot="prefix" class="el-icon-edit"></i>
          </el-input>
        </div>
      </div>

      <!-- 取件信息卡片 -->
      <div class="form-card">
        <div class="card-header">
          <i class="el-icon-location-outline"></i>
          <span>取件信息</span>
        </div>

        <div class="form-item">
          <span class="form-label">取件人 <span class="required">*</span></span>
          <el-input 
            v-model="formData.pickupContact" 
            placeholder="请输入取件人姓名"
            size="large"
            clearable
          >
            <i slot="prefix" class="el-icon-user"></i>
          </el-input>
        </div>

        <div class="form-item">
          <span class="form-label">联系电话 <span class="required">*</span></span>
          <el-input 
            v-model="formData.pickupPhone" 
            placeholder="请输入取件人电话"
            size="large"
            clearable
          >
            <i slot="prefix" class="el-icon-phone"></i>
          </el-input>
        </div>

        <div class="form-item">
          <span class="form-label">取件地址 <span class="required">*</span></span>
          <div class="address-selector" @click="openPickupAddressDialog">
            <div class="address-info" v-if="formData.pickupAddress">
              <div class="address-name">{{ formData.pickupAddress.name }} {{ formData.pickupAddress.phone }}</div>
              <div class="address-detail">{{ formData.pickupAddress.address }} {{ formData.pickupAddress.detail }}</div>
            </div>
            <div class="address-placeholder" v-else>
              请选择取件地址
            </div>
            <i class="el-icon-arrow-right"></i>
          </div>
        </div>
      </div>

      <!-- 送达信息卡片 -->
      <div class="form-card">
        <div class="card-header">
          <i class="el-icon-location"></i>
          <span>送达信息</span>
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
          </el-radio-group>
        </div>

        <div class="form-item" v-if="formData.deliveryTimeType === 'scheduled'">
          <el-date-picker
            v-model="formData.deliveryTime"
            type="datetime"
            placeholder="选择送达时间"
            size="large"
            :picker-options="pickerOptions"
            format="yyyy-MM-dd HH:mm"
            value-format="yyyy-MM-dd HH:mm"
            style="width: 100%;"
          >
          </el-date-picker>
        </div>

        <div class="form-item">
          <span class="form-label">送达备注</span>
          <el-input 
            v-model="formData.deliveryRemark" 
            placeholder="例如：放在门口、电话联系等"
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
              <el-radio-button :label="2">¥2</el-radio-button>
              <el-radio-button :label="5">¥5</el-radio-button>
              <el-radio-button :label="10">¥10</el-radio-button>
            </el-radio-group>
          </div>
        </div>

        <!-- 保险服务 -->
        <div class="service-item">
          <div class="service-info">
            <span class="service-name">物品保险</span>
            <span class="service-desc">保价¥200，保障物品安全</span>
          </div>
          <el-switch
            v-model="formData.insurance"
            active-color="#409EFF"
            inactive-color="#dcdfe6"
            @change="updateInsurance"
          >
          </el-switch>
        </div>

        <!-- 保温袋 -->
        <div class="service-item">
          <div class="service-info">
            <span class="service-name">保温袋</span>
            <span class="service-desc">保持冷饮/冰淇淋不融化</span>
          </div>
          <el-switch
            v-model="formData.insulationBag"
            active-color="#409EFF"
            inactive-color="#dcdfe6"
          >
          </el-switch>
          <span class="service-fee" v-if="formData.insulationBag">+¥2</span>
        </div>
      </div>

      <!-- 费用预估卡片 -->
      <div class="fee-card">
        <div class="fee-item">
          <span>基础跑腿费</span>
          <span>¥{{ baseFee }}</span>
        </div>
        <div class="fee-item" v-if="formData.products.length > 0">
          <span>商品费用</span>
          <span>¥{{ productsTotal }}</span>
        </div>
        <div class="fee-item" v-if="formData.tip > 0">
          <span>小费</span>
          <span>+¥{{ formData.tip }}</span>
        </div>
        <div class="fee-item" v-if="formData.insurance">
          <span>保险费</span>
          <span>+¥1</span>
        </div>
        <div class="fee-item" v-if="formData.insulationBag">
          <span>保温袋</span>
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

    <!-- 步骤2：确认支付 -->
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
            <span class="label">商品数量：</span>
            <span class="value">{{ totalQuantity }}件商品</span>
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

    <!-- 步骤3：完成 -->
    <div class="step-content success-step" v-if="currentStep === 3">
      <div class="success-animation">
        <i class="el-icon-success"></i>
      </div>
      <h3>下单成功！</h3>
      <p class="success-desc">您的零食订单已提交，骑手正在前往商店</p>
      
      <div class="order-info-card">
        <div class="info-row">
          <span class="info-label">订单编号：</span>
          <span class="info-value">{{ finalOrder.orderNo }}</span>
          <el-button type="text" size="small" @click="copyOrderNo">复制</el-button>
        </div>
        <div class="info-row">
          <span class="info-label">商店名称：</span>
          <span class="info-value">{{ finalOrder.shopName }}</span>
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
      :title="addressDialog.title" 
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

    <!-- 历史商品弹窗 -->
    <el-dialog title="历史常买" :visible.sync="historyDialogVisible" width="90%">
      <div class="history-list">
        <div 
          class="history-item" 
          v-for="item in historyProducts" 
          :key="item.id"
          @click="quickAddProduct(item)"
        >
          <div class="history-info">
            <span class="history-name">{{ item.name }}</span>
            <span class="history-spec">{{ item.spec }}</span>
          </div>
          <span class="history-price">¥{{ item.price }}</span>
          <el-button type="text" size="small">再次购买</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import StepProgress from './components/StepProgress.vue'

export default {
  name: 'SnackOrderPage',
  components: {
    StepProgress
  },
  data() {
    return {
      currentStep: 1,
      submitting: false,
      paying: false,
      searchKeyword: '',
      selectedCategory: 1,
      categories: [
        { id: 1, name: '薯片' },
        { id: 2, name: '饮料' },
        { id: 3, name: '巧克力' },
        { id: 4, name: '糖果' },
        { id: 5, name: '饼干' },
        { id: 6, name: '方便面' }
      ],
      hotProducts: [
        { id: 1, name: '乐事薯片', spec: '原味 70g', price: 8.5, image: 'https://via.placeholder.com/60', categoryId: 1 },
        { id: 2, name: '可口可乐', spec: '500ml', price: 3.5, image: 'https://via.placeholder.com/60', categoryId: 2 },
        { id: 3, name: '德芙巧克力', spec: '43g', price: 12.9, image: 'https://via.placeholder.com/60', categoryId: 3 },
        { id: 4, name: '旺旺雪饼', spec: '84g', price: 6.5, image: 'https://via.placeholder.com/60', categoryId: 1 },
        { id: 5, name: '农夫山泉', spec: '550ml', price: 2.0, image: 'https://via.placeholder.com/60', categoryId: 2 },
        { id: 6, name: '奥利奥', spec: '夹心饼干 97g', price: 7.5, image: 'https://via.placeholder.com/60', categoryId: 5 }
      ],
      allProducts: [
        { id: 1, name: '乐事薯片', spec: '原味 70g', price: 8.5, categoryId: 1 },
        { id: 2, name: '乐事薯片', spec: '黄瓜味 70g', price: 8.5, categoryId: 1 },
        { id: 3, name: '乐事薯片', spec: '青柠味 70g', price: 8.5, categoryId: 1 },
        { id: 4, name: '可口可乐', spec: '500ml', price: 3.5, categoryId: 2 },
        { id: 5, name: '百事可乐', spec: '500ml', price: 3.5, categoryId: 2 },
        { id: 6, name: '雪碧', spec: '500ml', price: 3.5, categoryId: 2 },
        { id: 7, name: '德芙巧克力', spec: '43g', price: 12.9, categoryId: 3 },
        { id: 8, name: '德芙巧克力', spec: '碗装 216g', price: 45.9, categoryId: 3 },
        { id: 9, name: '费列罗', spec: '3粒装', price: 15.9, categoryId: 3 },
        { id: 10, name: '大白兔奶糖', spec: '227g', price: 18.9, categoryId: 4 },
        { id: 11, name: '阿尔卑斯', spec: '混合味 150g', price: 12.9, categoryId: 4 },
        { id: 12, name: '奥利奥', spec: '原味 97g', price: 7.5, categoryId: 5 },
        { id: 13, name: '康师傅红烧牛肉面', spec: '桶装', price: 5.5, categoryId: 6 },
        { id: 14, name: '统一老坛酸菜', spec: '桶装', price: 5.5, categoryId: 6 }
      ],
      nearbyShops: [
        { id: 1, name: '7-11便利店(朝阳门店)', distance: 0.3 },
        { id: 2, name: '全家便利店(王府井店)', distance: 0.5 },
        { id: 3, name: '罗森便利店(三里屯店)', distance: 0.8 },
        { id: 4, name: '物美超市(朝阳门店)', distance: 1.2 },
        { id: 5, name: '京客隆(东四店)', distance: 1.5 }
      ],
      historyProducts: [
        { id: 1, name: '乐事薯片', spec: '原味 70g', price: 8.5 },
        { id: 2, name: '可口可乐', spec: '500ml', price: 3.5 },
        { id: 3, name: '德芙巧克力', spec: '43g', price: 12.9 }
      ],
      userAddresses: [
        { id: 1, name: '张三', phone: '13800138001', address: '北京市朝阳区某某大厦', detail: 'A座8层801室', isDefault: true },
        { id: 2, name: '张三', phone: '13800138001', address: '北京市海淀区某某小区', detail: '3号楼202室', isDefault: false },
        { id: 3, name: '李四', phone: '13800138002', address: '北京市东城区某某胡同', detail: '5号院', isDefault: false }
      ],
      formData: {
        products: [],
        shopName: '',
        shopAddress: '',
        pickupMethod: 'instore',
        pickupRemark: '',
        pickupContact: '',
        pickupPhone: '',
        pickupAddress: null,
        deliveryAddress: null,
        deliveryTimeType: 'asap',
        deliveryTime: '',
        deliveryRemark: '',
        tip: 0,
        insurance: false,
        insulationBag: false,
        agreement: false
      },
      manualProduct: {
        name: '',
        spec: '',
        price: '',
        quantity: 1
      },
      baseFee: 12,
      tempOrder: {},
      finalOrder: {},
      paymentMethod: 'wechat',
      userBalance: 100,
      countdown: 900, // 15分钟
      countdownTimer: null,
      addressDialog: {
        visible: false,
        title: '选择地址',
        type: 'pickup'
      },
      selectedAddressId: null,
      historyDialogVisible: false,
      estimatedDeliveryTime: '',
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() < Date.now() - 8.64e7
        },
        shortcuts: [{
          text: '30分钟后',
          onClick(picker) {
            const date = new Date()
            date.setTime(date.getTime() + 30 * 60 * 1000)
            picker.$emit('pick', date)
          }
        }, {
          text: '1小时后',
          onClick(picker) {
            const date = new Date()
            date.setTime(date.getTime() + 3600 * 1000)
            picker.$emit('pick', date)
          }
        }]
      }
    }
  },
  computed: {
    // 分类商品
    categoryProducts() {
      return this.allProducts.filter(p => p.categoryId === this.selectedCategory)
    },
    
    // 商品总价
    productsTotal() {
      const total = this.formData.products.reduce((sum, item) => {
        return sum + (item.price * item.quantity)
      }, 0)
      return total.toFixed(2)
    },
    
    // 预估总价
    estimatedTotal() {
      let total = this.baseFee + parseFloat(this.productsTotal)
      if (this.formData.tip > 0) total += this.formData.tip
      if (this.formData.insurance) total += 1
      if (this.formData.insulationBag) total += 2
      return total.toFixed(2)
    },
    
    // 是否可以提交
    canSubmit() {
      return this.formData.products.length > 0 &&
             this.formData.shopName &&
             this.formData.pickupContact &&
             this.formData.pickupPhone &&
             this.formData.pickupAddress &&
             this.formData.deliveryAddress &&
             this.formData.agreement
    },
    
    // 是否可以手动添加
    canAddManual() {
      return this.manualProduct.name && this.manualProduct.price
    },
    
    // 是否附近商店
    isNearbyShop() {
      return this.nearbyShops.some(shop => shop.name === this.formData.shopName)
    },
    
    // 总数量
    totalQuantity() {
      return this.formData.products.reduce((sum, item) => sum + item.quantity, 0)
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
        this.formData.pickupContact = userInfo.contact || ''
        this.formData.pickupPhone = userInfo.phone || ''
        this.userBalance = userInfo.balance || 100
      } catch (e) {
        console.error('加载用户信息失败', e)
      }
    },
    
    // 搜索商品
    handleSearch() {
      if (!this.searchKeyword) return
      this.$message.info(`搜索: ${this.searchKeyword}`)
      // 实际开发中应该调接口搜索商品
    },
    
    // 快速添加商品
    quickAddProduct(product) {
      const existing = this.formData.products.find(p => 
        p.name === product.name && p.spec === product.spec
      )
      
      if (existing) {
        existing.quantity++
      } else {
        this.formData.products.push({
          id: product.id,
          name: product.name,
          spec: product.spec,
          price: product.price,
          quantity: 1
        })
      }
      
      this.$message.success(`已添加 ${product.name}`)
    },
    
    // 移除商品
    removeProduct(index) {
      this.formData.products.splice(index, 1)
    },
    
    // 更新商品总价
    updateProductTotal() {
      // 自动更新
    },
    
    // 手动添加商品
    addManualProduct() {
      if (!this.manualProduct.name || !this.manualProduct.price) {
        this.$message.warning('请填写商品名称和价格')
        return
      }
      
      const price = parseFloat(this.manualProduct.price)
      if (isNaN(price) || price <= 0) {
        this.$message.warning('请输入有效的价格')
        return
      }
      
      this.formData.products.push({
        id: Date.now(),
        name: this.manualProduct.name,
        spec: this.manualProduct.spec || '默认',
        price: price,
        quantity: this.manualProduct.quantity
      })
      
      // 清空手动输入
      this.manualProduct = {
        name: '',
        spec: '',
        price: '',
        quantity: 1
      }
      
      this.$message.success('已添加到清单')
    },
    
    // 显示历史商品
    showProductHistory() {
      this.historyDialogVisible = true
    },
    
    // 打开取件地址选择
    openPickupAddressDialog() {
      this.addressDialog.title = '选择取件地址'
      this.addressDialog.type = 'pickup'
      this.addressDialog.visible = true
    },
    
    // 打开送达地址选择
    openDeliveryAddressDialog() {
      this.addressDialog.title = '选择送达地址'
      this.addressDialog.type = 'delivery'
      this.addressDialog.visible = true
    },
    
    // 选择地址
    selectAddress(addr) {
      if (this.addressDialog.type === 'pickup') {
        this.formData.pickupAddress = addr
      } else {
        this.formData.deliveryAddress = addr
      }
      this.selectedAddressId = addr.id
      this.addressDialog.visible = false
    },
    
    // 新增地址
    addNewAddress() {
      this.$message.info('跳转到地址管理页面')
      this.addressDialog.visible = false
      // this.$router.push('/address/add')
    },
    
    // 更新保险
    updateInsurance(val) {
      if (val) {
        this.$message.info('已开启物品保险，保障金额¥200')
      }
    },
    
    // 提交订单
    async submitOrder() {
      this.submitting = true
      
      try {
        // 构建订单数据
        const orderData = {
          orderType: 'snack',
          products: this.formData.products,
          shopName: this.formData.shopName,
          shopAddress: this.formData.shopAddress || this.formData.shopName,
          pickupMethod: this.formData.pickupMethod,
          pickupRemark: this.formData.pickupRemark,
          pickupContact: this.formData.pickupContact,
          pickupPhone: this.formData.pickupPhone,
          pickupAddress: this.formData.pickupAddress,
          deliveryAddress: this.formData.deliveryAddress,
          deliveryTimeType: this.formData.deliveryTimeType,
          deliveryTime: this.formData.deliveryTime,
          deliveryRemark: this.formData.deliveryRemark,
          tip: this.formData.tip,
          insurance: this.formData.insurance,
          insulationBag: this.formData.insulationBag,
          amount: this.estimatedTotal
        }
        
        // 模拟API请求
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        this.tempOrder = {
          orderNo: 'SN' + Date.now().toString().slice(-8),
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
        // 模拟支付
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        this.clearCountdown()
        this.finalOrder = {
          ...this.tempOrder,
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
      now.setMinutes(now.getMinutes() + 45)
      const hours = now.getHours().toString().padStart(2, '0')
      const minutes = now.getMinutes().toString().padStart(2, '0')
      return `今天 ${hours}:${minutes}`
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
    
    // 再下一单
    createAnother() {
      this.currentStep = 1
      this.formData.products = []
      this.formData.shopName = ''
      this.formData.shopAddress = ''
      this.formData.pickupRemark = ''
      this.formData.deliveryRemark = ''
      this.formData.tip = 0
      this.formData.insurance = false
      this.formData.insulationBag = false
      this.formData.agreement = false
    },
    
    // 返回首页
    goHome() {
      this.$router.push('/home')
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
    }
  }
}
</script>

<style scoped lang="scss">
.snack-order-page {
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

    .section-label {
      font-size: 14px;
      font-weight: 500;
      color: #666;
      margin-bottom: 10px;
    }

    .search-section {
      margin-bottom: 15px;

      ::v-deep .el-input-group__append {
        background-color: #409EFF;
        color: white;
        cursor: pointer;
      }
    }

    .product-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      margin-bottom: 20px;

      .product-card {
        display: flex;
        background-color: #f8f9fa;
        border-radius: 8px;
        padding: 8px;
        position: relative;
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
          background-color: #ecf5ff;
          transform: translateY(-2px);

          .quick-add {
            opacity: 1;
          }
        }

        .product-img {
          width: 50px;
          height: 50px;
          border-radius: 6px;
          object-fit: cover;
          margin-right: 8px;
        }

        .product-info {
          flex: 1;

          .product-name {
            font-size: 14px;
            font-weight: 500;
            color: #333;
            margin-bottom: 2px;
          }

          .product-spec {
            font-size: 11px;
            color: #999;
            margin-bottom: 2px;
          }

          .product-price {
            font-size: 13px;
            color: #f56c6c;
            font-weight: 600;
          }
        }

        .quick-add {
          position: absolute;
          right: 8px;
          bottom: 8px;
          width: 22px;
          height: 22px;
          background-color: #409EFF;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          opacity: 0;
          transition: opacity 0.3s;

          i {
            font-size: 14px;
          }
        }
      }
    }

    .category-tabs {
      display: flex;
      overflow-x: auto;
      gap: 10px;
      padding-bottom: 10px;
      margin-bottom: 10px;
      -webkit-overflow-scrolling: touch;

      &::-webkit-scrollbar {
        display: none;
      }

      .category-tab {
        padding: 6px 15px;
        background-color: #f5f7fa;
        border-radius: 20px;
        font-size: 13px;
        color: #666;
        white-space: nowrap;
        cursor: pointer;
        transition: all 0.3s;

        &.active {
          background-color: #409EFF;
          color: white;
        }
      }
    }

    .category-products {
      max-height: 300px;
      overflow-y: auto;

      .product-item {
        display: flex;
        align-items: center;
        padding: 10px 0;
        border-bottom: 1px solid #f0f0f0;
        cursor: pointer;
        position: relative;

        &:hover {
          background-color: #f5f7fa;

          .el-icon-circle-plus {
            opacity: 1;
          }
        }

        .product-name {
          width: 80px;
          font-size: 14px;
          color: #333;
        }

        .product-spec {
          flex: 1;
          font-size: 12px;
          color: #999;
        }

        .product-price {
          width: 60px;
          font-size: 13px;
          color: #f56c6c;
          font-weight: 600;
        }

        .el-icon-circle-plus {
          position: absolute;
          right: 0;
          color: #67c23a;
          font-size: 18px;
          opacity: 0;
          transition: opacity 0.3s;
        }
      }
    }

    .selected-products {
      margin-top: 15px;
      padding-top: 15px;
      border-top: 1px dashed #f0f0f0;

      .selected-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 0;
        border-bottom: 1px solid #f5f5f5;

        &:last-child {
          border-bottom: none;
        }

        .item-info {
          flex: 1;

          .item-name {
            font-size: 14px;
            font-weight: 500;
            color: #333;
            margin-right: 5px;
          }

          .item-spec {
            font-size: 12px;
            color: #999;
          }
        }

        .item-control {
          display: flex;
          align-items: center;
          gap: 10px;

          .item-price {
            font-size: 14px;
            color: #f56c6c;
            font-weight: 600;
            min-width: 70px;
            text-align: right;
          }

          .el-icon-delete {
            color: #999;
            cursor: pointer;
            font-size: 16px;

            &:hover {
              color: #f56c6c;
            }
          }
        }
      }

      .products-subtotal {
        display: flex;
        justify-content: space-between;
        padding-top: 10px;
        margin-top: 10px;
        border-top: 2px solid #f0f0f0;
        font-size: 14px;
        font-weight: 500;

        .subtotal-price {
          color: #f56c6c;
          font-size: 16px;
          font-weight: 600;
        }
      }
    }

    .manual-add {
      margin-top: 15px;
      padding-top: 15px;
      border-top: 1px dashed #f0f0f0;

      .manual-row {
        margin-top: 10px;
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

      .shop-distance {
        float: right;
        color: #999;
        font-size: 12px;
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

  // 确认支付卡片
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

  // 成功步骤
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

          &.price {
            color: #f56c6c;
            font-weight: 600;
          }
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

  // 地址弹窗
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

  // 历史商品弹窗
  .history-list {
    .history-item {
      display: flex;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #f0f0f0;

      &:last-child {
        border-bottom: none;
      }

      .history-info {
        flex: 1;

        .history-name {
          font-size: 14px;
          font-weight: 500;
          color: #333;
          margin-right: 8px;
        }

        .history-spec {
          font-size: 12px;
          color: #999;
        }
      }

      .history-price {
        font-size: 14px;
        color: #f56c6c;
        font-weight: 600;
        margin-right: 15px;
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