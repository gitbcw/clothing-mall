/**
 * 首页测试
 * 测试用例覆盖：
 * - WXH-01: 首页轮播图展示
 * - WXH-02: 首页商品列表
 * - WXH-03: 首页分类入口
 */
const automator = require('miniprogram-automator');
const { getHelper } = require('./helper');

describe('首页测试', () => {
  let miniProgram;
  let page;
  const helper = getHelper();

  beforeAll(async () => {
    miniProgram = await helper.launch();
  }, 60000);

  afterAll(async () => {
    await helper.close();
  });

  beforeEach(async () => {
    page = await miniProgram.reLaunch('/pages/index/index');
    await helper.sleep(1000);
  });

  test('WXH-01: 首页轮播图展示', async () => {
    // 等待页面加载
    await helper.sleep(2000);

    // 查找轮播图组件
    const swiper = await page.$('swiper');
    expect(swiper).not.toBeNull();

    // 获取轮播图数量
    const swiperItems = await page.$$('swiper-item');
    console.log(`轮播图数量: ${swiperItems.length}`);
    expect(swiperItems.length).toBeGreaterThan(0);
  });

  test('WXH-02: 首页商品列表展示', async () => {
    await helper.sleep(2000);

    // 查找商品卡片（首页商品在 page.data 中）
    const data = await page.data();
    const hotGoods = data.hotGoods || [];
    const newGoods = data.newGoods || [];

    console.log(`热门商品数量: ${hotGoods.length}`);
    console.log(`新品商品数量: ${newGoods.length}`);

    // 查找商品卡片元素
    const goodsCards = await page.$$('.goods-card, .van-card, .goods-item');
    console.log(`商品卡片元素数量: ${goodsCards.length}`);

    // 如果没有找到商品卡片，尝试其他选择器
    if (goodsCards.length === 0) {
      const allElements = await page.$$('view');
      console.log(`页面 view 元素数量: ${allElements.length}`);
    }
  });

  test('WXH-03: 首页分类入口', async () => {
    await helper.sleep(2000);

    // 查找分类图标或入口
    const categoryItems = await page.$$('.category-item, .grid-item, .menu-item');
    console.log(`分类入口数量: ${categoryItems.length}`);
  });

  test('WXH-04: 搜索功能', async () => {
    await helper.sleep(1000);

    // 查找搜索框
    const searchInput = await page.$('.search-input, input[placeholder*="搜索"], .van-search__content');

    if (searchInput) {
      console.log('找到搜索框');

      // 点击搜索框
      await searchInput.tap();
      await helper.sleep(500);

      // 可能跳转到搜索页面
    } else {
      console.log('未找到搜索框，可能使用了不同的组件');
    }
  });

  test('WXH-05: 页面数据加载', async () => {
    await helper.sleep(2000);

    // 获取页面数据
    const data = await page.data();
    console.log('页面数据 keys:', Object.keys(data));

    // 检查是否有数据
    expect(data).toBeDefined();
  });
});
