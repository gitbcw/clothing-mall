const util = require('../../../utils/util.js');
const api = require('../../../config/api.js');

const app = getApp();

Page({
  data: {
    orderId: null,
    order: {},
    loading: true,
    // 发货弹窗
    showShipDialog: false,
    shipChannel: '',
    shipSn: '',
    // 物流公司选项
    channelOptions: ['顺丰速运', '中通快递', '圆通快递', '韵达快递', '申通快递', '百世快递', '极兔速递', '邮政EMS', '京东快递', '其他'],
    channelIndex: 0
  },

  onLoad(options) {
    this.setData({ orderId: options.id });
    this.getOrderDetail();
  },

  getOrderDetail() {
    let that = this;
    this.setData({ loading: true });

    util.request(api.ManagerOrderDetail, { orderId: this.data.orderId }).then(function(res) {
      if (res.errno === 0) {
        const order = res.data;
        // 添加操作选项
        order.handleOption = {
          ship: order.orderStatus === 201, // 待发货
          confirm: order.orderStatus === 301, // 待收货
          refund: order.orderStatus === 101 || order.orderStatus === 201 // 待付款或待发货
        };
        // 订单状态文字
        const statusMap = {
          101: '待付款',
          102: '已取消',
          103: '已取消(系统)',
          201: '待发货',
          202: '申请退款',
          203: '已退款',
          301: '待收货',
          401: '已收货',
          402: '已收货(系统)'
        };
        order.orderStatusText = statusMap[order.orderStatus] || '未知状态';

        that.setData({
          order: order,
          loading: false
        });
      } else {
        // 如果管理端接口失败，尝试使用普通接口
        util.request(api.OrderDetail, { orderId: that.data.orderId }).then(function(res) {
          if (res.errno === 0) {
            that.setData({
              order: res.data,
              loading: false
            });
          }
        });
      }
    }).catch(function() {
      that.setData({ loading: false });
    });
  },

  // 显示发货弹窗
  handleShip() {
    this.setData({ showShipDialog: true });
  },

  // 关闭发货弹窗
  closeShipDialog() {
    this.setData({ showShipDialog: false });
  },

  // 选择物流公司
  onChannelChange(e) {
    this.setData({
      channelIndex: e.detail.value,
      shipChannel: this.data.channelOptions[e.detail.value]
    });
  },

  // 输入物流单号
  onShipSnInput(e) {
    this.setData({ shipSn: e.detail.value });
  },

  // 确认发货
  confirmShip() {
    if (!this.data.shipChannel) {
      wx.showToast({ title: '请选择物流公司', icon: 'none' });
      return;
    }
    if (!this.data.shipSn) {
      wx.showToast({ title: '请输入物流单号', icon: 'none' });
      return;
    }

    let that = this;
    util.request(api.ManagerOrderShip, {
      orderId: this.data.orderId,
      shipChannel: this.data.shipChannel,
      shipSn: this.data.shipSn
    }, 'POST').then(function(res) {
      if (res.errno === 0) {
        wx.showToast({ title: '发货成功', icon: 'success' });
        that.setData({ showShipDialog: false });
        that.getOrderDetail();
      } else {
        wx.showToast({ title: res.errmsg || '发货失败', icon: 'none' });
      }
    }).catch(function() {
      wx.showToast({ title: '发货失败', icon: 'none' });
    });
  },

  // 确认收货
  handleConfirm() {
    wx.showModal({
      title: '确认',
      content: '确认用户已收货？',
      success: (res) => {
        if (res.confirm) {
          this.doConfirm();
        }
      }
    });
  },

  doConfirm() {
    let that = this;
    util.request(api.ManagerOrderConfirm, { orderId: this.data.orderId }, 'POST').then(function(res) {
      if (res.errno === 0) {
        wx.showToast({ title: '操作成功', icon: 'success' });
        that.getOrderDetail();
      } else {
        wx.showToast({ title: res.errmsg || '操作失败', icon: 'none' });
      }
    }).catch(function() {
      wx.showToast({ title: '操作失败', icon: 'none' });
    });
  },

  // 退款
  handleRefund() {
    wx.showModal({
      title: '确认',
      content: '确认退款？退款金额将原路返回',
      success: (res) => {
        if (res.confirm) {
          this.doRefund();
        }
      }
    });
  },

  doRefund() {
    let that = this;
    util.request(api.OrderRefund, {
      orderId: this.data.orderId
    }, 'POST').then(function(res) {
      if (res.errno === 0) {
        wx.showToast({ title: '退款成功', icon: 'success' });
        that.getOrderDetail();
      } else {
        wx.showToast({ title: res.errmsg || '退款失败', icon: 'none' });
      }
    }).catch(function() {
      wx.showToast({ title: '退款失败', icon: 'none' });
    });
  }
})
