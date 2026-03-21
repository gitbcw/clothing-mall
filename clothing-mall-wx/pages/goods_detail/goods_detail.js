const util = require('../../utils/util.js');
const api = require('../../config/api.js');
const tracker = require('../../utils/tracker.js');

const app = getApp();

Page({
  data: {
    statusBarHeight: 20,
    navBarHeight: 44,

    // 商品信息
    id: 0,
    goods: {},
    gallery: [],
    currentSwiper: 1,
    info: {},

    // 规格选择
    specificationList: [],
    productList: [],
    checkedSpecText: '请选择规格数量',
    checkedSpecPrice: 0,
    tmpPicUrl: '',
    tmpSpecText: '请选择规格数量',
    openAttr: false,
    number: 1,

    // 收藏
    userHasCollect: 0,
    collect: false,

    // 购物车
    cartGoodsCount: 0,

    // 推荐商品
    relatedGoods: [],

    // SKU 选择器
    showSkuPicker: false,
    skuList: [],
    skuColors: [],
    skuSizes: [],
    selectedSku: null,

    // 限时特卖
    flashSale: null,
    flashSaleId: null,

    // 分享
    canShare: true,
    openShare: false,
    canWrite: false,
    defaultImage: '/static/images/fallback-image.svg'
  },

  onShareAppMessage() {
    return {
      title: this.data.goods.name || '川着Transmute商品',
    }
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ id: parseInt(options.id) })
      this.getGoodsInfo()
    }

    // 检查保存相册权限
    let that = this
    wx.getSetting({
      success: function(res) {
        if (!res.authSetting['scope.writePhotosAlbum']) {
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success: function() {
              that.setData({ canWrite: true })
            },
            fail: function() {
              that.setData({ canWrite: false })
            }
          })
        } else {
          that.setData({ canWrite: true })
        }
      }
    })
  },

  onShow() {
    // 更新 TabBar 状态
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ active: -1 }) // 商品详情页不需要高亮 TabBar
    }

    // 获取购物车数量
    let that = this
    util.request(api.CartGoodsCount).then(function(res) {
      if (res.errno === 0) {
        that.setData({ cartGoodsCount: res.data })
      }
    })

    // 页面浏览埋点
    if (this.data.goods && this.data.goods.id) {
      tracker.trackPageView('商品详情-' + this.data.goods.name)
    }
  },

  // 获取商品信息
  getGoodsInfo() {
    let that = this
    util.request(api.GoodsDetail, { id: this.data.id }).then(function(res) {
      if (res.errno === 0 && res.data && res.data.info) {
        let info = res.data.info
        let gallery = info.gallery ? JSON.parse(info.gallery) : [info.picUrl]
        if (!gallery || gallery.length === 0) {
          gallery = [info.picUrl]
        }

        that.setData({
          goods: info,
          gallery: gallery,
          attribute: res.data.attribute || [],
          specificationList: res.data.specificationList || [],
          productList: res.data.productList || [],
          brand: res.data.brand,
          issueList: res.data.issue || [],
          userHasCollect: res.data.userHasCollect || 0,
          checkedSpecPrice: info.retailPrice,
          tmpPicUrl: info.picUrl
        })

        // 获取推荐商品
        that.getGoodsRelated()
        // 获取 SKU 列表
        that.getSkuList()
        // 获取特卖信息
        that.getFlashSaleInfo()

        // 商品浏览埋点
        tracker.trackGoodsView(info.id, info.name, info.retailPrice, info.categoryId)
      } else {
        util.showErrorToast('商品信息加载失败')
        setTimeout(() => wx.navigateBack(), 1500)
      }
    }).catch(function(err) {
      console.error('获取商品详情失败:', err)
      util.showErrorToast('网络错误')
    })
  },

  // 获取商品特卖信息
  getFlashSaleInfo() {
    let that = this
    util.request(api.FlashSaleGoods, { goodsId: this.data.id }).then(function(res) {
      if (res.errno === 0 && res.data) {
        that.setData({
          flashSale: res.data,
          flashSaleId: res.data.id
        })
      }
    })
  },

  // 获取 SKU 列表
  getSkuList() {
    let that = this
    util.request(api.ClothingSkuList, { goodsId: this.data.id }).then(function(res) {
      if (res.errno === 0 && res.data) {
        that.setData({
          skuList: res.data.skuList || [],
          skuColors: res.data.colors || [],
          skuSizes: res.data.sizes || []
        })
      }
    })
  },

  // 打开 SKU 选择器
  openSkuPicker() {
    this.setData({ showSkuPicker: true })
  },

  // 关闭 SKU 选择器
  closeSkuPicker() {
    this.setData({ showSkuPicker: false })
  },

  // SKU 图片切换
  onSkuImageChange(e) {
    if (e.detail.image) {
      this.setData({ tmpPicUrl: e.detail.image })
    }
  },

  // SKU 加入购物车
  skuAddToCart(e) {
    let that = this
    let { skuId, color, size, quantity } = e.detail

    util.request(api.CartAdd, {
      goodsId: this.data.goods.id,
      number: quantity,
      productId: 0,
      skuId: skuId,
      color: color,
      size: size
    }, 'POST').then(function(res) {
      if (res.errno === 0) {
        wx.showToast({ title: '添加成功' })
        that.setData({
          showSkuPicker: false,
          cartGoodsCount: res.data
        })
        // 加购埋点
        tracker.trackAddCart(that.data.goods.id, that.data.goods.name, that.data.goods.retailPrice, quantity, skuId)
      } else {
        wx.showToast({ title: res.errmsg, icon: 'none' })
      }
    })
  },

  // SKU 立即购买
  skuBuyNow(e) {
    let that = this
    let { skuId, color, size, quantity } = e.detail

    util.request(api.CartFastAdd, {
      goodsId: this.data.goods.id,
      number: quantity,
      productId: 0,
      skuId: skuId,
      color: color,
      size: size
    }, 'POST').then(function(res) {
      if (res.errno === 0) {
        wx.setStorageSync('cartId', res.data)
        that.setData({ showSkuPicker: false })
        wx.navigateTo({
          url: '/pages/confirm_order/confirm_order'
        })
      } else {
        wx.showToast({ title: res.errmsg, icon: 'none' })
      }
    })
  },

  // 获取推荐商品
  getGoodsRelated() {
    let that = this
    util.request(api.GoodsRelated, { id: this.data.id }).then(function(res) {
      if (res.errno === 0) {
        that.setData({
          relatedGoods: res.data.list || []
        })
      }
    })
  },

  onGoodsDetailImageError(e) {
    const { source, index } = e.currentTarget.dataset
    const defaultImage = this.data.defaultImage
    if (source === 'gallery') {
      if (this.data.gallery[index] !== defaultImage) {
        this.setData({
          [`gallery[${index}]`]: defaultImage
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

  onSwiperChange(e) {
    const current = e.detail.current || 0
    this.setData({
      currentSwiper: current + 1
    })
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id
    if (!id) {
      return
    }
    wx.navigateTo({
      url: `/pages/goods_detail/goods_detail?id=${id}`
    })
  },

  // 添加/取消收藏
  addCollectOrNot() {
    let that = this
    util.request(api.CollectAddOrDelete, {
      type: 0,
      valueId: this.data.id
    }, 'POST').then(function(res) {
      const isCollect = that.data.userHasCollect !== 1
      if (that.data.userHasCollect === 1) {
        that.setData({
          collect: false,
          userHasCollect: 0
        })
      } else {
        that.setData({
          collect: true,
          userHasCollect: 1
        })
      }
      // 收藏埋点
      tracker.trackCollect(that.data.goods.id, that.data.goods.name, isCollect)
    })
  },

  // 规格选择
  clickSkuValue(e) {
    let specName = e.currentTarget.dataset.name
    let specValueId = e.currentTarget.dataset.valueId
    let _specificationList = this.data.specificationList

    for (let i = 0; i < _specificationList.length; i++) {
      if (_specificationList[i].name === specName) {
        for (let j = 0; j < _specificationList[i].valueList.length; j++) {
          if (_specificationList[i].valueList[j].id === specValueId) {
            _specificationList[i].valueList[j].checked = !_specificationList[i].valueList[j].checked
          } else {
            _specificationList[i].valueList[j].checked = false
          }
        }
      }
    }

    this.setData({ specificationList: _specificationList })
    this.changeSpecInfo()
  },

  // 获取选中的规格信息
  getCheckedSpecValue() {
    let checkedValues = []
    let _specificationList = this.data.specificationList
    for (let i = 0; i < _specificationList.length; i++) {
      let _checkedObj = {
        name: _specificationList[i].name,
        valueId: 0,
        valueText: ''
      }
      for (let j = 0; j < _specificationList[i].valueList.length; j++) {
        if (_specificationList[i].valueList[j].checked) {
          _checkedObj.valueId = _specificationList[i].valueList[j].id
          _checkedObj.valueText = _specificationList[i].valueList[j].value
        }
      }
      checkedValues.push(_checkedObj)
    }
    return checkedValues
  },

  // 判断规格是否选择完整
  isCheckedAllSpec() {
    return !this.getCheckedSpecValue().some(function(v) {
      return v.valueId === 0
    })
  },

  getCheckedSpecKey() {
    let checkedValue = this.getCheckedSpecValue().map(function(v) {
      return v.valueText
    })
    return checkedValue
  },

  // 规格改变时重新计算价格
  changeSpecInfo() {
    let checkedNameValue = this.getCheckedSpecValue()

    // 设置选择的信息
    let checkedValue = checkedNameValue.filter(function(v) {
      return v.valueId !== 0
    }).map(function(v) {
      return v.valueText
    })

    if (checkedValue.length > 0) {
      this.setData({
        tmpSpecText: checkedValue.join('　')
      })
    } else {
      this.setData({
        tmpSpecText: '请选择规格数量'
      })
    }

    if (this.isCheckedAllSpec()) {
      let checkedProductArray = this.getCheckedProductItem(this.getCheckedSpecKey())
      if (!checkedProductArray || checkedProductArray.length === 0) {
        this.setData({
          checkedSpecText: '规格数量选择',
          checkedSpecPrice: this.data.goods.retailPrice,
          soldout: true
        })
        return
      }

      let checkedProduct = checkedProductArray[0]
      if (checkedProduct.number > 0) {
        this.setData({
          checkedSpecText: this.data.tmpSpecText + ' x ' + this.data.number,
          checkedSpecPrice: checkedProduct.price,
          tmpPicUrl: checkedProduct.url,
          soldout: false
        })
      } else {
        this.setData({
          checkedSpecText: this.data.tmpSpecText,
          checkedSpecPrice: checkedProduct.price,
          tmpPicUrl: checkedProduct.url,
          soldout: true
        })
      }
    } else {
      this.setData({
        checkedSpecText: '规格数量选择',
        checkedSpecPrice: this.data.goods.retailPrice,
        soldout: false
      })
    }
  },

  // 获取选中的产品
  getCheckedProductItem(key) {
    return this.data.productList.filter(function(v) {
      return v.specifications.toString() === key.toString()
    })
  },

  // 数量增减
  cutNumber() {
    if (this.data.number > 1) {
      this.setData({ number: this.data.number - 1 })
      this.changeSpecInfo()
    }
  },

  addNumber() {
    this.setData({ number: this.data.number + 1 })
    this.changeSpecInfo()
  },

  // 切换规格弹窗
  switchAttrPop() {
    if (!this.data.openAttr) {
      this.setData({ openAttr: true })
    }
  },

  closeAttr() {
    this.setData({ openAttr: false })
  },

  // 分享
  shareFriendOrCircle() {
    this.setData({ openShare: true })
  },

  closeShare() {
    this.setData({ openShare: false })
  },

  // 保存分享图
  saveShare() {
    let that = this
    wx.downloadFile({
      url: that.data.shareImage,
      success: function(res) {
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: function() {
            wx.showModal({
              title: '生成海报成功',
              content: '海报已成功保存到相册，可以分享到朋友圈了',
              showCancel: false,
              confirmText: '好的',
              confirmColor: '#BA8D59'
            })
          },
          fail: function() {
            wx.showToast({ title: '保存失败', icon: 'none' })
          }
        })
      },
      fail: function() {
        wx.showToast({ title: '下载失败', icon: 'none' })
      }
    })
  },

  // 打开购物车页面
  openCartPage() {
    wx.switchTab({ url: '/pages/cart/cart' })
  },

  // 联系客服
  contactService() {
    wx.openCustomerServiceChat({
      extInfo: { url: '' },
      corpId: '',
      success: function(res) {
        console.log('客服窗口打开成功', res)
      },
      fail: function(err) {
        console.error('客服窗口打开失败', err)
        wx.showToast({ title: '请联系在线客服', icon: 'none' })
      }
    })
  },

  // 返回
  goBack() {
    wx.navigateBack()
  },

  // 选择收货地址
  selectAddress() {
    wx.navigateTo({
      url: '/pages/ucenter/address/address?selectMode=1'
    })
  }
})
