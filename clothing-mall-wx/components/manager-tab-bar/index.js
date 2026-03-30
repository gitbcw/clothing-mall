Component({
  data: {
    active: 0,
    list: [
      { pagePath: "/pages/manager/tabOrder/tabOrder", text: "订单", iconClass: "order" },
      { pagePath: "/pages/manager/tabShelf/tabShelf", text: "上架", iconClass: "shelf" }
    ]
  },

  methods: {
    switchTab(e) {
      const data = e.currentTarget.dataset;
      const url = data.path;
      this.setData({ active: data.index });
      wx.redirectTo({ url });
    }
  }
});
