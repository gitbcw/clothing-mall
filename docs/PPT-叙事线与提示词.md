# 客户演示 PPT · 提示词集

> **用途**：为川着渠道系统客户演示 PPT 生成配图和网页结构
> **图片工具**：Nano Banana 2 / Gemini
> **PPT 项目**：C:\MyFile\workspace\test\reveal-ppt
> **部署地址**：http://118.145.115.197:18883
> **更新时间**：2026-03-05

---

## 配色方案

| 颜色 | 代码 | 用途 |
|------|------|------|
| 海军蓝 | #1E3A8A | 主色、标题、重要元素 |
| 青绿 | #0D9488 | 强调色、完成状态、标签 |
| 橙色 | #F59E0B | 决策点、警告、重点 |
| 白色 | #FFFFFF | 背景 |
| 浅灰 | #F3F4F6 | 次要背景、分隔线 |

---

## 叙事线总览

```
封面
  ↓
传统渠道痛点
  ↓
系统全景
  ↓
核心业务流程（拉新→上架→活动→下单→售后）
  ↓
系统架构
  ↓
价值总结
  ↓
成本费用
  ↓
计划排期
  ↓
收尾
```

---

## 逐页提示词

### P1：封面

**生图提示词**：
```
Create a clean, modern, highly readable presentation cover slide in 16:9 horizontal format.

Use a minimalist color palette: professional navy blue #1E3A8A as primary, teal #0D9488 as accent, white background.

Layout: Center-focused title design with subtle geometric decorations.

Content:
- Large bold title: "川着 Transmute"
- Subtitle: "技术方案"
- Date: "2026-03"

Style: Clean sans-serif Chinese text, subtle geometric patterns in navy blue, professional business presentation cover like McKinsey decks, high contrast, no clutter.
All text perfectly legible, correct Simplified Chinese spelling.
```

**PPT 组件**：
```tsx
<Slide className="center">
  <Cover
    title="川着 Transmute"
    subtitle="技术方案"
    meta="2026-03"
  />
</Slide>
```

---

### P2：传统渠道痛点

**生图提示词**：
```
Create a clean, modern, highly readable pain points infographic in 16:9 horizontal format.

Use a minimalist color palette: professional navy blue #1E3A8A as primary, orange #F59E0B for problem highlights, white background.

Layout: Five problem cards arranged horizontally with icons and descriptions.

At the top: Large bold title "传统服装批发的困境"

FIVE PROBLEM CARDS:
1. 📉 线下拓客成本高
   - 依赖人脉，效率低下
   - 活动范围有限

2. 📋 客户信息难管理
   - 分散在微信、笔记本
   - 无法有效追踪

3. ❌ 订单容易出错漏
   - 手工记账
   - 对账困难

4. 🔄 售后处理繁琐
   - 只换不退流程复杂
   - 沟通成本高

5. 📊 缺乏数据支撑
   - 凭感觉经营
   - 难以优化决策

Style: Five equal-width cards with icons at top, problem title in navy blue, description in gray, orange accent for key pain points, professional business infographic style.
All text in Simplified Chinese, perfectly legible, high contrast.
```

**PPT 组件**：
```tsx
<Slide>
  <h2>传统服装批发的困境</h2>
  <div className="cards cards-5">
    <Card title="线下拓客成本高" icon="📉">
      <p>依赖人脉，效率低下</p>
      <p>活动范围有限</p>
    </Card>
    <Card title="客户信息难管理" icon="📋">
      <p>分散在微信、笔记本</p>
      <p>无法有效追踪</p>
    </Card>
    <Card title="订单容易出错漏" icon="❌">
      <p>手工记账</p>
      <p>对账困难</p>
    </Card>
    <Card title="售后处理繁琐" icon="🔄">
      <p>只换不退流程复杂</p>
      <p>沟通成本高</p>
    </Card>
    <Card title="缺乏数据支撑" icon="📊">
      <p>凭感觉经营</p>
      <p>难以优化决策</p>
    </Card>
  </div>
</Slide>
```

