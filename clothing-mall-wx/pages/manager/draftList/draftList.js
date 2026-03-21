const app = getApp();

Page({
  data: {
    drafts: [],
    loading: false
  },

  onLoad() {
    this.loadDrafts();
  },

  onShow() {
    this.loadDrafts();
  },

  loadDrafts() {
    this.setData({ loading: true });
    // 从本地存储加载草稿
    const drafts = wx.getStorageSync('skuDrafts') || [];
    // 按保存时间倒序排列
    drafts.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
    this.setData({
      drafts: drafts,
      loading: false
    });
  },

  // 继续编辑草稿
  editDraft(e) {
    const index = e.currentTarget.dataset.index;
    const draft = this.data.drafts[index];

    // 跳转到确认页面继续编辑
    wx.navigateTo({
      url: '/pages/manager/confirmUpload/confirmUpload?result=' + encodeURIComponent(JSON.stringify(draft)) + '&imageUrl=' + encodeURIComponent(draft.imageUrl || '') + '&manual=' + (draft.manual || 'false')
    });
  },

  // 删除草稿
  deleteDraft(e) {
    const index = e.currentTarget.dataset.index;
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个草稿吗？',
      success: res => {
        if (res.confirm) {
          const drafts = this.data.drafts;
          drafts.splice(index, 1);
          wx.setStorageSync('skuDrafts', drafts);
          this.setData({ drafts: drafts });
          wx.showToast({ title: '已删除', icon: 'success' });
        }
      }
    });
  },

  // 清空所有草稿
  clearAllDrafts() {
    if (this.data.drafts.length === 0) {
      wx.showToast({ title: '没有草稿', icon: 'none' });
      return;
    }
    wx.showModal({
      title: '确认清空',
      content: '确定要清空所有草稿吗？此操作不可恢复。',
      success: res => {
        if (res.confirm) {
          wx.removeStorageSync('skuDrafts');
          this.setData({ drafts: [] });
          wx.showToast({ title: '已清空', icon: 'success' });
        }
      }
    });
  },

  // 格式化时间
  formatTime(isoString) {
    const date = new Date(isoString);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
    return `${month}-${day} ${hour}:${minute}`;
  },

  // 新建草稿
  createNew() {
    wx.navigateTo({
      url: '/pages/manager/upload/upload'
    });
  }
})
