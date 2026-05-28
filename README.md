# general-agent-lab

`~/832` workspace 里的通用 Agent 实验台，也是未来一段时间的唯一主线。

CLI 不是终局，是入口。当前先主读 Codex CLI，用 opencode 做对照，把 CLI 形态的核心骨架拆清楚；中间沉淀短 notes 和能跑的 `mini-code-agent-cli`；最后回到 `General Agent Product`，回答通用 Agent 产品到底怎么做。

这个工程的主要产出是一批持续累积的 notes / 文章，以及一个能跑的小原型。README 的 `Docs` 区负责维护本地工程说明，`Notes` 区负责维护研究 notes / 文章链接，并按最新在前倒序排列。

## 边界

本仓库是 `~/832/general-agent-lab` 下的独立子仓库，保留自己的 Git 历史，不并入 `~/832` 根仓库。`~/832` 根目录只维护 workspace 规则、命令和自动化入口。

本仓库不是泛泛的 Agent 生态综述，也不追逐所有工具。当前研究入口只看 Codex CLI 和 opencode：Codex CLI 是第一阶段主读样本，opencode 是开放产品型对照，用来帮助看清同一类问题的不同实现方式。

Codex Desktop 是重要对标对象，也是当前看到的顶级模型超级产品形态；但它不是现在一上来研究 GUI 的理由。先把 CLI 模式吃透，再回看 Codex Desktop、Cursor、Claude Code 这类日常 Agent 产品，判断 CLI 到桌面端 / 编辑器协作形态的演进方式。

`codex/` 和 `opencode/` 是源码阅读上下文，以 Git submodule 形式接入本仓库。主工程只记录 submodule 指针；源码更新、少量贴近源码的说明文档，提交到对应 fork 后再更新主工程指针。

## 路径

这条主线以 [128. 接下来的主线：general-agent-lab](https://liguwe.site/blog/128) 为准：

- 先读：主读 `Codex CLI`，用 `opencode` 做对照。
- 再做：把可复用模式塞进 `mini-code-agent-cli`，一定要能跑通。
- 最后回到 `general-agent-lab`：对照 `Codex Desktop` 等日常 Agent 产品，回答怎么做 `General Agent Product`。

## 结果

```bash
prototypes/                 # 用小原型验证架构理解
  mini-code-agent-cli/
```

- 第一类结果：notes。每篇只回答一个主题：发现了什么、证据在哪、对 mini agent 有什么启发。
- 第二类结果：`mini-code-agent-cli` 原型。它不用大，但必须能跑。

这里不是资料馆，是实验台，是动手。没有进入原型和判断的阅读，就是耗散。

## Docs

- [2. submodule 工作流说明](docs/2.%20submodule%20工作流说明.md)
- [1. codex 项目目录说明](docs/1.%20codex%20项目目录说明.md)

## Notes

- [135. 播客：探秘 Claude Code，搞懂 Agent Harness](https://liguwe.site/blog/135)
- [130. opencode 工程概览与技术栈分析](https://liguwe.site/blog/130)
- [129. codex-cli 工程概览及技术栈分析](https://liguwe.site/blog/129)
- [128. 接下来的主线：general-agent-lab](https://liguwe.site/blog/128)

## 当前下一步

先跑通 `mini-code-agent-cli` 的最小骨架，同时继续主读 Codex CLI、用 opencode 对照。
