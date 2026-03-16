<template>
  <div class="app-container">

    <!-- 查询和其他操作 -->
    <div class="filter-container">
      <el-input v-model="listQuery.title" clearable class="filter-item" style="width: 200px;" placeholder="请输入活动标题" />
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">搜索</el-button>
      <el-button class="filter-item" type="primary" icon="el-icon-edit" @click="handleCreate">创建</el-button>
    </div>

    <!-- 查询结果 -->
    <el-table v-loading="listLoading" :data="list" element-loading-text="正在查询中..." border fit highlight-current-row>

      <el-table-column align="center" label="活动ID" prop="id" sortable />

      <el-table-column align="center" label="活动图片" prop="picUrl">
        <template slot-scope="scope">
          <el-image :src="scope.row.picUrl" style="width: 80px; height: 40px" />
        </template>
      </el-table-column>

      <el-table-column align="center" label="活动标题" prop="title" />

      <el-table-column align="center" label="活动描述" prop="description" />

      <el-table-column align="center" label="跳转商品" prop="goodsId">
        <template slot-scope="scope">
          <span v-if="scope.row.goodsId">{{ scope.row.goodsName || scope.row.goodsId }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="排序" prop="sortOrder" />

      <el-table-column align="center" label="状态" prop="enabled">
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
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="dataForm" status-icon label-position="left" label-width="100px" style="width: 400px; margin-left:50px;">
        <el-form-item label="活动图片" prop="picUrl">
          <el-upload
            :headers="headers"
            :action="uploadPath"
            :show-file-list="false"
            :on-success="uploadPicUrl"
            :before-upload="checkFileSize"
            class="avatar-uploader"
            accept=".jpg,.jpeg,.png,.gif"
          >
            <img v-if="dataForm.picUrl" :src="dataForm.picUrl" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon" />
            <div slot="tip" class="el-upload__tip">支持 jpg/png/gif 格式，不超过 1MB</div>
          </el-upload>
        </el-form-item>
        <el-form-item label="活动标题" prop="title">
          <el-input v-model="dataForm.title" placeholder="请输入活动标题" />
        </el-form-item>
        <el-form-item label="活动描述" prop="description">
          <el-input v-model="dataForm.description" type="textarea" :rows="3" placeholder="请输入活动描述" />
        </el-form-item>
        <el-form-item label="跳转商品" prop="goodsId">
          <el-select v-model="dataForm.goodsId" filterable placeholder="请选择跳转商品（可选）" clearable>
            <el-option v-for="item in goodsList" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
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
import { getToken } from '@/utils/auth'
import Pagination from '@/components/Pagination'

export default {
  name: 'Activity',
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
        picUrl: undefined,
        title: undefined,
        description: undefined,
        goodsId: undefined,
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
        title: [{ required: true, message: '活动标题不能为空', trigger: 'blur' }],
        picUrl: [{ required: true, message: '活动图片不能为空', trigger: 'blur' }]
      },
      goodsList: []
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
    this.getGoodsList()
  },
  methods: {
    getList() {
      this.listLoading = true
      // TODO: 替换为真实 API
      // listActivity(this.listQuery).then(response => {
      //   this.list = response.data.data.list
      //   this.total = response.data.data.total
      //   this.listLoading = false
      // })

      // Mock 数据
      setTimeout(() => {
        this.list = [
          {
            id: 1,
            picUrl: 'https://example.com/activity1.jpg',
            title: '春季新品上市',
            description: '2026春季新品首发，限时优惠',
            goodsId: null,
            goodsName: null,
            sortOrder: 1,
            enabled: true
          },
          {
            id: 2,
            picUrl: 'https://example.com/activity2.jpg',
            title: '会员专享',
            description: '会员专属折扣，立享9折',
            goodsId: 123,
            goodsName: '春季新款连衣裙',
            sortOrder: 2,
            enabled: true
          }
        ]
        this.total = 2
        this.listLoading = false
      }, 500)
    },
    getGoodsList() {
      // TODO: 获取商品列表用于选择
      // listGoods({ page: 1, limit: 1000 }).then(response => {
      //   this.goodsList = response.data.data.list
      // })
      this.goodsList = []
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    resetForm() {
      this.dataForm = {
        id: undefined,
        picUrl: undefined,
        title: undefined,
        description: undefined,
        goodsId: undefined,
        sortOrder: 0,
        enabled: true
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
    uploadPicUrl(response) {
      this.dataForm.picUrl = response.data.url
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
          // createActivity(this.dataForm).then(response => {
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
          // TODO: 替换为真实 API
          // updateActivity(this.dataForm).then(() => {
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
      // deleteActivity(row).then(() => {
      //   this.$notify.success({ title: '成功', message: '删除成功' })
      //   this.getList()
      // })
      this.$notify.warning({
        title: '提示',
        message: '后端 API 尚未实现，功能待开发'
      })
    }
  }
}
</script>
