var util = require('../../../utils/util.js');
var api = require('../../../config/api.js');

var app = getApp();

Page({
  data: {
    couponList: [],
    code: '',
    status: 0,
    page: 1,
    limit: 10,
    count: 0,
    scrollTop: 0,
    showPage: false,
    loading: false
  },

  onLoad: function(options) {
    this.loadCouponList();
  },

  onReady: function() {

  },

  onShow: function() {

  },

  onHide: function() {

  },

  onUnload: function() {

  },

  onPullDownRefresh() {
    wx.showNavigationBarLoading()
    this.setData({
      page: 1,
      couponList: [],
      count: 0,
      showPage: false
    }, function() {
      this.loadCouponList();
    }.bind(this));
  },

  onReachBottom: function() {
    if (!this.data.loading && this.data.page * this.data.limit < this.data.count) {
      this.setData({ page: this.data.page + 1 });
      this.loadCouponList();
    }
  },

  onShareAppMessage: function() {

  },
  loadCouponList: function() {
    let that = this;
    if (that.data.loading) return;
    that.setData({ loading: true });

    util.request(api.CouponMyList, {
      status: that.data.status,
      page: that.data.page,
      limit: that.data.limit
    }).then(function(res) {
      if (res.errno === 0) {
        var newList = that.data.couponList.concat(res.data.list);
        that.setData({
          scrollTop: 0,
          couponList: newList,
          showPage: res.data.total > that.data.limit,
          count: res.data.total,
          loading: false
        });
      }
    });
  },
  resetAndLoad: function() {
    this.setData({
      page: 1,
      couponList: [],
      count: 0,
      scrollTop: 0,
      showPage: false,
      loading: false
    });
    this.loadCouponList();
  },
  bindExchange: function (e) {
    this.setData({
      code: e.detail.value
    });
  },
  clearExchange: function () {
    this.setData({
      code: ''
    });
  },
  goExchange: function() {
    if (this.data.code.length === 0) {
      util.showErrorToast("请输入兑换码");
      return;
    }

    let that = this;
    util.request(api.CouponExchange, {
      code: that.data.code
    }, 'POST').then(function (res) {
      if (res.errno === 0) {
        that.resetAndLoad();
        that.clearExchange();
        wx.showToast({
          title: "领取成功",
          duration: 2000
        })
      }
      else{
        util.showErrorToast(res.errmsg);
      }
    });
  },
  switchTab: function(e) {
    this.setData({
      couponList: [],
      status: e.currentTarget.dataset.index,
      page: 1,
      limit: 10,
      count: 0,
      scrollTop: 0,
      showPage: false,
      loading: false
    });

    this.loadCouponList();
  },
})
