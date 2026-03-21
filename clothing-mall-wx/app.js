var util = require('./utils/util.js');
var api = require('./config/api.js');
var user = require('./utils/user.js');

App({
  onLaunch: function() {
    // Promise.finally polyfill
    Promise.prototype.finally = function(callback) {
      let P = this.constructor;
      return this.then(
        value => {
          P.resolve(callback()).then(() => value)
        },
        reason => {
          P.resolve(callback()).then(() => { throw reason })
        }
      )
    };

    // 小程序更新检查
    const updateManager = wx.getUpdateManager();
    updateManager.onUpdateReady(function() {
      wx.showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否重启应用？',
        success: function(res) {
          if (res.confirm) {
            updateManager.applyUpdate()
          }
        }
      })
    });
  },

  onShow: function(options) {
    // 检查登录状态
    user.checkLogin().then(res => {
      this.globalData.hasLogin = true;
    }).catch(() => {
      this.globalData.hasLogin = false;
    });
  },

  globalData: {
    hasLogin: false
  }
})