---

### P3：系统全景

**生图提示词**：
```
Create a clean, modern, highly readable system overview infographic in 16:9 horizontal format.

Use a minimalist color palette: professional navy blue #1E3A8A as primary, teal #0D9488 as accent, white background.

Layout: Three connected platforms with flowing data lines in center, forming a unified system.

At the top: Large bold title "川着渠道系统 · 一站式解决方案"

THREE PLATFORMS (horizontal arrangement with connecting lines):

LEFT - 企业号 (Enterprise WeChat):
- Icon: WeChat logo with business badge
- Role: "私域流量入口"
- Features: 客户沉淀、消息触达、裂变传播

CENTER - 小程序商城 (Mini Program):
- Icon: shopping bag / mobile storefront
- Role: "交易核心"
- Features: 商品展示、下单支付、订单管理

RIGHT - Web 管理后台 (Admin Dashboard):
- Icon: computer screen with dashboard
- Role: "运营中枢"
- Features: 商品管理、订单处理、数据报表

BOTTOM BAR: "数据实时同步" with flowing arrows connecting all three

Style: Three platform cards with icons, connected by flowing data lines in teal, professional tech infographic style.
All text in Simplified Chinese, perfectly legible, McKinsey presentation quality.
```

**PPT 组件**：
```tsx
<Slide>
  <h2>川着渠道系统</h2>
  <p style={{ color: 'var(--secondary)', marginBottom: '1em' }}>一站式解决方案</p>

  <div className="three-cols">
    <Card title="企业号" icon="📱" variant="primary">
      <Tag variant="primary">私域流量入口</Tag>
      <ul>
        <li>客户沉淀</li>
        <li>消息触达</li>
        <li>裂变传播</li>
      </ul>
    </Card>
    <Card title="小程序商城" icon="🛒" variant="success">
      <Tag variant="success">交易核心</Tag>
      <ul>
        <li>商品展示</li>
        <li>下单支付</li>
        <li>订单管理</li>
      </ul>
    </Card>
    <Card title="Web 管理后台" icon="💻" variant="warning">
      <Tag variant="warning">运营中枢</Tag>
      <ul>
        <li>商品管理</li>
        <li>订单处理</li>
        <li>数据报表</li>
      </ul>
    </Card>
  </div>

  <Note>数据实时同步</Note>
</Slide>
```

---

### P4：业务流程总览

**生图提示词**：
```
Create a clean, modern, highly readable business cycle infographic in 16:9 horizontal format.

Use a minimalist color palette: professional navy blue #1E3A8A as primary, teal #0D9488 as accent, white background.

Layout: Circular arrangement of 5 business stages with arrows, forming a complete loop.

At the top: Large bold title "业务闭环：从拉新到售后"

CIRCULAR FLOW (clockwise):
1. 拉新 (Acquisition) - icon: user-plus
   → 多渠道获客
2. 上架 (Listing) - icon: package
   → 商品展示
3. 活动 (Campaign) - icon: megaphone
   → 精准触达
4. 下单 (Order) - icon: shopping cart
   → 交易完成
5. 售后 (Service) - icon: heart
   → 服务保障

Arrow from 售后 loops back to 拉新 with label "复购增长"

CENTER: "完整业务闭环" in teal

Style: Circular flow diagram with 5 nodes, clockwise arrows, clean icons, professional business cycle infographic.
All text in Simplified Chinese, perfectly legible, high contrast.
```

