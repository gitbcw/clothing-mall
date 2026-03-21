下面给你一套**微信小程序页面代码**，按你这张图做了高拟真复刻，包含：

* 顶部导航栏
* 商品列表
* 失效商品区
* 底部结算栏
* 底部 TabBar（页面内模拟版）
* 数量加减按钮
* 选中/未选中状态

你直接建一个页面，比如 `pages/cart/`，把下面 4 个文件放进去即可。

---

## 1）pages/cart/cart.wxml

```xml
<view class="page">
  <!-- 顶部状态栏 + 导航栏 -->
  <view class="top-wrap">
    <view class="status-bar">
      <text class="time">9:41</text>

      <view class="status-right">
        <view class="signal">
          <view class="bar b1"></view>
          <view class="bar b2"></view>
          <view class="bar b3"></view>
          <view class="bar b4"></view>
        </view>
        <view class="wifi"></view>
        <view class="battery">
          <view class="battery-inner"></view>
        </view>
      </view>
    </view>

    <view class="nav-bar">
      <view class="back-arrow"></view>
      <text class="nav-title">购物车</text>

      <view class="capsule">
        <view class="capsule-dots">
          <view class="dot"></view>
          <view class="dot"></view>
          <view class="dot"></view>
        </view>
        <view class="capsule-divider"></view>
        <view class="capsule-circle"></view>
      </view>
    </view>
  </view>

  <!-- 内容区 -->
  <scroll-view class="content" scroll-y="true" enable-flex="true">
    <!-- 头部统计 -->
    <view class="cart-summary">
      <view class="cart-summary-left">
        <view class="bag-icon"></view>
        <text class="summary-text">共4件商品</text>
      </view>
      <text class="manage-text">管理</text>
    </view>

    <!-- 有效商品 -->
    <view class="goods-card" wx:for="{{goodsList}}" wx:key="id">
      <view class="goods-row">
        <view class="check-wrap" bindtap="toggleSelect" data-id="{{item.id}}">
          <view class="radio {{item.checked ? 'radio-active' : ''}}">
            <text wx:if="{{item.checked}}" class="check-mark">✓</text>
          </view>
        </view>

        <image class="goods-image" src="{{item.image}}" mode="aspectFill"></image>

        <view class="goods-info">
          <text class="goods-title">{{item.title}}</text>
          <text class="goods-desc">{{item.desc}}</text>

          <view class="goods-bottom">
            <view class="price-wrap">
              <text class="price-now">¥{{item.price}}</text>
              <text class="price-old" wx:if="{{item.oldPrice}}">¥{{item.oldPrice}}</text>
            </view>

            <view class="stepper">
              <view class="step-btn minus" bindtap="decreaseCount" data-id="{{item.id}}">－</view>
              <view class="step-count">{{item.count}}</view>
              <view class="step-btn plus" bindtap="increaseCount" data-id="{{item.id}}">＋</view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 失效商品 -->
    <view class="invalid-wrap">
      <view class="invalid-head">
        <text class="invalid-head-left">2件商品失效</text>
        <text class="invalid-head-right">清空失效商品</text>
      </view>

      <view class="invalid-item" wx:for="{{invalidList}}" wx:key="id">
        <view class="invalid-inner">
          <view class="invalid-tag">失效</view>
          <image class="goods-image" src="{{item.image}}" mode="aspectFill"></image>

          <view class="goods-info invalid-info">
            <text class="goods-title invalid-title">{{item.title}}</text>
            <text class="goods-desc invalid-desc">{{item.desc}}</text>
            <text class="invalid-price">¥{{item.price}}</text>
          </view>
        </view>
      </view>
    </view>

    <view class="bottom-space"></view>
  </scroll-view>

  <!-- 底部结算栏 -->
  <view class="settlement-bar">
    <view class="settlement-left" bindtap="toggleSelectAll">
      <view class="radio radio-active">
        <text class="check-mark">✓</text>
      </view>
      <text class="all-text">全选</text>
    </view>

    <view class="settlement-center">
      <view class="total-row">
        <text class="total-label">总计:</text>
        <text class="total-price">¥199.9</text>
      </view>
      <text class="discount-text">已优惠￥20.00</text>
    </view>

    <view class="checkout-btn">去结算(5)</view>
  </view>

  <!-- 底部 tabbar（页面内模拟） -->
  <view class="tabbar">
    <view class="tab-item">
      <view class="tab-icon home-icon"></view>
      <text class="tab-text">首页</text>
    </view>
    <view class="tab-item">
      <view class="tab-icon category-icon"></view>
      <text class="tab-text">分类</text>
    </view>
    <view class="tab-item active">
      <view class="tab-icon cart-icon"></view>
      <text class="tab-text active-text">购物车</text>
    </view>
    <view class="tab-item">
      <view class="tab-icon my-icon"></view>
      <text class="tab-text">我的</text>
    </view>
  </view>

  <!-- 底部 home indicator -->
  <view class="home-indicator"></view>
</view>
```

