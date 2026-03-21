<template>
  <div class="app-container">

    <el-card class="box-card">
      <h3>{{ $t('goods_edit.section.goods') }}</h3>
      <el-form ref="goods" :rules="rules" :model="goods" label-width="150px">
        <el-form-item :label="$t('goods_edit.form.goods_sn')" prop="goodsSn">
          <el-input v-model="goods.goodsSn" style="width: 300px" />
        </el-form-item>
        <el-form-item :label="$t('goods_edit.form.name')" prop="name">
          <el-input v-model="goods.name" style="width: 300px" />
        </el-form-item>
        <el-form-item :label="$t('goods_edit.form.counter_price')" prop="counterPrice">
          <el-input v-model="goods.counterPrice" placeholder="0.00" style="width: 300px">
            <template slot="append">元</template>
          </el-input>
          <span class="form-tip">（小程序显示为划线原价，非实际售价）</span>
        </el-form-item>
        <el-form-item :label="$t('goods_edit.form.is_new')" prop="isNew">
          <el-radio-group v-model="goods.isNew">
            <el-radio :label="true">{{ $t('goods_edit.value.is_new_true') }}</el-radio>
            <el-radio :label="false">{{ $t('goods_edit.value.is_new_false') }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="$t('goods_edit.form.is_hot')" prop="isHot">
          <el-radio-group v-model="goods.isHot">
            <el-radio :label="false">{{ $t('goods_edit.value.is_hot_false') }}</el-radio>
            <el-radio :label="true">{{ $t('goods_edit.value.is_hot_true') }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="$t('goods_edit.form.is_on_sale')" prop="isOnSale">
          <el-radio-group v-model="goods.isOnSale">
            <el-radio :label="true">{{ $t('goods_edit.value.is_on_sale_true') }}</el-radio>
            <el-radio :label="false">{{ $t('goods_edit.value.is_on_sale_false') }}</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item :label="$t('goods_edit.form.pic_url')">
          <el-upload
            ref="picUpload"
            :action="uploadPath"
            :show-file-list="false"
            :headers="headers"
            :auto-upload="false"
            :on-change="handlePicChange"
            :on-success="uploadPicUrl"
            :on-error="uploadError"
            :http-request="httpUpload"
            class="avatar-uploader"
            accept=".jpg,.jpeg,.png,.gif"
          >
            <img v-if="goods.picUrl" :src="goods.picUrl" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon" />
          </el-upload>
        </el-form-item>

        <el-form-item :label="$t('goods_edit.form.gallery')">
          <el-upload
            :action="uploadPath"
            :limit="5"
            :headers="headers"
            :on-exceed="uploadOverrun"
            :on-success="handleGalleryUrl"
            :on-error="uploadError"
            :http-request="httpUpload"
            :on-remove="handleRemove"
            multiple
            accept=".jpg,.jpeg,.png,.gif"
            list-type="picture-card"
          >
            <i class="el-icon-plus" />
          </el-upload>
        </el-form-item>

        <el-form-item :label="$t('goods_edit.form.unit')">
          <el-input v-model="goods.unit" :placeholder="$t('goods_edit.placeholder.unit')" />
        </el-form-item>

        <el-form-item :label="$t('goods_edit.form.keywords')">
          <el-tag v-for="tag in keywords" :key="tag" closable type="primary" @close="handleClose(tag)">
            {{ tag }}
          </el-tag>
          <el-input
            v-if="newKeywordVisible"
            ref="newKeywordInput"
            v-model="newKeyword"
            class="input-new-keyword"

            @keyup.enter.native="handleInputConfirm"
            @blur="handleInputConfirm"
          />
          <el-button v-else class="button-new-keyword" type="primary" @click="showInput">{{ $t('app.button.add') }}</el-button>
        </el-form-item>

        <el-form-item :label="$t('goods_edit.form.category_id')">
          <el-select v-model="goods.categoryId" clearable>
            <el-option v-for="item in categoryList" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>

        <el-form-item :label="$t('goods_edit.form.brand_id')">
          <el-select v-model="goods.brandId" clearable>
            <el-option v-for="item in brandList" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>

        <el-form-item :label="$t('goods_edit.form.brief')">
          <el-input v-model="goods.brief" />
        </el-form-item>

        <el-form-item :label="$t('goods_edit.form.detail')">
          <editor v-model="goods.detail" :init="editorInit" />
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="box-card">
      <h3>SKU 信息</h3>
      <el-row :gutter="20" type="flex" align="middle" style="padding:20px 0;">
        <el-col :span="12">
          <el-input v-model="skuQueryGoodsSn" placeholder="输入商品款号查询已有SKU" style="width: 250px;" />
          <el-button type="primary" style="margin-left: 10px;" @click="loadSkuByGoodsSn">查询SKU</el-button>
          <span class="form-tip" style="margin-left: 10px;">SKU在【服装管理-SKU管理】中维护</span>
        </el-col>
      </el-row>
      <el-table v-if="skuList.length > 0" :data="skuList" border>
        <el-table-column align="center" label="SKU编码" prop="skuCode" width="120" />
        <el-table-column align="center" label="颜色" prop="color" width="100" />
        <el-table-column align="center" label="尺码" prop="size" width="80" />
        <el-table-column align="center" label="价格" prop="price" width="100" />
        <el-table-column align="center" label="库存" prop="stock" width="80" />
        <el-table-column align="center" label="条形码" prop="barCode" width="120" />
        <el-table-column align="center" label="默认" prop="isDefault" width="80">
          <template slot-scope="scope">
            <el-tag :type="scope.row.isDefault ? 'success' : 'info'">
              {{ scope.row.isDefault ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
      <div v-else-if="skuQueryGoodsSn && !skuLoading" style="padding: 20px; text-align: center; color: #909399;">
        该款号下暂无SKU，请到【服装管理-SKU管理】中添加
      </div>
    </el-card>

    <el-card class="box-card">
      <h3>{{ $t('goods_edit.section.attributes') }}</h3>
      <el-button type="primary" @click="handleAttributeShow">{{ $t('app.button.create') }}</el-button>
      <el-table :data="attributes">
        <el-table-column property="attribute" :label="$t('goods_edit.table.attribute_name')" />
        <el-table-column property="value" :label="$t('goods_edit.table.attribute_value')" />
        <el-table-column align="center" :label="$t('goods_edit.table.attribute_actions')" width="100" class-name="small-padding fixed-width">
          <template slot-scope="scope">
            <el-button type="danger" size="mini" @click="handleAttributeDelete(scope.row)">{{ $t('app.button.delete') }}</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-dialog :visible.sync="attributeVisiable" :title="$t('goods_edit.dialog.create_attribute')">
        <el-form
          ref="attributeForm"
          :model="attributeForm"
          status-icon
          label-position="left"
          label-width="100px"
          style="width: 400px; margin-left:50px;"
        >
          <el-form-item :label="$t('goods_edit.form.attribute_name')" prop="attribute">
            <el-input v-model="attributeForm.attribute" />
          </el-form-item>
          <el-form-item :label="$t('goods_edit.form.attribute_value')" prop="value">
            <el-input v-model="attributeForm.value" />
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="attributeVisiable = false">{{ $t('app.button.cancel') }}</el-button>
          <el-button type="primary" @click="handleAttributeAdd">{{ $t('app.button.confirm') }}</el-button>
        </div>
      </el-dialog>
    </el-card>

    <div class="op-container">
      <el-button @click="handleCancel">{{ $t('app.button.cancel') }}</el-button>
      <el-button type="primary" @click="handlePublish">{{ $t('goods_edit.button.publish') }}</el-button>
    </div>

  </div>
</template>

<style>
  .el-card {
    margin-bottom: 10px;
  }

  .el-tag + .el-tag {
    margin-left: 10px;
  }

  .input-new-keyword {
    width: 90px;
    margin-left: 10px;
    vertical-align: bottom;
  }

  .avatar-uploader .el-upload {
    width: 145px;
    height: 145px;
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
    object-fit: cover;
  }

  .form-tip {
    margin-left: 12px;
    color: #909399;
    font-size: 12px;
  }
</style>

<script>
import { publishGoods, listCatAndBrand } from '@/api/goods'
import { listSku } from '@/api/sku'
import { createStorage, uploadPath } from '@/api/storage'
import Editor from '@tinymce/tinymce-vue'
import { MessageBox } from 'element-ui'
import { getToken } from '@/utils/auth'

export default {
  name: 'GoodsCreate',
  components: { Editor },

  data() {
    return {
      uploadPath,
      newKeywordVisible: false,
      newKeyword: '',
      keywords: [],
      categoryList: [],
      brandList: [],
      goods: { picUrl: '', gallery: [], isHot: false, isNew: true, isOnSale: true },
      picFile: null, // 待上传的商品图片文件
      // SKU 查询相关
      skuQueryGoodsSn: '',
      skuList: [],
      skuLoading: false,
      attributeVisiable: false,
      attributeForm: { attribute: '', value: '' },
      attributes: [],
      rules: {
        goodsSn: [{ required: true, message: '商品款号不能为空', trigger: 'blur' }],
        name: [{ required: true, message: '商品名称不能为空', trigger: 'blur' }]
      },
      editorInit: {
        language: 'zh_CN',
        height: 500,
        convert_urls: false,
        plugins: ['advlist anchor autolink autosave code codesample colorpicker colorpicker contextmenu directionality emoticons fullscreen hr image imagetools importcss insertdatetime link lists media nonbreaking noneditable pagebreak paste preview print save searchreplace spellchecker tabfocus table template textcolor textpattern visualblocks visualchars wordcount'],
        toolbar: ['searchreplace bold italic underline strikethrough alignleft aligncenter alignright outdent indent  blockquote undo redo removeformat subscript superscript code codesample', 'hr bullist numlist link image charmap preview anchor pagebreak insertdatetime media table emoticons forecolor backcolor fullscreen'],
        images_upload_handler: function(blobInfo, success, failure) {
          const formData = new FormData()
          formData.append('file', blobInfo.blob())
          createStorage(formData).then(res => {
            success(res.data.data.url)
          }).catch(() => {
            failure('上传失败，请重新上传')
          })
        }
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
    this.init()
  },

  methods: {
    init: function() {
      listCatAndBrand().then(response => {
        this.categoryList = response.data.data.categoryList
        this.brandList = response.data.data.brandList
      })
    },
    handleCancel: function() {
      this.$store.dispatch('tagsView/delView', this.$route)
      this.$router.push({ path: '/goods/list' })
    },
    handlePublish: async function() {
      // 如果有待上传的商品图片，先上传
      if (this.picFile) {
        try {
          const formData = new FormData()
          formData.append('file', this.picFile)
          const uploadRes = await createStorage(formData)
          if (uploadRes.data.errno === 0) {
            this.goods.picUrl = uploadRes.data.data.url
          } else {
            this.$message.error('商品图片上传失败')
            return
          }
        } catch (e) {
          this.$message.error('商品图片上传失败')
          return
        }
      }

      const finalGoods = {
        goods: this.goods,
        specifications: [],
        products: [],
        attributes: this.attributes
      }
      publishGoods(finalGoods).then(response => {
        this.$notify.success({
          title: '成功',
          message: '创建成功'
        })
        this.$store.dispatch('tagsView/delView', this.$route)
        this.$router.push({ path: '/goods/list' })
      }).catch(error => {
        const errMsg = error?.response?.data?.errmsg || error?.message || '未知错误'
        MessageBox.alert('业务错误：' + errMsg, '警告', {
          confirmButtonText: '确定',
          type: 'error'
        })
      })
    },
    handleClose(tag) {
      this.keywords.splice(this.keywords.indexOf(tag), 1)
      this.goods.keywords = this.keywords.toString()
    },
    showInput() {
      this.newKeywordVisible = true
      this.$nextTick(_ => {
        this.$refs.newKeywordInput.$refs.input.focus()
      })
    },
    handleInputConfirm() {
      const newKeyword = this.newKeyword
      if (newKeyword) {
        this.keywords.push(newKeyword)
        this.goods.keywords = this.keywords.toString()
      }
      this.newKeywordVisible = false
      this.newKeyword = ''
    },
    handlePicChange: function(file) {
      // 选择文件时生成本地预览 URL，暂不上传
      if (file.raw) {
        this.picFile = file.raw
        this.goods.picUrl = URL.createObjectURL(file.raw)
      }
    },
    uploadPicUrl: function(response) {
      // 由于使用 auto-upload=false，此方法不会自动调用
      // 保留用于手动上传时的回调
      if (response && response.errno === 0 && response.data && response.data.url) {
        this.goods.picUrl = response.data.url
      } else {
        const msg = response && response.errmsg ? response.errmsg : '上传失败，请重新上传'
        this.$message({ type: 'error', message: msg })
      }
    },
    uploadOverrun: function() {
      this.$message({
        type: 'error',
        message: '上传文件个数超出限制!最多上传5张图片!'
      })
    },
    uploadError: function(err) {
      this.$message({
        type: 'error',
        message: '上传失败: ' + (err?.message || '未知错误')
      })
    },
    httpUpload: function() {
      // 由于使用 auto-upload=false，此方法不会被调用
      // 保留空实现以避免 Vue 警告
    },
    handleGalleryUrl(response, file, fileList) {
      if (response && response.errno === 0 && response.data && response.data.url) {
        this.goods.gallery.push(response.data.url)
      } else {
        const msg = response && response.errmsg ? response.errmsg : '上传失败，请重新上传'
        this.$message({ type: 'error', message: msg })
      }
    },
    handleRemove: function(file, fileList) {
      for (var i = 0; i < this.goods.gallery.length; i++) {
        // 这里存在两种情况
        // 1. 如果所删除图片是刚刚上传的图片，那么图片地址是file.response.data.url
        //    此时的file.url虽然存在，但是是本机地址，而不是远程地址。
        // 2. 如果所删除图片是后台返回的已有图片，那么图片地址是file.url
        var url
        if (file.response === undefined) {
          url = file.url
        } else {
          url = file.response.data.url
        }

        if (this.goods.gallery[i] === url) {
          this.goods.gallery.splice(i, 1)
        }
      }
    },
    // 根据款号加载SKU列表
    loadSkuByGoodsSn() {
      if (!this.skuQueryGoodsSn || !this.skuQueryGoodsSn.trim()) {
        this.$message.warning('请输入商品款号')
        return
      }
      this.skuLoading = true
      listSku({ goodsSn: this.skuQueryGoodsSn.trim() }).then(response => {
        this.skuList = response.data.data || []
        if (this.skuList.length === 0) {
          this.$message.info('该款号下暂无SKU')
        }
      }).catch(() => {
        this.$message.error('查询失败')
        this.skuList = []
      }).finally(() => {
        this.skuLoading = false
      })
    },
    handleAttributeShow() {
      this.attributeForm = {}
      this.attributeVisiable = true
    },
    handleAttributeAdd() {
      this.attributes.unshift(this.attributeForm)
      this.attributeVisiable = false
    },
    handleAttributeDelete(row) {
      const index = this.attributes.indexOf(row)
      this.attributes.splice(index, 1)
    }
  }
}
</script>
