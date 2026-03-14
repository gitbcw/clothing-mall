<template>
  <div class="app-container">
    <div class="filter-container">
      <el-alert
        title="功能说明"
        type="info"
        :closable="false"
        style="margin-bottom: 15px;"
      >
        <div>
          上传库存表格图片，系统将自动识别商品编号、颜色、尺码、数量信息，
          并尝试匹配系统中对应的SKU，确认后可批量更新库存。
          <br>
          <strong>免费额度：</strong>百度OCR提供500次/天免费调用
        </div>
      </el-alert>
    </div>

    <el-row :gutter="20">
      <el-col :span="10">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>1. 上传图片</span>
          </div>
          <el-upload
            ref="upload"
            class="upload-demo"
            drag
            :auto-upload="false"
            :limit="1"
            :on-change="handleFileChange"
            :on-exceed="handleExceed"
            :file-list="fileList"
            accept=".jpg,.jpeg,.png,.bmp"
            action="#"
          >
            <i class="el-icon-upload" />
            <div class="el-upload__text">将图片拖到此处，或<em>点击上传</em></div>
            <div slot="tip" class="el-upload__tip">支持jpg、jpeg、png、bmp格式，建议上传清晰的库存表格图片</div>
          </el-upload>
          <div style="margin-top: 15px;">
            <el-button type="primary" :loading="recognizing" :disabled="!selectedFile" @click="handleRecognize">
              {{ recognizing ? '识别中...' : '开始识别' }}
            </el-button>
            <el-button @click="handleReset">重置</el-button>
          </div>
        </el-card>

        <el-card v-if="imageUrl" class="box-card" style="margin-top: 15px;">
          <div slot="header" class="clearfix">
            <span>图片预览</span>
          </div>
          <div class="image-preview">
            <img :src="imageUrl" class="preview-image">
          </div>
        </el-card>
      </el-col>

      <el-col :span="14">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>2. 识别结果</span>
            <el-button v-if="recognizeResults.length > 0" style="float: right; padding: 3px 10px;" type="success" size="mini" @click="handleBatchUpdate">
              批量更新库存
            </el-button>
          </div>

          <div v-if="recognizeResults.length === 0" class="empty-result">
            <i class="el-icon-warning-outline" />
            <p>请先上传图片并点击识别</p>
          </div>

          <el-table v-else :data="recognizeResults" border fit highlight-current-row>
            <el-table-column align="center" label="商品编号" prop="goodsSn" width="100" />
            <el-table-column align="center" label="商品名称" prop="goodsName" min-width="120">
              <template slot-scope="scope">
                <span v-if="scope.row.goodsName">{{ scope.row.goodsName }}</span>
                <span v-else class="not-found">未找到商品</span>
              </template>
            </el-table-column>
            <el-table-column align="center" label="颜色" prop="color" width="80" />
            <el-table-column align="center" label="尺码" prop="size" width="80" />
            <el-table-column align="center" label="识别数量" prop="quantity" width="90">
              <template slot-scope="scope">
                <el-tag type="primary">{{ scope.row.quantity }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column align="center" label="当前库存" prop="currentStock" width="90">
              <template slot-scope="scope">
                <span v-if="scope.row.currentStock !== undefined">{{ scope.row.currentStock }}</span>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column align="center" label="状态" width="80">
              <template slot-scope="scope">
                <el-tag v-if="scope.row.matched" type="success">已匹配</el-tag>
                <el-tag v-else type="danger">未匹配</el-tag>
              </template>
            </el-table-column>
            <el-table-column align="center" label="操作" width="100">
              <template slot-scope="scope">
                <el-button v-if="scope.row.matched" type="text" size="small" @click="handleUpdateSingle(scope.row)">
                  更新
                </el-button>
                <span v-else class="not-matched-tip">{{ scope.row.matchMsg }}</span>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- 更新结果对话框 -->
    <el-dialog title="更新结果" :visible.sync="resultDialogVisible" width="500px">
      <el-alert
        v-if="updateResult"
        :title="'成功 ' + updateResult.successCount + ' 条，失败 ' + updateResult.failCount + ' 条'"
        :type="updateResult.failCount > 0 ? 'warning' : 'success'"
        :closable="false"
        style="margin-bottom: 15px;"
      />
      <div v-if="updateResult && updateResult.failedItems && updateResult.failedItems.length > 0">
        <h4>失败明细：</h4>
        <el-table :data="updateResult.failedItems" border size="small">
          <el-table-column prop="goodsSn" label="商品编号" />
          <el-table-column prop="color" label="颜色" />
          <el-table-column prop="size" label="尺码" />
          <el-table-column prop="errorMsg" label="原因" />
        </el-table>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="resultDialogVisible = false">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { recognizeImage, batchUpdateStock } from '@/api/ocr'

export default {
  name: 'OcrInventory',
  data() {
    return {
      selectedFile: null,
      fileList: [],
      imageUrl: '',
      recognizing: false,
      recognizeResults: [],
      resultDialogVisible: false,
      updateResult: null
    }
  },
  methods: {
    handleFileChange(file, fileList) {
      this.selectedFile = file.raw
      this.fileList = fileList.slice(-1)
      // 生成预览URL
      this.imageUrl = URL.createObjectURL(file.raw)
      this.recognizeResults = []
    },
    handleExceed(files, fileList) {
      this.$message.warning('只能上传一张图片')
      this.fileList = fileList.slice(-1)
    },
    handleRecognize() {
      if (!this.selectedFile) {
        this.$message.warning('请先选择图片')
        return
      }

      this.recognizing = true
      recognizeImage(this.selectedFile)
        .then(response => {
          this.recognizeResults = response.data.data || []
          if (this.recognizeResults.length === 0) {
            this.$message.warning('未识别到任何库存数据，请检查图片是否清晰')
          } else {
            const matchedCount = this.recognizeResults.filter(r => r.matched).length
            this.$message.success('识别到 ' + this.recognizeResults.length + ' 条数据，其中 ' + matchedCount + ' 条成功匹配SKU')
          }
        })
        .catch(error => {
          this.$message.error(error.response?.data?.msg || '识别失败，请重试')
        })
        .finally(() => {
          this.recognizing = false
        })
    },
    handleReset() {
      this.selectedFile = null
      this.fileList = []
      this.imageUrl = ''
      this.recognizeResults = []
      this.$refs.upload && this.$refs.upload.clearFiles()
    },
    handleUpdateSingle(row) {
      this.$confirm('确认更新该SKU的库存为 ' + row.quantity + '？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        batchUpdateStock([{
          skuId: row.skuId,
          quantity: row.quantity
        }]).then(response => {
          const result = response.data.data
          if (result.successCount > 0) {
            row.currentStock = row.quantity
            this.$message.success('更新成功')
          } else {
            this.$message.error('更新失败：' + (result.failedItems[0]?.errorMsg || '未知错误'))
          }
        })
      })
    },
    handleBatchUpdate() {
      const matchedItems = this.recognizeResults
        .filter(r => r.matched)
        .map(r => ({
          skuId: r.skuId,
          quantity: r.quantity
        }))

      if (matchedItems.length === 0) {
        this.$message.warning('没有可更新的数据')
        return
      }

      this.$confirm('确认更新 ' + matchedItems.length + ' 个SKU的库存？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        batchUpdateStock(matchedItems)
          .then(response => {
            this.updateResult = response.data.data
            this.resultDialogVisible = true

            // 更新本地数据
            if (this.updateResult.successCount > 0) {
              this.recognizeResults.forEach(r => {
                if (r.matched && !this.isInFailedList(r)) {
                  r.currentStock = r.quantity
                }
              })
            }
          })
          .catch(error => {
            this.$message.error(error.response?.data?.msg || '更新失败')
          })
      })
    },
    isInFailedList(row) {
      if (!this.updateResult || !this.updateResult.failedItems) return false
      return this.updateResult.failedItems.some(f =>
        f.goodsSn === row.goodsSn && f.color === row.color && f.size === row.size
      )
    }
  }
}
</script>

<style scoped>
.filter-container {
  margin-bottom: 15px;
}

.image-preview {
  display: flex;
  justify-content: center;
}

.preview-image {
  max-width: 100%;
  max-height: 400px;
  object-fit: contain;
}

.empty-result {
  text-align: center;
  padding: 60px 0;
  color: #909399;
}

.empty-result i {
  font-size: 48px;
  display: block;
  margin-bottom: 15px;
}

.not-found {
  color: #f56c6c;
}

.not-matched-tip {
  font-size: 12px;
  color: #e6a23c;
  display: block;
  max-width: 80px;
}
</style>
