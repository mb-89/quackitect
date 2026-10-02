#!/usr/bin/env sh
# THE STAMP BESIDE A GO BINARY THE INSTALL BUILDS. A binary built off other
# source walks by rules the tree no longer carries, so a stamp beside it holds a
# hash of every file its build reads: each Go and embedded file of every package
# of this module it imports, and the root go.mod and go.sum. `fresh <name>`
# answers 0 where the stamp holds the hash the source gives now, and
# `stamp <name>` writes it. [[spec/design_output/lsp#the-build-beside-the-index]]
set -eu
root=$(CDPATH= cd -- "$(dirname -- "$0")/../.." && pwd)
# The runtime folder .claude/skills/level0/lib/folders.js owns, and the bin
# folder install.sh builds into, spelled again here because a shell script
# imports nothing.
bin="$root/.se/.runtime/bin"

# The package each binary builds from, which BUILDS in go-source.js owns.
case "${2:-}" in
  se-index) package=./src/quack ;;
  se-front) package=./src/front/cmd ;;
  *) printf '%s\n' "go-stamp.sh names no binary called ${2:-nothing}." >&2; exit 2 ;;
esac
stamp="$bin/.$2-source"

# Every file the build reads, under its path from the root, so every box reads
# one hash. A package of another module rides in go.sum. Go names each file
# under its import path, which reads the same on every platform.
hash_of() {
  (
    cd "$root"
    module=$(go list -m)
    files=$(go list -deps -f '{{if and .Module .Module.Main}}{{$p := .ImportPath}}{{range .GoFiles}}{{$p}}/{{.}}
{{end}}{{range .EmbedFiles}}{{$p}}/{{.}}
{{end}}{{end}}' "$package") || exit 1
    printf '%s\n' "$files" go.mod go.sum |
      while IFS= read -r one; do printf '%s\n' "${one#"$module"/}"; done | LC_ALL=C sort |
      while IFS= read -r one; do
        [ -n "$one" ] && [ -f "$one" ] || continue
        printf '%s\n' "$one"
        cat "$one"
      done | cksum
  )
}

case "${1:-}" in
  fresh)
    [ -f "$stamp" ] || exit 1
    now=$(hash_of) || exit 1
    [ "$(cat "$stamp")" = "$now" ]
    ;;
  stamp)
    now=$(hash_of) || exit 1
    mkdir -p "$bin"
    printf '%s\n' "$now" > "$stamp"
    ;;
  *) printf '%s\n' "go-stamp.sh answers fresh or stamp." >&2; exit 2 ;;
esac
