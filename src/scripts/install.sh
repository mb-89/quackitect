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
# The runtime folder .claude/skills/level0/lib/folders.js owns, spelled here and
# nowhere else in this script, because a shell script imports nothing.
run="$root/.se/.runtime"
# The same folder folders.js owns, in the home tree, where the register stands.
home_run="${HOME:-}/.se/.runtime"
bin="$run/bin"

# The boot word the SessionStart hook runs. A desk session hands its hook input
# to the start verb and prints what it answers, and a binary failing, missing or
# slow holds no session up. A cloud box lacking the plugin manifest installs
# under the session skip list, which installSkip in src/quack/probe_cold.go
# pins, and a failed install holds no session up.
# [[spec/design_output/level0#the-boot-hook]] [[spec/tickets/the-coordinator-runs-under-level0]]
if [ "${1:-}" = boot ]; then
  if [ -z "${CLAUDE_CODE_REMOTE:-}" ] && [ -z "${SE_CLOUD:-}" ]; then
    index="$bin/se-index"
    [ -x "$index.exe" ] && index="$index.exe"
    [ -x "$index" ] || exit 0
    cap=""
    command -v timeout >/dev/null 2>&1 && cap="timeout 10"
    said=$($cap "$index" verb "$root/src/scripts" start 2>/dev/null) || exit 0
    [ -n "$said" ] && printf '%s\n' "$said"
    exit 0
  fi
  [ -f "$root/.claude/skills/level0/.claude-plugin/plugin.json" ] && exit 0
  SE_INSTALL_SKIP="editor-link editor-extensions editor-client go ${SE_INSTALL_SKIP:-}" sh "$0" || true
  exit 0
fi

# The runtime folder of [[spec/design_input/the-runtime-files-stand-apart]], owned
# by folders.js and spelled again here because a shell script imports nothing. A
# box carrying the old places hands them to the index walk, so this moves them.

# The folder answers to .runtime, so a box carrying an older name renames it
# first, before anything below creates the new one beside it.
# folders.js owns these names as RENAMED.
for one in "$root/.se/run" "$root/.se/runtime"; do
  if [ -d "$one" ] && [ ! -d "$run" ]; then
    mv "$one" "$run" 2>/dev/null || true
  fi
done

mkdir -p "$run"
# The log stays out of the move, because the retro collects it.
# folders.js owns these names as MOVED.
for one in bin hold review undo measure copilot box.json session.json \
  tools.json hold.json check.json index.db index.json lsp-door.json copilot-cloud \
  show-panel config.json identity.json project.json vehicle.json; do
  old="$root/.se/$one"
  new="$run/$one"
  [ -d "$old" ] || [ -f "$old" ] || continue
  # A name the runtime folder already holds keeps what it holds, because mv
  # would nest the old folder inside the new one.
  if [ -e "$new" ]; then continue; fi
  # A file a running process holds stays where it stands, and a later run moves it.
  mv "$old" "$new" 2>/dev/null || true
done

# The identity wore the name copy.json before, so a box carrying that name
# keeps the identity it made. folders.js owns the name it takes.
if [ -f "$run/copy.json" ] && [ ! -f "$run/identity.json" ]; then
  mv "$run/copy.json" "$run/identity.json" 2>/dev/null || true
fi
if [ -f "$root/.se/copy.json" ] && [ ! -f "$run/identity.json" ]; then
  mv "$root/.se/copy.json" "$run/identity.json" 2>/dev/null || true
fi

# The register stands in the home folder, under the same runtime half. A box
# carrying it straight under .se hands the reader nothing, so this moves it. The
# old place stands here on purpose, and folders.js owns the name either side.
if [ -n "${HOME:-}" ] && [ -f "$HOME/.se/registry.json" ] &&
  [ ! -f "$home_run/registry.json" ]; then
  mkdir -p "$home_run"
  # The old place folders.js leaves behind, which this line takes out of the way.
  mv "$HOME/.se/registry.json" "$home_run/registry.json" 2>/dev/null || true
fi

# The log is history and no runtime state, and it answers to .se/.log, a dot
# folder a running session writes while the retro holds the rest. Every older
# spelling of the folder comes home.
# folders.js owns these names as LOGGED.
for one in "$root/.se/log" "$root/.se/run/log" "$root/.se/runtime/log" "$root/.se/.runtime/log"; do
  if [ -d "$one" ]; then
    mkdir -p "$root/.se/.log"
    cp -rn "$one/." "$root/.se/.log/" 2>/dev/null || true
    rm -rf "$one" 2>/dev/null || true
  fi
