<template>
  <div class="dashboard-editor-container">
    <el-row :gutter="40" class="panel-group">
      <el-col :xs="12" :sm="12" :lg="8" class="card-panel-col">
        <div class="card-panel">
          <div class="card-panel-icon-wrapper icon-money">
            <svg-icon icon-class="money" class-name="card-panel-icon" />
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">营业收入</div>
            <count-to
              :start-val="0"
              :end-val="revenue"
              :duration="2600"
              class="card-panel-num"
              prefix="¥ "
            />
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="12" :lg="8" class="card-panel-col">
        <div class="card-panel">
          <div class="card-panel-icon-wrapper icon-shopping">
            <svg-icon icon-class="shopping" class-name="card-panel-icon" />
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">订单量</div>
            <count-to
              :start-val="0"
              :end-val="orders"
              :duration="3000"
              class="card-panel-num"
              suffix=" 单"
            />
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="12" :lg="8" class="card-panel-col">
        <div class="card-panel">
          <div class="card-panel-icon-wrapper icon-people">
            <svg-icon icon-class="peoples" class-name="card-panel-icon" />
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">日活用户</div>
            <count-to
              :start-val="0"
              :end-val="dau"
              :duration="3200"
              class="card-panel-num"
              suffix=" 人"
            />
          </div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :xs="24" :sm="24" :lg="12" style="margin-bottom: 20px">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>商品销售 Top</span>
          </div>
          <div class="rank-list">
            <div
              v-for="(item, index) in salesTop"
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
              v-for="(item, index) in repurchaseTop"
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
              v-for="(item, index) in posterClickTop"
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
              v-for="(item, index) in afterSalesTop"
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
</template>

<script>
import CountTo from 'vue-count-to'
// 川着transmute 商品图片使用 /images/goods/ 目录下的图片

export default {
  components: {
    CountTo
  },
  data() {
    return {
      revenue: 0,
      orders: 0,
      dau: 0,
      salesTop: [],
      repurchaseTop: [],
      posterClickTop: [],
      afterSalesTop: []
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      // Fake data simulation
      this.revenue = 1258000
      this.orders = 5400
      this.dau = 1205

      // 商品销售榜 - 川着transmute 春日系列
      this.salesTop = [
        { name: '春日优雅连衣裙', value: 856, percentage: 95, picUrl: '/images/goods/dress.png' },
        { name: '法式雪纺衬衫', value: 623, percentage: 72, picUrl: '/images/goods/shirt.png' },
        { name: '温柔针织开衫', value: 518, percentage: 60, picUrl: '/images/goods/knit.png' },
        { name: '干练西装外套', value: 445, percentage: 52, picUrl: '/images/goods/suit.png' },
        { name: '经典风衣外套', value: 389, percentage: 45, picUrl: '/images/goods/coat.png' }
      ]

      // 商品复购榜 - 川着transmute 春日系列
      this.repurchaseTop = [
        { name: '春日优雅连衣裙', value: '68%', percentage: 68, picUrl: '/images/goods/dress.png' },
        { name: '法式雪纺衬衫', value: '52%', percentage: 52, picUrl: '/images/goods/shirt.png' },
        { name: '温柔针织开衫', value: '45%', percentage: 45, picUrl: '/images/goods/knit.png' },
        { name: 'A字半身裙', value: '38%', percentage: 38, picUrl: '/images/goods/skirt.png' },
        { name: '高腰阔腿裤', value: '32%', percentage: 32, picUrl: '/images/goods/pants.png' }
      ]

      // 海报点击榜 - 川着transmute 春日系列
      this.posterClickTop = [
        { name: '川着transmute 春日系列', value: 2345, percentage: 95, color: '#f8b4c4', abbr: '春' },
        { name: '职场穿搭精选', value: 1876, percentage: 76, color: '#7c9885', abbr: '职' },
        { name: '温柔针织系列', value: 1523, percentage: 62, color: '#b8a99a', abbr: '针' },
        { name: '经典风衣专场', value: 1234, percentage: 50, color: '#c4a77d', abbr: '风' },
        { name: '基础款穿搭', value: 987, percentage: 40, color: '#9b8e8e', abbr: '基' }
      ]

      // 售后商品榜 - 川着transmute 春日系列
      this.afterSalesTop = [
        { name: '法式雪纺衬衫', value: 23, percentage: 45, picUrl: '/images/goods/shirt.png' },
        { name: 'A字半身裙', value: 18, percentage: 35, picUrl: '/images/goods/skirt.png' },
        { name: '高腰阔腿裤', value: 15, percentage: 30, picUrl: '/images/goods/pants.png' },
        { name: '温柔针织开衫', value: 12, percentage: 24, picUrl: '/images/goods/knit.png' },
        { name: '春日优雅连衣裙', value: 8, percentage: 16, picUrl: '/images/goods/dress.png' }
      ]
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.dashboard-editor-container {
  padding: 32px;
  background-color: rgb(240, 242, 245);
  .chart-wrapper {
    background: #fff;
    padding: 16px 16px 0;
    margin-bottom: 32px;
  }
}

.panel-group {
  margin-top: 18px;

  .card-panel-col {
    margin-bottom: 32px;
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
      .icon-people {
        background: #40c9c6;
      }
      .icon-money {
        background: #f4516c;
      }
      .icon-shopping {
        background: #34bfa3;
      }
    }
    .icon-people {
      color: #40c9c6;
    }
    .icon-money {
      color: #f4516c;
    }
    .icon-shopping {
      color: #34bfa3;
    }
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

      &.rank-1 {
        background-color: #f56c6c;
        color: #fff;
      }
      &.rank-2 {
        background-color: #e6a23c;
        color: #fff;
      }
      &.rank-3 {
        background-color: #409eff;
        color: #fff;
      }
      &.rank-4 {
        background-color: #36a3f7;
        color: #fff;
      }
      &.rank-5 {
        background-color: #34bfa3;
        color: #fff;
      }
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
</style>
