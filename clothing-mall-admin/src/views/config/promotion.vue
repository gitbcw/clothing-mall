<template>
  <div class="app-container">
    <el-form ref="dataForm" :rules="rules" :model="dataForm" status-icon label-width="300px">
      <el-divider content-position="left">新人优惠</el-divider>
      <el-form-item label="首单立减金额" prop="litemall_newuser_first_order_discount">
        <el-input v-model="dataForm.litemall_newuser_first_order_discount" class="input-width">
          <template slot="append">元</template>
        </el-input>
        <span class="info">新用户首单可享受的立减金额，设为0则不启用</span>
      </el-form-item>

      <el-divider content-position="left">生日优惠券</el-divider>
      <el-form-item label="启用生日券" prop="litemall_birthday_coupon_status">
        <el-switch v-model="birthdayCouponEnabled" active-value="1" inactive-value="0" />
      </el-form-item>
      <el-form-item label="生日券模板ID" prop="litemall_birthday_coupon_id">
        <el-select v-model="dataForm.litemall_birthday_coupon_id" placeholder="请选择优惠券模板" class="input-width" :disabled="!birthdayCouponEnabled">
          <el-option v-for="item in couponList" :key="item.id" :label="item.name + ' (满' + item.min + '减' + item.discount + ')'" :value="String(item.id)" />
        </el-select>
        <span class="info">用户生日当天自动发放的优惠券</span>
      </el-form-item>
      <el-form-item label="生日券有效期" prop="litemall_birthday_coupon_days">
        <el-input v-model="dataForm.litemall_birthday_coupon_days" class="input-width" :disabled="!birthdayCouponEnabled">
          <template slot="append">天</template>
        </el-input>
        <span class="info">生日券发放后的有效天数</span>
      </el-form-item>

      <el-divider content-position="left">满减活动</el-divider>
      <el-form-item label="满减与优惠券叠加" prop="litemall_full_reduction_stack_with_coupon">
        <el-switch v-model="fullReductionStack" active-value="1" inactive-value="0" />
        <span class="info">开启后，满减优惠可与优惠券同时使用</span>
      </el-form-item>

      <el-divider content-position="left">企业微信推送</el-divider>
      <el-form-item label="企业ID" prop="litemall_wework_corp_id">
        <el-input v-model="dataForm.litemall_wework_corp_id" class="input-width" placeholder="请输入企业微信企业ID" />
      </el-form-item>
      <el-form-item label="客户联系Secret" prop="litemall_wework_contact_secret">
        <el-input v-model="dataForm.litemall_wework_contact_secret" class="input-width" placeholder="请输入客户联系Secret" show-password />
      </el-form-item>
      <el-form-item label="发送者账号ID" prop="litemall_wework_sender_id">
        <el-input v-model="dataForm.litemall_wework_sender_id" class="input-width" placeholder="请输入发送者的企业微信账号" />
        <span class="info">用于标识消息发送者</span>
      </el-form-item>
      <el-form-item label="小程序AppID" prop="litemall_wework_miniprogram_appid">
        <el-input v-model="dataForm.litemall_wework_miniprogram_appid" class="input-width" placeholder="请输入关联的小程序AppID" />
        <span class="info">在企业微信管理后台关联的小程序AppID，用于发送小程序卡片</span>
      </el-form-item>

      <!-- 活动页面配置 -->
      <el-form-item label="活动页面配置" prop="litemall_wework_activity_pages">
        <div class="activity-pages-config">
          <div v-for="(page, index) in activityPages" :key="index" class="activity-page-item">
            <el-input v-model="page.name" placeholder="页面名称" style="width: 150px;" />
            <el-input v-model="page.path" placeholder="页面路径（如：pages/activity/spring）" style="width: 280px; margin-left: 10px;" />
            <el-button type="danger" icon="el-icon-delete" circle style="margin-left: 10px;" @click="removeActivityPage(index)" />
          </div>
          <el-button type="primary" plain icon="el-icon-plus" @click="addActivityPage">添加活动页面</el-button>
        </div>
        <div class="info" style="margin-top: 8px;">配置后可在「企业微信 → 消息推送」中选择跳转到这些活动页面</div>
      </el-form-item>

      <el-divider content-position="left">小程序客服</el-divider>
      <el-form-item label="企业微信客服链接" prop="litemall_customer_service_url">
        <el-input v-model="dataForm.litemall_customer_service_url" class="input-width" placeholder="请输入企业微信客服链接" />
        <span class="info">小程序点击"联系客服"时跳转的链接，格式如：https://work.weixin.qq.com/kfid/xxxxx</span>
      </el-form-item>

      <el-divider content-position="left">首页活动位</el-divider>
      <el-form-item label="启用活动位" prop="litemall_home_activity_enabled">
        <el-switch v-model="homeActivityEnabled" active-value="true" inactive-value="false" />
        <span class="info">开启后，小程序首页轮播图下方将显示活动位</span>
      </el-form-item>
      <el-form-item label="活动名称" prop="litemall_home_activity_name">
        <el-input v-model="dataForm.litemall_home_activity_name" class="input-width" placeholder="如：每周上新、新品上市、热销推荐" :disabled="!homeActivityEnabledBoolean" />
        <span class="info">显示在活动位左上角的名称</span>
      </el-form-item>
      <el-form-item label="活动类型" prop="litemall_home_activity_type">
        <el-radio-group v-model="dataForm.litemall_home_activity_type" :disabled="!homeActivityEnabledBoolean">
          <el-radio label="new">新品商品</el-radio>
          <el-radio label="hot">热门商品</el-radio>
        </el-radio-group>
        <span class="info">选择展示哪种类型的商品（展示5件）</span>
      </el-form-item>
      <el-form-item label="查看更多跳转" prop="litemall_home_activity_more_url">
        <el-input v-model="dataForm.litemall_home_activity_more_url" class="input-width" placeholder="如：/pages/newGoods/newGoods" :disabled="!homeActivityEnabledBoolean" />
        <span class="info">点击"查看更多"跳转的页面路径</span>
      </el-form-item>

      <el-form-item>
        <el-button @click="cancel">取消</el-button>
        <el-button type="primary" @click="update">确定</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { listPromotion, updatePromotion } from '@/api/config'
