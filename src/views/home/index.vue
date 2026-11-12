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
        @click="task.canEnter ? openEvaluation(task) : ''">
        <van-icon v-if="task.finished" name="checked" color="#ffffff" />
        {{ buttonName(task) }}
      </button>
    </div>
    <!-- 考评须知 -->
    <div class="home-box notice">
      <p class="notice-title">考评须知：</p>
      <p class="notice-content" v-html="noticeContent" />
    </div>
    <!-- 本部门测评进度（仅部门管理员，样式沿用旧版"未完成考评人员"卡片） -->
    <div v-for="task in deptTaskList" :key="'dept-' + task.taskId" class="home-box unfinish">
      <div class="unfinish-title">【{{ task.dept.deptName }}】测评进度</div>
      <!-- <div v-if="task.dept.deptName" class="unfinish-sub">{{ task.dept.deptName }}</div> -->
      <div class="unfinish-sub">
        共 {{ task.dept.raterCount }} 人， 已完成 {{ task.dept.finishedRaterCount }}， 进行中
        {{ task.dept.inProgressRaterCount }}， 未开始 {{ task.dept.notStartedRaterCount }}（完成率
        {{ task.dept.finishedPercent }}%）
      </div>
      <ul class="unfinish-content">
        <li v-for="rater in task.dept.raters" :key="rater.userId" class="rater-row">
          <span class="rater-no">{{ rater.username }}</span>
          <span class="rater-name">{{ rater.nickName }}</span>
          <span class="rater-status" :class="raterClass(rater.evalStatus)">
            {{ rater.evalStatusText }}
          </span>
        </li>
      </ul>
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
    isDeptAdmin() {
      // 换令牌响应 deptAdmin=true 才是部门管理员（false 非管理员 / null 未建档），非管理员不展示入口
      const userInfo = this.$store.state.user.userInfo || {}
      return userInfo.deptAdmin === true
    },
    // 有部门进度数据的任务（按接口约定始终排除调用者本人）
    deptTaskList() {
      return this.taskList.filter((task) => task.dept)
    },
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
        dept: null, // 本部门参评人进度（仅部门管理员拉取）
        progress: { totalCount: 0, finishedCount: 0, evalStatus: 0, evalStatusText: '', percent: 0 }
      }))
      await Promise.all([
        // 个人进度
        ...list.map(async (task) => {
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
        }),
        // 部门进度（仅部门管理员；始终排除本人）
        ...(this.isDeptAdmin ? list.map((task) => this.loadDeptRaters(task)) : [])
      ])
      this.taskList = list
    },
    // 拉取单个任务的本部门参评人进度（非管理员 DEPT_ADMIN_REQUIRED 等场景静默忽略）
    loadDeptRaters(task) {
      return this.$api.common['getDeptRaters'](task.taskId)
        .then((dept) => {
          task.dept = dept
        })
        .catch(() => {})
    },
    // 部门进度状态样式：0 未开始 / 1 进行中 / 2 已完成
    raterClass(evalStatus) {
      return { done: evalStatus === 2, doing: evalStatus === 1 }
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

  // 本部门测评进度（样式沿用旧版"未完成考评人员"卡片）
  .unfinish {
    padding: 20px;
    border: 1px solid #e6e4e2;
    border-radius: 10px;
    max-height: 420px;
    overflow-y: auto;
    .unfinish-title {
      font-size: 15px;
      font-weight: bold;
    }
    .unfinish-sub {
      font-size: 12px;
      color: #909399;
      margin-top: 6px;
    }
    .unfinish-content {
      margin-top: 10px;
      li {
        font-size: 14px;
        line-height: 40px;
        border-bottom: 1px solid #efefef;
        &.rater-row {
          display: flex;
          .rater-no {
            width: 100px;
            color: #6b7280;
          }
          .rater-name {
            flex: 1;
          }
          .rater-status {
            color: #909399;
            &.doing {
              color: #4095e5;
            }
            &.done {
              color: #14c25d;
            }
          }
        }
      }
    }
  }
}
</style>
