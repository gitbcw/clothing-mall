<template>
  <div class="app-container">
    <!-- 查询和其他操作 -->
    <div class="filter-container">
      <el-input v-model="listQuery.goodsId" clearable class="filter-item" style="width: 160px;" placeholder="商品ID" />
      <el-input v-model="listQuery.color" clearable class="filter-item" style="width: 160px;" placeholder="颜色" />
      <el-input v-model="listQuery.size" clearable class="filter-item" style="width: 160px;" placeholder="尺码" />
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">查找</el-button>
      <el-button class="filter-item" type="primary" icon="el-icon-edit" @click="handleCreate">添加</el-button>
    </div>

    <!-- 查询结果 -->
    <el-table v-loading="listLoading" :data="list" element-loading-text="正在查询中。。。" border fit highlight-current-row>
      <el-table-column align="center" label="SKU ID" prop="id" width="80" />
      <el-table-column align="center" label="商品ID" prop="goodsId" width="80" />
      <el-table-column align="center" label="SKU编码" prop="skuCode" width="120" />
      <el-table-column align="center" label="颜色" prop="color" />
      <el-table-column align="center" label="尺码" prop="size" width="80" />
      <el-table-column align="center" label="价格" prop="price" width="100">
        <template slot-scope="scope">
          {{ scope.row.price }} 元
        </template>
      </el-table-column>
      <el-table-column align="center" label="库存" prop="stock" width="80">
        <template slot-scope="scope">
          <el-tag :type="scope.row.stock > 10 ? 'success' : scope.row.stock > 0 ? 'warning' : 'danger'">
            {{ scope.row.stock }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="条形码" prop="barCode" width="120" />
      <el-table-column align="center" label="默认" prop="isDefault" width="80">
        <template slot-scope="scope">
          <el-tag :type="scope.row.isDefault ? 'success' : 'info'">
            {{ scope.row.isDefault ? '是' : '否' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" width="200" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="handleUpdate(scope.row)">编辑</el-button>
          <el-button type="warning" size="mini" @click="handleStock(scope.row)">库存</el-button>
          <el-button type="danger" size="mini" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <!-- 添加或修改对话框 -->
    <el-dialog :visible.sync="dialogVisible" :title="dialogTitle" width="600">
      <el-form ref="dataForm" :model="dataForm" :rules="rules" label-position="left" label-width="100px">
        <el-form-item label="商品ID" prop="goodsId">
          <el-input v-model="dataForm.goodsId" :disabled="dialogStatus === 'update'" />
        </el-form-item>
        <el-form-item label="SKU编码" prop="skuCode">
          <el-input v-model="dataForm.skuCode" />
        </el-form-item>
        <el-form-item label="颜色" prop="color">
          <el-input v-model="dataForm.color" />
        </el-form-item>
        <el-form-item label="尺码" prop="size">
          <el-select v-model="dataForm.size" placeholder="请选择尺码">
            <el-option label="S" value="S" />
            <el-option label="M" value="M" />
            <el-option label="L" value="L" />
            <el-option label="XL" value="XL" />
            <el-option label="XXL" value="XXL" />
            <el-option label="XXXL" value="XXXL" />
          </el-select>
        </el-form-item>
        <el-form-item label="价格" prop="price">
          <el-input-number v-model="dataForm.price" :precision="2" :min="0" />
        </el-form-item>
        <el-form-item label="库存" prop="stock">
          <el-input-number v-model="dataForm.stock" :min="0" />
        </el-form-item>
        <el-form-item label="条形码" prop="barCode">
          <el-input v-model="dataForm.barCode" />
        </el-form-item>
        <el-form-item label="是否默认" prop="isDefault">
          <el-switch v-model="dataForm.isDefault" />
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
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmData">确定</el-button>
      </div>
    </el-dialog>

    <!-- 库存调整对话框 -->
    <el-dialog :visible.sync="stockDialogVisible" title="库存调整" width="400">
      <el-form ref="stockForm" :model="stockForm" label-position="left" label-width="80px">
        <el-form-item label="当前库存">
          <span>{{ stockForm.currentStock }}</span>
        </el-form-item>
        <el-form-item label="调整数量">
          <el-input-number v-model="stockForm.adjustNum" :min="-stockForm.currentStock" />
          <div style="color: #999; font-size: 12px;">正数增加库存，负数减少库存</div>
        </el-form-item>
        <el-form-item label="调整后">
          <span style="font-weight: bold; color: #409EFF;">{{ stockForm.currentStock + stockForm.adjustNum }}</span>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="stockDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmStock">确定</el-button>
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
</style>

<script>
import { listSku, createSku, updateSku, deleteSku, updateStock } from '@/api/sku'
import { uploadPath } from '@/api/storage'
import { getToken } from '@/utils/auth'
import Pagination from '@/components/Pagination'

export default {
  name: 'Sku',
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
        goodsId: undefined,
        color: undefined,
        size: undefined,
        sort: 'add_time',
        order: 'desc'
      },
      dialogVisible: false,
      dialogStatus: '',
      dialogTitle: '',
      dataForm: {
        id: undefined,
        goodsId: undefined,
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
        goodsId: [{ required: true, message: '商品ID不能为空', trigger: 'blur' }],
        color: [{ required: true, message: '颜色不能为空', trigger: 'blur' }],
        size: [{ required: true, message: '尺码不能为空', trigger: 'change' }],
        price: [{ required: true, message: '价格不能为空', trigger: 'blur' }]
      },
      stockDialogVisible: false,
      stockForm: {
        id: undefined,
        currentStock: 0,
        adjustNum: 0
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
  },
  methods: {
    getList() {
      this.listLoading = true
      listSku(this.listQuery).then(response => {
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
    resetForm() {
      this.dataForm = {
        id: undefined,
        goodsId: undefined,
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
    handleStock(row) {
      this.stockForm = {
        id: row.id,
        currentStock: row.stock,
        adjustNum: 0
      }
      this.stockDialogVisible = true
    },
    confirmStock() {
      if (this.stockForm.adjustNum === 0) {
        this.$notify.warning({
          title: '提示',
          message: '请输入调整数量'
        })
        return
      }
      updateStock({
        id: this.stockForm.id,
        adjustNum: this.stockForm.adjustNum
      }).then(response => {
        this.stockDialogVisible = false
        this.$notify.success({
          title: '成功',
          message: '库存调整成功'
        })
        this.getList()
      }).catch(response => {
        this.$notify.error({
          title: '失败',
          message: response.data.errmsg
        })
      })
    },
    uploadSuccess(response) {
      if (response.errno === 0) {
        this.dataForm.imageUrl = response.data.url
      }
    }
  }
}
</script>
