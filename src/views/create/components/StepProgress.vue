<!-- src/views/create/components/StepProgress.vue -->
<template>
  <div class="step-progress">
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
  </div>
</template>

<script>
export default {
  name: 'StepProgress',
  props: {
    currentStep: {
      type: Number,
      default: 1
    }
  }
}
</script>

<style scoped lang="scss">
.step-progress {
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
      flex: 1;
      height: 2px;
      background-color: #f0f0f0;
      margin: 0 5px;
      margin-bottom: 20px;

      &.active {
        background-color: #409EFF;
      }
    }
  }
}
</style>