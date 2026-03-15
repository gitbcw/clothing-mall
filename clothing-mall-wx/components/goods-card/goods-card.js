Component({
  properties: {
    // 商品数据
    goods: {
      type: Object,
      value: {}
    },
    // 显示模式: grid(网格) | list(列表)
    mode: {
      type: String,
      value: 'grid'
    },
    // 是否显示原价
    showOriginPrice: {
      type: Boolean,
      value: true
    },
    // 是否显示销量
    showSales: {
      type: Boolean,
      value: false
    }
  },

  data: {
    defaultImage: '/images/default-goods.png'
  },

  methods: {
    onGoodsTap(e) {
      const { id } = e.currentTarget.dataset
      this.triggerEvent('click', { id, goods: this.data.goods })
      wx.navigateTo({
        url: `/pages/goods/goods?id=${id}`
      })
    },

    onImageError() {
      // 图片加载失败时使用默认图
    },

    onImageLoad() {
      // 图片加载完成
    }
  }
})