---

## 2）pages/cart/cart.wxss

```css
page {
  background: #f6f6f6;
}

.page {
  width: 100%;
  height: 100vh;
  background: #f6f6f6;
  overflow: hidden;
  position: relative;
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Helvetica Neue", Arial, sans-serif;
  color: #222;
}

/* 顶部 */
.top-wrap {
  background: #f7f7f7;
}

.status-bar {
  height: 44px;
  padding: 0 24rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.time {
  font-size: 20px;
  font-weight: 600;
  color: #111;
  margin-left: 20rpx;
}

.status-right {
  display: flex;
  align-items: center;
  gap: 10rpx;
  margin-right: 6rpx;
}

.signal {
  display: flex;
  align-items: flex-end;
  gap: 3rpx;
  height: 18rpx;
}

.bar {
  width: 5rpx;
  background: #111;
  border-radius: 3rpx;
}

.b1 { height: 7rpx; }
.b2 { height: 10rpx; }
.b3 { height: 13rpx; }
.b4 { height: 16rpx; }

.wifi {
  width: 18rpx;
  height: 18rpx;
  border: 3rpx solid #111;
  border-top-color: #111;
  border-left-color: transparent;
  border-right-color: transparent;
  border-bottom-color: transparent;
  border-radius: 50%;
  transform: rotate(45deg);
  margin-top: 4rpx;
}

.battery {
  width: 46rpx;
  height: 22rpx;
  border: 2rpx solid #111;
  border-radius: 6rpx;
  position: relative;
  box-sizing: border-box;
  padding: 2rpx;
}

.battery::after {
  content: "";
  position: absolute;
  right: -5rpx;
  top: 6rpx;
  width: 3rpx;
  height: 8rpx;
  background: #111;
  border-radius: 0 2rpx 2rpx 0;
}

.battery-inner {
  width: 30rpx;
  height: 14rpx;
  background: #111;
  border-radius: 3rpx;
  margin-left: auto;
}

.nav-bar {
  height: 88rpx;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-arrow {
  position: absolute;
  left: 30rpx;
  top: 50%;
  width: 20rpx;
  height: 20rpx;
  border-left: 4rpx solid #222;
  border-bottom: 4rpx solid #222;
  transform: translateY(-50%) rotate(45deg);
}

.nav-title {
  font-size: 28px;
  font-weight: 700;
  color: #222;
}

.capsule {
  position: absolute;
  right: 18rpx;
  top: 50%;
  transform: translateY(-50%);
  width: 158rpx;
  height: 58rpx;
  border: 1px solid #dddddd;
  border-radius: 29rpx;
  background: #f8f8f8;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 18rpx;
  box-sizing: border-box;
}

.capsule-dots {
  display: flex;
  align-items: center;
  gap: 7rpx;
}

.dot {
  width: 8rpx;
  height: 8rpx;
  border-radius: 50%;
  background: #111;
}

.capsule-divider {
  width: 1px;
  height: 28rpx;
  background: #d6d6d6;
}

.capsule-circle {
  width: 26rpx;
  height: 26rpx;
  border: 5rpx solid #111;
  border-radius: 50%;
  box-sizing: border-box;
  position: relative;
}

.capsule-circle::after {
  content: "";
  position: absolute;
  width: 8rpx;
  height: 8rpx;
  border-radius: 50%;
  background: #111;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

/* 内容区 */
.content {
  height: calc(100vh - 132rpx - 116rpx - 112rpx);
}

.cart-summary {
  height: 72rpx;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24rpx;
  box-sizing: border-box;
}

.cart-summary-left {
  display: flex;
  align-items: center;
}

.bag-icon {
  width: 26rpx;
  height: 22rpx;
  border: 2rpx solid #c68a45;
  border-radius: 2rpx;
  position: relative;
  margin-right: 14rpx;
  box-sizing: border-box;
}

.bag-icon::before {
  content: "";
  position: absolute;
  width: 12rpx;
  height: 6rpx;
  border: 2rpx solid #c68a45;
  border-bottom: none;
  border-radius: 10rpx 10rpx 0 0;
  left: 50%;
  top: -7rpx;
  transform: translateX(-50%);
  box-sizing: border-box;
}

.summary-text {
  font-size: 18px;
  color: #444;
}

.manage-text {
  font-size: 18px;
  color: #b98446;
}

/* 商品卡片 */
.goods-card {
  margin: 14rpx 18rpx 0;
  background: #fff;
  border-radius: 14rpx;
  overflow: hidden;
}

.goods-row {
  min-height: 190rpx;
  display: flex;
  align-items: center;
  padding: 18rpx 20rpx;
  box-sizing: border-box;
}

.check-wrap {
  width: 52rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.radio {
  width: 34rpx;
  height: 34rpx;
  border-radius: 50%;
  border: 2rpx solid #c88c48;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  background: #fff;
}

.radio-active {
  background: #c48a47;
  border-color: #c48a47;
}

.check-mark {
  color: #fff;
  font-size: 20rpx;
  font-weight: 700;
  line-height: 1;
}

.goods-image {
  width: 162rpx;
  height: 162rpx;
  border-radius: 8rpx;
  background: #f1f1f1;
  flex-shrink: 0;
}

.goods-info {
  flex: 1;
  margin-left: 18rpx;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.goods-title {
  font-size: 27px;
  line-height: 1.2;
  color: #3e3e3e;
  font-weight: 500;
  word-break: break-all;
}

.goods-desc {
  margin-top: 8rpx;
  font-size: 21px;
  color: #9a9a9a;
}

.goods-bottom {
  margin-top: 18rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.price-wrap {
  display: flex;
  align-items: baseline;
}

.price-now {
  font-size: 25px;
  color: #be8544;
  font-weight: 500;
}

.price-old {
  margin-left: 10rpx;
  font-size: 15px;
  color: #ababab;
  text-decoration: line-through;
}

.stepper {
  width: 142rpx;
  height: 48rpx;
  border: 1px solid #e0c29f;
  border-radius: 6rpx;
  display: flex;
  align-items: center;
  overflow: hidden;
  flex-shrink: 0;
}

.step-btn {
  width: 42rpx;
  text-align: center;
  font-size: 24px;
  color: #8a8a8a;
  line-height: 48rpx;
}

.step-count {
  flex: 1;
  text-align: center;
  font-size: 23px;
  color: #444;
}

.minus {
  color: #666;
}

.plus {
  color: #cfcfcf;
}

/* 失效商品 */
.invalid-wrap {
  margin: 18rpx 18rpx 0;
  background: #fff;
  border-radius: 14rpx;
  overflow: hidden;
}

.invalid-head {
  height: 62rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30rpx;
  box-sizing: border-box;
  border-bottom: 1px solid #f1f1f1;
}

.invalid-head-left {
  font-size: 18px;
  color: #666;
}

.invalid-head-right {
  font-size: 18px;
  color: #555;
}

.invalid-item {
  padding: 0 0 0 0;
}

.invalid-inner {
  min-height: 190rpx;
  display: flex;
  align-items: center;
  padding: 20rpx;
  box-sizing: border-box;
}

.invalid-tag {
  width: 52rpx;
  height: 52rpx;
  border-radius: 26rpx;
  background: #f0f0f0;
  color: #7d7d7d;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-right: 18rpx;
}

.invalid-info .goods-title,
.invalid-info .goods-desc,
.invalid-price {
  color: #a8a8a8;
}

.invalid-title {
  font-size: 27px;
}

.invalid-desc {
  margin-top: 8rpx;
  font-size: 21px;
}

.invalid-price {
  margin-top: 20rpx;
  font-size: 25px;
}

.bottom-space {
  height: 24rpx;
}

/* 结算栏 */
.settlement-bar {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 112rpx;
  height: 116rpx;
  background: #fff;
  display: flex;
  align-items: center;
  padding: 0 18rpx;
  box-sizing: border-box;
  border-top: 1px solid #f0f0f0;
}

.settlement-left {
  width: 134rpx;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.all-text {
  margin-left: 18rpx;
  font-size: 22px;
  color: #333;
}

.settlement-center {
  flex: 1;
  padding-left: 12rpx;
}

.total-row {
  display: flex;
  align-items: baseline;
}

.total-label {
  font-size: 20px;
  color: #333;
}

.total-price {
  font-size: 24px;
  color: #be8544;
  font-weight: 600;
  margin-left: 6rpx;
}

.discount-text {
  margin-top: 6rpx;
  font-size: 16px;
  color: #be8544;
}

.checkout-btn {
  width: 232rpx;
  height: 78rpx;
  border-radius: 39rpx;
  background: #c08a4d;
  color: #fff;
  font-size: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* tabbar */
.tabbar {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 18rpx;
  height: 94rpx;
  background: #f6f6f6;
  display: flex;
  align-items: flex-start;
  justify-content: space-around;
  padding-top: 8rpx;
  box-sizing: border-box;
}

.tab-item {
  width: 25%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.tab-icon {
  position: relative;
  width: 42rpx;
  height: 42rpx;
}

.tab-text {
  margin-top: 8rpx;
  font-size: 15px;
  color: #8a8a8a;
}

.active-text {
  color: #b98a52;
}

/* 首页 icon */
.home-icon {
  border: 2rpx solid #8f8f8f;
  border-top: none;
  border-radius: 0 0 6rpx 6rpx;
  box-sizing: border-box;
}
.home-icon::before {
  content: "";
  position: absolute;
  left: 6rpx;
  top: -7rpx;
  width: 26rpx;
  height: 26rpx;
  border-left: 2rpx solid #8f8f8f;
  border-top: 2rpx solid #8f8f8f;
  transform: rotate(45deg);
  box-sizing: border-box;
  background: transparent;
}

/* 分类 icon */
.category-icon::before,
.category-icon::after {
  content: "";
  position: absolute;
  width: 12rpx;
  height: 12rpx;
  border: 2rpx solid #8f8f8f;
  border-radius: 50%;
  box-sizing: border-box;
}
.category-icon::before {
  left: 4rpx;
  top: 4rpx;
  box-shadow:
    20rpx 0 0 0 transparent,
    0 20rpx 0 0 transparent,
    20rpx 20rpx 0 0 transparent;
}
.category-icon::after {
  left: 26rpx;
  top: 4rpx;
  box-shadow:
    -22rpx 20rpx 0 0 transparent,
    0 20rpx 0 0 transparent;
}
.category-icon {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-gap: 6rpx;
}
.category-icon {
  width: 40rpx;
  height: 40rpx;
}
.category-icon {
  background:
    radial-gradient(circle, transparent 7rpx, transparent 7rpx) 0 0 / 100% 100% no-repeat;
}
.category-icon {
  box-sizing: border-box;
}
.category-icon .inner { display: none; }
.category-icon {
  position: relative;
}
.category-icon {
  --c: #8f8f8f;
}
.category-icon {
  background:
    radial-gradient(circle at 8rpx 8rpx, var(--c) 0 2rpx, transparent 2rpx),
    radial-gradient(circle at 30rpx 8rpx, var(--c) 0 2rpx, transparent 2rpx),
    radial-gradient(circle at 8rpx 30rpx, var(--c) 0 2rpx, transparent 2rpx),
    radial-gradient(circle at 30rpx 30rpx, var(--c) 0 2rpx, transparent 2rpx);
}
.category-icon::before {
  content: "";
  position: absolute;
  left: 2rpx;
  top: 2rpx;
  width: 12rpx;
  height: 12rpx;
  border: 2rpx solid var(--c);
  border-radius: 50%;
  box-sizing: border-box;
  box-shadow:
    22rpx 0 0 0 transparent,
    0 22rpx 0 0 transparent,
    22rpx 22rpx 0 0 transparent;
}
.category-icon::after {
  content: "";
  position: absolute;
  left: 24rpx;
  top: 2rpx;
  width: 12rpx;
  height: 12rpx;
  border: 2rpx solid var(--c);
  border-radius: 50%;
  box-sizing: border-box;
  box-shadow: -22rpx 22rpx 0 0 var(--c), 0 22rpx 0 0 var(--c);
}

/* 购物车 icon */
.cart-icon {
  border-bottom: 2rpx solid #b98a52;
  width: 34rpx;
  height: 24rpx;
  margin-top: 8rpx;
}
.cart-icon::before {
  content: "";
  position: absolute;
  left: 4rpx;
  top: -4rpx;
  width: 22rpx;
  height: 16rpx;
  border: 2rpx solid #b98a52;
  border-top: none;
  border-right: none;
  transform: skewX(-10deg);
}
.cart-icon::after {
  content: "";
  position: absolute;
  left: 6rpx;
  bottom: -10rpx;
  width: 8rpx;
  height: 8rpx;
  border: 2rpx solid #b98a52;
  border-radius: 50%;
  box-sizing: border-box;
  box-shadow: 18rpx 0 0 0 #f6f6f6, 18rpx 0 0 2rpx #b98a52;
}

/* 我的 icon */
.my-icon {
  border: 2rpx solid #8f8f8f;
  border-radius: 50%;
  box-sizing: border-box;
}
.my-icon::before {
  content: "";
  position: absolute;
  left: 11rpx;
  top: 7rpx;
  width: 16rpx;
  height: 16rpx;
  border: 2rpx solid #8f8f8f;
  border-radius: 50%;
  box-sizing: border-box;
}
.my-icon::after {
  content: "";
  position: absolute;
  left: 8rpx;
  bottom: 5rpx;
  width: 20rpx;
  height: 10rpx;
  border-top: 2rpx solid #8f8f8f;
  border-radius: 20rpx 20rpx 0 0;
}

.home-indicator {
  position: absolute;
  left: 50%;
  bottom: 4rpx;
  transform: translateX(-50%);
  width: 268rpx;
  height: 10rpx;
  background: #0d0d0d;
  border-radius: 5rpx;
}
```

