const util = require('../../../utils/util.js');
const api = require('../../../config/api.js');

// 防抖函数
function debounce(fn, delay) {
  let timer = null;
  return function(...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

Page({
  data: {
    // 模式
    isEdit: false,
    navTitle: '新建商品',
    statusBarHeight: 20,
    navBarHeight: 44,
    // 商品数据
    goodsId: null,
    goods: {},
    galleryList: [],
    skuList: [],
    loading: true,
    submitting: false,
    // 分类
    categoryList: [],
    showCategoryPicker: false,
    // 场景标签
    presetScenes: [
      '日常通勤', '约会聚餐', '度假旅行', '运动健身', '居家休闲', '商务正式'
    ],
    customSceneInput: '',
    showCustomSceneInput: false,
    scenes: [],
    sceneMap: {},
    presetSceneMap: {},
    // 商品参数
    params: [],
    // AI 识别
    aiRecognizing: false,
    aiConfidence: null,
    aiRecognized: false,
    // 预览
    showPreview: false,
    previewData: null,
    // 草稿（仅新建模式）
    hasDraft: false
  },

  onLoad(options) {
    const { system } = wx.getDeviceInfo();
    const { statusBarHeight } = wx.getWindowInfo();
    const isIOS = system.indexOf('iOS') > -1;
    this.setData({
      statusBarHeight,
      navBarHeight: isIOS ? 44 : 48
    });
    // 初始化预设场景查找表
    var psm = {};
    this.data.presetScenes.forEach(function(s) { psm[s] = true; });
    this.setData({ presetSceneMap: psm });

    if (options.id) {
      // 编辑模式
      this.setData({ isEdit: true, navTitle: '编辑商品', goodsId: parseInt(options.id) });
      this.getCategoryList();
      this.getGoodsDetail();
    } else {
      // 新建模式
      this.setData({ isEdit: false, navTitle: '新建商品' });
      this.getCategoryList();
      this.loadDraft();
      this.setData({ loading: false });
    }
  },

  // ========== 分类 ==========

  getCategoryList() {
    let that = this;
    util.request(api.ManagerGoodsCategory).then(function(res) {
      if (res.errno === 0) {
        that.setData({
          categoryList: res.data.list || res.data || []
        });
      }
    });
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

        // 解析 sceneTags
        let scenes = [];
        if (goods.sceneTags) {
          try { scenes = JSON.parse(goods.sceneTags); } catch (e) {}
        }

        // 解析 goodsParams
        let params = [];
        if (goods.goodsParams) {
          try { params = JSON.parse(goods.goodsParams); } catch (e) {}
        }

        // 查找分类名称
        let categoryName = '';
        if (goods.categoryId && that.data.categoryList.length > 0) {
          const cat = that.data.categoryList.find(function(c) { return c.id === goods.categoryId; });
          if (cat) categoryName = cat.name;
        }

        that.setData({
          goods: Object.assign(goods, {
            categoryName: categoryName,
            specialPrice: goods.specialPrice ? goods.specialPrice.toString() : '',
            counterPrice: goods.counterPrice ? goods.counterPrice.toString() : '',
            retailPrice: goods.retailPrice ? goods.retailPrice.toString() : '',
            detail: goods.detail || ''
          }),
          galleryList: goods.gallery ? Array.from(goods.gallery) : [],
          skuList: skuList,
          scenes: scenes,
          sceneMap: that._buildSceneMap(scenes),
          params: params,
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
        // 先显示本地图片
        that.setData({ 'goods.picUrl': tempPath });
        // 仅新建模式启用 AI 识别
        if (!that.data.isEdit) {
          that.setData({ aiRecognizing: true });
        }
        // 上传图片
        that.uploadImage(tempPath, function(url) {
          if (url) {
            that.setData({ 'goods.picUrl': url });
            that.autoSaveDraft();
            // 新建模式上传成功后调用 AI 识别
            if (!that.data.isEdit) {
              that.recognizeImage(url);
            }
          } else {
            that.setData({ aiRecognizing: false });
          }
        });
      }
    });
  },

  recognizeImage(imageUrl) {
    let that = this;
    util.request(api.AiRecognizeByUrl, { imageUrl: imageUrl }, 'POST').then(function(res) {
      if (res.errno === 0 && res.data) {
        const aiData = res.data;
        const updates = {};
        if (aiData.name && !that.data.goods.name) {
          updates['goods.name'] = aiData.name;
        }
        if (aiData.brief && !that.data.goods.brief) {
          updates['goods.brief'] = aiData.brief;
        }
        if (aiData.confidence) {
          updates.aiConfidence = aiData.confidence;
          updates.aiRecognized = true;
        }
        if (aiData.category && that.data.categoryList.length > 0) {
          const matchedCategory = that.data.categoryList.find(function(c) {
            return c.name === aiData.category || c.name.indexOf(aiData.category) > -1;
          });
          if (matchedCategory) {
            updates['goods.categoryId'] = matchedCategory.id;
            updates['goods.categoryName'] = matchedCategory.name;
          }
        }
        if (aiData.style && that.data.presetScenes.indexOf(aiData.style) === -1) {
          const scenes = (that.data.scenes || []).slice();
          if (scenes.indexOf(aiData.style) === -1) {
            scenes.push(aiData.style);
            updates.scenes = scenes;
            updates.sceneMap = that._buildSceneMap(scenes);
          }
        }
        if (aiData.material || aiData.color || aiData.pattern) {
          const params = that.data.params.slice();
          if (aiData.material) params.push({ key: '面料', value: aiData.material });
          if (aiData.color) params.push({ key: '颜色', value: aiData.color });
          if (aiData.pattern) params.push({ key: '图案', value: aiData.pattern });
          updates.params = params;
        }
        updates.aiRecognizing = false;
        that.setData(updates);
        that.autoSaveDraft();
        if (aiData.isMock) {
          wx.showToast({ title: 'AI Mock 识别完成', icon: 'none' });
        } else {
          wx.showToast({ title: 'AI 识别完成', icon: 'success' });
        }
      } else {
        that.setData({ aiRecognizing: false });
        wx.showToast({ title: 'AI 识别失败', icon: 'none' });
      }
    }).catch(function() {
      that.setData({ aiRecognizing: false });
      wx.showToast({ title: 'AI 识别失败', icon: 'none' });
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
            galleryList: that.data.galleryList.concat(urls.filter(function(u) { return u; }))
          });
          that.autoSaveDraft();
        });
      }
    });
  },

  removeGallery(e) {
    const index = e.currentTarget.dataset.index;
    this.data.galleryList.splice(index, 1);
    this.setData({ galleryList: this.data.galleryList });
    this.autoSaveDraft();
  },

  uploadImage(filePath, callback) {
    util.uploadFile(filePath).then(function(url) {
      callback(url);
    }).catch(function() {
      callback(null);
    });
  },

  // ========== 表单输入 ==========

  onNameInput(e) {
    this.setData({ 'goods.name': e.detail.value });
    this.autoSaveDraft();
  },
  onBriefInput(e) {
    this.setData({ 'goods.brief': e.detail.value });
    this.autoSaveDraft();
  },
  onCounterPriceInput(e) {
    this.setData({ 'goods.counterPrice': e.detail.value });
    this.autoSaveDraft();
  },
  onRetailPriceInput(e) {
    this.setData({ 'goods.retailPrice': e.detail.value });
    this.autoSaveDraft();
  },
  onSpecialPriceInput(e) {
    this.setData({ 'goods.specialPrice': e.detail.value });
    this.autoSaveDraft();
  },
  onKeywordsInput(e) {
    this.setData({ 'goods.keywords': e.detail.value });
    this.autoSaveDraft();
  },
  onDetailInput(e) {
    this.setData({ 'goods.detail': e.detail.value });
    this.autoSaveDraft();
  },

  // ========== 分类选择 ==========

  showCategoryPicker() {
    this.setData({ showCategoryPicker: true });
  },

  onCategoryChange(e) {
    const index = e.detail.index;
    const category = this.data.categoryList[index];
    if (category) {
      this.setData({
        'goods.categoryId': category.id,
        'goods.categoryName': category.name,
        showCategoryPicker: false
      });
      this.autoSaveDraft();
    }
  },

  onCategoryClose() {
    this.setData({ showCategoryPicker: false });
  },

  // ========== 场景标签 ==========

  _buildSceneMap(scenes) {
    var map = {};
    (scenes || []).forEach(function(s) { map[s] = true; });
    return map;
  },

  onSceneToggle(e) {
    const scene = e.currentTarget.dataset.scene;
    const scenes = (this.data.scenes || []).slice();
    const index = scenes.indexOf(scene);
    if (index > -1) {
      scenes.splice(index, 1);
    } else {
      scenes.push(scene);
    }
    this.setData({ scenes: scenes, sceneMap: this._buildSceneMap(scenes) });
    this.autoSaveDraft();
  },

  showCustomSceneInput() {
    this.setData({ showCustomSceneInput: true });
  },

  hideCustomSceneInput() {
    this.setData({ showCustomSceneInput: false, customSceneInput: '' });
  },

  onCustomSceneInput(e) {
    this.setData({ customSceneInput: e.detail.value });
  },

  addCustomScene() {
    const input = this.data.customSceneInput.trim();
    if (!input) return;
    const scenes = (this.data.scenes || []).slice();
    const presets = this.data.presetScenes;
    if (scenes.indexOf(input) > -1 || presets.indexOf(input) > -1) {
      wx.showToast({ title: '场景已存在', icon: 'none' });
      return;
    }
    scenes.push(input);
    this.setData({
      scenes: scenes,
      sceneMap: this._buildSceneMap(scenes),
      customSceneInput: '',
      showCustomSceneInput: false
    });
    this.autoSaveDraft();
  },

  removeScene(e) {
    const scene = e.currentTarget.dataset.scene;
    const scenes = (this.data.scenes || []).slice();
    const index = scenes.indexOf(scene);
    if (index > -1) {
      scenes.splice(index, 1);
      this.setData({ scenes: scenes, sceneMap: this._buildSceneMap(scenes) });
      this.autoSaveDraft();
    }
  },

  // ========== 商品参数 ==========

  addParam() {
    this.data.params.push({ key: '', value: '' });
    this.setData({ params: this.data.params });
    this.autoSaveDraft();
  },

  removeParam(e) {
    const index = e.currentTarget.dataset.index;
    this.data.params.splice(index, 1);
    this.setData({ params: this.data.params });
    this.autoSaveDraft();
  },

  onParamKeyInput(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({ ['params[' + index + '].key']: e.detail.value });
    this.autoSaveDraft();
  },

  onParamValueInput(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({ ['params[' + index + '].value']: e.detail.value });
    this.autoSaveDraft();
  },

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

  // ========== 本地草稿（仅新建模式） ==========

  autoSaveDraft() {
    if (this.data.isEdit) return;
    const draft = {
      goods: this.data.goods,
      galleryList: this.data.galleryList,
      skuList: this.data.skuList,
      scenes: this.data.scenes,
      params: this.data.params,
      savedAt: new Date().toISOString()
    };
    wx.setStorageSync('managerGoodsEditDraft', draft);
    this.setData({ hasDraft: true });
  },

  loadDraft() {
    try {
      const draft = wx.getStorageSync('managerGoodsEditDraft');
      if (draft && draft.goods) {
        this.setData({
          goods: draft.goods,
          galleryList: draft.galleryList || [],
          skuList: draft.skuList || [],
          scenes: draft.scenes || [],
          sceneMap: this._buildSceneMap(draft.scenes || []),
          params: draft.params || [],
          hasDraft: true
        });
      }
    } catch (e) {
      console.error('加载草稿失败', e);
    }
  },

  clearDraft() {
    wx.removeStorageSync('managerGoodsEditDraft');
    this.setData({ hasDraft: false });
  },

  // ========== 预览 ==========

  onPreview() {
    if (!this.validateForm()) return;
    const goods = this.data.goods;
    const previewData = {
      picUrl: goods.picUrl,
      name: goods.name,
      brief: goods.brief,
      counterPrice: goods.counterPrice,
      retailPrice: goods.retailPrice,
      specialPrice: goods.specialPrice,
      categoryName: goods.categoryName,
      scenes: this.data.scenes || [],
      isSpecial: goods.specialPrice && parseFloat(goods.specialPrice) > 0
    };
    this.setData({ showPreview: true, previewData: previewData });
  },

  hidePreview() {
    this.setData({ showPreview: false });
  },

  // ========== 表单验证与提交 ==========

  validateForm() {
    if (!this.data.goods.name || !this.data.goods.name.trim()) {
      wx.showToast({ title: '请输入商品名称', icon: 'none' });
      return false;
    }
    // 新建模式必须填零售价
    if (!this.data.isEdit && !this.data.goods.retailPrice) {
      wx.showToast({ title: '请输入零售价', icon: 'none' });
      return false;
    }
    return true;
  },

  collectFormData() {
    const goods = this.data.goods;
    const data = {
      name: goods.name,
      brief: goods.brief || '',
      detail: goods.detail || '',
      picUrl: goods.picUrl || '',
      gallery: this.data.galleryList,
      counterPrice: goods.counterPrice ? parseFloat(goods.counterPrice) : null,
      retailPrice: goods.retailPrice ? parseFloat(goods.retailPrice) : null,
      specialPrice: goods.specialPrice ? parseFloat(goods.specialPrice) : null,
      categoryId: goods.categoryId || null,
      keywords: goods.keywords || '',
      scenes: this.data.scenes,
      params: this.data.params.filter(function(p) {
        return p.key && p.key.trim();
      }),
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

  onSaveDraft() {
    if (this.data.submitting || !this.validateForm()) return;
    let that = this;
    this.setData({ submitting: true });
    const data = this.collectFormData();

    const api_url = this.data.goodsId ? api.ManagerGoodsEdit : api.ManagerGoodsCreate;
    util.request(api_url, data, 'POST').then(function(res) {
      if (res.errno === 0) {
        wx.showToast({ title: '保存成功', icon: 'success' });
        if (!that.data.isEdit) {
          that.clearDraft();
        }
        setTimeout(function() { wx.navigateBack(); }, 1000);
      } else {
        that.setData({ submitting: false });
        wx.showToast({ title: res.errmsg || '保存失败', icon: 'none' });
      }
    }).catch(function() {
      that.setData({ submitting: false });
    });
  },

  onPublish() {
    if (this.data.submitting || !this.validateForm()) return;
    let that = this;
    this.setData({ submitting: true });
    const data = this.collectFormData();

    const saveApi = this.data.goodsId ? api.ManagerGoodsEdit : api.ManagerGoodsCreate;
    util.request(saveApi, data, 'POST').then(function(res) {
      if (res.errno === 0) {
        const goodsId = that.data.goodsId || res.data;
        util.request(api.ManagerGoodsPublish, { id: goodsId }, 'POST').then(function(res2) {
          if (res2.errno === 0) {
            wx.showToast({ title: '上架成功', icon: 'success' });
            if (!that.data.isEdit) {
              that.clearDraft();
            }
            setTimeout(function() { wx.navigateBack(); }, 1000);
          } else {
            that.setData({ submitting: false });
            wx.showToast({ title: '保存成功但上架失败', icon: 'none' });
          }
        });
      } else {
        that.setData({ submitting: false });
        wx.showToast({ title: res.errmsg || '保存失败', icon: 'none' });
      }
    }).catch(function() {
      that.setData({ submitting: false });
    });
  },

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
  },

  // ========== 导航 ==========

  onGoBack() {
    wx.navigateBack();
  }
});
