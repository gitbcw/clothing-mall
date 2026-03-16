const util = require('../../utils/util.js');
const api = require('../../config/api.js');

Page({
  data: {
    categoryList: [],
    currentCategoryId: null,
    goodsList: [],
    page: 1,
    limit: 20,
    loading: false,
    hasMore: true,
    refreshing: false,
    goodsCount: 0
  },

  onLoad(options) {
    if (options.category) {
      this.setData({ currentCategoryId: parseInt(options.category) })
    }
    this.loadCategories()
    this.getGoodsCount()
  },

  onPullDownRefresh() {
    this.onRefresh()
  },

  onRefresh() {
    this.setData({ refreshing: true, page: 1, hasMore: true, goodsList: [] })
    this.loadGoods().then(() => {
      this.setData({ refreshing: false })
      wx.stopPullDownRefresh()
    })
  },

  loadCategories() {
    util.request(api.CatalogList).then(res => {
      if (res.errno === 0) {
        const categoryList = [{ id: null, name: '全部' }, ...res.data.categoryList]
        this.setData({ categoryList })
        this.loadGoods()
      }
    })
  },

  getGoodsCount() {
    util.request(api.GoodsCount).then(res => {
      if (res.errno === 0) {
        this.setData({ goodsCount: res.data })
      }
    })
  },

  switchCategory(e) {
    const id = e.currentTarget.dataset.id
    if (this.data.currentCategoryId === id) return

    this.setData({
      currentCategoryId: id,
      goodsList: [],
      page: 1,
      hasMore: true
    })
    this.loadGoods()
  },

  loadGoods() {
    if (this.data.loading) return Promise.resolve()

    this.setData({ loading: true })

    const params = {
      page: this.data.page,
      limit: this.data.limit
    }

    if (this.data.currentCategoryId) {
      params.categoryId = this.data.currentCategoryId
    }

    return util.request(api.GoodsList, params).then(res => {
      if (res.errno === 0) {
        const list = res.data.list || []
        const newGoodsList = [...this.data.goodsList, ...list]

        this.setData({
          goodsList: newGoodsList,
          hasMore: list.length >= this.data.limit,
          page: this.data.page + 1
        })
      }
    }).finally(() => {
      this.setData({ loading: false })
    })
  },

  loadMore() {
    if (!this.data.hasMore || this.data.loading) return
    this.loadGoods()
  },

  onGoodsTap(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/goods/goods?id=${id}` })
  },

  quickAddCart(e) {
    const goodsId = e.currentTarget.dataset.id
    util.request(api.CartAdd, {
      goodsId: goodsId,
      number: 1,
      productId: 0
    }, 'POST').then(res => {
      if (res.errno === 0) {
        wx.showToast({ title: '已加入购物车', icon: 'success' })
      } else {
        wx.showToast({ title: res.errmsg || '加购失败', icon: 'none' })
      }
    }).catch(() => {
      wx.showToast({ title: '网络错误', icon: 'none' })
    })
  }
})
