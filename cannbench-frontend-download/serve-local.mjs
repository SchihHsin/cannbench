import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { createReadStream, existsSync } from "node:fs";
import { extname, join, normalize, resolve } from "node:path";

const root = resolve(new URL(".", import.meta.url).pathname, "public");
const port = Number(process.env.PORT || 4173);
const upstream = "https://cannbench.com";
const loggedInReplay = process.env.LOGGED_IN_REPLAY !== "0";

const replayUser = {
  user_id: "u_gc_468a109dc5158cd2",
  username: "xchang1121",
  display_username: "xchang1121",
  gitcode_username: "xchang1121",
  role: "user",
  created_at: "2026-06-29T03:20:05Z",
};

const replayJobs = [
  {
    id: "job_live4603ea2e",
    job_id: "job_live4603ea2e",
    submission_id: "sub_live4603ea2e",
    user_id: "u_gc_468a109dc5158cd2",
    display_user: "xchang1121",
    benchmark_slug: "official-tasks",
    benchmark_name: "Official-Tasks",
    benchmark_version: "0.3.0",
    target_hardware: "910c",
    hardware: "910c",
    operator_names: ["ForeachAddcdivScalar", "ApplyRotaryPosEmb"],
    status: "performance",
    runner_id: "local-910c-runner",
    result_score: null,
    passed_cases: null,
    total_cases: 340,
    queued_at: "2026-07-04T15:07:00Z",
    has_results: false,
  },
  {
    id: "job_4603ea2e77c8",
    job_id: "job_4603ea2e77c8",
    submission_id: "sub_4603ea2e77c8",
    user_id: "u_gc_468a109dc5158cd2",
    display_user: "xchang1121",
    benchmark_slug: "official-tasks",
    benchmark_name: "Official-Tasks",
    benchmark_version: "0.3.0",
    target_hardware: "910c",
    hardware: "910c",
    operator_names: ["ForeachAddcdivScalar", "ApplyRotaryPosEmb"],
    status: "case_failures",
    result_score: 4,
    passed_cases: 0,
    total_cases: 340,
    queued_at: "2026-07-04T14:20:00Z",
    has_results: true,
  },
  {
    id: "job_22ac6f188d5b",
    job_id: "job_22ac6f188d5b",
    submission_id: "sub_22ac6f188d5b",
    user_id: "u_gc_468a109dc5158cd2",
    display_user: "xchang1121",
    benchmark_slug: "official-tasks",
    benchmark_name: "Official-Tasks",
    benchmark_version: "0.3.0",
    target_hardware: "910c",
    hardware: "910c",
    operator_names: ["ForeachAddcdivScalar", "ApplyRotaryPosEmb"],
    status: "case_failures",
    result_score: 4,
    passed_cases: 0,
    total_cases: 340,
    queued_at: "2026-07-04T13:45:00Z",
    has_results: true,
  },
  {
    id: "job_b24ced66c522",
    job_id: "job_b24ced66c522",
    submission_id: "sub_b24ced66c522",
    user_id: "u_gc_468a109dc5158cd2",
    display_user: "xchang1121",
    benchmark_slug: "official-tasks",
    benchmark_name: "Official-Tasks",
    benchmark_version: "0.3.0",
    target_hardware: "910c",
    hardware: "910c",
    operator_names: ["ForeachAddcdivScalar", "ApplyRotaryPosEmb"],
    status: "compile_failed",
    error_code: "COMPILE_ERROR",
    result_score: null,
    passed_cases: 0,
    total_cases: 360,
    queued_at: "2026-07-04T12:50:00Z",
    has_results: false,
  },
  {
    id: "job_d9ea7b342c96",
    job_id: "job_d9ea7b342c96",
    submission_id: "sub_d9ea7b342c96",
    user_id: "u_gc_b9608711dcffda39",
    display_user: "vINyLogY",
    benchmark_slug: "official-tasks",
    benchmark_name: "Official-Tasks",
    benchmark_version: "0.3.0",
    target_hardware: "910c",
    hardware: "910c",
    operator_names: ["UnsortedSegmentSum"],
    status: "succeeded",
    result_score: 56.71,
    passed_cases: 20,
    total_cases: 20,
    queued_at: "2026-07-03T11:12:00Z",
    has_results: true,
  },
  {
    id: "job_a76d29a93a8a",
    job_id: "job_a76d29a93a8a",
    submission_id: "sub_a76d29a93a8a",
    user_id: "u_gc_1a39da818f3757b0",
    display_user: "lu-zhirui",
    benchmark_slug: "official-tasks",
    benchmark_name: "Official-Tasks",
    benchmark_version: "0.3.0",
    target_hardware: "950pr",
    hardware: "950pr",
    operator_names: ["ForeachAddcdivScalar", "SwiGlu", "ApplyAdamW"],
    status: "case_failures",
    result_score: 891.65,
    passed_cases: 271,
    total_cases: 320,
    queued_at: "2026-07-03T10:05:00Z",
    has_results: true,
  },
  {
    id: "job_4202bfd110d7",
    job_id: "job_4202bfd110d7",
    submission_id: "sub_4202bfd110d7",
    user_id: "u_gc_b9608711dcffda39",
    display_user: "vINyLogY",
    benchmark_slug: "official-tasks",
    benchmark_name: "Official-Tasks",
    benchmark_version: "0.3.0",
    target_hardware: "910c",
    hardware: "910c",
    operator_names: ["ResizeBilinear"],
    status: "case_failures",
    result_score: 38.7,
    passed_cases: 12,
    total_cases: 20,
    queued_at: "2026-07-03T08:34:00Z",
    has_results: true,
  },
];