**PPT 组件**：
```tsx
<Slide>
  <h2>业务闭环：从拉新到售后</h2>
  <SFlow steps={['拉新', '上架', '活动', '下单', '售后', '复购']} />

  <div className="three-cols" style={{ marginTop: '1.5em' }}>
    <div className="card">
      <h4 className="card-title">获客</h4>
      <ul>
        <li>到店转化</li>
        <li>裂变推荐</li>
      </ul>
    </div>
    <div className="card">
      <h4 className="card-title">交易</h4>
      <ul>
        <li>商品上架</li>
        <li>活动推送</li>
        <li>下单支付</li>
      </ul>
    </div>
    <div className="card">
      <h4 className="card-title">服务</h4>
      <ul>
        <li>只换不退</li>
        <li>流程透明</li>
      </ul>
    </div>
  </div>
</Slide>
```

---

### P5：拉新场景

**生图提示词**：
```
Create a clean, modern, highly readable customer acquisition infographic in 16:9 horizontal format.

Use a minimalist color palette: professional navy blue #1E3A8A as primary, teal #0D9488 as accent, white background.

Layout: Three acquisition channels converging to member pool on the right.

At the top: Large bold title "拉新：多渠道获客"

CHANNEL 1 - 到店转化 (Store Conversion):
顾客到店 (icon: store) → 扫码关注 (icon: QR) → 添加企微 (icon: WeChat) → 成为会员 (icon: user check)
<Value tag: "客户资产沉淀">

CHANNEL 2 - 裂变传播 (Referral):
老客生成海报 (icon: share) → 分享传播 (icon: network) → 新客扫码 (icon: phone) → 双方奖励 (icon: gift)
<Value tag: "低成本获客">

CHANNEL 3 - 活动引流 (Campaign):
配置活动 (icon: settings) → 生成海报 (icon: poster) → 推送触达 (icon: send) → 新客进入 (icon: users)
<Value tag: "精准触达">

RIGHT SIDE: Large circle labeled "会员池" with user icons

Style: Three horizontal flow paths with step cards, teal value tags, arrows connecting steps, professional marketing infographic.
All text in Simplified Chinese, perfectly legible.
```

**PPT 组件**：
```tsx
<Slide>
  <h2>拉新：多渠道获客</h2>

  <div className="two-cols">
    <div>
      <h3 style={{ marginBottom: '0.8em' }}>到店转化</h3>
      <Flow>
        <FlowStep num={1}>顾客到店</FlowStep>
        <FlowStep num={2}>扫码关注</FlowStep>
        <FlowStep num={3}>添加企微</FlowStep>
        <FlowStep num={4}>成为会员</FlowStep>
      </Flow>
      <ValueTag>客户资产沉淀</ValueTag>
    </div>
    <div>
      <h3 style={{ marginBottom: '0.8em' }}>裂变传播</h3>
      <Flow>
        <FlowStep num={1}>老客生成海报</FlowStep>
        <FlowStep num={2}>分享传播</FlowStep>
        <FlowStep num={3}>新客扫码</FlowStep>
        <FlowStep num={4}>双方奖励</FlowStep>
      </Flow>
      <ValueTag>低成本获客</ValueTag>
    </div>
  </div>

  <Note>多渠道获客，客户资产沉淀</Note>
</Slide>
```

---

### P6：商品上架场景

**生图提示词**：
```
Create a clean, modern, highly readable product listing flow infographic in 16:9 horizontal format.

Use a minimalist color palette: professional navy blue #1E3A8A as primary, teal #0D9488 as accent, white background.

Layout: Horizontal flow from left to right showing product listing process.

At the top: Large bold title "商品上架：一键同步"

FLOW (left to right):
Step 1: 录入商品 (icon: form)
- 名称、图片、描述
- 价格、分类

Step 2: 配置SKU (icon: grid)
- 颜色 × 尺码
- 独立库存

Step 3: 一键上架 (icon: rocket)
- 后台操作
- 自动同步

Step 4: 小程序展示 (icon: phone)
- 实时可见
- 顾客浏览

REFERENCE BADGE: "参考：唯品会商品展示风格"

BOTTOM: Three value tags: "批量导入" "自动同步" "规格管理"

Style: Four-step horizontal flow with icons, step cards with subtle backgrounds, arrows connecting steps.
All text in Simplified Chinese, perfectly legible, professional e-commerce style.
```

