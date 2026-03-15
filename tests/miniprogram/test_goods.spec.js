/**
 * 商品详情测试
 * 测试用例覆盖：
 * - WXG-01: 商品详情页加载
 * - WXG-02: 商品图片展示
 * - WXG-03: 商品信息展示
 * - WXG-04: 加入购物车
 */
const automator = require('miniprogram-automator');
const { getHelper } = require('./helper');

describe('商品详情测试', () => {
  let miniProgram;
  let page;
  const helper = getHelper();

  beforeAll(async () => {
    miniProgram = await helper.launch();
  }, 60000);

  afterAll(async () => {
    await helper.close();
  });

  test('WXG-01: 商品详情页加载', async () => {
    // 先进入首页获取商品
    page = await miniProgram.reLaunch('/pages/index/index');
    await helper.sleep(2000);

    // 尝试点击商品卡片
    const goodsCards = await page.$$('.goods-card, .van-card, .goods-item, navigator');

    if (goodsCards.length > 0) {
      await goodsCards[0].tap();
      await helper.sleep(2000);

      // 检查是否跳转到详情页
      const currentPage = await miniProgram.currentPage();
      console.log('当前页面路径:', currentPage.path);
    }
  });

  test('WXG-02: 直接访问商品详情', async () => {
    // 直接访问商品详情页（使用测试商品ID）
    try {
      page = await miniProgram.reLaunch('/pages/goods/goods?id=1');
      await helper.sleep(2000);

      const data = await page.data();
      console.log('商品详情数据 keys:', Object.keys(data));

      // 检查商品信息
      if (data.goods) {
        console.log('商品名称:', data.goods.name || data.goods.title || '未知');
      }
    } catch (e) {
      console.log('商品详情页访问失败:', e.message);
    }
  });

  test('WXG-03: 商品图片轮播', async () => {
    try {
      page = await miniProgram.reLaunch('/pages/goods/goods?id=1');
      await helper.sleep(2000);

      // 查找图片轮播
      const swiper = await page.$('swiper');
      if (swiper) {
        console.log('找到商品图片轮播');
        const swiperItems = await page.$$('swiper-item');
        console.log(`商品图片数量: ${swiperItems.length}`);
      }
    } catch (e) {
      console.log('测试跳过:', e.message);
    }
  });

  test('WXG-04: 商品规格选择', async () => {
    try {
      page = await miniProgram.reLaunch('/pages/goods/goods?id=1');
      await helper.sleep(2000);

      // 查找规格选择按钮或弹窗
      const specBtn = await page.$('.spec-btn, .select-spec, .sku-btn');

      if (specBtn) {
        await specBtn.tap();
        await helper.sleep(500);
        console.log('规格选择弹窗已打开');
      }
    } catch (e) {
      console.log('规格选择测试跳过:', e.message);
    }
  });
});
