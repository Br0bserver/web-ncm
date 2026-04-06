# WebNCM - 轻量级网易云音乐第三方网页客户端

WebNCM 是一个基于 Node.js 和 Vue 2 开发的网易云音乐第三方网页客户端。它旨在提供极致轻量、现代感强（Apple Music 风格）且兼容性卓越（Chromium 40+）的听歌体验。

## 核心特性

- **极致兼容**：专为老旧内核（Chromium 40+）优化的 ES5 语法及 CSS，适用于各类嵌入式 WebView 设备。
- **全量代理**：所有 API、图片、音频资源均通过后端中转，完美解决跨域及网络受限问题。
- **单用户模式**：专为特殊设备环境设计的全局单会话模式，一处登录，全处共享，无需重复扫码。
- **安全访问**：支持通过 URL Token 进行访问鉴权，防止资源被非法冒用。
- **现代视觉**：提供纯黑沉浸模式与流畅的“动态流光”背景切换，支持歌词同步缩放及 Apple Music 风格布局。
- **容器化支持**：内置多阶段构建的 Dockerfile，生成镜像极小，部署简单。

## 快速开始

### 方式一：使用 Docker 部署 (推荐)

1. **构建镜像**：
   ```bash
   docker build -t web-ncm .
   ```

2. **运行容器**：
   ```bash
   docker run -d -p 3000:3000 --name web-ncm -e ACCESS_TOKEN="您的安全密钥" web-ncm
   ```

3. **访问应用**：
   打开浏览器访问 `http://localhost:3000/?token=您的安全密钥`

### 方式二：手动部署

1. **安装依赖**：
   ```bash
   npm install
   cd vendor/api-enhanced && npm install
   ```

2. **构建前端**：
   ```bash
   npm run build
   ```

3. **启动服务**：
   ```bash
   npm start
   ```

## 鸣谢

本项目后端核心功能基于 [**ncm-api-enhanced**](https://github.com/neteasecloudmusicapienhanced/api-enhanced) 项目构建。

- 特别感谢其基础项目 [Binaryify/NeteaseCloudMusicApi](https://github.com/Binaryify/NeteaseCloudMusicApi)。
- 同时也感谢 `trazyn/ieaseMusic`、`listen1/listen1_chrome_extension`、`chaunsin/netease-cloud-music` 等项目在加密算法（eapi, weapi）逆向工程上的贡献。

## 免责声明

- 本项目仅供学习、研究之用，不保证服务的稳定性与安全性。
- 使用本项目需遵守相关法律法规，尊重网易云音乐的服务条款。
- 严禁将本项目用于任何商业用途或非法牟利。

## 开源协议

[MIT](LICENSE)
