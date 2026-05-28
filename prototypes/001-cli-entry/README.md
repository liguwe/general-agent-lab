# 001-cli-entry

今天拆的是 `codex-cli` 的入口层：用户执行 `codex` 后，命令怎样从 npm 包入口进入真正的 CLI runtime，再由 runtime 分发到不同模式。

## 源码证据

Codex 的链路是两段式：

```text
codex-cli/bin/codex.js
  -> 根据 process.platform / process.arch 选择 target triple
  -> 找到平台 native codex binary
  -> spawn(binaryPath, process.argv.slice(2))
  -> codex-rs/cli/src/main.rs
  -> clap 解析 root options 和 subcommand
  -> None 进入 codex_tui::run_main
  -> exec/review 进入 codex_exec::run_main
```

更白话一点
codex.js = 门卫，负责找对楼、找对门
codex-rs/cli/src/main.rs = 前台，负责分诊
codex_tui::run_main = 进会客室长期聊
codex_exec::run_main = 去窗口办一次业务，办完就走

关键文件：

- `codex/codex-cli/bin/codex.js`
- `codex/codex-rs/cli/src/main.rs`

opencode 对照更直接：

```text
opencode/packages/opencode/src/index.ts
  -> hideBin(process.argv)
  -> yargs(args)
  -> .command(...)
  -> cli.parse()
```

关键文件：

- `opencode/packages/opencode/package.json`
- `opencode/packages/opencode/src/index.ts`

## 这个原型验证什么

这个原型只验证 CLI 入口骨架：

- `bin/mini-codex.js` 模拟 Codex npm wrapper：识别平台、设置管理环境变量、spawn runtime。
- `src/runtime.js` 模拟 Rust CLI dispatcher：解析 root flags，按 subcommand 分发。
- 无 subcommand 时进入 mock interactive TUI。
- `exec` / `review` / `login` / `logout` / `completion` / `debug prompt-input` 走不同 route。

它不验证真实 Agent Loop、模型调用、工具调用、TUI 渲染、配置文件读取和权限系统。

## 运行

```bash
npm run demo
npm run demo:exec
npm run demo:review
npm run demo:debug
npm test
```

也可以直接运行：

```bash
node ./bin/mini-codex.js --profile daily -c model=mock
node ./bin/mini-codex.js exec "summarize cwd"
node ./bin/mini-codex.js debug prompt-input "hello"
```

## 今天的判断

Codex 的 `codex-cli` 不承载 Agent 逻辑，它是安装分发层。真正值得复用的模式不是 Node wrapper 本身，而是入口分层：

```text
distribution wrapper -> runtime dispatcher -> interactive / non-interactive mode
```

`mini-code-agent-cli` 后续应该保留这个边界：安装入口只负责找到 runtime 和转发参数；Agent Loop、工具、权限、日志都放到 runtime 后面。
