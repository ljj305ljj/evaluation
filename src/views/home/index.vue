<template>
  <div class="home flex-col">
    <Header />
    <!-- 考评入口 -->
    <div v-for="task in taskList" :key="task.taskId" class="entrance flex-y-center flex-x-between">
      <div class="" style="flex: 1">
        <div class="subject">{{ task.taskName }}</div>
        <div class="subhead">
          <span>应考评 {{ task.progress.totalCount }}，</span>
          <span>已考评 {{ task.progress.finishedCount }}</span>
          <!-- <span v-if="task.statusText">（{{ task.statusText }}）</span> -->
        </div>
      </div>
      <button
        v-if="task.progress.totalCount"
        class="begin-btn"
        :class="task.finished ? 'finish' : ''"
        :disabled="!task.canEnter"
        @click="task.canEnter ? openEvaluation(task) : ''"
      >
        <van-icon v-if="task.finished" name="checked" color="#ffffff" />
        {{ buttonName(task) }}
      </button>
    </div>
    <!-- 考评须知 -->
    <div class="home-box notice">
      <p class="notice-title">考评须知：</p>
      <p class="notice-content" v-html="noticeContent" />
    </div>
    <div v-if="!taskList.length" class="home-box notice">
      <p class="notice-content">暂无测评任务</p>
    </div>
  </div>
</template>

<script>
import Header from '@/components/header'

// 考评须知文案（前端写死，与旧版一致按 span→p 渲染换行）
const EVALUATION_NOTICE =
  '<span>1.本次考核评议委托第三方进行，相关信息严格保密，请客观、公正、如实填写，为学校中层干部考核评议工作提供可靠参考；</span>' +
  '<span>2.评价意见分“好、较好、一般、差”/“优秀、合格、基本合格、不合格”四项，每项评议必填；</span>' +
  '<span>3.考评过程为评议一个提交一个，每个被评对象只能提交一次评价结果，提交后不可修改；</span>' +
  '<span>4.考评过程中，如误操作退出，重新进入系统后可继续考评；</span>\r\n'

export default {
  name: 'Home',
  components: {
    Header
  },
  data() {
    return {
      taskList: [] // 我的测评任务（含个人进度）
    }
  },
  computed: {
    noticeContent() {
      // 与旧版一致：span 转 p 使每条须知独立成行
      return EVALUATION_NOTICE.replace(/span/g, 'p')
    },
    buttonName() {
      return (task) => {
        // 用个人测评进度 evalStatus 决定按钮文案：0 未开始 / 1 进行中 / 2 已完成
        if (task.progress.evalStatus === 2) {
          return '完成'
        }
        if (
          task.progress.evalStatus === 1 ||
          (task.progress.finishedCount > 0 &&
            task.progress.finishedCount < task.progress.totalCount)
        ) {
          return '继续考评'
        }
        return '开始考评'
      }
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
      await this.getTaskList()
      this.$toast.clear()
    } catch (e) {
      this.$toast.clear()
    }
  },
  // keepAlive 页面从考评页返回时刷新进度
  activated() {
    if (this.taskList.length) {
      this.getTaskList()
    }
  },
  methods: {
    getToken() {
      const token = this.$route.query.token
      if (token) {
        this.$store.commit('user/SET_TOKEN', token)
      } else {
        // this.$router.push('/login')
      }
    },
    openEvaluation(task) {
      this.$router.push({
        path: '/home/evaluation',
        query: {
          id: task.taskId
        }
      })
    },
    // 我的测评任务列表 + 逐个任务拉取个人测评进度
    async getTaskList() {
      const tasks = await this.$api.common['getVoteTasks']()
      const list = (tasks || []).map((task) => ({
        taskId: task.taskId,
        taskName: task.taskName,
        schoolYear: task.schoolYear,
        status: task.status,
        statusText: task.statusText,
        submittable: task.submittable,
        canEnter: task.submittable !== false, // submittable=false 时置灰（文档约定）
        finished: false, // 个人进度是否全部完成（evalStatus===2）
        progress: { totalCount: 0, finishedCount: 0, evalStatus: 0, evalStatusText: '', percent: 0 }
      }))
      await Promise.all(
        list.map(async task => {
          try {
            const progress = await this.$api.common['getVoteProgress'](task.taskId)
            task.progress = {
              totalCount: progress.totalCount || 0,
              finishedCount: progress.finishedCount || 0,
              evalStatus: progress.evalStatus,
              evalStatusText: progress.evalStatusText,
              percent: progress.percent || 0
            }
            task.finished = progress.evalStatus === 2
          } catch (e) {
            // 非本任务参评人等情况，保持默认全 0
          }
        })
      )
      this.taskList = list
    },
    // 供考评页提交成功后刷新进度
    refreshTaskProgress(taskId) {
      const task = this.taskList.find((item) => item.taskId === Number(taskId))
      if (!task) return Promise.resolve()
      return this.$api.common['getVoteProgress'](taskId)
        .then((progress) => {
          task.progress = {
            totalCount: progress.totalCount || 0,
            finishedCount: progress.finishedCount || 0,
            evalStatus: progress.evalStatus,
            evalStatusText: progress.evalStatusText,
            percent: progress.percent || 0
          }
          task.finished = progress.evalStatus === 2
        })
        .catch(() => {})
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
    border-bottom: 1px solid #efefef;
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
  .entrance {
    height: 100px;
    margin: 20px 20px 0 20px;
    border: 1px solid #e6e4e2;
    border-radius: 10px;
    box-shadow: 0px 0px 2px 0px rgba(0, 0, 0, 0.4);
    padding: 20px 15px;
    .subject {
      font-size: 18px;
      font-weight: bold;
      padding-bottom: 10px;
    }
    .subhead {
      font-size: 14px;
      span {
        //  padding-right: 10px;
      }
    }
    .begin-btn {
      width: 90px;
      height: 40px;
      background: #4095e5;
      color: #fff;
      font-weight: bold;
      border-radius: 5px;
      font-size: 16px;
      padding: 10px;
      border: none;
    }
    .begin-btn:disabled {
      background: #c0c4cc;
    }
    .finish {
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
}
</style>
