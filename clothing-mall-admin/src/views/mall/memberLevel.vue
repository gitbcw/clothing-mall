<template>
  <div class="app-container">
    <!-- 查询和其他操作 -->
    <div class="filter-container">
      <el-input v-model="listQuery.name" clearable class="filter-item" style="width: 200px;" placeholder="等级名称" />
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">查找</el-button>
      <el-button class="filter-item" type="primary" icon="el-icon-edit" @click="handleCreate">添加</el-button>
    </div>

    <!-- 查询结果 -->
    <el-table v-loading="listLoading" :data="list" element-loading-text="正在查询中。。。" border fit highlight-current-row>
      <el-table-column align="center" label="ID" prop="id" width="80" />
      <el-table-column align="center" label="等级名称" prop="name" />
      <el-table-column align="center" label="最低积分" prop="minPoints" width="100" />
      <el-table-column align="center" label="最高积分" prop="maxPoints" width="100">
        <template slot-scope="scope">
          {{ scope.row.maxPoints || '无上限' }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="折扣率" prop="discountRate" width="100">
        <template slot-scope="scope">
          {{ (scope.row.discountRate * 10).toFixed(1) }}折
        </template>
      </el-table-column>
      <el-table-column align="center" label="积分倍率" prop="pointsRate" width="100">
        <template slot-scope="scope">
          {{ scope.row.pointsRate }}倍
        </template>
      </el-table-column>
      <el-table-column align="center" label="图标" prop="iconUrl" width="80">
        <template slot-scope="scope">
          <el-avatar v-if="scope.row.iconUrl" :src="scope.row.iconUrl" size="small" />
        </template>
      </el-table-column>
      <el-table-column align="center" label="排序" prop="sortOrder" width="80" />
      <el-table-column align="center" label="操作" width="150">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="handleUpdate(scope.row)">编辑</el-button>
          <el-button type="danger" size="mini" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <!-- 添加或修改对话框 -->
    <el-dialog :visible.sync="dialogVisible" :title="dialogTitle" width="550">
      <el-form ref="dataForm" :model="dataForm" :rules="rules" label-position="left" label-width="100px">
        <el-form-item label="等级名称" prop="name">
          <el-input v-model="dataForm.name" />
        </el-form-item>
        <el-form-item label="积分范围" required>
          <el-col :span="11">
            <el-form-item prop="minPoints">
              <el-input-number v-model="dataForm.minPoints" :min="0" style="width: 100%;" />
            </el-form-item>
          </el-col>
          <el-col :span="2" style="text-align: center;">-</el-col>
          <el-col :span="11">
            <el-form-item prop="maxPoints">
              <el-input-number v-model="dataForm.maxPoints" :min="0" style="width: 100%;" />
              <div style="color: #999; font-size: 12px;">留空表示无上限</div>
            </el-form-item>
          </el-col>
        </el-form-item>
        <el-form-item label="折扣率" prop="discountRate">
          <el-slider v-model="dataForm.discountRate" :min="0.5" :max="1" :step="0.01" show-input :format-tooltip="formatDiscount" />
        </el-form-item>
        <el-form-item label="积分倍率" prop="pointsRate">
          <el-input-number v-model="dataForm.pointsRate" :min="1" :max="10" :precision="1" :step="0.5" />
          <span style="margin-left: 10px;">消费获得积分倍数</span>
        </el-form-item>
        <el-form-item label="等级图标" prop="iconUrl">
          <el-upload
            :headers="headers"
            :action="uploadPath"
            :show-file-list="false"
            :on-success="uploadSuccess"
            class="avatar-uploader"
            accept=".jpg,.jpeg,.png,.gif"
          >
            <img v-if="dataForm.iconUrl" :src="dataForm.iconUrl" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon" />
          </el-upload>
        </el-form-item>
        <el-form-item label="等级说明" prop="description">
          <el-input v-model="dataForm.description" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="排序" prop="sortOrder">
          <el-input-number v-model="dataForm.sortOrder" :min="0" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmData">确定</el-button>
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
  width: 80px;
  height: 80px;
  line-height: 80px;
  text-align: center;
}
.avatar {
  width: 80px;
  height: 80px;
  display: block;
}
</style>

<script>
import { listMemberLevel, createMemberLevel, updateMemberLevel, deleteMemberLevel } from '@/api/sku'
import { uploadPath } from '@/api/storage'
import { getToken } from '@/utils/auth'
import Pagination from '@/components/Pagination'

export default {
  name: 'MemberLevel',
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
      dialogVisible: false,
      dialogStatus: '',
      dialogTitle: '',
      dataForm: {
        id: undefined,
        name: '',
        minPoints: 0,
        maxPoints: null,
        discountRate: 1,
        pointsRate: 1,
        iconUrl: '',
        description: '',
        sortOrder: 0
      },
      rules: {
        name: [{ required: true, message: '等级名称不能为空', trigger: 'blur' }],
        minPoints: [{ required: true, message: '最低积分不能为空', trigger: 'blur' }]
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
    formatDiscount(val) {
      return (val * 10).toFixed(1) + '折'
    },
    getList() {
      this.listLoading = true
      listMemberLevel(this.listQuery).then(response => {
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
        name: '',
        minPoints: 0,
        maxPoints: null,
        discountRate: 1,
        pointsRate: 1,
        iconUrl: '',
        description: '',
        sortOrder: 0
      }
    },
    handleCreate() {
      this.resetForm()
      this.dialogStatus = 'create'
      this.dialogTitle = '添加会员等级'
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleUpdate(row) {
      this.dataForm = Object.assign({}, row)
      this.dialogStatus = 'update'
      this.dialogTitle = '编辑会员等级'
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    confirmData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          if (this.dialogStatus === 'create') {
            createMemberLevel(this.dataForm).then(response => {
              this.dialogVisible = false
              this.$notify.success({ title: '成功', message: '添加会员等级成功' })
              this.getList()
            }).catch(response => {
              this.$notify.error({ title: '失败', message: response.data.errmsg })
            })
          } else {
            updateMemberLevel(this.dataForm).then(response => {
              this.dialogVisible = false
              this.$notify.success({ title: '成功', message: '更新会员等级成功' })
              this.getList()
            }).catch(response => {
              this.$notify.error({ title: '失败', message: response.data.errmsg })
            })
          }
        }
      })
    },
    handleDelete(row) {
      this.$confirm('确定要删除该会员等级吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteMemberLevel({ id: row.id }).then(response => {
          this.$notify.success({ title: '成功', message: '删除会员等级成功' })
          this.getList()
        }).catch(response => {
          this.$notify.error({ title: '失败', message: response.data.errmsg })
        })
      }).catch(() => {})
    },
    uploadSuccess(response) {
      if (response.errno === 0) {
        this.dataForm.iconUrl = response.data.url
      }
    }
  }
}
</script>
