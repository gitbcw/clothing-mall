const util = require('../../../utils/util.js');
const api = require('../../../config/api.js');

const app = getApp();

Page({
  data: {
    skuList: [],
    page: 1,
    limit: 20,
    total: 0,
    loading: false,
    hasMore: true,
    searchKeyword: '',
    categoryFilter: '',
    statusFilter: '',
    // 分类选项
    categoryOptions: ['全部', '上衣', '裤装', '裙装', '外套', '连衣裙', '配饰', '鞋履', '内衣', '其他'],
    categoryIndex: 0,
    // 状态选项
    statusOptions: ['全部', '草稿', '已上架', '已下架'],
    statusIndex: 0,
    showFilter: false
  },

  onLoad() {
    this.loadSkuList();
  },

  onPullDownRefresh() {
    this.setData({
      page: 1,
      skuList: [],
      hasMore: true
    });
    this.loadSkuList().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadSkuList();
    }
  },

  loadSkuList() {
    if (this.data.loading) return Promise.resolve();

    this.setData({ loading: true });

    const params = {
      page: this.data.page,
      limit: this.data.limit
    };

    if (this.data.searchKeyword) {
      params.keyword = this.data.searchKeyword;
    }
    if (this.data.categoryFilter) {
      params.category = this.data.categoryFilter;
    }
    if (this.data.statusFilter) {
      params.status = this.data.statusFilter;
    }

    return util.request(api.ClothingSkuList, params).then(res => {
      if (res.errno === 0) {
        const list = res.data.list || [];
        this.setData({
          skuList: this.data.page === 1 ? list : this.data.skuList.concat(list),
          total: res.data.total || 0,
          page: this.data.page + 1,
          hasMore: list.length >= this.data.limit,
          loading: false
        });
      } else {
        this.setData({ loading: false });
      }
    }).catch(() => {
      this.setData({ loading: false });
    });
  },

  // 搜索
  onSearch(e) {
    this.setData({
      searchKeyword: e.detail.value,
      page: 1,
      skuList: [],
      hasMore: true
    });
    this.loadSkuList();
  },

  // 清空搜索
  clearSearch() {
    this.setData({
      searchKeyword: '',
      page: 1,
      skuList: [],
      hasMore: true
    });
    this.loadSkuList();
  },

  // 切换筛选显示
  toggleFilter() {
    this.setData({ showFilter: !this.data.showFilter });
  },

  // 分类选择
  onCategoryChange(e) {
    const index = e.detail.value;
    this.setData({
      categoryIndex: index,
      categoryFilter: index == 0 ? '' : this.data.categoryOptions[index],
      page: 1,
      skuList: [],
      hasMore: true
    });
    this.loadSkuList();
  },

  // 状态选择
  onStatusChange(e) {
    const index = e.detail.value;
    const statusMap = ['', 'draft', 'online', 'offline'];
    this.setData({
      statusIndex: index,
      statusFilter: statusMap[index],
      page: 1,
      skuList: [],
      hasMore: true
    });
    this.loadSkuList();
  },

  // 查看 SKU 详情
  goSkuDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/manager/skuDetail/skuDetail?id=' + id
    });
  },

  // 快速上架
  quickOnline(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确认上架',
      content: '确定要上架此 SKU 吗？',
      success: res => {
        if (res.confirm) {
          util.request(api.ClothingSkuUpdate, { id: id, status: 'online' }, 'POST').then(res => {
            if (res.errno === 0) {
              wx.showToast({ title: '上架成功', icon: 'success' });
              this.onPullDownRefresh();
            } else {
              wx.showToast({ title: res.errmsg || '操作失败', icon: 'none' });
            }
          });
        }
      }
    });
  },

  // 快速下架
  quickOffline(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确认下架',
      content: '确定要下架此 SKU 吗？',
      success: res => {
        if (res.confirm) {
          util.request(api.ClothingSkuUpdate, { id: id, status: 'offline' }, 'POST').then(res => {
            if (res.errno === 0) {
              wx.showToast({ title: '下架成功', icon: 'success' });
              this.onPullDownRefresh();
            } else {
              wx.showToast({ title: res.errmsg || '操作失败', icon: 'none' });
            }
          });
        }
      }
    });
  },

  // 获取状态文字
  getStatusText(status) {
    const map = {
      'draft': '草稿',
      'online': '已上架',
      'offline': '已下架'
    };
    return map[status] || status;
  }
})
