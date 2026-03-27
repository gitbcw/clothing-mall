var api = require('../../../config/api.js');
var util = require('../../../utils/util.js');
var user = require('../../../utils/user.js');

var app = getApp();
Page({
  data: {
    canIUseGetUserProfile: false,
    statusBarHeight: 20,
    navContentHeight: 48,
    navTotalHeight: 68,
    navTitle: '账户登录',
    showBirthdayPopup: false,
  },
  onLoad: function(options) {
    // 页面初始化 options为页面跳转所带来的参数
    // 页面渲染完成
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true
      })
    }

    const sysInfo = wx.getSystemInfoSync()
    const statusBarHeight = sysInfo.statusBarHeight || 20
    const navContentHeight = this.data.navContentHeight
    const navTotalHeight = statusBarHeight + navContentHeight
    this.setData({ statusBarHeight, navTotalHeight })
  },
  onReady: function() {

  },
  onShow: function() {
    // 页面显示
  },
  onHide: function() {
    // 页面隐藏

  },
  onUnload: function() {
    // 页面关闭

  },
  wxLogin: function(e) {
    if (this.data.canIUseGetUserProfile) {
      wx.getUserProfile({
        desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
        success: (res) => {
          this.doLogin(res.userInfo)
        },
        fail: () => {
          util.showErrorToast('微信登录失败');
        }
      })
    }
    else {
      if (e.detail.userInfo == undefined) {
        app.globalData.hasLogin = false;
        util.showErrorToast('微信登录失败');
        return;
      }
      this.doLogin(e.detail.userInfo)
    }
  },
  doLogin: function(userInfo) {
    user.checkLogin().catch(() => {
      user.loginByWeixin(userInfo).then(res => {
        app.globalData.hasLogin = true;

        // 检查是否需要显示生日弹窗（新用户且未填写生日）
        const userInfo = res.data.userInfo;
        if (userInfo && !userInfo.birthday) {
          this.setData({ showBirthdayPopup: true });
        } else {
          wx.navigateBack({
            delta: 1
          });
        }
      }).catch((err) => {
        app.globalData.hasLogin = false;
        util.showErrorToast('微信登录失败');
      });

    });
  },
  accountLogin: function() {
    wx.navigateTo({
      url: "/pages/auth/accountLogin/accountLogin"
    });
  },
  phoneLogin: function(e) {
    if (e.detail.errMsg !== 'getPhoneNumber:ok') {
      util.showErrorToast('授权失败');
      return;
    }

    const that = this;
    wx.login({
      success: function(loginRes) {
        if (loginRes.code) {
          const data = {
            code: loginRes.code,
            encryptedData: e.detail.encryptedData,
            iv: e.detail.iv
          };

          util.request(api.AuthLoginByPhone, data, 'POST').then(res => {
            if (res.errno === 0) {
              app.globalData.hasLogin = true;
              // 存储 token
              wx.setStorageSync('token', res.data.token);
              wx.setStorageSync('userInfo', res.data.userInfo);

              util.showToast('登录成功');

              // 检查是否需要显示生日弹窗
              const userInfo = res.data.userInfo;
              if (userInfo && !userInfo.birthday) {
                that.setData({ showBirthdayPopup: true });
              } else {
                wx.navigateBack({ delta: 1 });
              }
            } else {
              util.showErrorToast(res.errmsg || '登录失败');
            }
          }).catch(err => {
            util.showErrorToast('登录失败');
          });
        } else {
          util.showErrorToast('微信登录失败');
        }
      }
    });
  },
  handleBack: function() {
    wx.navigateBack({ delta: 1 })
  },

  /**
   * 生日提交成功
   */
  onBirthdaySubmit: function(e) {
    this.setData({ showBirthdayPopup: false });
    wx.navigateBack({
      delta: 1
    });
  },

  /**
   * 跳过生日填写
   */
  onBirthdaySkip: function() {
    this.setData({ showBirthdayPopup: false });
    wx.navigateBack({
      delta: 1
    });
  }
})
