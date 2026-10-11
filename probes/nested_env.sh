#!/bin/sh
# Run a command with the environment a nested benchmark session gets:
# the parent session's ids, sockets and GitHub credentials stripped,
# and the session-scoped gh client off the PATH.
P=$(printf '%s' "$PATH" | tr ':' '\n' | grep -v '/root/.ccr/sessions/' | paste -sd: -)
exec env -u CLAUDE_CODE_SESSION_ID -u CLAUDE_CODE_REMOTE_SESSION_ID \
  -u CLAUDE_CODE_MESSAGING_SOCKET -u CLAUDE_CODE_MESSAGING_TOKEN \
  -u CLAUDE_CODE_CHILD_SESSION -u CLAUDE_PID -u CLAUDECODE \
  -u GH_TOKEN -u GITHUB_TOKEN -u GIT_ASKPASS \
  -u GIT_CONFIG_COUNT -u GIT_CONFIG_KEY_0 -u GIT_CONFIG_VALUE_0 \
  -u GIT_CONFIG_KEY_1 -u GIT_CONFIG_VALUE_1 -u GIT_CONFIG_KEY_2 -u GIT_CONFIG_VALUE_2 \
  PATH="$P" "$@"
