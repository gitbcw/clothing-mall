const util = require('../../../utils/util.js');
const api = require('../../../config/api.js');

const app = getApp();

Page({
  data: {
    manual: false,
    imageUrl: '',
    // AI 识别结果
    recognizeResult: {
      name: '',
      category: '',
      color: '',
      size: '',
      material: '',
      style: '',
      season: '',
      pattern: '',
      brief: '',
      confidence: 0
    },
    // 分类选项
    categoryOptions: ['上衣', '裤装', '裙装', '外套', '连衣裙', '配饰', '鞋履', '内衣', '其他'],
    categoryIndex: 0,
    // 颜色选项
    colorOptions: ['黑色', '白色', '灰色', '红色', '蓝色', '绿色', '黄色', '粉色', '紫色', '橙色', '棕色', '米色', '其他'],
    colorIndex: 0,
    // 尺码选项
    sizeOptions: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '均码'],
    sizeIndex: 2,
    // 风格选项
    styleOptions: ['休闲', '正式', '运动', '复古', '潮流', '简约', '其他'],
    styleIndex: 0,
    // 季节选项
    seasonOptions: ['春季', '夏季', '秋季', '冬季', '四季'],
    seasonIndex: 4,
    submitting: false,
    skuList: []
  },

  onLoad(options) {
    if (options.manual === 'true') {
      this.setData({ manual: true });
    } else if (options.result) {
      try {
        const result = JSON.parse(decodeURIComponent(options.result));
        this.setData({
          recognizeResult: result,
          imageUrl: options.imageUrl ? decodeURIComponent(options.imageUrl) : ''
        });
        // 设置选择器索引
        this.setPickerIndexes(result);
      } catch (e) {
        console.error('解析识别结果失败', e);
      }
    }
  },

  setPickerIndexes(result) {
    const data = this.data;
    // 分类索引
    const catIndex = data.categoryOptions.indexOf(result.category);
    if (catIndex > -1) this.setData({ categoryIndex: catIndex });
    // 颜色索引
    const colorIdx = data.colorOptions.indexOf(result.color);
    if (colorIdx > -1) this.setData({ colorIndex: colorIdx });
    // 尺码索引
    const sizeIdx = data.sizeOptions.indexOf(result.size);
    if (sizeIdx > -1) this.setData({ sizeIndex: sizeIdx });
    // 风格索引
    const styleIdx = data.styleOptions.indexOf(result.style);
    if (styleIdx > -1) this.setData({ styleIndex: styleIdx });
    // 季节索引
    const seasonIdx = data.seasonOptions.indexOf(result.season);
    if (seasonIdx > -1) this.setData({ seasonIndex: seasonIdx });
  },

  // 输入框变化
  onInputChange(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({
      ['recognizeResult.' + field]: e.detail.value
    });
  },

  // 分类选择
  onCategoryChange(e) {
    this.setData({
      categoryIndex: e.detail.value,
      'recognizeResult.category': this.data.categoryOptions[e.detail.value]
    });
  },

  // 颜色选择
  onColorChange(e) {
    this.setData({
      colorIndex: e.detail.value,
      'recognizeResult.color': this.data.colorOptions[e.detail.value]
    });
  },

  // 尺码选择
  onSizeChange(e) {
    this.setData({
      sizeIndex: e.detail.value,
      'recognizeResult.size': this.data.sizeOptions[e.detail.value]
    });
  },

  // 风格选择
  onStyleChange(e) {
    this.setData({
      styleIndex: e.detail.value,
      'recognizeResult.style': this.data.styleOptions[e.detail.value]
    });
  },

  // 季节选择
  onSeasonChange(e) {
    this.setData({
      seasonIndex: e.detail.value,
      'recognizeResult.season': this.data.seasonOptions[e.detail.value]
    });
  },

  // 提交创建商品
  submitGoods() {
    const data = this.data;
    if (!data.recognizeResult.name) {
      wx.showToast({ title: '请输入商品名称', icon: 'none' });
      return;
    }

    this.setData({ submitting: true });

    const requestData = {
      name: data.recognizeResult.name,
      brief: data.recognizeResult.brief,
      sourceImage: data.imageUrl
    };

    // 如果有 SKU 列表，附带提交
    if (data.skuList && data.skuList.length > 0) {
      requestData.skus = data.skuList.filter(s => s.color || s.size).map(s => ({
        color: s.color || '',
        size: s.size || '',
        price: s.price || 0,
        stock: s.stock || 0
      }));
    }

    util.request(api.ManagerGoodsCreate, requestData, 'POST').then(res => {
      if (res.errno === 0) {
        wx.showToast({ title: '商品创建成功', icon: 'success' });
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      } else {
        wx.showToast({ title: res.errmsg || '创建失败', icon: 'none' });
      }
      this.setData({ submitting: false });
    }).catch(() => {
      wx.showToast({ title: '创建失败', icon: 'none' });
      this.setData({ submitting: false });
    });
  },

  // 添加 SKU 行
  addSku() {
    const skuList = this.data.skuList;
    skuList.push({ color: '', size: '', price: '', stock: '' });
    this.setData({ skuList });
  },

  // 删除 SKU 行
  removeSku(e) {
    const index = e.currentTarget.dataset.index;
    const skuList = this.data.skuList;
    skuList.splice(index, 1);
    this.setData({ skuList });
  },

  // SKU 字段输入
  onSkuInput(e) {
    const { index, field } = e.currentTarget.dataset;
    const value = e.detail.value;
    this.setData({
      ['skuList[' + index + '].' + field]: value
    });
  },

  // 暂存草稿
  saveDraft() {
    const data = this.data;
    const draftData = {
      ...data.recognizeResult,
      imageUrl: data.imageUrl,
      manual: data.manual,
      savedAt: new Date().toISOString()
    };
    
    // 保存到本地存储
    let drafts = wx.getStorageSync('skuDrafts') || [];
    drafts.push(draftData);
    wx.setStorageSync('skuDrafts', drafts);
    
    wx.showToast({ title: '已保存草稿', icon: 'success' });
    setTimeout(() => {
      wx.navigateBack();
    }, 1500);
  }
})
