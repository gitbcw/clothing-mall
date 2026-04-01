var util = require('../../utils/util.js');
var api = require('../../config/api.js');
var app = getApp();

Component({
  properties: {},

  data: {
    count: 0
  },

  lifetimes: {
    attached: function() {
      this.refreshCount();
    }
  },

  pageLifetimes: {
    show: function() {
      // 每次页面显示时刷新购物车数量
      this.refreshCount();
    }
  },

  methods: {
    refreshCount: function() {
      var that = this;
      util.request(api.CartGoodsCount).then(function(res) {
        if (res.errno === 0) {
          that.setData({ count: res.data });
        }
      }).catch(function() {
        // 静默失败，不影响用户体验
      });
    },

    goToCart: function() {
      wx.switchTab({
        url: '/pages/cart/cart'
      });
    }
  }
});
