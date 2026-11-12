<template>
  <div ref="evaluation" class="evaluation flex-col">
    <Header />
    <div class="evaluation-box flex-col flex-x-center">
      <div ref="evalTop" class="eval-top">
        <div class="title">{{ homeInfo.name }}</div>
        <div class="people">应考评<span class="num1">{{ homeInfo.total_count }}</span>人，已考评<span class="num2">{{ homeInfo.submit_count }}</span>人，已考评优秀<span class="num3">{{ homeInfo.excellent_count }}</span>人</div>
        <!-- 测评规则提醒：仅"优秀"名额受限的角色（教职工）展示 -->
        <div v-if="isTeacherLimited" class="excellent-rule">“优秀”等次人数不得超过总测试人数2/3，当前剩余可评优秀{{ remainingExcellent }}人</div>
        <div ref="wrapper" class="wrapper">
          <ul ref="content" class="content eval-tabs flex-x-start flex-nowrap ">
            <li v-for="(evaItem,t) in evaItemList" :key="evaItem.id" class="flex-col-center" @click="selectItem(evaItem, t)">
              <div class="tab-user">
                <img src="@/assets/user-icon.png" :class="evaItem.actived ? 'actived': ''">
                <van-icon v-if="evaItem.is_submit" name="checked" color="#14C25D" />
                <van-icon v-else-if="evaItem.locked" name="lock" color="#C0C4CC" />
              </div>
              <span :class="evaItem.actived ? 'actived': ''">{{ evaItem.name }}</span>
            </li>
          </ul>
        </div>
      </div>
      <div ref="tabView" class="eval-tab-view">
        <div v-if="activedEvaItem.actived" class="content-box flex-y-center flex-x-between">
          <div class="infos">
            <div class="name">考评人员</div>
            <div class="username">{{ activedEvaItem.name }}</div>
            <div class="name">部门/职务</div>
            <div class="dept">{{ activedEvaItem.descript }}</div>
            <div v-if="activedEvaItem.reportUrl" class="report" @click="showReport=true">述职报告>></div>
            <van-image-preview v-model="showReport" :images="[activedEvaItem.reportUrl]" @change="onChange" />
          </div>
          <div class="info-photo"><img src="@/assets/user-icon.png"></div>
        </div>
        <div v-if="submitted" class="submitted-tip">该考评对象已完成测评，以下内容为已提交答卷，仅供查看</div>
        <template v-for="template in detailHaveAnswer">
          <div :key="'temp'+template.name" class="content-box flex-col">
            <div class="form-title">{{ template.name }}</div>
            <ul class="eval-form">
              <li v-for="que in template.question" :key="'que'+que.id">
                <div>{{ que.content }}<span v-if="que.required" class="required-mark">*</span></div>
                <van-radio-group v-if="que.type === 1 || que.type === 2" v-model="que.answer" class="flex-x-between" direction="horizontal" :disabled="!isClick">
                  <van-radio
                    v-for="opt in que.option"
                    :key="'opt'+opt.id"
                    :name="opt.id"
                    :disabled="!isClick || isExcellentDisabled(template, que, opt)"
                  >{{ opt.content }}</van-radio>
                </van-radio-group>
                <div v-else>
                  <van-field
                    v-model="que.answer"
                    rows="3"
                    autosize
                    type="textarea"
                    placeholder="请输入评议意见"
                    :disabled="!isClick"
                  />
                </div>
              </li>
            </ul>
          </div>
        </template>
        <button v-if="!submitted" class="submit-button" :class="isClick && homeInfo.submittable ? '' : 'opacity'" @click="submitAndNext()">{{ submitBtnName }}</button>
      </div>
    </div>
  </div>
</template>

<script>
import Header from '@/components/header'
import { genRandomHex } from '@/utils/openAuth'

