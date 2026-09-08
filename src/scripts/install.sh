#!/usr/bin/env sh
# Installs what this tree needs, and nothing else. RUNME calls this before it
# calls the command line, so a person runs RUNME and everything works.
#
# Every dependency this project takes is named in the loop at the bottom.
# Adding one is adding a case to `here`, `why` and `get`.
#
# Unix installs through whichever package manager the box carries.

set -eu
root=$(CDPATH= cd -- "$(dirname -- "$0")/../.." && pwd)
bin="$root/.se/bin"

# Pinned, so every box builds the same tree. Vale ships a binary for each
# platform, so nothing here compiles and no C toolchain is needed.
vale_version=3.20.0

say() { printf '%s\n' "$*"; }
have() { command -v "$1" >/dev/null 2>&1; }

pm=""
for one in apt-get dnf pacman zypper apk brew; do
  if have "$one"; then pm="$one"; break; fi
done

as_root() { if [ "$(id -u)" = "0" ]; then "$@"; else sudo "$@"; fi }

install_with_pm() {
  case "$pm" in
    apt-get) as_root apt-get update -qq && as_root apt-get install -y "$1" ;;
    dnf)     as_root dnf install -y "$1" ;;
    pacman)  as_root pacman -Sy --noconfirm "$1" ;;
    zypper)  as_root zypper install -y "$1" ;;
    apk)     as_root apk add "$1" ;;
    brew)    brew install "$1" ;;
    *)
      say "No package manager was found here, so $1 cannot be installed." >&2
      say "Install $1 and run this again." >&2
      exit 1
      ;;
  esac
}

# A shell on Windows runs this script too, and it needs the Windows build.
case "$(uname -s)" in
  MINGW*|MSYS*|CYGWIN*) os=Windows; exe=".exe" ;;
  Darwin)               os=macOS;   exe="" ;;
  *)                    os=Linux;   exe="" ;;
esac
case "$(uname -m)" in
  arm64|aarch64) arch=arm64 ;;
  *)             arch=64-bit ;;
esac

get_vale() {
  if [ "$os" = "Windows" ]; then
    name="vale_${vale_version}_Windows_${arch}.zip"
  else
    name="vale_${vale_version}_${os}_${arch}.tar.gz"
  fi
  from="https://github.com/errata-ai/vale/releases/download/v${vale_version}/${name}"

  say "  downloading Vale ${vale_version}"
  mkdir -p "$bin"
  tmp=$(mktemp -d)
  if have curl; then curl -fsSL "$from" -o "$tmp/$name"
  elif have wget; then wget -q "$from" -O "$tmp/$name"
  else say "Neither curl nor wget is here, so Vale cannot be downloaded." >&2; exit 1
  fi

  if [ "$os" = "Windows" ]; then
    if have unzip; then unzip -oq "$tmp/$name" -d "$tmp"
    else powershell -NoProfile -Command "Expand-Archive -LiteralPath '$tmp/$name' -DestinationPath '$tmp' -Force"
    fi
  else
    tar -xzf "$tmp/$name" -C "$tmp" vale
  fi

  mv "$tmp/vale${exe}" "$bin/vale${exe}"
  chmod +x "$bin/vale${exe}"
  rm -rf "$tmp"
}

here() {
  case $1 in
    node) have node ;;
    vale) [ -x "$bin/vale${exe}" ] ;;
  esac
}

why() {
  case $1 in
    node) say "node: the command line and the level zero rules are JavaScript" ;;
    vale) say "vale: Vale holds the prose rules the write door and the linter read" ;;
  esac
}

get() {
  case $1 in
    node) if [ "$pm" = "brew" ]; then install_with_pm node; else install_with_pm nodejs; fi ;;
    vale) get_vale ;;
  esac
}

missing=""
for one in node vale; do
  here "$one" || missing="$missing $one"
done
[ -n "$missing" ] || exit 0

say "Installing what this tree needs."
for one in $missing; do
  why "$one"
  get "$one"
  if ! here "$one"; then
    say "$one is still missing after installing it. Open a new terminal and run this again." >&2
    exit 1
  fi
done
say "Ready."
