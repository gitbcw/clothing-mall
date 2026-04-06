const util = require('../../../utils/util.js');
const api = require('../../../config/api.js');
const app = getApp();

Page({
  data: {
    userInfo: {
      nickName: '',
      avatarUrl: '',
      mobile: '',
      birthday: ''
    },
    today: ''
  },

  onLoad: function (options) {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
    this.setData({
      today: todayStr
    });
    this.getUserInfo();
  },

  getUserInfo: function() {
    util.request(api.UserInfo).then(res => {
      if (res.errno === 0) {
        this.setData({
          userInfo: {
            nickName: res.data.nickname,
            avatarUrl: res.data.avatar,
            mobile: res.data.mobile || '',
            birthday: res.data.birthday
          }
        });
      }
    });
  },

  onChooseAvatar(e) {
    const { avatarUrl } = e.detail;
    // 这里需要将头像上传到服务器，获取URL，暂时直接使用本地临时路径或上传接口
    // 为了完整性，我们先调用上传接口
    wx.uploadFile({
      url: api.StorageUpload,
      filePath: avatarUrl,
      name: 'file',
      header: {
        'X-Litemall-Token': wx.getStorageSync('token')
      },
      success: (res) => {
        let data = JSON.parse(res.data);
        if (data.errno === 0) {
          this.setData({
            'userInfo.avatarUrl': data.data.url
          });
        }
      }
    });
  },

  bindNicknameInput(e) {
    this.setData({
      'userInfo.nickName': e.detail.value
    });
  },

  bindBirthdayChange(e) {
    this.setData({
      'userInfo.birthday': e.detail.value
    });
  },

  saveProfile() {
    const { nickName, avatarUrl, mobile, birthday } = this.data.userInfo;
    if (!nickName) {
      util.showErrorToast('请输入昵称');
      return;
    }

    util.request(api.UserProfile, {
      nickname: nickName,
      avatar: avatarUrl,
      mobile: mobile,
      birthday: birthday
    }, 'POST').then(res => {
      if (res.errno === 0) {
        wx.showToast({
          title: '保存成功',
          icon: 'success'
        });

        // 更新本地缓存
        const localUserInfo = wx.getStorageSync('userInfo') || {};
        wx.setStorageSync('userInfo', {
          ...localUserInfo,
          nickName: nickName,
          avatarUrl: avatarUrl
        });

        setTimeout(() => {
          wx.navigateBack({
            delta: 1
          });
        }, 1500);
      } else {
        util.showErrorToast(res.errmsg || '保存失败');
      }
    });
  }
});