const benchmarkSlug = "offical-tasks";
const benchmarkAliases = new Set([benchmarkSlug, "official-tasks"]);
const benchmarkOperators = [
  { operator: "Exp", rel_path: "level1/exp", level: "level1", category: "Elementwise", difficulty: "L1", description: "计算输入张量的指数函数，适合作为第一次跑通流程的任务。", note: "", case_count: 20, has_description: true },
  { operator: "ForeachAddcdivScalar", rel_path: "level1/foreach_addcdiv_scalar", level: "level1", category: "FusedComposite", difficulty: "L1", description: "对多个张量进行逐元素加、乘、除操作。", note: "", case_count: 20, has_description: true },
  { operator: "SwiGlu", rel_path: "level1/swi_glu", level: "level1", category: "Elementwise", difficulty: "L1", description: "标准 SwiGLU 激活，常用于 transformer 前馈网络。", note: "", case_count: 20, has_description: true },
  { operator: "ApplyAdamW", rel_path: "level2/apply_adam_w", level: "level2", category: "FusedComposite", difficulty: "L2", description: "AdamW 优化器实现，适合验证融合与内存访问策略。", note: "", case_count: 20, has_description: true },
  { operator: "ApplyRotaryPosEmb", rel_path: "level2/apply_rotary_pos_emb", level: "level2", category: "FusedComposite", difficulty: "L2", description: "对 query 和 key 执行 RoPE 计算。", note: "", case_count: 20, has_description: true },
  { operator: "DynamicQuant", rel_path: "level2/dynamic_quant", level: "level2", category: "FusedComposite", difficulty: "L2", description: "per-token 对称动态量化。", note: "", case_count: 20, has_description: true },
  { operator: "ResizeBilinear", rel_path: "level3/resize_bilinear", level: "level3", category: "Vision", difficulty: "L3", description: "双线性插值，适合观察 shape 与访存边界。", note: "", case_count: 20, has_description: true },
  { operator: "UnsortedSegmentSum", rel_path: "level3/unsorted_segment_sum", level: "level3", category: "Reduction", difficulty: "L3", description: "非排序分段求和，正确性和性能都较敏感。", note: "", case_count: 20, has_description: true },
  { operator: "PagedAttention", rel_path: "level4/paged_attention", level: "level4", category: "LLMServing", difficulty: "L4", description: "面向推理服务的高阶注意力任务。", note: "", case_count: 20, has_description: true },
];

