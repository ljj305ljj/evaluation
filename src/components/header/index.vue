<template>
  <div>
    <header class="flex-x-between">
      <!-- <div class="home-user flex-x-center">
        <van-icon name="user" color="#101010" size="25" />
        <span class="user-name">木木老师</span>
      </div> -->
      <div class="home-logo flex-y-center"><img src="@/assets/school-logo.png"></div>
      <div class="menu flex-y-center">
        <span @click="logout">退出登录</span>
        <!-- <van-icon name="apps-o" color="#4a4c4e" size="25" /> -->
      </div>
    </header>
  </div>
</template>
<script>
export default {
  created() {

  },
  methods: {
    logout() {
      this.$dialog
        .alert({
          message: '是否退出当前帐号？',
          showCancelButton: true,
          closeOnClickOverlay: true,
          confirmButtonColor: '#4095E5'
        })
        .then(() => {
          this.$api.common['logout']().then(res => {
            if (res.code === 1) {
              this.$store.dispatch('user/logout')
            }
          })
        })
    }
  }
}
</script>>
<style lang="scss" scoped>
    header {
        position: sticky;
        top: 0;
        left: 0;
        height: 50px;
        line-height: 50px;
        border-bottom: 1px solid #EFEFEF;
        padding: 0 20px;
        font-size: 14px;
        .user-name {
            color: #122469;
        }
        .home-logo {
            width: 160px;
            // height: 50px;
            img {
                width: 160px;
            // height: 50px;
            }
        }

    }
</style>
