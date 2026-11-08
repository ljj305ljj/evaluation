<template>
  <div class="login flex-col flex-y-center">
    <div class="login-logo">
      <img src="@/assets/login-logo.png" alt>
    </div>
    <div class="login-title">福建理工大学<br>中层干部学年度考评系统</div>
    <div class="login-form">
      <div class="login-form-item flex-y-center">
        <input v-model.trim="loginForm.username" type="text" class="flex-1" placeholder="请输入登录账号">
      </div>
      <div class="login-form-item flex-y-center">
        <input
          v-model.trim="loginForm.password"
          :type="isShowPassWord?'text':'password'"
          class="flex-1"
          placeholder="请输入登录密码"
          @keyup.enter="toLogin"
        >
        <van-icon
          :name="isShowPassWord ? 'eye-o' : 'closed-eye'"
          color="#101010"
          size="20"
          style="margin-left:10px"
          @click="isShowPassWord=!isShowPassWord"
        />
      </div>
    </div>
    <button class="login-button" @click="toLogin">登录</button>
  </div>
</template>

<script>
export default {
  name: 'Login',
  data() {
    return {
      loginForm: {
        username: '',
        password: ''
      },
      isShowPassWord: false
    }
  },
  created() {},
  methods: {
    async toLogin() {
      const { username, password } = this.loginForm
      if (!username) {
        return this.$toast('账号不能为空')
      }
      if (!password) {
        return this.$toast('密码不能为空')
      }
      this.$store.commit('user/SET_LOGINFORM', '') // 先清空登录信息
      this.$store.dispatch('user/login', this.loginForm).then(res => {
        console.log(res)
        this.$store.commit('user/SET_LOGINFORM', this.loginForm)
        this.$router.replace('/')
      })

      // this.$router.replace('/')
    }
  }

}
</script>
<style lang="scss" scoped>
    .login {
      width: 100%;
      height:100%;
      overflow-y: auto;
      .login-logo {
        // margin-top: 100px;
        img {
           width: 100px;
           height: 100px;
        }
      }
      .login-title {
        font-size: 24px;
        font-weight: bold;
        margin: 20px;
        text-align: center;
        line-height: 40px;
      }
      .login-form {
        width: 80%;
        margin: 60px 20px 20px 20px;
        .login-form-item {
          border: 1px solid #e6e4e2;
          border-radius: 5px;
          padding: 0 20px;
          width: 100%;
          height: 50px;
          margin-bottom: 20px;
          &:last-child {
            margin: 0;
          }
          input {
            color: #000;
            &::placeholder {
              color: #C0C0C0;
            }
          }
        }
      }
      .login-button {
        background:  #4095e5;
        width: 80%;
        height: 50px;
        color: #fff;
        border-radius: 5px;
        margin-top: 20px;
        font-weight: bold;
        font-size: 18px;
      }
    }
</style>
