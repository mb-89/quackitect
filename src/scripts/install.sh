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
biome_version=2.5.12
lnav_version=0.14.1
# vale-ls pins itself in .claude/skills/level0/lib/servers.js, which a test drives.

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
    unpack "$tmp/$name" "$tmp" || exit 1
  else
    tar -xzf "$tmp/$name" -C "$tmp" vale
  fi

  mv "$tmp/vale${exe}" "$bin/vale${exe}"
  chmod +x "$bin/vale${exe}"
  rm -rf "$tmp"
}

get_biome() {
  case "$os" in
    Windows) name="biome-win32-x64.exe" ;;
    macOS)   name="biome-darwin-$( [ "$arch" = arm64 ] && echo arm64 || echo x64 )" ;;
    *)       name="biome-linux-x64" ;;
  esac
  from="https://github.com/biomejs/biome/releases/download/@biomejs/biome@${biome_version}/${name}"

  say "  downloading Biome ${biome_version}"
  mkdir -p "$bin"
  if have curl; then curl -fsSL "$from" -o "$bin/biome${exe}"
  elif have wget; then wget -q "$from" -O "$bin/biome${exe}"
  else say "Neither curl nor wget is here, so Biome cannot be downloaded." >&2; exit 1
  fi
  chmod +x "$bin/biome${exe}"
}

# The log viewer. Release 0.14.1 ships Linux and Windows zips, and macOS takes
# it from brew. The format file decides what a row shows, and lnav reads that
# from the reader's own folder, so it lands with one -i.
get_lnav() {
  if [ "$os" = "macOS" ]; then
    install_with_pm lnav
    return 0
  fi

  case "$os" in
    Windows) plat=windows ;;
    *)       plat=linux-musl ;;
  esac
  cpu=$( [ "$arch" = arm64 ] && echo arm64 || echo x86_64 )
  name="lnav-${lnav_version}-${plat}-${cpu}.zip"
  from="https://github.com/tstack/lnav/releases/download/v${lnav_version}/${name}"

  say "  downloading lnav ${lnav_version}"
  mkdir -p "$bin"
  tmp=$(mktemp -d)
  if have curl; then curl -fsSL "$from" -o "$tmp/$name" || return 1
  elif have wget; then wget -q "$from" -O "$tmp/$name" || return 1
  else say "Neither curl nor wget downloads lnav here." >&2; return 1
  fi

  unpack "$tmp/$name" "$tmp" || return 1
  if [ "$os" = "Windows" ]; then
    mv "$tmp/lnav-${lnav_version}/bin/lnav.exe" "$bin/lnav.exe" || return 1
    mv "$tmp/lnav-${lnav_version}/bin/msys-2.0.dll" "$bin/msys-2.0.dll" || return 1
  else
    mv "$tmp/lnav-${lnav_version}/lnav" "$bin/lnav" || return 1
  fi
  chmod +x "$bin/lnav${exe}"
  rm -rf "$tmp"
}

# lnav reads a format and a theme from its own folder, and node hands them
# over: the Windows build answers 0 after failing under a shell parent, so the
# script reads the answer back. The stamp keeps this off every later run.
format_lnav() {
  (cd "$root" && node src/scripts/lnav-reads.js >/dev/null 2>&1) || return 1
  mkdir -p "$bin" && : > "$bin/.lnav-reads-this-tree"
}

unpack() {
  if have unzip; then unzip -oq "$1" -d "$2"
  elif have python3; then python3 -m zipfile -e "$1" "$2"
  else say "Neither unzip nor python3 opens a zip here." >&2; return 1
  fi
}

# The editor wants this one, and the doors hold without it, so a failure here
# costs a line and the tree goes on.
get_vale_ls() {
  from=$(cd "$root" && node --input-type=module -e \
    "import { valeLsUrl } from './.claude/skills/level0/lib/servers.js';
     process.stdout.write(valeLsUrl('$os', '$arch'));") || return 1
  [ -n "$from" ] || return 1

  say "  downloading vale-ls"
  mkdir -p "$bin"
  tmp=$(mktemp -d)
  name=${from##*/}
  if have curl; then curl -fsSL "$from" -o "$tmp/$name" || return 1
  elif have wget; then wget -q "$from" -O "$tmp/$name" || return 1
  else say "Neither curl nor wget downloads vale-ls here." >&2; return 1
  fi

  unpack "$tmp/$name" "$tmp" || return 1
  mv "$tmp/vale-ls${exe}" "$bin/vale-ls${exe}" || return 1
  chmod +x "$bin/vale-ls${exe}"
  rm -rf "$tmp"
}

# A want, rather than a need: the tree still lints and tests without it.
wanted() { [ "$1" = "vale-ls" ] || [ "$1" = "lnav" ] || [ "$1" = "lnav-format" ]; }

missed() {
  case $1 in
    vale-ls) say "  vale-ls stays missing, so the editor manages its own copy." >&2 ;;
    lnav)    say "  lnav stays missing, so ./RUNME.sh log prints plain rows." >&2 ;;
    lnav-format) say "  lnav reads its own format, so the log shows as raw JSON." >&2 ;;
  esac
}

here() {
  case $1 in
    node)    have node ;;
    vale)    [ -x "$bin/vale${exe}" ] ;;
    biome)   [ -x "$bin/biome${exe}" ] ;;
    vale-ls) [ -x "$bin/vale-ls${exe}" ] ;;
    lnav)    [ -x "$bin/lnav${exe}" ] || have lnav ;;
    lnav-format) [ -f "$bin/.lnav-reads-this-tree" ] ;;
  esac
}

why() {
  case $1 in
    node) say "node: the command line and the level zero rules are JavaScript" ;;
    vale) say "vale: Vale holds the prose rules the write door and the linter read" ;;
    biome) say "biome: Biome formats and lints the JavaScript in this tree" ;;
    vale-ls) say "vale-ls: the Vale language server, so an editor draws the same rules" ;;
    lnav) say "lnav: the viewer ./RUNME.sh log opens the door log in" ;;
    lnav-format) say "lnav-format: the row format and the dark theme, which lnav keeps in its own folder" ;;
  esac
}

get() {
  case $1 in
    node) if [ "$pm" = "brew" ]; then install_with_pm node; else install_with_pm nodejs; fi ;;
    vale) get_vale ;;
    biome) get_biome ;;
    vale-ls) get_vale_ls ;;
    lnav) get_lnav ;;
    lnav-format) format_lnav ;;
  esac
}

missing=""
for one in node vale biome vale-ls lnav lnav-format; do
  here "$one" || missing="$missing $one"
done

if [ -n "$missing" ]; then
  say "Installing what this tree needs."
  for one in $missing; do
    why "$one"
    if wanted "$one"; then
      get "$one" || true
      here "$one" || missed "$one"
      continue
    fi
    get "$one"
    if ! here "$one"; then
      say "$one is still missing after installing it. Open a new terminal and run this again." >&2
      exit 1
    fi
  done
fi

# The survey names where each tool stands, and every caller reads it in place
# of guessing. It runs where anything landed, and where the file is absent.
if [ -n "$missing" ] || [ ! -f "$root/.se/tools.json" ]; then
  (cd "$root" && node src/scripts/cli.js tools >/dev/null) ||
    say "  the survey wrote no .se/tools.json, so every caller guesses again." >&2
fi

[ -n "$missing" ] && say "Ready."
exit 0
