---
title: "在 Cline 会话期间禁用终端分页器"
description: "通过检测 CLINE_ACTIVE 环境变量并禁用 less 等分页器，使 CLI 输出在 Cline 运行命令时变为非交互式。"
---

许多 CLI 工具（如 Git）使用分页器如 `less` 进行交互式、可滚动输出。当 Cline 在终端中运行命令时，这种交互性会阻碍进程 — 分页器可能在第一页暂停并阻止进度。你可以配置你的 shell，以便当终端由 Cline 生成时，分页器被禁用且输出正常流式传输。

## 它如何工作

Cline 为它打开以运行命令的终端设置一个环境变量：

- `CLINE_ACTIVE` — 当 shell 在 Cline 下运行时非空

你可以在 shell 启动文件中检测此变量，并仅为 Cline 运行的会话调整环境变量或别名。这保持你的正常交互式终端不变。

## 快速设置（Zsh/Bash）

将以下内容添加到你的 `~/.zshrc`、`~/.bashrc` 或 `~/.bash_profile`：

```bash
# 当终端由 Cline 启动时禁用分页器
if [[ -n "$CLINE_ACTIVE" ]]; then
  export PAGER=cat
  export GIT_PAGER=cat
  export SYSTEMD_PAGER=cat
  export LESS="-FRX"
fi
```

<Note>
- `PAGER=cat` 确保通用的分页器感知工具直接打印到 stdout
- `GIT_PAGER=cat` 防止 Git 调用 `less`
- `SYSTEMD_PAGER=cat` 禁用 systemd 工具中的分页（如果存在）
- `LESS="-FRX"` 使 `less` 表现得更像流式输出，如果工具仍然调用它
</Note>

此配置仅在设置 `CLINE_ACTIVE` 时应用，因此你的正常终端保持其通常的交互行为。

## 验证

- 在 Cline 中打开一个运行终端命令的任务并检查：
  - `echo "$CLINE_ACTIVE"` 打印非空值
  - `git log` 或其他长输出应该流式传输而不暂停
- 如果更改未生效：
  - 确保你为你的 shell 更新了正确的启动文件
  - 重启 VS Code/Cursor，以便集成终端重新加载你的 shell 配置
  - 确认你的终端配置文件源你的 `~/.zshrc` 或 `~/.bashrc`

## 可选调整

- 当你不想依赖环境变量时，首选命令行选项：

```bash
# 一次性使用（无别名）
git --no-pager log -n 50 --decorate --oneline
systemctl --no-pager status nginx
journalctl --no-pager -u nginx -n 200
less -FRX README.md
```

- 你还可以使用 shell 别名覆盖分页，这些别名使用选项而非环境变量限定为 Cline 会话：

```bash
if [[ -n "$CLINE_ACTIVE" ]]; then
  # 默认使 'less' 非交互式
  alias less='less -FRX'
  # 通过 CLI 标志禁用常用工具的分页
  alias git='command git --no-pager'
  alias systemctl='command systemctl --no-pager'
  alias journalctl='command journalctl --no-pager'
fi
```

- 如果你首选环境变量，许多 CLI 也遵守通用或特定于工具的分页器变量：
  - Git：`GIT_PAGER=cat`
  - Systemd：`SYSTEMD_PAGER=cat`
  - 手册页：`MANPAGER=cat`（对于 Cline 驱动的命令通常不需要）

- 别名影响当前交互式 shell，而环境变量传播到子进程。选择最适合你工作流的方法。
