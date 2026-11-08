<template>
  <div id="app">
    <keep-alive class="keep" :include="cachedViews">
      <router-view :key="key" />
    </keep-alive>
  </div>
</template>
<script>
export default {
  name: 'App',
  computed: {
    cachedViews() {
      return this.$store.state.routerCache.cachedViews
    },
    key() {
      return this.$route.matched.length
        ? this.$route.matched[0].path
        : this.$route.path
    }
  },
  watch: {
    $route() {
      this.addTags()
    }
  },
  created() {
    // 初始化字体大小
    this.$store.dispatch('setting/initRootSize', 39.5)
  },
  mounted() {
  },
  beforeDestroy() {
  },
  methods: {
    addTags() {
      const { matched } = this.$route
      // console.log(this.$route)
      matched.forEach((item) => {
        if (item.name) {
          this.$store.commit('routerCache/ADD_CACHED_VIEW', item)
        }
      })
    },
    back() {
      this.$router.go('-1')
    }
  }
}
</script>
<style lang="scss">
[v-cloak] {
  display: none;
}
</style>
