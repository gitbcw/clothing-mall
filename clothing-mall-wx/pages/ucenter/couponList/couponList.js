const util = require('../../../utils/util.js');
const api = require('../../../config/api.js');

Page({
  data: {
    couponList: [],
    code: '',
    status: 0,
    page: 1,
    limit: 10,
    count: 0,
    loading: false
  },

  onLoad() {
    this.loadCouponList();
  },

  onPullDownRefresh() {
    this.setData({
      page: 1,
      couponList: [],
      count: 0,
      loading: false
    });
    this.loadCouponList(true).then(() => {
      wx.stopPullDownRefresh();
    });
  },

  onReachBottom() {
    if (this.data.loading) return;
    if (this.data.page * this.data.limit < this.data.count) {
      this.setData({ page: this.data.page + 1 });
      this.loadCouponList(true);
    }
  },

  loadCouponList(quiet) {
    if (this.data.loading) return Promise.resolve();
    this.setData({ loading: true });
    if (!quiet) {
      wx.showLoading({ title: '加载中...' });
    }

    return util.request(api.CouponMyList, {
      status: this.data.status,
      page: this.data.page,
      limit: this.data.limit
    }).then((res) => {
      if (res.errno === 0) {
        this.setData({
          couponList: this.data.couponList.concat(res.data.list),
          count: res.data.total
        });
      }
    }).finally(() => {
      if (!quiet) {
        wx.hideLoading();
      }
      this.setData({ loading: false });
    });
  },

  switchTab(e) {
    const status = Number(e.currentTarget.dataset.index);
    if (status === this.data.status) return;
    this.setData({
      couponList: [],
      status,
      page: 1,
      count: 0,
      loading: false
    });
    this.loadCouponList();
  },

  bindExchange(e) {
    this.setData({ code: e.detail.value });
  },

  clearExchange() {
    this.setData({ code: '' });
  },

  goExchange() {
    if (!this.data.code) {
      util.showErrorToast('请输入兑换码');
      return;
    }

    util.request(api.CouponExchange, {
      code: this.data.code
    }, 'POST').then((res) => {
      if (res.errno === 0) {
        this.setData({
          code: '',
          couponList: [],
          page: 1,
          count: 0,
          loading: false
        });
        this.loadCouponList();
        wx.showToast({ title: '兑换成功', icon: 'success' });
      } else {
        util.showErrorToast(res.errmsg);
      }
    });
  }
});
