const util = require('../../../utils/util.js');
const api = require('../../../config/api.js');

const app = getApp();

Page({
  data: {
    userInfo: {},
    isManager: false,
    userRole: 'user',
    pendingOrderCount: 0,
    aftersaleCount: 0,
    pendingGoodsCount: 0,
    recentOrders: []
  },

  onLoad() {
    this.checkManagerRole();
    this.getManagerStats();
  },

  onShow() {
    this.checkManagerRole();
    this.getManagerStats();
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
          wx.showToast({ title: '无管理权限', icon: 'none' });
          setTimeout(function() {
            wx.switchTab({ url: '/pages/mine/mine' });
          }, 1500);
        }
      }
    }).catch(function() {
      wx.showToast({ title: '请先登录', icon: 'none' });
      setTimeout(function() {
        wx.switchTab({ url: '/pages/mine/mine' });
      }, 1500);
    });
  },

  getManagerStats() {
    let that = this;
    // 使用新的 stats 接口
    util.request(api.ManagerStats).then(function(res) {
      if (res.errno === 0) {
        const data = res.data;
        that.setData({
          pendingOrderCount: data.pendingOrderCount || 0,
          aftersaleCount: data.aftersaleCount || 0,
          pendingGoodsCount: data.pendingGoodsCount || 0,
          recentOrders: data.recentOrders || []
        });
      }
    });

    // 兼容：如果 stats 接口不存在，仍从旧接口获取
    const drafts = wx.getStorageSync('skuDrafts') || [];
    that.setData({ draftCount: drafts.length });
  },

  // 跳转订单列表
  goOrderList(e) {
    const type = e.currentTarget.dataset.type || 'pending';
    wx.navigateTo({
      url: '/pages/manager/order/order?type=' + type
    });
  },

  // 跳转商品列表
  goGoodsList() {
    wx.navigateTo({
      url: '/pages/manager/goods/goods'
    });
  },

  // 跳转草稿箱
  goDraftList() {
    wx.navigateTo({
      url: '/pages/manager/draftList/draftList'
    });
  },

  // 跳转订单详情
  goOrderDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/manager/orderDetail/orderDetail?id=' + id
    });
  },

  // 换季下架
  handleUnpublishAll() {
    wx.showModal({
      title: '换季下架',
      content: '确定要下架全部商品吗？下架后顾客将无法看到任何商品。',
      confirmText: '确认下架',
      confirmColor: '#E6A23C',
      success: function(res) {
        if (res.confirm) {
          wx.showLoading({ title: '下架中...' });
          util.request(api.ManagerGoodsUnpublishAll, {}, 'POST').then(function(res) {
            wx.hideLoading();
            if (res.errno === 0) {
              wx.showToast({ title: '下架成功', icon: 'success' });
            } else {
              wx.showToast({ title: res.errmsg || '下架失败', icon: 'none' });
            }
          }).catch(function() {
            wx.hideLoading();
            wx.showToast({ title: '网络错误', icon: 'none' });
          });
        }
      }
    });
  }
});
