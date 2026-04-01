/**
 * 尺码选择器组件 - 服装店专用（只选尺码，价格按标价）
 */
Component({
  properties: {
    visible: {
      type: Boolean,
      value: false
    },
    goodsId: {
      type: Number,
      value: 0
    },
    goodsImage: {
      type: String,
      value: ''
    },
    goodsPrice: {
      type: Number,
      value: 0
    }
  },

  data: {
    selectedSize: '',
    quantity: 1,
    // 写死的尺码列表
    sizes: ['S', 'M', 'L', 'XL']
  },

  methods: {
    onClose() {
      this.triggerEvent('close');
    },

    onSelectSize(e) {
      const size = e.currentTarget.dataset.size;
      this.setData({
        selectedSize: this.data.selectedSize === size ? '' : size
      });
    },

    onDecrease() {
      if (this.data.quantity > 1) {
        this.setData({ quantity: this.data.quantity - 1 });
      }
    },

    onIncrease() {
      if (this.data.quantity < 99) {
        this.setData({ quantity: this.data.quantity + 1 });
      }
    },

    onAddToCart() {
      if (!this.data.selectedSize) {
        wx.showToast({ title: '请选择尺码', icon: 'none' });
        return;
      }
      this.triggerEvent('addcart', {
        size: this.data.selectedSize,
        quantity: this.data.quantity
      });
    },

    onBuyNow() {
      if (!this.data.selectedSize) {
        wx.showToast({ title: '请选择尺码', icon: 'none' });
        return;
      }
      this.triggerEvent('buynow', {
        size: this.data.selectedSize,
        quantity: this.data.quantity
      });
    },

    reset() {
      this.setData({
        selectedSize: '',
        quantity: 1
      });
    }
  }
});
