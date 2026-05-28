同步 codex 和 opencode 的 upstream 到对应 fork 远端，然后更新主工程 submodule 指针。

具体步骤：
1. 同步 codex upstream：
   ```bash
   cd codex
   git fetch upstream
   git checkout main
   git merge upstream/main
   git push origin main
   ```
2. 同步 opencode upstream：
   ```bash
   cd ../opencode
   git fetch upstream
   git checkout dev
   git merge upstream/dev
   git push origin dev
   ```
3. 回到主工程，提交新的 submodule 指针：
   ```bash
   cd ..
   git add codex opencode
   git commit -m "chore(submodule): 更新源码样本指针"
   ```

如果有冲突或异常，报告出来，不要自动解决。

直接执行，不需要确认。
