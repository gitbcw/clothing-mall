const util = require('../../../utils/util.js');
const api = require('../../../config/api.js');

const app = getApp();

Page({
  data: {
    drafts: [],
    loading: false,
    selectedIds: [],
    multiSelectMode: false
  },

  onLoad() {
    this.loadDrafts();
  },

  onShow() {
    this.loadDrafts();
  },

  loadDrafts() {
    this.setData({ loading: true });
    const drafts = wx.getStorageSync('skuDrafts') || [];
    drafts.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
    this.setData({
      drafts: drafts,
      loading: false
    });
  },

  // 跳转到商品编辑页
  editDraft(e) {
    const index = e.currentTarget.dataset.index;
    const draft = this.data.drafts[index];
    // 如果草稿已有 goodsId（已保存到后端），则跳转编辑页
    if (draft.goodsId) {
      wx.navigateTo({
        url: '/pages/manager/goodsEdit/goodsEdit?id=' + draft.goodsId
      });
    } else {
      wx.navigateTo({
        url: '/pages/manager/confirmUpload/confirmUpload?result=' + encodeURIComponent(JSON.stringify(draft)) + '&imageUrl=' + (draft.imageUrl || '')
      });
    }
  },

  // 直接上架草稿到后端
  publishDraft(e) {
    const index = e.currentTarget.dataset.index;
    const draft = this.data.drafts[index];

    if (!draft.name) {
      wx.showToast({ title: '请先完善商品名称', icon: 'none' });
      return;
    }

    let that = this;
    wx.showLoading({ title: '上架中...' });

    util.request(api.ManagerGoodsCreate, {
      name: draft.name,
      categoryId: draft.categoryId,
      brief: draft.brief || '',
      picUrl: draft.imageUrl || draft.sourceImage || '',
      skus: (draft.skus || [])
    }, 'POST').then(function(res) {
      wx.hideLoading();
      if (res.errno === 0) {
        const goodsId = res.data;
        // 上架
        util.request(api.ManagerGoodsPublish, { id: goodsId }, 'POST').then(function(res2) {
          if (res2.errno === 0) {
            wx.showToast({ title: '上架成功', icon: 'success' });
            // 删除本地草稿
            that.removeLocalDraft(index);
          } else {
            wx.showToast({ title: '已保存但上架失败', icon: 'none' });
          }
        });
      } else {
        wx.showToast({ title: res.errmsg || '创建失败', icon: 'none' });
      }
    }).catch(function() {
      wx.hideLoading();
      wx.showToast({ title: '操作失败', icon: 'none' });
    });
  },

  // 删除草稿
  deleteDraft(e) {
    const index = e.currentTarget.dataset.index;
    const that = this;
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个草稿吗？',
      success(res) {
        if (res.confirm) {
          that.removeLocalDraft(index);
        }
      }
    });
  },

  removeLocalDraft(index) {
    const drafts = this.data.drafts;
    drafts.splice(index, 1);
    wx.setStorageSync('skuDrafts', drafts);
    this.setData({ drafts: drafts });
    wx.showToast({ title: '已删除', icon: 'success' });
  },

  // 清空所有草稿
  clearAllDrafts() {
    if (this.data.drafts.length === 0) {
      wx.showToast({ title: '没有草稿', icon: 'none' });
      return;
    }
    let that = this;
    wx.showModal({
      title: '确认清空',
      content: '确定要清空所有草稿吗？此操作不可恢复。',
      success(res) {
        if (res.confirm) {
          wx.removeStorageSync('skuDrafts');
          that.setData({ drafts: [] });
          wx.showToast({ title: '已清空', icon: 'success' });
        }
      }
    });
  },

  // 新建草稿
  createNew() {
    wx.navigateTo({
      url: '/pages/manager/upload/upload'
    });
  },

  // 多选模式
  onLongPress(e) {
    const index = e.currentTarget.dataset.index;
    const id = this.data.drafts[index].goodsId || ('local_' + index);
    this.setData({
      multiSelectMode: true,
      selectedIds: [id]
    });
  },

  onSelectDraft(e) {
    const index = e.currentTarget.dataset.index;
    const id = this.data.drafts[index].goodsId || ('local_' + index);
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

  onBatchPublish() {
    // 批量上架本地草稿
    const that = this;
    wx.showLoading({ title: '批量上架中...' });

    const promises = this.data.selectedIds.map(function(id, i) {
      const draft = that.data.drafts.find(function(d, idx) {
        return (d.goodsId || ('local_' + idx)) === id;
      });
      if (!draft || !draft.name) return Promise.resolve();

      return util.request(api.ManagerGoodsCreate, {
        name: draft.name,
        categoryId: draft.categoryId,
        brief: draft.brief || '',
        picUrl: draft.imageUrl || draft.sourceImage || '',
        skus: draft.skus || []
      }, 'POST');
    });

    Promise.all(promises).then(function(results) {
      wx.hideLoading();
      wx.showToast({ title: '批量操作完成', icon: 'success' });
      that.onExitMultiSelect();
      that.loadDrafts();
    }).catch(function() {
      wx.hideLoading();
      wx.showToast({ title: '操作失败', icon: 'none' });
    });
  },

  formatTime(isoString) {
    const date = new Date(isoString);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
    return `${month}-${day} ${hour}:${minute}`;
  }
});
