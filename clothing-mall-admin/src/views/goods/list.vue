<template>
  <div class="app-container">

    <!-- 查询和其他操作 -->
    <div class="filter-container">
      <el-input v-model="listQuery.goodsId" clearable class="filter-item" style="width: 160px;" :placeholder="$t('goods_list.placeholder.filter_goods_id')" />
      <el-input v-model="listQuery.goodsSn" clearable class="filter-item" style="width: 160px;" :placeholder="$t('goods_list.placeholder.filter_goods_sn')" />
      <el-input v-model="listQuery.name" clearable class="filter-item" style="width: 160px;" :placeholder="$t('goods_list.placeholder.filter_name')" />
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">{{ $t('app.button.search') }}</el-button>
      <el-button class="filter-item" type="primary" icon="el-icon-edit" @click="handleCreate">{{ $t('app.button.create') }}</el-button>
      <el-button :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload">{{ $t('app.button.download') }}</el-button>
      <el-button class="filter-item" type="danger" icon="el-icon-delete" :disabled="batchDeleteArr.length === 0" @click="handleDeleteRows">{{ $t('app.button.batch_delete') }}</el-button>
      <el-button v-if="batchDeleteArr.length > 0" class="filter-item" type="success" size="small" @click="handleBatchPublish">批量上架 ({{ batchDeleteArr.length }})</el-button>
      <el-button v-if="batchDeleteArr.length > 0" class="filter-item" type="warning" size="small" @click="handleBatchUnpublish">批量下架 ({{ batchDeleteArr.length }})</el-button>
      <el-button class="filter-item" type="danger" plain @click="handleUnpublishAll">一键下架全部</el-button>
    </div>

    <!-- 状态标签页 -->
    <el-tabs v-model="activeTab" @tab-click="handleTabClick">
      <el-tab-pane label="全部" name="all" />
      <el-tab-pane label="草稿" name="draft" />
      <el-tab-pane label="待上架" name="pending" />
      <el-tab-pane label="已上架" name="published" />
    </el-tabs>

    <!-- 查询结果 -->
    <el-table v-loading="listLoading" :data="list" :element-loading-text="$t('app.message.list_loading')" border fit highlight-current-row @selection-change="handleSelectionChange">
      <el-table-column type="expand">
        <template slot-scope="props">
          <el-form label-position="left" class="table-expand">
            <el-form-item :label="$t('goods_list.table.goods_sn')">
              <span>{{ props.row.goodsSn }}</span>
            </el-form-item>
            <el-form-item :label="$t('goods_list.table.gallery')">
              <el-image v-for="pic in props.row.gallery" :key="pic" :src="pic" class="gallery" :preview-src-list="props.row.gallery" style="width: 40px; height: 40px" />
            </el-form-item>
            <el-form-item :label="$t('goods_list.table.brief')">
              <span>{{ props.row.brief }}</span>
            </el-form-item>
            <el-form-item :label="$t('goods_list.table.unit')">
              <span>{{ props.row.unit }}</span>
            </el-form-item>
            <el-form-item :label="$t('goods_list.table.keywords')">
              <span>{{ props.row.keywords }}</span>
            </el-form-item>
            <el-form-item :label="$t('goods_list.table.category_id')">
              <span>{{ props.row.categoryId }}</span>
            </el-form-item>
            <el-form-item :label="$t('goods_list.table.brand_id')">
              <span>{{ props.row.brandId }}</span>
            </el-form-item>

          </el-form>
        </template>
      </el-table-column>
      <el-table-column type="selection" width="55" />
      <el-table-column align="center" :label="$t('goods_list.table.id')" prop="id" />

      <el-table-column align="center" min-width="100" :label="$t('goods_list.table.name')" prop="name" />

      <el-table-column align="center" property="iconUrl" :label="$t('goods_list.table.pic_url')">
        <template slot-scope="scope">
          <el-image :src="thumbnail(scope.row.picUrl)" :preview-src-list="toPreview(scope.row, scope.row.picUrl)" style="width: 40px; height: 40px" />
        </template>
      </el-table-column>

      <el-table-column align="center" property="shareUrl" label="分享海报">
        <template slot-scope="scope">
          <el-image v-if="scope.row.shareUrl" :src="scope.row.shareUrl" style="width: 40px; height: 40px" :preview-src-list="[scope.row.shareUrl]" />
          <el-button v-else type="text" size="mini" @click="handleGenerateShareImage(scope.row)">生成海报</el-button>
        </template>
      </el-table-column>

      <el-table-column align="center" :label="$t('goods_list.table.detail')" prop="detail">
        <template slot-scope="scope">
          <el-dialog :visible.sync="detailDialogVisible" :title="$t('goods_list.dialog.detail')">
            <div class="goods-detail-box" v-html="goodsDetail" />
          </el-dialog>
          <el-button type="primary" size="mini" @click="showDetail(scope.row.detail)">{{ $t('app.button.view') }}</el-button>
        </template>
      </el-table-column>

      <el-table-column align="center" :label="$t('goods_list.table.counter_price')" prop="counterPrice" />

      <el-table-column align="center" :label="$t('goods_list.table.retail_price')" prop="retailPrice" />

      <el-table-column align="center" :label="$t('goods_list.table.is_new')" prop="isNew">
        <template slot-scope="scope">
          <el-tag :type="scope.row.isNew ? 'success' : 'error' ">{{ $t(scope.row.isNew ? 'goods_list.value.is_new_true' : 'goods_list.value.is_new_false') }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column align="center" :label="$t('goods_list.table.is_hot')" prop="isHot">
        <template slot-scope="scope">
          <el-tag :type="scope.row.isHot ? 'success' : 'error' ">{{ $t(scope.row.isHot ? 'goods_list.value.is_hot_true' : 'goods_list.value.is_hot_false') }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column align="center" label="特价" prop="isSpecialPrice" width="80">
        <template slot-scope="scope">
          <el-tag :type="scope.row.isSpecialPrice ? 'warning' : 'info'" size="mini">
            {{ scope.row.isSpecialPrice ? '特价' : '普通' }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column align="center" label="状态" prop="status" width="100">
        <template slot-scope="scope">
          <el-tag :type="statusTagType(scope.row.status)">
            {{ statusText(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column align="center" :label="$t('goods_list.table.actions')" width="320" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button v-if="scope.row.status !== 'published'" type="success" size="mini" @click="handlePublish(scope.row)">上架</el-button>
          <el-button v-if="scope.row.status === 'published'" type="warning" size="mini" @click="handleUnpublish(scope.row)">下架</el-button>
          <el-button type="primary" size="mini" @click="handleUpdate(scope.row)">{{ $t('app.button.edit') }}</el-button>
          <el-button type="danger" size="mini" @click="handleDelete(scope.row)">{{ $t('app.button.delete') }}</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-tooltip placement="top" :content="$t('app.tooltip.back_to_top')">
      <back-to-top :visibility-height="100" />
    </el-tooltip>

  </div>
</template>

<style>
  .table-expand {
    font-size: 0;
    padding-left: 60px;
  }
  .table-expand label {
    width: 100px;
    color: #99a9bf;
  }
  .table-expand .el-form-item {
    margin-right: 0;
    margin-bottom: 0;
  }
  .gallery {
    width: 80px;
    margin-right: 10px;
  }
  .goods-detail-box img {
    width: 100%;
  }
</style>

<script>
import { listGoods, deleteGoods, generateShareImage, publishGoodsBatch, unpublishGoodsBatch, unpublishAllGoods } from '@/api/goods'
import BackToTop from '@/components/BackToTop'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import { thumbnail, toPreview } from '@/utils/index'

export default {
  name: 'GoodsList',
  components: { BackToTop, Pagination },
  data() {
    return {
      batchDeleteArr: [],
      activeTab: 'all',
      thumbnail,
      toPreview,
      list: [],
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 10,
        goodsSn: undefined,
        name: undefined,
        sort: 'add_time',
        order: 'desc'
      },
      goodsDetail: '',
      detailDialogVisible: false,
      downloadLoading: false
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      const query = { ...this.listQuery }
      if (this.activeTab !== 'all') {
        query.status = this.activeTab
      }
      listGoods(query).then(response => {
        this.list = response.data.data.list
        this.total = response.data.data.total
        this.listLoading = false
      }).catch(() => {
        this.list = []
        this.total = 0
        this.listLoading = false
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleTabClick() {
      this.listQuery.page = 1
      this.getList()
    },
    handleCreate() {
      this.$router.push({ path: '/goods/create' })
    },
    handleUpdate(row) {
      this.$router.push({ path: '/goods/edit', query: { id: row.id }})
    },
    showDetail(detail) {
      this.goodsDetail = detail
      this.detailDialogVisible = true
    },
    handleDelete(row) {
      this.$confirm('确定删除?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }).then(() => {
        deleteGoods(row).then(response => {
          this.$notify.success({
            title: '成功',
            message: '删除成功'
          })
          this.getList()
        }).catch(error => {
          this.$notify.error({
            title: '失败',
            message: error?.response?.data?.errmsg || error?.message || '删除失败'
          })
        })
      }).catch(() => {})
    },
    handleSelectionChange(val) {
      console.log(val)
      this.batchDeleteArr = val
    },
    handleDeleteRows() {
      this.batchDeleteArr.forEach(row => this.handleDeleteEachRow(row))
      this.getList()
    },
    handleDeleteEachRow(row) {
      deleteGoods(row).then(response => {
        this.$notify.success({
          title: '成功',
          message: '删除成功'
        })
      }).catch(error => {
        this.$notify.error({
          title: '失败',
          message: error?.response?.data?.errmsg || error?.message || '删除失败'
        })
      })
    },
    handleGenerateShareImage(row) {
      generateShareImage(row.id).then(response => {
        this.$notify.success({
          title: '成功',
          message: '分享海报生成成功'
        })
        // 更新当前行的分享图URL
        row.shareUrl = response.data.data.shareUrl
      }).catch(error => {
        this.$notify.error({
          title: '失败',
          message: error?.response?.data?.errmsg || error?.message || '生成分享海报失败'
        })
      })
    },
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['商品ID', '商品款号', '名称', '专柜价格', '当前价格', '是否新品', '是否热品', '是否在售', '首页主图', '宣传图片列表', '商品介绍', '详细介绍', '商品图片', '商品单位', '关键字', '类目ID', '品牌商ID']
        const filterVal = ['id', 'goodsSn', 'name', 'counterPrice', 'retailPrice', 'isNew', 'isHot', 'isOnSale', 'listPicUrl', 'gallery', 'brief', 'detail', 'picUrl', 'goodsUnit', 'keywords', 'categoryId', 'brandId']
        excel.export_json_to_excel2(tHeader, this.list, filterVal, '商品信息')
        this.downloadLoading = false
      })
    },
    statusText(status) {
      const map = { draft: '草稿', pending: '待上架', published: '已上架' }
      return map[status || 'draft'] || '未知'
    },
    statusTagType(status) {
      const map = { draft: 'info', pending: 'warning', published: 'success' }
      return map[status || 'draft'] || 'info'
    },
    handlePublish(row) {
      publishGoodsBatch({ ids: [row.id] }).then(() => {
        this.$notify.success({ title: '成功', message: '上架成功' })
        this.getList()
      }).catch(error => {
        this.$notify.error({ title: '失败', message: error?.response?.data?.errmsg || error?.message || '上架失败' })
      })
    },
    handleUnpublish(row) {
      unpublishGoodsBatch({ ids: [row.id] }).then(() => {
        this.$notify.success({ title: '成功', message: '下架成功' })
        this.getList()
      }).catch(error => {
        this.$notify.error({ title: '失败', message: error?.response?.data?.errmsg || error?.message || '下架失败' })
      })
    },
    handleBatchPublish() {
      const ids = this.batchDeleteArr.map(r => r.id)
      publishGoodsBatch({ ids }).then(() => {
        this.$notify.success({ title: '成功', message: '批量上架成功' })
        this.getList()
      }).catch(error => {
        this.$notify.error({ title: '失败', message: error?.response?.data?.errmsg || error?.message || '批量上架失败' })
      })
    },
    handleBatchUnpublish() {
      const ids = this.batchDeleteArr.map(r => r.id)
      unpublishGoodsBatch({ ids }).then(() => {
        this.$notify.success({ title: '成功', message: '批量下架成功' })
        this.getList()
      }).catch(error => {
        this.$notify.error({ title: '失败', message: error?.response?.data?.errmsg || error?.message || '批量下架失败' })
      })
    },
    handleUnpublishAll() {
      this.$confirm('确定要下架全部商品吗？此操作不可撤销。', '危险操作', {
        confirmButtonText: '确认下架全部',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        unpublishAllGoods().then(() => {
          this.$notify.success({ title: '成功', message: '全部商品已下架' })
          this.getList()
        }).catch(error => {
          this.$notify.error({ title: '失败', message: error?.response?.data?.errmsg || error?.message || '下架失败' })
        })
      }).catch(() => {})
    }
  }
}
</script>
