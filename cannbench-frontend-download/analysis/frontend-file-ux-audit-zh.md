# CANN Bench 前端工程文件体验问题分析

分析对象：`cannbench-frontend-download/public` 中的线上生产前端包，以及登录态中文桌面截图。

重要说明：当前下载到的是生产打包文件，不是未编译的原始源码。它仍然能反映完整前端能力：路由、API 调用、页面状态、角色权限、中文/英文文案和主要交互逻辑都在包内。

## 1. 前端文件显示的真实产品形态

CANN Bench 不是一个简单展示页，而是一个完整的评测工作台。生产包暴露的主路由包括：

- `/` 概览
- `/benchmarks`、`/benchmarks/:slug`、`/benchmarks/:slug/:operator`、`/benchmarks/:slug/subsets/:subset`
- `/submit`
- `/jobs`、`/jobs/:id`
- `/leaderboard`、`/leaderboard/:collection`、`/leaderboard/:collection/:subset`
- `/updates`、`/updates/:slug`
- `/account`
- `/admin`、`/admin/security-safety-report`

API 覆盖完整生命周期：

- 登录和账号：`/api/auth/me`、`/api/auth/tokens`、`/api/auth/cli-token`
- 评测集：`/api/benchmarks`、bundle、reference、api-description、subsets
- 提交：`/api/submissions`、submission credits、target hardware、submission tag parts
- 任务：`/api/jobs`、logs、artifacts、submission download、rerun、invalidate
- 排行榜：`/api/leaderboard`
- 管理：users、quota、roles、benchmark visibility、default benchmark、subsets、blog、maintenance、submission policy、score refresh、security report

这说明当前产品功能已经很丰富，核心问题不是“缺少功能”，而是“用户路径没有把这些功能组织成可完成任务的流程”。

## 2. 用户真实任务流

算子提交者的主路径应该是：

`理解评测规则 -> 选择评测集/算子 -> 下载任务包或模板 -> 准备 zip -> 提交评测 -> 查看任务状态 -> 定位失败原因 -> 重新提交 -> 查看排行榜`

结果观察者的主路径是：

`理解评测口径 -> 查看评测集和版本 -> 看排行榜 -> 理解指标和筛选 -> 追溯到任务/提交`

维护者的主路径是：

`监控 runner/任务 -> 管理用户和配额 -> 管理评测包/子集 -> 控制维护模式/策略 -> 审核安全报告和高风险操作`

当前界面把这些路径都放在同一层导航和同一套视觉优先级里，导致参赛者、观察者、维护者的任务相互打断。

## 3. 当前不好的地方

### 问题 1：导航没有按用户任务分组

前端导航包含：概览、评测集、版本动态、排行榜、提交、任务、管理、GitCode、硬件状态、语言、主题、角色、账号、退出。

这些入口都合理，但同屏并列后产生两个问题：

- 普通参赛者最重要的 `提交` 和 `任务` 没有形成“工作台”感。
- 维护者入口 `管理` 和普通路径同级，容易让页面显得像后台系统，而不是用户评测入口。

建议：

- 导航分组为：了解区、参赛区、结果区、维护区。
- 主顺序改为：概览、评测集、提交、任务、排行榜、版本动态。
- `管理` 保留为维护者可见，但视觉上靠右独立，不进入普通参赛路径。

### 问题 2：首页像产品介绍页，不像“开始一次提交”的任务入口

前端首页有较完整的内容：hero、任务目录、评测路径、runner 状态、最新动态、开源仓库、技术报告。这些信息本身有价值。

问题是首页没有把新用户的第一步明确聚焦到“我如何完成一次提交”。用户看到 `浏览算子`、`查看排行榜`、`提交算子` 三个入口，但仍要自己判断先点哪个。

建议：

- 首页首屏主 CTA 改为 `开始一次提交`。
- 在首屏加入 4 步新手路径：选择评测集、下载模板、上传 zip、查看结果。
- 任务目录里的 Level 卡片保留，但增加“进入任务包 / 下载 spec / 查看模板”的行动按钮。
- `RUNNER 状态` 和 `动态 · 最新` 保留，但定位为可信度和实时性证明，不要压过提交主线。

### 问题 3：评测集页像目录，不像任务包中心

从前端 API 看，评测集详情实际支持很多能力：bundle 下载、reference、api-description、subsets、operator detail、leaderboard。也就是说，评测集页本来可以成为“任务包中心”。

但当前列表页主要展示名称、版本、Level、算子数、用例数。对新用户来说，最关键的问题是“我从哪里拿到正确 zip 模板和任务规格”，这个入口不够显眼。

建议：

