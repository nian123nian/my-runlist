<template>
  <div class="fee-card">
    <div class="fee-item">
      <span>基础跑腿费</span>
      <span>¥{{ baseFee }}</span>
    </div>
    <div class="fee-item" v-if="tip > 0">
      <span>小费</span>
      <span>¥{{ tip }}</span>
    </div>
    <div class="fee-item" v-if="insurance">
      <span>保险费</span>
      <span>¥1</span>
    </div>
    <div class="fee-item" v-if="extraFee > 0">
      <span>{{ extraFeeLabel }}</span>
      <span>¥{{ extraFee }}</span>
    </div>
    <div class="fee-item total">
      <span>预估总价</span>
      <span>¥{{ total }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FeeCard',
  props: {
    baseFee: {
      type: Number,
      default: 0
    },
    tip: {
      type: Number,
      default: 0
    },
    insurance: {
      type: Boolean,
      default: false
    },
    extraFee: {
      type: [Number, String],
      default: 0
    },
    extraFeeLabel: {
      type: String,
      default: '附加费用'
    }
  },
  computed: {
    total() {
      let total = this.baseFee + this.tip
      if (this.insurance) total += 1
      if (this.extraFee) total += parseFloat(this.extraFee)
      return total.toFixed(2)
    }
  }
}
</script>