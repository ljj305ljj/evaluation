<template>
  <div class="home flex-col">
    <Header />
    <!-- 考评入口 -->
    <div class="entrance flex-y-center flex-x-between">
      <div class="" style="flex: 1">
        <div class="subject">{{ homeInfo.name }}</div>
        <div class="subhead"><span>应考评 {{ homeInfo.total_count }}，</span><span>已考评 {{ homeInfo.submit_count }}</span></div>
      </div>
      <button v-if="homeInfo.total_count" class="begin-btn" :class="homeInfo.total_count && homeInfo.total_count === homeInfo.submit_count ? 'finish' : ''" @click="homeInfo.total_count && homeInfo.total_count === homeInfo.submit_count ? '' : openEvaluation(homeInfo.id)">
        <van-icon v-if="homeInfo.total_count === homeInfo.submit_count" name="checked" color="#ffffff" />{{ buttonName }}
      </button>
    </div>
    <!-- <div class="entrance flex-y-center flex-x-between">
      <div class="" style="flex: 1">
        <div class="subject">福建理工大学2022年考评</div>
        <div class="subhead"><span>应考评 5，</span><span>已考评 0</span></div>
      </div>
      <button class="begin-btn finish" @click="openEvaluation"><van-icon name="checked" color="#ffffff" />完成</button>
    </div> -->
    <div class="home-box notice">
      <p class="notice-title">考评须知：</p>
      <p class="notice-content" v-html="homeInfo.remark" />
    </div>

    <div v-if="unFinishData.length" class="home-box unfinish">
      <div class="unfinish-title">未完成考评人员（<span>{{ unFinishDataNum }}</span>）</div>
      <ul class="unfinish-content">
        <template v-for="data in unFinishData">
          <li :key="data.id" v-html="data.nickname" />
        </template>
      </ul>
    </div>
  </div>

</template>

<script>
import Header from '@/components/header'
export default {
  name: 'Home',
  components: {
    Header
  },
  data() {
    return {
      homeInfo: {},
      unFinishDataNum: 0, // 未完成考评人员数
      unFinishData: [] // 未完成考评人员
    }
  },
  computed: {
    buttonName() {
      let btn = '开始考评'
      if (this.homeInfo.submit_count === 0) {
        btn = '开始考评'
      } else if (this.homeInfo.total_count > this.homeInfo.submit_count) {
        btn = '继续考评'
      } else if (this.homeInfo.total_count === this.homeInfo.submit_count) {
        btn = '完成'
      }
      return btn
    }
  },
  async created() {
    try {
      this.getToken()
      this.$toast.loading({
        message: '加载中...',
        forbidClick: true,
        // closeOnClick: true,
        duration: 0
      })
      // this.getInfo()
      await this.getEvaList()
      await this.getProgressData()
      this.$toast.clear()
    } catch (e) {
      this.$toast.clear()
    }
  },
  methods: {
    // test() {
    //   this.$toast.loading({
    //     message: '加载中...',
    //     forbidClick: true,
    //     // closeOnClick: true,
    //     duration: 0
    //   })
    //   this.$api.common['getInfo']().then(res => {
    //     console.log(res)
    //     this.$toast.clear()
    //   })
    // },
    getToken() {
      const token = this.$route.query.token
       console.log(token)
      if (token) {
        this.$store.commit('user/SET_TOKEN', token)
      } else {
        // this.$router.push('/login')
      }
    },
    openEvaluation(id) {
      this.$router.push({
        path: '/home/evaluation',
        query: {
          id
        }
      })
    },
    getInfo() {
      this.$api.common['getInfo']().then(res => {
        console.log(res)
      })
    },
    // 获取考评卷列表
    getEvaList() {
      return this.$api.common['getEvaList']().then(res => {
        // console.log(res)
        if (res.code === 1) {
          res.data[0].remark = res.data[0].remark.replaceAll(/span/g, 'p')
          this.homeInfo = res.data[0]
          this.$store.commit('user/SET_HOMEINFO', this.homeInfo)
        }
      })
    },
    // 获取学院未完成考评人员列表
    getProgressData(page = 1) {
      const data = {
        id: this.homeInfo.id,
        type: 1, // 1-未完成  2-已完成  0-全部
        page: page
      }
      return this.$api.common['getProgressData'](data).then(res => {
        if (res.code === 1 && res.data) {
          // console.log(res.data)
          if (page === 1) {
            this.unFinishDataNum = res.data.no_ended
          }
          this.unFinishData = this.unFinishData.concat((res.data.list && res.data.list.data) || [])
          const last_page = res.data.list && res.data.list.last_page
          page++
          if (page <= last_page) {
            this.getProgressData(page)
          }
        }
      })
    }
  }

}
</script>
<style lang="scss" scoped>
    .home {
        width: 100%;
        height: 100%;
        overflow-y: auto;
        .home-box {
            margin: 20px;
        }
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
        .entrance{
            height: 100px;
            margin: 20px 20px 0 20px;
            border: 1px solid #e6e4e2;
            border-radius: 10px;
            box-shadow: 0px 0px 2px 0px rgba(0, 0, 0, 0.4);
            padding: 20px 15px;
            .subject {
                font-size: 18px;
                font-weight: bold;
                padding-bottom: 10px
            }
            .subhead{
                 font-size: 14px;
                 span {
                    //  padding-right: 10px;
                 }
            }
            .begin-btn {
                width: 90px;
                height: 40px;
                background: #4095E5;
                color: #fff;
                font-weight: bold;
                border-radius: 5px;
                font-size: 16px;
                padding: 10px;
            }
            .finish{
              background: #14c25d;
            }
        }

        .notice {
            .notice-title {
                font-size: 14px;
                line-height: 30px;
            }
            .notice-content {
                font-size: 12px;
                line-height: 20px;
            }
        }
        .unfinish {
            height: 420px;
            padding: 20px ;
            border: 1px solid #e6e4e2;
            border-radius: 10px;
            overflow-y: auto;
            .unfinish-title {
                font-size: 15px;
                font-weight: bold;
            }
            .unfinish-content {
                margin-top: 10px;
                li {
                    font-size: 14px;
                    line-height: 40px;
                    border-bottom: 1px solid #EFEFEF;
                }
            }
        }
    }
</style>
