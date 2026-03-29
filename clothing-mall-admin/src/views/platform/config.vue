<template>
  <div class="app-container platform-config">
    <el-tabs v-model="activeTab" type="card" @tab-click="handleTabClick">
      <el-tab-pane label="平台规则" name="rule">
        <rule-config v-if="loadedTabs.rule" />
      </el-tab-pane>
      <el-tab-pane label="促销管理" name="promotion">
        <promotion-index v-if="loadedTabs.promotion" />
      </el-tab-pane>
      <el-tab-pane label="小程序设置" name="wx">
        <wx-config v-if="loadedTabs.wx" />
      </el-tab-pane>
      <el-tab-pane label="通用问题" name="issue">
        <issue-manage v-if="loadedTabs.issue" />
      </el-tab-pane>
      <el-tab-pane label="搜索关键词" name="keyword">
        <keyword-manage v-if="loadedTabs.keyword" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import RuleConfig from '@/views/config/rule'
import PromotionIndex from '@/views/promotion/index'
import WxConfig from '@/views/config/wx'
import IssueManage from '@/views/mall/issue'
import KeywordManage from '@/views/mall/keyword'

export default {
  name: 'PlatformConfig',
  components: { RuleConfig, PromotionIndex, WxConfig, IssueManage, KeywordManage },
  data() {
    return {
      activeTab: 'rule',
      loadedTabs: { rule: true, promotion: false, wx: false, issue: false, keyword: false }
    }
  },
  methods: {
    handleTabClick(tab) {
      this.$set(this.loadedTabs, tab.name, true)
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.platform-config {
  ::v-deep .el-tabs__content { padding: 0; }
  ::v-deep .app-container { padding: 20px 0 0 0; }
}
</style>
