<template>
  <div class="app-container">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>小程序卡片推送</span>
      </div>

      <el-form ref="pushForm" :model="pushForm" :rules="rules" label-width="120px">
        <!-- 选择标签 -->
        <el-form-item label="发送给" prop="tagId">
          <el-select v-model="pushForm.tagId" placeholder="请选择客户标签" class="input-width" :loading="tagsLoading" filterable>
            <el-option-group
              v-for="group in tagGroups"
              :key="group.name"
              :label="group.name"
            >
              <el-option
                v-for="tag in group.tags"
                :key="tag.id"
                :label="tag.name"
                :value="tag.id"
              />
            </el-option-group>
          </el-select>
          <el-button type="text" :loading="tagsLoading" style="margin-left: 10px;" @click="loadTags">
            <i class="el-icon-refresh" /> 刷新
          </el-button>
          <div v-if="tagsError" class="error-tip">{{ tagsError }}</div>
        </el-form-item>

        <!-- 卡片标题 -->
        <el-form-item label="卡片标题" prop="title">
          <el-input v-model="pushForm.title" placeholder="如：新品上市、限时特卖" class="input-width" maxlength="20" show-word-limit />
        </el-form-item>

        <!-- 封面图片 -->
        <el-form-item label="封面图片" prop="mediaId">
          <el-upload
            class="cover-uploader"
            :action="uploadUrl"
            :headers="uploadHeaders"
            :show-file-list="false"
            :on-success="handleUploadSuccess"
            :on-error="handleUploadError"
            :before-upload="beforeUpload"
            accept="image/*"
          >
            <img v-if="pushForm.coverUrl" :src="pushForm.coverUrl" class="cover-image">
            <i v-else class="el-icon-plus cover-uploader-icon" />
          </el-upload>
          <div v-if="pushForm.mediaId" class="upload-success">
            <i class="el-icon-success" /> 封面已上传
          </div>
          <div class="form-tip">建议尺寸：520×416px，支持 JPG/PNG，不超过 20MB</div>
        </el-form-item>

        <!-- 跳转页面 -->
        <el-form-item label="跳转页面" prop="page">
          <el-select v-model="pushForm.page" placeholder="选择跳转页面" class="input-width" filterable allow-create>
            <el-option
              v-for="item in pageList"
              :key="item.path"
              :label="item.name"
              :value="item.path"
            />
          </el-select>
          <div class="form-tip">客户点击卡片后跳转的小程序页面，也可手动输入路径（如：pages/goods/goods?id=123）</div>
        </el-form-item>

        <!-- 操作按钮 -->
        <el-form-item>
          <el-button type="primary" :loading="sending" @click="handleSend">
            发送给客户
          </el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 使用说明 -->
    <el-card class="box-card help-card">
      <div slot="header">
        <span>使用说明</span>
      </div>
      <el-collapse>
        <el-collapse-item title="前提条件" name="1">
          <ol>
            <li>在「配置管理 → 促销配置」中配置企业微信企业ID、Secret、发送者账号</li>
            <li>将小程序关联到企业微信（小程序需已发布上线）</li>
            <li>在企业微信管理后台创建客户标签</li>
          </ol>
        </el-collapse-item>
        <el-collapse-item title="推送流程" name="2">
          <ol>
            <li>选择要发送的客户标签</li>
            <li>填写卡片标题（显示在卡片上）</li>
            <li>上传封面图片</li>
            <li>选择客户点击后跳转的小程序页面</li>
            <li>点击发送</li>
          </ol>
        </el-collapse-item>
        <el-collapse-item title="自定义跳转页面" name="3">
          <p>如需跳转到指定商品或活动页面，可在下拉框中手动输入页面路径：</p>
          <ul>
            <li>商品详情：<code>pages/goods/goods?id=商品ID</code></li>
            <li>专题页：<code>pages/topicDetail/topicDetail?id=专题ID</code></li>
          </ul>
        </el-collapse-item>
      </el-collapse>
    </el-card>
  </div>
</template>

<script>
import { getTags, getPages, sendCard } from '@/api/wework'
import { getToken } from '@/utils/auth'

