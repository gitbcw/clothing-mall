const util = require('../../utils/util.js');
const api = require('../../config/api.js');
const tracker = require('../../utils/tracker.js');

const app = getApp();

Page({
  data: {
    statusBarHeight: 20,
    navBarHeight: 44,

    // 商品列表
    checkedGoodsList: [],
    // 地址
    checkedAddress: {},
    // 价格信息
    goodsTotalPrice: 0.00,
    freightPrice: 0.00,
    couponPrice: 0.00,
    orderTotalPrice: 0.00,
    actualPrice: 0.00,
    // 优惠券
    availableCouponLength: 0,
    // 其他
    cartId: 0,
    addressId: 0,
    couponId: 0,
    userCouponId: 0,
    message: '',
    submitting: false,
    defaultImage: '/static/images/fallback-image.svg'
  },

  onLoad() {
    const sysInfo = wx.getSystemInfoSync()
    const isIOS = sysInfo.system.indexOf('iOS') > -1
    this.setData({
      statusBarHeight: sysInfo.statusBarHeight,
      navBarHeight: isIOS ? 44 : 48
    })
  },

  onShow() {
    wx.showLoading({ title: '加载中...' })

    // 获取存储的 cartId, addressId, couponId
    try {
      let cartId = wx.getStorageSync('cartId') || 0
      let addressId = wx.getStorageSync('addressId') || 0
      let couponId = wx.getStorageSync('couponId') || 0
      let userCouponId = wx.getStorageSync('userCouponId') || 0

      this.setData({
        cartId,
        addressId,
        couponId,
        userCouponId
      })
    } catch (e) {
      console.error(e)
    }

    this.getCheckoutInfo()
  },

  // 获取结算信息
  getCheckoutInfo() {
    let that = this
    util.request(api.CartCheckout, {
      cartId: that.data.cartId,
      addressId: that.data.addressId,
      couponId: that.data.couponId,
      userCouponId: that.data.userCouponId
    }).then(function(res) {
      if (res.errno === 0) {
        that.setData({
          checkedGoodsList: res.data.checkedGoodsList || [],
          checkedAddress: res.data.checkedAddress || {},
          availableCouponLength: res.data.availableCouponLength || 0,
          actualPrice: res.data.actualPrice || 0,
          couponPrice: res.data.couponPrice || 0,
          freightPrice: res.data.freightPrice || 0,
          goodsTotalPrice: res.data.goodsTotalPrice || 0,
          orderTotalPrice: res.data.orderTotalPrice || 0,
          addressId: res.data.addressId || 0,
          couponId: res.data.couponId || 0,
          userCouponId: res.data.userCouponId || 0
        })
      }
      wx.hideLoading()
    }).catch(function() {
      wx.hideLoading()
      wx.showToast({ title: '加载失败', icon: 'none' })
    })
  },

  // 选择地址
  selectAddress() {
    wx.navigateTo({
      url: '/pages/ucenter/address/address?selectMode=1'
    })
  },

  // 选择优惠券
  selectCoupon() {
    wx.navigateTo({
      url: '/pages/ucenter/couponSelect/couponSelect'
    })
  },

  // 输入留言
  bindMessageInput(e) {
    this.setData({
      message: e.detail.value
    })
  },

  onConfirmOrderImageError(e) {
    const index = e.currentTarget.dataset.index
    const list = this.data.checkedGoodsList || []
    if (list[index] && list[index].picUrl !== this.data.defaultImage) {
      this.setData({
        [`checkedGoodsList[${index}].picUrl`]: this.data.defaultImage
      })
    }
  },

  // 提交订单
  submitOrder() {
    let that = this
    if (that.data.submitting) {
      return
    }

    if (!this.data.checkedAddress || !this.data.checkedAddress.id) {
      wx.showToast({ title: '请选择收货地址', icon: 'none' })
      return
    }

    that.setData({ submitting: true })
    wx.showLoading({ title: '提交中...' })

    util.request(api.OrderSubmit, {
      cartId: that.data.cartId,
      addressId: that.data.addressId,
      couponId: that.data.couponId,
      userCouponId: that.data.userCouponId,
      message: that.data.message
    }, 'POST').then(function(res) {
      if (res.errno === 0) {
        const orderId = res.data.orderId
        tracker.trackOrderCreate(res.data.orderId, that.data.actualPrice, (that.data.checkedGoodsList || []).length)
        wx.removeStorageSync('cartId')
        wx.removeStorageSync('addressId')
        wx.removeStorageSync('couponId')
        wx.removeStorageSync('userCouponId')
        util.request(api.OrderPrepay, {
          orderId: orderId
        }, 'POST').then(function(prepayRes) {
          if (prepayRes.errno === 0) {
            const payParam = prepayRes.data
            wx.hideLoading()
            wx.requestPayment({
              timeStamp: payParam.timeStamp,
              nonceStr: payParam.nonceStr,
              package: payParam.packageValue,
              signType: payParam.signType,
              paySign: payParam.paySign,
              success: function() {
                wx.redirectTo({
                  url: '/pages/payResult/payResult?status=1&orderId=' + orderId
                })
              },
              fail: function() {
                that.setData({ submitting: false })
                wx.redirectTo({
                  url: '/pages/payResult/payResult?status=0&orderId=' + orderId
                })
              }
            })
          } else {
            that.setData({ submitting: false })
            wx.hideLoading()
            wx.showToast({ title: prepayRes.errmsg || '拉起支付失败', icon: 'none' })
            wx.redirectTo({
              url: '/pages/payResult/payResult?status=0&orderId=' + orderId
            })
          }
        }).catch(function() {
          that.setData({ submitting: false })
          wx.hideLoading()
          wx.showToast({ title: '拉起支付失败', icon: 'none' })
          wx.redirectTo({
            url: '/pages/payResult/payResult?status=0&orderId=' + orderId
          })
        })
      } else {
        that.setData({ submitting: false })
        wx.hideLoading()
        wx.showToast({ title: res.errmsg || '下单失败', icon: 'none' })
      }
    }).catch(function() {
      that.setData({ submitting: false })
      wx.hideLoading()
      wx.showToast({ title: '网络错误', icon: 'none' })
    })
  },

  // 返回
  goBack() {
    wx.navigateBack({
      fail: () => {
        wx.switchTab({ url: '/pages/index/index' })
      }
    })
  }
})