- 评测集卡片增加一级按钮：`下载任务包`、`查看提交模板`、`查看算子列表`、`进入排行榜`。
- 评测集详情页把 `Bundle / Reference / API Description / Cases` 做成清楚的操作区。
- 修正拼写一致性：截图里出现 `Offical-Tasks`，建议统一为 `Official-Tasks`。

### 问题 4：提交页功能完整，但流程感弱

前端提交页已经包含很多好功能：

- 评测集选择
- 目标硬件
- zip 上传
- zip 顶层结构预览
- ACLNN Launch / Direct Launch 说明
- submission tag 自动生成
- team aggregation token
- 私有提交
- 提交额度
- CLI 提交脚本

问题是这些功能平铺在两栏里，用户需要自己理解顺序。尤其是新用户会卡在三个问题：

- 应该先下载哪个模板？
- zip 结构是否正确？
- submission tag、aggregation token 和 private submission 分别影响什么？

建议：

- 改成步骤式提交：选择评测集 -> 获取模板 -> 上传 zip -> 选择硬件 -> 填写展示信息 -> 提交。
- 上传区附近增加“还没有 zip？”模板入口。
- zip 结构预览做成提交前检查清单，明确通过/缺失。
- 提交按钮禁用时显示原因，例如 `请先上传 zip`、`请选择在线硬件`、`zip 结构缺少 build.sh`。
- CLI 区域放到折叠的“自动化提交”区，不要和网页提交主流程抢视觉层级。

### 问题 5：任务列表能筛选状态，但失败诊断不够直接

前端任务页支持全部/我的任务、状态筛选、搜索、分数范围、排序、下载提交包。Job 详情页还有 compile、precision、performance tab、logs、artifacts、rerun、invalidate、hidden rerun。

这说明诊断能力是存在的，但列表页和详情页之间缺少“下一步行动”的桥梁。用户看到 `编译失败` 或 `部分通过` 后，不知道应该先看日志、产物、失败算子，还是直接重提。

建议：

- 任务列表增加诊断摘要列：失败阶段、首个错误、失败算子数。
- 每行提供主操作：`查看日志`、`下载产物`、`重新提交`。
- Job 详情页顶部增加“下一步建议”：例如 `编译失败：先查看 compile log`。
- `下载` 和 `删除` 不应同级。删除应进入更多菜单或二次确认区。

### 问题 6：排行榜指标完整，但新用户解释成本高

前端排行榜支持 benchmark、hardware、version、operator、subsets、mode、tag、sort 等多维筛选，还展示总分、平均分、加速比、提交算子数、测例数、更新时间等信息。

这些指标对高级用户有用，但首次访问者很难理解：

- 总分和平均分的关系。
- 标准用例和隐藏用例如何影响结果。
- 提交算子数为什么重要。
- 团队聚合码如何合并结果。

建议：

- 默认提供 `快速排名` 模式：总分、提交算子数、通过率、硬件、用户、更新时间。
- 高级指标放入 `深入分析` 模式或展开列。
- 顶部增加“排行榜怎么看”三条解释。
- 筛选区分为常用筛选和高级筛选，避免第一屏过重。

### 问题 7：账号页和提交页连接不够强

前端账号页有 Token 管理和 CLI 脚本生成，这是非常有价值的高级功能。但它目前更像独立工具箱，没有强连接到提交页。

建议：

- 提交页增加 `使用 CLI 提交` 折叠区，链接到账号页 token。
- 账号页生成 token 后，给出下一步：`复制脚本`、`回到提交页`、`查看任务`。
- 对 `<CANN_BENCH_TOKEN>` 这类占位符做强提醒，避免用户直接复制失败。

### 问题 8：管理页功能过密，风险操作需要分层

前端管理模块非常完整，包含用户、角色、配额、runner、任务、评测包、子集、blog、权限表、维护模式、提交策略、分数刷新和安全报告。

当前问题是管理页承载了太多高风险操作，但信息分层不够明显。维护者需要高效率，但也需要风险边界。

建议：

- 管理页分为日常监控、内容配置、权限安全、高风险维护四组。
- 分数刷新、删除、维护模式、权限变更增加独立风险提示和操作记录。
- 用户配额和角色变更加上最近操作人/时间。
- 安全报告入口从普通用户列表上方分离为“安全与风险”区域。

## 4. 竞品参考：NVIDIA SOL-ExecBench

参考页面：`https://research.nvidia.com/benchmarks/sol-execbench`

已保存证据：

- 首页：`../evidence/competitor-nvidia/01-home-skill-1440-fullpage-clean.png`
- Problems：`../evidence/competitor-nvidia/02-problems-skill-1440-fullpage-clean.png`
- Leaderboard：`../evidence/competitor-nvidia/03-leaderboard-skill-1440-fullpage-clean.png`
- Status：`../evidence/competitor-nvidia/04-status-skill-1440-fullpage-clean.png`
- Collection L1：`../evidence/competitor-nvidia/05-collection-l1-skill-1440-fullpage-clean.png`
- 页面摘要：`../evidence/competitor-nvidia/competitor-pages-summary.json`

