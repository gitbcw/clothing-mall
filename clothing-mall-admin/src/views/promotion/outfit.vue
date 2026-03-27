<template>
  <div class="app-container">

    <!-- 查询和其他操作 -->
    <div class="filter-container">
      <el-input v-model="listQuery.title" clearable class="filter-item" style="width: 200px;" placeholder="请输入穿搭名称" />
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">搜索</el-button>
      <el-button class="filter-item" type="primary" icon="el-icon-edit" @click="handleCreate">创建</el-button>
    </div>

    <!-- 查询结果 -->
    <el-table v-loading="listLoading" :data="list" element-loading-text="正在查询中..." border fit highlight-current-row>

      <el-table-column align="center" label="ID" prop="id" sortable width="80" />

      <el-table-column align="center" label="封面图" prop="coverPic">
        <template slot-scope="scope">
          <el-image :src="scope.row.coverPic" style="width: 80px; height: 80px" fit="cover" />
        </template>
      </el-table-column>

      <el-table-column align="center" label="穿搭名称" prop="title" />

      <el-table-column align="center" label="关联商品" prop="goodsIds">
        <template slot-scope="scope">
          <el-tag v-for="goods in scope.row.goodsList" :key="goods.id" size="small" style="margin-right: 5px;">
            {{ goods.name }}
          </el-tag>
          <span v-if="!scope.row.goodsList || scope.row.goodsList.length === 0">-</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="排序" prop="sortOrder" width="80" />

      <el-table-column align="center" label="状态" prop="status" width="80">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'error'">{{ scope.row.status === 1 ? '启用' : '禁用' }}</el-tag>
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
        <el-form-item label="封面图" prop="coverPic">
          <el-upload
            :headers="headers"
            :action="uploadPath"
            :show-file-list="false"
            :on-success="posterUploadSuccess"
            :before-upload="checkFileSize"
            class="avatar-uploader"
            accept=".jpg,.jpeg,.png,.gif"
          >
            <img v-if="dataForm.coverPic" :src="dataForm.coverPic" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon" />
            <div slot="tip" class="el-upload__tip">支持 jpg/png/gif 格式，不超过 1MB</div>
          </el-upload>
        </el-form-item>
        <el-form-item label="穿搭名称" prop="title">
          <el-input v-model="dataForm.title" placeholder="请输入穿搭名称" />
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
        <el-form-item label="是否启用" prop="status">
          <el-switch v-model="dataForm.status" :active-value="1" :inactive-value="0" active-text="启用" inactive-text="禁用" />
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
import { listOutfit, createOutfit, updateOutfit, deleteOutfit } from '@/api/outfit'
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
        title: undefined,
        sort: 'sort_order',
        order: 'asc'
      },
      dataForm: {
        id: undefined,
        coverPic: '',
        title: '',
        description: '',
        goodsIds: [],
        tags: '',
        sortOrder: 0,
        status: 1
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '创建'
      },
      rules: {
        title: [{ required: true, message: '穿搭名称不能为空', trigger: 'blur' }],
        coverPic: [{ required: true, message: '封面图不能为空', trigger: 'blur' }],
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
      listOutfit(this.listQuery).then(response => {
        const list = response.data.data.list || []
        // Convert goodsIds string to array
        list.forEach(item => {
          item.goodsIds = item.goodsIds ? item.goodsIds.split(',').map(Number) : []
        })
        this.list = list
        this.total = response.data.data.total || 0
        this.listLoading = false
      }).catch(() => {
        this.list = []
        this.total = 0
        this.listLoading = false
      })
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
        title: '',
        coverPic: '',
        description: '',
        goodsIds: [],
        tags: '',
        sortOrder: 0,
        status: 1
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
    posterUploadSuccess(response) {
      this.dataForm.coverPic = response.data.url
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
          const submitData = { ...this.dataForm, goodsIds: this.dataForm.goodsIds.join(',') }
          createOutfit(submitData).then(() => {
            this.dialogFormVisible = false
            this.$notify.success({ title: '成功', message: '添加穿搭推荐成功' })
            this.getList()
          }).catch(response => {
            this.$notify.error({ title: '失败', message: response.data.errmsg || '操作失败' })
          })
        }
      })
    },
    handleUpdate(row) {
      this.dataForm = {
        id: row.id,
        coverPic: row.coverPic,
        title: row.title,
        goodsIds: row.goodsIds || [],
        sortOrder: row.sortOrder,
        status: row.status
      }
      this.selectedGoodsList = row.goodsList ? [...row.goodsList] : []
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          const submitData = { ...this.dataForm, goodsIds: this.dataForm.goodsIds.join(',') }
          updateOutfit(submitData).then(() => {
            this.dialogFormVisible = false
            this.$notify.success({ title: '成功', message: '更新穿搭推荐成功' })
            this.getList()
          }).catch(response => {
            this.$notify.error({ title: '失败', message: response.data.errmsg || '操作失败' })
          })
        }
      })
    },
    handleDelete(row) {
      this.$confirm('确定删除该穿搭推荐?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteOutfit({ id: row.id }).then(() => {
          this.$notify.success({ title: '成功', message: '删除成功' })
          this.getList()
        }).catch(response => {
          this.$notify.error({ title: '失败', message: response.data.errmsg || '删除失败' })
        })
      }).catch(() => {})
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
