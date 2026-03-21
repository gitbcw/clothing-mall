const util = require('../../../utils/util.js');
const api = require('../../../config/api.js');

const app = getApp();

Page({
  data: {
    type: 'unpaid',
    orderList: [],
    page: 1,
    limit: 10,
    total: 0,
    loading: false
  },

  onLoad(options) {
    this.setData({ type: options.type || 'unpaid' });
    this.getOrderList();
  },

  onShow() {
    this.getOrderList();
  },

  getOrderList() {
    let that = this;
    this.setData({ loading: true });
    
    let showType = 1; // 默认待付款
    if (this.data.type === 'unpaid') showType = 1;
    else if (this.data.type === 'unship') showType = 2;
    else if (this.data.type === 'unrecv') showType = 3;
    else if (this.data.type === 'aftersale') {
      // 售后订单使用不同的 API
      util.request(api.AftersaleList, { 
        status: 0, 
        page: this.data.page, 
        limit: this.data.limit 
      }).then(function(res) {
        if (res.errno === 0) {
          that.setData({
            orderList: res.data.list || [],
            total: res.data.total || 0,
            loading: false
          });
        }
      }).catch(function() {
        that.setData({ loading: false });
      });
      return;
    }
    
    util.request(api.OrderList, { 
      showType: showType, 
      page: this.data.page, 
      limit: this.data.limit 
    }).then(function(res) {
      if (res.errno === 0) {
        that.setData({
          orderList: res.data.list || [],
          total: res.data.total || 0,
          loading: false
        });
      }
    }).catch(function() {
      that.setData({ loading: false });
    });
  },

  onPullDownRefresh() {
    this.setData({ page: 1 });
    this.getOrderList();
  },

  onPullUpLoad() {
    if (this.data.orderList.length < this.data.total) {
      this.setData({ page: this.data.page + 1 });
      this.getOrderList();
    }
  },

  goOrderDetail(e) {
    const orderId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/manager/orderDetail/orderDetail?id=' + orderId
    });
  },

  onTabChange(e) {
    const type = e.detail.name;
    this.setData({ 
      type: type, 
      page: 1, 
      orderList: [] 
    });
    this.getOrderList();
  }
})
