var util = require('../../utils/util.js');
var api = require('../../config/api.js');
var tracker = require('../../utils/tracker.js');

var app = getApp()
Page({
  data: {
    keywrod: '',
    searchStatus: false,
    goodsList: [],
    helpKeyword: [],
    historyKeyword: [],
    categoryFilter: false,
    currentSort: 'default',
    currentSortType: 'default',
    currentSortOrder: 'desc',
    filterCategory: [],
    defaultKeyword: {},
    hotKeyword: [],
    page: 1,
    limit: 20,
    categoryId: 0,
    categoryList: [],
    sceneList: [],
    sceneId: 0,
    statusBarHeight: 20
  },
  //事件处理函数
  closeSearch: function() {
    wx.navigateBack()
  },
  clearKeyword: function() {
    this.setData({
      keyword: '',
      searchStatus: false
    });
  },
  onLoad: function() {
    const { statusBarHeight } = wx.getWindowInfo();
    this.setData({
      statusBarHeight: statusBarHeight || 20
    });
    this.getSearchKeyword();
  },

  getSearchKeyword() {
    let that = this;
    util.request(api.SearchIndex).then(function(res) {
      if (res.errno === 0) {
        that.setData({
          historyKeyword: res.data.historyKeywordList,
          defaultKeyword: res.data.defaultKeyword,
          hotKeyword: res.data.hotKeywordList,
          categoryList: res.data.categoryList || [],
          sceneList: res.data.sceneList || []
        });
      }
    });
  },

  inputChange: function(e) {
    this.setData({
      keyword: e.detail.value,
      searchStatus: false
    });

    if (e.detail.value) {
      this.getHelpKeyword();
    }
  },
  getHelpKeyword: function() {
    let that = this;
    util.request(api.SearchHelper, {
      keyword: that.data.keyword
    }).then(function(res) {
      if (res.errno === 0) {
        that.setData({
          helpKeyword: res.data
        });
      }
    });
  },
  inputFocus: function() {
    this.setData({
      searchStatus: false,
      goodsList: []
    });

    if (this.data.keyword) {
      this.getHelpKeyword();
    }
  },
  clearHistory: function() {
    this.setData({
      historyKeyword: []
    })

    util.request(api.SearchClearHistory, {}, 'POST')
      .then(function(res) {
        console.log('清除成功');
      });
  },
  getGoodsList: function() {
    let that = this;
    util.request(api.GoodsList, {
      keyword: that.data.keyword,
      page: that.data.page,
      limit: that.data.limit,
      sort: that.data.currentSort,
      order: that.data.currentSortOrder,
      categoryId: that.data.categoryId,
      sceneId: that.data.sceneId
    }).then(function(res) {
      if (res.errno === 0) {
        that.setData({
          searchStatus: true,
          categoryFilter: false,
          goodsList: res.data.list,
          filterCategory: res.data.filterCategoryList
        });
        // 搜索埋点
        tracker.trackSearch(that.data.keyword, res.data.list ? res.data.list.length : 0);
      }

      //重新获取关键词
      that.getSearchKeyword();
    });
  },
  onKeywordTap: function(event) {

    this.getSearchResult(event.target.dataset.keyword);

  },
  getSearchResult(keyword) {
    if (keyword === '') {
      keyword = this.data.defaultKeyword.keyword;
    }
    this.setData({
      keyword: keyword,
      page: 1,
      categoryId: 0,
      goodsList: []
    });

    this.getGoodsList();
  },
  openSortFilter: function(event) {
    let currentId = event.currentTarget.id;
    switch (currentId) {
      case 'priceSort':
        let tmpSortOrder = 'asc';
        if (this.data.currentSortOrder == 'asc') {
          tmpSortOrder = 'desc';
        }
        this.setData({
          currentSortType: 'price',
          currentSort: 'retail_price',
          currentSortOrder: tmpSortOrder,
          categoryFilter: false
        });
        this.getGoodsList();
        break;
      case 'newSort':
        this.setData({
          currentSortType: 'new',
          currentSort: 'add_time',
          currentSortOrder: 'desc',
          categoryFilter: false
        });
        this.getGoodsList();
        break;
      default:
        // 综合排序
        this.setData({
          currentSortType: 'default',
          currentSort: 'default',
          currentSortOrder: 'desc',
          categoryFilter: false
        });
        this.getGoodsList();
    }
  },
  selectCategory: function(event) {
    let currentIndex = event.target.dataset.categoryIndex;
    let filterCategory = this.data.filterCategory;
    let currentCategory = null;
    for (let key in filterCategory) {
      if (key == currentIndex) {
        filterCategory[key].selected = true;
        currentCategory = filterCategory[key];
      } else {
        filterCategory[key].selected = false;
      }
    }
    this.setData({
      filterCategory: filterCategory,
      categoryFilter: false,
      categoryId: currentCategory.id,
      page: 1,
      goodsList: []
    });
    this.getGoodsList();
  },
  onKeywordConfirm(event) {
    this.getSearchResult(event.detail.value);
  },
  onCategoryTap: function(e) {
    let categoryId = e.currentTarget.dataset.id;
    this.setData({
      keyword: '',
      page: 1,
      categoryId: categoryId,
      sceneId: 0,
      goodsList: [],
      currentSortType: 'default',
      currentSort: 'default',
      currentSortOrder: 'desc'
    });
    this.getGoodsList();
  },

  onSceneTap: function(e) {
    let sceneId = e.currentTarget.dataset.id;
    this.setData({
      keyword: '',
      page: 1,
      categoryId: 0,
      sceneId: sceneId,
      goodsList: [],
      currentSortType: 'default',
      currentSort: 'default',
      currentSortOrder: 'desc'
    });
    this.getGoodsList();
  }
})