const util = require('../../utils/util.js');
const api = require('../../config/api.js');

Component({
  options: {
    styleIsolation: 'isolated'
  },

  properties: {
    value: {
      type: Object,
      value: {}
    },
    mode: {
      type: String,
      value: 'create'
    },
    features: {
      type: Object,
      value: {}
    },
    loading: {
      type: Boolean,
      value: false
    },
    presetScenes: {
      type: Array,
      value: []
    },
    categoryList: {
      type: Array,
      value: []
    },
    goodsStatus: {
      type: String,
      value: ''
    },
    isOnSale: {
      type: Boolean,
      value: false
    }
  },

  data: {
    _form: {},
    _galleryList: [],
    _scenes: [],
    _sceneMap: {},
    _params: [],
    aiRecognizing: false,
    aiConfidence: null,
    aiRecognized: false,
    showCategoryPicker: false,
    editorCtx: null,
    formats: {}
  },

  observers: {
    'value': function(val) {
      if (!val || !Object.keys(val).length) return;
      var scenes = val.scenes || [];
      this.setData({
        _form: {
          picUrl: val.picUrl || '',
          gallery: val.gallery || [],
          name: val.name || '',
          brief: val.brief || '',
          detail: val.detail || '',
          counterPrice: val.counterPrice || '',
          retailPrice: val.retailPrice || '',
          specialPrice: val.specialPrice || '',
          categoryId: val.categoryId || '',
          categoryName: val.categoryName || '',
          keywords: val.keywords || ''
        },
        _galleryList: val.gallery || [],
        _scenes: scenes,
        _sceneMap: this._buildSceneMap(scenes),
        _params: val.params || []
      });

      // editor 就绪后设置已有内容
      var that = this;
      if (val.detail && this._editorReady) {
        this._editorReady.then(function() {
          var html = val.detail;
          if (html.indexOf('<') === -1) {
            html = '<p>' + html.replace(/\n/g, '</p><p>') + '</p>';
          }
          that.data.editorCtx.setContents({ html: html });
        });
      }
    }
  },

  lifetimes: {
    attached: function() {
      var that = this;
      this._editorReady = new Promise(function(resolve) {
        that._resolveEditorReady = resolve;
      });
    }
  },

  methods: {
    // ========== 富文本编辑器 ==========

    onEditorReady: function() {
      var that = this;
      this.createSelectorQuery()
        .select('#editor')
        .context(function(res) {
          if (res && res.context) {
            that.setData({ editorCtx: res.context });
            if (that._resolveEditorReady) {
              that._resolveEditorReady();
            }
          }
        })
        .exec();
    },

    onEditorStatusChange: function(e) {
      this.setData({ formats: e.detail });
    },

    formatBold: function() {
      if (this.data.editorCtx) this.data.editorCtx.format('bold');
    },

    formatItalic: function() {
      if (this.data.editorCtx) this.data.editorCtx.format('italic');
    },

    formatHeader: function(e) {
      if (!this.data.editorCtx) return;
      var level = e.currentTarget.dataset.level;
      this.data.editorCtx.format('header', level);
    },

    insertImage: function() {
      var that = this;
      wx.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: function(res) {
          var tempPath = res.tempFilePaths[0];
          wx.showLoading({ title: '上传中...' });
          that.uploadImage(tempPath, function(url) {
            wx.hideLoading();
            if (url) {
              that.data.editorCtx.insertImage({
                src: url,
                width: '100%'
              });
            } else {
              wx.showToast({ title: '图片上传失败', icon: 'none' });
            }
          });
        }
      });
    },

    // ========== 图片操作 ==========

    chooseMainImage: function() {
      var that = this;
      wx.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: function(res) {
          var tempPath = res.tempFilePaths[0];
          that.setData({ '_form.picUrl': tempPath });
          // create 模式启用 AI 识别
          if (that.data.mode === 'create') {
            that.setData({ aiRecognizing: true });
          }
          that.uploadImage(tempPath, function(url) {
            if (url) {
              that.setData({ '_form.picUrl': url });
              that._emitChange();
              if (that.data.mode === 'create') {
                that.recognizeImage(url);
              }
            } else {
              that.setData({ aiRecognizing: false });
            }
          });
        }
      });
    },

    recognizeImage: function(imageUrl) {
      var that = this;
      util.request(api.AiRecognizeByUrl, { imageUrl: imageUrl }, 'POST').then(function(res) {
        if (res.errno === 0 && res.data) {
          var aiData = res.data;
          var updates = {};
          if (aiData.name && !that.data._form.name) {
            updates['_form.name'] = aiData.name;
          }
          if (aiData.brief && !that.data._form.brief) {
            updates['_form.brief'] = aiData.brief;
          }
          if (aiData.confidence) {
            updates.aiConfidence = aiData.confidence;
            updates.aiRecognized = true;
          }
          if (aiData.category && that.data.categoryList.length > 0) {
            var matchedCategory = that.data.categoryList.find(function(c) {
              return c.name === aiData.category || c.name.indexOf(aiData.category) > -1;
            });
            if (matchedCategory) {
              updates['_form.categoryId'] = matchedCategory.id;
              updates['_form.categoryName'] = matchedCategory.name;
            }
          }
          if (aiData.style && that.data.presetScenes.indexOf(aiData.style) === -1) {
            var scenes = (that.data._scenes || []).slice();
            if (scenes.indexOf(aiData.style) === -1) {
              scenes.push(aiData.style);
              updates._scenes = scenes;
              updates._sceneMap = that._buildSceneMap(scenes);
            }
          }
          if (aiData.material || aiData.color || aiData.pattern) {
            var params = that.data._params.slice();
            if (aiData.material) params.push({ key: '面料', value: aiData.material });
            if (aiData.color) params.push({ key: '颜色', value: aiData.color });
            if (aiData.pattern) params.push({ key: '图案', value: aiData.pattern });
            updates._params = params;
          }
          updates.aiRecognizing = false;
          that.setData(updates);
          that._emitChange();
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

    chooseGalleryImage: function() {
      var remaining = 9 - this.data._galleryList.length;
      if (remaining <= 0) return;
      var that = this;
      wx.chooseImage({
        count: remaining,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: function(res) {
          var tasks = res.tempFilePaths.map(function(path) {
            return new Promise(function(resolve) {
              that.uploadImage(path, resolve);
            });
          });
          Promise.all(tasks).then(function(urls) {
            var validUrls = urls.filter(function(u) { return u; });
            that.setData({
              _galleryList: that.data._galleryList.concat(validUrls)
            });
            that._emitChange();
          });
        }
      });
    },

    removeGallery: function(e) {
      var index = e.currentTarget.dataset.index;
      this.data._galleryList.splice(index, 1);
      this.setData({ _galleryList: this.data._galleryList });
      this._emitChange();
    },

    uploadImage: function(filePath, callback) {
      util.uploadFile(filePath).then(function(url) {
        callback(url);
      }).catch(function() {
        callback(null);
      });
    },

    // ========== 表单输入 ==========

    onNameInput: function(e) {
      this.setData({ '_form.name': e.detail.value });
      this._emitChange();
    },

    onBriefInput: function(e) {
      this.setData({ '_form.brief': e.detail.value });
      this._emitChange();
    },

    onCounterPriceInput: function(e) {
      this.setData({ '_form.counterPrice': e.detail.value });
      this._emitChange();
    },

    onRetailPriceInput: function(e) {
      this.setData({ '_form.retailPrice': e.detail.value });
      this._emitChange();
    },

    onSpecialPriceInput: function(e) {
      this.setData({ '_form.specialPrice': e.detail.value });
      this._emitChange();
    },

    onKeywordsInput: function(e) {
      this.setData({ '_form.keywords': e.detail.value });
      this._emitChange();
    },

    // ========== 分类选择 ==========

    onShowCategoryPicker: function() {
      this.setData({ showCategoryPicker: true });
    },

    onCategoryChange: function(e) {
      var index = e.detail.index;
      var category = this.data.categoryList[index];
      if (category) {
        this.setData({
          '_form.categoryId': category.id,
          '_form.categoryName': category.name,
          showCategoryPicker: false
        });
        this._emitChange();
      }
    },

    onCategoryClose: function() {
      this.setData({ showCategoryPicker: false });
    },

    // ========== 场景标签 ==========

    _buildSceneMap: function(scenes) {
      var map = {};
      (scenes || []).forEach(function(s) { map[s] = true; });
      return map;
    },

    onSceneToggle: function(e) {
      var scene = e.currentTarget.dataset.scene;
      var scenes = (this.data._scenes || []).slice();
      var index = scenes.indexOf(scene);
      if (index > -1) {
        scenes.splice(index, 1);
      } else {
        scenes.push(scene);
      }
      this.setData({ _scenes: scenes, _sceneMap: this._buildSceneMap(scenes) });
      this._emitChange();
    },

    // ========== 商品参数 ==========

    addParam: function() {
      this.data._params.push({ key: '', value: '' });
      this.setData({ _params: this.data._params });
      this._emitChange();
    },

    removeParam: function(e) {
      var index = e.currentTarget.dataset.index;
      this.data._params.splice(index, 1);
      this.setData({ _params: this.data._params });
      this._emitChange();
    },

    onParamKeyInput: function(e) {
      var index = e.currentTarget.dataset.index;
      this.setData({ ['_params[' + index + '].key']: e.detail.value });
      this._emitChange();
    },

    onParamValueInput: function(e) {
      var index = e.currentTarget.dataset.index;
      this.setData({ ['_params[' + index + '].value']: e.detail.value });
      this._emitChange();
    },

    // ========== 验证 ==========

    validateForm: function() {
      if (!this.data._form.name || !this.data._form.name.trim()) {
        wx.showToast({ title: '请输入商品名称', icon: 'none' });
        return false;
      }
      if (this.data.mode === 'create' && !this.data._form.retailPrice) {
        wx.showToast({ title: '请输入零售价', icon: 'none' });
        return false;
      }
      return true;
    },

    // ========== 数据收集 ==========

    getFormData: function() {
      var form = this.data._form;
      var that = this;
      var data = {
        name: form.name,
        brief: form.brief || '',
        detail: form.detail || '',
        picUrl: form.picUrl || '',
        gallery: this.data._galleryList,
        counterPrice: form.counterPrice ? parseFloat(form.counterPrice) : null,
        retailPrice: form.retailPrice ? parseFloat(form.retailPrice) : null,
        specialPrice: form.specialPrice ? parseFloat(form.specialPrice) : null,
        categoryId: form.categoryId || null,
        keywords: form.keywords || '',
        scenes: this.data._scenes,
        params: this.data._params.filter(function(p) {
          return p.key && p.key.trim();
        })
      };

      // 从 editor 获取最新 HTML
      if (that.data.editorCtx) {
        return new Promise(function(resolve) {
          that.data.editorCtx.getContents({
            success: function(res) {
              data.detail = res.html;
              resolve(data);
            },
            fail: function() {
              resolve(data);
            }
          });
        });
      }
      return Promise.resolve(data);
    },

    // ========== 事件触发 ==========

    _emitChange: function() {
      this.triggerEvent('change', {
        formData: {
          picUrl: this.data._form.picUrl,
          gallery: this.data._galleryList,
          name: this.data._form.name,
          brief: this.data._form.brief,
          detail: this.data._form.detail,
          counterPrice: this.data._form.counterPrice,
          retailPrice: this.data._form.retailPrice,
          specialPrice: this.data._form.specialPrice,
          categoryId: this.data._form.categoryId,
          categoryName: this.data._form.categoryName,
          keywords: this.data._form.keywords,
          scenes: this.data._scenes,
          params: this.data._params
        }
      });
    },

    // ========== 底部按钮 ==========

    onPreview: function() {
      if (!this.validateForm()) return;
      var that = this;
      this.getFormData().then(function(data) {
        var previewData = {
          picUrl: data.picUrl,
          name: data.name,
          brief: data.brief,
          detail: data.detail,
          counterPrice: data.counterPrice,
          retailPrice: data.retailPrice,
          specialPrice: data.specialPrice,
          isSpecialPrice: data.specialPrice && parseFloat(data.specialPrice) > 0,
          categoryId: data.categoryId,
          categoryName: that.data._form.categoryName,
          scenes: data.scenes || [],
          gallery: data.gallery || [],
          params: data.params || []
        };
        try {
          wx.setStorageSync('previewGoodsData', previewData);
        } catch (e) {
          console.error('保存预览数据失败', e);
        }
        that.triggerEvent('preview', { formData: data });
      });
    },

    onSaveDraft: function() {
      if (!this.validateForm()) return;
      var that = this;
      this.getFormData().then(function(data) {
        that.triggerEvent('save', { formData: data });
      });
    },

    onPublish: function() {
      if (!this.validateForm()) return;
      var that = this;
      this.getFormData().then(function(data) {
        that.triggerEvent('publish', { formData: data });
      });
    },

    onUnpublish: function() {
      this.triggerEvent('unpublish', {});
    }
  }
});
