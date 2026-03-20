<template>
  <div class="app-container">

    <!-- 查询和其他操作 -->
    <div class="filter-container">
      <el-input v-model="listQuery.name" clearable class="filter-item" style="width: 200px;" placeholder="请输入穿搭名称" />
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">搜索</el-button>
      <el-button class="filter-item" type="primary" icon="el-icon-edit" @click="handleCreate">创建</el-button>
    </div>

    <!-- 查询结果 -->
    <el-table v-loading="listLoading" :data="list" element-loading-text="正在查询中..." border fit highlight-current-row>

      <el-table-column align="center" label="ID" prop="id" sortable width="80" />

      <el-table-column align="center" label="海报图" prop="posterUrl">
        <template slot-scope="scope">
          <el-image :src="scope.row.posterUrl" style="width: 80px; height: 80px" fit="cover" />
        </template>
      </el-table-column>

      <el-table-column align="center" label="穿搭名称" prop="name" />

      <el-table-column align="center" label="关联商品" prop="goodsList">
        <template slot-scope="scope">
          <el-tag v-for="goods in scope.row.goodsList.slice(0, 3)" :key="goods.id" size="small" style="margin-right: 5px;">
            {{ goods.name }}
          </el-tag>
          <el-tag v-if="scope.row.goodsList.length > 3" size="small" type="info">
            +{{ scope.row.goodsList.length - 3 }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column align="center" label="排序" prop="sortOrder" width="80" />

      <el-table-column align="center" label="状态" prop="enabled" width="80">
        <template slot-scope="scope">
          <el-tag :type="scope.row.enabled ? 'success' : 'error'">{{ scope.row.enabled ? '启用' : '禁用' }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column align="center" label="操作" width="200" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="handleUpdate(scope.row)">编辑</el-button>
          <el-button type="danger" size="mini" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <!-- 添加或修改对话框 -->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="600px">
      <el-form ref="dataForm" :rules="rules" :model="dataForm" status-icon label-position="left" label-width="100px" style="width: 500px; margin-left:30px;">
        <el-form-item label="海报图" prop="posterUrl">
          <el-upload
            :headers="headers"
            :action="uploadPath"
            :show-file-list="false"
            :on-success="uploadPosterUrl"
            :before-upload="checkFileSize"
            class="avatar-uploader"
            accept=".jpg,.jpeg,.png,.gif"
          >
            <img v-if="dataForm.posterUrl" :src="dataForm.posterUrl" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon" />
            <div slot="tip" class="el-upload__tip">支持 jpg/png/gif 格式，不超过 1MB</div>
          </el-upload>
        </el-form-item>
        <el-form-item label="穿搭名称" prop="name">
          <el-input v-model="dataForm.name" placeholder="请输入穿搭名称" />
        </el-form-item>
        <el-form-item label="关联商品" prop="goodsIds">
          <div style="display: flex; flex-wrap: wrap; gap: 5px;">
            <el-tag
              v-for="goods in selectedGoodsList"
              :key="goods.id"
              closable
              size="medium"
              @close="removeSelectedGoods(goods.id)"
            >
              {{ goods.name }}
            </el-tag>
            <el-button type="primary" size="small" icon="el-icon-plus" @click="openGoodsSelector">选择商品</el-button>
          </div>
        </el-form-item>
        <el-form-item label="排序" prop="sortOrder">
          <el-input-number v-model="dataForm.sortOrder" :min="0" :max="100" />
        </el-form-item>
        <el-form-item label="是否启用" prop="enabled">
          <el-switch v-model="dataForm.enabled" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="dialogStatus === 'create' ? createData() : updateData()">确定</el-button>
      </div>
    </el-dialog>

    <!-- 商品选择对话框 -->
    <el-dialog title="选择商品" :visible.sync="goodsSelectorVisible" width="900px" append-to-body>
      <!-- 筛选条件 -->
      <div class="filter-container" style="margin-bottom: 15px;">
        <el-input
          v-model="goodsQuery.name"
          clearable
          class="filter-item"
          style="width: 200px;"
          placeholder="商品名称"
          @keyup.enter.native="searchGoods"
        />
        <el-cascader
          v-model="goodsQuery.categoryIds"
          :options="categoryList"
          :props="{ checkStrictly: true, value: 'id', label: 'label', children: 'children' }"
          clearable
          class="filter-item"
          style="width: 200px;"
          placeholder="商品分类"
          @change="handleCategoryChange"
        />
        <el-select
          v-model="goodsQuery.isOnSale"
          clearable
          class="filter-item"
          style="width: 120px;"
          placeholder="上架状态"
        >
          <el-option label="上架" :value="true" />
          <el-option label="下架" :value="false" />
        </el-select>
        <el-button class="filter-item" type="primary" icon="el-icon-search" @click="searchGoods">搜索</el-button>
        <el-button class="filter-item" icon="el-icon-refresh" @click="resetGoodsQuery">重置</el-button>
      </div>

      <!-- 商品列表 -->
      <el-table
        ref="goodsTable"
        v-loading="goodsLoading"
        :data="goodsList"
        border
        fit
        highlight-current-row
        max-height="400"
        @selection-change="handleGoodsSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column align="center" label="ID" prop="id" width="80" />
        <el-table-column align="center" label="商品图片" width="100">
          <template slot-scope="scope">
            <el-image :src="scope.row.picUrl" style="width: 60px; height: 60px" fit="cover" />
          </template>
        </el-table-column>
        <el-table-column align="center" label="商品名称" prop="name" min-width="150" show-overflow-tooltip />
        <el-table-column align="center" label="分类" prop="categoryName" width="120" />
        <el-table-column align="center" label="价格" prop="retailPrice" width="100" />
        <el-table-column align="center" label="状态" width="80">
          <template slot-scope="scope">
            <el-tag :type="scope.row.isOnSale ? 'success' : 'info'">
              {{ scope.row.isOnSale ? '上架' : '下架' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="goodsTotal > 0" :total="goodsTotal" :page.sync="goodsQuery.page" :limit.sync="goodsQuery.limit" @pagination="getGoodsList" />

      <div slot="footer" class="dialog-footer">
        <el-button @click="goodsSelectorVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmGoodsSelection">确定（已选 {{ tempSelectedGoods.length }} 个）</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<style>
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #20a0ff;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 120px;
  height: 120px;
  line-height: 120px;
  text-align: center;
}
.avatar {
  width: 145px;
  height: 145px;
  display: block;
}
</style>

<script>
import { uploadPath } from '@/api/storage'
import { listGoods, listCatAndBrand } from '@/api/goods'
import { getToken } from '@/utils/auth'
import Pagination from '@/components/Pagination'

export default {
  name: 'Outfit',
  components: { Pagination },
  data() {
    return {
      uploadPath,
      list: [],
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        name: undefined,
        sort: 'sort_order',
        order: 'asc'
      },
      dataForm: {
        id: undefined,
        posterUrl: undefined,
        name: undefined,
        goodsIds: [],
        sortOrder: 0,
        enabled: true
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '创建'
      },
      rules: {
        name: [{ required: true, message: '穿搭名称不能为空', trigger: 'blur' }],
        posterUrl: [{ required: true, message: '海报图不能为空', trigger: 'blur' }],
        goodsIds: [{ required: true, message: '请选择至少一个商品', trigger: 'change', type: 'array', min: 1 }]
      },
      // 商品选择器相关数据
      goodsSelectorVisible: false,
      goodsLoading: false,
      goodsList: [],
      goodsTotal: 0,
      goodsQuery: {
        page: 1,
        limit: 10,
        name: undefined,
        categoryId: undefined,
        categoryIds: [],
        isOnSale: undefined
      },
      categoryList: [],
      tempSelectedGoods: [],
      selectedGoodsList: []
    }
  },
  computed: {
    headers() {
      return {
        'X-Litemall-Admin-Token': getToken()
      }
    }
  },
  created() {
    this.getList()
    this.getCategoryList()
  },
  methods: {
    getList() {
      this.listLoading = true
      // TODO: 替换为真实 API
      // listOutfit(this.listQuery).then(response => {
      //   this.list = response.data.data.list
      //   this.total = response.data.data.total
      //   this.listLoading = false
      // })

      // Mock 数据
      setTimeout(() => {
        this.list = [
          {
            id: 1,
            posterUrl: 'https://example.com/outfit1.jpg',
            name: '春日清新穿搭',
            goodsList: [
              { id: 101, name: '白色T恤' },
              { id: 102, name: '牛仔裤' },
              { id: 103, name: '帆布鞋' }
            ],
            sortOrder: 1,
            enabled: true
          },
          {
            id: 2,
            posterUrl: 'https://example.com/outfit2.jpg',
            name: '职场优雅风',
            goodsList: [
              { id: 201, name: '衬衫' },
              { id: 202, name: '西装裤' },
              { id: 203, name: '高跟鞋' },
              { id: 204, name: '手提包' }
            ],
            sortOrder: 2,
            enabled: true
          }
        ]
        this.total = 2
        this.listLoading = false
      }, 500)
    },
    getCategoryList() {
      listCatAndBrand().then(response => {
        this.categoryList = response.data.data.categoryList || []
      }).catch(() => {
        this.categoryList = []
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    resetForm() {
      this.dataForm = {
        id: undefined,
        posterUrl: undefined,
        name: undefined,
        goodsIds: [],
        sortOrder: 0,
        enabled: true
      }
      this.selectedGoodsList = []
    },
    handleCreate() {
      this.resetForm()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    uploadPosterUrl(response) {
      this.dataForm.posterUrl = response.data.url
    },
    checkFileSize(file) {
      if (file.size > 1048576) {
        this.$message.error('文件大小不能超过 1MB')
        return false
      }
      return true
    },
    createData() {
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          // TODO: 替换为真实 API
          // createOutfit(this.dataForm).then(response => {
          //   this.list.unshift(response.data.data)
          //   this.dialogFormVisible = false
          //   this.$notify.success({ title: '成功', message: '创建成功' })
          // })
          this.$notify.warning({
            title: '提示',
            message: '后端 API 尚未实现，功能待开发'
          })
        }
      })
    },
    handleUpdate(row) {
      this.dataForm = {
        id: row.id,
        posterUrl: row.posterUrl,
        name: row.name,
        goodsIds: row.goodsList.map(g => g.id),
        sortOrder: row.sortOrder,
        enabled: row.enabled
      }
      this.selectedGoodsList = [...row.goodsList]
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          // TODO: 替换为真实 API
          // updateOutfit(this.dataForm).then(() => {
          //   this.getList()
          //   this.dialogFormVisible = false
          //   this.$notify.success({ title: '成功', message: '更新成功' })
          // })
          this.$notify.warning({
            title: '提示',
            message: '后端 API 尚未实现，功能待开发'
          })
        }
      })
    },
    handleDelete(row) {
      // TODO: 替换为真实 API
      // deleteOutfit(row).then(() => {
      //   this.$notify.success({ title: '成功', message: '删除成功' })
      //   this.getList()
      // })
      this.$notify.warning({
        title: '提示',
        message: '后端 API 尚未实现，功能待开发'
      })
    },
    // ========== 商品选择器相关方法 ==========
    openGoodsSelector() {
      this.goodsSelectorVisible = true
      this.tempSelectedGoods = [...this.selectedGoodsList]
      this.resetGoodsQuery()
      this.getGoodsList()
    },
    getGoodsList() {
      this.goodsLoading = true
      const params = {
        page: this.goodsQuery.page,
        limit: this.goodsQuery.limit,
        name: this.goodsQuery.name,
        categoryId: this.goodsQuery.categoryId,
        isOnSale: this.goodsQuery.isOnSale
      }
      listGoods(params).then(response => {
        this.goodsList = response.data.data.list || []
        this.goodsTotal = response.data.data.total || 0
        this.goodsLoading = false
        // 恢复选中状态
        this.$nextTick(() => {
          if (this.$refs.goodsTable) {
            this.goodsList.forEach(row => {
              if (this.tempSelectedGoods.some(g => g.id === row.id)) {
                this.$refs.goodsTable.toggleRowSelection(row, true)
              }
            })
          }
        })
      }).catch(() => {
        this.goodsList = []
        this.goodsTotal = 0
        this.goodsLoading = false
      })
    },
    searchGoods() {
      this.goodsQuery.page = 1
      this.getGoodsList()
    },
    resetGoodsQuery() {
      this.goodsQuery = {
        page: 1,
        limit: 10,
        name: undefined,
        categoryId: undefined,
        categoryIds: [],
        isOnSale: undefined
      }
    },
    handleCategoryChange(value) {
      // 取最后一级分类ID
      this.goodsQuery.categoryId = value && value.length > 0 ? value[value.length - 1] : undefined
    },
    handleGoodsSelectionChange(selection) {
      // 合并新选择和已选择（去重）
      // 保留之前选中但当前页未显示的
      const notInCurrentPage = this.tempSelectedGoods.filter(g => !this.goodsList.some(item => item.id === g.id))
      // 当前页选中的
      const inCurrentPage = selection
      this.tempSelectedGoods = [...notInCurrentPage, ...inCurrentPage]
    },
    confirmGoodsSelection() {
      this.selectedGoodsList = [...this.tempSelectedGoods]
      this.dataForm.goodsIds = this.selectedGoodsList.map(g => g.id)
      this.goodsSelectorVisible = false
    },
    removeSelectedGoods(id) {
      this.selectedGoodsList = this.selectedGoodsList.filter(g => g.id !== id)
      this.dataForm.goodsIds = this.selectedGoodsList.map(g => g.id)
    }
  }
}
</script>
