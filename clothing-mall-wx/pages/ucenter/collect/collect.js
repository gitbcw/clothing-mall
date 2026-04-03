const util = require('../../../utils/util.js');
const api = require('../../../config/api.js');

Page({
  data: {
    type: 0,
    collectList: [],
    page: 1,
    limit: 10,
    totalPages: 1,
    loading: false
  },

  onLoad() {
    this.getCollectList();
  },

  onPullDownRefresh() {
    this.setData({
      collectList: [],
      page: 1,
      totalPages: 1,
      loading: false
    });
    this.getCollectList(true).then(() => {
      wx.stopPullDownRefresh();
    });
  },

  onReachBottom() {
    if (this.data.loading) return;
    if (this.data.page < this.data.totalPages) {
      this.setData({ page: this.data.page + 1 });
      this.getCollectList(true);
    }
  },

  getCollectList(quiet) {
    if (this.data.loading) return Promise.resolve();
    this.setData({ loading: true });
    if (!quiet) {
      wx.showLoading({ title: '加载中...' });
    }

    return util.request(api.CollectList, {
      type: this.data.type,
      page: this.data.page,
      limit: this.data.limit
    }).then((res) => {
      if (res.errno === 0) {
        this.setData({
          collectList: this.data.collectList.concat(res.data.list),
          totalPages: res.data.pages
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
    const type = Number(e.currentTarget.dataset.index);
    if (type === this.data.type) return;
    this.setData({
      collectList: [],
      type,
      page: 1,
      totalPages: 1,
      loading: false
    });
    this.getCollectList();
  },

  openCollect(e) {
    if (this.data.type === 1) {
      wx.showToast({ title: '专题暂未开放', icon: 'none' });
      return;
    }
    const index = e.currentTarget.dataset.index;
    const item = this.data.collectList[index];
    if (!item) return;
    wx.navigateTo({
      url: '/pages/goods_detail/goods_detail?id=' + item.valueId
    });
  },

  deleteCollect(e) {
    const index = e.currentTarget.dataset.index;
    const item = this.data.collectList[index];
    if (!item) return;

    wx.showModal({
      title: '',
      content: '确定取消收藏吗？',
      confirmColor: '#FF8096',
      success: (res) => {
        if (res.confirm) {
          util.request(api.CollectAddOrDelete, {
            type: this.data.type,
            valueId: item.valueId
          }, 'POST').then((res) => {
            if (res.errno === 0) {
              wx.showToast({ title: '已取消收藏', icon: 'success' });
              this.setData({
                collectList: this.data.collectList.filter((_, i) => i !== index)
              });
            }
          });
        }
      }
    });
  }
});
