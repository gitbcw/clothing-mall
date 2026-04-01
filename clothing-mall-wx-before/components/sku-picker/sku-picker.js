/**
 * SKU 选择器组件 - 服装店专用（颜色+尺码）
 */
Component({
  properties: {
    // 是否显示
    visible: {
      type: Boolean,
      value: false
    },
    // 商品ID
    goodsId: {
      type: Number,
      value: 0
    },
    // 商品图片
    goodsImage: {
      type: String,
      value: ''
    },
    // 商品价格
    goodsPrice: {
      type: Number,
      value: 0
    },
    // SKU 列表
    skuList: {
      type: Array,
      value: []
    },
    // 颜色列表
    colors: {
      type: Array,
      value: []
    },
    // 尺码列表
    sizes: {
      type: Array,
      value: []
    }
  },

  data: {
    selectedColor: '',
    selectedSize: '',
    selectedSku: null,
    availableSizes: [],
    quantity: 1,
    maxQuantity: 99
  },

  observers: {
    'skuList, selectedColor': function(skuList, selectedColor) {
      if (selectedColor && skuList.length > 0) {
        // 根据选中的颜色过滤可用尺码
        const availableSizes = skuList.filter(sku => sku.color === selectedColor);
        this.setData({ availableSizes });
      }
    },
    'selectedColor, selectedSize': function(color, size) {
      if (color && size) {
        // 查找对应的 SKU
        const sku = this.data.skuList.find(s => s.color === color && s.size === size);
        this.setData({
          selectedSku: sku,
          maxQuantity: sku ? Math.min(sku.stock, 99) : 99
        });
      }
    }
  },

  methods: {
    // 关闭选择器
    onClose() {
      this.triggerEvent('close');
    },

    // 选择颜色
    onSelectColor(e) {
      const color = e.currentTarget.dataset.color;
      const image = e.currentTarget.dataset.image;

      // 如果点击已选中的颜色，则取消选择
      if (this.data.selectedColor === color) {
        this.setData({
          selectedColor: '',
          selectedSize: '',
          selectedSku: null,
          availableSizes: []
        });
      } else {
        this.setData({
          selectedColor: color,
          selectedSize: '',
          selectedSku: null
        });

        // 更新商品图片
        if (image) {
          this.triggerEvent('imagechange', { image });
        }
      }
    },

    // 选择尺码
    onSelectSize(e) {
      const size = e.currentTarget.dataset.size;
      const stock = e.currentTarget.dataset.stock;

      // 库存为0不可选
      if (stock <= 0) {
        wx.showToast({ title: '该尺码已售罄', icon: 'none' });
        return;
      }

      if (this.data.selectedSize === size) {
        this.setData({
          selectedSize: '',
          selectedSku: null
        });
      } else {
        this.setData({
          selectedSize: size
        });
      }
    },

    // 减少数量
    onDecrease() {
      if (this.data.quantity > 1) {
        this.setData({
          quantity: this.data.quantity - 1
        });
      }
    },

    // 增加数量
    onIncrease() {
      if (this.data.quantity < this.data.maxQuantity) {
        this.setData({
          quantity: this.data.quantity + 1
        });
      }
    },

    // 加入购物车
    onAddToCart() {
      if (!this.validateSelection()) return;

      this.triggerEvent('addcart', {
        skuId: this.data.selectedSku.id,
        color: this.data.selectedColor,
        size: this.data.selectedSize,
        quantity: this.data.quantity,
        price: this.data.selectedSku.price
      });
    },

    // 立即购买
    onBuyNow() {
      if (!this.validateSelection()) return;

      this.triggerEvent('buynow', {
        skuId: this.data.selectedSku.id,
        color: this.data.selectedColor,
        size: this.data.selectedSize,
        quantity: this.data.quantity,
        price: this.data.selectedSku.price
      });
    },

    // 验证选择
    validateSelection() {
      if (!this.data.selectedColor) {
        wx.showToast({ title: '请选择颜色', icon: 'none' });
        return false;
      }
      if (!this.data.selectedSize) {
        wx.showToast({ title: '请选择尺码', icon: 'none' });
        return false;
      }
      if (!this.data.selectedSku) {
        wx.showToast({ title: '该规格暂无库存', icon: 'none' });
        return false;
      }
      if (this.data.selectedSku.stock < this.data.quantity) {
        wx.showToast({ title: '库存不足', icon: 'none' });
        return false;
      }
      return true;
    },

    // 重置选择
    reset() {
      this.setData({
        selectedColor: '',
        selectedSize: '',
        selectedSku: null,
        availableSizes: [],
        quantity: 1
      });
    }
  }
});
