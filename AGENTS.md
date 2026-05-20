# Agent 协作说明

这个仓库是 `~/832` workspace 的一部分，用于和 Codex Desktop、Cursor、Claude Code 等 Agent 一起建设 `general-agent-lab`：通用 Agent 实验台。进入本仓库后，先读 `README.md`，再读本文件；需要 workspace 总体边界时，再读 `/Users/liguwe/832/README.md` 和 `/Users/liguwe/832/AGENTS.md`。

## 当前目标

`general-agent-lab` 是未来一段时间的唯一主线。CLI 不是终局，是入口。

当前先把 Codex CLI 和 opencode 这两个源码样本读清楚，抽出 Code Agent CLI 的核心骨架，再把可复用模式放进一个能跑的 `mini-code-agent-cli` 原型里。最终要回答的是：怎么做 `General Agent Product`。

不要一上来做大而全的竞品分析，也不要把所有 AI 编程工具都纳入主线。这个仓库的重点是源码阅读、架构拆解、对照表、短 notes 和小原型。

## 研究边界

- `codex/`：OpenAI Codex 源码，本仓库第一阶段主读对象。
- `opencode/`：anomalyco/opencode 源码，用来对照另一种开放产品型实现。
- Codex Desktop：重要对标对象，但不是现在一上来研究 GUI 的理由。
- Cursor、Claude Code：日常 Agent 使用经验来源，只在具体问题上作为产品判断旁证。

## 本地目录约定

`codex/` 和 `opencode/` 是 clone 下来的上游源码目录，只作为阅读上下文，已经被 `.gitignore` 忽略。

因此：

- 不要把这两个目录的源码提交到本仓库。
- 不要随手修改上游源码；除非任务明确要求做实验 patch。
- 搜索源码时要绕过 ignore 规则，例如：

```bash
rg --no-ignore "Agent" codex opencode
rg --no-ignore "approval" codex
rg --no-ignore "tool" opencode
```

`~/832` 的根仓库会通过 `.gitignore` 忽略本仓库目录；不要把本仓库源码、`codex/` 或 `opencode/` 混入 832 根仓库提交。

## 输出物优先级

优先把研究结果沉淀到这些位置：

```text
README.md # notes / 文章索引，按最新在前倒序维护所有链接
prototypes/
  mini-code-agent-cli/
```

这个工程最终交付的不是一份大报告，而是一批持续累积的 notes / 文章，以及一个能跑的小原型。每写完一篇相关文章，都要把链接补进 `README.md` 的 `Notes` 区，并保持最新文章在最上面。README 是这个工程的研究产出索引，不只是一份项目介绍。

README 中的链接使用倒序列表，并尽量带上文章编号，例如：

```markdown
## Notes

- [130. opencode 工程概览与技术栈分析](https://liguwe.site/blog/130)
- [129. codex-cli 工程概览及技术栈分析](https://liguwe.site/blog/129)
- [128. 接下来的主线：general-agent-lab](https://liguwe.site/blog/128)
```

笔记要短而清楚，尽量写“发现了什么、证据在哪、这对 mini agent 和 General Agent Product 有什么启发”，不要只摘抄源码。

## 阅读方式

读源码时优先回答这些问题：

- CLI / TUI 入口在哪里，命令如何分发。
- Session、Thread、Context 这类长期状态怎么建模。
- Model Client 和 Agent Loop 如何连接。
- Tool Registry、Shell、File、Patch 等工具如何注册和调用。
- Approval、Sandbox、权限确认如何落地。
- Diff、测试结果、日志和持久化如何反馈给用户。
- 这些工程模式对通用 Agent 产品有什么启发。

对每个主题，尽量同时给出 Codex 和 opencode 的对照。不要只写结论，要标出关键文件路径和函数名。

## 协作原则

- 小步推进：一次只拆一个主题，不要同时展开太多方向。
- 证据优先：先读真实源码、命令输出或产品行为，再总结。
- 保持边界：当前入口是 Codex CLI 和 opencode，其他工具只在具体问题上作为旁证。
- 原型优先：没有进入原型和判断的阅读，就是耗散。
- 少做抽象空话：尽量落到具体模块、数据结构、调用链、交互细节。
- 不改无关文件：如果只是写笔记，不要顺手格式化或重构源码。

## 给 Agent 协作者的特别提醒

Codex Desktop、Cursor、Claude Code 都是这个方向里的日常 Agent 协作者。日常看代码主要使用 Zed；Cursor 在这里主要作为 Agent 协作者。Codex 更适合执行跨文件搜索、整理对照表、生成笔记和搭小原型。

无论使用哪个工具，都先确认当前任务属于哪一类：

- 读源码：输出关键路径和简短解释。
- 做对照：输出 Codex vs opencode 的表格或分节笔记。
- 写总结：输出可以长期保留的研究笔记。
- 做原型：只实现最小可验证版本，并说明它对应哪一个源码模式。
- 做产品判断：回到 `General Agent Product`，说明这个判断来自哪段源码、哪次原型或哪种日常 Agent 体验。