---

## 3）pages/cart/cart.js

```javascript
Page({
  data: {
    goodsList: [
      {
        id: 1,
        checked: true,
        title: '限滑差速器油75W-901',
        desc: '适用于手动变速箱',
        price: '168',
        oldPrice: '188',
        count: 2,
        image: '/assets/cart/item1.png'
      },
      {
        id: 2,
        checked: false,
        title: '限滑差速器油75W-901',
        desc: '适用于手动变速箱',
        price: '168',
        oldPrice: '188',
        count: 2,
        image: '/assets/cart/item1.png'
      }
    ],
    invalidList: [
      {
        id: 11,
        title: '限滑差速器油75W-901',
        desc: '适用于手动变速箱',
        price: '168',
        image: '/assets/cart/item2.png'
      },
      {
        id: 12,
        title: '限滑差速器油75W-901',
        desc: '适用于手动变速箱',
        price: '168',
        image: '/assets/cart/item3.png'
      }
    ]
  },

  toggleSelect(e) {
    const id = e.currentTarget.dataset.id
    const goodsList = this.data.goodsList.map(item => {
      if (item.id === id) {
        item.checked = !item.checked
      }
      return item
    })
    this.setData({ goodsList })
  },

  increaseCount(e) {
    const id = e.currentTarget.dataset.id
    const goodsList = this.data.goodsList.map(item => {
      if (item.id === id) {
        item.count += 1
      }
      return item
    })
    this.setData({ goodsList })
  },

  decreaseCount(e) {
    const id = e.currentTarget.dataset.id
    const goodsList = this.data.goodsList.map(item => {
      if (item.id === id && item.count > 1) {
        item.count -= 1
      }
      return item
    })
    this.setData({ goodsList })
  },

  toggleSelectAll() {
    const allChecked = this.data.goodsList.every(item => item.checked)
    const goodsList = this.data.goodsList.map(item => ({
      ...item,
      checked: !allChecked
    }))
    this.setData({ goodsList })
  }
})
```

