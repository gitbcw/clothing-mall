# category.wxml

```xml
<view class="page">
  <view class="status-bar"></view>

  <view class="nav-bar">
    <view class="nav-left">
      <view class="back-icon"></view>
    </view>
    <view class="nav-title">商品分类</view>
    <view class="nav-right capsule">
      <view class="capsule-dots">
        <text>●●●</text>
      </view>
      <view class="capsule-divider"></view>
      <view class="capsule-circle">
        <view class="capsule-circle-inner"></view>
      </view>
    </view>
  </view>

  <view class="search-wrap">
    <view class="search-box">
      <view class="search-icon"></view>
      <text class="search-placeholder">搜索商品</text>
    </view>
  </view>

  <view class="content">
    <view class="sidebar">
      <view class="side-item">连衣裙</view>
      <view class="side-item active">保暖内衣</view>
      <view class="side-item">丝袜</view>
      <view class="side-item">马面裙</view>
    </view>

    <scroll-view class="goods-scroll" scroll-y="true" show-scrollbar="false">
      <view class="goods-grid">
        <block wx:for="{{goods}}" wx:key="id">
          <view class="goods-card {{item.tall ? 'tall' : ''}}">
            <image class="goods-image" src="{{item.image}}" mode="aspectFill"></image>
            <view wx:if="{{item.tag}}" class="image-tag">{{item.tag}}</view>
            <view class="goods-info">
              <view class="goods-title">{{item.title}}</view>
              <view class="price-row">
                <view class="price-left">
                  <text class="yen">¥</text>
                  <text class="price">{{item.price}}</text>
                  <text class="special">特卖价</text>
                  <text class="origin">¥ {{item.origin}}</text>
                </view>
                <view class="cart-btn">
                  <text>🛒</text>
                </view>
              </view>
            </view>
          </view>
        </block>
      </view>
    </scroll-view>
  </view>

  <view class="tabbar">
    <view class="tab-item">
      <view class="tab-icon home-icon"></view>
      <text>首页</text>
    </view>
    <view class="tab-item active">
      <view class="tab-icon grid-icon">
        <text>◉◉</text>
        <text>◉◉</text>
      </view>
      <text>分类</text>
    </view>
    <view class="tab-item">
      <view class="tab-icon cart-icon"></view>
      <text>购物车</text>
    </view>
    <view class="tab-item">
      <view class="tab-icon my-icon"></view>
      <text>我的</text>
    </view>
  </view>

  <view class="home-indicator"></view>
</view>
```

# category.wxss

