# Husky Configuration

This directory contains project-level Git hooks configuration for Husky.

## Files

- `init.sh`: Shell script that sets up the environment for Git hooks
- `README.md`: This file

## How it works

The `init.sh` file is loaded by the pre-commit hook (`.husky/pre-commit`) before running lint-staged. It automatically detects and adds common Node.js installation paths to the PATH:

1. NVM installations (`~/.nvm/versions/node`)
2. Homebrew (macOS Intel: `/usr/local/bin`, Apple Silicon: `/opt/homebrew/bin`)
3. System-wide installations (`/usr/bin`)

This ensures that Git hooks can find `node` and `npm` commands regardless of how Node.js is installed on the system.

## Why is this needed?

Git hooks run with a limited environment PATH that may not include the directory where `node` is installed. This configuration solves the "command not found" error that can occur when husky tries to run lint-staged.

## Compatibility

This configuration works with:
- macOS (Homebrew on both Intel and Apple Silicon)
- Linux (NVM, system-wide installations)
- Different Node.js installation methods

If your Node.js installation is not detected, you can add its path to `init.sh`.