done

# Pinned, so every box builds the same tree. Vale ships a binary for each
# platform, so nothing here compiles and no C toolchain is needed.
vale_version=3.20.0
biome_version=2.5.12
# vale-ls pins itself in .claude/skills/level0/lib/servers.js. A shell script
# imports nothing, so it spells the same pin, and a contract case holds the two equal.
vale_ls_version=0.5.1
vale_ls_releases=https://github.com/vale-cli/vale-ls/releases/download

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

# Go builds the log viewer, and ./RUNME.sh tui builds it the first time it runs.
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
  # [[spec/design_output/editor#the-asset-matrix]]
  case "$os-$arch" in
    Linux-64-bit) target=x86_64-unknown-linux-gnu ;;
    Linux-arm64) target=aarch64-unknown-linux-gnu ;;
    macOS-64-bit) target=x86_64-apple-darwin ;;
    macOS-arm64) target=aarch64-apple-darwin ;;
    Windows-64-bit) target=x86_64-pc-windows-gnu ;;
    Windows-arm64) target=aarch64-pc-windows-msvc ;;
    *) return 1 ;;
  esac
  from="$vale_ls_releases/v$vale_ls_version/vale-ls-$target.zip"

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

# THE SERVER AND THE INDEX ARE PURE GO, SO THEY NEED NO COMPILER.
# [[spec/design_output/index#the-compiler-it-needs]]
# A running server holds its binary open, and Windows refuses a write over it
# and allows a rename. So a build lands beside the binary and swaps in, the old
# one steps aside until the next install clears it, and a server running it
# ends itself once it sees the swap, so its caller starts the new one.
swap_in() {
  # Go on Windows leaves the binary it replaces as a tilde backup, so both go.
  rm -f "$2.old" "$2~" 2>/dev/null || true
  if [ -f "$2" ]; then
    mv -f "$2" "$2.old" 2>/dev/null || { rm -f "$1"; return 1; }
  fi
  mv -f "$1" "$2"
}

# The one writer of frontmatter, which every ticket write reaches. A binary
# built off other source lints against rules the tree no longer carries, so a
# hash of its folder, of each tree package it imports and of the root go.mod
# and go.sum stands beside it, and a hash that moves asks for the build again.
# [[spec/design_output/lsp#the-build-beside-the-index]]
front_here() {
  if [ ! -x "$bin/se-front${exe}" ]; then return 1; fi
  have go || return 0
  sh "$root/src/scripts/go-stamp.sh" fresh se-front 2>/dev/null
}

get_front() {
  say "  building the front writer"
  (cd "$root" && CGO_ENABLED=0 go build -o "$bin/se-front${exe}.new" ./src/front/cmd) || return 1
  swap_in "$bin/se-front${exe}.new" "$bin/se-front${exe}" || return 1
  sh "$root/src/scripts/go-stamp.sh" stamp se-front || return 1
  front_here
}

# THE MODULES LAND AT THE INSTALL, SO THE FIRST CHECK FETCHES NOTHING. A stamp
# holds the checksum of every go.sum, so a changed dependency fetches again and
# a still tree asks no network. A box with no Go wants no modules.
# [[spec/tickets/the-install-fetches-go-modules]]
go_stamp="$run/go-modules"

go_sums() {
  (cd "$root" && git ls-files -z '*go.sum' | xargs -0 cat | cksum) 2>/dev/null
}

modules_here() {
  have go || return 0
  [ -f "$go_stamp" ] && [ "$(cat "$go_stamp")" = "$(go_sums)" ]
}

get_modules() {
  say "  fetching the modules the Go module names"
  (cd "$root" && go mod download) || return 1
  mkdir -p "$run"
  go_sums > "$go_stamp"
}

# A binary built off other source walks by rules the tree no longer carries,
# so the index keys on the same hash the language server keys on.
# [[spec/design_output/lsp#the-build-beside-the-index]]
index_here() {
  if [ ! -x "$bin/se-index${exe}" ]; then return 1; fi
  have go || return 0
  sh "$root/src/scripts/go-stamp.sh" fresh se-index 2>/dev/null
}

# [[spec/design_output/index#the-compiler-it-needs]]
get_index() {
  say "  building the index"
  (cd "$root" && CGO_ENABLED=0 go build -o "$bin/se-index${exe}.new" ./src/quack) || return 1
  swap_in "$bin/se-index${exe}.new" "$bin/se-index${exe}" || return 1
  sh "$root/src/scripts/go-stamp.sh" stamp se-index || return 1
  index_here
}

