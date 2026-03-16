const util = require('../../utils/util.js');
const api = require('../../config/api.js');
const user = require('../../utils/user.js');
const tracker = require('../../utils/tracker.js');

const app = getApp();

Page({
  data: {
    banner: [],
    activity: null,  // 单个活动位
    activityTopGoods: [],  // 活动位上排商品（2件）
    activityBottomGoods: [],  // 活动位下排商品（3件）
    hotGoods: [],
    newGoods: [],
    flashSaleList: [],
    outfitList: [],
    accessoryList: [],
    goodsCount: 0
  },

  onShareAppMessage() {
    return {
      title: '川着 transmute - 发现你的专属穿搭',
      desc: '精选服装，品质穿搭',
      path: '/pages/index/index'
    }
  },

  onPullDownRefresh() {
    wx.showNavigationBarLoading()
    this.loadData()
    wx.hideNavigationBarLoading()
    wx.stopPullDownRefresh()
  },

  onLoad(options) {
    // 场景值处理
    if (options.scene) {
      const scene = decodeURIComponent(options.scene)
      const [type, id] = scene.split(',')
      if (type === 'goods' && id) {
        wx.navigateTo({ url: `/pages/goods/goods?id=${id}` })
      }
    }

    // 分享进入
    if (options.goodId) {
      wx.navigateTo({ url: `/pages/goods/goods?id=${options.goodId}` })
    }

    // 订单通知进入
    if (options.orderId) {
      wx.navigateTo({ url: `/pages/ucenter/orderDetail/orderDetail?id=${options.orderId}` })
    }

    this.loadData()
  },

  onShow() {
    // 页面浏览埋点
    tracker.trackPageView('首页')
  },

  loadData() {
    this.getIndexData()
    this.getFlashSaleData()
    this.getGoodsCount()
  },

  getIndexData() {
    util.request(api.IndexUrl).then(res => {
      if (res.errno === 0) {
        const { banner = [], channel = [], newGoodsList = [], hotGoodsList = [], brandList = [], topicList = [], categoryList = [], homeActivity } = res.data

        // 根据分类筛选穿搭推荐和配饰
        const outfitList = hotGoodsList.filter(item => item.categoryId !== 5).slice(0, 4)
        const accessoryList = hotGoodsList.filter(item => item.categoryId === 5 || item.isAccessory).slice(0, 4)

        // 活动位数据：从后台配置读取
        const activity = homeActivity || null
        const activityGoods = (homeActivity && homeActivity.goods) ? homeActivity.goods : []
        const activityTopGoods = activityGoods.slice(0, 2)  // 上排2件
        const activityBottomGoods = activityGoods.slice(2, 5)  // 下排3件

        this.setData({
          banner,
          activity,
          activityTopGoods,
          activityBottomGoods,
          hotGoods: hotGoodsList.slice(0, 6),
          newGoods: newGoodsList,
          outfitList: outfitList.length > 0 ? outfitList : hotGoodsList.slice(0, 4),
          accessoryList: accessoryList.length > 0 ? accessoryList : []
        })
      }
    })
  },

  getFlashSaleData() {
    util.request(api.FlashSaleList, { page: 1, limit: 6 }).then(res => {
      if (res.errno === 0) {
        this.setData({
          flashSaleList: res.data.list || []
        })
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

  getCoupon(e) {
    const couponId = e.currentTarget.dataset.index
    util.request(api.CouponReceive, { couponId }, 'POST').then(res => {
      if (res.errno === 0) {
        wx.showToast({ title: '领取成功', icon: 'success' })
      } else {
        util.showErrorToast(res.errmsg)
      }
    })
  },

  onGoodsTap(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/goods/goods?id=${id}` })
  },

  goSearch() {
    wx.navigateTo({ url: '/pages/search/search' })
  }
})
