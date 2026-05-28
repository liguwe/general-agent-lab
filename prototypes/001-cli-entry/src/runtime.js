#!/usr/bin/env node

const KNOWN_SUBCOMMANDS = new Set([
  "exec",
  "review",
  "login",
  "logout",
  "completion",
  "debug",
  "help",
]);

// 解析 root flags 和 subcommand：root flags 会被后续 runtime 命令继承。
function parseRootArgs(argv) {
  const root = {
    config: [],
    profile: null,
    prompt: [],
  };
  let subcommand = null;
  const subcommandArgs = [];

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (!subcommand && (arg === "-c" || arg === "--config")) {
      const value = argv[index + 1];
      if (!value) {
        throw new Error(`${arg} requires KEY=VALUE`);
      }
      root.config.push(value);
      index += 1;
      continue;
    }

    if (!subcommand && arg.startsWith("-c=")) {
      root.config.push(arg.slice(3));
      continue;
    }

    if (!subcommand && arg === "--profile") {
      const value = argv[index + 1];
      if (!value) {
        throw new Error("--profile requires NAME");
      }
      root.profile = value;
      index += 1;
      continue;
    }

    if (!subcommand && arg.startsWith("--profile=")) {
      root.profile = arg.slice("--profile=".length);
      continue;
    }

    if (!subcommand && KNOWN_SUBCOMMANDS.has(arg)) {
      subcommand = arg;
      continue;
    }

    if (subcommand) {
      subcommandArgs.push(arg);
    } else {
      root.prompt.push(arg);
    }
  }

  return {
    root,
    subcommand,
    subcommandArgs,
  };
}

function renderHeader(mode, root) {
  const profile = root.profile ?? "default";
  const config = root.config.length ? root.config.join(", ") : "none";
  return `[mini-codex] mode=${mode} profile=${profile} config=${config}`;
}

function runInteractive(root) {
  const prompt = root.prompt.join(" ").trim();
  console.log(renderHeader("interactive-tui", root));
  console.log("route: no subcommand -> interactive session");
  console.log(`prompt: ${prompt || "(empty)"}`);
}

// 无 subcommand 对应 Codex 的默认 TUI；exec/review 对应非交互模式。
function runExec(root, args) {
  const prompt = args.join(" ").trim();
  console.log(renderHeader("exec", root));
  console.log("route: exec -> non-interactive agent run");
  console.log(`prompt: ${prompt || "(empty)"}`);
}

function runReview(root, args) {
  console.log(renderHeader("review", root));
  console.log("route: review -> specialized exec command");
  console.log(`args: ${args.length ? args.join(" ") : "(empty)"}`);
}

function runLogin(root, args) {
  console.log(renderHeader("login", root));
  console.log(`route: login -> auth management ${args.join(" ")}`.trim());
}

function runCompletion(args) {
  const shell = args[0] ?? "bash";
  console.log(`# completion for ${shell}`);
  console.log("complete -W 'exec review login logout completion debug help' mini-codex");
}

// debug prompt-input 用来观察 wrapper 注入的 env 和 dispatcher 解析结果。
function runDebug(root, args) {
  const [topic, ...rest] = args;
  if (topic !== "prompt-input") {
    throw new Error("debug only supports: prompt-input");
  }
  console.log(
    JSON.stringify(
      {
        route: "debug prompt-input",
        target: process.env.MINI_CODEX_TARGET,
        managedByNpm: process.env.MINI_CODEX_MANAGED_BY_NPM === "1",
        packageRoot: process.env.MINI_CODEX_MANAGED_PACKAGE_ROOT,
        root,
        prompt: rest.join(" "),
      },
      null,
      2,
    ),
  );
}

function printHelp() {
  console.log(`mini-codex [OPTIONS] [PROMPT]
mini-codex [OPTIONS] <COMMAND> [ARGS]

Options:
  -c, --config KEY=VALUE  Root config override inherited by runtime commands
  --profile NAME          Runtime profile name

Commands:
  exec [PROMPT]           Run non-interactively
  review [ARGS]           Run a review-shaped exec command
  login                   Manage auth
  logout                  Clear auth
  completion [SHELL]      Print a tiny completion script
  debug prompt-input      Print parsed prompt input as JSON
  help                    Show this help
`);
}

export function dispatch(argv) {
  const { root, subcommand, subcommandArgs } = parseRootArgs(argv);

  // 这里是最小版命令路由，模拟 codex-rs/cli/src/main.rs 的 match subcommand。
  switch (subcommand) {
    case null:
      return runInteractive(root);
    case "exec":
      return runExec(root, subcommandArgs);
    case "review":
      return runReview(root, subcommandArgs);
    case "login":
      return runLogin(root, subcommandArgs);
    case "logout":
      console.log(renderHeader("logout", root));
      console.log("route: logout -> clear auth");
      return;
    case "completion":
      return runCompletion(subcommandArgs);
    case "debug":
      return runDebug(root, subcommandArgs);
    case "help":
      return printHelp();
    default:
      throw new Error(`Unknown command: ${subcommand}`);
  }
}

try {
  // 真实入口只负责把 process.argv 交给 dispatcher，方便后续替换成更完整的 runtime。
  dispatch(process.argv.slice(2));
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
