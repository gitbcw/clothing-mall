var util = require('../../../utils/util.js');
var api = require('../../../config/api.js');
var app = getApp();

Page({
  data: {
    files: [],              // 本地文件路径列表
    uploadedUrls: [],       // 已上传的URL列表
    uploadStatus: [],       // 上传状态: pending, uploading, success, fail
    uploadProgress: [],     // 上传进度
    uploading: false,       // 是否正在上传
    maxCount: 9,            // 每次最多选择9张
    totalCount: 0,          // 本次总上传数
    successCount: 0,        // 成功数
    failCount: 0            // 失败数
  },

  onLoad: function(options) {
    // 检查登录状态
    if (!app.globalData.hasLogin) {
      wx.navigateTo({
        url: '/pages/auth/login/login'
      });
    }
  },

  // 选择图片
  chooseImage: function() {
    if (this.data.uploading) {
      util.showErrorToast('正在上传中，请稍候');
      return;
    }

    var that = this;
    var remainingCount = that.data.maxCount - that.data.files.length;

    if (remainingCount <= 0) {
      util.showErrorToast('最多选择' + that.data.maxCount + '张图片');
      return;
    }

    wx.chooseImage({
      count: remainingCount,
      sizeType: ['original'],  // 只选择原图，保证高清
      sourceType: ['album', 'camera'],
      success: function(res) {
        var newFiles = that.data.files.concat(res.tempFilePaths);
        var newStatus = that.data.uploadStatus.concat(new Array(res.tempFilePaths.length).fill('pending'));
        var newProgress = that.data.uploadProgress.concat(new Array(res.tempFilePaths.length).fill(0));

        that.setData({
          files: newFiles,
          uploadStatus: newStatus,
          uploadProgress: newProgress
        });
      }
    });
  },

  // 预览图片
  previewImage: function(e) {
    var url = e.currentTarget.dataset.url;
    wx.previewImage({
      current: url,
      urls: this.data.files
    });
  },

  // 删除单张图片
  deleteImage: function(e) {
    var index = e.currentTarget.dataset.index;
    var files = this.data.files.slice();
    var status = this.data.uploadStatus.slice();
    var progress = this.data.uploadProgress.slice();

    files.splice(index, 1);
    status.splice(index, 1);
    progress.splice(index, 1);

    this.setData({
      files: files,
      uploadStatus: status,
      uploadProgress: progress
    });

    this.updateStats();
  },

  // 清空所有
  clearAll: function() {
    if (this.data.uploading) {
      util.showErrorToast('正在上传中，无法清空');
      return;
    }

    this.setData({
      files: [],
      uploadedUrls: [],
      uploadStatus: [],
      uploadProgress: [],
      totalCount: 0,
      successCount: 0,
      failCount: 0
    });
  },

  // 开始上传（串行上传）
  startUpload: function() {
    if (this.data.uploading) {
      return;
    }

    var that = this;
    var files = that.data.files;
    var status = that.data.uploadStatus.slice();

    // 找到第一个待上传的文件
    var pendingIndex = status.findIndex(s => s === 'pending');
    if (pendingIndex === -1) {
      util.showErrorToast('没有待上传的图片');
      return;
    }

    that.setData({
      uploading: true,
      totalCount: files.length,
      successCount: 0,
      failCount: 0
    });

    // 串行上传
    that.uploadNext(pendingIndex);
  },

  // 递归上传下一张
  uploadNext: function(index) {
    var that = this;
    var files = that.data.files;

    if (index >= files.length) {
      // 所有文件处理完成
      that.setData({
        uploading: false
      });
      that.showResult();
      return;
    }

    var status = that.data.uploadStatus.slice();
    if (status[index] !== 'pending') {
      // 跳过已处理的
      that.uploadNext(index + 1);
      return;
    }

    // 标记为上传中
    status[index] = 'uploading';
    that.setData({
      uploadStatus: status
    });

    // 上传单张图片
    that.uploadSingle(files[index], index, function(success) {
      var status = that.data.uploadStatus.slice();
      var successCount = that.data.successCount;
      var failCount = that.data.failCount;

      if (success) {
        status[index] = 'success';
        successCount++;
      } else {
        status[index] = 'fail';
        failCount++;
      }

      that.setData({
        uploadStatus: status,
        successCount: successCount,
        failCount: failCount
      });

      // 继续上传下一张
      that.uploadNext(index + 1);
    });
  },

  // 上传单张图片
  uploadSingle: function(filePath, index, callback) {
    var that = this;

    var uploadTask = wx.uploadFile({
      url: api.StorageUpload,
      filePath: filePath,
      name: 'file',
      header: {
        'X-Litemall-Token': wx.getStorageSync('token')
      },
      success: function(res) {
        try {
          var data = JSON.parse(res.data);
          if (data.errno === 0) {
            var urls = that.data.uploadedUrls.slice();
            urls.push(data.data.url);
            that.setData({
              uploadedUrls: urls
            });
            callback(true);
          } else {
            console.error('上传失败:', data.errmsg);
            callback(false);
          }
        } catch (e) {
          console.error('解析响应失败:', e);
          callback(false);
        }
      },
      fail: function(err) {
        console.error('上传请求失败:', err);
        callback(false);
      }
    });

    // 监听上传进度
    uploadTask.onProgressUpdate((res) => {
      var progress = that.data.uploadProgress.slice();
      progress[index] = res.progress;
      that.setData({
        uploadProgress: progress
      });
    });
  },

  // 更新统计
  updateStats: function() {
    var status = this.data.uploadStatus;
    var successCount = status.filter(s => s === 'success').length;
    var failCount = status.filter(s => s === 'fail').length;

    this.setData({
      successCount: successCount,
      failCount: failCount
    });
  },

  // 显示上传结果
  showResult: function() {
    var that = this;
    var successCount = that.data.successCount;
    var failCount = that.data.failCount;

    if (failCount === 0) {
      wx.showModal({
        title: '上传完成',
        content: '成功上传 ' + successCount + ' 张图片',
        showCancel: false,
        success: function() {
          // 清空已成功上传的图片
          that.clearUploaded();
        }
      });
    } else {
      wx.showModal({
        title: '上传完成',
        content: '成功: ' + successCount + ' 张，失败: ' + failCount + ' 张',
        showCancel: true,
        cancelText: '重试失败',
        confirmText: '确定',
        success: function(res) {
          if (res.cancel) {
            // 重试失败的图片
            that.retryFailed();
          } else {
            // 清空已成功上传的图片
            that.clearUploaded();
          }
        }
      });
    }
  },

  // 清空已上传成功的图片
  clearUploaded: function() {
    var files = this.data.files.slice();
    var status = this.data.uploadStatus.slice();
    var progress = this.data.uploadProgress.slice();

    var newFiles = [];
    var newStatus = [];
    var newProgress = [];

    for (var i = 0; i < status.length; i++) {
      if (status[i] !== 'success') {
        newFiles.push(files[i]);
        newStatus.push(status[i] === 'fail' ? 'pending' : status[i]);
        newProgress.push(progress[i]);
      }
    }

    this.setData({
      files: newFiles,
      uploadStatus: newStatus,
      uploadProgress: newProgress
    });

    this.updateStats();
  },

  // 重试失败的图片
  retryFailed: function() {
    var status = this.data.uploadStatus.slice();

    for (var i = 0; i < status.length; i++) {
      if (status[i] === 'fail') {
        status[i] = 'pending';
      }
    }

    this.setData({
      uploadStatus: status,
      failCount: 0
    });

    // 重新开始上传
    this.startUpload();
  },

  // 计算属性：是否全部上传完成
  get allUploaded() {
    return this.data.uploadStatus.length > 0 &&
           this.data.uploadStatus.every(s => s === 'success');
  }
});