# THE COMMIT DOOR A PERSON MEETS. Git reads a hook out of core.hooksPath, and
# .githooks holds this tree's own, so one line points git at it. The Bash door
# holds the same check for a session, and each stands without the other.
# [[spec/design_output/private#both-doors-one-check]]
hooks_folder=".githooks"

hooks_here() {
  [ "$(cd "$root" && git config --get core.hooksPath 2>/dev/null)" = "$hooks_folder" ]
}

set_hooks() {
  say "  pointing git at $hooks_folder"
  (cd "$root" && git config core.hooksPath "$hooks_folder") || return 1
  chmod +x "$root/$hooks_folder/pre-commit" 2>/dev/null || true
  chmod +x "$root/$hooks_folder/pre-push" 2>/dev/null || true
}

# A want, rather than a need: the tree still lints and tests without it.
wanted() {
  [ "$1" = "vale-ls" ] || [ "$1" = "go" ] || [ "$1" = "go-modules" ] || [ "$1" = "git-hooks" ] ||
    [ "$1" = "index" ] || [ "$1" = "se-front" ]
}

missed() {
  case $1 in
    vale-ls) say "  vale-ls stays missing, so the editor manages its own copy." >&2 ;;
    go)      say "  go stays missing, so ./RUNME.sh tui prints plain rows." >&2 ;;
    go-modules) say "  the Go modules stay unfetched, so the first check downloads them." >&2 ;;
    index) say "  the index stays unbuilt, so find and links read the files." >&2 ;;
    se-front) say "  the front writer stays unbuilt, so every ticket write refuses until Go stands here." >&2 ;;
    git-hooks) say "  git reads its own hooks here, so a hand commit meets no privacy check." >&2 ;;
  esac
}

here() {
  case $1 in
    vale)    [ -x "$bin/vale${exe}" ] ;;
    biome)   [ -x "$bin/biome${exe}" ] ;;
    vale-ls) [ -x "$bin/vale-ls${exe}" ] ;;
    go)      have go ;;
    go-modules) modules_here ;;
    index) index_here ;;
    se-front) front_here || ! have go ;;
    git-hooks) hooks_here ;;
  esac
}

why() {
  case $1 in
    vale) say "vale: Vale holds the prose rules the write door and the linter read" ;;
    biome) say "biome: Biome formats and lints the JavaScript in this tree" ;;
    vale-ls) say "vale-ls: the Vale language server, so an editor draws the same rules" ;;
    go) say "go: it builds the viewer ./RUNME.sh tui opens the door log in, and the index" ;;
    go-modules) say "go-modules: the modules every Go module names, so the first check fetches nothing" ;;
    index) say "index: the warm model of this tree, which find and links ask" ;;
    se-front) say "se-front: the one writer of frontmatter, which every ticket write reaches" ;;
    git-hooks) say "git-hooks: the pre-commit and pre-push doors, so a commit by hand meets the privacy check and a push to main meets the battery" ;;
  esac
}

get() {
  case $1 in
    vale) get_vale ;;
    biome) get_biome ;;
    vale-ls) get_vale_ls ;;
    go) get_go ;;
    go-modules) get_modules ;;
    index) get_index ;;
    se-front) get_front ;;
    git-hooks) set_hooks ;;
  esac
}

# SE_INSTALL_SKIP names the wants a caller leaves out, so a test vehicle builds
# no index and links no editor while it proves the vehicle stands alone.
missing=""
for one in vale biome vale-ls go go-modules \
  index se-front git-hooks; do
  case " ${SE_INSTALL_SKIP:-} " in *" $one "*) continue ;; esac
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

# The steps that run JavaScript stand behind the setup verb, which the index
# runs, so this script names no runtime of its own. A box with no index skips
# them. [[spec/tickets/setup-verb-stands-red]]
index="$bin/se-index${exe}"
landed=""
[ -n "$missing" ] && landed="--landed"
if [ -x "$index" ]; then
  "$index" verb "$root/src/scripts" setup $landed ||
    say "  the setup stopped, so the editor, the survey, the Copilot setup and the brand stand as they stood." >&2
elif [ -n "$missing" ]; then
  say "  no index here, so the setup waits: bring go, and run this again." >&2
fi

[ -n "$missing" ] && say "Ready."
exit 0