export default {
  name: 'Evaluation',
  components: {
    Header
  },
  data() {
    return {
      // 图片预览（与旧版一致：点击述职报告在本页预览）
      showReport: false,
      index: 0,
      evaItemList: [], // 被考评对象列表
      activedEvaItem: {}, // 被选中的考评对象
      detailHaveAnswer: [], // 测评详情，带答案（含述责述廉评议表分组）
      isClick: true, // 是否可作答/提交（已提交对象为只读）
      submitted: false, // 当前对象是否已提交（服务端回显）
      submitToken: '' // 幂等令牌：进入测评页生成一次，重试复用
    }
  },
  computed: {
    id() {
      return this.$route.query.id
    },
    // 是否受"优秀不超过应评2/3"限制：岗位角色为教职工（postRoleCode=TEACHER）且有上限
    isTeacherLimited() {
      const userInfo = this.$store.getters.userInfo || {}
      return userInfo.postRoleCode === 'TEACHER' && this.homeInfo.excellent_limit != null
    },
    // 剩余可评"优秀"人数 = 上限 - 已评优秀数
    remainingExcellent() {
      const limit = this.homeInfo.excellent_limit
      if (limit == null) return 0
      return Math.max(limit - (this.homeInfo.excellent_count || 0), 0)
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
      return this.$store.getters.homeInfo || {}
    }
  },
  async created() {
    this.submitToken = genRandomHex(32)
    try {
      this.$toast.loading({
        message: '加载中...',
        forbidClick: true,
        // closeOnClick: true,
        duration: 0
      })
      await this.getEvaItemList()
      await this.getDetailTemplate() // 加载首个被考评对象的题目详情
      await this.getTaskInfo()
      this.$toast.clear()
    } catch (e) {
      this.$toast.clear()
    }
  },
  methods: {
    onChange(index) {
      this.index = index
    },
    // 切换被考评对象（含点击标签页）
    async selectItem(item, index) {
      if (this.activedEvaItem.id === item.id) return
      if (item.locked) {
        return this.$toast('请按顺序完成前面的测评')
      }
      this.evaItemList.forEach((it, i) => {
        it.actived = i === index
        if (i === index) this.activedEvaItem = it
      })
      try {
        this.$toast.loading({ message: '加载中...', forbidClick: true, duration: 0 })
        await this.getDetailTemplate()
        this.$toast.clear()
      } catch (e) {
        this.$toast.clear()
      }
    },
    getEvaItemList() { // 获取被考评对象列表
      return this.$api.common['getVoteObjects'](this.id).then(list => {
        // 已作废（status=2）对象被移出任务，直接隐藏、不阻断顺序
        this.evaItemList = (list || []).filter(item => item.status !== 2).map(item => {
          return {
            id: item.objectUserId, // 考评对象ID，详情与提交接口要用
            objectNo: item.objectNo,
            name: item.objectName,
            descript: item.jobDescription, // 部门/职务显示 jobDescription
            is_submit: item.status === 1 ? 1 : 0, // 0 待测评 / 1 已提交
            partyEval: item.partyEval, // 是否附带述责述廉评议表
            reportUrl: item.reportUrl || '', // 接口已返回完整地址（含IP），直接使用
            locked: false, // 顺序锁：未提交中只有第一个可作答
            actived: false // 是否选中
          }
        })
        // 顺序锁：按列表顺序，未提交中只有第一个解锁，其后的加锁（点击提示，不置灰）
        let firstUnsubmitFound = false
        this.evaItemList.forEach(item => {
          if (item.is_submit || !firstUnsubmitFound) {
            if (!item.is_submit) firstUnsubmitFound = true
            item.locked = false
          } else {
            item.locked = true
          }
        })
        // 选中对象：当前对象仍在列表（如提交后变已提交）则把选中态绑回新数组，否则选中第一个未提交的
        const current = this.evaItemList.find(item => item.id === this.activedEvaItem.id)
        if (current) {
          current.actived = true
          this.activedEvaItem = current
        } else {
          const unSubmit = this.evaItemList.filter(item => !item.is_submit)
          const first = unSubmit.length ? unSubmit[0] : this.evaItemList[0]
          if (first) {
            first.actived = true
            this.activedEvaItem = first
          }
        }
        this.$nextTick(() => {
          const curEvaItem = this.$refs.content.getElementsByTagName('li')[this.activedEvaItemIndex]
          if (!curEvaItem) return
          const curEvaItemRect = curEvaItem.getBoundingClientRect()
          if (curEvaItemRect.left + curEvaItem.clientWidth / 2 > this.$el.clientWidth / 2) {
            document.querySelector(`.content`).scrollTo({ left: (curEvaItemRect.left + curEvaItem.clientWidth / 2 - this.$el.clientWidth / 2), behavior: 'smooth' })
          }
        })
      })
    },
    // 优秀名额用尽时，仅主考核测评表（schemeName 对应的表）的"总体评价"题不允许选择"优秀"；
    // 述责述廉评议表（partyQuestions）作答只做留痕，不受名额限制
    isExcellentDisabled(template, que, opt) {
      if (!this.isTeacherLimited || this.remainingExcellent > 0) return false
      if (template.is_party) return false
      return String(que.content || '').indexOf('总体评价') > -1 &&
        String(opt.content || '').indexOf('优秀') === 0
    },
    // 获取当前任务信息，写入 homeInfo 供页面头部展示
    getTaskInfo() {
      return this.$api.common['getVoteTasks']().then(async tasks => {
        const task = (tasks || []).find(item => item.taskId === Number(this.id)) || {}
        let progress = {}
        try {
          progress = await this.$api.common['getVoteProgress'](this.id) || {}
        } catch (e) {
          progress = {}
        }
        this.$store.commit('user/SET_HOMEINFO', {
          id: Number(this.id),
          name: task.taskName || '',
          total_count: progress.totalCount || 0,
          submit_count: progress.finishedCount || 0,
          excellent_count: progress.excellentCount || 0, // 已考评优秀人数
          excellent_limit: progress.excellentLimit != null ? progress.excellentLimit : null, // 优秀上限（null=不受限）
          submittable: task.submittable !== false
        })
      })
    },
    // 测评详情：题目 + 已作答回显；党员评议表（partyQuestions）与常规题目分组展示
    getDetailTemplate() {
      this.submitted = false
      this.detailHaveAnswer = []
      if (!this.activedEvaItem.id) return Promise.resolve()
      return this.$api.common['getVoteObjectDetail'](this.id, this.activedEvaItem.id).then(data => {
        const normalize = (questions = []) => questions.map(que => {
          const key = String(que.questionId)
          return {
            id: que.questionId,
            content: que.title,
            type: que.questionType, // 1 单选 / 3 文本
            required: !!que.required,
            option: (que.options || []).map(opt => ({ id: opt.optionId, content: opt.content })),
            // 已作答回显（键为字符串的题目ID）
            answer: que.questionType === 3
              ? (data.textAnswers[key] || '')
              : ((data.selectedOptions[key] || [])[0] || '')
          }
        })
        const sections = [{
          name: data.schemeName,
          is_party: false,
          question: normalize(data.questions)
        }]
        if (data.partyEval && data.partyQuestions && data.partyQuestions.length) {
          sections.push({
            name: data.partySchemeName || '述责述廉评议表',
            is_party: true,
            question: normalize(data.partyQuestions)
          })
        }
        this.submitted = !!data.submitted
        this.isClick = !data.submitted // 已提交则只读展示
        this.detailHaveAnswer = sections
        // 每个对象独立幂等令牌：加载新对象详情时重新生成，
        // 同一对象提交超时重试时复用同一值（服务端以 submitToken 为幂等键）
        this.submitToken = genRandomHex(32)
      })
    },
    // 提交考评数据
    submitVote() {
      const submitData = {
        taskId: Number(this.id),
        objectUserId: this.activedEvaItem.id,
        submitToken: this.submitToken, // 幂等令牌，重试复用同一值
        items: []
      }
      let isSave = true
      this.detailHaveAnswer.forEach(template => {
        template.question.forEach(que => {
          if (que.type === 1 || que.type === 2) { // 单选
            if (!que.answer) {
              if (isSave) {
                this.$toast('数据填写不完整！')
                isSave = false
              }
              return
            }
            submitData.items.push({
              questionId: que.id,
              optionIds: [que.answer]
            })
          } else if (que.type === 3 && que.answer) { // 文本（选填，有内容才提交）
            submitData.items.push({
              questionId: que.id,
              textAnswer: que.answer
            })
          }
        })
      })
      if (!isSave) {
        return Promise.reject()
      }
      this.$toast.loading({
        message: '提交中...',
        forbidClick: true,
        // closeOnClick: true,
        duration: 0
      })
      return this.$api.common['submitVote'](submitData).then(progress => {
        this.$toast.clear()
        this.handleSubmitSuccess(progress)
        return Promise.resolve()
      }).catch(error => {
        this.$toast.clear()
        // 重复提交视为已成功（网络超时重试等场景）
        if (error && error.code === 'ALREADY_SUBMITTED') {
          this.$toast('该考评对象已测评')
          this.handleSubmitSuccess()
          return Promise.resolve()
        }
        return Promise.reject(error)
      })
    },
    // 提交成功后的统一处理：更新状态、刷新进度与对象列表
    handleSubmitSuccess(progress) {
      this.$toast.success('考评成功')
      this.activedEvaItem.is_submit = 1
      this.$refs.evaluation.scrollTo({ top: 0, behavior: 'smooth' })
      // 用接口返回的最新进度刷新页面头部数字
      if (progress && progress.totalCount != null) {
        const homeInfo = { ...this.homeInfo }
        homeInfo.total_count = progress.totalCount
        homeInfo.submit_count = progress.finishedCount
        homeInfo.excellent_count = progress.excellentCount || 0
        homeInfo.excellent_limit = progress.excellentLimit != null ? progress.excellentLimit : null
        this.$store.commit('user/SET_HOMEINFO', homeInfo)
      }
      // 静默刷新对象列表状态
      this.getEvaItemList().catch(() => {})
    },
    // 保存提交并跳到下一个被考评人员
    async submitAndNext() {
      if (!this.homeInfo.submittable) {
        return this.$toast('当前不允许提交')
      }
      // this.isClick = false
      if (this.isClick) {
        this.isClick = false
      } else {
        return
      }
      try {
        await this.submitVote()
        const activedEvaItemIndex = this.evaItemList.findIndex(item => item.actived)
        if (activedEvaItemIndex === this.evaItemList.length - 1) { // 最后一个被考评人员
          setTimeout(() => {
            this.$router.go(-1)
          }, 1000)
          return
        }
        // 切换到下一个未提交的被考评人并拉取其详情
        const next = this.evaItemList.filter(item => !item.is_submit)[0]
        if (next) {
          const nextIndex = this.evaItemList.findIndex(item => item.id === next.id)
          this.evaItemList.forEach((item, i) => {
            item.actived = i === nextIndex
          })
          this.activedEvaItem = next
          const curEvaItem = this.$refs.content.getElementsByTagName('li')[nextIndex]
          const curEvaItemRect = curEvaItem.getBoundingClientRect()
          if (curEvaItemRect.left + curEvaItem.clientWidth / 2 > this.$el.clientWidth / 2) {
            document.querySelector(`.content`).scrollTo({ left: (curEvaItem.offsetLeft - this.$el.clientWidth / 2 + curEvaItem.clientWidth / 2), behavior: 'smooth' })
          }
          await this.getDetailTemplate()
        }
      } catch (e) { this.isClick = true }
      this.isClick = true
      // }, 1000)
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
                .num3 {
                    font-size: 16px;
                    color: #EE0A24;
                    font-weight: bold;
                }
            }
            .excellent-rule {
                margin: 4px 0 0 20px;
                font-size: 12px;
                color: #EE0A24;
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
            .content {
                // width: 200%;
                // overflow-x: scroll;
            }
            .content-box {
                margin: 20px;
            }
            .submitted-tip {
                margin: 0 20px;
                padding: 10px;
                background: #ecf5ff;
                color: #4095E5;
                font-size: 13px;
                border-radius: 5px;
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
            .required-mark {
                color: #f80404;
                margin-left: 2px;
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
            border: none;
        }
        .submit-button.opacity {
            opacity: 0.6;
        }
}
</style>
