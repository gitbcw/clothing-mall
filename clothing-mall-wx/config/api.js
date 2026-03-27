var apiRootMap = {
  develop: 'http://47.107.151.70:8088/wx/',
  trial: 'http://47.107.151.70:8088/wx/',
  release: 'https://www.menethil.com.cn/wx/'
};
var envVersion = 'develop';
try {
  var accountInfo = wx.getAccountInfoSync();
  if (accountInfo && accountInfo.miniProgram && accountInfo.miniProgram.envVersion) {
    envVersion = accountInfo.miniProgram.envVersion;
  }
} catch (e) {}
var WxApiRoot = apiRootMap[envVersion] || apiRootMap.develop;

module.exports = {
  IndexUrl: WxApiRoot + 'home/index', //首页数据接口
  AboutUrl: WxApiRoot + 'home/about', //介绍信息

  CatalogList: WxApiRoot + 'catalog/index', //分类目录全部分类数据接口
  CatalogCurrent: WxApiRoot + 'catalog/current', //分类目录当前分类数据接口

  AuthLoginByWeixin: WxApiRoot + 'auth/login_by_weixin', //微信登录
  AuthLoginByPhone: WxApiRoot + 'auth/login_by_phone', //手机号一键登录
  AuthLoginByAccount: WxApiRoot + 'auth/login', //账号登录
  AuthLogout: WxApiRoot + 'auth/logout', //账号登出
  AuthRegister: WxApiRoot + 'auth/register', //账号注册
  AuthReset: WxApiRoot + 'auth/reset', //账号密码重置
  AuthRegisterCaptcha: WxApiRoot + 'auth/regCaptcha', //验证码
  AuthBindPhone: WxApiRoot + 'auth/bindPhone', //绑定微信手机号

  GoodsCount: WxApiRoot + 'goods/count', //统计商品总数
  GoodsList: WxApiRoot + 'goods/list', //获得商品列表
  GoodsCategory: WxApiRoot + 'goods/category', //获得分类数据
  GoodsDetail: WxApiRoot + 'goods/detail', //获得商品的详情
  GoodsRelated: WxApiRoot + 'goods/related', //商品详情页的关联商品（大家都在看）

  BrandList: WxApiRoot + 'brand/list', //品牌列表
  BrandDetail: WxApiRoot + 'brand/detail', //品牌详情

  CartList: WxApiRoot + 'cart/index', //获取购物车的数据
  CartAdd: WxApiRoot + 'cart/add', // 添加商品到购物车
  CartFastAdd: WxApiRoot + 'cart/fastadd', // 立即购买商品
  CartUpdate: WxApiRoot + 'cart/update', // 更新购物车的商品
  CartDelete: WxApiRoot + 'cart/delete', // 删除购物车的商品
  CartChecked: WxApiRoot + 'cart/checked', // 选择或取消选择商品
  CartGoodsCount: WxApiRoot + 'cart/goodscount', // 获取购物车商品件数
  CartCheckout: WxApiRoot + 'cart/checkout', // 下单前信息确认

  CollectList: WxApiRoot + 'collect/list', //收藏列表
  CollectAddOrDelete: WxApiRoot + 'collect/addordelete', //添加或取消收藏

  SearchIndex: WxApiRoot + 'search/index', //搜索关键字
  SearchResult: WxApiRoot + 'search/result', //搜索结果
  SearchHelper: WxApiRoot + 'search/helper', //搜索帮助
  SearchClearHistory: WxApiRoot + 'search/clearhistory', //搜索历史清楚

  AddressList: WxApiRoot + 'address/list', //收货地址列表
  AddressDetail: WxApiRoot + 'address/detail', //收货地址详情
  AddressSave: WxApiRoot + 'address/save', //保存收货地址
  AddressDelete: WxApiRoot + 'address/delete', //保存收货地址

  ExpressQuery: WxApiRoot + 'express/query', //物流查询

  RegionList: WxApiRoot + 'region/list', //获取区域列表

  OrderSubmit: WxApiRoot + 'order/submit', // 提交订单
  OrderPrepay: WxApiRoot + 'order/prepay', // 订单的预支付会话
  OrderList: WxApiRoot + 'order/list', //订单列表
  OrderDetail: WxApiRoot + 'order/detail', //订单详情
  OrderCancel: WxApiRoot + 'order/cancel', //取消订单
  OrderRefund: WxApiRoot + 'order/refund', //退款取消订单
  OrderDelete: WxApiRoot + 'order/delete', //删除订单
  OrderConfirm: WxApiRoot + 'order/confirm', //确认收货
  OrderGoods: WxApiRoot + 'order/goods', // 代评价商品信息
  OrderComment: WxApiRoot + 'order/comment', // 评价订单商品信息

  AftersaleSubmit: WxApiRoot + 'aftersale/submit', // 提交售后申请
  AftersaleList: WxApiRoot + 'aftersale/list', // 售后列表
  AftersaleDetail: WxApiRoot + 'aftersale/detail', // 售后详情

  FeedbackAdd: WxApiRoot + 'feedback/submit', //添加反馈
  FootprintList: WxApiRoot + 'footprint/list', //足迹列表
  FootprintDelete: WxApiRoot + 'footprint/delete', //删除足迹

  CouponList: WxApiRoot + 'coupon/list', //优惠券列表
  CouponMyList: WxApiRoot + 'coupon/mylist', //我的优惠券列表
  CouponSelectList: WxApiRoot + 'coupon/selectlist', //当前订单可用优惠券列表
  CouponReceive: WxApiRoot + 'coupon/receive', //优惠券领取
  CouponExchange: WxApiRoot + 'coupon/exchange', //优惠券兑换

  StorageUpload: WxApiRoot + 'storage/upload', //图片上传,
  SceneBanners: WxApiRoot + 'scene/banners',
  SceneGoods: WxApiRoot + 'scene/goods',

  UserIndex: WxApiRoot + 'user/index', //个人页面用户相关信息
  UserUpdate: WxApiRoot + 'user/update', //更新用户信息
  UserRole: WxApiRoot + 'user/role', // 获取用户角色
  UserIsManager: WxApiRoot + 'user/isManager', // 检查用户是否有管理权限
  IssueList: WxApiRoot + 'issue/list', //帮助信息

  // 服装店 SKU 相关接口
  ClothingSkuList: WxApiRoot + 'clothing/sku/list', // 商品 SKU 列表
  ClothingSkuDetail: WxApiRoot + 'clothing/sku/detail', // SKU 详情
  ClothingSkuCreate: WxApiRoot + 'clothing/sku/create', // 创建 SKU
  ClothingSkuUpdate: WxApiRoot + 'clothing/sku/update', // 更新 SKU
  ClothingSkuCheckStock: WxApiRoot + 'clothing/sku/checkStock', // 检查库存
  ClothingStoreList: WxApiRoot + 'clothing/store/list', // 门店列表
  ClothingStoreDetail: WxApiRoot + 'clothing/store/detail', // 门店详情
  ClothingUserInfo: WxApiRoot + 'clothing/user/info', // 会员信息
  ClothingUserBindGuide: WxApiRoot + 'clothing/user/bindGuide', // 绑定导购

  FlashSaleGoods: WxApiRoot + 'flashSale/goods', // 商品特卖信息

  // 埋点上报接口
  TrackerReport: WxApiRoot + 'tracker/report',

  // 文件上传
  StorageUpload: WxApiRoot + 'storage/upload',

  // AI 识别相关接口
  AiRecognizeByUrl: WxApiRoot + 'ai/recognizeByUrl', // 通过 URL 识别服装
  AiRecognize: WxApiRoot + 'ai/recognize', // 上传图片识别服装
  AiStatus: WxApiRoot + 'ai/status', // AI 服务状态

  // 管理端订单接口
  ManagerOrderDetail: WxApiRoot + 'manager/order/detail', // 管理端订单详情
  ManagerOrderShip: WxApiRoot + 'manager/order/ship', // 发货
  ManagerOrderConfirm: WxApiRoot + 'manager/order/confirm', // 确认收货
  ManagerOrderCancel: WxApiRoot + 'manager/order/cancel', // 取消订单

  // 管理端商品接口
  ManagerGoodsUnpublishAll: WxApiRoot + 'manager/goods/unpublishAll', // 一键下架全部商品
  ManagerGoodsCreate: WxApiRoot + 'manager/goods/create', // 快速创建商品草稿
};
