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
                <img :src="item.picUrl" class="rank-img" />
                <div class="rank-text">
                  <div class="rank-name">{{ item.name }}</div>
                  <el-progress
                    :percentage="item.percentage"
                    :show-text="false"
                    :stroke-width="6"
                    color="#409EFF"
                  ></el-progress>
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
                <img :src="item.picUrl" class="rank-img" />
                <div class="rank-text">
                  <div class="rank-name">{{ item.name }}</div>
                  <el-progress
                    :percentage="item.percentage"
                    :show-text="false"
                    :stroke-width="6"
                    color="#67C23A"
                  ></el-progress>
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
                  ></el-progress>
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
                <img :src="item.picUrl" class="rank-img" />
                <div class="rank-text">
                  <div class="rank-name">{{ item.name }}</div>
                  <el-progress
                    :percentage="item.percentage"
                    :show-text="false"
                    :stroke-width="6"
                    color="#F56C6C"
                  ></el-progress>
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
import CountTo from "vue-count-to";
import bedSetGrey from '@/assets/dashboard/bed-set-grey.png'
import summerQuilt from '@/assets/dashboard/summer-quilt.png'
import bedSetPink from '@/assets/dashboard/bed-set-pink.png'
import pillow from '@/assets/dashboard/pillow.png'
import babyGift from '@/assets/dashboard/baby-gift.png'
import clock from '@/assets/dashboard/clock.png'
import mirrorWood from '@/assets/dashboard/mirror-wood.png'
import tableWood from '@/assets/dashboard/table-wood.png'
import blanket from '@/assets/dashboard/blanket.png'
import mirrorRound from '@/assets/dashboard/mirror-round.png'
import chair from '@/assets/dashboard/chair.png'
import pen from '@/assets/dashboard/pen.png'
import roundTableCorner from '@/assets/dashboard/round-table-corner.png'
import roundTableStand from '@/assets/dashboard/round-table-stand.png'
import bedSetBall from '@/assets/dashboard/bed-set-ball.png'

export default {
  components: {
    CountTo,
  },
  data() {
    return {
      revenue: 0,
      orders: 0,
      dau: 0,
      salesTop: [],
      repurchaseTop: [],
      posterClickTop: [],
      afterSalesTop: [],
    };
  },
  created() {
    this.fetchData();
  },
  methods: {
    fetchData() {
      // Fake data simulation
      this.revenue = 1258000;
      this.orders = 5400;
      this.dau = 1205;

      this.salesTop = [
        { name: "简约知性全棉四件套 素雅灰", value: 1200, percentage: 90, picUrl: bedSetGrey },
        { name: "色织华夫格夏凉被", value: 900, percentage: 70, picUrl: summerQuilt },
        { name: "简约知性全棉四件套 胭脂粉", value: 800, percentage: 60, picUrl: bedSetPink },
        { name: "日式纯棉针织条纹抱枕", value: 600, percentage: 45, picUrl: pillow },
        { name: "新生彩棉初衣礼盒（婴童）", value: 400, percentage: 30, picUrl: babyGift },
      ];

      this.repurchaseTop = [
        { name: "LCD电子钟 升级版", value: "45%", percentage: 45, picUrl: clock },
        { name: "悦己日式木质落地镜", value: "38%", percentage: 38, picUrl: mirrorWood },
        { name: "原素系列实木餐桌", value: "30%", percentage: 30, picUrl: tableWood },
        { name: "澳洲羊羔毛华夫格盖毯", value: "25%", percentage: 25, picUrl: blanket },
        { name: "古风圆角木质落地镜", value: "20%", percentage: 20, picUrl: mirrorRound },
      ];

      this.posterClickTop = [
        { name: "夏季大促海报", value: 3000, percentage: 95, color: '#409EFF', abbr: '促' },
        { name: "新品上市海报", value: 2500, percentage: 80, color: '#67C23A', abbr: '新' },
        { name: "会员日海报", value: 2000, percentage: 65, color: '#E6A23C', abbr: '会' },
        { name: "节日特惠海报", value: 1500, percentage: 45, color: '#F56C6C', abbr: '节' },
        { name: "限时秒杀海报", value: 1000, percentage: 30, color: '#909399', abbr: '秒' },
      ];

      this.afterSalesTop = [
        { name: "原素系列实木餐椅（两把）", value: 50, percentage: 50, picUrl: chair },
        { name: "磨砂杆直杆中性笔", value: 45, percentage: 45, picUrl: pen },
        { name: "原素系列折角实木圆桌", value: 30, percentage: 30, picUrl: roundTableCorner },
        { name: "原素系列立式实木圆桌", value: 20, percentage: 20, picUrl: roundTableStand },
        { name: "意式毛线绣球四件套", value: 10, percentage: 10, picUrl: bedSetBall },
      ];
    },
  },
};
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
