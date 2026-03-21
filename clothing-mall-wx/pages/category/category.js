const util = require('../../utils/util.js');
const api = require('../../config/api.js');

const app = getApp();

Page({
  data: {
    statusBarHeight: 20,
    navBarHeight: 44,

    // 分类列表
    navList: [],
    currentCategory: {},
    activeCategoryId: 0,

    // 商品列表
    goodsList: [],
    page: 1,
    limit: 10,
    pages: 1,

    // 瀑布流
    leftGoodsList: [],
    rightGoodsList: [],
    defaultImage: '/static/images/fallback-image.svg',

    scrollLeft: 0,
    scrollHeight: 0
  },

  onLoad(options) {
    const sysInfo = wx.getSystemInfoSync()
    const isIOS = sysInfo.system.indexOf('iOS') > -1
    this.setData({
      statusBarHeight: sysInfo.statusBarHeight,
      navBarHeight: isIOS ? 44 : 48,
      scrollHeight: sysInfo.windowHeight
    })

    if (options.id) {
      this.setData({ activeCategoryId: parseInt(options.id) })
    }

    this.getCategoryInfo()
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ active: 1 })
    }
  },

  // 获取分类信息
  getCategoryInfo() {
    let that = this
    util.request(api.GoodsCategory, {
      id: this.data.activeCategoryId
    }).then(function(res) {
      if (res.errno === 0) {
        that.setData({
          navList: res.data.brotherCategory || [],
          currentCategory: res.data.currentCategory || {}
        })

        // 设置导航栏标题
        if (res.data.parentCategory) {
          wx.setNavigationBarTitle({
            title: res.data.parentCategory.name
          })
        }

        // 当id是L1分类id时，需要重新设置成L1分类的一个子分类的id
        if (res.data.parentCategory && res.data.parentCategory.id === that.data.activeCategoryId) {
          that.setData({
            activeCategoryId: res.data.currentCategory.id
          })
        }

        // 调整滚动位置
        let currentIndex = 0
        let navListCount = that.data.navList.length
        for (let i = 0; i < navListCount; i++) {
          currentIndex += 1
          if (that.data.navList[i].id === that.data.activeCategoryId) {
            break
          }
        }
        if (currentIndex > navListCount / 2 && navListCount > 5) {
          that.setData({
            scrollLeft: currentIndex * 60
          })
        }

        // 获取商品列表
        that.data.page = 1
        that.data.goodsList = []
        that.getGoodsList()
      }
    })
  },

  // 获取商品列表
  getGoodsList() {
    let that = this
    util.request(api.GoodsList, {
      categoryId: that.data.activeCategoryId,
      page: that.data.page,
      limit: that.data.limit
    }).then(function(res) {
      if (res.errno === 0) {
        let goodsList = that.data.goodsList.concat(res.data.list || [])
        that.setData({
          goodsList: goodsList,
          pages: res.data.pages || 1
        })
        // 更新瀑布流
        that.updateWaterfall()
      }
    })
  },

  // 更新瀑布流布局
  updateWaterfall() {
    const goodsList = this.data.goodsList
    const leftGoodsList = []
    const rightGoodsList = []

    goodsList.forEach((item, index) => {
      if (index % 2 === 0) {
        leftGoodsList.push(item)
      } else {
        rightGoodsList.push(item)
      }
    })

    this.setData({ leftGoodsList, rightGoodsList })
  },

  // 触底加载更多
  onReachBottom() {
    let pageNum = this.data.page + 1
    if (pageNum <= this.data.pages) {
      this.setData({ page: pageNum })
      this.getGoodsList()
    } else {
      wx.showToast({ title: '没有更多了', icon: 'none' })
    }
  },

  // 切换分类
  switchCate(e) {
    let id = e.currentTarget.dataset.id
    if (this.data.activeCategoryId === id) {
      return
    }

    let clientX = e.detail && e.detail.x ? e.detail.x : 0
    let currentTarget = e.currentTarget
    if (clientX < 60) {
      this.setData({ scrollLeft: currentTarget.offsetLeft - 60 })
    } else if (clientX > 330) {
      this.setData({ scrollLeft: currentTarget.offsetLeft })
    }

    this.setData({
      activeCategoryId: id,
      page: 1,
      goodsList: [],
      leftGoodsList: [],
      rightGoodsList: []
    })

    this.getCategoryInfo()
  },

  // 跳转商品详情
  goToDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/goods_detail/goods_detail?id=${id}`
    })
  },

  goSearch() {
    wx.navigateTo({
      url: '/pages/search/search'
    })
  },

  onCategoryImageError(e) {
    const { source, index } = e.currentTarget.dataset
    const list = this.data[source] || []
    const defaultImage = this.data.defaultImage
    if (list[index] && list[index].picUrl !== defaultImage) {
      this.setData({
        [`${source}[${index}].picUrl`]: defaultImage
      })
    }
  },

  // 返回
  goBack() {
    wx.navigateBack({
      fail: () => {
        wx.switchTab({ url: '/pages/index/index' })
      }
    })
  }
})
