/**
 * 活动相关 API（限时特卖、满减活动等）
 */
const { request } = require('../utils/util.js')
const api = require('../config/api.js')

module.exports = {
  // 获取限时特卖列表
  getFlashSaleList(params) {
    return request(api.FlashSaleList, params)
  },

  // 获取限时特卖详情
  getFlashSaleDetail(id) {
    return request(api.FlashSaleDetail, { id })
  },

  // 获取商品特卖信息
  getGoodsFlashSale(goodsId) {
    return request(api.FlashSaleGoods, { goodsId })
  }
}
