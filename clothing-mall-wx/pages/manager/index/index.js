const util = require('../../../utils/util.js');
const api = require('../../../config/api.js');

const app = getApp();

Page({
  data: {
    userInfo: {},
    isManager: false,
    userRole: 'user',
    orderStats: {
      unpaid: 0,
      unship: 0,
      unrecv: 0,
      aftersale: 0
    },
    draftCount: 0
  },

  onLoad() {
    this.checkManagerRole();
    this.getOrderStats();
  },

  onShow() {
    this.checkManagerRole();
    this.getOrderStats();
  },

  checkManagerRole() {
    let that = this;
    util.request(api.UserIsManager).then(function(res) {
      if (res.errno === 0) {
        that.setData({
          isManager: res.data.isManager,
          userRole: res.data.role
        });
        if (!res.data.isManager) {
          wx.showToast({
            title: '无管理权限',
            icon: 'none'
          });
          setTimeout(() => {
            wx.switchTab({
              url: '/pages/mine/mine'
            });
          }, 1500);
        }
      }
    }).catch(function() {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      setTimeout(() => {
        wx.switchTab({
          url: '/pages/mine/mine'
        });
      }, 1500);
    });
  },

  getOrderStats() {
    let that = this;
    // 获取待付款订单数
    util.request(api.OrderList, { showType: 1, page: 1, limit: 1 }).then(function(res) {
      if (res.errno === 0) {
        that.setData({
          'orderStats.unpaid': res.data.total || 0
        });
      }
    });
    // 获取待发货订单数
    util.request(api.OrderList, { showType: 2, page: 1, limit: 1 }).then(function(res) {
      if (res.errno === 0) {
        that.setData({
          'orderStats.unship': res.data.total || 0
        });
      }
    });
    // 获取待收货订单数
    util.request(api.OrderList, { showType: 3, page: 1, limit: 1 }).then(function(res) {
      if (res.errno === 0) {
        that.setData({
          'orderStats.unrecv': res.data.total || 0
        });
      }
    });
    // 获取售后订单数
    util.request(api.AftersaleList, { status: 0, page: 1, limit: 1 }).then(function(res) {
      if (res.errno === 0) {
        that.setData({
          'orderStats.aftersale': res.data.total || 0
        });
      }
    });
  },

  goOrderList(e) {
    const type = e.currentTarget.dataset.type;
    wx.navigateTo({
      url: '/pages/manager/order/order?type=' + type
    });
  },

  // 快速上架 - 拍照/选图
  goQuickUpload() {
    wx.navigateTo({
      url: '/pages/manager/upload/upload'
    });
  },

  goAftersaleList() {
    wx.navigateTo({
      url: '/pages/manager/order/order?type=aftersale'
    });
  },

  // SKU 列表
  goSkuList() {
    wx.navigateTo({
      url: '/pages/manager/skuList/skuList'
    });
  },

  // 草稿箱
  goDraftList() {
    wx.navigateTo({
      url: '/pages/manager/draftList/draftList'
    });
  },

  // 商品列表
  goGoodsList() {
    wx.showToast({
      title: '请在 Web 端管理',
      icon: 'none'
    });
  }
})
