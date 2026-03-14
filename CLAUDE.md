# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

服装店线上渠道扩展系统，基于 Spring Boot 后端 + Vue 管理前端 + 微信小程序用户前端的多模块电商项目。

## 重要文档

| 文档 | 用途 |
|------|------|
| [docs/开发环境指南.md](docs/开发环境指南.md) | 本地开发环境配置、启动流程 |
| [docs/阿里云部署指南.md](docs/阿里云部署指南.md) | 服务器部署流程、常见问题解决 |

**快速导航**：
- 本地开发 → [开发环境指南](docs/开发环境指南.md)
- 服务器部署 → [阿里云部署指南](docs/阿里云部署指南.md)

## 常用命令

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

| 服务 | 端口 |
|------|------|
| 聚合后端 | 8080 |
| 小程序 API | 8082 |
| 管理后台 API | 8083 |
| 管理前端 (开发) | 9527 |
| H5 前端 (开发) | 8081 |

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
