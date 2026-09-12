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

# Windows carries no package manager this script can name, and winget ships
# with the operating system. A program installed a moment ago is on the machine
# and not in this shell, so the usual node folder joins the PATH here.
get_node() {
  if [ "$os" != "Windows" ]; then
    if [ "$pm" = "brew" ]; then install_with_pm node; else install_with_pm nodejs; fi
    return 0
  fi

  have winget || {
    say "winget is missing, so node cannot be installed." >&2
    say "Install App Installer from the Microsoft Store and run this again." >&2
    exit 1
  }

  say "  installing node through winget"
  # winget answers a non-zero code where the package already stands current,
  # and the check after this reads what the box carries either way.
  winget install --id OpenJS.NodeJS.LTS --exact --silent \
    --accept-source-agreements --accept-package-agreements || true
  PATH="$PATH:/c/Program Files/nodejs"
  export PATH
}

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

# Go builds the log viewer, and ./RUNME.sh log builds it the first time it runs.
get_go() {
  if [ "$os" = "Windows" ]; then
    have winget || return 1
    say "  installing go through winget"
    winget install --id GoLang.Go --exact --silent \
      --accept-source-agreements --accept-package-agreements || true
    PATH="$PATH:/c/Program Files/Go/bin"
    export PATH
    return 0
  fi
  case "$pm" in
    apt-get) install_with_pm golang-go ;;
    dnf)     install_with_pm golang ;;
    *)       install_with_pm go ;;
  esac
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

# THE INDEX IS C, SO A BUILD NEEDS A C COMPILER. The pinned Zig is one download
# and no system toolchain, and a box that already carries a working compiler
# uses that. A name on the PATH is no proof, so this compiles a probe file.
# [[spec/design_output/index#the-compiler-it-needs]]
zig_version=0.16.0

working_compiler() {
  tmp=$(mktemp -d) || return 1
  printf 'int probe(void) { return 0; }\n' > "$tmp/probe.c"
  for one in cc gcc clang; do
    have "$one" || continue
    if (cd "$tmp" && "$one" -c probe.c -o probe.o) >/dev/null 2>&1; then
      rm -rf "$tmp"; printf '%s' "$one"; return 0
    fi
  done
  rm -rf "$tmp"; return 1
}

# zig is a toolbox and its C compiler is a subcommand, so the pinned answer is
# two words. A compiler that is already a compiler is one.
compiler_here() {
  if [ -x "$bin/zig/zig${exe}" ]; then
    printf '%s' "$bin/zig/zig${exe} cc"
    return 0
  fi
  working_compiler
}

index_here() { [ -x "$bin/se-index${exe}" ]; }

get_index() {
  cc=$(compiler_here) || {
    say "  no C compiler stands here, so the index waits." >&2
    return 1
  }
  say "  building the index with $cc"
  (cd "$root/src/index" && CC="$cc" CGO_ENABLED=1 GOFLAGS=-tags=sqlite_fts5 \
    go build -o "$bin/se-index${exe}" .) || return 1
  index_here
}

# THE EDITOR FINDS WHAT ITS OWN LIST NAMES, AND A LINKED FOLDER IS NOT ON IT.
# So the link goes in beside an entry in extensions.json, and node writes that
# file: it keeps every entry it cannot read and refuses a write losing an id.
# The link points at the tree, so an edit draws without a second install.
editor_folder="$HOME/.vscode/extensions"

# A COPY IS A STALE EXTENSION, AND THAT IS THE ONE THING THIS CANNOT BE. A copy
# draws the tree as it stood at the install, so an edit reaches nobody. Node
# makes the link, a junction on Windows, and node answers whether it stands.
editor_linked() {
  [ -d "$editor_folder" ] || return 0
  (cd "$root" && node src/scripts/editor.js linked) >/dev/null 2>&1
}

link_editor() {
  [ -d "$editor_folder" ] || return 0
  say "  linking the sidebar into the editor"
  (cd "$root" && node src/scripts/editor.js link) || return 1
}

