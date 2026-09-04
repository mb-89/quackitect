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

# A go THAT IS HERE IS NOT ALWAYS A go THAT CAN BUILD THIS.
#
# MEASURED AS A CLASS AND NOT AS AN INCIDENT: the modules say go 1.27, and a
# distro package is routinely older. From 1.21 on, go reads what go.mod asks for
# and fetches that toolchain itself, so anything from there works. Older than
# that stops with a sentence about go.mod, after the bootstrap has already said
# the toolchain is fine, and nothing is built. Debian 12 ships 1.19 and Ubuntu
# 22.04 ships 1.18, so this is the ordinary cloud box and not a corner.
go_ok() {
  have go || return 1
  said=$(go version 2>/dev/null) || return 1
  # "go version go1.27.0 linux/amd64" -> 1 and 27, with no sed and no escaping.
  said=${said##*go}
  said=${said%% *}
  major=${said%%.*}
  rest=${said#*.}
  minor=${rest%%.*}
  case "$major$minor" in *[!0-9]* | "") return 1 ;; esac
  if [ "$major" -gt 1 ]; then return 0; fi
  if [ "$major" -eq 1 ] && [ "$minor" -ge 21 ]; then return 0; fi
  return 1
}

echo "quackitect - checking the toolchain"

# Go is the only tool the bootstrap needs. Everything else is in the manifest,
# which the installer reads.
#
# A PACKAGE MANAGER IS TRIED AND NEVER RELIED ON. Its failure is not the end of
# the walk, because the archive below works without root and without one, so a
# refusal here must not stop the script under set -e.
if ! have go; then
  echo "  installing go"
  if have apt-get && [ "$(id -u)" = 0 ]; then apt-get install -y -qq golang-go >/dev/null 2>&1 || true
  elif have apt-get; then sudo apt-get install -y -qq golang-go >/dev/null 2>&1 || true
  elif have dnf; then sudo dnf install -y -q golang >/dev/null 2>&1 || true
  elif have apk; then apk add --no-cache go >/dev/null 2>&1 || true
  elif have pacman; then sudo pacman -S --noconfirm go >/dev/null 2>&1 || true
  fi
fi

# THE OFFICIAL ARCHIVE, WHICH IS PINNED AT WHAT THE MODULES ASK FOR. It ran
# whenever there was no package manager, and it ran at 1.24.7 while go.mod said
# 1.27, so the one box with no apt depended on a toolchain download to build at
# all. Now it also runs when the package manager put a go here that is too old.
if ! go_ok; then
  ver=1.27.0
  arch=$(uname -m); case "$arch" in x86_64) arch=amd64 ;; aarch64|arm64) arch=arm64 ;; esac
  prefix="$HOME/.local"
  mkdir -p "$prefix"
  rm -rf "$prefix/go"
  echo "  no usable go: taking go $ver into $prefix/go"
  tmp=$(mktemp -d)
  if have curl; then curl -fsSL "https://go.dev/dl/go$ver.linux-$arch.tar.gz" -o "$tmp/go.tgz"
  else wget -qO "$tmp/go.tgz" "https://go.dev/dl/go$ver.linux-$arch.tar.gz"; fi
  tar -C "$prefix" -xzf "$tmp/go.tgz"
  # THE TOOL LANE LOOKS HERE TOO, because this export reaches this process and
  # nothing else. See util/cage/mcp-lane.mjs.
  PATH="$prefix/go/bin:$PATH"; export PATH
fi

if ! go_ok; then
  if have go; then
    echo "the go here is $(go version), and this tree needs 1.21 or newer to build. Install a newer go and run this again." >&2
  else
    echo "go is installed but this shell cannot see it. Open a new terminal and run this again." >&2
  fi
  exit 1
fi
echo "  $(go version)"

set -- --root "$root" "$@"
cd "$here"
exec go run . "$@"
