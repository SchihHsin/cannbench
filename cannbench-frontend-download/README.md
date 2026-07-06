# CANN Bench Frontend Download

这个目录保存的是 `https://cannbench.com/` 当前线上公开可下载的前端生产包，不是未打包的原始源码工程。

## 已下载内容

- `public/index.html`: 入口 HTML。
- `public/assets/index-C5ax4_ra.js`: 打包后的前端 JavaScript，包含路由、页面组件、中文/英文文案和 API 调用逻辑。
- `public/assets/index-CsThEqRM.css`: 打包后的样式。
- `public/favicon.svg`: 网站图标。
- `public/hero-cann-bench.png`: 首页视觉图。
- `browser-assets/` 与 `browser-assets-logged-in/`: 浏览器抓取到的补充静态资源。
- `evidence/user-screenshots/`: 登录态中文桌面截图证据。

## 本地复现

```bash
cd /Users/hsin/Documents/Coding/cannbench/cannbench-frontend-download
node serve-local.mjs
```

然后打开：

```text
http://localhost:4173/
```

这个本地服务支持前端路由回退，默认开启“登录态视觉回放”，会在本地模拟一个普通用户账号，让顶部导航、任务包、排行榜、动态、提交页、运行记录和账户区按登录态显示。核心页面需要的 API 数据已经使用本地样例数据，避免导出真实 cookie 或 token，也避免页面依赖线上接口导致加载不稳定。

```text
http://localhost:4173/submit
http://localhost:4173/jobs
http://localhost:4173/leaderboard
```

## 复现边界

本地可以复现线上前端壳、样式、路由和前端交互逻辑；核心只读 API 与登录态相关接口会使用本地 mock 数据，以便做视觉和交互迭代。任务提交、删除、管理修改等写操作仍会被拦截。

不建议直接用 `file:///.../public/index.html` 打开这份入口文件，因为它引用了站点根路径下的资源和接口，例如 `/assets/...`、`/ux-enhance.js`、`/api/...`。在 `file://` 环境里这些路径会指向电脑文件系统根目录，而不是当前项目目录；同时前端路由和登录态接口也没有本地服务兜底，所以容易白屏。请使用 `http://127.0.0.1:4173/` 或 `http://localhost:4173/`。

如果想查看未登录状态，可以这样启动：

```bash
LOGGED_IN_REPLAY=0 node serve-local.mjs
```

出于安全原因，这里没有导出 cookie、token 或账号凭证，所以它不是你的真实在线会话，而是安全的登录态回放。

如果后续要做视觉和交互迭代，建议用这套生产包与截图先做 UX 分析和改版稿；如果要真正改代码，最好拿到网站的原始前端仓库，否则只能在打包后的 JS/CSS 上做有限改动。
