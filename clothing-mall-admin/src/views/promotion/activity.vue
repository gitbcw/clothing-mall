<template>
  <div class="app-container">

    <!-- 操作栏 -->
    <div class="filter-container">
      <el-button class="filter-item" type="primary" icon="el-icon-plus" @click="handleAdd">添加置顶商品</el-button>
    </div>

    <!-- 置顶商品列表 -->
    <el-table v-loading="listLoading" :data="list" element-loading-text="正在加载..." border fit highlight-current-row>

      <el-table-column align="center" label="排序" prop="sortOrder" width="80" />

      <el-table-column align="center" label="商品图" prop="picUrl" width="100">
        <template slot-scope="scope">
          <el-image v-if="scope.row.picUrl" :src="scope.row.picUrl" style="width: 60px; height: 60px" fit="cover" />
          <span v-else>-</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="商品名称" prop="goodsName" min-width="150" show-overflow-tooltip />

      <el-table-column align="center" label="零售价" prop="retailPrice" width="100" />

      <el-table-column align="center" label="操作" width="200" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="handleEditSort(scope.row)">修改排序</el-button>
          <el-button type="danger" size="mini" @click="handleRemove(scope.row)">移除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 修改排序对话框 -->
    <el-dialog title="修改排序" :visible.sync="sortDialogVisible" width="400px">
      <el-form label-position="left" label-width="80px" style="width: 300px; margin-left: 30px;">
        <el-form-item label="商品名称">
          <span>{{ currentRow.goodsName }}</span>
        </el-form-item>
        <el-form-item label="排序值">
          <el-input-number v-model="sortForm.sortOrder" :min="0" :max="999" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="sortDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitSort">确定</el-button>
      </div>
    </el-dialog>

    <!-- 添加置顶商品对话框 -->
    <el-dialog title="添加置顶商品" :visible.sync="addDialogVisible" width="700px">
      <div style="margin-bottom: 15px;">
        <el-input
          v-model="goodsQuery.name"
          clearable
          placeholder="搜索商品名称"
          style="width: 250px;"
          @keyup.enter.native="searchGoods"
        />
        <el-button type="primary" icon="el-icon-search" style="margin-left: 10px;" @click="searchGoods">搜索</el-button>
      </div>
      <el-table
        v-loading="goodsLoading"
        :data="goodsList"
        border
        fit
        highlight-current-row
        max-height="400"
        @current-change="handleGoodsRadioChange"
      >
        <el-table-column label="选择" width="55" align="center">
          <template slot-scope="scope">
            <el-radio v-model="selectedGoodsId" :label="scope.row.id">&nbsp;</el-radio>
          </template>
        </el-table-column>
        <el-table-column align="center" label="ID" prop="id" width="70" />
        <el-table-column align="center" label="商品图" width="80">
          <template slot-scope="scope">
            <el-image v-if="scope.row.picUrl" :src="scope.row.picUrl" style="width: 50px; height: 50px" fit="cover" />
          </template>
        </el-table-column>
        <el-table-column align="center" label="商品名称" prop="name" min-width="150" show-overflow-tooltip />
        <el-table-column align="center" label="零售价" prop="retailPrice" width="100" />
      </el-table>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" :disabled="!selectedGoodsId" @click="submitAdd">确定</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { listActivityTop, addActivityTop, deleteActivityTop, updateActivityTop } from '@/api/activityTop'
import { listGoods } from '@/api/goods'

export default {
  name: 'Activity',
  data() {
    return {
      list: [],
      listLoading: true,
      // 修改排序
      sortDialogVisible: false,
      currentRow: {},
      sortForm: {
        id: undefined,
        sortOrder: 0
      },
      // 添加商品
      addDialogVisible: false,
      goodsLoading: false,
      goodsList: [],
      goodsTotal: 0,
      goodsQuery: {
        page: 1,
        limit: 20,
        name: undefined
      },
      selectedGoodsId: undefined
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      listActivityTop().then(response => {
        this.list = response.data.data || []
        this.listLoading = false
      }).catch(() => {
        this.list = []
        this.listLoading = false
      })
    },
    // 修改排序
    handleEditSort(row) {
      this.currentRow = row
      this.sortForm = {
        id: row.id,
        sortOrder: row.sortOrder
      }
      this.sortDialogVisible = true
    },
    submitSort() {
      updateActivityTop(this.sortForm).then(() => {
        this.sortDialogVisible = false
        this.$notify.success({ title: '成功', message: '排序修改成功' })
        this.getList()
      }).catch(response => {
        this.$notify.error({ title: '失败', message: response.data.errmsg || '操作失败' })
      })
    },
    // 移除
    handleRemove(row) {
      this.$confirm('确定移除该置顶商品?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteActivityTop({ id: row.id }).then(() => {
          this.$notify.success({ title: '成功', message: '移除成功' })
          this.getList()
        }).catch(response => {
          this.$notify.error({ title: '失败', message: response.data.errmsg || '操作失败' })
        })
      }).catch(() => {})
    },
    // 添加置顶商品
    handleAdd() {
      this.selectedGoodsId = undefined
      this.goodsQuery.name = undefined
      this.goodsQuery.page = 1
      this.addDialogVisible = true
      this.getGoodsList()
    },
    searchGoods() {
      this.goodsQuery.page = 1
      this.getGoodsList()
    },
    getGoodsList() {
      this.goodsLoading = true
      listGoods(this.goodsQuery).then(response => {
        this.goodsList = response.data.data.list || []
        this.goodsTotal = response.data.data.total || 0
        this.goodsLoading = false
      }).catch(() => {
        this.goodsList = []
        this.goodsTotal = 0
        this.goodsLoading = false
      })
    },
    handleGoodsRadioChange(row) {
      if (row) {
        this.selectedGoodsId = row.id
      }
    },
    submitAdd() {
      if (!this.selectedGoodsId) {
        this.$message.warning('请选择一个商品')
        return
      }
      addActivityTop({ goodsId: this.selectedGoodsId }).then(() => {
        this.addDialogVisible = false
        this.$notify.success({ title: '成功', message: '添加置顶商品成功' })
        this.getList()
      }).catch(response => {
        this.$notify.error({ title: '失败', message: response.data.errmsg || '操作失败' })
      })
    }
  }
}
</script>
