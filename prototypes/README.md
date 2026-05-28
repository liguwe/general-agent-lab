# prototypes

这里放每日最小可运行原型。

原型的目的不是复刻 Codex 或 opencode，而是抽丝剥茧地拆一层源码模式，用最小实现验证它是否成立。每天至少产出一个能本地跑起来的小切片。

## 命名

每日原型目录使用三位递增编号 + 主题：

```text
NNN-<topic>/
```

`NNN` 从 `001` 开始递增，`<topic>` 使用短英文 kebab-case，例如：

```text
001-cli-entry/
002-tool-registry/
003-approval-flow/
```

“抽丝剥茧”是工作方法，不进入目录命名。

## 最小标准

每个原型至少包含：

- `README.md`
- 一个可执行入口
- 一条能本地执行的 demo 命令

每个原型的 README 至少说明：

- 今天拆的是哪一层。
- 参考了 Codex / opencode 的哪些源码路径或函数。
- 如何运行。
- 当前只验证什么，不验证什么。

## 和 mini-code-agent-cli 的关系

每日原型优先独立可运行。`mini-code-agent-cli` 是经过每日切片验证后沉淀出来的汇总骨架，不是每天直接堆代码的地方。