const replayBenchmark = {
  slug: benchmarkSlug,
  name: "Official-Tasks",
  category: "multi",
  tags: ["multi", "lv1", "lv2", "lv3", "lv4"],
  versions: [
    {
      version: "0.3.0",
      title: "Official-Tasks",
      description: "CANN-Bench 官方公开任务包，本地复刻使用精简数据。",
      difficulty: "multi",
      operator_type: "multi",
      created_at: "2026-06-25T13:33:58.394127",
    },
  ],
  latest_version: "0.3.0",
  operator_count: 53,
  level_count: 4,
  total_case_count: 1060,
  difficulty: "multi",
  operator_type: "multi",
  description: "覆盖 Level 1 到 Level 4 的 Ascend NPU 算子 kernel 评测任务包。",
  operator: null,
  multi_operators: benchmarkOperators,
  cases: [
    { operator: "Exp", case_id: 1, input_shape: [[1024, 1024]], dtype: ["float16"], attrs: { base: -1, scale: 1, shift: 0 }, value_range: [-1, 1], note: "S-float16-1M-对齐-对称小值域" },
    { operator: "Exp", case_id: 2, input_shape: [[2048, 2048]], dtype: ["float32"], attrs: { base: -1, scale: 1.5, shift: 0 }, value_range: [-2, 2], note: "M-float32-4M-对齐-对称小值域" },
    { operator: "ApplyRotaryPosEmb", case_id: 1, input_shape: [[32, 128, 128]], dtype: ["float16"], attrs: { layout: "BSH" }, value_range: [-1, 1], note: "RoPE 基础正确性样例" },
  ],
  api_description_md: "## API 描述\n\n本地复刻保留任务包结构、Level、算子列表和提交入口。真实评测请以线上任务包为准。",
  reference_url: "https://gitcode.com/cann/cann-bench",
  bundle_url: "/api/benchmarks/offical-tasks/bundle",
  has_bundle: true,
};

const replaySubsets = [
  { id: "bss_offical-tasks_level_1", benchmark_slug: benchmarkSlug, slug: "level-1", title: "Level 1 子集", description_md: "适合第一次提交，重点确认目录、编译和 case 通过。", kind: "by_level", is_system: true, is_hidden: false, visible_on_eval_page: true, visible_in_leaderboard: true, levels: ["level1"], operators: [], selection: { levels: ["level1"], operators: [] } },
  { id: "bss_offical-tasks_level_2", benchmark_slug: benchmarkSlug, slug: "level-2", title: "Level 2 子集", description_md: "适合开始优化融合算子和常见训练相关操作。", kind: "by_level", is_system: true, is_hidden: false, visible_on_eval_page: true, visible_in_leaderboard: true, levels: ["level2"], operators: [], selection: { levels: ["level2"], operators: [] } },
  { id: "bss_offical-tasks_level_3", benchmark_slug: benchmarkSlug, slug: "level-3", title: "Level 3 子集", description_md: "适合对比更复杂 shape、访存与规约路径。", kind: "by_level", is_system: true, is_hidden: false, visible_on_eval_page: true, visible_in_leaderboard: true, levels: ["level3"], operators: [], selection: { levels: ["level3"], operators: [] } },
  { id: "bss_offical-tasks_level_4", benchmark_slug: benchmarkSlug, slug: "level-4", title: "Level 4 子集", description_md: "适合冲击高阶排名和推理服务相关任务。", kind: "by_level", is_system: true, is_hidden: false, visible_on_eval_page: true, visible_in_leaderboard: true, levels: ["level4"], operators: [], selection: { levels: ["level4"], operators: [] } },
];

