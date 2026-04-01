Component({
  properties: {
    title: {
      type: String,
      value: ''
    },
    background: {
      type: String,
      value: '#f4f4f4'
    }
  },

  data: {
    statusBarHeight: 20,
    navTotalHeight: 68
  },

  lifetimes: {
    attached: function() {
      const sysInfo = wx.getSystemInfoSync();
      const statusBarHeight = sysInfo.statusBarHeight || 20;
      this.setData({
        statusBarHeight: statusBarHeight,
        navTotalHeight: statusBarHeight + 48
      });
    }
  },

  methods: {
    goBack: function() {
      wx.navigateBack({
        fail: function() {
          wx.switchTab({ url: '/pages/index/index' });
        }
      });
    }
  }
});
