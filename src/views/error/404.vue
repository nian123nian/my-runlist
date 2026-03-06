
<template>
    <div class="error-404">
        <div class="error-content">
            <div class="error-icon">
                <i class="el-icon-circle-close"></i>
            </div>
            <h1 class="error-code">404</h1>
            <h2 class="error-message">页面不存在</h2>
            <p class="error-desc">抱歉，您访问的页面不存在或已被移除</p>
            <div class="error-actions">
                <el-button type="primary" @click="goBack">返回上一页</el-button>
                <el-button @click="goHome">返回首页</el-button>
            </div>
        </div>
    </div>
</template>

<script>
export default{
    name:'Error404',
    methods:{
        goBack(){
            this.$router.go(-1)
        },
        goHome(){
            this.$router.push('/')
        }
    }
}
</script>

<style scoped lang="scss">
.error-404 {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  
  .error-content {
    text-align: center;
    padding: 40px;
    background: white;
    border-radius: 20px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    max-width: 500px;
    width: 90%;
    
    .error-icon {
      margin-bottom: 20px;
      
      i {
        font-size: 80px;
        color: #f56c6c;
      }
    }
    
    .error-code {
      font-size: 72px;
      font-weight: 700;
      color: #333;
      margin: 0;
      line-height: 1;
    }
    
    .error-message {
      font-size: 24px;
      color: #666;
      margin: 20px 0 10px;
    }
    
    .error-desc {
      font-size: 14px;
      color: #999;
      margin-bottom: 30px;
    }
    
    .error-actions {
      display: flex;
      gap: 15px;
      justify-content: center;
      
      .el-button {
        min-width: 120px;
      }
    }
  }
}
</style>