```css
page {
  background: #f5f5f5;
}

.page {
  position: relative;
  width: 100%;
  height: 100vh;
  background: #f5f5f5;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif;
}

.status-bar {
  height: 44px;
}

.nav-bar {
  height: 88rpx;
  padding: 0 20rpx 0 22rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-left {
  width: 88rpx;
  display: flex;
  align-items: center;
}

.back-icon {
  width: 24rpx;
  height: 24rpx;
  border-left: 4rpx solid #1e1e1e;
  border-bottom: 4rpx solid #1e1e1e;
  transform: rotate(45deg);
  margin-left: 8rpx;
}

.nav-title {
  flex: 1;
  text-align: center;
  font-size: 34rpx;
  line-height: 1;
  font-weight: 600;
  color: #222;
  letter-spacing: 1rpx;
  transform: translateX(-10rpx);
}

.nav-right {
  width: 156rpx;
  height: 60rpx;
}

.capsule {
  border: 1px solid #dedede;
  border-radius: 999rpx;
  background: #f8f8f8;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
  padding: 0 18rpx;
}

.capsule-dots {
  width: 52rpx;
  text-align: center;
  color: #000;
  font-size: 18rpx;
  letter-spacing: -1rpx;
  transform: translateY(-1rpx);
}

.capsule-divider {
  width: 1px;
  height: 26rpx;
  background: #dddddd;
}

.capsule-circle {
  width: 28rpx;
  height: 28rpx;
  border: 3rpx solid #000;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.capsule-circle-inner {
  width: 8rpx;
  height: 8rpx;
  background: #000;
  border-radius: 50%;
}

.search-wrap {
  padding: 18rpx 20rpx 22rpx;
}

.search-box {
  height: 96rpx;
  border-radius: 22rpx;
  background: #fafafa;
  display: flex;
  align-items: center;
  padding: 0 28rpx;
  box-sizing: border-box;
}

.search-icon {
  width: 28rpx;
  height: 28rpx;
  border: 4rpx solid #7b7b7b;
  border-radius: 50%;
  position: relative;
  margin-right: 24rpx;
}

.search-icon::after {
  content: "";
  position: absolute;
  right: -8rpx;
  bottom: -8rpx;
  width: 14rpx;
  height: 4rpx;
  background: #7b7b7b;
  transform: rotate(45deg);
  border-radius: 3rpx;
}

.search-placeholder {
  font-size: 26rpx;
  color: #b3b3b3;
}

.content {
  display: flex;
  height: calc(100vh - 44px - 88rpx - 136rpx - 120rpx);
}

.sidebar {
  width: 136rpx;
  background: #ededed;
  padding-top: 0;
  box-sizing: border-box;
}

.side-item {
  width: 136rpx;
  height: 76rpx;
  background: #fafafa;
  display: flex;
  align-items: center;
  padding-left: 18rpx;
  box-sizing: border-box;
  font-size: 24px;
  color: #6a6a6a;
  margin-bottom: 18rpx;
}

.side-item.active {
  background: #f5f5f5;
  color: #c7904b;
}

.goods-scroll {
  flex: 1;
  height: 100%;
  padding-right: 6rpx;
  box-sizing: border-box;
}

.goods-grid {
  padding: 0 16rpx 24rpx 16rpx;
  column-count: 2;
  column-gap: 16rpx;
}

.goods-card {
  width: 280rpx;
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;
  break-inside: avoid;
  margin-bottom: 18rpx;
  position: relative;
}

.goods-card.tall .goods-image {
  height: 360rpx;
}

.goods-image {
  width: 100%;
  height: 280rpx;
  display: block;
  background: #ececec;
}

.image-tag {
  position: absolute;
  top: 214rpx;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 12px;
  color: rgba(255,255,255,0.95);
  text-shadow: 0 1rpx 4rpx rgba(0,0,0,0.2);
}

.goods-info {
  padding: 14rpx 16rpx 16rpx;
}

.goods-title {
  font-size: 28rpx;
  line-height: 38rpx;
  color: #3d3d3d;
  font-weight: 500;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  margin-bottom: 8rpx;
}

.price-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.price-left {
  display: flex;
  align-items: baseline;
  color: #ca8e44;
  white-space: nowrap;
}

.yen {
  font-size: 18rpx;
  margin-right: 2rpx;
}

.price {
  font-size: 28px;
  line-height: 1;
  font-weight: 500;
}

.special {
  font-size: 11px;
  margin-left: 10rpx;
  color: #ca8e44;
}

.origin {
  font-size: 12px;
  color: #9d9d9d;
  margin-left: 8rpx;
  text-decoration: line-through;
}

.cart-btn {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background: #c89249;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 22rpx;
  flex-shrink: 0;
}

.tabbar {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 18rpx;
  height: 100rpx;
  background: #f5f5f5;
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
  color: #8a8a8a;
  font-size: 15px;
}

.tab-item.active {
  color: #c7ab7a;
}

.tab-icon {
  margin-bottom: 6rpx;
  position: relative;
}

.home-icon {
  width: 34rpx;
  height: 26rpx;
  border: 2px solid currentColor;
  border-top: none;
  border-radius: 0 0 6rpx 6rpx;
}

.home-icon::before {
  content: "";
  position: absolute;
  left: 4rpx;
  top: -16rpx;
  width: 20rpx;
  height: 20rpx;
  border-left: 2px solid currentColor;
  border-top: 2px solid currentColor;
  transform: rotate(45deg);
}

.grid-icon {
  width: 38rpx;
  height: 38rpx;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  line-height: 12rpx;
}

.cart-icon {
  width: 34rpx;
  height: 22rpx;
  border: 2px solid currentColor;
  border-top: none;
  border-radius: 0 0 6rpx 6rpx;
}

.cart-icon::before,
.cart-icon::after {
  content: "";
  position: absolute;
  bottom: -8rpx;
  width: 6rpx;
  height: 6rpx;
  border: 2px solid currentColor;
  border-radius: 50%;
}

.cart-icon::before {
  left: 4rpx;
}

.cart-icon::after {
  right: 4rpx;
}

.cart-icon {
  transform: skewX(-8deg);
}

.my-icon {
  width: 34rpx;
  height: 34rpx;
  border: 2px solid currentColor;
  border-radius: 50%;
}

.my-icon::before {
  content: "";
  position: absolute;
  left: 9rpx;
  top: 7rpx;
  width: 10rpx;
  height: 10rpx;
  border: 2px solid currentColor;
  border-radius: 50%;
}

.my-icon::after {
  content: "";
  position: absolute;
  left: 6rpx;
  bottom: 5rpx;
  width: 18rpx;
  height: 8rpx;
  border: 2px solid currentColor;
  border-top: none;
  border-radius: 0 0 12rpx 12rpx;
}

.home-indicator {
  position: absolute;
  left: 50%;
  bottom: 4rpx;
  transform: translateX(-50%);
  width: 134rpx;
  height: 10rpx;
  border-radius: 999rpx;
  background: #000;
}
```

# category.js

```javascript
Page({
  data: {
    goods: [
      {
        id: 1,
        title: '稻草人卡其色...',
        price: '50.00',
        origin: '69',
        image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 2,
        title: '稻草人卡其色...',
        price: '50.00',
        origin: '69',
        image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80',
        tag: '短款收腰设计'
      },
      {
        id: 3,
        title: '稻草人卡其色...',
        price: '50.00',
        origin: '69',
        image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=800&q=80',
        tall: true
      },
      {
        id: 4,
        title: '稻草人卡其色...',
        price: '50.00',
        origin: '69',
        image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 5,
        title: '稻草人卡其色...',
        price: '50.00',
        origin: '69',
        image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80',
        tall: true
      }
    ]
  }
})
```

# category.json

```json
{
  "navigationStyle": "custom",
  "disableScroll": true
}
```

把这 4 个文件放到同一个小程序页面目录里即可。这个版本按你给的图做了高还原：顶部胶囊、搜索框、左侧分类栏、双列瀑布商品卡片、底部 tabbar 都是按截图比例写的。

如果你要，我下一步可以直接继续给你补一份：

1. 可直接运行的 `app.json` 页面注册
2. 本地占位图版本（不依赖网络图）
3. 真正更严格的 375px 基准微调版

