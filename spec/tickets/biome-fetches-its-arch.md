---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: anyone
    by: anyone
    to: retro
    input: ask
    tags: ["code", "testing"]
    needs: ["branch test"]
    checklist: ["the change follows the ask, or the discussion says why it departs", "the cleanup the change reveals is in the change, or is a note of its own", "every fact the change adds stands in one place, and a note points at the file instead of repeating it"]
    evidence:
      - name: tests
        form: command
        expects: green
        says: the tests that cover the change, or the check where it touches no code
      - name: check
        form: command
        expects: 0
        says: the check is green on the commit
      - name: says
        form: text
        says: what changes and why, for a reader who was not there
process: [[spec/processes/trivial]]
process_hash: 2b5ab398855a1aba
group: tests-and-ci-hold
step: do
record:
  - step: do
    hand: box af15433560d6 · claude-code-remote
    hash_before: 4a113d6eb735356e28028a71d2a63e7d50b58264
    hash_after: 4a113d6eb735356e28028a71d2a63e7d50b58264
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes
      - name: check
        exit: 0
        said: "   62.5  in all"
    inputs:
      - name: ask
        hash: 79a41d046981affa
        size: 733
    def: df12650931d480c9
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

`get_biome` in `install.sh` reads the machine's arch for macOS alone, so a Linux arm64 box fetches the x64 binary, and `here biome` counts it installed because it tests the execute bit alone. Linux fetches the asset its arch names, and `here biome` asks the binary its version.

The gain is a lint that runs on an arm Linux box, and an install that fetches again where the binary cannot run.

Without it every lint on an arm Linux box fails on an exec format error, and the install never fetches again.

- `get_biome` names `biome-linux-arm64` on an aarch64 Linux box and `biome-linux-x64` on x86_64
- `here biome` passes only where `biome --version` exits 0
- a test reads the asset name per arch, under `go -C src/quack test ./...`

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

    ./RUNME.sh branch test

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

get_biome in install.sh names biome-linux-arm64 on an arm Linux box and biome-linux-x64 elsewhere on Linux, as the macOS branch already read the arch. here biome now asks the binary its version beside the execute bit, so a binary built for another machine reads as missing and the install fetches again. TestTheInstallFetchesTheBiomeItsMachineRuns in src/quack/session_start_test.go runs the real install.sh under a fake uname and curl: an arm box, an x86 box, a standing binary that cannot run, and one that answers. Against the old install.sh the arm case and the cannot-run case failed. The checksum the finding sketched stays out: get_biome runs only where no working binary stands, and curl -f fails on a cut transfer, so the verifier judged that half weak.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask; the pinned checksum of the fix sketch stays out, for the reason the says field gives
- the cleanup the change reveals stands in the change: none further
- every fact the change adds stands in one place: the comment in here points at this ticket

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
