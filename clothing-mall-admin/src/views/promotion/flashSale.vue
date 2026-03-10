<template>
  <div class="app-container">
    <div class="head-container">
      <div class="filter-container">
        <el-input v-model="listQuery.goodsName" placeholder="商品名称" style="width: 200px;" class="filter-item" />
        <el-select v-model="listQuery.status" placeholder="状态" clearable class="filter-item">
          <el-option label="未开始" :value="0" />
          <el-option label="进行中" :value="2" />
          <el-option label="已结束" :value="3" />
        </el-select>
        <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">查找</el-button>
        <el-button class="filter-item" type="primary" icon="el-icon-edit" @click="handleCreate">添加</el-button>
      </div>
    </div>

    <el-table v-loading="listLoading" :data="list" element-loading-text="正在加载..." border fit highlight-current-row>
      <el-table-column align="center" label="商品ID" prop="goodsId" />
      <el-table-column align="center" label="商品名称" prop="goodsName" />
      <el-table-column align="center" label="原价" prop="originalPrice">
        <template slot-scope="scope">{{ scope.row.originalPrice }}元</template>
      </el-table-column>
      <el-table-column align="center" label="特卖价" prop="flashPrice">
        <template slot-scope="scope">{{ scope.row.flashPrice }}元</template>
      </el-table-column>
      <el-table-column align="center" label="特卖库存" prop="flashStock" />
      <el-table-column align="center" label="已售" prop="flashSales" />
      <el-table-column align="center" label="开始时间" prop="startTime">
        <template slot-scope="scope">{{ scope.row.startTime | formatTime }}</template>
      </el-table-column>
      <el-table-column align="center" label="结束时间" prop="endTime">
        <template slot-scope="scope">{{ scope.row.endTime | formatTime }}</template>
      </el-table-column>
      <el-table-column align="center" label="状态" prop="status">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status === 1 ? 'info' : scope.row.status === 2? 'success' : 'danger'">
            {{ scope.row.status === 0 ? '未开始' : scope.row.status === 1 ? '进行中' : '已结束' }}
          </el-tag>
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

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="dataForm" label-position="left" label-width="100px" style="width: 400px; margin-left:50px;">
        <el-form-item label="商品ID" prop="goodsId">
          <el-input v-model="dataForm.goodsId" />
        </el-form-item>
        <el-form-item label="商品名称" prop="goodsName">
          <el-input v-model="dataForm.goodsName" />
        </el-form-item>
        <el-form-item label="原价" prop="originalPrice">
          <el-input v-model="dataForm.originalPrice" type="number" />
        </el-form-item>
        <el-form-item label="特卖价" prop="flashPrice">
          <el-input v-model="dataForm.flashPrice" type="number" />
        </el-form-item>
        <el-form-item label="特卖库存" prop="flashStock">
          <el-input v-model="dataForm.flashStock" type="number" />
        </el-form-item>
        <el-form-item label="开始时间" prop="startTime">
          <el-date-picker v-model="dataForm.startTime" type="datetime" placeholder="选择开始时间" />
        </el-form-item>
        <el-form-item label="结束时间" prop="endTime">
          <el-date-picker v-model="dataForm.endTime" type="datetime" placeholder="选择结束时间" />
        </el-form-item>
        <el-form-item label="排序" prop="sortOrder">
          <el-input v-model="dataForm.sortOrder" type="number" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listFlashSale, createFlashSale, updateFlashSale, deleteFlashSale } from '@/api/flashSale'
import Pagination from '@/components/Pagination'

export default {
  name: 'FlashSale',
  components: { Pagination },
  data() {
    return {
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        goodsName: undefined,
        status: undefined,
        sort: 'add_time',
        order: 'desc'
      },
      dataForm: {
        id: undefined,
        goodsId: undefined,
        goodsName: undefined,
        originalPrice: undefined,
        flashPrice: undefined,
        flashStock: undefined,
        startTime: undefined,
        endTime: undefined,
        sortOrder: 0
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '创建'
      },
      rules: {
        goodsId: [{ required: true, message: '请输入商品ID', trigger: 'blur' }],
        goodsName: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
        originalPrice: [{ required: true, message: '请输入原价', trigger: 'blur' }],
        flashPrice: [{ required: true, message: '请输入特卖价', trigger: 'blur' }],
        flashStock: [{ required: true, message: '请输入特卖库存', trigger: 'blur' }],
        startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
        endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      listFlashSale(this.listQuery).then(response => {
        this.list = response.data.data.list
        this.total = response.data.data.total
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
        goodsName: undefined,
        originalPrice: undefined,
        flashPrice: undefined,
        flashStock: undefined,
        startTime: undefined,
        endTime: undefined,
        sortOrder: 1
      }
    },
    handleCreate() {
      this.resetForm()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          createFlashSale(this.dataForm).then(response => {
            this.dialogFormVisible = false
            this.$notify.success({
              title: '成功',
              message: '创建成功'
            })
            this.getList()
          })
        }
      })
    },
    handleUpdate(row) {
      this.dataForm = Object.assign({}, row)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          updateFlashSale(this.dataForm).then(response => {
            this.dialogFormVisible = false
            this.$notify.success({
              title: '成功',
              message: '更新成功'
            })
            this.getList()
          })
        }
      })
    },
    handleDelete(row) {
      this.$confirm('此操作将永久删除该记录, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteFlashSale(row).then(response => {
          this.$notify.success({
            title: '成功',
            message: '删除成功'
          })
          this.getList()
        })
      })
    },
    formatTime(time) {
      if (!time) return ''
      return new Date(time).toLocaleString()
    }
  }
}
</script>

<style scoped>
.app-container {
  padding: 20px;
}
.head-container{
  margin-bottom: 20px;
}
.filter-container{
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.filter-item{
  margin-right: 10px;
}
</style>
