<template>
  <div class="app-container promotion-index">
    <el-tabs v-model="activeTab" type="card" @tab-click="handleTabClick">
      <el-tab-pane label="限时特价" name="flashSale">
        <flash-sale v-if="loadedTabs.flashSale" ref="flashSale" />
      </el-tab-pane>
      <el-tab-pane label="优惠券" name="coupon">
        <coupon v-if="loadedTabs.coupon" ref="coupon" />
      </el-tab-pane>
      <el-tab-pane v-if="showFullReduction" label="满减活动" name="fullReduction">
        <full-reduction v-if="loadedTabs.fullReduction" ref="fullReduction" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import FlashSale from './flashSale.vue'
import Coupon from './coupon.vue'
import FullReduction from './fullReduction.vue'

export default {
  name: 'PromotionIndex',
  components: {
    FlashSale,
    Coupon,
    FullReduction
  },
  data() {
    return {
      activeTab: 'flashSale',
      // 懒加载：只有点击过的 Tab 才渲染组件
      loadedTabs: {
        flashSale: true,
        coupon: false,
        fullReduction: false
      },
      // 满减功能默认隐藏，可通过配置开启
      showFullReduction: process.env.VUE_APP_SHOW_FULL_REDUCTION === 'true'
    }
  },
  methods: {
    handleTabClick(tab) {
      // 懒加载：首次切换到某个 Tab 时才渲染组件
      this.$set(this.loadedTabs, tab.name, true)
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.promotion-index {
  // 移除 Tab 内容的内边距，让子页面自己控制
  ::v-deep .el-tabs__content {
    padding: 0;
  }

  // 子页面样式覆盖
  ::v-deep .app-container {
    padding: 20px 0 0 0;
  }
}
</style>
