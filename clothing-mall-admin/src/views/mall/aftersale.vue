<template>
  <div class="app-container">

    <el-tabs v-model="tab" type="border-card" @tab-click="handleClick">
      <el-tab-pane v-for="item in tabList" :key="item.name" :name="item.name">
        <span slot="label">
          {{ item.label }}
          <el-badge :value="statusCounts[item.code]" :hidden="!statusCounts[item.code]" class="item" :type="getBadgeType(item.code)" style="margin-left: 5px; vertical-align: top;" />
        </span>

        <div v-if="tab === item.name">
          <!-- 查询和其他操作 -->
          <div class="filter-container" style="margin-top: 15px;">
            <el-input v-model="listQuery.aftersaleSn" clearable class="filter-item" style="width: 200px;" :placeholder="$t('mall_aftersale.placeholder.filter_aftersale_sn')" />
            <el-input v-model="listQuery.orderId" clearable class="filter-item" style="width: 200px;" :placeholder="$t('mall_aftersale.placeholder.filter_order_id')" />
            <el-button v-permission="['GET /admin/aftersale/list']" class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">{{ $t('app.button.search') }}</el-button>
            <el-button :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload">{{ $t('app.button.download') }}</el-button>
          </div>

          <div class="operator-container">
            <el-button v-permission="['GET /admin/aftersale/batch-recept']" class="filter-item" type="success" icon="el-icon-info" @click="handleBatchRecept">{{ $t('mall_aftersale.button.batch_recept') }}</el-button>
            <el-button v-permission="['GET /admin/aftersale/batch-reject']" class="filter-item" type="danger" icon="el-icon-delete" @click="handleBatchReject">{{ $t('mall_aftersale.button.batch_reject') }}</el-button>
          </div>

          <el-table v-loading="listLoading" :data="list" :element-loading-text="$t('app.message.list_loading')" fit highlight-current-row @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55" />

            <el-table-column align="center" :label="$t('mall_aftersale.table.aftersale_sn')" prop="aftersaleSn" />
            <el-table-column align="center" :label="$t('mall_aftersale.table.order_id')" prop="orderId" />
            <el-table-column align="center" :label="$t('mall_aftersale.table.user_id')" prop="userId" />
            <el-table-column align="center" :label="$t('mall_aftersale.table.type')" prop="type">
              <template slot-scope="scope">
                <el-tag :type="typeTag[scope.row.type]">{{ typeDesc[scope.row.type] }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column align="center" :label="$t('mall_aftersale.table.reason')" prop="reason" />
            <el-table-column align="center" :label="$t('mall_aftersale.table.amount')" prop="amount" />
            <el-table-column align="center" :label="$t('mall_aftersale.table.add_time')" prop="addTime" />

            <el-table-column align="center" :label="$t('mall_aftersale.table.actions')" min-width="120" class-name="small-padding fixed-width">
              <template slot-scope="scope">
                <el-button v-permission="['POST /admin/aftersale/detail']" type="primary" size="mini" @click="handleRead(scope.row)">{{ $t('app.button.detail') }}</el-button>
                <el-button v-if="scope.row.status === 1" v-permission="['POST /admin/aftersale/recept']" type="success" size="mini" @click="handleRecept(scope.row)">{{ $t('mall_aftersale.button.recept') }}</el-button>
                <el-button v-if="scope.row.status === 1" v-permission="['POST /admin/aftersale/reject']" type="danger" size="mini" @click="handleReject(scope.row)">{{ $t('mall_aftersale.button.reject') }}</el-button>
                <el-button v-if="scope.row.status === 2" v-permission="['POST /admin/aftersale/ship']" type="warning" size="mini" @click="handleShip(scope.row)">换货发货</el-button>
                <el-button v-if="scope.row.status === 3" v-permission="['POST /admin/aftersale/complete']" type="success" size="mini" @click="handleComplete(scope.row)">换货完成</el-button>
              </template>
            </el-table-column>
          </el-table>

          <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />
        </div>
      </el-tab-pane>
    </el-tabs>

    <el-tooltip placement="top" :content="$t('app.tooltip.back_to_top')">
      <back-to-top :visibility-height="100" />
    </el-tooltip>
    <!-- 详情对话框 -->
    <el-dialog :visible.sync="aftersaleDialogVisible" :title="$t('mall_aftersale.dialog.detail')" width="800">
      <section ref="print">
        <el-form :data="aftersaleDetail" label-position="left">
          <el-form-item :label="$t('mall_aftersale.form.id')">
            <el-tag>{{ aftersaleDetail.id }}</el-tag>
          </el-form-item>
          <el-form-item :label="$t('mall_aftersale.form.aftersale_sn')">
            <el-tag>{{ aftersaleDetail.aftersaleSn }}</el-tag>
          </el-form-item>
          <el-form-item :label="$t('mall_aftersale.form.order_id')">
            <el-tag>{{ aftersaleDetail.orderId }}</el-tag>
          </el-form-item>
          <el-form-item :label="$t('mall_aftersale.form.amount')">
            <el-tag>{{ aftersaleDetail.amount }}</el-tag>
          </el-form-item>
          <el-form-item :label="$t('mall_aftersale.form.status')">
            <el-tag v-if="aftersaleDetail.status === 1">{{ $t('mall_aftersale.value.status_1') }}</el-tag>
            <el-tag v-if="aftersaleDetail.status === 2">{{ $t('mall_aftersale.value.status_2') }}</el-tag>
            <el-tag v-if="aftersaleDetail.status === 3">{{ $t('mall_aftersale.value.status_3') }}</el-tag>
            <el-tag v-if="aftersaleDetail.status === 4">{{ $t('mall_aftersale.value.status_4') }}</el-tag>
          </el-form-item>
          <el-form-item :label="$t('mall_aftersale.form.user_id')">
            <el-tag>{{ aftersaleDetail.userId }}</el-tag>
          </el-form-item>
          <el-form-item :label="$t('mall_aftersale.form.type')">
            <el-tag v-if="aftersaleDetail.type === 0">同款换货</el-tag>
            <el-tag v-if="aftersaleDetail.type === 1">换其他商品</el-tag>
          </el-form-item>
          <el-form-item :label="$t('mall_aftersale.form.reason')">
            <span>{{ aftersaleDetail.reason }}</span>
          </el-form-item>
          <el-form-item :label="$t('mall_aftersale.form.add_time')">
            <span>{{ aftersaleDetail.addTime }}</span>
          </el-form-item>
          <el-form-item :label="$t('mall_aftersale.form.update_time')">
            <span>{{ aftersaleDetail.updateTime }}</span>
          </el-form-item>
          <el-form-item :label="$t('mall_aftersale.form.handle_time')">
            <span>{{ aftersaleDetail.handleTime }}</span>
          </el-form-item>
          <el-form-item :label="$t('mall_aftersale.form.pictures')">
            <el-table :data="aftersaleDetail.pictures" border fit highlight-current-row>
              <el-table-column align="center" :label="$t('mall_aftersale.table.detail_pictures')">
                <template slot-scope="scope">
                  <a :href="scope.row" target="_blank">
                    <img :src="scope.row" width="40">
                  </a>
                </template>
              </el-table-column>
            </el-table>
          </el-form-item>
        </el-form>
      </section>
      <span slot="footer" class="dialog-footer">
        <el-button @click="aftersaleDialogVisible = false">{{ $t('mall_aftersale.button.cancel') }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { listAftersale, listAftersaleCount, receptAftersale, batchReceptAftersale, rejectAftersale, batchRejectAftersale, shipAftersale, completeAftersale } from '@/api/aftersale'
import BackToTop from '@/components/BackToTop'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import _ from 'lodash'

export default {
  name: 'Aftersale',
  components: { BackToTop, Pagination },
  data() {
    return {
      list: [],
      total: 0,
      listLoading: true,
      tab: 'all',
      statusCounts: {},
      listQuery: {
        page: 1,
        limit: 20,
        aftersaleSn: undefined,
        orderId: undefined,
        status: '',
        sort: 'add_time',
        order: 'desc'
      },
      typeTag: [
        'primary',
        'success'
      ],
      typeDesc: [
        '同款换货',
        '换其他商品'
      ],
      multipleSelection: [],
      contentDetail: '',
      contentDialogVisible: false,
      downloadLoading: false,
      aftersaleDialogVisible: false,
      aftersaleDetail: {}
    }
  },
  computed: {
    tabList() {
      return [
        { name: 'all', label: this.$t('mall_aftersale.section.all'), code: 'all' },
        { name: 'uncheck', label: this.$t('mall_aftersale.section.uncheck'), code: '1' },
        { name: 'unship', label: '待发货', code: '2' }
      ]
    }
  },
  created() {
    this.getList()
    this.getAftersaleCounts()
  },
  methods: {
    getAftersaleCounts() {
      listAftersaleCount().then(response => {
        this.statusCounts = response.data.data
      })
    },
    getBadgeType(status) {
      if (status === '1') {
        return 'danger'
      }
      if (status === '2') {
        return 'warning'
      }
      return 'primary'
    },
    getList() {
      this.listLoading = true
      listAftersale(this.listQuery)
        .then(response => {
          this.list = response.data.data.list
          this.total = response.data.data.total
          this.listLoading = false
        })
        .catch(() => {
          this.list = []
          this.total = 0
          this.listLoading = false
        })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    handleClick() {
      if (this.tab === 'all') {
        this.listQuery.status = ''
      } else if (this.tab === 'uncheck') {
        this.listQuery.status = '1'
      } else if (this.tab === 'unship') {
        this.listQuery.status = '2'
      }
      this.getList()
    },
    handleRecept(row) {
      receptAftersale(row)
        .then(response => {
          this.$notify.success({
            title: '成功',
            message: '审核通过操作成功'
          })
          this.getList()
        })
        .catch(response => {
          this.$notify.error({
            title: '失败',
            message: response.data.errmsg
          })
        })
    },
    handleBatchRecept() {
      if (this.multipleSelection.length === 0) {
        this.$message.error('请选择至少一条记录')
        return
      }
      const ids = []
      _.forEach(this.multipleSelection, function(item) {
        ids.push(item.id)
      })
      batchReceptAftersale({ ids: ids })
        .then(response => {
          this.$notify.success({
            title: '成功',
            message: '批量通过操作成功'
          })
          this.getList()
        })
        .catch(response => {
          this.$notify.error({
            title: '失败',
            message: response.data.errmsg
          })
        })
    },
    handleReject(row) {
      rejectAftersale(row)
        .then(response => {
          this.$notify.success({
            title: '成功',
            message: '审核拒绝操作成功'
          })
          this.getList()
        })
        .catch(response => {
          this.$notify.error({
            title: '失败',
            message: response.data.errmsg
          })
        })
    },
    handleBatchReject() {
      if (this.multipleSelection.length === 0) {
        this.$message.error('请选择至少一条记录')
        return
      }
      const ids = []
      _.forEach(this.multipleSelection, function(item) {
        ids.push(item.id)
      })
      batchRejectAftersale({ ids: ids })
        .then(response => {
          this.$notify.success({
            title: '成功',
            message: '批量拒绝操作成功'
          })
          this.getList()
        })
        .catch(response => {
          this.$notify.error({
            title: '失败',
            message: response.data.errmsg
          })
        })
    },
    handleShip(row) {
      shipAftersale(row)
        .then(response => {
          this.$notify.success({
            title: '成功',
            message: '换货发货操作成功'
          })
          this.getList()
          this.getAftersaleCounts()
        })
        .catch(response => {
          this.$notify.error({
            title: '失败',
            message: response.data.errmsg
          })
        })
    },
    handleComplete(row) {
      completeAftersale(row)
        .then(response => {
          this.$notify.success({
            title: '成功',
            message: '换货完成操作成功'
          })
          this.getList()
          this.getAftersaleCounts()
        })
        .catch(response => {
          this.$notify.error({
            title: '失败',
            message: response.data.errmsg
          })
        })
    },
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = [
          '售后编号',
          '订单ID',
          '用户ID',
          '售后类型',
          '换货原因',
          '申请时间'
        ]
        const filterVal = [
          'aftersaleSn',
          'orderId',
          'userId',
          'type',
          'reason',
          'addTime'
        ]
        excel.export_json_to_excel2(tHeader, this.list, filterVal, '售后信息')
        this.downloadLoading = false
      })
    },
    handleRead(row) {
      this.aftersaleDetail = row
      console.log(this.aftersaleDetail)
      this.aftersaleDialogVisible = true
    }
  }
}
</script>
