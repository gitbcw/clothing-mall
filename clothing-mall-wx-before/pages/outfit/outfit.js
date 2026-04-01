/**
 * 穿搭推荐页面
 * 功能：
 * - FIT-005: 横向滑动展示穿搭推荐
 * - FIT-006: 左固定商品+右滑动商品
 * - FIT-007: 点击进入商品详情
 */
var util = require('../../utils/util.js');
var api = require('../../config/api.js');

Page({
  data: {
    outfitList: [],  // 穿搭推荐列表
    currentOutfit: null,  // 当前选中的穿搭
    relatedGoods: [],  // 关联商品
    page: 1,
    limit: 10,
    loading: false,
    finished: false
  },

  onLoad: function(options) {
    this.getOutfitList();
  },

  onShow: function() {
    // 页面显示时刷新
  },

  onPullDownRefresh: function() {
    // 下拉刷新
    this.setData({
      page: 1,
      outfitList: [],
      finished: false
    });
    this.getOutfitList();
    wx.stopPullDownRefresh();
  },

  onReachBottom: function() {
    // 上拉加载更多
    if (!this.data.finished && !this.data.loading) {
      this.setData({
        page: this.data.page + 1
      });
      this.getOutfitList();
    }
  },

  // 获取穿搭推荐列表
  getOutfitList: function() {
    if (this.data.finished || this.data.loading) return;

    this.setData({ loading: true });

    // TODO: 替换为真实 API
    // util.request(api.OutfitList, {
    //   page: this.data.page,
    //   limit: this.data.limit
    // }).then(res => {
    //   if (res.errno === 0) {
    //     this.setData({
    //       outfitList: this.data.page === 1 ? res.data.list : this.data.outfitList.concat(res.data.list),
    //       finished: res.data.list.length < this.data.limit
    //     });
    //   }
    //   this.setData({ loading: false });
    // });

    // Mock 数据
    setTimeout(() => {
      const mockOutfits = this.generateMockData();
      this.setData({
        outfitList: this.data.page === 1 ? mockOutfits : this.data.outfitList.concat(mockOutfits),
        finished: this.data.page >= 3,  // 模拟3页数据
        loading: false
      });
    }, 500);
  },

  // 生成 Mock 数据
  generateMockData: function() {
    const outfits = [
      {
        id: 1,
        posterUrl: 'https://img.yzcdn.cn/vant/cat.jpeg',
        name: '春日清新穿搭',
        subtitle: '适合踏青出游',
        sortOrder: 1,
        goodsList: [
          { id: 101, name: '白色T恤', price: 99, picUrl: 'https://img.yzcdn.cn/vant/cat.jpeg' },
          { id: 102, name: '牛仔裤', price: 199, picUrl: 'https://img.yzcdn.cn/vant/cat.jpeg' },
          { id: 103, name: '帆布鞋', price: 149, picUrl: 'https://img.yzcdn.cn/vant/cat.jpeg' }
        ]
      },
      {
        id: 2,
        posterUrl: 'https://img.yzcdn.cn/vant/cat.jpeg',
        name: '职场优雅风',
        subtitle: '干练又不失女人味',
        sortOrder: 2,
        goodsList: [
          { id: 201, name: '衬衫', price: 159, picUrl: 'https://img.yzcdn.cn/vant/cat.jpeg' },
          { id: 202, name: '西装裤', price: 229, picUrl: 'https://img.yzcdn.cn/vant/cat.jpeg' },
          { id: 203, name: '高跟鞋', price: 299, picUrl: 'https://img.yzcdn.cn/vant/cat.jpeg' },
          { id: 204, name: '手提包', price: 399, picUrl: 'https://img.yzcdn.cn/vant/cat.jpeg' }
        ]
      },
      {
        id: 3,
        posterUrl: 'https://img.yzcdn.cn/vant/cat.jpeg',
        name: '休闲运动风',
        subtitle: '舒适自在',
        sortOrder: 3,
        goodsList: [
          { id: 301, name: '卫衣', price: 179, picUrl: 'https://img.yzcdn.cn/vant/cat.jpeg' },
          { id: 302, name: '运动裤', price: 189, picUrl: 'https://img.yzcdn.cn/vant/cat.jpeg' },
          { id: 303, name: '运动鞋', price: 249, picUrl: 'https://img.yzcdn.cn/vant/cat.jpeg' }
        ]
      }
    ];

    // 根据页数返回不同的数据
    const start = (this.data.page - 1) * this.data.limit;
    return outfits.slice(start % 3).concat(outfits.slice(0, start % 3));
  },

  // 选择穿搭
  onSelectOutfit: function(e) {
    const index = e.currentTarget.dataset.index;
    const outfit = this.data.outfitList[index];

    this.setData({
      currentOutfit: outfit,
      relatedGoods: outfit.goodsList || []
    });
  },

  // 隐藏穿搭详情
  onCloseOutfitDetail: function() {
    this.setData({
      currentOutfit: null,
      relatedGoods: []
    });
  },

  // 点击商品进入详情
  onGoodsTap: function(e) {
    const goodsId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/goods/goods?id=' + goodsId
    });
  },

  // 添加商品到购物车
  onAddToCart: function(e) {
    const goodsId = e.currentTarget.dataset.id;
    const goods = this.findGoodsById(goodsId);

    if (!goods) return;

    util.request(api.CartAdd, {
      goodsId: goodsId,
      number: 1,
      productId: 0,
      skuId: 0,
      color: '',
      size: ''
    }, 'POST').then(res => {
      if (res.errno === 0) {
        wx.showToast({ title: '已添加到购物车' });
      } else {
        wx.showToast({ title: res.errmsg, icon: 'none' });
      }
    }).catch(err => {
      wx.showToast({ title: '添加失败', icon: 'none' });
    });
  },

  // 根据ID查找商品
  findGoodsById: function(goodsId) {
    const allGoods = [];
    this.data.outfitList.forEach(outfit => {
      if (outfit.goodsList) {
        allGoods.push(...outfit.goodsList);
      }
    });
    return allGoods.find(g => g.id === goodsId);
  },

  // 立即购买
  onBuyNow: function(e) {
    const goodsId = e.currentTarget.dataset.id;
    const goods = this.findGoodsById(goodsId);

    if (!goods) return;

    util.request(api.CartFastAdd, {
      goodsId: goodsId,
      number: 1,
      productId: 0,
      skuId: 0,
      color: '',
      size: ''
    }, 'POST').then(res => {
      if (res.errno === 0) {
        wx.setStorageSync('cartId', res.data);
        wx.navigateTo({
          url: '/pages/checkout/checkout'
        });
      } else {
        wx.showToast({ title: res.errmsg, icon: 'none' });
      }
    }).catch(err => {
      wx.showToast({ title: '操作失败', icon: 'none' });
    });
  },

  onShareAppMessage: function() {
    return {
      title: '穿搭推荐',
      desc: '发现好看的穿搭',
      path: '/pages/outfit/outfit'
    };
  }
});