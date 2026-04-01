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
    navTitle: '绑定手机号',
    showBirthdayPopup: false,
    mobile: ''
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
  bindMobileInput: function(e) {
    this.setData({
      mobile: e.detail.value
    });
  },
  clearInput: function() {
    this.setData({
      mobile: ''
    });
  },
  bindPhoneNumberManual: function() {
    if (this.data.mobile.length !== 11) {
      util.showErrorToast('请输入11位手机号');
      return;
    }

    const that = this;
    util.request(api.AuthBindPhoneManual, { mobile: this.data.mobile }, 'POST').then(res => {
      console.log('手动绑定手机号返回结果:', res);
      if (res.errno === 0) {
        util.showToast('绑定成功');
        
        // 重新获取用户信息以更新 mobile
        util.request(api.UserInfo, {}, 'GET').then(infoRes => {
          if (infoRes.errno === 0) {
            wx.setStorageSync('userInfo', {
              nickName: infoRes.data.nickname,
              avatarUrl: infoRes.data.avatar,
              mobile: infoRes.data.mobile,
              birthday: infoRes.data.birthday
            });
          }
          
          // 检查是否需要显示生日弹窗
          const userInfo = infoRes.data;
          if (userInfo && !userInfo.birthday) {
            that.setData({ showBirthdayPopup: true });
          } else {
            wx.navigateBack({ delta: 1 });
          }
        });
      } else {
        console.error('手动绑定手机号失败，接口返回非0:', res);
        util.showErrorToast(res.errmsg || '绑定失败');
      }
    }).catch(err => {
      console.error('手动绑定手机号请求抛出异常:', err);
      util.showErrorToast('绑定失败');
    });
  },
  bindPhoneNumber: function(e) {
    if (e.detail.errMsg !== 'getPhoneNumber:ok') {
      if (e.detail.errMsg.indexOf('user deny') !== -1) {
        util.showErrorToast('已取消授权');
      } else if (e.detail.errMsg.indexOf('no permission') !== -1) {
        util.showErrorToast('无权限获取手机号');
      } else {
        util.showErrorToast('授权失败');
      }
      return;
    }

    const that = this;
    const data = {
      encryptedData: e.detail.encryptedData,
      iv: e.detail.iv
    };

    util.request(api.AuthBindPhone, data, 'POST').then(res => {
      if (res.errno === 0) {
        util.showToast('绑定成功');
        
        // 重新获取用户信息以更新 mobile
        util.request(api.UserInfo, {}, 'GET').then(infoRes => {
          if (infoRes.errno === 0) {
            wx.setStorageSync('userInfo', {
              nickName: infoRes.data.nickname,
              avatarUrl: infoRes.data.avatar,
              mobile: infoRes.data.mobile,
              birthday: infoRes.data.birthday
            });
          }
          
          // 检查是否需要显示生日弹窗
          const userInfo = infoRes.data;
          if (userInfo && !userInfo.birthday) {
            that.setData({ showBirthdayPopup: true });
          } else {
            wx.navigateBack({ delta: 1 });
          }
        });
      } else {
        util.showErrorToast(res.errmsg || '绑定失败');
      }
    }).catch(err => {
      util.showErrorToast('绑定失败');
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