# The two the tracked settings point at. servers.js holds the ids, so the shell
# names none of its own and one list serves the editor and the recommendation.
extension_ids() {
  (cd "$root" && node --input-type=module -e \
    "import { EXTENSIONS } from './.claude/skills/level0/lib/servers.js';
     process.stdout.write(EXTENSIONS.join('\n'));") 2>/dev/null
}

extensions_here() {
  have code || return 0
  listed=$(code --list-extensions 2>/dev/null) || return 1
  for id in $(extension_ids); do
    printf '%s\n' "$listed" | grep -qix "$id" || return 1
  done
}

get_extensions() {
  have code || return 0
  for id in $(extension_ids); do
    say "  installing $id"
    code --install-extension "$id" --force >/dev/null 2>&1 || return 1
  done
}

# THE COMMIT DOOR A PERSON MEETS. Git reads a hook out of core.hooksPath, and
# .githooks holds this tree's own, so one line points git at it. The Bash door
# holds the same check for a session, and each stands without the other.
# [[spec/design_output/private#two-doors-one-check]]
hooks_folder=".githooks"

hooks_here() {
  [ "$(cd "$root" && git config --get core.hooksPath 2>/dev/null)" = "$hooks_folder" ]
}

set_hooks() {
  say "  pointing git at $hooks_folder"
  (cd "$root" && git config core.hooksPath "$hooks_folder") || return 1
  chmod +x "$root/$hooks_folder/pre-commit" 2>/dev/null || true
}

# A want, rather than a need: the tree still lints and tests without it.
wanted() {
  [ "$1" = "vale-ls" ] || [ "$1" = "go" ] || [ "$1" = "git-hooks" ] ||
    [ "$1" = "editor-link" ] || [ "$1" = "editor-extensions" ] || [ "$1" = "index" ]
}

missed() {
  case $1 in
    vale-ls) say "  vale-ls stays missing, so the editor manages its own copy." >&2 ;;
    go)      say "  go stays missing, so ./RUNME.sh log prints plain rows." >&2 ;;
    index) say "  the index stays unbuilt, so find and links read the files." >&2 ;;
    editor-link) say "  the sidebar stays unlinked, so the editor draws no panel here." >&2 ;;
    editor-extensions) say "  no code on the PATH, so a person takes the recommendation." >&2 ;;
    git-hooks) say "  git reads its own hooks here, so a hand commit meets no privacy check." >&2 ;;
  esac
}

here() {
  case $1 in
    node)    have node ;;
    vale)    [ -x "$bin/vale${exe}" ] ;;
    biome)   [ -x "$bin/biome${exe}" ] ;;
    vale-ls) [ -x "$bin/vale-ls${exe}" ] ;;
    go)      have go ;;
    index) index_here || ! compiler_here >/dev/null ;;
    editor-link) editor_linked ;;
    editor-extensions) extensions_here ;;
    git-hooks) hooks_here ;;
  esac
}

why() {
  case $1 in
    node) say "node: the command line and the level zero rules are JavaScript" ;;
    vale) say "vale: Vale holds the prose rules the write door and the linter read" ;;
    biome) say "biome: Biome formats and lints the JavaScript in this tree" ;;
    vale-ls) say "vale-ls: the Vale language server, so an editor draws the same rules" ;;
    go) say "go: it builds the viewer ./RUNME.sh log opens the door log in, and the index" ;;
    index) say "index: the warm model of this tree, which find and links ask" ;;
    editor-link) say "editor-link: this tree's own sidebar, linked into the editor and named in its list" ;;
    editor-extensions) say "editor-extensions: the Vale and Biome extensions the tracked settings point at" ;;
    git-hooks) say "git-hooks: the pre-commit door, so a commit by hand meets the privacy check" ;;
  esac
}

get() {
  case $1 in
    node) get_node ;;
    vale) get_vale ;;
    biome) get_biome ;;
    vale-ls) get_vale_ls ;;
    go) get_go ;;
    index) get_index ;;
    editor-link) link_editor ;;
    editor-extensions) get_extensions ;;
    git-hooks) set_hooks ;;
  esac
}

missing=""
for one in node vale biome vale-ls go index editor-link editor-extensions git-hooks; do
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

node "$root/src/scripts/copilot.js" setup auto

[ -n "$missing" ] && say "Ready."
exit 0
