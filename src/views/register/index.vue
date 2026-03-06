<template>
  <div class="register-container">
    <div class="register-card">
      <!-- 标题 -->
      <div class="register-header">
        <h2>注册账号</h2>
        <p>加入飞飞跑单平台，享受便捷服务</p>
      </div>

      <!-- 注册表单 -->
      <el-form 
        :model="registerForm" 
        :rules="registerRules" 
        ref="registerFormRef"
        class="register-form"
      >
        <!-- 用户名 -->
        <el-form-item prop="username">
          <el-input
            v-model="registerForm.username"
            placeholder="请输入用户名"
            prefix-icon="el-icon-user"
            size="large"
            clearable
          ></el-input>
        </el-form-item>

        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input
            v-model="registerForm.password"
            type="password"
            placeholder="请输入密码"
            prefix-icon="el-icon-lock"
            size="large"
            show-password
            clearable
          ></el-input>
        </el-form-item>

        <!-- 确认密码 -->
        <el-form-item prop="confirmPassword">
          <el-input
            v-model="registerForm.confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            prefix-icon="el-icon-lock"
            size="large"
            show-password
            clearable
          ></el-input>
        </el-form-item>

        <!-- 昵称 -->
        <el-form-item prop="nickname">
          <el-input
            v-model="registerForm.nickname"
            placeholder="请输入昵称"
            prefix-icon="el-icon-s-custom"
            size="large"
            clearable
          ></el-input>
        </el-form-item>

        <!-- 手机号 -->
        <el-form-item prop="phone">
          <el-input
            v-model="registerForm.phone"
            placeholder="请输入手机号"
            prefix-icon="el-icon-phone"
            size="large"
            clearable
          ></el-input>
        </el-form-item>

        <!-- 角色选择 -->
        <el-form-item prop="role">
          <el-radio-group v-model="registerForm.role">
            <el-radio :label="1">普通用户</el-radio>
            <el-radio :label="2">骑手</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 协议同意 -->
        <el-form-item prop="agreement">
          <el-checkbox v-model="registerForm.agreement">
            我已阅读并同意
            <el-link type="primary">《用户协议》</el-link>
            和
            <el-link type="primary">《隐私政策》</el-link>
          </el-checkbox>
        </el-form-item>

        <!-- 注册按钮 -->
        <el-form-item>
          <el-button 
            type="primary" 
            :loading="loading" 
            @click="handleRegister"
            size="large"
            class="register-button"
          >注册</el-button>
        </el-form-item>

        <!-- 已有账号 -->
        <div class="login-link">
          已有账号？
          <el-link type="primary" @click="$router.push('/login')">立即登录</el-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script>
import md5 from 'js-md5'

export default {
  name: 'Register',
  data() {
    // 自定义验证：确认密码
    const validateConfirmPassword = (rule, value, callback) => {
      if (value !== this.registerForm.password) {
        callback(new Error('两次输入的密码不一致'))
      } else {
        callback()
      }
    }

    // 自定义验证：手机号
    const validatePhone = (rule, value, callback) => {
      const phoneRegex = /^1[3-9]\d{9}$/
      if (!phoneRegex.test(value)) {
        callback(new Error('请输入正确的手机号'))
      } else {
        callback()
      }
    }

    return {
      // 注册表单数据
      registerForm: {
        username: '',
        password: '',
        confirmPassword: '',
        nickname: '',
        phone: '',
        role: 1,  // 默认普通用户
        agreement: false
      },
      // 注册按钮加载状态
      loading: false,
      // 表单验证规则
      registerRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
        ],
        confirmPassword: [
          { required: true, message: '请再次输入密码', trigger: 'blur' },
          { validator: validateConfirmPassword, trigger: 'blur' }
        ],
        nickname: [
          { required: true, message: '请输入昵称', trigger: 'blur' },
          { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
        ],
        phone: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: validatePhone, trigger: 'blur' }
        ],
        agreement: [
          { 
            validator: (rule, value, callback) => {
              if (!value) {
                callback(new Error('请同意用户协议'))
              } else {
                callback()
              }
            }, 
            trigger: 'change' 
          }
        ]
      }
    }
  },
  methods: {
    // 处理注册
    handleRegister() {
      this.$refs.registerFormRef.validate(async (valid) => {
        if (!valid) return

        this.loading = true
        
        try {
          // 准备注册数据
          const registerData = {
            username: this.registerForm.username,
            password: this.registerForm.password,
            // 如果需要加密：password: md5(this.registerForm.password),
            nickname: this.registerForm.nickname,
            phone: this.registerForm.phone,
            role: this.registerForm.role
          }

          // 调用注册接口
          const res = await this.$axios.post('/api/user/register', registerData)
          console.log('注册响应:', res)

          if (res.data.code === 200) {
            // 注册成功
            this.$message.success('注册成功，请登录')
            // 跳转到登录页
            setTimeout(() => {
              this.$router.push('/login')
            }, 1500)
          } else {
            // 注册失败
            this.$message.error(res.message || '注册失败，请重试')
          }
        } catch (error) {
          console.error('注册请求失败:', error)
          this.$message.error('网络错误，请稍后重试')
        } finally {
          this.loading = false
        }
      })
    }
  }
}
</script>

<style scoped lang="scss">
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  
  .register-card {
    width: 450px;
    padding: 40px 30px;
    background: white;
    border-radius: 20px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    
    .register-header {
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
    
    .register-form {
      .el-radio-group {
        margin: 10px 0;
      }
      
      .el-checkbox {
        margin: 15px 0;
        color: #666;
      }
      
      .register-button {
        width: 100%;
        height: 45px;
        font-size: 16px;
        letter-spacing: 1px;
        margin-top: 10px;
      }
      
      .login-link {
        text-align: center;
        margin-top: 20px;
        color: #666;
        font-size: 14px;
      }
    }
  }
}
</style>