---

## 4）pages/cart/cart.json

```json
{
  "navigationStyle": "custom",
  "disableScroll": true
}
```

---

## 图片资源要求

你需要准备 3 张图片，放到：

```text
/assets/cart/item1.png
/assets/cart/item2.png
/assets/cart/item3.png
```

对应：

* `item1.png`：前两件有效商品图
* `item2.png`：绿色小家电图
* `item3.png`：白灰小家电图

---

## 如果你想做到更像截图，建议再加这几点

### 1. 使用真实机型安全区

你现在这版已经很接近，但如果要更贴近 iPhone 截图，可以把顶部状态栏高度改成动态：

```javascript
const app = getApp()
```

或者在页面里通过 `wx.getSystemInfoSync()` 获取 `statusBarHeight` 和胶囊按钮位置，动态计算顶部高度。

---

### 2. 底部 tabbar 建议换成原生 custom-tab-bar

这张图的底部是典型 tabbar 样式。现在我给你的是**页面内模拟版**，好处是你复制就能跑。
如果你要全项目正式使用，建议改成微信小程序 `custom-tab-bar`。

---

### 3. 字体和间距还能继续微调

要做真正“像素级”，通常还会继续调这些值：

* 标题字号
* 行高
* 卡片圆角
* 价格与数量控件的左右间距
* 结算栏高度
* tabbar 与 home indicator 的间距

你这张图我已经按视觉比例尽量拟合了，已经能到很高的还原度。

---

## 可直接补充的 app.json 页面注册

如果你还没注册页面：

```json
{
  "pages": [
    "pages/cart/cart"
  ],
  "window": {
    "navigationStyle": "custom",
    "backgroundTextStyle": "light",
    "backgroundColor": "#f6f6f6"
  }
}
```

---

## 我再送你一个更实用的建议

如果你要的是**真正用于项目的高保真版本**，下一步最合适的是我直接继续给你补一套：

* `custom-tab-bar` 版本
* 顶部胶囊/状态栏自适应版本
* 完整可复用组件拆分版（`cart-item`、`invalid-item`、`checkout-bar`）

你回我一句 **“继续拆成组件版”**，我就直接接着写。