NVIDIA SOL-ExecBench 和 CANN Bench 的产品形态不完全一样：前者更像公开 benchmark 门户，后者是登录态评测工作台。因此不应该照搬视觉风格，但它的信息组织很值得参考。

### 值得参考的地方

1. 首屏一句话就解释清楚价值：
   `Benchmark Real-World GPU Kernels Against Hardware Limits`，紧接着说明提交优化 kernel、获得 SOL Score、参与全球排行榜。它没有先铺很多平台背景，而是先回答“这个 benchmark 用来干什么”。

2. 主 CTA 明确：
   `Explore Problems` 和 `View Leaderboard` 直接对应两类核心用户：提交者找题，观察者看结果。CANN Bench 也有类似入口，但还没有被组织成“先找任务，再提交，再看结果”的路径。

3. 可信度证据前置：
   页面把 `235 Active Problems`、`4 Collections`、`Total Submissions`、`Developers` 放在首屏下方，同时用 `Real Hardware`、`Real Kernels`、`Real Limits` 解释评测可信度。CANN Bench 的 runner 状态和最新动态也有类似价值，建议更明确地放在“可信度证明”位置，而不是作为普通楼层信息。

4. 任务中心结构清楚：
   顶部导航包含 `Problems`、`Leaderboard`、`Status`，外部证据链包含 `GitHub`、`HuggingFace`、`Paper`。这条结构对 CANN Bench 的评测集页有启发：任务包、参考实现、API description、论文/报告、开源仓库应该组成一个清楚的资源区。

5. 首页把 collection、kernel、leaderboard 摘要串起来：
   用户不用先理解全部系统功能，就能看到有哪些题、谁做得好、当前竞争是否活跃。CANN Bench 首页也可以保留任务目录和排行榜摘要，但应服务于“开始一次提交”的主线。

### 不能直接照搬的地方

- SOL-ExecBench 是公开门户，登录只是辅助；CANN Bench 的核心体验是登录态提交和任务诊断，所以 CANN Bench 必须强化 `提交`、`任务`、`失败诊断`，不能只做研究展示页。
- SOL-ExecBench 的 Problems 是主入口；CANN Bench 的评测集还承担 bundle、reference、api-description、subsets 等工程资源入口，应该更像“任务包中心”。
- SOL Score 是单一强概念；CANN Bench 有总分、标准/隐藏用例、加速比、提交算子数、团队聚合码等多指标，必须增加指标解释和快速/深入两层阅读模式。

### 对 CANN Bench 的迁移建议

- 首页首屏改成：一句话价值主张 + `开始一次提交` + `浏览评测集` + `查看排行榜`。
- 首屏下方增加 4 个可信度数字：评测集/算子数、Runner 在线状态、累计提交数、最近更新。
- 增加“为什么可信”三卡：真实硬件、真实算子、真实评测口径，对应 CANN Bench 的硬件、用例、隐藏集/排行榜规则。
- 评测集页学习 Problems 的入口强度，但把按钮改成工程任务：`下载任务包`、`查看模板`、`查看 API`、`进入排行榜`。
- 顶部导航可参考 `Problems / Leaderboard / Status` 的清晰性，把 CANN Bench 的 `评测集 / 提交 / 任务 / 排行榜 / 状态` 组织成参赛路径。

## 5. 优先级建议

### P0：先打通一次提交闭环

- 首页新增首次提交路径。
- 评测集增加任务包/模板入口。
- 提交页改为步骤式。
- 任务页增加失败诊断摘要和下一步操作。

### P1：降低结果理解成本

- 排行榜增加快速/深入两种模式。
- 指标解释前置。
- 任务详情页强化 compile、precision、performance 的诊断引导。

### P2：优化高级用户和维护者体验

- 账号页和 CLI 提交联动。
- 管理页分组和风险分层。
- 中英文术语表统一。

## 6. 结论

当前 CANN Bench 的前端能力已经比较完整，甚至有不少高级能力已经实现。最需要改的不是新增功能，而是重新组织用户路径：

- 让新用户知道第一步做什么。
- 让提交者知道 zip 从哪里来、如何校验、怎么提交。
- 让失败任务直接告诉用户下一步修哪里。
- 让排行榜先回答“谁更好”，再支持高级分析。
- 让维护者后台和普通评测路径分开。

一句话：当前网站是“功能全的评测系统”，下一步应该变成“能引导用户完成一次评测闭环的工作台”。
