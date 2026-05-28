先执行 commit 命令暂存所有变更，然后推送当前分支到远端。

具体步骤：
1. 检查 git status，如果有未提交的变更，全部暂存并提交（参考 commit 命令的规范）
2. 如果有 submodule 变更，先更新 submodule 指针到 fork 最新 commit：
   ```bash
   git submodule update --remote codex opencode
   git add codex opencode
   ```
3. git push origin <当前分支>

直接执行，不需要确认。
