# code-agent-lab

`~/832` workspace 里的 Code Agent CLI 研究工程，也是当前阶段的主任务工程。

当前主线是 Codex CLI 和 opencode：先通过分阶段源码阅读和对照，把 CLI 形态的核心骨架拆清楚，再沉淀可复用模式和小原型。

长期笔记放在 `~/832/os/notes`，在 Obsidian 中阅读和维护。这个仓库的 README 只保留已发布文章链接。

## 边界

本仓库是 `~/832/code-agent-lab` 下的独立子仓库，保留自己的 Git 历史，不并入 `~/832` 根仓库。`~/832` 根目录只维护 workspace 规则、命令和自动化入口。

本仓库只以 Codex CLI 和 opencode 作为 Code Agent CLI 的主要研究样本。其他工具只在必要时作为旁证，不做系统研究。

Codex 桌面端是最终对标对象，Codex CLI 是第一阶段主读样本。opencode 是开放产品型对照，用来帮助看清同一类问题的不同实现方式。

Codex 桌面端和 Cursor 是长期使用的两个 Code Agent，会和我一起探索这个方向；但本仓库的源码主线仍然是 Codex CLI 和 opencode。日常看代码主要使用 Zed，Cursor 在这里主要作为 Agent 协作者。

`codex/` 和 `opencode/` 是本地 clone 的上游源码上下文，已被 `.gitignore` 忽略，不进入本仓库提交。

## 路线

1. Phase 1：主读 Codex CLI，抽出工程骨架。
2. Phase 2：用 opencode 对照同一张架构表，避免只学到 Codex 的表层形态。
3. Phase 3：总结可复用模式，做一个 mini code agent CLI 原型。
4. Phase 4：回看 Codex 桌面端和日常 Agent 协作体验，判断 CLI 到桌面端 / 编辑器协作形态的演进方式。
5. Phase 5：回到 Codex 桌面端，对标它的产品能力和工程取舍。

## 关注问题

- CLI / TUI 入口怎么组织
- Session 和 Context 怎么管理
- Model Client 和 Agent Loop 怎么串起来
- Tool Registry、Shell、File、Patch 怎么设计
- Approval、Sandbox、权限确认怎么落地
- Diff、测试结果、日志和持久化怎么反馈给用户

## 目录

```bash
prototypes/                 # 用小原型验证架构理解
  mini-code-agent-cli/
```

## Notes

- [130. opencode 工程概览与技术栈分析](https://liguwe.site/blog/130)
- [129. codex-cli 工程概览及技术栈分析](https://liguwe.site/blog/129)

## 当前下一步

Phase 1：Read Codex CLI and extract the core Code Agent CLI architecture.
