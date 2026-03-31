const util = require('../../../utils/util.js');
const api = require('../../../config/api.js');

Page({
  data: {
    goodsId: null,
    goods: {},
    galleryList: [],
    skuList: [],
    loading: true
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ goodsId: parseInt(options.id) });
      this.getGoodsDetail();
    } else {
      this.setData({ loading: false });
    }
  },

  getGoodsDetail() {
    let that = this;
    this.setData({ loading: true });

    util.request(api.ManagerGoodsDetail, { id: this.data.goodsId }).then(function(res) {
      if (res.errno === 0) {
        const data = res.data;
        const goods = data.goods || {};
        const skuList = (data.skuList || []).map(function(sku) {
          return {
            id: sku.id,
            color: sku.color || '',
            size: sku.size || '',
            price: sku.price ? sku.price.toString() : '',
            stock: sku.stock !== undefined ? sku.stock.toString() : ''
          };
        });

        that.setData({
          goods: goods,
          galleryList: goods.gallery ? Array.from(goods.gallery) : [],
          skuList: skuList,
          loading: false
        });
      } else {
        that.setData({ loading: false });
        wx.showToast({ title: '商品不存在', icon: 'none' });
      }
    }).catch(function() {
      that.setData({ loading: false });
    });
  },

  // ========== 图片操作 ==========

  chooseMainImage() {
    let that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        const tempPath = res.tempFilePaths[0];
        that.uploadImage(tempPath, function(url) {
          that.setData({ 'goods.picUrl': url });
        });
      }
    });
  },

  chooseGalleryImage() {
    const remaining = 9 - this.data.galleryList.length;
    if (remaining <= 0) return;
    let that = this;
    wx.chooseImage({
      count: remaining,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        const tasks = res.tempFilePaths.map(function(path) {
          return new Promise(function(resolve) {
            that.uploadImage(path, resolve);
          });
        });
        Promise.all(tasks).then(function(urls) {
          that.setData({
            galleryList: that.data.galleryList.concat(urls)
          });
        });
      }
    });
  },

  removeGallery(e) {
    const index = e.currentTarget.dataset.index;
    this.data.galleryList.splice(index, 1);
    this.setData({ galleryList: this.data.galleryList });
  },

  uploadImage(filePath, callback) {
    util.uploadFile(filePath).then(function(url) {
      callback(url);
    }).catch(function() {
      callback(null);
    });
  },

  // ========== 表单输入 ==========

  onNameInput(e) { this.setData({ 'goods.name': e.detail.value }); },
  onBriefInput(e) { this.setData({ 'goods.brief': e.detail.value }); },
  onCounterPriceInput(e) { this.setData({ 'goods.counterPrice': e.detail.value }); },
  onRetailPriceInput(e) { this.setData({ 'goods.retailPrice': e.detail.value }); },

  // ========== SKU 操作 ==========

  addSku() {
    this.data.skuList.push({ color: '', size: '', price: '', stock: '' });
    this.setData({ skuList: this.data.skuList });
  },

  removeSku(e) {
    const index = e.currentTarget.dataset.index;
    this.data.skuList.splice(index, 1);
    this.setData({ skuList: this.data.skuList });
  },

  onSkuInput(e) {
    const { index, field } = e.currentTarget.dataset;
    this.setData({ ['skuList[' + index + '].' + field]: e.detail.value });
  },

  // ========== 保存操作 ==========

  collectFormData() {
    const goods = this.data.goods;
    const data = {
      name: goods.name,
      brief: goods.brief || '',
      picUrl: goods.picUrl || '',
      gallery: this.data.galleryList,
      counterPrice: goods.counterPrice ? parseFloat(goods.counterPrice) : null,
      retailPrice: goods.retailPrice ? parseFloat(goods.retailPrice) : null,
      skus: this.data.skuList.filter(function(s) {
        return s.color || s.size;
      }).map(function(s) {
        return {
          id: s.id || undefined,
          color: s.color,
          size: s.size,
          price: s.price ? parseFloat(s.price) : null,
          stock: s.stock ? parseInt(s.stock) : 0
        };
      })
    };
    if (this.data.goodsId) {
      data.id = this.data.goodsId;
    }
    return data;
  },

  validateForm() {
    if (!this.data.goods.name || !this.data.goods.name.trim()) {
      wx.showToast({ title: '请输入商品名称', icon: 'none' });
      return false;
    }
    return true;
  },

  // 保存草稿
  onSaveDraft() {
    if (!this.validateForm()) return;
    let that = this;
    const data = this.collectFormData();

    const api_url = this.data.goodsId ? api.ManagerGoodsEdit : api.ManagerGoodsCreate;
    util.request(api_url, data, 'POST').then(function(res) {
      if (res.errno === 0) {
        wx.showToast({ title: '保存成功', icon: 'success' });
        setTimeout(function() { wx.navigateBack(); }, 1000);
      } else {
        wx.showToast({ title: res.errmsg || '保存失败', icon: 'none' });
      }
    });
  },

  // 保存并上架
  onPublish() {
    if (!this.validateForm()) return;
    let that = this;
    const data = this.collectFormData();

    // 先保存
    const saveApi = this.data.goodsId ? api.ManagerGoodsEdit : api.ManagerGoodsCreate;
    util.request(saveApi, data, 'POST').then(function(res) {
      if (res.errno === 0) {
        const goodsId = that.data.goodsId || res.data;
        // 再上架
        util.request(api.ManagerGoodsPublish, { id: goodsId }, 'POST').then(function(res2) {
          if (res2.errno === 0) {
            wx.showToast({ title: '上架成功', icon: 'success' });
            setTimeout(function() { wx.navigateBack(); }, 1000);
          } else {
            wx.showToast({ title: '保存成功但上架失败', icon: 'none' });
          }
        });
      } else {
        wx.showToast({ title: res.errmsg || '保存失败', icon: 'none' });
      }
    });
  },

  // 下架
  onUnpublish() {
    if (!this.data.goodsId) return;
    let that = this;
    util.request(api.ManagerGoodsUnpublish, { id: this.data.goodsId }, 'POST').then(function(res) {
      if (res.errno === 0) {
        wx.showToast({ title: '已下架', icon: 'success' });
        that.getGoodsDetail();
      } else {
        wx.showToast({ title: res.errmsg || '下架失败', icon: 'none' });
      }
    });
  }
});
