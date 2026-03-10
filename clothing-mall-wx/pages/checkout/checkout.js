var util = require('../../utils/util.js');
var api = require('../../config/api.js');

var app = getApp();

Page({
  data: {
    checkedGoodsList: [],
    checkedAddress: {},
    availableCouponLength: 0, // 可用的优惠券数量
    goodsTotalPrice: 0.00, //商品总价
    freightPrice: 0.00, //快递费
    couponPrice: 0.00, //优惠券的价格
    orderTotalPrice: 0.00, //订单总价
    actualPrice: 0.00, //实际需要支付的总价
    cartId: 0,
    addressId: 0,
    couponId: 0,
    userCouponId: 0,
    message: ''

    // 配送方式相关
    deliveryType: 'express', // express 快递 / pickup 自提
    storeList: [],
    selectedStore: null,
    pickupContact: '',
    pickupPhone: ''
  },
  onLoad: function(options) {
    // 页面初始化 options为页面跳转所带来的参数
  },

  //获取checkou信息
  getCheckoutInfo: function() {
    let that = this;
    util.request(api.CartCheckout, {
      cartId: that.data.cartId,
      addressId: that.data.addressId,
      couponId: that.data.couponId,
      userCouponId: that.data.userCouponId
    }).then(function(res) {
      if (res.errno === 0) {
        that.setData({
          checkedGoodsList: res.data.checkedGoodsList,
          checkedAddress: res.data.checkedAddress,
          availableCouponLength: res.data.availableCouponLength,
          actualPrice: res.data.actualPrice,
          couponPrice: res.data.couponPrice,
          freightPrice: res.data.freightPrice,
          goodsTotalPrice: res.data.goodsTotalPrice,
          orderTotalPrice: res.data.orderTotalPrice,
          addressId: res.data.addressId,
          couponId: res.data.couponId,
          userCouponId: res.data.userCouponId,
        });
      }
      wx.hideLoading();
    });
  },
  selectAddress() {
    wx.navigateTo({
      url: '/pages/ucenter/address/address',
    })
  },
  selectCoupon() {
    wx.navigateTo({
      url: '/pages/ucenter/couponSelect/couponSelect',
    })
  },
  bindMessageInput: function(e) {
    this.setData({
      message: e.detail.value
    });
  },

  // 选择配送方式
  selectDeliveryType: function(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({
      deliveryType: type,
      // 切换到自提时运费为0
      freightPrice: type === 'pickup' ? 0 : this.data.freightPrice
    });
    this.recalculatePrice();
  },

  // 选择门店
  selectStore: function() {
    let that = this;
    // 获取门店列表
    util.request(api.ClothingStoreList).then(function(res) {
      if (res.errno === 0 && res.data) {
        that.setData({ storeList: res.data });
        // 显示门店选择弹窗
        wx.showActionSheet({
          itemList: res.data.map(s => s.name + ' - ' + s.address),
          success: function(res) {
            const store = that.data.storeList[res.tapIndex];
            that.setData({ selectedStore: store });
          }
        });
      }
    });
  },

  // 输入自提联系人
  inputPickupContact: function(e) {
    this.setData({ pickupContact: e.detail.value });
  },

  // 输入自提手机号
  inputPickupPhone: function(e) {
    this.setData({ pickupPhone: e.detail.value });
  },

  // 重新计算价格
  recalculatePrice: function() {
    let freightPrice = this.data.deliveryType === 'pickup' ? 0 : this.data.freightPrice;
    let actualPrice = this.data.goodsTotalPrice + freightPrice - this.data.couponPrice;
    this.setData({
      freightPrice: freightPrice,
      actualPrice: actualPrice > 0 ? actualPrice : 0
    });
  },

  onReady: function() {
    // 页面渲染完成

  },
  onShow: function() {
    // 页面显示
    wx.showLoading({
      title: '加载中...',
    });
    try {
      var cartId = wx.getStorageSync('cartId');
      if (cartId === "") {
        cartId = 0;
      }
      var addressId = wx.getStorageSync('addressId');
      if (addressId === "") {
        addressId = 0;
      }
      var couponId = wx.getStorageSync('couponId');
      if (couponId === "") {
        couponId = 0;
      }
      var userCouponId = wx.getStorageSync('userCouponId');
      if (userCouponId === "") {
        userCouponId = 0;
      }

      this.setData({
        cartId: cartId,
        addressId: addressId,
        couponId: couponId,
        userCouponId: userCouponId
      });

    } catch (e) {
      // Do something when catch error
      console.log(e);
    }

    this.getCheckoutInfo();
  },
  onHide: function() {
    // 页面隐藏

  },
  onUnload: function() {
    // 页面关闭

  },
  submitOrder: function() {
    // 验证
    if (this.data.deliveryType === 'express') {
      if (this.data.addressId <= 0) {
        util.showErrorToast('请选择收货地址');
        return false;
      }
    } else if (this.data.deliveryType === 'pickup') {
      if (!this.data.selectedStore) {
        util.showErrorToast('请选择自提门店');
        return false;
      }
      if (!this.data.pickupContact) {
        util.showErrorToast('请输入联系人姓名');
        return false;
      }
      if (!this.data.pickupPhone || !/^1[3-9]\d{9}$/.test(this.data.pickupPhone)) {
        util.showErrorToast('请输入正确的手机号');
        return false;
      }
    }

    let params = {
      cartId: this.data.cartId,
      addressId: this.data.addressId,
      couponId: this.data.couponId,
      userCouponId: this.data.userCouponId,
      message: this.data.message,
      // 配送方式
      deliveryType: this.data.deliveryType
    };

    // 自提信息
    if (this.data.deliveryType === 'pickup') {
      params.pickupStoreId = this.data.selectedStore.id;
      params.pickupContact = this.data.pickupContact;
      params.pickupPhone = this.data.pickupPhone;
    }

    util.request(api.OrderSubmit, params, 'POST').then(res => {
      if (res.errno === 0) {

        // 下单成功，重置couponId
        try {
          wx.setStorageSync('couponId', 0);
        } catch (error) {

        }

        const orderId = res.data.orderId;
        const payed = res.data.payed
        if (payed) {
          wx.redirectTo({
            url: '/pages/payResult/payResult?status=1&orderId=' + orderId
          });
          return
        }
        util.request(api.OrderPrepay, {
          orderId: orderId
        }, 'POST').then(function(res) {
          if (res.errno === 0) {
            const payParam = res.data;
            console.log("支付过程开始");
            wx.requestPayment({
              'timeStamp': payParam.timeStamp,
              'nonceStr': payParam.nonceStr,
              'package': payParam.packageValue,
              'signType': payParam.signType,
              'paySign': payParam.paySign,
              'success': function(res) {
                console.log("支付过程成功");
                wx.redirectTo({
                  url: '/pages/payResult/payResult?status=1&orderId=' + orderId
                });
              },
              'fail': function(res) {
                console.log("支付过程失败");
                wx.redirectTo({
                  url: '/pages/payResult/payResult?status=0&orderId=' + orderId
                });
              },
              'complete': function(res) {
                console.log("支付过程结束")
              }
            });
          } else {
            wx.redirectTo({
              url: '/pages/payResult/payResult?status=0&orderId=' + orderId
            });
          }
        });

      } else {
        util.showErrorToast(res.errmsg);
      }
    });
  }
});