#!/usr/bin/env sh
# The claude.ai setup script runs this old path, so it hands every argument to the root install. [[spec/tickets/setup-install-path-stands]]
exec sh "$(dirname -- "$0")/../../install.sh" "$@"