**PPT 组件**：
```tsx
<Slide>
  <h2>商品上架：一键同步</h2>

  <Flow>
    <FlowStep num={1}>
      <strong>录入商品</strong>
      <FlowSub>
        <FlowStep num="•">名称、图片、描述</FlowStep>
        <FlowStep num="•">价格、分类</FlowStep>
      </FlowSub>
    </FlowStep>
    <FlowStep num={2}>
      <strong>配置SKU</strong>
      <FlowSub>
        <FlowStep num="•">颜色 × 尺码</FlowStep>
        <FlowStep num="•">独立库存</FlowStep>
      </FlowSub>
    </FlowStep>
    <FlowStep num={3}>
      <strong>一键上架</strong>
    </FlowStep>
    <FlowStep num={4}>
      <strong>小程序展示</strong>
    </FlowStep>
  </Flow>

  <Note>
    <ValueTag>批量导入</ValueTag>
    <ValueTag>自动同步</ValueTag>
    <ValueTag>规格管理</ValueTag>
    参考：唯品会商品展示风格
  </Note>
</Slide>
```

---

### P7：活动设置场景

**生图提示词**：
```
Create a clean, modern, highly readable campaign setup infographic in 16:9 horizontal format.

Use a minimalist color palette: professional navy blue #1E3A8A as primary, teal #0D9488 as accent, orange #F59E0B for highlights, white background.

Layout: Three-step flow showing campaign creation and push process.

At the top: Large bold title "活动设置：精准触达"

THREE STEPS:

Step 1: 创建活动 (icon: settings)
- 满减/折扣/限时
- 灵活配置

Step 2: 生成海报 (icon: image)
- 自动生成
- 包含小程序码

Step 3: 一键推送 (icon: send)
- 企微粉丝
- 精准触达

REFERENCE BADGE: "参考：瑞幸活动推送模式"

BOTTOM: "主动触达，不再被动等待顾客"

Style: Three-step horizontal flow with large icons, campaign creation card with options, professional marketing automation style.
All text in Simplified Chinese, perfectly legible.
```

**PPT 组件**：
```tsx
<Slide>
  <h2>活动设置：精准触达</h2>

  <Flow>
    <FlowStep num={1}>
      <strong>创建活动</strong>
      <FlowSub>
        <FlowStep num="•">满减/折扣/限时</FlowStep>
        <FlowStep num="•">灵活配置</FlowStep>
      </FlowSub>
    </FlowStep>
    <FlowStep num={2}>
      <strong>生成海报</strong>
      <FlowSub>
        <FlowStep num="•">自动生成</FlowStep>
        <FlowStep num="•">含小程序码</FlowStep>
      </FlowSub>
    </FlowStep>
    <FlowStep num={3}>
      <strong>一键推送</strong>
      <FlowSub>
        <FlowStep num="•">企微粉丝</FlowStep>
        <FlowStep num="•">精准触达</FlowStep>
      </FlowSub>
    </FlowStep>
  </Flow>

  <Note>
    主动触达，不再被动等待顾客
    <br />
    参考：瑞幸活动推送模式
  </Note>
</Slide>
```

---

### P8：下单场景

**生图提示词**：
```
Create a clean, modern, highly readable order flow infographic in 16:9 horizontal format.

Use a minimalist color palette: professional navy blue #1E3A8A as primary, teal #0D9488 for completed steps, green #10B981 for success, white background.

Layout: Horizontal shopping journey from browse to payment success.

At the top: Large bold title "下单：流畅体验"

SHOPPING JOURNEY:

Phase 1: 浏览商品 (icon: phone with grid)
- 小程序浏览
- 搜索筛选

Phase 2: 选择规格 (icon: color/size)
- 颜色、尺码
- 查看库存

Phase 3: 确认订单 (icon: checklist)
- 收货地址
- 配送方式
- 优惠券

Phase 4: 支付完成 (icon: WeChat pay + checkmark)
- 微信支付
- 即时到账
- 订单生成

BOTTOM: Three delivery options:
快递发货 | 到店自提 | 同城配送

Style: Four-phase horizontal journey with icons, payment success highlighted in green, professional e-commerce checkout flow.
All text in Simplified Chinese, perfectly legible.
```

