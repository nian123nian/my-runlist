<template>
  <div class="login-container">
    <div class="login-card">
      <!-- 标题 -->
      <div class="login-header">
        <h2>飞飞跑单平台</h2>
        <p>欢迎回来，请登录您的账号</p>
      </div>

      <!-- 登录表单 -->
      <el-form 
        :model="loginForm" 
        :rules="loginRules" 
        ref="loginFormRef"
        class="login-form"
        @keyup.enter="handleLogin"
      >
        <!-- 用户名输入框 -->
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            prefix-icon="el-icon-user"
            size="large"
            clearable
          ></el-input>
        </el-form-item>

        <!-- 密码输入框 -->
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            prefix-icon="el-icon-lock"
            size="large"
            show-password
            clearable
          ></el-input>
        </el-form-item>

        <!-- 记住密码和忘记密码 -->
        <div class="login-options">
          <el-checkbox v-model="rememberPassword">记住密码</el-checkbox>
          <el-link type="primary" @click="forgotPassword">忘记密码？</el-link>
        </div>

        <!-- 登录按钮 -->
        <el-form-item>
          <el-button 
            type="primary" 
            :loading="loading" 
            @click="handleLogin"
            size="large"
            class="login-button"
          >登录</el-button>
        </el-form-item>

        <!-- 注册链接 -->
        <div class="register-link">
          还没有账号？
          <el-link type="primary" @click="$router.push('/register')">立即注册</el-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script>
import md5 from 'js-md5'  // 密码加密（可选）

export default {
  name: 'Login',
  data() {
    return {
      // 登录表单数据
      loginForm: {
        username: '',
        password: ''
      },
      // 记住密码
      rememberPassword: false,
      // 登录按钮加载状态
      loading: false,
      // 表单验证规则
      loginRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    // 检查是否有记住的密码
    this.loadRememberedPassword()
  },
  methods: {
    // 加载记住的密码
    loadRememberedPassword() {
      const remembered = localStorage.getItem('rememberedUser')
      if (remembered) {
        try {
          const user = JSON.parse(remembered)
          this.loginForm.username = user.username
          this.loginForm.password = user.password
          this.rememberPassword = true
        } catch (e) {
          console.error('读取记住的密码失败', e)
        }
      }
    },

    // 处理登录
    async handleLogin() {
  this.$refs.loginFormRef.validate(async (valid) => {
    if (!valid) return

    this.loading = true
    
    try {
      const loginData = {
        username: this.loginForm.username,
        password: this.loginForm.password
      }

      const res = await this.$axios.post('/api/user/login', loginData)
      console.log('登录响应:', res)
      
      const response = res.data || res
      
      if (response.code === 200) {
        this.$message.success('登录成功')
        
        // ✅ 正确提取数据
        const responseData = response.data || {}
        const userInfo = responseData.user || {}  // 取出 user 对象
        const token = responseData.token          // 取出 token
        
        console.log('用户信息:', userInfo)
        console.log('token:', token)
        
        // 保存到 localStorage
        localStorage.setItem('token', token)
        localStorage.setItem('userInfo', JSON.stringify(userInfo))
        
        // 处理记住密码
        this.handleRememberPassword()
        
        // 跳转
        const redirect = this.$route.query.redirect || '/home'
        this.$router.push(redirect)
      } else {
        this.$message.error(response.message || '登录失败')
      }
    } catch (error) {
      console.error('登录失败:', error)
      this.$message.error('网络错误')
    } finally {
      this.loading = false
    }
  })
},

    // 处理记住密码
    handleRememberPassword() {
      if (this.rememberPassword) {
        const userData = {
          username: this.loginForm.username,
          password: this.loginForm.password
        }
        localStorage.setItem('rememberedUser', JSON.stringify(userData))
      } else {
        localStorage.removeItem('rememberedUser')
      }
    },

    // 忘记密码
    forgotPassword() {
      this.$message.info('请联系管理员重置密码')
    }
  }
}
</script>

<style scoped lang="scss">
.login-container {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  
  .login-card {
    width: 400px;
    padding: 40px 30px;
    background: white;
    border-radius: 20px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    
    .login-header {
      text-align: center;
      margin-bottom: 30px;
      
      h2 {
        color: #333;
        margin-bottom: 10px;
        font-size: 28px;
      }
      
      p {
        color: #999;
        font-size: 14px;
      }
    }
    
    .login-form {
      .el-input {
        margin-bottom: 5px;
      }
      
      .login-options {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin: 10px 0 20px;
        
        .el-checkbox {
          color: #666;
        }
      }
      
      .login-button {
        width: 100%;
        height: 45px;
        font-size: 16px;
        letter-spacing: 1px;
      }
      
      .register-link {
        text-align: center;
        margin-top: 20px;
        color: #666;
        font-size: 14px;
      }
    }
  }
}
</style>