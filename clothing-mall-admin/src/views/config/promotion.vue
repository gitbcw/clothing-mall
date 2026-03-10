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
      <el-form-item label="推送目标类型" prop="litemall_wework_push_target_type">
        <el-radio-group v-model="dataForm.litemall_wework_push_target_type">
          <el-radio label="0">全部客户</el-radio>
          <el-radio label="1">按标签筛选</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="dataForm.litemall_wework_push_target_type === '1'" label="推送目标标签ID" prop="litemall_wework_push_tag_id">
        <el-input v-model="dataForm.litemall_wework_push_tag_id" class="input-width" placeholder="请输入标签ID" />
      </el-form-item>
      <el-form-item label="发送者账号ID" prop="litemall_wework_sender_id">
        <el-input v-model="dataForm.litemall_wework_sender_id" class="input-width" placeholder="请输入发送者的企业微信账号" />
        <span class="info">用于标识消息发送者</span>
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
        litemall_wework_push_target_type: '1',
        litemall_wework_push_tag_id: '',
        litemall_wework_sender_id: ''
      },
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
      })
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
</style>
