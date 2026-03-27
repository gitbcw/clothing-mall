<template>
  <div class="app-container">
    <!-- 查询和其他操作 -->
    <div class="filter-container">
      <el-select v-model="listQuery.status" clearable class="filter-item" style="width: 120px;" placeholder="状态">
        <el-option label="全部" value="" />
        <el-option label="可用" value="active" />
        <el-option label="停用" value="inactive" />
      </el-select>
      <el-cascader
        v-model="listQuery.categoryId"
        :options="categoryOptions"
        :props="{ checkStrictly: true, value: 'id', label: 'label', emitPath: false }"
        clearable
        class="filter-item"
        style="width: 200px;"
        placeholder="分类"
      />
      <el-input v-model="listQuery.keyword" clearable class="filter-item" style="width: 160px;" placeholder="关键词" />
      <el-input v-model="listQuery.color" clearable class="filter-item" style="width: 120px;" placeholder="颜色" />
      <el-select v-model="listQuery.size" clearable class="filter-item" style="width: 100px;" placeholder="尺码">
        <el-option label="S" value="S" />
        <el-option label="M" value="M" />
        <el-option label="L" value="L" />
        <el-option label="XL" value="XL" />
        <el-option label="XXL" value="XXL" />
        <el-option label="XXXL" value="XXXL" />
      </el-select>
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">查找</el-button>
      <el-button class="filter-item" type="primary" icon="el-icon-edit" @click="handleCreate">添加</el-button>
    </div>

    <!-- 状态标签页 -->
    <el-tabs v-model="activeTab" @tab-click="handleTabClick">
      <el-tab-pane label="全部" name="all" />
      <el-tab-pane label="可用" name="active" />
      <el-tab-pane label="停用" name="inactive" />
    </el-tabs>

    <!-- 查询结果 -->
    <el-table v-loading="listLoading" :data="list" element-loading-text="正在查询中。。。" border fit highlight-current-row>
      <el-table-column align="center" label="ID" prop="id" width="70" />
      <el-table-column align="center" label="图片" width="80">
        <template slot-scope="scope">
          <el-image
            v-if="scope.row.imageUrl || scope.row.sourceImage"
            :src="scope.row.imageUrl || scope.row.sourceImage"
            :preview-src-list="[scope.row.imageUrl || scope.row.sourceImage]"
            style="width: 40px; height: 40px; border-radius: 4px;"
            fit="cover"
          />
          <span v-else style="color: #ccc;">无图</span>
        </template>
      </el-table-column>
      <el-table-column align="left" label="名称" min-width="150">
        <template slot-scope="scope">
          <div>{{ scope.row.name || scope.row.goodsName || '-' }}</div>
          <div v-if="scope.row.aiRecognized" style="font-size: 12px; color: #67c23a;">
            <i class="el-icon-cpu" /> AI识别
          </div>
        </template>
      </el-table-column>
      <el-table-column align="center" label="分类" prop="categoryName" width="100" />
      <el-table-column align="center" label="颜色" prop="color" width="80" />
      <el-table-column align="center" label="尺码" prop="size" width="70" />
      <el-table-column align="center" label="价格" prop="price" width="80">
        <template slot-scope="scope">
          <span style="color: #f56c6c;">{{ scope.row.price }} 元</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="库存" prop="stock" width="70">
        <template slot-scope="scope">
          <el-tag :type="scope.row.stock > 10 ? 'success' : scope.row.stock > 0 ? 'warning' : 'danger'" size="mini">
            {{ scope.row.stock }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="状态" width="80">
        <template slot-scope="scope">
          <el-tag :type="statusTagType(scope.row.status)" size="mini">
            {{ statusText(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="关联商品" width="100">
        <template slot-scope="scope">
          <span v-if="scope.row.goodsId">{{ scope.row.goodsName || scope.row.goodsId }}</span>
          <span v-else style="color: #909399;">-</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" width="240" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="handleUpdate(scope.row)">编辑</el-button>
          <el-button
            v-if="scope.row.status === 'active'"
            type="warning"
            size="mini"
            @click="handleToggleStatus(scope.row, 'inactive')"
          >停用</el-button>
          <el-button
            v-else
            type="success"
            size="mini"
            @click="handleToggleStatus(scope.row, 'active')"
          >启用</el-button>
          <el-button type="danger" size="mini" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <!-- 添加或修改对话框 -->
    <el-dialog :visible.sync="dialogVisible" :title="dialogTitle" width="700">
      <el-form ref="dataForm" :model="dataForm" :rules="rules" label-position="left" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="SKU名称" prop="name">
              <el-input v-model="dataForm.name" placeholder="AI识别或手动输入" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-select v-model="dataForm.status" style="width: 100%;">
                <el-option label="可用" value="active" />
                <el-option label="停用" value="inactive" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="分类" prop="categoryId">
              <el-cascader
                v-model="dataForm.categoryId"
                :options="categoryOptions"
                :props="{ checkStrictly: true, value: 'id', label: 'label', emitPath: false }"
                style="width: 100%;"
                placeholder="选择分类"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="品牌" prop="brand">
              <el-input v-model="dataForm.brand" placeholder="品牌" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="颜色" prop="color">
              <el-input v-model="dataForm.color" placeholder="颜色" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="尺码" prop="size">
              <el-select v-model="dataForm.size" style="width: 100%;" placeholder="请选择尺码">
                <el-option label="S" value="S" />
                <el-option label="M" value="M" />
                <el-option label="L" value="L" />
                <el-option label="XL" value="XL" />
                <el-option label="XXL" value="XXL" />
                <el-option label="XXXL" value="XXXL" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="价格" prop="price">
              <el-input-number v-model="dataForm.price" :precision="2" :min="0" style="width: 100%;" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="库存" prop="stock">
              <el-input-number v-model="dataForm.stock" :min="0" style="width: 100%;" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="SKU编码" prop="skuCode">
              <el-input v-model="dataForm.skuCode" placeholder="SKU编码" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="条形码" prop="barCode">
              <el-input v-model="dataForm.barCode" placeholder="条形码" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="简介" prop="brief">
          <el-input v-model="dataForm.brief" type="textarea" :rows="2" placeholder="商品简介" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="材质" prop="material">
              <el-input v-model="dataForm.material" placeholder="材质" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="季节" prop="season">
              <el-select v-model="dataForm.season" style="width: 100%;" placeholder="季节">
                <el-option label="春季" value="spring" />
                <el-option label="夏季" value="summer" />
                <el-option label="秋季" value="autumn" />
                <el-option label="冬季" value="winter" />
                <el-option label="四季" value="all_season" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="风格标签" prop="style">
          <el-input v-model="dataForm.style" placeholder="风格标签，多个用逗号分隔" />
        </el-form-item>
        <el-form-item label="SKU图片" prop="imageUrl">
          <el-upload
            :headers="headers"
            :action="uploadPath"
            :show-file-list="false"
            :on-success="uploadSuccess"
            class="avatar-uploader"
            accept=".jpg,.jpeg,.png,.gif"
          >
            <img v-if="dataForm.imageUrl" :src="dataForm.imageUrl" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon" />
          </el-upload>
        </el-form-item>
        <el-form-item label="是否默认" prop="isDefault">
          <el-switch v-model="dataForm.isDefault" />
          <span class="form-tip">默认 SKU 会作为商品主图</span>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmData">保存</el-button>
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
  border-color: #409EFF;
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
  width: 120px;
  height: 120px;
  display: block;
}
.form-tip {
  margin-left: 10px;
  color: #909399;
  font-size: 12px;
}
</style>

<script>
import { listSku, createSku, updateSku, deleteSku } from '@/api/sku'
import { listCategory } from '@/api/category'
import { uploadPath } from '@/api/storage'
import { getToken } from '@/utils/auth'
import Pagination from '@/components/Pagination'

export default {
  name: 'Sku',
  components: { Pagination },
  data() {
    return {
      uploadPath,
      activeTab: 'all',
      categoryOptions: [],
      list: [],
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        status: undefined,
        categoryId: undefined,
        color: undefined,
        size: undefined,
        keyword: undefined,
        sort: 'add_time',
        order: 'desc'
      },
      dialogVisible: false,
      dialogStatus: '',
      dialogTitle: '',
      dataForm: {
        id: undefined,
        goodsId: undefined,
        status: 'active',
        categoryId: undefined,
        brand: '',
        name: '',
        brief: '',
        material: '',
        season: '',
        style: '',
        aiRecognized: false,
        skuCode: '',
        color: '',
        size: '',
        price: 0,
        stock: 0,
        barCode: '',
        imageUrl: '',
        isDefault: false
      },
      rules: {
        color: [{ required: true, message: '颜色不能为空', trigger: 'blur' }],
        size: [{ required: true, message: '尺码不能为空', trigger: 'change' }],
        price: [{ required: true, message: '价格不能为空', trigger: 'blur' }]
      }
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
      const query = { ...this.listQuery }
      if (this.activeTab !== 'all') {
        query.status = this.activeTab
      }
      listSku(query).then(response => {
        this.list = response.data.data.list
        this.total = response.data.data.total
        this.listLoading = false
      }).catch(() => {
        this.list = []
        this.total = 0
        this.listLoading = false
      })
    },
    getCategoryList() {
      listCategory().then(response => {
        this.categoryOptions = this.buildCategoryTree(response.data.data.list)
      })
    },
    buildCategoryTree(categories) {
      if (!categories || categories.length === 0) return []
      const map = {}
      const roots = []
      categories.forEach(c => {
        map[c.id] = { id: c.id, label: c.name, children: [] }
      })
      categories.forEach(c => {
        if (c.pid === 0 || !map[c.pid]) {
          roots.push(map[c.id])
        } else {
          map[c.pid].children.push(map[c.id])
        }
      })
      return roots
    },
    handleTabClick() {
      this.listQuery.page = 1
      this.getList()
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    statusText(status) {
      const map = { active: '可用', inactive: '停用' }
      return map[status] || status
    },
    statusTagType(status) {
      const map = { active: 'success', inactive: 'info' }
      return map[status] || 'info'
    },
    resetForm() {
      this.dataForm = {
        id: undefined,
        goodsId: undefined,
        status: 'active',
        categoryId: undefined,
        brand: '',
        name: '',
        brief: '',
        material: '',
        season: '',
        style: '',
        aiRecognized: false,
        skuCode: '',
        color: '',
        size: '',
        price: 0,
        stock: 0,
        barCode: '',
        imageUrl: '',
        isDefault: false
      }
    },
    handleCreate() {
      this.resetForm()
      this.dialogStatus = 'create'
      this.dialogTitle = '添加SKU'
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleUpdate(row) {
      this.dataForm = Object.assign({}, row)
      this.dialogStatus = 'update'
      this.dialogTitle = '编辑SKU'
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    confirmData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          if (this.dialogStatus === 'create') {
            createSku(this.dataForm).then(response => {
              this.dialogVisible = false
              this.$notify.success({
                title: '成功',
                message: '添加SKU成功'
              })
              this.getList()
            }).catch(response => {
              this.$notify.error({
                title: '失败',
                message: response.data.errmsg
              })
            })
          } else {
            updateSku(this.dataForm).then(response => {
              this.dialogVisible = false
              this.$notify.success({
                title: '成功',
                message: '更新SKU成功'
              })
              this.getList()
            }).catch(response => {
              this.$notify.error({
                title: '失败',
                message: response.data.errmsg
              })
            })
          }
        }
      })
    },
    handleToggleStatus(row, newStatus) {
      const action = newStatus === 'active' ? '启用' : '停用'
      this.$confirm(`确定要${action}该SKU吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        updateSku({ id: row.id, status: newStatus }).then(response => {
          this.$notify.success({
            title: '成功',
            message: `SKU已${action}`
          })
          this.getList()
        }).catch(response => {
          this.$notify.error({
            title: '失败',
            message: response.data.errmsg
          })
        })
      }).catch(() => {})
    },
    handleDelete(row) {
      this.$confirm('确定要删除该SKU吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteSku({ id: row.id }).then(response => {
          this.$notify.success({
            title: '成功',
            message: '删除SKU成功'
          })
          this.getList()
        }).catch(response => {
          this.$notify.error({
            title: '失败',
            message: response.data.errmsg
          })
        })
      }).catch(() => {})
    },
    uploadSuccess(response) {
      if (response.errno === 0) {
        this.dataForm.imageUrl = response.data.url
      }
    }
  }
}
</script>
