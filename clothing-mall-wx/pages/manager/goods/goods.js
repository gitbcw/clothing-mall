const util = require('../../../utils/util.js');
const api = require('../../../config/api.js');

Page({
  data: {
    currentTab: 'all',
    goodsList: [],
    page: 1,
    limit: 20,
    total: 0,
    loading: false,
    tabCounts: {
      allCount: 0,
      draftCount: 0,
      pendingCount: 0,
      onSaleCount: 0
    },
    multiSelectMode: false,
    selectedIds: []
  },

  onLoad() {
    this.getGoodsList();
  },

  onShow() {
    // 从编辑页返回时刷新
    if (this.data.goodsList.length > 0) {
      this.refreshList();
    }
  },

  onPullDownRefresh() {
    this.refreshList();
    wx.stopPullDownRefresh();
  },

  onReachBottom() {
    if (this.data.goodsList.length < this.data.total) {
      this.setData({ page: this.data.page + 1 });
      this.getGoodsList();
    }
  },

  refreshList() {
    this.setData({ page: 1, goodsList: [] });
    this.getGoodsList();
  },

  getGoodsList() {
    if (this.data.loading) return;
    let that = this;
    this.setData({ loading: true });

    util.request(api.ManagerGoodsList, {
      status: this.data.currentTab,
      page: this.data.page,
      limit: this.data.limit
    }).then(function(res) {
      if (res.errno === 0) {
        const data = res.data;
        const newList = data.list || [];

        that.setData({
          goodsList: that.data.page === 1 ? newList : that.data.goodsList.concat(newList),
          total: data.total || 0,
          tabCounts: {
            allCount: data.allCount || 0,
            draftCount: data.draftCount || 0,
            pendingCount: data.pendingCount || 0,
            onSaleCount: data.onSaleCount || 0
          },
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
    const tab = e.currentTarget.dataset.tab;
    this.setData({
      currentTab: tab,
      page: 1,
      goodsList: [],
      multiSelectMode: false,
      selectedIds: []
    });
    this.getGoodsList();
  },

  statusText(status, isOnSale) {
    if (status === 'draft') return '草稿';
    if (status === 'pending') return '待上架';
    if (status === 'published' && isOnSale) return '已上架';
    if (status === 'published' && !isOnSale) return '已下架';
    return '未知';
  },

  // 点击商品 → 跳转编辑
  onGoodsTap(e) {
    if (this.data.multiSelectMode) {
      this.onSelectItem(e);
      return;
    }
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/manager/goodsEdit/goodsEdit?id=' + id
    });
  },

  // 长按进入多选模式
  onLongPress(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({
      multiSelectMode: true,
      selectedIds: [id]
    });
  },

  onSelectItem(e) {
    const id = e.currentTarget.dataset.id || e.currentTarget.dataset.id;
    const idx = this.data.selectedIds.indexOf(id);
    if (idx > -1) {
      this.data.selectedIds.splice(idx, 1);
    } else {
      this.data.selectedIds.push(id);
    }
    this.setData({ selectedIds: this.data.selectedIds });
  },

  onExitMultiSelect() {
    this.setData({ multiSelectMode: false, selectedIds: [] });
  },

  // 批量上架
  onBatchPublish() {
    if (this.data.selectedIds.length === 0) {
      wx.showToast({ title: '请选择商品', icon: 'none' });
      return;
    }
    let that = this;
    util.request(api.ManagerGoodsPublish, { ids: this.data.selectedIds }, 'POST').then(function(res) {
      if (res.errno === 0) {
        wx.showToast({ title: '上架成功', icon: 'success' });
        that.setData({ multiSelectMode: false, selectedIds: [] });
        that.refreshList();
      } else {
        wx.showToast({ title: res.errmsg || '操作失败', icon: 'none' });
      }
    });
  },

  // 批量下架
  onBatchUnpublish() {
    if (this.data.selectedIds.length === 0) {
      wx.showToast({ title: '请选择商品', icon: 'none' });
      return;
    }
    let that = this;
    wx.showModal({
      title: '确认下架',
      content: '确认下架选中的 ' + this.data.selectedIds.length + ' 件商品？',
      success(res) {
        if (res.confirm) {
          util.request(api.ManagerGoodsUnpublish, { ids: that.data.selectedIds }, 'POST').then(function(res) {
            if (res.errno === 0) {
              wx.showToast({ title: '下架成功', icon: 'success' });
              that.setData({ multiSelectMode: false, selectedIds: [] });
              that.refreshList();
            } else {
              wx.showToast({ title: res.errmsg || '操作失败', icon: 'none' });
            }
          });
        }
      }
    });
  },

  // 批量删除
  onBatchDelete() {
    if (this.data.selectedIds.length === 0) {
      wx.showToast({ title: '请选择商品', icon: 'none' });
      return;
    }
    let that = this;
    wx.showModal({
      title: '确认删除',
      content: '确认删除选中的 ' + this.data.selectedIds.length + ' 件商品？删除后不可恢复。',
      success(res) {
        if (res.confirm) {
          util.request(api.ManagerGoodsBatchDelete, { ids: that.data.selectedIds }, 'POST').then(function(res) {
            if (res.errno === 0) {
              wx.showToast({ title: '删除成功', icon: 'success' });
              that.setData({ multiSelectMode: false, selectedIds: [] });
              that.refreshList();
            } else {
              wx.showToast({ title: res.errmsg || '删除失败', icon: 'none' });
            }
          });
        }
      }
    });
  },

  // 跳转到上传页
  goUpload() {
    wx.navigateTo({
      url: '/pages/manager/upload/upload'
    });
  }
});