**PPT 组件**：
```tsx
<Slide>
  <h2>下单：流畅体验</h2>

  <Flow>
    <FlowStep num={1}>
      <strong>浏览商品</strong>
    </FlowStep>
    <FlowStep num={2}>
      <strong>选择规格</strong>
    </FlowStep>
    <FlowStep num={3}>
      <strong>确认订单</strong>
    </FlowStep>
    <FlowStep num={4} variant="success">
      <strong>支付完成</strong>
    </FlowStep>
  </Flow>

  <div className="three-cols" style={{ marginTop: '1em' }}>
    <div style={{ textAlign: 'center', padding: '0.5em', background: '#ccfbf1', borderRadius: '6px' }}>
      <strong>快递发货</strong>
    </div>
    <div style={{ textAlign: 'center', padding: '0.5em', background: '#fed7aa', borderRadius: '6px' }}>
      <strong>到店自提</strong>
    </div>
    <div style={{ textAlign: 'center', padding: '0.5em', background: '#dbeafe', borderRadius: '6px' }}>
      <strong>同城配送</strong>
    </div>
  </div>

  <Note>
    <ValueTag>随时随地</ValueTag>
    <ValueTag>即时到账</ValueTag>
  </Note>
</Slide>
```

---

### P9：售后场景

**生图提示词**：
```
Create a clean, modern, highly readable after-sales flow infographic in 16:9 horizontal format.

Use a minimalist color palette: professional navy blue #1E3A8A as primary, teal #0D9488 as accent, white background.

Layout: Horizontal flow showing exchange process with two completion methods.

At the top: Large bold title "售后：只换不退"

POLICY BADGE: "只换不退，流程透明"

EXCHANGE FLOW:

Step 1: 客户申请 (icon: phone)
- 小程序提交
- 选择新规格

Step 2: 系统计算 (icon: calculator)
- 差价自动计算
- 无差价/需补/可退

Step 3: 商家审核 (icon: checkmark)
- 后台确认
- 通过/拒绝

Step 4: 执行换货 (splits into two):

METHOD A - 到店换货:
顾客到店 → 现场核销 → 完成

METHOD B - 寄回换货:
顾客寄回 → 商家验货 → 发出新货 → 完成

BOTTOM: Three value tags: "流程透明" "差价自动计算" "两种换货方式"

Style: Horizontal flow with branching at execution, two parallel paths for exchange methods, professional service process style.
All text in Simplified Chinese, perfectly legible.
```

**PPT 组件**：
```tsx
<Slide>
  <h2>售后：只换不退</h2>
  <Tag variant="warning" style={{ marginBottom: '1em' }}>只换不退，流程透明</Tag>

  <div className="two-cols">
    <div>
      <h3 style={{ marginBottom: '0.5em' }}>申请流程</h3>
      <Flow>
        <FlowStep num={1}>客户申请</FlowStep>
        <FlowStep num={2}>选择新规格</FlowStep>
        <FlowStep num={3}>差价计算</FlowStep>
        <FlowStep num={4}>商家审核</FlowStep>
      </Flow>
    </div>
    <div>
      <h3 style={{ marginBottom: '0.5em' }}>执行换货</h3>
      <Flow>
        <FlowStep num="A" variant="accent">到店换货</FlowStep>
        <FlowStep num="B" variant="accent">寄回换货</FlowStep>
      </Flow>
    </div>
  </div>

  <Note>
    <ValueTag>流程透明</ValueTag>
    <ValueTag>差价自动计算</ValueTag>
    <ValueTag>两种换货方式</ValueTag>
  </Note>
</Slide>
```

