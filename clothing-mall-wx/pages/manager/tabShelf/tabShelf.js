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
    statusBarHeight: 20,
    navBarHeight: 44,
    activeSubTab: 'upload',  // 'upload' | 'list'
    listTab: 'on_sale',      // 'on_sale' | 'pending'
    // 表单数据
    form: {
      picUrl: '',
      gallery: [],
      name: '',
      brief: '',
      detail: '',  // 商品详细介绍
      counterPrice: '',
      retailPrice: '',
      specialPrice: '',
      categoryId: '',
      categoryName: '',
      keywords: '',
      scenes: []  // 选中的场景标签
    },
    // 预设场景标签
    presetScenes: [
      '日常通勤', '约会聚餐', '度假旅行', '运动健身', '居家休闲', '商务正式'
    ],
    customSceneInput: '',  // 自定义场景输入
    showCustomSceneInput: false,
    // 商品参数（键值对）
    params: [],
    // 商品列表
    goodsList: [],
    page: 1,
    limit: 20,
    total: 0,
    tabCounts: {
      onSaleCount: 0,
      pendingCount: 0
    },
    loading: false,
    hasDraft: false,
    searchKeyword: '',
    // 分类数据
    categoryList: [],
    showCategoryPicker: false,
    // AI 识别状态
    aiRecognizing: false,
    aiConfidence: null,
    aiRecognized: false,
    // 预览模式
    showPreview: false,
    previewData: null
  },

  onLoad() {
    // 获取系统信息，设置状态栏高度
    const sysInfo = wx.getSystemInfoSync();
    const isIOS = sysInfo.system.indexOf('iOS') > -1;
    this.setData({
      statusBarHeight: sysInfo.statusBarHeight,
      navBarHeight: isIOS ? 44 : 48
    });
    this.loadDraft();
    this.getCategoryList();
    this.getGoodsList();
  },

  onShow() {
    // 更新管理端 TabBar
    const tabBar = this.selectComponent('#managerTabBar');
    if (tabBar) {
      tabBar.setData({ active: 1 });
    }
  },

  // ========== 子 Tab 切换 ==========
  onSubTabChange(e) {
    const tab = e.currentTarget.dataset.tab;
    if (tab === this.data.activeSubTab) return;
    this.setData({ activeSubTab: tab });
    if (tab === 'list') {
      this.refreshGoodsList();
    }
  },

  // ========== 分类相关 ==========
  getCategoryList() {
    let that = this;
    util.request(api.GoodsCategory).then(function(res) {
      if (res.errno === 0) {
        that.setData({
          categoryList: res.data.list || []
        });
      }
    });
  },

  showCategoryPicker() {
    this.setData({ showCategoryPicker: true });
  },

  onCategoryChange(e) {
    const index = e.detail.index;
    const category = this.data.categoryList[index];
    if (category) {
      this.setData({
        'form.categoryId': category.id,
        'form.categoryName': category.name,
        showCategoryPicker: false
      });
      this.autoSaveDraft();
    }
  },

  onCategoryClose() {
    this.setData({ showCategoryPicker: false });
  },

  // ========== 表单操作 ==========
  onFormInput: debounce(function(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ ['form.' + field]: e.detail.value });
    this.autoSaveDraft();
  }, 500),

  onNameInput(e) {
    this.setData({ 'form.name': e.detail.value });
    this.autoSaveDraft();
  },

  onBriefInput(e) {
    this.setData({ 'form.brief': e.detail.value });
    this.autoSaveDraft();
  },

  onCounterPriceInput(e) {
    this.setData({ 'form.counterPrice': e.detail.value });
    this.autoSaveDraft();
  },

  onRetailPriceInput(e) {
    this.setData({ 'form.retailPrice': e.detail.value });
    this.autoSaveDraft();
  },

  onSpecialPriceInput(e) {
    this.setData({ 'form.specialPrice': e.detail.value });
    this.autoSaveDraft();
  },

  onKeywordsInput(e) {
    this.setData({ 'form.keywords': e.detail.value });
    this.autoSaveDraft();
  },

  onDetailInput(e) {
    this.setData({ 'form.detail': e.detail.value });
    this.autoSaveDraft();
  },

  // ========== 场景标签操作 ==========
  onSceneToggle(e) {
    const scene = e.currentTarget.dataset.scene;
    const scenes = this.data.form.scenes || [];
    const index = scenes.indexOf(scene);
    if (index > -1) {
      scenes.splice(index, 1);
    } else {
      scenes.push(scene);
    }
    this.setData({ 'form.scenes': scenes });
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
    const scenes = this.data.form.scenes || [];
    const presets = this.data.presetScenes;
    // 如果已存在（无论预设还是已添加），不重复添加
    if (scenes.indexOf(input) > -1 || presets.indexOf(input) > -1) {
      wx.showToast({ title: '场景已存在', icon: 'none' });
      return;
    }
    scenes.push(input);
    this.setData({
      'form.scenes': scenes,
      customSceneInput: '',
      showCustomSceneInput: false
    });
    this.autoSaveDraft();
  },

  removeScene(e) {
    const scene = e.currentTarget.dataset.scene;
    const scenes = this.data.form.scenes || [];
    const index = scenes.indexOf(scene);
    if (index > -1) {
      scenes.splice(index, 1);
      this.setData({ 'form.scenes': scenes });
      this.autoSaveDraft();
    }
  },

  isSceneSelected(scene) {
    return (this.data.form.scenes || []).indexOf(scene) > -1;
  },

  // ========== 商品参数操作 ==========
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

  // ========== 图片操作 ==========
  chooseMainImage() {
    let that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        const tempPath = res.tempFilePaths[0];
        // 先显示图片
        that.setData({ 'form.picUrl': tempPath, aiRecognizing: true });
        // 上传图片
        that.uploadImage(tempPath, function(url) {
          if (url) {
            that.setData({ 'form.picUrl': url });
            that.autoSaveDraft();
            // 上传成功后调用 AI 识别
            that.recognizeImage(url);
          } else {
            that.setData({ aiRecognizing: false });
          }
        });
      }
    });
  },

  // AI 识别图片
  recognizeImage(imageUrl) {
    let that = this;
    util.request(api.AiRecognizeByUrl, { imageUrl: imageUrl }, 'POST').then(function(res) {
      if (res.errno === 0 && res.data) {
        const aiData = res.data;
        // 填充表单
        const updates = {};
        if (aiData.name && !that.data.form.name) {
          updates['form.name'] = aiData.name;
        }
        if (aiData.brief && !that.data.form.brief) {
          updates['form.brief'] = aiData.brief;
        }
        if (aiData.confidence) {
          updates.aiConfidence = aiData.confidence;
          updates.aiRecognized = true;
        }
        // 根据分类名称匹配分类 ID
        if (aiData.category && that.data.categoryList.length > 0) {
          const matchedCategory = that.data.categoryList.find(function(c) {
            return c.name === aiData.category || c.name.indexOf(aiData.category) > -1;
          });
          if (matchedCategory) {
            updates['form.categoryId'] = matchedCategory.id;
            updates['form.categoryName'] = matchedCategory.name;
          }
        }
        // 添加场景标签
        if (aiData.style && that.data.presetScenes.indexOf(aiData.style) === -1) {
          const scenes = that.data.form.scenes || [];
          if (scenes.indexOf(aiData.style) === -1) {
            scenes.push(aiData.style);
            updates['form.scenes'] = scenes;
          }
        }
        // 添加商品参数
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
        // 显示识别结果提示
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
    const remaining = 9 - this.data.form.gallery.length;
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
          const validUrls = urls.filter(function(u) { return u; });
          that.setData({
            'form.gallery': that.data.form.gallery.concat(validUrls)
          });
          that.autoSaveDraft();
        });
      }
    });
  },

  removeGallery(e) {
    const index = e.currentTarget.dataset.index;
    this.data.form.gallery.splice(index, 1);
    this.setData({ 'form.gallery': this.data.form.gallery });
    this.autoSaveDraft();
  },

  uploadImage(filePath, callback) {
    util.uploadFile(filePath).then(function(url) {
      callback(url);
    }).catch(function() {
      callback(null);
    });
  },

  // ========== 草稿操作 ==========
  autoSaveDraft() {
    const draft = {
      form: this.data.form,
      params: this.data.params,
      savedAt: new Date().toISOString()
    };
    wx.setStorageSync('managerShelfDraft', draft);
    this.setData({ hasDraft: true });
  },

  loadDraft() {
    try {
      const draft = wx.getStorageSync('managerShelfDraft');
      if (draft && draft.form) {
        this.setData({
          form: draft.form,
          params: draft.params || [],
          hasDraft: true
        });
      }
    } catch (e) {
      console.error('加载草稿失败', e);
    }
  },

  clearDraft() {
    wx.removeStorageSync('managerShelfDraft');
    this.setData({
      form: {
        picUrl: '',
        gallery: [],
        name: '',
        brief: '',
        detail: '',
        counterPrice: '',
        retailPrice: '',
        specialPrice: '',
        categoryId: '',
        categoryName: '',
        keywords: '',
        scenes: []
      },
      params: [],
      hasDraft: false
    });
  },

  // ========== 预览操作 ==========
  onPreview() {
    if (!this.validateForm()) return;
    const previewData = {
      picUrl: this.data.form.picUrl,
      name: this.data.form.name,
      brief: this.data.form.brief,
      counterPrice: this.data.form.counterPrice,
      retailPrice: this.data.form.retailPrice,
      specialPrice: this.data.form.specialPrice,
      categoryName: this.data.form.categoryName,
      scenes: this.data.form.scenes || [],
      isSpecial: this.data.form.specialPrice && parseFloat(this.data.form.specialPrice) > 0
    };
    this.setData({ showPreview: true, previewData: previewData });
  },

  hidePreview() {
    this.setData({ showPreview: false });
  },

  // ========== 商品提交 ==========
  validateForm() {
    if (!this.data.form.name || !this.data.form.name.trim()) {
      wx.showToast({ title: '请输入商品名称', icon: 'none' });
      return false;
    }
    if (!this.data.form.retailPrice) {
      wx.showToast({ title: '请输入零售价', icon: 'none' });
      return false;
    }
    return true;
  },

  collectFormData() {
    const form = this.data.form;
    return {
      name: form.name,
      brief: form.brief || '',
      detail: form.detail || '',
      picUrl: form.picUrl || '',
      gallery: form.gallery,
      counterPrice: form.counterPrice ? parseFloat(form.counterPrice) : null,
      retailPrice: form.retailPrice ? parseFloat(form.retailPrice) : null,
      specialPrice: form.specialPrice ? parseFloat(form.specialPrice) : null,
      categoryId: form.categoryId ? parseInt(form.categoryId) : null,
      keywords: form.keywords || '',
      scenes: form.scenes || [],
      params: this.data.params.filter(function(p) {
        return p.key && p.key.trim();
      })
    };
  },

  // 保存草稿到服务器
  onSaveDraft() {
    if (!this.validateForm()) return;
    let that = this;
    const data = this.collectFormData();

    util.request(api.ManagerGoodsCreate, data, 'POST').then(function(res) {
      if (res.errno === 0) {
        wx.showToast({ title: '保存成功', icon: 'success' });
        that.clearDraft();
      } else {
        wx.showToast({ title: res.errmsg || '保存失败', icon: 'none' });
      }
    });
  },

  // 上架商品
  onPublish() {
    if (!this.validateForm()) return;
    let that = this;
    const data = this.collectFormData();

    // 先创建商品
    util.request(api.ManagerGoodsCreate, data, 'POST').then(function(res) {
      if (res.errno === 0) {
        const goodsId = res.data;
        // 再上架
        util.request(api.ManagerGoodsPublish, { id: goodsId }, 'POST').then(function(res2) {
          if (res2.errno === 0) {
            wx.showToast({ title: '上架成功', icon: 'success' });
            that.clearDraft();
            // 切换到列表 Tab
            that.setData({ activeSubTab: 'list', listTab: 'on_sale' });
            that.refreshGoodsList();
          } else {
            wx.showToast({ title: '保存成功但上架失败', icon: 'none' });
          }
        });
      } else {
        wx.showToast({ title: res.errmsg || '上架失败', icon: 'none' });
      }
    });
  },

  // ========== 商品列表 ==========
  onListTabChange(e) {
    const tab = e.currentTarget.dataset.tab;
    if (tab === this.data.listTab) return;
    this.setData({ listTab: tab, page: 1, goodsList: [] });
    this.getGoodsList();
  },

  onSearchInput: debounce(function(e) {
    this.setData({ searchKeyword: e.detail.value, page: 1, goodsList: [] });
    this.getGoodsList();
  }, 300),

  refreshGoodsList() {
    this.setData({ page: 1, goodsList: [] });
    this.getGoodsList();
  },

  getGoodsList() {
    if (this.data.loading) return;
    let that = this;
    this.setData({ loading: true });

    const status = this.data.listTab === 'on_sale' ? 'on_sale' : 'pending';

    util.request(api.ManagerGoodsList, {
      status: status,
      page: this.data.page,
      limit: this.data.limit,
      keyword: this.data.searchKeyword || undefined
    }).then(function(res) {
      if (res.errno === 0) {
        const data = res.data;
        that.setData({
          goodsList: that.data.page === 1 ? (data.list || []) : that.data.goodsList.concat(data.list || []),
          total: data.total || 0,
          tabCounts: {
            onSaleCount: data.onSaleCount || 0,
            pendingCount: data.pendingCount || 0
          },
          loading: false
        });
      } else {
        that.setData({ loading: false });
      }
    }).catch(function() {
      that.setData({ loading: false });
    });
  },

  onPullDownRefresh() {
    if (this.data.activeSubTab === 'list') {
      this.refreshGoodsList();
    }
    wx.stopPullDownRefresh();
  },

  onReachBottom() {
    if (this.data.activeSubTab === 'list' && this.data.goodsList.length < this.data.total) {
      this.setData({ page: this.data.page + 1 });
      this.getGoodsList();
    }
  },

  // 编辑商品
  onEditGoods(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/manager/goodsEdit/goodsEdit?id=' + id
    });
  },

  // 下架商品
  onUnpublishGoods(e) {
    const id = e.currentTarget.dataset.id;
    let that = this;
    wx.showModal({
      title: '确认下架',
      content: '确认下架该商品？',
      success(res) {
        if (res.confirm) {
          util.request(api.ManagerGoodsUnpublish, { ids: [id] }, 'POST').then(function(res) {
            if (res.errno === 0) {
              wx.showToast({ title: '已下架', icon: 'success' });
              that.refreshGoodsList();
            } else {
              wx.showToast({ title: res.errmsg || '操作失败', icon: 'none' });
            }
          });
        }
      }
    });
  },

  // 上架商品
  onPublishGoods(e) {
    const id = e.currentTarget.dataset.id;
    let that = this;
    util.request(api.ManagerGoodsPublish, { ids: [id] }, 'POST').then(function(res) {
      if (res.errno === 0) {
        wx.showToast({ title: '已上架', icon: 'success' });
        that.refreshGoodsList();
      } else {
        wx.showToast({ title: res.errmsg || '操作失败', icon: 'none' });
      }
    });
  },

  // 一键下架全部
  onUnpublishAll() {
    let that = this;
    wx.showModal({
      title: '确认一键下架',
      content: '确认下架全部在售商品？',
      success(res) {
        if (res.confirm) {
          util.request(api.ManagerGoodsUnpublishAll, {}, 'POST').then(function(res) {
            if (res.errno === 0) {
              wx.showToast({ title: '已全部下架', icon: 'success' });
              that.refreshGoodsList();
            } else {
              wx.showToast({ title: res.errmsg || '操作失败', icon: 'none' });
            }
          });
        }
      }
    });
  },

  // 状态文本
  statusText(status, isOnSale) {
    if (status === 'draft') return '草稿';
    if (status === 'pending') return '待上架';
    if (status === 'published' && isOnSale) return '已上架';
    if (status === 'published' && !isOnSale) return '已下架';
    return '未知';
  }
});