const replayLeaderboard = [
  { id: "sol_9d1b733ffe2a5638", leaderboard_mode: "solution", user_id: "u_gc_b9608711dcffda39", display_user: "vINyLogY", benchmark_slug: benchmarkSlug, benchmark_version: "0.3.0", benchmark_version_source: "0.3.0", benchmark_version_sources: ["0.3.0"], score: "2673.2601", standard_score: 2673.2600646271308, hidden_score: 0, has_hidden_eval: false, correctness_passed: false, metric: { score_version: "cann-bench-eq4-v1", hardware: "910c", total_operators: 53, total_cases: 1060, passed_cases: 950, geometric_mean_speedup: 0.072, overall_score: 2673.2600646271308 } },
  { id: "sol_a76d29a93a8a", leaderboard_mode: "solution", user_id: "u_gc_1a39da818f3757b0", display_user: "lu-zhirui", benchmark_slug: benchmarkSlug, benchmark_version: "0.3.0", benchmark_version_source: "0.3.0", benchmark_version_sources: ["0.3.0"], score: "891.6500", standard_score: 891.65, hidden_score: 0, has_hidden_eval: false, correctness_passed: false, metric: { score_version: "cann-bench-eq4-v1", hardware: "950pr", total_operators: 53, total_cases: 1060, passed_cases: 271, geometric_mean_speedup: 0.038, overall_score: 891.65 } },
  { id: "sol_4202bfd110d7", leaderboard_mode: "solution", user_id: "u_gc_b9608711dcffda39", display_user: "vINyLogY", benchmark_slug: benchmarkSlug, benchmark_version: "0.3.0", benchmark_version_source: "0.3.0", benchmark_version_sources: ["0.3.0"], score: "56.7100", standard_score: 56.71, hidden_score: 0, has_hidden_eval: false, correctness_passed: true, metric: { score_version: "cann-bench-eq4-v1", hardware: "910c", total_operators: 1, total_cases: 20, passed_cases: 20, geometric_mean_speedup: 0.11, overall_score: 56.71 } },
];

const replayArticles = [
  {
    id: "blog_introducing_cann_bench",
    slug: "introducing-cann-bench",
    title_en: "Introducing CANN Bench",
    title_zh: "CANN Bench 介绍",
    summary_en: "A concise overview of CANN Bench task packets, scoring, correctness checks, and evaluator integrity.",
    summary_zh: "介绍 CANN Bench 的任务包、评分、正确性校验和评测可信边界。",
    body_en: "CANN Bench helps developers compare Ascend NPU operator kernel implementations with repeatable task packets and hardware-backed runs.",
    body_zh: "CANN Bench 帮助开发者基于任务包、真实硬件运行记录和排行榜，比较 Ascend NPU 算子 kernel 实现。",
    published: true,
    published_at: "2026-06-30T00:00:00",
    created_at: "2026-06-30T12:10:49.531381",
    updated_at: "2026-06-30T12:10:49.531391",
    created_by: "seed",
    updated_by: "seed",
  },
  {
    id: "blog_micro_bench_subsets",
    slug: "micro-bench-subsets",
    title_en: "Micro Bench and Subset Leaderboards",
    title_zh: "Micro Bench 与子集排行榜",
    summary_en: "Subset leaderboards make it easier to compare attempts within one task family.",
    summary_zh: "子集排行榜让用户更容易按 Level 和任务族比较提交结果。",
    body_en: "Use subset leaderboards when a full benchmark score is too broad for debugging.",
    body_zh: "当总榜过宽时，可以先用子集榜定位 Level、算子和硬件口径。",
    published: true,
    published_at: "2026-07-02T00:00:00",
    created_at: "2026-07-02T10:00:00",
    updated_at: "2026-07-02T10:00:00",
    created_by: "seed",
    updated_by: "seed",
  },
];

const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".json": "application/json; charset=utf-8",
};

function emptyApi(res, pathname) {
  if (pathname.startsWith("/api/admin/")) {
    json(res, 200, { ok: true, items: [], users: [], articles: [], benchmarks: [], features: {}, replay: true });
    return true;
  }
  if (pathname.includes("/leaderboard")) {
    json(res, 200, { entries: [] });
    return true;
  }
  if (pathname.includes("/subsets")) {
    json(res, 200, { subsets: [] });
    return true;
  }
  json(res, 404, { error: "Not available in local replay.", path: pathname });
  return true;
}

function staticPath(urlPath) {
  const clean = decodeURIComponent(urlPath.split("?")[0]);
  const target = normalize(join(root, clean));
  if (!target.startsWith(root)) return null;
  return target;
}

function json(res, status, body) {
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  });
  res.end(JSON.stringify(body));
}

