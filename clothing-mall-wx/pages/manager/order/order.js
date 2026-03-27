const util = require('../../../utils/util.js');
const api = require('../../../config/api.js');

Page({
  data: {
    type: 'pending',
    orderList: [],
    page: 1,
    limit: 10,
    total: 0,
    loading: false,
    pendingCount: 0,
    aftersaleCount: 0,
    completedCount: 0
  },

  onLoad(options) {
    this.setData({ type: options.type || 'pending' });
  },

  onShow() {
    this.refreshList();
  },

  onPullDownRefresh() {
    this.refreshList();
    wx.stopPullDownRefresh();
  },

  onReachBottom() {
    if (this.data.orderList.length < this.data.total) {
      this.setData({ page: this.data.page + 1 });
      this.getOrderList();
    }
  },

  refreshList() {
    this.setData({ page: 1, orderList: [] });
    this.getOrderList();
  },

  getOrderList() {
    if (this.data.loading) return;
    let that = this;
    this.setData({ loading: true });

    util.request(api.ManagerOrderList, {
      status: this.data.type,
      page: this.data.page,
      limit: this.data.limit
    }).then(function(res) {
      if (res.errno === 0) {
        const data = res.data;
        let newList = data.list || [];

        // 处理商品数量统计
        newList.forEach(function(order) {
          let count = 0;
          if (order.goodsList) {
            order.goodsList.forEach(function(g) {
              count += (g.number || 0);
            });
          }
          order.goodsCount = count;
        });

        that.setData({
          orderList: that.data.page === 1 ? newList : that.data.orderList.concat(newList),
          total: data.total || 0,
          pendingCount: data.pendingCount || 0,
          aftersaleCount: data.aftersaleCount || 0,
          completedCount: data.completedCount || 0,
          loading: false
        });
      } else {
        that.setData({ loading: false });
      }
    }).catch(function() {
      that.setData({ loading: false });
    });
  },

  onTabChange(e) {
    this.setData({
      type: e.detail.name,
      page: 1,
      orderList: []
    });
    this.getOrderList();
  },

  goOrderDetail(e) {
    const orderId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/manager/orderDetail/orderDetail?id=' + orderId
    });
  },

  // 发货
  onShip(e) {
    const orderId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/manager/orderDetail/orderDetail?id=' + orderId + '&action=ship'
    });
  },

  // 确认付款
  onConfirm(e) {
    const orderId = e.currentTarget.dataset.id;
    let that = this;
    wx.showModal({
      title: '确认',
      content: '确认客户已付款？',
      success(res) {
        if (res.confirm) {
          util.request(api.ManagerOrderConfirm, { orderId: orderId }, 'POST').then(function(res) {
            if (res.errno === 0) {
              wx.showToast({ title: '确认成功', icon: 'success' });
              that.refreshList();
            } else {
              wx.showToast({ title: res.errmsg || '操作失败', icon: 'none' });
            }
          });
        }
      }
    });
  },

  // 取消
  onCancel(e) {
    const orderId = e.currentTarget.dataset.id;
    let that = this;
    wx.showModal({
      title: '确认',
      content: '确认取消该订单？已付款订单将自动退款。',
      success(res) {
        if (res.confirm) {
          util.request(api.ManagerOrderCancel, { orderId: orderId }, 'POST').then(function(res) {
            if (res.errno === 0) {
              wx.showToast({ title: '已取消', icon: 'success' });
              that.refreshList();
            } else {
              wx.showToast({ title: res.errmsg || '操作失败', icon: 'none' });
            }
          });
        }
      }
    });
  },

  // 核销
  onVerify(e) {
    const orderId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/manager/orderDetail/orderDetail?id=' + orderId + '&action=verify'
    });
  },

  // 同意退款
  onRefundAgree(e) {
    const orderId = e.currentTarget.dataset.id;
    let that = this;
    wx.showModal({
      title: '确认退款',
      content: '退款金额将原路返回给客户',
      success(res) {
        if (res.confirm) {
          util.request(api.ManagerOrderRefundAgree, { orderId: orderId }, 'POST').then(function(res) {
            if (res.errno === 0) {
              wx.showToast({ title: '退款成功', icon: 'success' });
              that.refreshList();
            } else {
              wx.showToast({ title: res.errmsg || '退款失败', icon: 'none' });
            }
          });
        }
      }
    });
  },

  // 拒绝退款
  onRefundReject(e) {
    const orderId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/manager/orderDetail/orderDetail?id=' + orderId + '&action=refundReject'
    });
  }
});
