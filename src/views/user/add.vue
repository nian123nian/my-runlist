<template>
  <div class="address-manager-page">
    <!-- 顶部导航栏 -->
    <div class="header">
      <i class="el-icon-arrow-left" @click="goBack"></i>
      <span>地址管理</span>
      <i class="el-icon-menu" @click="showMenu"></i>
    </div>

    <!-- 地址列表 -->
    <div class="address-list" v-if="addresses.length > 0">
      <div 
        class="address-card" 
        v-for="address in addresses" 
        :key="address.id"
        :class="{ 'default-card': address.isDefault }"
      >
        <!-- 地址信息 -->
        <div class="address-info" @click="selectAddress(address)">
          <div class="address-header">
            <div class="address-name">
              <span class="name">{{ address.name }}</span>
              <span class="phone">{{ address.phone }}</span>
            </div>
            <div class="address-tags">
              <span class="tag" v-if="address.tag">{{ address.tag }}</span>
              <span class="tag default-tag" v-if="address.isDefault">默认</span>
            </div>
          </div>
          
          <div class="address-detail">
            <div class="location">
              <i class="el-icon-location"></i>
              <span>{{ address.address }} {{ address.detail }}</span>
            </div>
            <div class="address-type" v-if="address.type">
              <i :class="address.type === 'home' ? 'el-icon-house' : 'el-icon-office-building'"></i>
              <span>{{ address.type === 'home' ? '家' : '公司' }}</span>
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="address-actions">
          <el-button 
            type="text" 
            size="small" 
            @click="setDefault(address)"
            v-if="!address.isDefault"
          >
            设为默认
          </el-button>
          <el-button type="text" size="small" @click="editAddress(address)">
            编辑
          </el-button>
          <el-button 
            type="text" 
            size="small" 
            class="delete-btn" 
            @click="confirmDelete(address)"
          >
            删除
          </el-button>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div class="empty-state" v-else>
      <i class="el-icon-location-outline"></i>
      <p>暂无地址，快去添加吧</p>
      <el-button type="primary" size="large" @click="addAddress">新增地址</el-button>
    </div>

    <!-- 底部新增按钮 -->
    <div class="bottom-actions" v-if="addresses.length > 0">
      <el-button type="primary" size="large" @click="addAddress">
        <i class="el-icon-plus"></i> 新增地址
      </el-button>
    </div>

    <!-- 地址表单弹窗 -->
    <el-dialog 
      :title="dialogTitle" 
      :visible.sync="dialog.visible" 
      width="90%"
      class="address-form-dialog"
      @closed="resetForm"
    >
      <el-form 
        :model="form" 
        :rules="rules" 
        ref="addressForm" 
        label-width="80px"
        class="address-form"
      >
        <!-- 收货人 -->
        <el-form-item label="收货人" prop="name">
          <el-input 
            v-model="form.name" 
            placeholder="请输入收货人姓名"
            size="large"
            clearable
          >
            <i slot="prefix" class="el-icon-user"></i>
          </el-input>
        </el-form-item>

        <!-- 手机号码 -->
        <el-form-item label="手机号" prop="phone">
          <el-input 
            v-model="form.phone" 
            placeholder="请输入手机号码"
            size="large"
            maxlength="11"
            clearable
          >
            <i slot="prefix" class="el-icon-phone"></i>
          </el-input>
        </el-form-item>

        <!-- 所在地区 -->
        <el-form-item label="所在地区" prop="region">
          <el-cascader
            v-model="form.region"
            :options="regionOptions"
            :props="{ expandTrigger: 'hover' }"
            placeholder="请选择省/市/区"
            size="large"
            clearable
            class="region-cascader"
            @change="handleRegionChange"
          ></el-cascader>
        </el-form-item>

        <!-- 详细地址 -->
        <el-form-item label="详细地址" prop="detail">
          <el-input 
            v-model="form.detail" 
            placeholder="请输入详细地址（如街道、门牌号等）"
            size="large"
            type="textarea"
            :rows="3"
            clearable
          ></el-input>
        </el-form-item>

        <!-- 地址标签 -->
        <el-form-item label="标签" prop="tag">
          <el-radio-group v-model="form.tag" size="large">
            <el-radio-button label="home">
              <i class="el-icon-house"></i> 家
            </el-radio-button>
            <el-radio-button label="company">
              <i class="el-icon-office-building"></i> 公司
            </el-radio-button>
            <el-radio-button label="other">
              <i class="el-icon-location"></i> 其他
            </el-radio-button>
          </el-radio-group>
        </el-form-item>

        <!-- 自定义标签 -->
        <el-form-item v-if="form.tag === 'other'" prop="customTag">
          <el-input 
            v-model="form.customTag" 
            placeholder="请输入自定义标签（如：学校、父母家等）"
            size="large"
            maxlength="10"
            clearable
          >
            <i slot="prefix" class="el-icon-edit"></i>
          </el-input>
        </el-form-item>

        <!-- 设为默认地址 -->
        <el-form-item>
          <el-checkbox v-model="form.isDefault">设为默认地址</el-checkbox>
        </el-form-item>

        <!-- 位置标记（可选） -->
        <el-form-item label="位置标记" v-if="showLocation">
          <div class="location-map" @click="openMap">
            <i class="el-icon-place"></i>
            <span>{{ form.location || '点击标记具体位置' }}</span>
            <el-button type="text" size="small">重新标记</el-button>
          </div>
        </el-form-item>
      </el-form>

      <!-- 底部按钮 -->
      <div slot="footer" class="dialog-footer">
        <el-button size="large" @click="dialog.visible = false">取消</el-button>
        <el-button type="primary" size="large" @click="saveAddress" :loading="saving">
          保存地址
        </el-button>
      </div>
    </el-dialog>

    <!-- 删除确认弹窗 -->
    <el-dialog
      title="删除地址"
      :visible.sync="deleteDialog.visible"
      width="90%"
      class="delete-dialog"
    >
      <div class="delete-content">
        <i class="el-icon-warning-outline"></i>
        <p>确定要删除这个地址吗？</p>
        <p class="address-preview">{{ deleteDialog.address?.name }} {{ deleteDialog.address?.phone }}</p>
        <p class="address-preview">{{ deleteDialog.address?.address }} {{ deleteDialog.address?.detail }}</p>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button size="large" @click="deleteDialog.visible = false">取消</el-button>
        <el-button type="danger" size="large" @click="deleteAddress" :loading="deleting">
          确认删除
        </el-button>
      </div>
    </el-dialog>

    <!-- 地图选择弹窗（模拟） -->
    <el-dialog
      title="选择位置"
      :visible.sync="mapDialog.visible"
      width="90%"
      class="map-dialog"
    >
      <div class="map-container">
        <div class="map-placeholder">
          <i class="el-icon-map-location"></i>
          <p>地图组件占位</p>
          <p class="map-tip">实际项目中可集成高德地图或腾讯地图</p>
        </div>
        <div class="search-location">
          <el-input 
            v-model="mapDialog.search" 
            placeholder="搜索地点"
            size="large"
            clearable
          >
            <i slot="prefix" class="el-icon-search"></i>
          </el-input>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button size="large" @click="mapDialog.visible = false">取消</el-button>
        <el-button type="primary" size="large" @click="confirmLocation">确认位置</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'AddressManagerPage',
  
  data() {
    return {
      // 地址列表
      addresses: [],
      
      // 表单弹窗
      dialog: {
        visible: false,
        type: 'add' // add 或 edit
      },
      
      // 表单数据
      form: {
        id: '',
        name: '',
        phone: '',
        region: [],
        province: '',
        city: '',
        district: '',
        address: '',
        detail: '',
        tag: 'home',
        customTag: '',
        isDefault: false,
        location: '',
        latitude: '',
        longitude: ''
      },
      
      // 表单验证规则
      rules: {
        name: [
          { required: true, message: '请输入收货人姓名', trigger: 'blur' },
          { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
        ],
        phone: [
          { required: true, message: '请输入手机号码', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
        ],
        region: [
          { required: true, message: '请选择所在地区', trigger: 'change' }
        ],
        detail: [
          { required: true, message: '请输入详细地址', trigger: 'blur' },
          { min: 5, max: 50, message: '详细地址长度在 5 到 50 个字符', trigger: 'blur' }
        ],
        customTag: [
          { required: true, message: '请输入自定义标签', trigger: 'blur' },
          { max: 10, message: '标签长度不能超过10个字符', trigger: 'blur' }
        ]
      },
      
      // 地区选项（模拟数据）
      regionOptions: [
        {
          value: '北京市',
          label: '北京市',
          children: [
            {
              value: '北京市',
              label: '北京市',
              children: [
                { value: '东城区', label: '东城区' },
                { value: '西城区', label: '西城区' },
                { value: '朝阳区', label: '朝阳区' },
                { value: '海淀区', label: '海淀区' },
                { value: '丰台区', label: '丰台区' },
                { value: '石景山区', label: '石景山区' }
              ]
            }
          ]
        },
        {
          value: '上海市',
          label: '上海市',
          children: [
            {
              value: '上海市',
              label: '上海市',
              children: [
                { value: '黄浦区', label: '黄浦区' },
                { value: '徐汇区', label: '徐汇区' },
                { value: '长宁区', label: '长宁区' },
                { value: '静安区', label: '静安区' },
                { value: '普陀区', label: '普陀区' },
                { value: '虹口区', label: '虹口区' }
              ]
            }
          ]
        },
        {
          value: '广东省',
          label: '广东省',
          children: [
            {
              value: '广州市',
              label: '广州市',
              children: [
                { value: '天河区', label: '天河区' },
                { value: '越秀区', label: '越秀区' },
                { value: '海珠区', label: '海珠区' },
                { value: '荔湾区', label: '荔湾区' },
                { value: '白云区', label: '白云区' }
              ]
            },
            {
              value: '深圳市',
              label: '深圳市',
              children: [
                { value: '南山区', label: '南山区' },
                { value: '福田区', label: '福田区' },
                { value: '罗湖区', label: '罗湖区' },
                { value: '宝安区', label: '宝安区' },
                { value: '龙岗区', label: '龙岗区' }
              ]
            }
          ]
        }
      ],
      
      // 保存中状态
      saving: false,
      
      // 删除弹窗
      deleteDialog: {
        visible: false,
        address: null
      },
      
      // 删除中状态
      deleting: false,
      
      // 地图弹窗
      mapDialog: {
        visible: false,
        search: ''
      },
      
      // 是否显示位置标记（实际项目中可以配置）
      showLocation: true
    }
  },
  
  computed: {
    // 弹窗标题
    dialogTitle() {
      return this.dialog.type === 'add' ? '新增地址' : '编辑地址'
    },
    
    // 完整地址
    fullAddress() {
      const { region, detail } = this.form
      if (region && region.length === 3) {
        return `${region.join('')}${detail || ''}`
      }
      return detail || ''
    }
  },
  
  created() {
    this.loadAddresses()
  },
  
  methods: {
    // 加载地址列表
    loadAddresses() {
      try {
        // 从本地存储获取
        const savedAddresses = localStorage.getItem('userAddresses')
        if (savedAddresses) {
          this.addresses = JSON.parse(savedAddresses)
        } else {
          // 模拟数据
          this.addresses = [
            {
              id: 1,
              name: '张三',
              phone: '13800138001',
              province: '北京市',
              city: '北京市',
              district: '朝阳区',
              address: '北京市朝阳区某某大厦',
              detail: 'A座8层801室',
              tag: '公司',
              isDefault: true,
              type: 'company'
            },
            {
              id: 2,
              name: '张三',
              phone: '13800138002',
              province: '北京市',
              city: '北京市',
              district: '海淀区',
              address: '北京市海淀区某某小区',
              detail: '3号楼202室',
              tag: '家',
              isDefault: false,
              type: 'home'
            },
            {
              id: 3,
              name: '张三',
              phone: '13800138003',
              province: '北京市',
              city: '北京市',
              district: '西城区',
              address: '北京市西城区某某学校',
              detail: '家属院5号楼101',
              tag: '父母家',
              isDefault: false,
              type: 'other'
            }
          ]
          this.saveToStorage()
        }
      } catch (e) {
        console.error('加载地址失败', e)
        this.$message.error('加载地址失败')
      }
    },
    
    // 保存到本地存储
    saveToStorage() {
      try {
        localStorage.setItem('userAddresses', JSON.stringify(this.addresses))
      } catch (e) {
        console.error('保存地址失败', e)
      }
    },
    
    // 新增地址
    addAddress() {
      this.dialog.type = 'add'
      this.resetForm()
      this.dialog.visible = true
    },
    
    // 编辑地址
    editAddress(address) {
      this.dialog.type = 'edit'
      
      // 解析地区
      const region = []
      if (address.province) region.push(address.province)
      if (address.city) region.push(address.city)
      if (address.district) region.push(address.district)
      
      this.form = {
        id: address.id,
        name: address.name,
        phone: address.phone,
        region: region,
        province: address.province,
        city: address.city,
        district: address.district,
        address: address.address,
        detail: address.detail,
        tag: this.getTagValue(address.tag),
        customTag: address.tag && !['home', 'company', '其他'].includes(address.tag) ? address.tag : '',
        isDefault: address.isDefault,
        location: address.location || '',
        latitude: address.latitude || '',
        longitude: address.longitude || ''
      }
      
      this.dialog.visible = true
    },
    
    // 获取标签值
    getTagValue(tag) {
      if (tag === '家') return 'home'
      if (tag === '公司') return 'company'
      if (tag === '其他') return 'other'
      return 'other'
    },
    
    // 选择地址（用于从其他页面返回选择）
    selectAddress(address) {
      // 检查是否有回调
      const { callback } = this.$route.query
      if (callback) {
        this.$emit('select', address)
        this.$router.back()
      }
    },
    
    // 设为默认
    setDefault(address) {
      this.addresses = this.addresses.map(addr => ({
        ...addr,
        isDefault: addr.id === address.id
      }))
      this.saveToStorage()
      this.$message.success('已设为默认地址')
    },
    
    // 确认删除
    confirmDelete(address) {
      this.deleteDialog.address = address
      this.deleteDialog.visible = true
    },
    
    // 删除地址
    async deleteAddress() {
      if (!this.deleteDialog.address) return
      
      this.deleting = true
      
      try {
        // 模拟删除延迟
        await new Promise(resolve => setTimeout(resolve, 500))
        
        const addressId = this.deleteDialog.address.id
        this.addresses = this.addresses.filter(addr => addr.id !== addressId)
        this.saveToStorage()
        
        this.deleteDialog.visible = false
        this.$message.success('删除成功')
      } catch (error) {
        this.$message.error('删除失败，请重试')
      } finally {
        this.deleting = false
        this.deleteDialog.address = null
      }
    },
    
    // 保存地址
    async saveAddress() {
      try {
        await this.$refs.addressForm.validate()
        
        this.saving = true
        
        // 模拟保存延迟
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // 构建地址数据
        const addressData = {
          id: this.dialog.type === 'add' ? Date.now() : this.form.id,
          name: this.form.name,
          phone: this.form.phone,
          province: this.form.region[0] || '',
          city: this.form.region[1] || '',
          district: this.form.region[2] || '',
          address: this.fullAddress,
          detail: this.form.detail,
          tag: this.getTagDisplay(),
          isDefault: this.form.isDefault,
          type: this.form.tag,
          location: this.form.location,
          latitude: this.form.latitude,
          longitude: this.form.longitude
        }
        
        if (this.dialog.type === 'add') {
          // 新增
          this.addresses.push(addressData)
        } else {
          // 编辑
          const index = this.addresses.findIndex(addr => addr.id === this.form.id)
          if (index !== -1) {
            this.addresses.splice(index, 1, addressData)
          }
        }
        
        // 如果设为默认，取消其他默认地址
        if (this.form.isDefault) {
          this.addresses = this.addresses.map(addr => ({
            ...addr,
            isDefault: addr.id === addressData.id
          }))
        }
        
        this.saveToStorage()
        
        this.dialog.visible = false
        this.$message.success(this.dialog.type === 'add' ? '添加成功' : '修改成功')
      } catch (error) {
        if (error.message) {
          this.$message.error(error.message)
        } else {
          this.$message.error('保存失败，请重试')
        }
      } finally {
        this.saving = false
      }
    },
    
    // 获取标签显示文本
    getTagDisplay() {
      const tagMap = {
        home: '家',
        company: '公司',
        other: this.form.customTag || '其他'
      }
      return tagMap[this.form.tag] || this.form.customTag
    },
    
    // 地区变更
    handleRegionChange(value) {
      if (value && value.length === 3) {
        this.form.province = value[0]
        this.form.city = value[1]
        this.form.district = value[2]
      }
    },
    
    // 打开地图
    openMap() {
      this.mapDialog.visible = true
    },
    
    // 确认位置
    confirmLocation() {
      // 模拟选择位置
      this.form.location = '北京市朝阳区某某大厦附近'
      this.form.latitude = '39.9042'
      this.form.longitude = '116.4074'
      this.mapDialog.visible = false
      this.$message.success('位置已标记')
    },
    
    // 重置表单
    resetForm() {
      if (this.$refs.addressForm) {
        this.$refs.addressForm.resetFields()
      }
      this.form = {
        id: '',
        name: '',
        phone: '',
        region: [],
        province: '',
        city: '',
        district: '',
        address: '',
        detail: '',
        tag: 'home',
        customTag: '',
        isDefault: false,
        location: '',
        latitude: '',
        longitude: ''
      }
    },
    
    // 显示菜单
    showMenu() {
      this.$message.info('更多功能')
    },
    
    // 返回上一页
    goBack() {
      this.$router.back()
    }
  }
}
</script>

<style scoped lang="scss">
.address-manager-page {
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

  // 地址列表
  .address-list {
    padding: 15px;

    .address-card {
      background-color: white;
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 12px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
      transition: all 0.3s;
      border: 1px solid transparent;

      &:hover {
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
      }

      &.default-card {
        border-color: #409EFF;
        background-color: #f0f9ff;
      }

      .address-info {
        cursor: pointer;
        margin-bottom: 12px;

        .address-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;

          .address-name {
            .name {
              font-size: 16px;
              font-weight: 600;
              color: #333;
              margin-right: 12px;
            }

            .phone {
              font-size: 14px;
              color: #666;
            }
          }

          .address-tags {
            .tag {
              font-size: 11px;
              padding: 2px 8px;
              border-radius: 10px;
              background-color: #f0f0f0;
              color: #666;
              margin-left: 5px;

              &.default-tag {
                background-color: #409EFF;
                color: white;
              }
            }
          }
        }

        .address-detail {
          .location {
            display: flex;
            align-items: flex-start;
            margin-bottom: 5px;

            i {
              color: #999;
              margin-right: 5px;
              font-size: 14px;
              margin-top: 2px;
            }

            span {
              flex: 1;
              font-size: 14px;
              color: #666;
              line-height: 1.5;
            }
          }

          .address-type {
            display: flex;
            align-items: center;
            font-size: 12px;
            color: #999;
            margin-left: 19px;

            i {
              margin-right: 4px;
              font-size: 12px;
            }
          }
        }
      }

      .address-actions {
        display: flex;
        justify-content: flex-end;
        border-top: 1px solid #f0f0f0;
        padding-top: 12px;

        .el-button {
          margin-left: 15px;
          padding: 0;

          &:first-child {
            margin-left: 0;
          }

          &.delete-btn {
            color: #f56c6c;

            &:hover {
              color: #f78989;
            }
          }
        }
      }
    }
  }

  // 空状态
  .empty-state {
    text-align: center;
    padding: 80px 20px;

    i {
      font-size: 80px;
      color: #dcdfe6;
      margin-bottom: 20px;
    }

    p {
      color: #999;
      margin-bottom: 30px;
      font-size: 16px;
    }

    .el-button {
      width: 200px;
      height: 44px;
      border-radius: 22px;
    }
  }

  // 底部新增按钮
  .bottom-actions {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: white;
    padding: 12px 15px;
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
    z-index: 100;

    .el-button {
      width: 100%;
      height: 44px;
      border-radius: 22px;
      
      i {
        margin-right: 5px;
      }
    }
  }

  // 地址表单弹窗
  .address-form-dialog {
    .address-form {
      .region-cascader {
        width: 100%;
      }

      .location-map {
        background-color: #f5f7fa;
        border-radius: 8px;
        padding: 12px;
        display: flex;
        align-items: center;
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
          background-color: #ecf5ff;
        }

        i {
          font-size: 18px;
          color: #409EFF;
          margin-right: 8px;
        }

        span {
          flex: 1;
          color: #666;
          font-size: 14px;
        }

        .el-button {
          margin-left: 10px;
        }
      }
    }

    .dialog-footer {
      display: flex;
      gap: 12px;

      .el-button {
        flex: 1;
        height: 44px;
        border-radius: 22px;
      }
    }
  }

  // 删除确认弹窗
  .delete-dialog {
    .delete-content {
      text-align: center;
      padding: 20px 0;

      i {
        font-size: 50px;
        color: #e6a23c;
        margin-bottom: 15px;
      }

      p {
        color: #333;
        font-size: 16px;
        margin-bottom: 10px;
      }

      .address-preview {
        color: #999;
        font-size: 14px;
        margin-bottom: 5px;
      }
    }

    .dialog-footer {
      display: flex;
      gap: 12px;

      .el-button {
        flex: 1;
        height: 44px;
        border-radius: 22px;
      }
    }
  }

  // 地图弹窗
  .map-dialog {
    .map-container {
      position: relative;
      min-height: 400px;

      .map-placeholder {
        height: 300px;
        background-color: #f5f7fa;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
        margin-bottom: 15px;

        i {
          font-size: 60px;
          color: #dcdfe6;
          margin-bottom: 10px;
        }

        p {
          color: #999;
          margin-bottom: 5px;
        }

        .map-tip {
          font-size: 12px;
          color: #c0c4cc;
        }
      }

      .search-location {
        position: absolute;
        top: 15px;
        left: 15px;
        right: 15px;

        .el-input {
          background-color: white;
          border-radius: 22px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
      }
    }

    .dialog-footer {
      display: flex;
      gap: 12px;

      .el-button {
        flex: 1;
        height: 44px;
        border-radius: 22px;
      }
    }
  }
}

// 移动端适配
@media screen and (max-width: 375px) {
  .address-manager-page {
    .address-list {
      .address-card {
        .address-header {
          flex-direction: column;
          align-items: flex-start;

          .address-tags {
            margin-top: 5px;
          }
        }
      }
    }
  }
}
</style>