function mockApi(req, res, pathname) {
  if (!loggedInReplay) return false;

  if (pathname === "/api/auth/me") {
    json(res, 200, replayUser);
    return true;
  }

  if (pathname === "/api/auth/tokens") {
    json(res, 200, {
      tokens: [
        {
          id: "local-token-preview",
          name: "Agent CLI",
          token_prefix: "cb_local",
          created_at: "2026-07-04T15:00:00Z",
          expires_at: null,
          last_used_at: null,
          is_expired: false,
        },
      ],
    });
    return true;
  }

  if (pathname === "/api/auth/cli-token") {
    json(res, 200, { token: "LOCAL_REPLAY_TOKEN_NOT_FOR_PRODUCTION" });
    return true;
  }

  if (pathname === "/api/auth/logout") {
    json(res, 200, { ok: true, replay: true });
    return true;
  }

  if (pathname === "/api/submissions/credits") {
    json(res, 200, {
      credits: {
        unlimited: true,
        remaining: 999,
        effective_limit: 999,
        base_remaining: 999,
        base_credits: 999,
        bonus_counted: 0,
        resets_at: "2026-07-05T00:00:00+08:00",
      },
    });
    return true;
  }

  if (pathname === "/api/benchmarks") {
    json(res, 200, { benchmarks: [replayBenchmark] });
    return true;
  }

  if (pathname.startsWith("/api/benchmarks/")) {
    const [, , , slug, subresource, subsetSlug, nestedResource] = pathname.split("/");
    if (!benchmarkAliases.has(slug)) return false;

    if (!subresource) {
      const url = new URL(req.url || "/", `http://localhost:${port}`);
      const operator = url.searchParams.get("operator");
      const benchmark = { ...replayBenchmark };
      if (operator) {
        benchmark.operator = benchmarkOperators.find((item) => item.operator === operator) || null;
        benchmark.cases = replayBenchmark.cases.filter((item) => item.operator === operator);
      }
      json(res, 200, { benchmark });
      return true;
    }

    if (subresource === "subsets") {
      if (!subsetSlug) {
        json(res, 200, { subsets: replaySubsets });
        return true;
      }
      const subset = replaySubsets.find((item) => item.slug === subsetSlug);
      if (!subset) {
        json(res, 404, { error: "Subset not found in local replay." });
        return true;
      }
      if (nestedResource === "leaderboard") {
        json(res, 200, { entries: replayLeaderboard });
        return true;
      }
      json(res, 200, { subset });
      return true;
    }

    if (subresource === "api-description") {
      res.writeHead(200, { "content-type": "text/markdown; charset=utf-8", "cache-control": "no-store" });
      res.end(replayBenchmark.api_description_md);
      return true;
    }

    if (subresource === "reference" || subresource === "bundle") {
      res.writeHead(200, { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" });
      res.end("Local replay placeholder. Use the live site to download the real benchmark bundle.");
      return true;
    }
  }

  if (pathname === "/api/leaderboard") {
    json(res, 200, { entries: replayLeaderboard });
    return true;
  }

  if (pathname === "/api/blog/articles") {
    json(res, 200, { articles: replayArticles });
    return true;
  }

  if (pathname.startsWith("/api/blog/articles/")) {
    const slug = decodeURIComponent(pathname.split("/").pop() || "");
    const article = replayArticles.find((item) => item.slug === slug);
    json(res, article ? 200 : 404, article ? { article } : { error: "Article not found in local replay." });
    return true;
  }

  if (pathname === "/api/jobs") {
    const url = new URL(req.url || "/", `http://localhost:${port}`);
    const status = url.searchParams.get("status");
    const search = (url.searchParams.get("search") || "").trim().toLowerCase();
    const userId = url.searchParams.get("user_id");
    const minScore = url.searchParams.has("min_score") ? Number(url.searchParams.get("min_score")) : null;
    const maxScore = url.searchParams.has("max_score") ? Number(url.searchParams.get("max_score")) : null;
    const sort = url.searchParams.get("sort") || "queued_desc";
    const limit = Number(url.searchParams.get("limit") || 20);
    const offset = Number(url.searchParams.get("offset") || 0);

    let jobs = replayJobs.filter((job) => {
      if (status && job.status !== status) return false;
      if (userId && job.user_id !== userId) return false;
      if (Number.isFinite(minScore) && (job.result_score ?? -Infinity) < minScore) return false;
      if (Number.isFinite(maxScore) && (job.result_score ?? Infinity) > maxScore) return false;
      if (search) {
        const haystack = [
          job.id,
          job.display_user,
          job.user_id,
          job.benchmark_slug,
          job.benchmark_name,
          ...(job.operator_names || []),
        ].join(" ").toLowerCase();
        if (!haystack.includes(search)) return false;
      }
      return true;
    });

    jobs = jobs.sort((a, b) => {
      if (sort === "queued_asc") return new Date(a.queued_at) - new Date(b.queued_at);
      if (sort === "score_desc") return (b.result_score ?? -Infinity) - (a.result_score ?? -Infinity);
      if (sort === "score_asc") return (a.result_score ?? Infinity) - (b.result_score ?? Infinity);
      if (sort === "user_asc") return String(a.display_user).localeCompare(String(b.display_user));
      return new Date(b.queued_at) - new Date(a.queued_at);
    });

    json(res, 200, { total: jobs.length, jobs: jobs.slice(offset, offset + limit) });
    return true;
  }

  if (pathname === "/api/jobs/summary") {
    json(res, 200, {
      total: replayJobs.length,
      queued: replayJobs.filter((job) => ["queued", "preparing", "compiling", "correctness", "performance", "archiving"].includes(job.status)).length,
      running: replayJobs.filter((job) => ["preparing", "compiling", "correctness", "performance", "archiving"].includes(job.status)).length,
      succeeded: replayJobs.filter((job) => job.status === "succeeded").length,
      failed: replayJobs.filter((job) => ["compile_failed", "correctness_failed", "performance_failed", "infra_error"].includes(job.status)).length,
    });
    return true;
  }

  if (pathname.startsWith("/api/jobs/")) {
    const [, , , jobId, subresource] = pathname.split("/");
    const job = replayJobs.find((item) => item.id === jobId || item.job_id === jobId);
    if (!job) {
      json(res, 404, { error: "Job not found in local replay." });
      return true;
    }
    if (!subresource) {
      json(res, 200, { job });
      return true;
    }
    if (subresource === "logs") {
      json(res, 200, {
        stages: [
          { stage: "compile", status: job.status === "compile_failed" ? "failed" : "succeeded", log: "Local replay compile log." },
          { stage: "correctness", status: job.status === "case_failures" ? "warning" : "succeeded", log: "Local replay correctness log." },
          { stage: "performance", status: job.status === "succeeded" ? "succeeded" : "skipped", log: "Local replay performance log." },
        ],
      });
      return true;
    }
    if (subresource === "artifacts") {
      json(res, 200, { artifacts: [{ name: "summary.json", size_bytes: 2048 }, { name: "runner.log", size_bytes: 8192 }] });
      return true;
    }
  }

  if (pathname === "/api/meta/target-hardware") {
    json(res, 200, {
      hardware: ["910c", "950pr"],
      devices: [
        { hardware: "910c", label: "910C", online: true, online_runner_count: 1 },
        { hardware: "950pr", label: "950PR", online: true, online_runner_count: 1 },
      ],
    });
    return true;
  }

  if (pathname === "/api/meta/runners") {
    json(res, 200, {
      runners: [
        {
          name: "local-910c-runner",
          hardware: "910c",
          hardware_label: "910C",
          online: true,
          sandbox: true,
          last_seen_seconds_ago: 12,
          ref: "local-replay",
        },
        {
          name: "local-950pr-runner",
          hardware: "950pr",
          hardware_label: "950PR",
          online: true,
          sandbox: true,
          last_seen_seconds_ago: 18,
          ref: "local-replay",
        },
      ],
    });
    return true;
  }

  if (pathname === "/api/meta/site-features" || pathname === "/api/admin/site-features") {
    json(res, 200, { features: { updates_page_visible: true } });
    return true;
  }

  if (pathname === "/api/meta/maintenance" || pathname === "/api/admin/maintenance") {
    json(res, 200, { maintenance: { enabled: false, mode: "off", message: "" } });
    return true;
  }

  if (pathname === "/api/meta/default-benchmark") {
    json(res, 200, { slug: benchmarkSlug, name: "Official-Tasks", latest_version: "0.3.0" });
    return true;
  }

  if (pathname === "/api/meta/cann-bench-repo") {
    json(res, 200, {
      repo: "cann/cann-bench",
      url: "https://gitcode.com/cann/cann-bench",
      fetched_at: "2026-07-06T03:31:25.084408Z",
      cache_ttl_seconds: 900,
      stale: false,
      contributors_count: 144,
      source: "local_replay",
      cached: true,
    });
    return true;
  }

  if (pathname === "/api/meta/submission-policy" || pathname === "/api/admin/submission-policy") {
    json(res, 200, {
      policy: {
        base_credits: 0,
        bonus_cap: 10,
        max_active_jobs_per_user: 3,
        updated_at: "2026-07-02T10:17:39.369409",
        updated_by: "local_replay",
      },
    });
    return true;
  }

  if (pathname === "/api/meta/submission-tag-parts") {
    json(res, 200, {
      agents: ["CANNBot", "SIMT", "Manual"],
      harnesses: ["Opencode", "NoHarness"],
      models: ["Qwen3.7-max", "Deepseek-v4-pro", "glm5.2"],
    });
    return true;
  }

  if (pathname === "/api/admin/users") {
    json(res, 200, {
      users: [
        {
          ...replayUser,
          submission_daily_quota: -1,
          credit: { unlimited: true, base_remaining: 999, base_credits: 999, bonus_counted: 0 },
        },
        {
          user_id: "u_gc_468a109dc5158cd2",
          username: "xchang1121",
          gitcode_username: "xchang1121",
          role: "user",
          created_at: "2026-06-25T06:42:15Z",
          submission_daily_quota: 10,
          credit: { unlimited: false, base_remaining: 3, base_credits: 10, bonus_counted: 0, resets_at: "2026-07-05T00:00:00+08:00" },
        },
        {
          user_id: "u_gc_c82927cccd602d608",
          username: "guankar1",
          gitcode_username: "guankar1",
          role: "user",
          created_at: "2026-06-27T06:40:29Z",
          submission_daily_quota: 10,
          credit: { unlimited: false, base_remaining: 10, base_credits: 10, bonus_counted: 9, resets_at: "2026-07-05T00:00:00+08:00" },
        },
        {
          user_id: "u_gc_28f1949424d0480f",
          username: "su-yueming",
          gitcode_username: "su-yueming",
          role: "admin",
          created_at: "2026-06-15T21:11:20Z",
          submission_daily_quota: -1,
          credit: { unlimited: true, base_remaining: 999, base_credits: 999, bonus_counted: 0 },
        },
      ],
    });
    return true;
  }

  return false;
}

createServer(async (req, res) => {
  const requestUrl = req.url || "/";
  const requestPath = new URL(requestUrl, `http://localhost:${port}`).pathname;

  if (requestPath === "/ux-enhance.js") {
    res.writeHead(200, {
      "content-type": "text/javascript; charset=utf-8",
      "cache-control": "no-store, no-cache, must-revalidate, max-age=0",
      "pragma": "no-cache",
      "expires": "0",
    });
    res.end("/* disabled: stable local replay */\n");
    return;
  }

  if (requestPath === "/ux-enhance.css") {
    res.writeHead(200, {
      "content-type": "text/css; charset=utf-8",
      "cache-control": "no-store, no-cache, must-revalidate, max-age=0",
      "pragma": "no-cache",
      "expires": "0",
    });
    res.end("/* disabled: stable local replay */\n");
    return;
  }

  if ((req.url || "").startsWith("/api/")) {
    const { pathname } = new URL(req.url || "/", `http://localhost:${port}`);
    if (mockApi(req, res, pathname)) return;

    emptyApi(res, pathname);
    return;
  }

  const target = staticPath(req.url || "/");
  const file = target && existsSync(target) && !target.endsWith("/") ? target : join(root, "index.html");
  const type = types[extname(file)] || "application/octet-stream";

  try {
    await readFile(file, { flag: "r" });
    res.writeHead(200, {
      "content-type": type,
      "cache-control": "no-store, no-cache, must-revalidate, max-age=0",
      "pragma": "no-cache",
      "expires": "0",
    });
    createReadStream(file).pipe(res);
  } catch {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    res.end("Not found");
  }
}).listen(port, () => {
  console.log(`CANN Bench frontend is running at http://localhost:${port}/`);
  console.log(`Logged-in replay: ${loggedInReplay ? "on" : "off"}`);
});
