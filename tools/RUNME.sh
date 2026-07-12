#!/usr/bin/env bash
# RUNME.sh - one-click install-and-demo, Linux/CI.
# adr-install-not-zero-dep / uc-run-dep-free: a fresh machine (or a CI runner) with nothing but
# its standard package manager ends at a working quackitect demo in one script run. Every
# dependency is checked before it is installed, and every install line says why - each one is
# an install step and a firewall risk (the Go-toolchain download blocked behind a proxy is the
# lesson dependencies.md records for Windows; the tarball fallback below is the Linux analog).
# HEADLESS: this script never opens a browser. It prints the generated paths so a CI log shows
# them. It exits non-zero on the first failure (set -e) - CI-honest, no silent partial success.

set -euo pipefail

step() { printf '==> %s\n' "$1"; }
info() { printf '    %s\n' "$1"; }
fail() { printf 'runme: %s\n' "$1" >&2; exit 1; }

# This script lives in tools/; the repo root is its parent directory.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
ENGINE_SRC="$ROOT_DIR/product/engine-go"

if [ ! -d "$ENGINE_SRC" ]; then
    fail "product/engine-go not found at the repo root ($ENGINE_SRC). Run this script from inside the cloned/unzipped quackitect repo (tools/RUNME.sh)."
fi

# --- dependency 1: a standard package manager (the ONE thing this script assumes) ---
step "detecting the standard package manager"
PKG=""
if command -v apt-get >/dev/null 2>&1; then
    PKG="apt"
elif command -v dnf >/dev/null 2>&1; then
    PKG="dnf"
elif command -v apk >/dev/null 2>&1; then
    PKG="apk"
else
    fail "no supported package manager found (need apt-get, dnf, or apk). Install Go by hand and re-run, or extend this script for your distro."
fi
info "using: $PKG"

SUDO=""
if [ "$(id -u)" -ne 0 ]; then
    if command -v sudo >/dev/null 2>&1; then
        SUDO="sudo"
    else
        info "not root and no sudo found - package-manager installs below may fail; the tarball fallback still works if \$HOME is writable."
    fi
fi

# --- dependency 2: the Go toolchain (the engine's only build-time dependency; see
#     product/quackitect/method/prompts/dependencies.md) ---
step "checking for the Go toolchain"
if command -v go >/dev/null 2>&1; then
    info "found: $(go version)"
else
    info "not found - installing via $PKG"
    info "why: the engine builds locally from vendored source (adr-ship-source); Go is the only thing it needs to do that. Nothing else is required at runtime."
    case "$PKG" in
        apt)
            $SUDO apt-get update -y
            $SUDO apt-get install -y golang-go
            ;;
        dnf)
            $SUDO dnf install -y golang
            ;;
        apk)
            $SUDO apk add --no-cache go
            ;;
    esac

    if ! command -v go >/dev/null 2>&1; then
        # Distro Go packages are sometimes too old, missing, or absent from a minimal image.
        # Fall back to the official tarball - one download, no extra package-manager dependency.
        step "package-manager Go unavailable - falling back to the official go.dev tarball"
        GOVER="$(curl -fsSL https://go.dev/VERSION?m=text | head -n1)"
        [ -n "$GOVER" ] || fail "could not resolve the latest Go version from go.dev/VERSION - check network/firewall access to go.dev."
        case "$(uname -m)" in
            x86_64|amd64) GOARCH="amd64" ;;
            aarch64|arm64) GOARCH="arm64" ;;
            *) fail "unsupported architecture $(uname -m) for the go.dev tarball fallback." ;;
        esac
        TARBALL="$(mktemp -t quackitect-go-XXXXXX.tar.gz)"
        info "downloading ${GOVER}.linux-${GOARCH}.tar.gz"
        curl -fsSL "https://go.dev/dl/${GOVER}.linux-${GOARCH}.tar.gz" -o "$TARBALL"
        if [ -w /usr/local ] || [ -n "$SUDO" ]; then
            $SUDO rm -rf /usr/local/go
            $SUDO tar -C /usr/local -xzf "$TARBALL"
            export PATH="/usr/local/go/bin:$PATH"
        else
            mkdir -p "$HOME/.local"
            rm -rf "$HOME/.local/go"
            tar -C "$HOME/.local" -xzf "$TARBALL"
            export PATH="$HOME/.local/go/bin:$PATH"
        fi
        rm -f "$TARBALL"
    fi

    command -v go >/dev/null 2>&1 || fail "Go still not on PATH after every fallback. Install it by hand (see product/quackitect/method/prompts/dependencies.md) and re-run."
    info "installed: $(go version)"
fi

# --- bootstrap the global quack binary from this repo's vendored source ---
# No POSIX launcher ships yet (quack.cmd is Windows-only; product/tools/go.cmd likewise) -
# this mirrors quack.cmd's own bootstrap logic (existence check + one-time build), matching
# the global-binary path the engine's own ratchet expects (data.go globalBinPath: the ".exe"
# suffix is the engine's real, OS-independent convention today, not a mistake in this script).
step "bootstrapping quack (builds the global binary from vendored source on first run)"
if [ -n "${XDG_DATA_HOME:-}" ]; then
    DATA_BASE="$XDG_DATA_HOME"
else
    DATA_BASE="$HOME/.local/share"
fi
QBIN="$DATA_BASE/quackitect/bin/quack.exe"

if [ ! -x "$QBIN" ]; then
    mkdir -p "$(dirname "$QBIN")"
    ( cd "$ENGINE_SRC" && go build -o "$QBIN" . )
fi
[ -x "$QBIN" ] || fail "bootstrap build did not produce an executable at $QBIN."

"$QBIN" version

# --- demo: a throwaway workspace, driven end-to-end, on THIS fresh machine ---
step "creating a throwaway demo workspace"
DEMO_DIR="$(mktemp -d -t quackitect-demo-XXXXXX)"
info "workspace: $DEMO_DIR"

"$QBIN" start stubs "$DEMO_DIR"

step "driving the demo workspace (status, then a rendered report)"
"$QBIN" -C "$DEMO_DIR" status

BOARD_PATH="$DEMO_DIR/board.html"
"$QBIN" -C "$DEMO_DIR" report --out "$BOARD_PATH"
[ -f "$BOARD_PATH" ] || fail "report claimed success but $BOARD_PATH is missing."

BOOK_PATH="$ROOT_DIR/spec/book.html"

echo ""
echo "runme: done. Go + quack are installed, and the demo workspace proved the round trip."
echo "  demo workspace: $DEMO_DIR  (throwaway - delete any time)"
echo "  demo board:     $BOARD_PATH"
if [ -f "$BOOK_PATH" ]; then
    echo "  reference book: $BOOK_PATH"
else
    echo "  reference book: none in this checkout (run 'quack report book' to render one)"
fi
echo "  headless: nothing was opened in a browser - open the paths above yourself, or serve them in CI."
