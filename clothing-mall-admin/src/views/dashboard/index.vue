<template>
  <div class="dashboard-editor-container">
    <!-- 视图切换 Tab -->
    <el-tabs v-model="activeView" class="view-tabs" @tab-click="handleTabChange">
      <el-tab-pane label="增长视图" name="growth" />
      <el-tab-pane label="销售视图" name="sales" />
    </el-tabs>

    <!-- 增长视图 - 紧凑仪表盘布局 -->
    <div v-show="activeView === 'growth'" class="growth-view">
      <!-- 顶部工具栏：时间选择 -->
      <div class="toolbar">
        <div class="time-pills">
          <button :class="['pill', { active: growthDays === 7 }]" @click="selectDays(7)">7天</button>
          <button :class="['pill', { active: growthDays === 30 }]" @click="selectDays(30)">1个月</button>
          <button :class="['pill', { active: growthDays === 90 }]" @click="selectDays(90)">3个月</button>
        </div>
        <el-date-picker
          v-model="customDateRange"
          type="daterange"
          size="mini"
          range-separator="—"
          start-placeholder="开始"
          end-placeholder="结束"
          value-format="yyyy-MM-dd"
          :picker-options="pickerOptions"
          @change="handleCustomDateChange"
        />
      </div>

      <!-- 指标卡片行 -->
      <div class="metrics-row">
        <div class="metric-card highlight">
          <div class="metric-label">今日新增</div>
          <div class="metric-value">
            <count-to :start-val="0" :end-val="growthData.todayNewUsers" :duration="2000" />
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-label">DAU</div>
          <div class="metric-value">{{ formatNumber(growthData.todayDau) }}</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">WAU</div>
          <div class="metric-value">{{ formatNumber(growthData.wau) }}</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">MAU</div>
          <div class="metric-value">{{ formatNumber(growthData.mau) }}</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">累计用户</div>
          <div class="metric-value">{{ formatNumber(growthData.totalUsers) }}</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">DAU/MAU</div>
          <div class="metric-value accent">{{ dauMauRate }}%</div>
          <div class="metric-hint">粘性指标</div>
        </div>
      </div>

      <!-- 趋势图表 -->
      <div class="charts-row">
        <div class="chart-panel">
          <div class="panel-header">
            <span class="panel-title">新增用户趋势</span>
          </div>
          <ve-line :data="newUsersChartData" :settings="chartSettings.newUsers" :extend="chartExtend" />
        </div>
        <div class="chart-panel">
          <div class="panel-header">
            <span class="panel-title">日活趋势</span>
          </div>
          <ve-line :data="dauChartData" :settings="chartSettings.dau" :extend="chartExtend" />
        </div>
      </div>
    </div>

    <!-- 销售视图 -->
    <div v-show="activeView === 'sales'" class="sales-view">
      <!-- 核心指标卡片 -->
      <el-row :gutter="20" class="panel-group">
        <el-col :xs="12" :sm="8" class="card-panel-col">
          <div class="card-panel">
            <div class="card-panel-icon-wrapper icon-money">
              <svg-icon icon-class="money" class-name="card-panel-icon" />
            </div>
            <div class="card-panel-description">
              <div class="card-panel-text">营业收入</div>
              <count-to
                :start-val="0"
                :end-val="salesData.revenue"
                :duration="2600"
                class="card-panel-num"
                prefix="¥ "
              />
            </div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="8" class="card-panel-col">
          <div class="card-panel">
            <div class="card-panel-icon-wrapper icon-shopping">
              <svg-icon icon-class="shopping" class-name="card-panel-icon" />
            </div>
            <div class="card-panel-description">
              <div class="card-panel-text">订单量</div>
              <count-to
                :start-val="0"
                :end-val="salesData.orders"
                :duration="3000"
                class="card-panel-num"
                suffix=" 单"
              />
            </div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="8" class="card-panel-col">
          <div class="card-panel">
            <div class="card-panel-icon-wrapper icon-price">
              <svg-icon icon-class="skill" class-name="card-panel-icon" />
            </div>
            <div class="card-panel-description">
              <div class="card-panel-text">客单价</div>
              <count-to
                :start-val="0"
                :end-val="salesData.avgPrice"
                :duration="3200"
                class="card-panel-num"
                prefix="¥ "
              />
            </div>
          </div>
        </el-col>
      </el-row>

      <!-- 销售榜单 -->
      <el-row :gutter="20">
        <el-col :xs="24" :sm="24" :lg="12" style="margin-bottom: 20px">
          <el-card class="box-card">
            <div slot="header" class="clearfix">
              <span>商品销售 Top</span>
            </div>
            <div class="rank-list">
              <div
                v-for="(item, index) in salesData.salesTop"
                :key="index"
                class="rank-item"
              >
                <div class="rank-index" :class="'rank-' + (index + 1)">
                  {{ index + 1 }}
                </div>
                <div class="rank-info">
                  <img :src="item.picUrl" class="rank-img">
                  <div class="rank-text">
                    <div class="rank-name">{{ item.name }}</div>
                    <el-progress
                      :percentage="item.percentage"
                      :show-text="false"
                      :stroke-width="6"
                      color="#409EFF"
                    />
                  </div>
                </div>
                <div class="rank-value">{{ item.value }}</div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :xs="24" :sm="24" :lg="12" style="margin-bottom: 20px">
          <el-card class="box-card">
            <div slot="header" class="clearfix">
              <span>商品复购 Top</span>
            </div>
            <div class="rank-list">
              <div
                v-for="(item, index) in salesData.repurchaseTop"
                :key="index"
                class="rank-item"
              >
                <div class="rank-index" :class="'rank-' + (index + 1)">
                  {{ index + 1 }}
                </div>
                <div class="rank-info">
                  <img :src="item.picUrl" class="rank-img">
                  <div class="rank-text">
                    <div class="rank-name">{{ item.name }}</div>
                    <el-progress
                      :percentage="item.percentage"
                      :show-text="false"
                      :stroke-width="6"
                      color="#67C23A"
                    />
                  </div>
                </div>
                <div class="rank-value">{{ item.value }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :xs="24" :sm="24" :lg="12" style="margin-bottom: 20px">
          <el-card class="box-card">
            <div slot="header" class="clearfix">
              <span>海报点击 Top</span>
            </div>
            <div class="rank-list">
              <div
                v-for="(item, index) in salesData.posterClickTop"
                :key="index"
                class="rank-item"
              >
                <div class="rank-index" :class="'rank-' + (index + 1)">
                  {{ index + 1 }}
                </div>
                <div class="rank-info">
                  <div class="rank-poster-wrapper">
                    <div class="rank-poster" :style="{ backgroundColor: item.color }">{{ item.abbr }}</div>
                  </div>
                  <div class="rank-text">
                    <div class="rank-name">{{ item.name }}</div>
                    <el-progress
                      :percentage="item.percentage"
                      :show-text="false"
                      :stroke-width="6"
                      color="#E6A23C"
                    />
                  </div>
                </div>
                <div class="rank-value">{{ item.value }}</div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :xs="24" :sm="24" :lg="12" style="margin-bottom: 20px">
          <el-card class="box-card">
            <div slot="header" class="clearfix">
              <span>商品售后 Top</span>
            </div>
            <div class="rank-list">
              <div
                v-for="(item, index) in salesData.afterSalesTop"
                :key="index"
                class="rank-item"
              >
                <div class="rank-index" :class="'rank-' + (index + 1)">
                  {{ index + 1 }}
                </div>
                <div class="rank-info">
                  <img :src="item.picUrl" class="rank-img">
                  <div class="rank-text">
                    <div class="rank-name">{{ item.name }}</div>
                    <el-progress
                      :percentage="item.percentage"
                      :show-text="false"
                      :stroke-width="6"
                      color="#F56C6C"
                    />
                  </div>
                </div>
                <div class="rank-value">{{ item.value }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import CountTo from 'vue-count-to'
import VeLine from 'v-charts/lib/line'
import { statGrowth, statActiveUsers } from '@/api/stat'

export default {
  components: {
    CountTo,
    VeLine
  },
  data() {
    return {
      activeView: 'growth',
      growthDays: 7, // 时间范围：7/30/90天，null 表示使用自定义日期
      customDateRange: null, // 自定义日期范围
      growthLoading: false, // 加载状态
      pickerOptions: {
        shortcuts: [{
          text: '最近一周',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 6)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近一个月',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 29)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近三个月',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 89)
            picker.$emit('pick', [start, end])
          }
        }]
      },
      // 增长视图数据
      growthData: {
        totalUsers: 0,
        todayNewUsers: 0,
        todayDau: 0,
        wau: 0,
        mau: 0,
        activeRate: 0
      },
      // 图表数据
      newUsersChartData: { columns: ['day', 'newUsers'], rows: [] },
      dauChartData: { columns: ['day', 'dau'], rows: [] },
      chartSettings: {
        newUsers: { labelMap: { newUsers: '新增用户' }},
        dau: { labelMap: { dau: '日活用户' }}
      },
      chartExtend: {
        xAxis: { boundaryGap: false },
        series: {
          smooth: true,
          areaStyle: { opacity: 0.3 }
        }
      },
      // 销售视图数据
      salesData: {
        revenue: 0,
        orders: 0,
        avgPrice: 0,
        salesTop: [],
        repurchaseTop: [],
        posterClickTop: [],
        afterSalesTop: []
      }
    }
  },
  computed: {
    dauMauRate() {
      if (this.growthData.mau === 0) return 0
      return ((this.growthData.todayDau / this.growthData.mau) * 100).toFixed(1)
    }
  },
  created() {
    this.fetchGrowthData()
    this.fetchActiveUsers()
    this.fetchSalesData()
  },
  methods: {
    formatNumber(num) {
      if (!num) return '0'
      return Number(num).toLocaleString('zh-CN')
    },
    selectDays(days) {
      this.growthDays = days
      this.customDateRange = null
      this.fetchGrowthData()
    },
    handleTabChange(tab) {
      // Tab 切换时可以刷新数据
    },
    handleGrowthDaysChange() {
      // 切换快速按钮时，清空自定义日期
      this.customDateRange = null
      this.fetchGrowthData()
    },
    handleCustomDateChange(val) {
      if (val) {
        // 选择自定义日期时，取消快速按钮选中状态
        this.growthDays = null
        this.fetchGrowthData()
      }
    },
    fetchGrowthData() {
      this.growthLoading = true
      let startDate, endDate

      const formatDate = (date) => {
        const y = date.getFullYear()
        const m = String(date.getMonth() + 1).padStart(2, '0')
        const d = String(date.getDate()).padStart(2, '0')
        return `${y}-${m}-${d}`
      }

      // 优先使用自定义日期范围，否则使用快速按钮
      if (this.customDateRange && this.customDateRange.length === 2) {
        startDate = this.customDateRange[0]
        endDate = this.customDateRange[1]
      } else {
        const end = new Date()
        const start = new Date()
        const days = this.growthDays || 7
        start.setTime(start.getTime() - 3600 * 1000 * 24 * (days - 1))
        startDate = formatDate(start)
        endDate = formatDate(end)
      }

      statGrowth({
        startDate,
        endDate
      }).then(response => {
        const data = response.data.data
        this.growthData.totalUsers = data.totalUsers || 0
        this.newUsersChartData.rows = data.newUsers || []
        this.dauChartData.rows = data.dau || []

        // 计算今日数据
        const today = formatDate(new Date())
        const todayNew = (data.newUsers || []).find(item => item.day === today)
        const todayDauData = (data.dau || []).find(item => item.day === today)
        this.growthData.todayNewUsers = todayNew ? Number(todayNew.newUsers) : 0
        this.growthData.todayDau = todayDauData ? Number(todayDauData.dau) : 0

        // 活跃率
        if (this.growthData.totalUsers > 0) {
          this.growthData.activeRate = Math.round((this.growthData.todayDau / this.growthData.totalUsers) * 100)
        }
      }).catch(() => {
        // API 未就绪时使用模拟数据
        this.growthData.totalUsers = 3580
        this.growthData.todayNewUsers = 42
        this.growthData.todayDau = 215
        this.growthData.activeRate = 6
        // 根据时间范围生成模拟数据
        this.generateMockChartData()
      }).finally(() => {
        this.growthLoading = false
      })
    },
    fetchActiveUsers() {
      statActiveUsers().then(response => {
        const data = response.data.data
        this.growthData.wau = data.wau || 0
        this.growthData.mau = data.mau || 0
      }).catch(() => {
        // API 未就绪时使用模拟数据
        this.growthData.wau = 856
        this.growthData.mau = 1520
      })
    },
    generateMockChartData() {
      // 计算实际的天数
      let days
      if (this.customDateRange && this.customDateRange.length === 2) {
        const start = new Date(this.customDateRange[0])
        const end = new Date(this.customDateRange[1])
        days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1
      } else {
        days = this.growthDays || 7
      }

      const now = new Date()
      const formatDate = (date) => {
        const m = String(date.getMonth() + 1).padStart(2, '0')
        const d = String(date.getDate()).padStart(2, '0')
        return `${m}-${d}`
      }

      const newUsersRows = []
      const dauRows = []
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now)
        date.setDate(date.getDate() - i)
        const dayStr = formatDate(date)
        newUsersRows.push({ day: dayStr, newUsers: Math.floor(Math.random() * 50) + 20 })
        dauRows.push({ day: dayStr, dau: Math.floor(Math.random() * 100) + 150 })
      }
      this.newUsersChartData.rows = newUsersRows
      this.dauChartData.rows = dauRows
    },
    fetchSalesData() {
      // TODO: 对接真实销售统计 API
      // 目前使用模拟数据
      this.salesData = {
        revenue: 1258000,
        orders: 5400,
        avgPrice: 233,
        salesTop: [
          { name: '春日优雅连衣裙', value: 856, percentage: 95, picUrl: '/images/goods/dress.png' },
          { name: '法式雪纺衬衫', value: 623, percentage: 72, picUrl: '/images/goods/shirt.png' },
          { name: '温柔针织开衫', value: 518, percentage: 60, picUrl: '/images/goods/knit.png' },
          { name: '干练西装外套', value: 445, percentage: 52, picUrl: '/images/goods/suit.png' },
          { name: '经典风衣外套', value: 389, percentage: 45, picUrl: '/images/goods/coat.png' }
        ],
        repurchaseTop: [
          { name: '春日优雅连衣裙', value: '68%', percentage: 68, picUrl: '/images/goods/dress.png' },
          { name: '法式雪纺衬衫', value: '52%', percentage: 52, picUrl: '/images/goods/shirt.png' },
          { name: '温柔针织开衫', value: '45%', percentage: 45, picUrl: '/images/goods/knit.png' },
          { name: 'A字半身裙', value: '38%', percentage: 38, picUrl: '/images/goods/skirt.png' },
          { name: '高腰阔腿裤', value: '32%', percentage: 32, picUrl: '/images/goods/pants.png' }
        ],
        posterClickTop: [
          { name: '川着transmute 春日系列', value: 2345, percentage: 95, color: '#f8b4c4', abbr: '春' },
          { name: '职场穿搭精选', value: 1876, percentage: 76, color: '#7c9885', abbr: '职' },
          { name: '温柔针织系列', value: 1523, percentage: 62, color: '#b8a99a', abbr: '针' },
          { name: '经典风衣专场', value: 1234, percentage: 50, color: '#c4a77d', abbr: '风' },
          { name: '基础款穿搭', value: 987, percentage: 40, color: '#9b8e8e', abbr: '基' }
        ],
        afterSalesTop: [
          { name: '法式雪纺衬衫', value: 23, percentage: 45, picUrl: '/images/goods/shirt.png' },
          { name: 'A字半身裙', value: 18, percentage: 35, picUrl: '/images/goods/skirt.png' },
          { name: '高腰阔腿裤', value: 15, percentage: 30, picUrl: '/images/goods/pants.png' },
          { name: '温柔针织开衫', value: 12, percentage: 24, picUrl: '/images/goods/knit.png' },
          { name: '春日优雅连衣裙', value: 8, percentage: 16, picUrl: '/images/goods/dress.png' }
        ]
      }
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.dashboard-editor-container {
  padding: 32px;
  background-color: rgb(240, 242, 245);
}

.view-tabs {
  margin-bottom: 20px;
  background: #fff;
  padding: 10px 20px 0;
  border-radius: 4px;
}

.date-range-selector {
  margin-bottom: 20px;
  text-align: right;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;

  .date-separator {
    color: #909399;
    font-size: 14px;
  }
}

.panel-group {
  margin-top: 0;
  margin-bottom: 20px;

  .card-panel-col {
    margin-bottom: 20px;
  }
  .card-panel {
    height: 108px;
    cursor: pointer;
    font-size: 12px;
    position: relative;
    overflow: hidden;
    color: #666;
    background: #fff;
    box-shadow: 4px 4px 40px rgba(0, 0, 0, 0.05);
    border-color: rgba(0, 0, 0, 0.05);
    &:hover {
      .card-panel-icon-wrapper {
        color: #fff;
      }
      .icon-people { background: #40c9c6; }
      .icon-new { background: #36a3f7; }
      .icon-active { background: #f4516c; }
      .icon-wau { background: #9b59b6; }
      .icon-mau { background: #8e44ad; }
      .icon-rate { background: #34bfa3; }
      .icon-money { background: #f4516c; }
      .icon-shopping { background: #34bfa3; }
      .icon-price { background: #409eff; }
    }
    .icon-people { color: #40c9c6; }
    .icon-new { color: #36a3f7; }
    .icon-active { color: #f4516c; }
    .icon-wau { color: #9b59b6; }
    .icon-mau { color: #8e44ad; }
    .icon-rate { color: #34bfa3; }
    .icon-money { color: #f4516c; }
    .icon-shopping { color: #34bfa3; }
    .icon-price { color: #409eff; }
    .card-panel-icon-wrapper {
      float: left;
      margin: 14px 0 0 14px;
      padding: 16px;
      transition: all 0.38s ease-out;
      border-radius: 6px;
    }
    .card-panel-icon {
      float: left;
      font-size: 48px;
    }
    .card-panel-description {
      float: right;
      font-weight: bold;
      margin: 26px;
      margin-left: 0px;
      .card-panel-text {
        line-height: 18px;
        color: rgba(0, 0, 0, 0.45);
        font-size: 16px;
        margin-bottom: 12px;
      }
      .card-panel-num {
        font-size: 20px;
      }
    }
  }
}

.rank-list {
  .rank-item {
    display: flex;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid #f0f0f0;
    &:last-child {
      border-bottom: none;
    }

    .rank-index {
      width: 24px;
      height: 24px;
      line-height: 24px;
      text-align: center;
      border-radius: 50%;
      background-color: #f0f2f5;
      color: #606266;
      font-weight: bold;
      margin-right: 15px;
      font-size: 12px;
      flex-shrink: 0;

      &.rank-1 { background-color: #f56c6c; color: #fff; }
      &.rank-2 { background-color: #e6a23c; color: #fff; }
      &.rank-3 { background-color: #409eff; color: #fff; }
      &.rank-4 { background-color: #36a3f7; color: #fff; }
      &.rank-5 { background-color: #34bfa3; color: #fff; }
    }

    .rank-info {
      flex: 1;
      display: flex;
      align-items: center;
      overflow: hidden;

      .rank-img {
        width: 40px;
        height: 40px;
        border-radius: 4px;
        margin-right: 10px;
        flex-shrink: 0;
        object-fit: cover;
        background-color: #f0f0f0;
      }

      .rank-poster-wrapper {
        margin-right: 10px;
        flex-shrink: 0;
      }

      .rank-poster {
        width: 40px;
        height: 40px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-weight: bold;
        font-size: 16px;
      }

      .rank-text {
        flex: 1;
        overflow: hidden;

        .rank-name {
          font-size: 14px;
          color: #303133;
          margin-bottom: 5px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    }

    .rank-value {
      width: 60px;
      text-align: right;
      font-size: 14px;
      color: #606266;
      font-weight: bold;
      margin-left: 10px;
      flex-shrink: 0;
    }
  }
}

// ================== Compact Dashboard Style ==================

// Toolbar - 顶部工具栏
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 16px;

  .time-pills {
    display: flex;
    gap: 6px;

    .pill {
      padding: 6px 14px;
      border: 1px solid #ddd;
      border-radius: 16px;
      background: #fff;
      font-size: 12px;
      font-weight: 500;
      color: #666;
      cursor: pointer;
      transition: all 0.15s ease;

      &:hover {
        border-color: #999;
        color: #333;
      }

      &.active {
        background: #333;
        border-color: #333;
        color: #fff;
      }
    }
  }
}

// Metrics Row - 指标卡片行
.metrics-row {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px;
  margin-bottom: 16px;

  .metric-card {
    background: #fff;
    border: 1px solid #eee;
    border-radius: 8px;
    padding: 16px;
    text-align: center;
    transition: all 0.2s ease;

    &:hover {
      border-color: #ddd;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    }

    &.highlight {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-color: transparent;

      .metric-label {
        color: rgba(255, 255, 255, 0.85);
      }

      .metric-value {
        color: #fff;
      }
    }

    .metric-label {
      font-size: 12px;
      color: #888;
      margin-bottom: 8px;
    }

    .metric-value {
      font-size: 24px;
      font-weight: 600;
      color: #333;
      line-height: 1;

      &.accent {
        color: #e53e3e;
      }
    }

    .metric-hint {
      font-size: 10px;
      color: #999;
      margin-top: 4px;
    }
  }
}

@media (max-width: 1200px) {
  .metrics-row {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .metrics-row {
    grid-template-columns: repeat(2, 1fr);
  }

  .toolbar {
    flex-direction: column;
    gap: 10px;

    .el-date-editor {
      width: 100%;
    }
  }
}

// Charts Row - 图表区域
.charts-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;

  .chart-panel {
    background: #fff;
    border: 1px solid #eee;
    border-radius: 8px;
    padding: 16px;

    .panel-header {
      margin-bottom: 12px;

      .panel-title {
        font-size: 14px;
        font-weight: 500;
        color: #333;
      }
    }
  }
}

@media (max-width: 992px) {
  .charts-row {
    grid-template-columns: 1fr;
  }
}

// ================== Legacy Styles ==================

// 用户活跃度卡片样式
.activity-row {
  margin-bottom: 20px;
}

.activity-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;

  .el-card__body {
    padding: 20px 24px;
  }

  .activity-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .activity-title {
      font-size: 16px;
      font-weight: 600;
      color: #fff;
    }

    .activity-subtitle {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.7);
    }
  }

  .activity-content {
    display: flex;
    justify-content: space-around;
    align-items: center;

    .activity-item {
      text-align: center;
      flex: 1;

      .activity-label {
        font-size: 13px;
        color: rgba(255, 255, 255, 0.8);
        margin-bottom: 8px;
      }

      .activity-value {
        font-size: 32px;
        font-weight: bold;
        color: #fff;
        margin-bottom: 4px;
      }

      .activity-desc {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.6);
      }

      &.activity-highlight {
        .activity-value {
          color: #ffd700;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      }
    }

    .activity-divider {
      width: 1px;
      height: 60px;
      background: rgba(255, 255, 255, 0.2);
      margin: 0 20px;
    }
  }
}
</style>
