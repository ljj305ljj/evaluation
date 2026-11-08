<template>
  <div ref="evaluation" class="evaluation flex-col">
    <Header />
    <div class="evaluation-box flex-col flex-x-center">
      <div ref="evalTop" class="eval-top">
        <div class="title">{{ homeInfo.name }}</div>
        <div class="people">应考评<span class="num1">{{ homeInfo.total_count }}</span>人，已考评<span class="num2">{{ homeInfo.submit_count }}</span>人</div>
        <div ref="wrapper" class="wrapper">
          <ul ref="content" class="content eval-tabs flex-x-start flex-nowrap ">
            <li v-for="(evaItem,t) in evaItemList" :key="evaItem.id" class="flex-col-center" @click="">
              <div class="tab-user">
                <img src="@/assets/user-icon.png" :class="evaItem.actived ? 'actived': ''">
                <van-icon v-if="evaItem.is_submit" name="checked" color="#14C25D" />
              </div>
              <span :class="evaItem.actived ? 'actived': ''">{{ evaItem.name }}</span>
            </li>
            <!-- <li class="flex-col-center">
          <div class="tab-user">
            <img src="@/assets/user-icon.png" class="">
            <van-icon name="checked" color="#14C25D" />
          </div>
          <span>张老师</span>
        </li>
        <li class="flex-col-center">
          <img src="@/assets/user-icon.png" class="">
          <span>张老师</span>
        </li>
        <li class="flex-col-center">
          <img src="@/assets/user-icon.png" class="">
          <span>张老师</span>
        </li>
        <li class="flex-col-center">
          <img src="@/assets/user-icon.png" class="">
          <span>张老师</span>
        </li>
        <li class="flex-col-center">
          <img src="@/assets/user-icon.png" class="">
          <span>张老师</span>
        </li>
        <li class="flex-col-center">
          <img src="@/assets/user-icon.png" class="">
          <span>张老师</span>
        </li> -->
          </ul>
        </div>
      </div>
      <div ref="tabView" class="eval-tab-view">
        <!-- <template v-for="(evaItem,t) in evaItemList"> -->
        <div v-if="activedEvaItem.actived" class="content-box flex-y-center flex-x-between">
          <div class="infos">
            <div class="name">考评人员</div>
            <div class="username">{{ activedEvaItem.name }}</div>
            <div class="name">部门/职务</div>
            <div class="dept">{{ activedEvaItem.descript }}</div>
            <div class="report" @click="showReport=true">述职报告>></div>
            <van-image-preview v-model="showReport" :images="activedEvaItem.extra_path_arr" @change="onChange" />
          </div>
          <div class="info-photo"><img src="@/assets/user-icon.png"></div>
        </div>
        <template v-for="template in detailHaveAnswer">
          <div v-if="isShowTemplate(template)" :key="'temp'+template.id" class="content-box flex-col">
            <div class="form-title">{{ template.name }}</div>
            <ul class="eval-form">
              <li v-for="que in template.question" :key="'que'+que.id">
                <div>{{ que.content }}</div>
                <van-radio-group v-if="que.type === 1 || que.type === 2" v-model="que.answer" class="flex-x-between" direction="horizontal" :disabled="!isClick">
                  <van-radio
                    v-for="opt in que.option"
                    :key="'opt'+opt.id"
                    :name="opt.id"
                  >{{ opt.content }}</van-radio>
                </van-radio-group>
                <div v-else>
                  <van-field
                    v-model="que.answer"
                    rows="3"
                    autosize
                    type="textarea"
                    placeholder="请输入评议意见"
                  />
                </div>
              </li>
            </ul>
          </div>
        </template>
        <!-- <div class="content-box flex-col">
          <div class="form-title">党委领导班子成员述责述廉评议表</div>
          <ul class="eval-form">
            <li>
              <div>总体评价</div>
              <van-radio-group v-model="radio" class="flex-x-between" direction="horizontal">
                <van-radio name="1">好</van-radio>
                <van-radio name="2">较好</van-radio>
                <van-radio name="3">一般</van-radio>
                <van-radio name="4">差</van-radio>
              </van-radio-group>
            </li>
            <li>
              <div>总体评价</div>
              <van-radio-group v-model="radio" class="flex-x-between" direction="horizontal">
                <van-radio name="1">好</van-radio>
                <van-radio name="2">较好</van-radio>
                <van-radio name="3">一般</van-radio>
                <van-radio name="4">差</van-radio>
              </van-radio-group>
            </li>
            <li>
              <div>总体评价</div>
              <van-radio-group v-model="radio" class="flex-x-between" direction="horizontal">
                <van-radio name="1">好</van-radio>
                <van-radio name="2">较好</van-radio>
                <van-radio name="3">一般</van-radio>
                <van-radio name="4">差</van-radio>
              </van-radio-group>
            </li>
          </ul>
        </div> -->
        <button class="submit-button" :class="isClick ? '' : 'opacity'" @click="submitAndNext()">{{ submitBtnName }}</button>
      </div>
    </div>
  </div>