---

### P10：系统架构图

**生图提示词**：
```
Create a clean, modern, highly readable technical architecture diagram in 16:9 horizontal format.

Use a minimalist color palette: professional navy blue #1E3A8A as primary, teal #0D9488 for data layer, gray for infrastructure, white background.

Layout: Three-tier architecture with client layer at top, API layer in middle, data layer at bottom.

At the top: Large bold title "技术架构"

CLIENT LAYER (top, three boxes):
┌─────────────┬─────────────┬─────────────┐
│   企业号     │  小程序商城  │ Web 管理后台 │
│  (WeChat)   │  (Mini App) │  (Admin)    │
└─────────────┴─────────────┴─────────────┘

API LAYER (middle):
┌─────────────────────────────────────────┐
│              API 网关                    │
│         认证 / 路由 / 限流               │
└─────────────────────────────────────────┘

SERVICE LAYER:
┌──────────┬──────────┬──────────┬──────────┐
│ 用户服务  │ 商品服务  │ 订单服务  │ 活动服务  │
└──────────┴──────────┴──────────┴──────────┘

DATA LAYER (bottom, teal tint):
┌──────────┬──────────┬──────────┐
│  MySQL   │  Redis   │ 对象存储  │
└──────────┴──────────┴──────────┘

Style: Layered architecture diagram with clear separation, boxes with labels, connecting lines, professional technical documentation style.
All text in Simplified Chinese, perfectly legible.
```

**PPT 组件**：
```tsx
<Slide>
  <h2>技术架构</h2>

  <div style={{ background: '#f8fafc', padding: '1em', borderRadius: '8px' }}>
    <div style={{ marginBottom: '0.5em', fontWeight: 'bold', color: 'var(--primary)' }}>客户端</div>
    <div className="three-cols">
      <Tag variant="primary">企业号</Tag>
      <Tag variant="primary">小程序商城</Tag>
      <Tag variant="primary">Web 管理后台</Tag>
    </div>

    <div style={{ marginTop: '1em', marginBottom: '0.5em', fontWeight: 'bold', color: 'var(--primary)' }}>服务层</div>
    <div className="three-cols">
      <Tag>用户服务</Tag>
      <Tag>商品服务</Tag>
      <Tag>订单服务</Tag>
    </div>

    <div style={{ marginTop: '1em', marginBottom: '0.5em', fontWeight: 'bold', color: 'var(--accent)' }}>数据层</div>
    <div className="three-cols">
      <Tag variant="success">MySQL</Tag>
      <Tag variant="success">Redis</Tag>
      <Tag variant="success">对象存储</Tag>
    </div>
  </div>
</Slide>
```

---

### P11：价值总结

**生图提示词**：
```
Create a clean, modern, highly readable value proposition infographic in 16:9 horizontal format.

Use a minimalist color palette: professional navy blue #1E3A8A as primary, teal #0D9488 for value badges, white background.

Layout: Four value cards in a row, each with icon, title, and description.

At the top: Large bold title "为什么选择川着渠道系统？"

FOUR VALUE CARDS:

1. ⚡ 效率提升
   - 自动化替代手工
   - 省时省力

2. 💰 成本降低
   - 减少人工错误
   - 降低运营成本

3. 📈 收入增长
   - 裂变获客
   - 提升复购

4. 📊 数据驱动
   - 经营决策有据可依
   - 持续优化

Style: Four equal-width value cards with large icons at top, title in navy blue, description in gray, teal accent borders, professional value proposition style.
All text in Simplified Chinese, perfectly legible, high contrast.
```

