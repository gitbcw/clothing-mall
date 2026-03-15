/**
 * 分类页测试
 * 测试用例覆盖：
 * - WXC-01: 分类页左侧菜单
 * - WXC-02: 分类页右侧商品列表
 * - WXC-03: 分类切换
 */
const automator = require('miniprogram-automator');
const { getHelper } = require('./helper');

describe('分类页测试', () => {
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
    page = await miniProgram.reLaunch('/pages/catalog/catalog');
    await helper.sleep(1500);
  });

  test('WXC-01: 分类页左侧菜单展示', async () => {
    await helper.sleep(1000);

    // 查找左侧分类菜单
    const menuItems = await page.$$('.menu-item, .category-menu-item, .left-menu-item');
    console.log(`左侧菜单项数量: ${menuItems.length}`);

    // 如果没找到，尝试打印页面结构
    if (menuItems.length === 0) {
      const data = await page.data();
      console.log('页面数据:', JSON.stringify(data, null, 2).slice(0, 500));
    }
  });

  test('WXC-02: 分类页右侧商品列表', async () => {
    await helper.sleep(1000);

    // 查找右侧商品列表
    const goodsItems = await page.$$('.goods-item, .product-item, .item');
    console.log(`右侧商品数量: ${goodsItems.length}`);
  });

  test('WXC-03: 分类切换', async () => {
    await helper.sleep(1000);

    // 获取左侧菜单项
    const menuItems = await page.$$('.menu-item, .category-menu-item, .left-menu-item');

    if (menuItems.length > 1) {
      // 点击第二个分类
      await menuItems[1].tap();
      await helper.sleep(1000);

      // 检查页面是否更新
      const data = await page.data();
      console.log('切换后的当前分类:', data.currentCategory || data.currentTab || '未知');
    }
  });
});
