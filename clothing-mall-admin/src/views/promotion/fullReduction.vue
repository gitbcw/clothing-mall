<template>
  <div class="app-container">
    <div class="head-container">
      <div class="filter-container">
        <el-input v-model="listQuery.name" placeholder="活动名称" style="width: 200px;" class="filter-item" />
        <el-select v-model="listQuery.status" placeholder="状态" clearable class="filter-item">
          <el-option label="禁用" :value="1" />
          <el-option label="启用" :value="2" />
        </el-select>
        <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">查找</el-button>
        <el-button class="filter-item" type="primary" icon="el-icon-edit" @click="handleCreate">添加</el-button>
      </div>
    </div>

    <el-table v-loading="listLoading" :data="list" element-loading-text="正在加载..." border fit highlight-current-row>
      <el-table-column align="center" label="活动名称" prop="name" />
      <el-table-column align="center" label="活动描述" prop="desc" />
      <el-table-column align="center" label="门槛金额" prop="threshold">
        <template slot-scope="scope">{{ scope.row.threshold }}元</template>
      </el-table-column>
      <el-table-column align="center" label="减免金额" prop="discount">
        <template slot-scope="scope">{{ scope.row.discount }}元</template>
      </el-table-column>
      <el-table-column align="center" label="开始时间" prop="startTime">
        <template slot-scope="scope">{{ scope.row.startTime | formatTime }}</template>
      </el-table-column>
      <el-table-column align="center" label="结束时间" prop="endTime">
        <template slot-scope="scope">{{ scope.row.endTime | formatTime }}</template>
      </el-table-column>
      <el-table-column align="center" label="状态" prop="status">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">
            {{ scope.row.status === 1 ? '启用' : '禁用' }}
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
        <el-form-item label="活动名称" prop="name">
          <el-input v-model="dataForm.name" />
        </el-form-item>
        <el-form-item label="活动描述" prop="desc">
          <el-input v-model="dataForm.desc" type="textarea" />
        </el-form-item>
        <el-form-item label="门槛金额" prop="threshold">
          <el-input v-model="dataForm.threshold" type="number" />
        </el-form-item>
        <el-form-item label="减免金额" prop="discount">
          <el-input v-model="dataForm.discount" type="number" />
        </el-form-item>
        <el-form-item label="开始时间" prop="startTime">
          <el-date-picker v-model="dataForm.startTime" type="datetime" placeholder="选择开始时间" />
        </el-form-item>
        <el-form-item label="结束时间" prop="endTime">
          <el-date-picker v-model="dataForm.endTime" type="datetime" placeholder="选择结束时间" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="dataForm.status">
            <el-option label="禁用" :value="1" />
            <el-option label="启用" :value="2" />
          </el-select>
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
import { listFullReduction, createFullReduction, updateFullReduction, deleteFullReduction } from '@/api/fullReduction'
import Pagination from '@/components/Pagination'

export default {
  name: 'FullReduction',
  components: { Pagination },
  data() {
    return {
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        name: undefined,
        status: undefined,
        sort: 'add_time',
        order: 'desc'
      },
      dataForm: {
        id: undefined,
        name: undefined,
        desc: undefined,
        threshold: undefined,
        discount: undefined,
        startTime: undefined,
        endTime: undefined,
        status: 1,
        sortOrder: 0
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '创建'
      },
      rules: {
        name: [{ required: true, message: '请输入活动名称', trigger: 'blur' }],
        threshold: [{ required: true, message: '请输入门槛金额', trigger: 'blur' }],
        discount: [{ required: true, message: '请输入减免金额', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      listFullReduction(this.listQuery).then(response => {
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
        name: undefined,
        desc: undefined,
        threshold: undefined,
        discount: undefined,
        startTime: undefined,
        endTime: undefined,
        status: 1,
        sortOrder: 0
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
          createFullReduction(this.dataForm).then(response => {
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
          updateFullReduction(this.dataForm).then(response => {
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
        deleteFullReduction(row).then(response => {
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