**PPT 组件**：
```tsx
<Slide>
  <h2>为什么选择川着渠道系统？</h2>

  <div className="cards cards-4">
    <Card title="效率提升" icon="⚡" variant="primary">
      <p>自动化替代手工</p>
      <p>省时省力</p>
    </Card>
    <Card title="成本降低" icon="💰" variant="success">
      <p>减少人工错误</p>
      <p>降低运营成本</p>
    </Card>
    <Card title="收入增长" icon="📈" variant="warning">
      <p>裂变获客</p>
      <p>提升复购</p>
    </Card>
    <Card title="数据驱动" icon="📊">
      <p>经营决策有据可依</p>
      <p>持续优化</p>
    </Card>
  </div>
</Slide>
```

---

### P12：成本费用

**生图提示词**：
```
Create a clean, modern, highly readable pricing table infographic in 16:9 horizontal format.

Use a minimalist color palette: professional navy blue #1E3A8A as primary, teal #0D9488 for totals, white background.

Layout: Two pricing tables side by side, clean table design.

At the top: Large bold title "运营成本透明"
HIGHLIGHT BADGE: "首年仅需 ~600 元"

LEFT TABLE - 首年固定支出:
| 项目 | 费用 | 说明 |
|------|------|------|
| 云服务器 | ¥168-199 | 首年活动价 |
| 云数据库 | ¥74 | 可选 |
| 对象存储 | ¥9 | 存商品图片 |
| 企业微信认证 | ¥300 | 可选 |
| 域名 | ¥50-100 | .com 年费 |
| **合计** | **~¥600** | |

RIGHT TABLE - 后续年度:
| 项目 | 费用 | 说明 |
|------|------|------|
| 年度合计 | ¥1,100-1,600 | 服务器恢复原价 |
| 月度变动 | ~¥8/月 | 短信+物流按量 |

BOTTOM NOTE: "不含人工成本；微信支付手续费 0.6% 由微信直接扣除"

Style: Two clean pricing tables with teal highlight for totals, professional quotation style, transparent and trustworthy aesthetic.
All text in Simplified Chinese, perfectly legible.
```

**PPT 组件**：
```tsx
<Slide>
  <h2>运营成本透明</h2>
  <ValueTag style={{ marginBottom: '1em' }}>首年仅需 ~600 元</ValueTag>

  <div className="two-cols">
    <div>
      <h3 style={{ marginBottom: '0.5em' }}>首年固定支出</h3>
      <table style={{ fontSize: '0.75em' }}>
        <tbody>
          <tr><td>云服务器</td><td>¥168-199</td><td>首年活动价</td></tr>
          <tr><td>云数据库</td><td>¥74</td><td>可选</td></tr>
          <tr><td>对象存储</td><td>¥9</td><td>存商品图片</td></tr>
          <tr><td>企业微信认证</td><td>¥300</td><td>可选</td></tr>
          <tr><td>域名</td><td>¥50-100</td><td>.com 年费</td></tr>
          <tr style={{ fontWeight: 'bold', color: 'var(--accent)' }}><td>合计</td><td>~¥600</td><td></td></tr>
        </tbody>
      </table>
    </div>
    <div>
      <h3 style={{ marginBottom: '0.5em' }}>后续年度</h3>
      <table style={{ fontSize: '0.75em' }}>
        <tbody>
          <tr><td>年度合计</td><td>¥1,100-1,600</td><td>服务器恢复原价</td></tr>
          <tr><td>月度变动</td><td>~¥8/月</td><td>短信+物流按量</td></tr>
        </tbody>
      </table>
    </div>
  </div>

  <Note>不含人工成本；微信支付手续费 0.6% 由微信直接扣除</Note>
</Slide>
```

---

### P13：计划排期