import { listCoupon } from '@/api/coupon'

export default {
  name: 'ConfigPromotion',
  data() {
    return {
      dataForm: {
        litemall_newuser_first_order_discount: '0',
        litemall_birthday_coupon_status: '0',
        litemall_birthday_coupon_id: '',
        litemall_birthday_coupon_days: '30',
        litemall_full_reduction_stack_with_coupon: '0',
        litemall_wework_corp_id: '',
        litemall_wework_contact_secret: '',
        litemall_wework_sender_id: '',
        litemall_wework_miniprogram_appid: '',
        litemall_wework_activity_pages: '',
        litemall_customer_service_url: '',
        litemall_home_activity_enabled: 'false',
        litemall_home_activity_name: '',
        litemall_home_activity_type: 'new',
        litemall_home_activity_more_url: '/pages/newGoods/newGoods'
      },
      activityPages: [],
      couponList: [],
      rules: {}
    }
  },
  computed: {
    birthdayCouponEnabled: {
      get() {
        return this.dataForm.litemall_birthday_coupon_status
      },
      set(val) {
        this.dataForm.litemall_birthday_coupon_status = val
      }
    },
    fullReductionStack: {
      get() {
        return this.dataForm.litemall_full_reduction_stack_with_coupon
      },
      set(val) {
        this.dataForm.litemall_full_reduction_stack_with_coupon = val
      }
    },
    homeActivityEnabled: {
      get() {
        return this.dataForm.litemall_home_activity_enabled
      },
      set(val) {
        this.dataForm.litemall_home_activity_enabled = val
      }
    },
    homeActivityEnabledBoolean() {
      return this.dataForm.litemall_home_activity_enabled === 'true'
    }
  },
  created() {
    this.init()
    this.loadCouponList()
  },
  methods: {
    init() {
      listPromotion().then(response => {
        const data = response.data.data
        // 合并默认值和返回数据
        this.dataForm = { ...this.dataForm, ...data }
        // 解析活动页面 JSON
        this.parseActivityPages()
      })
    },
    parseActivityPages() {
      try {
        const json = this.dataForm.litemall_wework_activity_pages
        if (json && json.trim()) {
          this.activityPages = JSON.parse(json)
        } else {
          this.activityPages = []
        }
      } catch (e) {
        this.activityPages = []
      }
    },
    serializeActivityPages() {
      if (this.activityPages.length > 0) {
        this.dataForm.litemall_wework_activity_pages = JSON.stringify(this.activityPages)
      } else {
        this.dataForm.litemall_wework_activity_pages = ''
      }
    },
    addActivityPage() {
      this.activityPages.push({ name: '', path: '' })
    },
    removeActivityPage(index) {
      this.activityPages.splice(index, 1)
    },
    loadCouponList() {
      listCoupon({ page: 1, limit: 100 }).then(response => {
        this.couponList = response.data.data.list || []
      })
    },
    cancel() {
      this.init()
    },
    update() {
      this.$refs['dataForm'].validate((valid) => {
        if (!valid) {
          return false
        }
        this.doUpdate()
      })
    },
    doUpdate() {
      // 序列化活动页面配置
      this.serializeActivityPages()
      updatePromotion(this.dataForm)
        .then(response => {
          this.$notify.success({
            title: '成功',
            message: '促销配置成功'
          })
        })
        .catch(response => {
          this.$notify.error({
            title: '失败',
            message: response.data.errmsg
          })
        })
    }
  }
}
</script>

<style scoped>
.input-width {
  width: 300px;
}
.info {
  margin-left: 15px;
  color: #909399;
  font-size: 12px;
}
.el-divider--horizontal {
  margin: 24px 0 16px;
}
.activity-pages-config {
  max-width: 600px;
}
.activity-page-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
</style>
