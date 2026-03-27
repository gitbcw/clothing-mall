<template>
  <div class="app-container">
    <!-- 查询和其他操作 -->
    <div class="filter-container">
      <el-button class="filter-item" type="primary" icon="el-icon-edit" @click="handleCreate">添加场景</el-button>
    </div>

    <!-- 查询结果 -->
    <el-table v-loading="listLoading" :data="list" element-loading-text="正在查询中。。。" border fit highlight-current-row>
      <el-table-column align="center" label="ID" prop="id" width="80" />
      <el-table-column align="center" label="图标" width="80">
        <template slot-scope="scope">
          <el-image
            v-if="scope.row.icon"
            :src="scope.row.icon"
            style="width: 40px; height: 40px;"
            fit="contain"
          />
          <span v-else style="color: #ccc;">-</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="海报图" width="100">
        <template slot-scope="scope">
          <el-image v-if="scope.row.posterUrl" :src="scope.row.posterUrl" style="width: 60px; height: 40px;" fit="cover" :preview-src-list="[scope.row.posterUrl]" />
          <span v-else style="color: #ccc;">-</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="场景名称" prop="name" />
      <el-table-column align="center" label="描述" prop="description" />
      <el-table-column align="center" label="排序" prop="sortOrder" width="80" />
      <el-table-column align="center" label="状态" width="100">
        <template slot-scope="scope">
          <el-tag :type="scope.row.enabled ? 'success' : 'info'" size="mini">
            {{ scope.row.enabled ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" width="280" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button type="info" size="mini" @click="handleGoods(scope.row)">关联商品</el-button>
          <el-button type="primary" size="mini" @click="handleUpdate(scope.row)">编辑</el-button>
          <el-button
            :type="scope.row.enabled ? 'warning' : 'success'"
            size="mini"
            @click="handleEnable(scope.row)"
          >
            {{ scope.row.enabled ? '禁用' : '启用' }}
          </el-button>
          <el-button type="danger" size="mini" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加或修改对话框 -->
    <el-dialog :visible.sync="dialogVisible" :title="dialogTitle" width="500">
      <el-form ref="dataForm" :model="dataForm" :rules="rules" label-position="left" label-width="80px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="dataForm.name" placeholder="场景名称" />
        </el-form-item>
        <el-form-item label="图标" prop="icon">
          <el-upload
            :headers="headers"
            :action="uploadPath"
            :show-file-list="false"
            :on-success="uploadSuccess"
            class="avatar-uploader"
            accept=".jpg,.jpeg,.png,.gif"
          >
            <img v-if="dataForm.icon" :src="dataForm.icon" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon" />
          </el-upload>
        </el-form-item>
        <el-form-item label="海报图" prop="posterUrl">
          <el-upload
            :headers="headers"
            :action="uploadPath"
            :show-file-list="false"
            :on-success="posterUploadSuccess"
            class="avatar-uploader"
            accept=".jpg,.jpeg,.png,.gif"
          >
            <img v-if="dataForm.posterUrl" :src="dataForm.posterUrl" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon" />
          </el-upload>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="dataForm.description" type="textarea" :rows="2" placeholder="场景描述" />
        </el-form-item>
        <el-form-item label="排序" prop="sortOrder">
          <el-input-number v-model="dataForm.sortOrder" :min="0" />
        </el-form-item>
        <el-form-item label="状态" prop="enabled">
          <el-switch v-model="dataForm.enabled" active-text="启用" inactive-text="禁用" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmData">确定</el-button>
      </div>
    </el-dialog>

    <!-- 关联商品对话框 -->
    <el-dialog :visible.sync="goodsDialogVisible" title="关联商品" width="700">
      <div style="margin-bottom: 15px;">
        <el-input v-model="goodsSearchName" placeholder="搜索商品名称" style="width: 200px; margin-right: 10px;" clearable />
        <el-button type="primary" size="small" @click="loadGoodsList">搜索</el-button>
      </div>
      <el-table v-loading="goodsLoading" :data="goodsList" border max-height="400" @selection-change="handleGoodsSelectionChange">
        <el-table-column type="selection" width="55" :reserve-selection="true" />
        <el-table-column align="center" label="ID" prop="id" width="80" />
        <el-table-column align="center" label="商品图" width="80">
          <template slot-scope="scope">
            <el-image v-if="scope.row.picUrl" :src="scope.row.picUrl" style="width: 40px; height: 40px;" fit="cover" />
          </template>
        </el-table-column>
        <el-table-column align="center" label="商品名称" prop="name" />
        <el-table-column align="center" label="零售价" prop="retailPrice" width="100" />
      </el-table>
      <el-pagination
        layout="total, prev, pager, next"
        :total="goodsTotal"
        :page.sync="goodsPage"
        :limit.sync="goodsLimit"
        style="margin-top: 15px; text-align: right;"
        @current-change="loadGoodsList"
      />
      <div slot="footer">
        <el-button @click="goodsDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmSceneGoods">确定</el-button>
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
import { listScene, createScene, updateScene, deleteScene, enableScene, listSceneGoods, updateSceneGoods } from '@/api/scene'
import { listGoods } from '@/api/goods'
import { uploadPath } from '@/api/storage'
import { getToken } from '@/utils/auth'

export default {
  name: 'Scene',
  data() {
    return {
      uploadPath,
      list: [],
      listLoading: true,
      dialogVisible: false,
      dialogStatus: '',
      dialogTitle: '',
      dataForm: {
        id: undefined,
        name: '',
        icon: '',
        posterUrl: '',
        description: '',
        sortOrder: 0,
        enabled: true
      },
      rules: {
        name: [{ required: true, message: '场景名称不能为空', trigger: 'blur' }]
      },
      goodsDialogVisible: false,
      currentSceneId: null,
      goodsList: [],
      selectedGoodsIds: [],
      goodsSearchName: '',
      goodsTotal: 0,
      goodsPage: 1,
      goodsLimit: 10,
      goodsLoading: false
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
      listScene().then(response => {
        this.list = response.data.data.list
        this.listLoading = false
      }).catch(() => {
        this.list = []
        this.listLoading = false
      })
    },
    resetForm() {
      this.dataForm = {
        id: undefined,
        name: '',
        icon: '',
        posterUrl: '',
        description: '',
        sortOrder: 0,
        enabled: true
      }
    },
    handleCreate() {
      this.resetForm()
      this.dialogStatus = 'create'
      this.dialogTitle = '添加场景'
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleUpdate(row) {
      this.dataForm = Object.assign({}, row)
      this.dialogStatus = 'update'
      this.dialogTitle = '编辑场景'
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    confirmData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          if (this.dialogStatus === 'create') {
            createScene(this.dataForm).then(response => {
              this.dialogVisible = false
              this.$notify.success({
                title: '成功',
                message: '添加场景成功'
              })
              this.getList()
            }).catch(response => {
              this.$notify.error({
                title: '失败',
                message: response.data.errmsg
              })
            })
          } else {
            updateScene(this.dataForm).then(response => {
              this.dialogVisible = false
              this.$notify.success({
                title: '成功',
                message: '更新场景成功'
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
    handleEnable(row) {
      const newEnabled = !row.enabled
      const action = newEnabled ? '启用' : '禁用'
      this.$confirm(`确定要${action}该场景吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        enableScene({ id: row.id, enabled: newEnabled }).then(response => {
          this.$notify.success({
            title: '成功',
            message: `${action}成功`
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
      this.$confirm('确定要删除该场景吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteScene({ id: row.id }).then(response => {
          this.$notify.success({
            title: '成功',
            message: '删除场景成功'
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
        this.dataForm.icon = response.data.url
      }
    },
    posterUploadSuccess(response) {
      if (response.errno === 0) {
        this.dataForm.posterUrl = response.data.url
      }
    },
    handleGoods(row) {
      this.currentSceneId = row.id
      this.selectedGoodsIds = []
      this.goodsSearchName = ''
      this.goodsPage = 1
      this.goodsDialogVisible = true
      // Load existing associations
      listSceneGoods(row.id).then(res => {
        this.selectedGoodsIds = res.data.data || []
        this.$nextTick(() => {
          this.loadGoodsList()
        })
      })
    },
    loadGoodsList() {
      this.goodsLoading = true
      listGoods({ name: this.goodsSearchName, page: this.goodsPage, limit: this.goodsLimit, status: 'published' }).then(res => {
        this.goodsList = res.data.data.list || []
        this.goodsTotal = res.data.data.total || 0
        this.goodsLoading = false
      }).catch(() => {
        this.goodsList = []
        this.goodsTotal = 0
        this.goodsLoading = false
      })
    },
    handleGoodsSelectionChange(selection) {
      this.selectedGoodsIds = selection.map(item => item.id)
    },
    confirmSceneGoods() {
      updateSceneGoods({ sceneId: this.currentSceneId, goodsIds: this.selectedGoodsIds }).then(() => {
        this.goodsDialogVisible = false
        this.$notify.success({ title: '成功', message: '关联商品成功' })
      }).catch(res => {
        this.$notify.error({ title: '失败', message: res.data.errmsg || '关联失败' })
      })
    }
  }
}
</script>
