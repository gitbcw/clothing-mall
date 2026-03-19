# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

服装店线上渠道扩展系统，基于 Spring Boot 后端 + Vue 管理前端 + 微信小程序用户前端的多模块电商项目。

## 重要文档

| 文档 | 用途 |
|------|------|
| [docs/开发环境指南.md](docs/开发环境指南.md) | 本地开发环境配置、Docker 一键启动 |
| [docs/阿里云部署指南.md](docs/阿里云部署指南.md) | 服务器部署流程、一键部署命令 |
| [docker/README.md](docker/README.md) | Docker 详细配置说明 |

**快速导航**：
- 本地开发 → `./scripts/docker-start.sh deploy`
- 服务器部署 → `./scripts/docker-start.sh deploy-prod`

## 常用命令

### Docker 一键管理（推荐）

```bash
# 查看所有命令
./scripts/docker-start.sh --help

# 本地开发
./scripts/docker-start.sh deploy          # 一键部署本地环境
./scripts/docker-start.sh start           # 启动服务
./scripts/docker-start.sh stop            # 停止服务
./scripts/docker-start.sh restart         # 重启服务
./scripts/docker-start.sh status          # 查看状态
./scripts/docker-start.sh logs app        # 查看应用日志

# 生产部署
./scripts/docker-start.sh deploy-prod     # 一键部署到生产服务器
./scripts/docker-start.sh sync-db         # 从服务器同步数据库

# 打包
./scripts/docker-start.sh pack            # 打包后端 JAR
./scripts/docker-start.sh pack-admin      # 打包管理前端
```

### 后端 (Maven)

```bash
# 构建所有模块
mvn clean install

# 构建并打包
mvn clean package

# 启动聚合服务 (端口 8080)
java -Dfile.encoding=UTF-8 -jar clothing-mall-all/target/clothing-mall-all-0.1.0-exec.jar

# 启动管理后台 API (端口 8083)
java -jar clothing-mall-admin-api/target/clothing-mall-admin-api-0.1.0-exec.jar

# 启动小程序 API (端口 8082)
java -jar clothing-mall-wx-api/target/clothing-mall-wx-api-0.1.0-exec.jar
```

### 管理后台前端 (Vue 2 + Element UI)

```bash
cd clothing-mall-admin
npm install
# 开发模式启动 (端口 9527，代理到 localhost:8080)
npm run dev
# 生产构建
npm run build
# 代码检查
npm run lint
# 单元测试
npm run test:unit
```

### H5 移动端前端 (Vue 2 + Vant)

```bash
cd clothing-mall-vue
npm install
npm run dev
npm run build
```

## 端口配置

### Docker 环境（本地开发）

| 服务 | 端口 | 说明 |
|------|------|------|
| Nginx | 80 | 管理后台入口 |
| Java App | 8088 | 后端 API |
| MySQL | 3306 | 数据库 |

### 本地直跑模式

| 服务 | 端口 |
|------|------|
| 聚合后端 | 8080 |
| 小程序 API | 8082 |
| 管理后台 API | 8083 |
| 管理前端 (开发) | 9527 |
| H5 前端 (开发) | 8081 |

### 生产环境

| 服务 | 端口 |
|------|------|
| Nginx | 8080 |
| Java App | 8088 |
| MySQL | 3306 |

## 模块架构

```
clothing-mall (Maven 根)
├── clothing-mall-core       # 公共组件：Web 配置、存储、短信、微信 SDKall-db
├── clothing-m # 数据库层：MyBatis Mapper、领域模型
├── clothing-mall-admin-api  # 管理后台后端 (依赖: db, core)
├── clothing-mall-wx-api     # 小程序后端 (依赖: db, core)
├── clothing-mall-all        # 聚合服务 (依赖: admin-api, wx-api)
└── clothing-mall-all-war    # WAR 包部署
```

前端模块：
- `clothing-mall-admin` - Web 管理端 (Vue 2 + Element UI)
- `clothing-mall-wx` - 微信小程序
- `clothing-mall-vue` - H5/移动端 (Vue 2 + Vant)

## 技术栈

- 后端：Spring Boot 2.1.5、MyBatis、PageHelper、Shiro (管理端)、JWT (小程序端)、Druid、Swagger
- 前端：Vue 2、Element UI、Vant、微信小程序
- 数据库：MySQL 8.0

## 数据库配置

配置文件：`clothing-mall-db/src/main/resources/application-db.yml`

```yaml
# 默认连接
jdbc:mysql://localhost:3306/clothing_mall
用户名: clothing_mall
密码: clothing123456
```

**推荐使用 Docker 启动 MySQL**：
```bash
cd docker && docker compose up mysql -d
```

初始化 SQL 位于 `docker/db/init-sql/` 目录。

## 认证机制

- 管理端：Shiro + Session，请求头 `X-Litemall-Admin-Token`
- 小程序端：JWT Token，请求头 `X-Litemall-Token`

## 关键约束

- 使用 JDK 1.8
- Vue 2 + webpack4 与新版 Node 兼容问题：Windows 下需设置 `NODE_OPTIONS=--openssl-legacy-provider`
- 本地联调优先使用 `127.0.0.1` 而非 `localhost`

## 工作约定

### 开发反馈循环 (TDD Workflow)

> **核心理念**：先理解再动手，测试先行，验证闭环