**生图提示词**：
```
Create a clean, modern, highly readable implementation roadmap infographic in 16:9 horizontal format.

Use a minimalist color palette: professional navy blue #1E3A8A as primary, teal #0D9488 for phase 1, orange #F59E0B for phase 2, light blue for phase 3, white background.

Layout: Three phases as connected milestones on a horizontal timeline.

At the top: Large bold title "落地路径"

THREE PHASES (left to right with connecting timeline arrow):

PHASE 1 - 开发期 (teal):
Time: 第 1 个月
Goal: 核心功能开发
- 拉新、交易、售后核心流程
- 小程序 + 管理后台

PHASE 2 - 内测期 (orange):
Time: 第 2 个月
Goal: Beta 版本验证
- 内部测试
- 问题修复
- 优化体验

PHASE 3 - 上线期 (light blue):
Time: 第 3 个月
Goal: 正式上线运营
- 部署上线
- 运营支持
- 持续迭代

BOTTOM: Timeline arrow connecting all three phases with milestone markers.

Style: Three connected phase cards on timeline, distinct colors for each phase, milestone markers, professional project roadmap style.
All text in Simplified Chinese, perfectly legible.
```

**PPT 组件**：
```tsx
<Slide>
  <h2>落地路径</h2>

  <div className="three-cols">
    <div className="card" style={{ borderTop: '4px solid var(--accent)' }}>
      <PhaseBadge phase={1}>开发期</PhaseBadge>
      <h4 style={{ color: 'var(--accent)', marginTop: '0.5em' }}>第 1 个月</h4>
      <ul style={{ fontSize: '0.85em' }}>
        <li>核心功能开发</li>
        <li>拉新、交易、售后</li>
        <li>小程序 + 管理后台</li>
      </ul>
    </div>
    <div className="card" style={{ borderTop: '4px solid var(--warning)' }}>
      <PhaseBadge phase={2}>内测期</PhaseBadge>
      <h4 style={{ color: 'var(--warning)', marginTop: '0.5em' }}>第 2 个月</h4>
      <ul style={{ fontSize: '0.85em' }}>
        <li>Beta 版本验证</li>
        <li>内部测试</li>
        <li>优化体验</li>
      </ul>
    </div>
    <div className="card" style={{ borderTop: '4px solid var(--primary-light)' }}>
      <PhaseBadge phase={3}>上线期</PhaseBadge>
      <h4 style={{ color: 'var(--primary-light)', marginTop: '0.5em' }}>第 3 个月</h4>
      <ul style={{ fontSize: '0.85em' }}>
        <li>正式上线运营</li>
        <li>运营支持</li>
        <li>持续迭代</li>
      </ul>
    </div>
  </div>

  <SFlow steps={['开发期', '内测期', '上线期']} />
</Slide>
```

---

### P14：收尾页

**生图提示词**：
```
Create a clean, modern, minimal closing slide in 16:9 horizontal format.

Use a minimalist color palette: professional navy blue #1E3A8A as primary, teal #0D9488 as accent, white background.

Layout: Center-focused design with simple message.

Content:
- Large bold title: "感谢聆听"
- Subtitle: "期待合作"
- Small brand text: "川着 transmute"

Style: Minimalist closing slide, center-aligned text, clean typography, professional presentation ending.
All text in Simplified Chinese, perfectly legible.
```

**PPT 组件**：
```tsx
<Slide className="center">
  <Cover
    title="感谢聆听"
    subtitle="期待合作"
    meta="川着 transmute"
  />
</Slide>
```

---

## 使用说明

### 生图提示词使用
1. 复制对应页面的「生图提示词」
2. 粘贴到 Nano Banana 2 / Gemini 图像生成工具
3. 根据生成结果微调
4. 下载图片放到 PPT 项目

### PPT 组件使用
1. 在 `reveal-ppt` 项目中创建新路由（如 `/demo`）
2. 复制对应页面的组件代码
3. 调整样式和内容细节
4. 部署更新到火山云

### 部署命令
```bash
cd C:\MyFile\workspace\test\reveal-ppt
npm run build
# 部署到火山云
```

---

*提示词生成时间：2026-03-05*
*参照风格：业务流转图-完整版-NanoBanana2提示词.md*
