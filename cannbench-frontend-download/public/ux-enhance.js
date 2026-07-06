(function () {
  const state = {
    helperKey: "",
    scheduled: false,
  };
  let observer = null;

  function create(html) {
    const template = document.createElement("template");
    template.innerHTML = html.trim();
    return template.content.firstElementChild;
  }

  function findShell() {
    return document.querySelector(".page-shell");
  }

  function header() {
    return findShell().querySelector(":scope > .page-header");
  }

  function insertAfter(target, node) {
    if (target && target.parentNode) target.parentNode.insertBefore(node, target.nextSibling);
    else findShell().prepend(node);
  }

  function homeHero() {
    const shell = findShell();
    return shell ? [...shell.children].find((el) => el.classList.contains("ov-section")) : null;
  }

  function homeCatalog() {
    const shell = findShell();
    const sections = shell ? [...shell.children].filter((el) => el.classList.contains("ov-section")) : [];
    return sections[1] || null;
  }

  function insertPrimary(node) {
    if (location.pathname === "/" || location.pathname === "") {
      insertAfter(homeHero() || header(), node);
      return;
    }
    insertAfter(header(), node);
  }

  function insertPlaced(node, placement, previous) {
    if (placement === "after-home-catalog") {
      insertAfter(homeCatalog() || previous || homeHero() || header(), node);
      return;
    }
    if (placement === "after-home-hero") {
      insertAfter(homeHero() || header(), node);
      return;
    }
    if (previous) insertAfter(previous, node);
    else insertPrimary(node);
  }

  function insertBefore(target, node) {
    if (target && target.parentNode) target.parentNode.insertBefore(node, target);
    else findShell().prepend(node);
  }

  function normalizeNav() {
    const nav = document.querySelector(".nav-pills");
    if (!nav) return;
    const navRight = document.querySelector(".nav-right");

    const navItems = [...nav.querySelectorAll("a.nav-pill")];
    const order = [
      { href: "/", label: "首页", tone: "" },
      { href: "/benchmarks", label: "任务包", tone: "primary" },
      { href: "/leaderboard", label: "排行榜", tone: "" },
      { href: "/updates", label: "动态", tone: "secondary" },
    ];

    for (const item of navItems) {
      const href = item.getAttribute("href") || "";
      if (href === "/submit" || href === "/jobs") {
        item.dataset.uxNav = "hidden";
        item.setAttribute("aria-hidden", "true");
        item.tabIndex = -1;
        item.remove();
        continue;
      }
      const config = order.find((entry) => entry.href === href);
      if (!config) continue;
      if (item.dataset.uxLabel !== config.label) {
        const icon = item.querySelector("svg");
        item.textContent = "";
        if (icon) item.appendChild(icon);
        item.append(document.createTextNode(config.label));
        item.dataset.uxLabel = config.label;
      }
      const tone = config.tone || "default";
      if (item.dataset.uxNav !== tone) item.dataset.uxNav = tone;
    }

    const desired = order
      .map((entry) => navItems.find((node) => (node.getAttribute("href") || "") === entry.href))
      .filter(Boolean);
    const current = [...nav.querySelectorAll("a.nav-pill")].filter((node) => desired.includes(node));
    const isAlreadyOrdered = desired.length === current.length && desired.every((node, index) => node === current[index]);
    if (!isAlreadyOrdered) desired.forEach((item) => nav.appendChild(item));

    normalizeAccountMenu(navRight);
  }

  function normalizeAccountMenu(navRight) {
    if (!navRight) return;
    const existing = navRight.querySelector(".ux-account-menu");

    const children = [...navRight.children].filter((el) => !el.classList.contains("ux-account-menu"));
    const usernameEl = children.find((el) => /xchang|gcw|user/i.test(el.textContent || ""));
    const logoutEl = children.find((el) => /logout|退出/i.test(el.textContent || ""));
    const langEls = children.filter((el) => /(^|\s)(EN|中)(\s|$)/i.test((el.textContent || "").trim()));
    const themeEl = children.find((el) => /☼|☀|theme|主题|☾|◐|◑/i.test(el.textContent || "") || (el.querySelector && el.querySelector("svg") && /button/i.test(el.tagName)));
    const userName = (usernameEl?.textContent || "个人工作区").trim();

    children.forEach((el) => {
      if (el.classList.contains("nav-telemetry") || el.classList.contains("nav-repo-link")) return;
      if (el === usernameEl || el === logoutEl || langEls.includes(el) || el === themeEl) {
        if (!el.classList.contains("ux-nav-collapsed-source")) el.classList.add("ux-nav-collapsed-source");
      }
    });

    if (!existing) {
      const menu = create(`
        <details class="ux-account-menu">
          <summary>
            <span class="ux-account-avatar">我</span>
            <span class="ux-account-name"></span>
          </summary>
          <div class="ux-account-panel">
            <a href="/submit">提交</a>
            <a href="/jobs">运行记录</a>
            <button type="button" data-ux-account-action="language">语言：EN / 中</button>
            <button type="button" data-ux-account-action="theme">切换主题</button>
            <button type="button" data-ux-account-action="logout">退出登录</button>
          </div>
        </details>
      `);
      navRight.appendChild(menu);
    }

    const menu = navRight.querySelector(".ux-account-menu");
    if (!menu) return;
    const accountName = menu.querySelector(".ux-account-name");
    if (accountName && accountName.textContent !== userName) accountName.textContent = userName;
    menu.querySelectorAll("a").forEach((link) => {
      const href = link.getAttribute("href") || "";
      link.classList.toggle("is-active", location.pathname === href || location.pathname.startsWith(`${href}/`));
    });

    const langButton = menu.querySelector('[data-ux-account-action="language"]');
    const themeButton = menu.querySelector('[data-ux-account-action="theme"]');
    const logoutButton = menu.querySelector('[data-ux-account-action="logout"]');

    if (langButton && langEls.length) {
      langButton.onclick = () => {
        const zh = langEls.find((el) => /中/.test(el.textContent || ""));
        const en = langEls.find((el) => /EN/i.test(el.textContent || ""));
        (zh || en)?.click();
      };
    }
    if (themeButton && themeEl) themeButton.onclick = () => themeEl.click();
    if (logoutButton && logoutEl) logoutButton.onclick = () => logoutEl.click();
  }

  function shellChildren() {
    const shell = findShell();
    return shell ? [...shell.children] : [];
  }

  function childContaining(pattern) {
    return shellChildren().find((el) => pattern.test((el.innerText || "").replace(/\s+/g, " ")));
  }

  function appendInternal(target, key, node) {
    if (!target || target.querySelector(`[data-ux-internal="${key}"]`)) return;
    target.appendChild(node);
  }

  function insertBeforeInternal(target, key, node) {
    if (!target || document.querySelector(`[data-ux-internal="${key}"]`)) return;
    target.parentNode.insertBefore(node, target);
  }

  function enhancePageInternals() {
    const path = location.pathname;

    if (path.startsWith("/benchmarks")) {
      const card = childContaining(/Offical-Tasks|Official-Tasks/);
      if (card) {
        card.querySelectorAll("*").forEach((el) => {
          if ((el.textContent || "").trim() === "Offical-Tasks") el.textContent = "Official-Tasks";
        });
      }
      appendInternal(card, "benchmark-card-actions", create(`
        <div class="ux-embedded-actions" data-ux-internal="benchmark-card-actions">
          <div>
            <strong>这个任务包接下来怎么用</strong>
            <span>先确认 Level 和版本，再拿模板/API/cases；准备好 zip 后从这里提交。</span>
          </div>
          <div class="ux-native-actions">
            <a class="btn is-sm" href="/benchmarks/offical-tasks">打开任务中心</a>
            <a class="btn is-ghost is-sm" href="/submit">提交这个任务</a>
            <a class="btn is-ghost is-sm" href="/leaderboard">看任务榜单</a>
          </div>
        </div>
      `));
    }

    if (path.startsWith("/submit")) {
      const formPanel = childContaining(/SUBMISSION TAG|UPLOAD|Operators evaluate|Download spec/i);
      appendInternal(formPanel, "submit-form-aid", create(`
        <div class="ux-form-aid" data-ux-internal="submit-form-aid">
          <div>
            <span class="chip is-data">上传前</span>
            <strong>用户最容易出错的是 zip 根目录和任务版本</strong>
            <p>如果任务一直 compile failed，先回到任务包核对模板版本和目录结构，再重提。</p>
          </div>
          <a class="btn is-ghost is-sm" href="/benchmarks">回到任务包</a>
        </div>
      `));
    }

    if (path.startsWith("/jobs")) {
      const table = childContaining(/ID OPERATOR VER STATUS|STATUS ALL SUCCEEDED/i);
      insertBeforeInternal(table, "jobs-status-legend", create(`
        <div class="ux-status-legend tile" data-ux-internal="jobs-status-legend">
          <span><i class="status-led is-run"></i><b>运行中</b> 等待 runner 日志</span>
          <span><i class="status-led is-err"></i><b>编译失败</b> 先看 compile log</span>
          <span><i class="status-led is-warn"></i><b>用例失败</b> 先修首个失败 case</span>
          <span><i class="status-led is-ok"></i><b>通过</b> 再比较分数和产物</span>
        </div>
      `));
      appendInternal(table, "jobs-row-actions-note", create(`
        <div class="ux-embedded-actions" data-ux-internal="jobs-row-actions-note">
          <div>
            <strong>列表页应该直接回答“下一步修什么”</strong>
            <span>失败任务优先看阶段和日志；成功任务再下载产物或去排行榜比较。删除不是主操作，应该弱化。</span>
          </div>
          <div class="ux-native-actions">
            <a class="btn is-ghost is-sm" href="/jobs">查看日志</a>
            <a class="btn is-ghost is-sm" href="/benchmarks">重新提交</a>
          </div>
        </div>
      `));
    }

    if (path.startsWith("/leaderboard")) {
      const kpis = document.querySelector(".lb-kpis");
      if (kpis && !document.querySelector('[data-ux-internal="leaderboard-kpi-aid"]')) {
        insertAfter(kpis, create(`
          <div class="ux-metric-aid tile" data-ux-internal="leaderboard-kpi-aid">
            <span><b>Total score</b> 总体排名，不等于单算子最好。</span>
            <span><b>OPS</b> 覆盖算子越多，结果越有参考价值。</span>
            <span><b>Cases</b> 先确认通过率，再看加速比。</span>
            <span><b>Hardware</b> 910C 和 950PR 不要混着比。</span>
          </div>
        `));
      }
      const filterbar = document.querySelector(".lb-filterbar");
      if (filterbar && !document.querySelector('[data-ux-internal="leaderboard-mode-tabs"]')) {
        insertBefore(filterbar, create(`
          <div class="ux-mode-tabs tile" data-ux-internal="leaderboard-mode-tabs">
            <button class="is-active" type="button">快速排名</button>
            <button type="button">深入分析</button>
            <span>默认先看总分、覆盖算子、通过率和更新时间；硬件/标签/隐藏集放到深入分析。</span>
          </div>
        `));
      }
    }
  }

  function homeTrustBand() {
    return create(`
      <div class="ux-trust-band tile" data-ux-enhance="home-trust">
        <div class="tile-head">
          <span class="status-led is-data"></span>
          <span class="label">BENCHMARK CONFIDENCE</span>
          <span class="ux-helper-note">学习竞品把可信度前置，但保留 CANN Bench 的登录态评测工作台定位。</span>
        </div>
        <div class="ux-trust-grid">
          <div><b>53</b><span>公开算子任务</span></div>
          <div><b>910C / 950PR</b><span>真实硬件运行</span></div>
          <div><b>标准 + 隐藏</b><span>用例共同影响排名</span></div>
          <div><b>日志 / 产物</b><span>失败后可诊断重提</span></div>
        </div>
      </div>
    `);
  }

  function homeNextStep() {
    return create(`
      <div class="ux-home-command tile" data-ux-enhance="page-helper">
        <div class="tile-head">
          <span class="status-led is-ok"></span>
          <span class="label">FIRST RUN</span>
          <span class="ux-helper-note">提交不是一个独立入口；它应该发生在选定任务包之后。</span>
        </div>
        <div class="ux-home-command-grid">
          <div class="ux-home-command-copy">
            <strong>先选一个任务包，再提交实现</strong>
            <p>普通用户第一次进来不需要先看所有 tab。先从 L1 或官方任务包开始，拿到模板后再上传 zip。</p>
          </div>
          <div class="ux-home-command-flow">
            <span><b>1</b> 选任务包</span>
            <span><b>2</b> 下载模板</span>
            <span><b>3</b> 上传实现</span>
            <span><b>4</b> 看运行记录</span>
          </div>
          <div class="ux-native-actions ux-home-command-actions">
            <a class="btn" href="/benchmarks">开始选任务包</a>
            <a class="btn is-ghost" href="/jobs">查看运行记录</a>
            <a class="btn is-ghost" href="/leaderboard">看排行榜</a>
          </div>
        </div>
      </div>
    `);
  }

  function homeLevelChooser() {
    return create(`
      <div class="ux-level-guide tile" data-ux-enhance="home-level-guide">
        <div class="tile-head">
          <span class="status-led is-data"></span>
          <span class="label">STARTING POINT</span>
          <span class="ux-helper-note">按经验选择一个合适的起点，避免一上来就被复杂算子卡住。</span>
        </div>
        <div class="ux-level-grid">
          <a href="/benchmarks" class="ux-level-item">
            <span class="chip is-mint">L1</span>
            <strong>先跑通流程</strong>
            <p>适合第一次提交，重点确认目录、编译和 case 通过。</p>
          </a>
          <a href="/benchmarks" class="ux-level-item">
            <span class="chip is-violet">L2</span>
            <strong>开始优化</strong>
            <p>多输入、多输出和索引模式，适合验证基本性能策略。</p>
          </a>
          <a href="/benchmarks" class="ux-level-item">
            <span class="chip is-amber">L3</span>
            <strong>挑战融合算子</strong>
            <p>矩阵、卷积和 fused workloads，更适合已有实现经验的用户。</p>
          </a>
          <a href="/benchmarks" class="ux-level-item">
            <span class="chip is-data">L4</span>
            <strong>冲击高阶排名</strong>
            <p>模型服务和训练压力相关任务，适合稳定提交后再进入。</p>
          </a>
        </div>
      </div>
    `);
  }

  function benchmarkTaskPackage() {
    return create(`
      <div class="ux-native-helper tile" data-ux-enhance="page-helper">
        <div class="tile-head">
          <span class="status-led is-data"></span>
          <span class="label">TASK PACKAGE</span>
          <span class="ux-helper-note">下载前先确认版本、Level、硬件和是否计入公开榜。</span>
        </div>
        <div class="ux-package-grid">
          <div>
            <strong>任务包页要解决两个问题</strong>
            <p>我应该做哪个算子？我拿到模板后从哪里提交？所以提交按钮放在任务包旁边，而不是放在顶层导航。</p>
          </div>
          <div class="ux-package-facts">
            <span class="chip is-data">0.3.0</span>
            <span class="chip is-mint">53 operators</span>
            <span class="chip">910C / 950PR</span>
          </div>
          <div class="ux-native-actions">
            <a class="btn" href="/benchmarks/offical-tasks">查看任务详情</a>
            <a class="btn is-ghost" href="/submit">用这个任务提交</a>
            <a class="btn is-ghost" href="/leaderboard">看对应榜单</a>
          </div>
        </div>
        <div class="ux-resource-grid">
          <a href="/benchmarks/offical-tasks"><span class="chip is-data">Spec</span><strong>任务说明</strong><p>看评测版本、Level、算子范围和是否计入榜单。</p></a>
          <a href="/benchmarks/offical-tasks"><span class="chip is-mint">Template</span><strong>提交模板</strong><p>确认 ACLNN / Direct Launch 的目录和示例实现。</p></a>
          <a href="/benchmarks/offical-tasks"><span class="chip is-violet">API</span><strong>API 描述</strong><p>核对输入输出、dtype、shape 和容差要求。</p></a>
          <a href="/leaderboard"><span class="chip is-amber">Rank</span><strong>对应榜单</strong><p>提交后看同任务、同硬件、同版本的可比结果。</p></a>
        </div>
      </div>
    `);
  }

  function submitPreflight() {
    return create(`
      <div class="ux-native-helper tile" data-ux-enhance="page-helper">
        <div class="tile-head">
          <span class="status-led is-run"></span>
          <span class="label">SUBMIT CHECK</span>
          <span class="ux-helper-note">这是从任务包进入后的动作，不作为顶层浏览 tab。</span>
        </div>
        <div class="ux-submit-grid">
          <div class="ux-check-row" aria-label="提交前检查">
            <span><b>1</b> 已下载对应版本模板</span>
            <span><b>2</b> zip 根目录结构正确</span>
            <span><b>3</b> 硬件与榜单口径一致</span>
            <span><b>4</b> 提交后去 Jobs 看日志</span>
          </div>
          <pre class="ux-code-sample">submission.zip
├─ op_kernel/
├─ CMakeLists.txt
└─ metadata.json</pre>
        </div>
        <div class="ux-submit-steps">
          <span><b>01</b> 从任务包确认模板</span>
          <span><b>02</b> 上传 zip 并检查根目录</span>
          <span><b>03</b> 选择硬件和公开标签</span>
          <span><b>04</b> 提交后跳转运行记录</span>
        </div>
      </div>
    `);
  }

  function jobsDiagnosis() {
    return create(`
      <div class="ux-native-helper tile" data-ux-enhance="page-helper">
        <div class="tile-head">
          <span class="status-led is-warn"></span>
          <span class="label">DIAGNOSIS</span>
          <span class="ux-helper-note">从状态判断下一步：修编译、修精度，或继续优化性能。</span>
        </div>
        <div class="ux-diagnosis-grid">
          <a href="/jobs" class="ux-diagnosis-item"><span class="chip is-rose">compile failed</span><strong>先看编译日志</strong><p>依赖、路径、CMake 和 kernel 注册通常先在这里暴露。</p></a>
          <a href="/jobs" class="ux-diagnosis-item"><span class="chip is-amber">case failures</span><strong>找首个失败 case</strong><p>先修正确性，再进入性能比较，避免无效优化。</p></a>
          <a href="/jobs" class="ux-diagnosis-item"><span class="chip is-data">performance</span><strong>对比耗时和产物</strong><p>查看 runner 产物、标准实现和单 case 结果。</p></a>
          <a href="/benchmarks" class="ux-diagnosis-item"><span class="chip is-mint">retry</span><strong>改完后回任务包提交</strong><p>先确认任务版本，再上传新 zip，用 tag 区分优化版本。</p></a>
        </div>
      </div>
    `);
  }

  function leaderboardReadingGuide() {
    return create(`
      <div class="ux-native-helper tile" data-ux-enhance="page-helper">
        <div class="tile-head">
          <span class="status-led is-data"></span>
          <span class="label">READING GUIDE</span>
          <span class="ux-helper-note">普通用户先看排名是否有效，再看单算子和 case 维度。</span>
        </div>
        <div class="ux-leader-grid">
          <div><b>总分</b><span>先判断是否进入有效比较。</span></div>
          <div><b>OPS</b><span>看覆盖了多少算子，避免只看单个高分。</span></div>
          <div><b>CASES</b><span>确认标准/隐藏用例通过率。</span></div>
          <div><b>UPDATED</b><span>找到最近一次有效提交。</span></div>
          <a class="btn is-ghost" href="/benchmarks">选任务提交</a>
        </div>
      </div>
    `);
  }

  function helpersForPath(pathname) {
    if (pathname === "/" || pathname === "") {
      return [
        { node: homeNextStep(), placement: "after-home-hero" },
        { node: homeTrustBand(), placement: "after-home-hero" },
        { node: homeLevelChooser(), placement: "after-home-catalog" },
      ];
    }
    if (pathname.startsWith("/benchmarks")) {
      return [{ node: benchmarkTaskPackage() }];
    }
    if (pathname.startsWith("/submit")) {
      return [{ node: submitPreflight() }];
    }
    if (pathname.startsWith("/jobs")) {
      return [{ node: jobsDiagnosis() }];
    }
    if (pathname.startsWith("/leaderboard")) {
      return [{ node: leaderboardReadingGuide() }];
    }
    if (pathname.startsWith("/updates")) {
      return [{
        node: create(`
          <div class="ux-native-helper tile" data-ux-enhance="page-helper">
            <div class="tile-head">
              <span class="status-led is-data"></span>
              <span class="label">UPDATES</span>
              <span class="ux-helper-note">动态是辅助入口，主要用来确认任务版本、规则变化和维护公告。</span>
            </div>
            <div class="ux-helper-body ux-helper-columns">
              <div><strong>什么时候需要看动态</strong><p>任务包版本变化、排行榜规则调整、runner 维护或平台发布说明。</p></div>
              <div><strong>完成提交时不用先看</strong><p>普通路径仍然是任务包、运行记录、排行榜。</p></div>
            </div>
          </div>
        `)
      }];
    }
    return [];
  }

  function enhance() {
    const shell = findShell();
    if (observer) observer.disconnect();
    try {
      normalizeNav();
      if (!shell || !document.querySelector("#root")) return;

      const key = location.pathname;
      if (state.helperKey !== key) {
        document.querySelectorAll("[data-ux-enhance]").forEach((el) => el.remove());
        let previous = null;
        for (const helper of helpersForPath(location.pathname)) {
          insertPlaced(helper.node, helper.placement, previous);
          previous = helper.node;
        }
        state.helperKey = key;
      }
      enhancePageInternals();
    } finally {
      if (observer) observer.observe(document.documentElement, { childList: true, subtree: true });
    }
  }

  function scheduleEnhance() {
    if (state.scheduled) return;
    state.scheduled = true;
    requestAnimationFrame(() => {
      state.scheduled = false;
      enhance();
    });
  }

  observer = new MutationObserver(() => scheduleEnhance());
  observer.observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener("popstate", () => setTimeout(scheduleEnhance, 50));
  const pushState = history.pushState;
  history.pushState = function () {
    const result = pushState.apply(this, arguments);
    setTimeout(scheduleEnhance, 50);
    return result;
  };
  setTimeout(scheduleEnhance, 400);
})();