</template>

<script>
import BScroll from 'better-scroll'
import Header from '@/components/header'
export default {
  name: 'Evaluation',
  components: {
    Header
  },
  filters: {
    // dataFormat(dataItem, fieldItem) {
    //   return fieldItem.count
    //     ? dataItem[fieldItem.id].substr(0, fieldItem.length)
    //     : dataItem[fieldItem.id]
    // },
  },
  data() {
    return {
      radio: {},
      // 图片预览
      showReport: false,
      index: 0,
      evaItemList: [], // 被考评对象列表
      activedEvaItem: {}, // 被选中的考评对象
      deTemplates: [], // 考评卷详情模板
      detailHaveAnswer: [], // 考评卷详情,带答案
      isClick: true

    }
  },
  computed: {
    id() {
      return this.$route.query.id
    },
    submitBtnName() {
      const activedEvaItemIndex = this.evaItemList.findIndex(item => item.actived)
      return activedEvaItemIndex === this.evaItemList.length - 1 ? '确定提交' : '确定提交，继续下一个'
    },
    activedEvaItemIndex() {
      const activedEvaItemIndex = this.evaItemList.findIndex(item => item.actived)
      return activedEvaItemIndex
    },
    homeInfo() {
      return this.$store.getters.homeInfo
    }
  },
  async created() {
    try {
      this.$toast.loading({
        message: '加载中...',
        forbidClick: true,
        // closeOnClick: true,
        duration: 0
      })
      await this.getEvaItemList()
      // this.initScroll()
      await this.getDetailTemplate()
      this.$toast.clear()
    } catch (e) {
      this.$toast.clear()
    }
  },
  mounted() {
  },
  methods: {
    initScroll() {
      const evaItems = this.$refs.content.getElementsByTagName('li')
      // 设置一个起始宽度
      let initWidth = 0
      // 遍历标签
      for (let i = 0; i < evaItems.length; i++) {
        const item = evaItems[i]
        // 将每一个标签宽度相加
        initWidth += item.clientWidth
        console.log(item.clientWidth)
      }
      // var width = (this.evaItemList.length + 1) * 78.6
      console.log(initWidth)
      this.$refs.content.style.width = initWidth + 'px'

      // this.$nextTick(() => {
      //   if (!this.scroll) {
      //     this.scroll = new BScroll(this.$refs.wrapper, { // 实例化BScroll接受两个参数，第一个为父盒子的dom节点
      //       startX: 0, // / 配置的详细信息请参考better-scroll的官方文档，这里不再赘述
      //       click: true,
      //       scrollX: true,
      //       scrollY: false, // 忽略竖直方向的滚动
      //       eventPassthrough: 'vertical',
      //       useTransition: false // 防止快速滑动触发的异常回弹
      //       // stepX: window.innerWidth // 横向切换距离为窗口宽度
      //     })
      //     console.log(this.scroll)
      //   } else {
      //     this.scroll.refresh() // 如果dom结构发生改变调用该方法重新计算来确保滚动效果的正常
      //   }
      // })
    },
    onChange(index) {
      this.index = index
    },
    // select(index) {
    //   this.evaItemList.forEach((item, i) => {
    //     item.actived = false
    //     if (i === index) {
    //       item.actived = true
    //     }
    //   })
    //   const content = document.querySelector(`.content`)
    //   if (index > 2 && index < this.evaItemList.length - 2) {
    //     const scrollOne = content.clientWidth * 0.2
    //     content.scrollTo({ left: scrollOne * (index - 2), behavior: 'smooth' })
    //   } else if (index <= 2) {
    //     content.scrollTo({ left: 0, behavior: 'smooth' })
    //   } else if (index >= this.evaItemList.length - 2) {
    //     content.scrollTo({ right: 0, behavior: 'smooth' })
    //   }
    // },
    getEvaItemList() { // 获取被考评对象列表
      return this.$api.common['getEvaItemList']({ id: this.id }).then(res => {
        if (res.code === 1) {
          this.evaItemList = res.data.map((item, i) => {
            return {
              ...item,
              'extra_path_arr': [`${process.env.VUE_APP_BASE_API}${item.extra_path}`],
              actived: false // 是否选中
            }
          })
          // 选中第一个未提交的被考评人
          const unSubmit = this.evaItemList.filter(item => !item.is_submit)
          unSubmit[0].actived = true
          this.activedEvaItem = unSubmit[0]
          this.$nextTick(() => {
            const curEvaItem = this.$refs.content.getElementsByTagName('li')[this.activedEvaItemIndex]
            const curEvaItemRect = curEvaItem.getBoundingClientRect()
            if (curEvaItemRect.left + curEvaItem.clientWidth / 2 > this.$el.clientWidth / 2) {
              document.querySelector(`.content`).scrollTo({ left: (curEvaItemRect.left + curEvaItem.clientWidth / 2 - this.$el.clientWidth / 2), behavior: 'smooth' })
            }
            // const content = document.querySelector(`.content`)
            // const scrollOne = content.clientWidth * 0.2
            // if (this.activedEvaItemIndex > 2 && this.activedEvaItemIndex < this.evaItemList.length - 2) {
            //   document.querySelector(`.content`).scrollTo({ left: scrollOne * (this.activedEvaItemIndex - 2), behavior: 'smooth' })
            // }
          })
          // console.log(this.evaItemList)
        }
      })
    },
    getDetailTemplate() { // 获取考评卷详情模板
      return this.$api.common['getDetailTemplate']({ id: this.id }).then(res => {
        if (res.code === 1) {
          this.deTemplates = res.data
          this.detailHaveAnswer = JSON.parse(JSON.stringify(res.data))
        }
      })
    },
    // 是否显示考评卷详情模板
    isShowTemplate(template) {
      if ((template.is_party === 1 && this.activedEvaItem.is_party === 1) || template.is_party === 0) {
        return true
      } else {
        return false
      }
    },
    // 提交考评数据
    submitVote() {
      const submitData = {
        evaId: this.id,
        itemsId: this.activedEvaItem.id,
        data: []
      }
      let isSave = true
      this.detailHaveAnswer.forEach(template => {
        if (this.isShowTemplate(template)) {
          template.question.forEach(que => {
            if (que.type === 1 || que.type === 2) { // 选择题
              if (!que.answer && isSave) {
                this.$toast('数据填写不完整！')
                isSave = false
                return
              } else {
                submitData.data.push({
                  questionId: que.id,
                  optionId: que.answer
                })
              }
            } else if (que.type === 3) { // 文本框
              submitData.data.push({
                questionId: que.id,
                optionContent: que.answer || ''
              })
            }
          })
        }
      })
      if (isSave) {
        this.$toast.loading({
          message: '提交中...',
          forbidClick: true,
          // closeOnClick: true,
          duration: 0
        })
        return this.$api.common['submitVote'](submitData).then(res => {
          this.$toast.clear()
          if (res.code === 1) {
            this.$toast.success('考评成功')
            this.activedEvaItem.is_submit = 1
            this.$refs.evaluation.scrollTo({ top: 0, behavior: 'smooth' })
            this.getEvaList()
            return Promise.resolve()
          } else {
            return Promise.reject()
          }
        })
      } else {
        return Promise.reject()
      }
    },
    // 保存提交并跳到下一个被考评人员
    async submitAndNext() {
      // this.isClick = false
      if (this.isClick) {
        this.isClick = false
      } else {
        return
      }
      try {
        await this.submitVote()
        // console.log(33333)
        const activedEvaItemIndex = this.evaItemList.findIndex(item => item.actived)
        if (activedEvaItemIndex === this.evaItemList.length - 1) { // 最后一个被考评人员
          setTimeout(() => {
            this.$router.go(-1)
          }, 1000)
          return
        }
        // setTimeout(() => {
        // 清空填的答案
        this.detailHaveAnswer.forEach(template => {
          template.question.forEach(que => {
            que.answer = ''
          })
        })

        let index
        this.evaItemList.forEach((item, i) => {
          if (item.actived) {
            index = i
            item.actived = false
          }
        })

        if (index < this.evaItemList.length - 1) {
          index++
          this.evaItemList.forEach((item, i) => {
            if (i === index) {
              item.actived = true
              this.activedEvaItem = item
            }
          })
          const curEvaItem = this.$refs.content.getElementsByTagName('li')[index]
          const curEvaItemRect = curEvaItem.getBoundingClientRect()
          if (curEvaItemRect.left + curEvaItem.clientWidth / 2 > this.$el.clientWidth / 2) {
            document.querySelector(`.content`).scrollTo({ left: (curEvaItem.offsetLeft - this.$el.clientWidth / 2 + curEvaItem.clientWidth / 2), behavior: 'smooth' })
          }
        }
      } catch (e) { this.isClick = true }
      this.isClick = true
      // }, 1000)
    },
    // 获取考评卷列表
    getEvaList() {
      return this.$api.common['getEvaList']().then(res => {
        // console.log(res)
        if (res.code === 1) {
          this.$store.commit('user/SET_HOMEINFO', res.data[0])
        }
      })
    }
  }

}
</script>
<style lang="scss" scoped>
    header {
        // position: sticky;
        // top: 0;
        // left: 0;
        // z-index: 2;
        // background: #fff;
        height: 50px;
        line-height: 50px;
        border-bottom: 1px solid #EFEFEF;
        padding: 0 20px;
        font-size: 14px;
        .user-name {
            color: #122469;
        }
    }
    .evaluation {
        width: 100%;
        height: 100%;
        overflow-y: auto;
        .evaluation-box {
            padding-bottom: 20px;
            // overflow-y: auto;
            .eval-top {
                position: sticky;
                top: 0;
                left: 0;
                z-index: 2;
                background: #fff;
            }
            .title {
                font-size: 18px;
                color: #4095E5;
                text-align: center;
                font-weight: bold;
                padding: 20px 0;
            }
            .people{
                font-size: 14px;
                margin-left: 20px;
                .num1 {
                    font-size: 16px;
                    color: #4095E5;
                    font-weight: bold;
                }
                .num2 {
                    font-size: 16px;
                    color: #14C25D;
                    font-weight: bold;
                }
            }

            .eval-tabs{
                margin-top: 20px;
                padding-bottom: 20px;
                overflow-x: scroll;
                border-bottom: 1px solid #e6e4e2;
                li {
                    width: 78.6px;
                    flex: 1 0 auto;
                    .tab-user {
                        position: relative;
                    }
                    // .actived {
                    //     width: 45px;
                    //     height: 45px;
                    //     border-radius: 50%;
                    //     border: 2px solid #f80404;
                    //     text-align: center;
                    // }
                    i {
                        position: absolute;
                        right: -4px;
                        bottom: 3px;
                    }
                    img {
                        width: 45px;
                        height: 45px;
                        border-radius: 50%;
                        padding: 2px
                    }
                    img.actived {
                        border: 2px solid #f80404;

                    }
                    span {
                        padding-top: 10px;
                        font-size: 14px;
                    }
                    span.actived{
                      font-weight: bold;
                    }
                }
            }
            // .wrapper{
            //   width: 100%;
            //   overflow-x: hidden;
            // }
            .content {
                // width: 200%;
                // overflow-x: scroll;
            }
            .content-box {
                margin: 20px;
            }
            .infos {
                line-height: 30px;
                .name {
                    font-size: 13px;
                    color: #122469;
                }
                .username,.dept{
                    font-size: 14px;
                    font-weight: bold;
                }
                .report {
                    color: #4095E5;
                    font-size: 14px;
                    font-weight: bold;
                    border-bottom: 1px solid #4095E5;
                    width: 80px;
                }
            }
            .info-photo {
                img {
                    width: 100px;
                }
            }
        }
        .form-title {
            font-size: 16px;
            font-weight: bold;
            text-align: center;
        }
        .eval-form {
            line-height: 40px;
            font-size: 14px;
            li {
                margin-bottom: 20px;
            }
        }
        .submit-button {
            background:  #4095e5;
            width: 90%;
            height: 50px;
            color: #fff;
            border-radius: 5px;
            font-size: 18px;
            margin: 0 5%;
            font-weight: bold;
        }
        .submit-button.opacity {
            opacity: 0.6;
        }
}
</style>
