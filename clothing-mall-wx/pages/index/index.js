const util = require('../../utils/util.js');
const api = require('../../config/api.js');
const tracker = require('../../utils/tracker.js');

const app = getApp();

Page({
  data: {
    statusBarHeight: 20,
    navBarHeight: 44,
    navOpacity: 0,

    // 轮播图
    banners: [],

    // 每周上新
    weeklyNews: [],

    // 热销推荐
    hotSales: [],

    // 搭配推荐
    matchRecommends: [],

    // 活动位
    activityGoods: [],

    // 饰饰如意
    accessories: [],
    defaultImage: '/static/images/fallback-image.svg'
  },

  onShareAppMessage() {
    return {
      title: '川着 transmute - 发现你的专属穿搭',
      desc: '精选服装，品质穿搭',
      path: '/pages/index/index'
    }
  },

  onPullDownRefresh() {
    this.loadData()
    this.loadSceneBanners()
    wx.stopPullDownRefresh()
  },

  onLoad() {
    // 初始化导航栏
    const sysInfo = wx.getSystemInfoSync()
    const isIOS = sysInfo.system.indexOf('iOS') > -1
    this.setData({
      statusBarHeight: sysInfo.statusBarHeight,
      navBarHeight: isIOS ? 44 : 48
    })

    this.loadData()
    this.loadSceneBanners()
  },

  onShow() {
    // 更新 TabBar 状态
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ active: 0 })
    }
    // 页面浏览埋点
    tracker.trackPageView('首页')
  },

  onPageScroll(e) {
    const scrollTop = e.scrollTop
    let opacity = scrollTop / 100
    if (opacity > 1) opacity = 1
    this.setData({ navOpacity: opacity })
  },

  // 加载数据
  loadData() {
    util.request(api.IndexUrl).then(res => {
      if (res.errno === 0) {
        const { hotGoodsList = [], newGoodsList = [] } = res.data

        this.setData({
          weeklyNews: newGoodsList.filter(item => item.categoryId !== 1022001).slice(0, 5),
          hotSales: hotGoodsList.filter(item => item.categoryId !== 1022001).slice(0, 6)
        })

        // 活动位数据
        const homeActivity = res.data.homeActivity
        if (homeActivity && homeActivity.goods) {
          this.setData({ activityGoods: homeActivity.goods })
        }

        // 穿搭推荐（替换原来的搭配推荐数据源）
        const outfitList = res.data.outfitList || []
        this.setData({ matchRecommends: outfitList })
      }
    }).catch(() => {
        wx.showToast({ title: '网络错误', icon: 'none' })
      })

    // 单独加载饰品（从饰品分类获取）
    this.loadAccessories()
  },

  // 加载饰品数据
  loadAccessories() {
    util.request(api.GoodsList, {
      categoryId: 1022001,
      page: 1,
      limit: 4
    }).then(res => {
      if (res.errno === 0 && res.data.list) {
        this.setData({
          accessories: res.data.list.slice(0, 4)
        })
      }
    }).catch(() => {})
  },

  // 加载场景轮播图
  loadSceneBanners() {
    util.request(api.SceneBanners).then(res => {
      this.setData({ banners: res.data.data || [] })
    }).catch(() => {
      this.setData({ banners: [] })
    })
  },

  // 跳转场景商品页
  goToScene(e) {
    const sceneId = e.currentTarget.dataset.sceneId
    wx.navigateTo({ url: `/pages/scene/scene?id=${sceneId}` })
  },

  // 跳转穿搭推荐详情
  goToOutfit(e) {
    const id = e.currentTarget.dataset.id
    const outfit = this.data.matchRecommends.find(o => o.id === id)
    if (outfit && outfit.goods && outfit.goods.length > 0) {
      wx.navigateTo({ url: `/pages/goods_detail/goods_detail?id=${outfit.goods[0].id}` })
    }
  },

  // 跳转商品详情
  goToDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/goods_detail/goods_detail?id=${id}`
    })
  },

  onHomeImageError(e) {
    const { source, index } = e.currentTarget.dataset
    const defaultImage = this.data.defaultImage
    if (source === 'banners') {
      // banner 元素是对象，需要设置 url 属性
      if (this.data.banners[index] && this.data.banners[index].url !== defaultImage) {
        this.setData({
          [`banners[${index}].url`]: defaultImage
        })
      }
      return
    }
    const list = this.data[source] || []
    if (list[index] && list[index].picUrl !== defaultImage) {
      this.setData({
        [`${source}[${index}].picUrl`]: defaultImage
      })
    }
  },

  // 加入购物车
  addToCart(e) {
    const id = e.currentTarget.dataset.id
    util.request(api.CartAdd, {
      goodsId: id,
      number: 1,
      productId: 0
    }, 'POST').then(res => {
      if (res.errno === 0) {
        wx.showToast({ title: '已加入购物车', icon: 'success' })
        // 加购埋点
        tracker.trackAddCart(id, '商品', 0, 1)
      } else {
        wx.showToast({ title: res.errmsg || '加购失败', icon: 'none' })
      }
    }).catch(() => {
      wx.showToast({ title: '网络错误', icon: 'none' })
    })
  },

  // 立即购买
  buyNow(e) {
    const id = e.currentTarget.dataset.id
    util.request(api.CartFastAdd, {
      goodsId: id,
      number: 1,
      productId: 0
    }, 'POST').then(res => {
      if (res.errno === 0) {
        wx.setStorageSync('cartId', res.data)
        wx.navigateTo({
          url: '/pages/confirm_order/confirm_order'
        })
      } else {
        wx.showToast({ title: res.errmsg || '下单失败', icon: 'none' })
      }
    }).catch(() => {
      wx.showToast({ title: '网络错误', icon: 'none' })
    })
  },

  // 跳转购物车
  goToCart() {
    wx.switchTab({ url: '/pages/cart/cart' })
  },

  // 切换 Tab
  switchTab(e) {
    const url = e.currentTarget.dataset.url
    wx.switchTab({ url })
  }
})
