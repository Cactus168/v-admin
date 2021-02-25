<template>
    <div class="login">
        <el-form :rules="rules" ref="loginForm" :model="loginForm" class="loginContainer">
            <h3 class="loginTitle">V-Admin</h3>
            <el-form-item prop="username">
                <el-input prefix-icon="el-icon-user" size="normal" type="text" v-model="loginForm.username" auto-complete="off"
                          placeholder="请输入用户名"></el-input>
            </el-form-item>
            <el-form-item prop="password">
                <el-input prefix-icon="el-icon-key" size="normal" type="password" v-model="loginForm.password" auto-complete="off"
                          placeholder="请输入密码"></el-input>
            </el-form-item>
            <el-form-item prop="code">
                <el-input prefix-icon="el-icon-info" size="normal" type="text" v-model="loginForm.code" auto-complete="off"
                          placeholder="点击图片更换验证码" @keydown.enter.native="submitLogin" style="width: 250px"></el-input>
                <img :src="vcUrl" @click="updateVerifyCode" alt="" style="cursor: pointer">
            </el-form-item>
            <!-- <el-button size="normal" type="primary" style="width: 100%;" @click="submitLogin">登录</el-button> -->
            <el-button
              :loading="loading"
              size="medium"
              type="primary"
              style="width:100%;"
              @click.native.prevent="submitLogin"
            >
              <span v-if="!loading">登 录</span>
              <span v-else>登 录 中...</span>
            </el-button>
        </el-form>
    </div>
</template>

<script>
import { getCodeImg } from '@/api/login'
import { getUUID } from '@/utils'
export default {
  name: 'Login',
  data () {
    return {
      vcUrl: '',
      loginForm: {
        username: 'admin',
        password: '123456',
        uuid: getUUID(),
        code: ''
      },
      loading: false,
      rules: {
        username: [{required: true, message: '请输入用户名', trigger: 'blur'}],
        password: [{required: true, message: '请输入密码', trigger: 'blur'}],
        code: [{required: true, message: '请输入验证码', trigger: 'blur'}]
      }
    }
  },
  created () {
    this.updateVerifyCode()
  },
  methods: {
    updateVerifyCode () {
      getCodeImg(this.loginForm.uuid).then(data => {
        this.vcUrl = data // data即为图片地址
      })
    },
    submitLogin () {
      this.$refs.loginForm.validate((valid) => {
        if (valid) {
          this.loading = true
          this.$store.dispatch('Login', this.loginForm).then(() => {
            this.$router.push({ path: this.redirect || '/' })
          }).catch(() => {
            this.loading = false
            this.loginForm.code = ''
            this.updateVerifyCode()
          })
        } else {
          return false
        }
      })
    }
  }
}
</script>

<style>
    .login {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
      background-image: url("../assets/img/login-background.jpg");
      background-size: cover;
    }
    .loginContainer {
        border-radius: 15px;
        background-clip: padding-box;
        margin: 180px auto;
        width: 350px;
        padding: 15px 35px 15px 35px;
        background: #fff;
        border: 1px solid #eaeaea;
        box-shadow: 0 0 25px #cac6c6;
    }

    .loginTitle {
        margin: 15px auto 20px auto;
        text-align: center;
        color: #505458;
    }

    .loginRemember {
        text-align: left;
        margin: 0px 0px 15px 0px;
    }
    .el-form-item__content{
        display: flex;
        align-items: center;
    }
</style>
