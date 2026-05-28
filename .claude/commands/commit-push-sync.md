先暂存所有变更并提交，然后推送当前分支到远端。如果有 submodule 变更，先同步 upstream 到 fork。

具体步骤：

1. **同步 upstream（仅当 submodule 指针变化时）**
   检查 `git status` 是否有 codex/opencode gitlink 变化。如果有，先同步 upstream：
   ```bash
   # codex
   cd codex && git fetch upstream && git checkout main && git merge upstream/main && git push origin main && cd ..
   # opencode
   cd opencode && git fetch upstream && git checkout dev && git merge upstream/dev && git push origin dev && cd ..
   ```

2. **提交**
   ```bash
   git add -A
   # 如果有 submodule 变更，确保 add codex opencode 以更新指针
   git commit -m "<conventional commit message>"
   ```
   Commit message 规范：
   - 使用 conventional commits 格式（feat/fix/refactor/docs/chore 等）
   - 第一行不超过 72 字符
   - 如有必要，空一行后加详细描述

3. **推送**
   ```bash
   git push origin <当前分支>
   ```

如果有冲突或异常，报告出来，不要自动解决。

直接执行，不需要确认。