export default {
  name: 'WeWorkPush',
  data() {
    return {
      pushForm: {
        tagId: '',
        title: '',
        mediaId: '',
        coverUrl: '',
        page: ''
      },
      rules: {
        tagId: [{ required: true, message: '请选择客户标签', trigger: 'change' }],
        title: [{ required: true, message: '请输入卡片标题', trigger: 'blur' }],
        mediaId: [{ required: true, message: '请上传封面图片', trigger: 'change' }],
        page: [{ required: true, message: '请选择跳转页面', trigger: 'change' }]
      },
      tagGroups: [],
      pageList: [],
      tagsLoading: false,
      tagsError: '',
      sending: false,
      uploadUrl: process.env.VUE_APP_BASE_API + '/admin/wework/uploadMedia'
    }
  },
  computed: {
    uploadHeaders() {
      return { 'X-Litemall-Admin-Token': getToken() }
    }
  },
  created() {
    this.loadTags()
    this.loadPages()
  },
  methods: {
    async loadTags() {
      this.tagsLoading = true
      this.tagsError = ''
      try {
        const res = await getTags()
        if (res.data.errno === 0) {
          // 按分组名组织标签
          const groupMap = {}
          ;(res.data.data.list || []).forEach(tag => {
            const groupName = tag.groupName || '未分组'
            if (!groupMap[groupName]) {
              groupMap[groupName] = { name: groupName, tags: [] }
            }
            groupMap[groupName].tags.push(tag)
          })
          this.tagGroups = Object.values(groupMap)
          if (this.tagGroups.length === 0) {
            this.tagsError = '暂无客户标签，请先在企业微信管理后台创建标签'
          }
        } else {
          this.tagsError = res.data.errmsg || '获取标签失败'
        }
      } catch (e) {
        this.tagsError = '获取标签失败，请检查企业微信配置'
      } finally {
        this.tagsLoading = false
      }
    },
    async loadPages() {
      try {
        const res = await getPages()
        if (res.data.errno === 0) {
          this.pageList = res.data.data.list || []
        }
      } catch (e) {
        console.error('获取页面列表失败', e)
      }
    },
    beforeUpload(file) {
      const isImage = file.type.startsWith('image/')
      const isLt20M = file.size / 1024 / 1024 < 20
      if (!isImage) {
        this.$message.error('只能上传图片文件')
        return false
      }
      if (!isLt20M) {
        this.$message.error('图片大小不能超过 20MB')
        return false
      }
      return true
    },
    handleUploadSuccess(response, file) {
      if (response.errno === 0) {
        this.pushForm.mediaId = response.data.mediaId
        this.pushForm.coverUrl = URL.createObjectURL(file.raw)
        this.$message.success('封面上传成功')
      } else {
        this.$message.error(response.errmsg || '上传失败')
      }
    },
    handleUploadError() {
      this.$message.error('上传失败，请重试')
    },
    handleSend() {
      this.$refs.pushForm.validate(async valid => {
        if (!valid) return
        this.doSend()
      })
    },
    async doSend() {
      this.sending = true
      try {
        const res = await sendCard({
          tagId: this.pushForm.tagId,
          title: this.pushForm.title,
          mediaId: this.pushForm.mediaId,
          page: this.pushForm.page
        })
        if (res.data.errno === 0) {
          this.$notify.success({ title: '成功', message: '小程序卡片已发送' })
        } else {
          this.$notify.error({ title: '失败', message: res.data.errmsg || '发送失败' })
        }
      } catch (e) {
        this.$notify.error({ title: '失败', message: '发送失败，请检查配置' })
      } finally {
        this.sending = false
      }
    },
    resetForm() {
      this.pushForm = { tagId: '', title: '', mediaId: '', coverUrl: '', page: '' }
      this.$refs.pushForm.resetFields()
    }
  }
}
</script>

<style scoped>
.input-width {
  width: 350px;
}
.form-tip {
  margin-top: 5px;
  color: #909399;
  font-size: 12px;
}
.error-tip {
  color: #f56c6c;
  font-size: 12px;
  margin-top: 5px;
}
.cover-uploader {
  display: inline-block;
}
.cover-uploader >>> .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  overflow: hidden;
}
.cover-uploader >>> .el-upload:hover {
  border-color: #409EFF;
}
.cover-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 180px;
  height: 144px;
  line-height: 144px;
  text-align: center;
}
.cover-image {
  width: 180px;
  height: 144px;
  display: block;
  object-fit: cover;
}
.upload-success {
  margin-top: 8px;
  color: #67c23a;
  font-size: 13px;
}
.help-card {
  margin-top: 20px;
}
.help-card ol,
.help-card ul {
  padding-left: 20px;
  line-height: 1.8;
}
.help-card code {
  background: #f5f5f5;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 12px;
}
</style>
