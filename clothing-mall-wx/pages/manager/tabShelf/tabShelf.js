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
    listTab: 'on_sale',
    // 表单数据
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
    // 预设场景标签
    presetScenes: [
      '日常通勤', '约会聚餐', '度假旅行', '运动健身', '居家休闲', '商务正式'
    ],
    sceneMap: {},
    presetSceneMap: {},
    customSceneInput: '',
    showCustomSceneInput: false,
    // 商品参数
    params: [],
    // SKU 列表
    skuList: [],
    // 商品列表
    goodsList: [],
    page: 1,
    limit: 20,
    total: 0,
    tabCounts: {
      onSaleCount: 0,
      pendingCount: 0,
      draftCount: 0
    },
    loading: false,
    hasDraft: false,
    showDraftTip: false,
    searchKeyword: '',
    batchMode: false,
    selectedIds: [],
    selectedMap: {},
    // 分类数据
    categoryList: [],
    showCategoryPicker: false,
    // AI 识别状态
    aiRecognizing: false,
    aiConfidence: null,
    aiRecognized: false,
    // 预览模式
    showPreview: false,
    // 草稿保存时间
    draftSavedAt: '',
    defaultImage: '/static/images/fallback-image.svg',
    previewData: null
  },

  onLoad() {
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
    this.loadDraft();
    this.getCategoryList();
    this.getGoodsList();
  },

  onShow() {
    const tabBar = this.selectComponent('#managerTabBar');
    if (tabBar) {
      tabBar.setData({ active: 1 });
    }
    // 从编辑页返回时刷新列表
    if (this.data.activeSubTab === 'list') {
      this.refreshGoodsList();
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
    util.request(api.ManagerGoodsCategory).then(function(res) {
      if (res.errno === 0) {
        that.setData({
          categoryList: res.data.list || res.data || []
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
  _buildSceneMap(scenes) {
    var map = {};
    (scenes || []).forEach(function(s) { map[s] = true; });
    return map;
  },

  onSceneToggle(e) {
    const scene = e.currentTarget.dataset.scene;
    const scenes = (this.data.form.scenes || []).slice();
    const index = scenes.indexOf(scene);
    if (index > -1) {
      scenes.splice(index, 1);
    } else {
      scenes.push(scene);
    }
    this.setData({ 'form.scenes': scenes, sceneMap: this._buildSceneMap(scenes) });
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
    const scenes = (this.data.form.scenes || []).slice();
    const presets = this.data.presetScenes;
    if (scenes.indexOf(input) > -1 || presets.indexOf(input) > -1) {
      wx.showToast({ title: '场景已存在', icon: 'none' });
      return;
    }
    scenes.push(input);
    this.setData({
      'form.scenes': scenes,
      sceneMap: this._buildSceneMap(scenes),
      customSceneInput: '',
      showCustomSceneInput: false
    });
    this.autoSaveDraft();
  },

  removeScene(e) {
    const scene = e.currentTarget.dataset.scene;
    const scenes = (this.data.form.scenes || []).slice();
    const index = scenes.indexOf(scene);
    if (index > -1) {
      scenes.splice(index, 1);
      this.setData({ 'form.scenes': scenes, sceneMap: this._buildSceneMap(scenes) });
      this.autoSaveDraft();
    }
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
        that.setData({ 'form.picUrl': tempPath, aiRecognizing: true });
        that.uploadImage(tempPath, function(url) {
          if (url) {
            that.setData({ 'form.picUrl': url });
            that.autoSaveDraft();
            that.recognizeImage(url);
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
        if (aiData.category && that.data.categoryList.length > 0) {
          const matchedCategory = that.data.categoryList.find(function(c) {
            return c.name === aiData.category || c.name.indexOf(aiData.category) > -1;
          });
          if (matchedCategory) {
            updates['form.categoryId'] = matchedCategory.id;
            updates['form.categoryName'] = matchedCategory.name;
          }
        }
        if (aiData.style && that.data.presetScenes.indexOf(aiData.style) === -1) {
          const scenes = (that.data.form.scenes || []).slice();
          if (scenes.indexOf(aiData.style) === -1) {
            scenes.push(aiData.style);
            updates['form.scenes'] = scenes;
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

  // ========== 草稿操作 ==========
  autoSaveDraft() {
    var now = new Date();
    var timeStr = now.getHours() + ':' + (now.getMinutes() < 10 ? '0' : '') + now.getMinutes();
    const draft = {
      form: this.data.form,
      params: this.data.params,
      skuList: this.data.skuList,
      savedAt: now.toISOString()
    };
    wx.setStorageSync('managerShelfDraft', draft);
    this.setData({ hasDraft: true, draftSavedAt: timeStr });
  },

  loadDraft() {
    try {
      const draft = wx.getStorageSync('managerShelfDraft');
      if (draft && draft.form) {
        var savedAt = '';
        if (draft.savedAt) {
          var d = new Date(draft.savedAt);
          savedAt = d.getHours() + ':' + (d.getMinutes() < 10 ? '0' : '') + d.getMinutes();
        }
        this.setData({
          form: draft.form,
          params: draft.params || [],
          skuList: draft.skuList || [],
          hasDraft: true,
          showDraftTip: true,
          draftSavedAt: savedAt,
          sceneMap: this._buildSceneMap(draft.form.scenes)
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
      skuList: [],
      hasDraft: false,
      showDraftTip: false,
      draftSavedAt: '',
      sceneMap: {},
      aiRecognized: false,
      aiConfidence: null
    });
  },

  onClearDraft() {
    let that = this;
    wx.showModal({
      title: '确认清除',
      content: '确认清除草稿内容？清除后不可恢复。',
      success(res) {
        if (res.confirm) {
          that.clearDraft();
        }
      }
    });
  },

  onContinueDraft() {
    this.setData({ activeSubTab: 'upload' });
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
      }),
      skus: this.data.skuList.filter(function(s) {
        return s.color || s.size;
      }).map(function(s) {
        return {
          color: s.color,
          size: s.size,
          price: s.price ? parseFloat(s.price) : null,
          stock: s.stock ? parseInt(s.stock) : 0
        };
      })
    };
  },

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

  onPublish() {
    if (!this.validateForm()) return;
    let that = this;
    const data = this.collectFormData();

    util.request(api.ManagerGoodsCreate, data, 'POST').then(function(res) {
      if (res.errno === 0) {
        const goodsId = res.data;
        util.request(api.ManagerGoodsPublish, { id: goodsId }, 'POST').then(function(res2) {
          if (res2.errno === 0) {
            wx.showToast({ title: '上架成功', icon: 'success' });
            that.clearDraft();
            that.setData({ showPreview: false, activeSubTab: 'list', listTab: 'on_sale' });
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

    var params = {
      status: this.data.listTab,
      page: this.data.page,
      limit: this.data.limit
    };
    var keyword = (this.data.searchKeyword || '').trim();
    if (keyword) {
      params.keyword = keyword;
    }
    util.request(api.ManagerGoodsList, params).then(function(res) {
      if (res.errno === 0) {
        const data = res.data;
        that.setData({
          goodsList: that.data.page === 1 ? (data.list || []) : that.data.goodsList.concat(data.list || []),
          total: data.total || 0,
          tabCounts: {
            onSaleCount: data.onSaleCount || 0,
            pendingCount: data.pendingCount || 0,
            draftCount: data.draftCount || 0
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

  onEditGoods(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/manager/goodsEdit/goodsEdit?id=' + id
    });
  },

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

  onDeleteGoods(e) {
    const id = e.currentTarget.dataset.id;
    let that = this;
    wx.showModal({
      title: '确认删除',
      content: '确认删除该草稿商品？删除后不可恢复。',
      success(res) {
        if (res.confirm) {
          util.request(api.ManagerGoodsBatchDelete, { ids: [id] }, 'POST').then(function(res) {
            if (res.errno === 0) {
              wx.showToast({ title: '已删除', icon: 'success' });
              that.refreshGoodsList();
            } else {
              wx.showToast({ title: res.errmsg || '删除失败', icon: 'none' });
            }
          });
        }
      }
    });
  },

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

  _syncSelectedMap: function(selectedIds) {
    var map = {};
    selectedIds.forEach(function(id) {
      map[id] = true;
    });
    return map;
  },

  toggleBatchMode() {
    this.setData({
      batchMode: !this.data.batchMode,
      selectedIds: [],
      selectedMap: {}
    });
  },

  onSelectGoods(e) {
    var id = e.currentTarget.dataset.id;
    var selectedIds = this.data.selectedIds.slice();
    var index = -1;
    for (var i = 0; i < selectedIds.length; i++) {
      if (selectedIds[i] == id) { index = i; break; }
    }
    if (index > -1) {
      selectedIds.splice(index, 1);
    } else {
      selectedIds.push(id);
    }
    this.setData({
      selectedIds: selectedIds,
      selectedMap: this._syncSelectedMap(selectedIds)
    });
  },

  onSelectAll() {
    var allIds = this.data.goodsList.map(function(g) { return g.id; });
    var allSelected = allIds.length > 0 && allIds.every(function(id) {
      return this.data.selectedMap[id];
    }.bind(this));
    if (allSelected) {
      this.setData({ selectedIds: [], selectedMap: {} });
    } else {
      this.setData({
        selectedIds: allIds,
        selectedMap: this._syncSelectedMap(allIds)
      });
    }
  },

  onBatchDelete() {
    const ids = this.data.selectedIds;
    if (ids.length === 0) {
      wx.showToast({ title: '请先选择商品', icon: 'none' });
      return;
    }
    let that = this;
    wx.showModal({
      title: '确认删除',
      content: '确认删除选中的 ' + ids.length + ' 件商品？删除后不可恢复。',
      success(res) {
        if (res.confirm) {
          util.request(api.ManagerGoodsBatchDelete, { ids: ids }, 'POST').then(function(res) {
            if (res.errno === 0) {
              wx.showToast({ title: '删除成功', icon: 'success' });
              that.setData({ batchMode: false, selectedIds: [], selectedMap: {} });
              that.refreshGoodsList();
            } else {
              wx.showToast({ title: res.errmsg || '删除失败', icon: 'none' });
            }
          });
        }
      }
    });
  },

  onGoodsImageError: function(e) {
    var index = e.currentTarget.dataset.index;
    var list = this.data.goodsList || [];
    if (list[index] && list[index].picUrl !== this.data.defaultImage) {
      this.setData({
        ['goodsList[' + index + '].picUrl']: this.data.defaultImage
      });
    }
  }
});
