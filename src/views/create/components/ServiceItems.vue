<template>
  <div class="service-items">
    <!-- 增值服务内容 -->
    <div class="form-card">
      <div class="card-header">
        <i class="el-icon-star-on"></i>
        <span>增值服务</span>
      </div>
      <!-- ... 其他内容 -->
    </div>
  </div>
</template>

<script>
export default {
  name: 'ServiceItems',
  data() {
    return {
      tip: 0,
      insurance: false
    }
  },
  methods: {
    handleChange() {
      this.$emit('service-change', {
        tip: this.tip,
        insurance: this.insurance
      })
    }
  }
}
</script>