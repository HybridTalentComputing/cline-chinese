# Husky project-level configuration
# This file is loaded by husky before running hooks

# Add common Node.js installation paths to PATH
for node_dir in "$HOME/.nvm/versions/node" /usr/local/bin /opt/homebrew/bin /usr/bin; do
  if [ -d "$node_dir" ] && [ -x "$node_dir/node" ]; then
    export PATH="$node_dir:$PATH"
    break
  fi
done

# Also ensure project's node_modules/.bin is in PATH
export PATH="node_modules/.bin:$PATH"
