#!/usr/bin/env sh
# The bootstrap. It makes the toolchain exist and hands over. Everything it
# does beyond that lives in the installer, which is written once and runs on
# both platforms.
#
# Every argument goes through to the installer, which is where the flags are
# declared and where --help prints them.
#
#   util/setup/install.sh --help
set -eu
here=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
root=$(CDPATH= cd -- "$here/../.." && pwd)

have() { command -v "$1" >/dev/null 2>&1; }

echo "quackitect - checking the toolchain"

# Go is the only tool the bootstrap needs. Everything else is in the manifest,
# which the installer reads.
if ! have go; then
  echo "  installing go"
  if have apt-get && [ "$(id -u)" = 0 ]; then apt-get install -y -qq golang-go >/dev/null
  elif have apt-get; then sudo apt-get install -y -qq golang-go >/dev/null
  elif have dnf; then sudo dnf install -y -q golang >/dev/null
  elif have apk; then apk add --no-cache go >/dev/null
  elif have pacman; then sudo pacman -S --noconfirm go >/dev/null
  else
    # No package manager, and possibly no root. That is an ordinary cloud box,
    # not a failure: take the official archive into a folder we own.
    ver=1.24.7
    arch=$(uname -m); case "$arch" in x86_64) arch=amd64 ;; aarch64|arm64) arch=arm64 ;; esac
    prefix="$HOME/.local"
    mkdir -p "$prefix"
    echo "  no package manager: taking go $ver into $prefix/go"
    tmp=$(mktemp -d)
    if have curl; then curl -fsSL "https://go.dev/dl/go$ver.linux-$arch.tar.gz" -o "$tmp/go.tgz"
    else wget -qO "$tmp/go.tgz" "https://go.dev/dl/go$ver.linux-$arch.tar.gz"; fi
    tar -C "$prefix" -xzf "$tmp/go.tgz"
    PATH="$prefix/go/bin:$PATH"; export PATH
  fi
fi

if ! have go; then
  echo "go is installed but this shell cannot see it. Open a new terminal and run this again." >&2
  exit 1
fi
echo "  $(go version)"

set -- --root "$root" "$@"
cd "$here"
exec go run . "$@"