**触发条件**：开发新功能、修改功能、重构代码、修复 Bug

```
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│  1.计划 │───►│ 2.写测试│───►│ 3.写代码│───►│ 4.跑测试│───►│ 5.更新  │───►│ 6.汇报  │
│  Plan   │    │  Test   │    │  Code   │    │ Verify  │    │ Update  │    │ Report  │
└─────────┘    └─────────┘    └─────────┘    └─────────┘    └─────────┘    └─────────┘
     │              │              │              │              │              │
     ▼              ▼              ▼              ▼              ▼              ▼
 理解代码      先写测试        最小实现       全量测试       更新状态       结果摘要
 设计方案      定义预期        使测试过       确保不破       技术债         覆盖率
 测试设计      红→绿循环         过          坏原功能       注意事项
     │
     ▼
 等待批准
```

#### 阶段详解

| 阶段 | 目标 | 关键动作 |
|------|------|---------|
| **1. 计划** | 充分理解，设计测试 | 扫描代码 → 梳理调用链 → 设计测试用例 → 输出方案 → **等待批准** |
| **2. 测试** | TDD 先写测试 | 编写测试用例（正常/边界/异常）→ 运行确认失败（红灯） |
| **3. 实现** | 最小代码通过测试 | 编写最小实现 → 保持简洁 |
| **4. 验证** | 确保质量 | 运行新测试 → 运行旧测试 → 确保不引入回归 |
| **5. 更新** | 同步项目状态 | 更新「当前状态」→ 追加「技术债/注意事项」 |
| **6. 汇报** | 清晰汇报结果 | 测试结果 + 改动摘要 + 覆盖率 |


#### 计划模式集成

当使用计划模式（EnterPlanMode / plan agent）生成实现计划时，**必须将开发反馈循环的步骤纳入计划**：

1. 计划文件的每个步骤要明确标注属于 TDD 哪个阶段
2. 计划必须包含：测试设计 → 实现代码 → 验证测试 → 更新文档
3. 执行时按计划中的 TDD 阶段顺序推进

---

### 每次会话结束前
- 如果当前任务已完成，更新「当前状态」中的核心任务和下一步计划
- 如果发现新的技术债或踩到坑，追加到「已知技术债与注意事项」
- 如果有信息缺口，向用户提问补齐信息缺口

### 更新原则
- 只更新你有直接证据的内容，不确定的标注「待确认」
- 不删除已有条目，只追加或修正
- 更新前说明你要改什么，等用户确认再写入

## 当前状态
- 当前阶段：功能开发
- 最近在动的模块：clothing-mall-admin（管理后台）、clothing-mall-core（存储服务）
- 当前核心任务：商品图片 OSS 存储
- 已完成功能：
  - ✓ 品牌更名（joypick/欢乐小玩家 → 川着Transmute）
  - ✓ 埋点全链路（前端 tracker.js + 页面集成 + 后端 API + 数据库）
  - ✓ 企业微信小程序卡片推送（后端 API + 管理后台推送页面）
  - ✓ 阿里云 OSS 存储配置（使用内网 endpoint 节省流量）
  - ✓ OSS URL 重复拼接问题修复（AliyunStorage.generateUrl 防护）
  - ✓ 本地 Docker 一键启动环境（M4 Mac ARM64 兼容）
- 下一步计划：
  - 企业微信真实环境测试（需配置企微企业ID、Secret、小程序AppID）

### Docker 环境快速参考

```bash
# 本地一键启动
./scripts/docker-start.sh deploy

# 一键部署到生产
./scripts/docker-start.sh deploy-prod

# 访问地址
# 本地: http://localhost (管理后台)
# 生产: http://47.107.151.70:8080 (管理后台)
```

## 已知技术债与注意事项
- **前端页面待对接后端**：`clothing-mall-admin/src/views/promotion/activity.vue` 和 `outfit.vue` 已创建，但后端 API 尚未实现
- **编号唯一性问题**：`LitemallOrderService` 和 `LitemallAftersaleService` 中的订单号/售后编号生成逻辑存在重复可能（见 `TODO` 注释）
- **通知功能未完善**：订单状态变更时的邮件/短信通知标记为 `TODO`，采用异步发送但未实现
- **Dashboard 统计**：`dashboard/index.vue` 中的销售统计 API 标记为 `TODO`，目前使用模拟数据
- **字体依赖**：`QCodeService.java:164` 生成的二维码依赖服务器安装的字体，部署时需确认
- **品牌模块已删除**：小程序 `pages/brand/` 和 `pages/brandDetail/` 已删除，app.json 路由已同步移除 ✓
- **CI/CD 配置**：GitHub Actions 跳过了 vue lint，改为构建检查（见 commit 6faaefc）
- **Docker 部署**：
  - 使用 `./scripts/docker-start.sh` 脚本管理本地和生产环境
  - 部署后必须重建镜像：`docker compose build app && docker compose up -d app`
  - 前端部署后需要清除浏览器缓存
  - 本地环境使用 `docker-compose.local.yml`，生产使用 `docker-compose.yml`
- **OSS 存储防护**：已修复 `AliyunStorage.generateUrl()` 方法，防止 URL 重复拼接（当 key 已是完整 URL 时直接返回）
- **gallery JSON 格式**：MySQL 中 gallery 字段必须为合法 JSON 数组格式 `["url1","url2"]`，字符串必须用双引号包裹
