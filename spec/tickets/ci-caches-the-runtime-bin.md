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
    hash_before: 85c81a1151939fb4ac242bf317cc27fc981bce82
    hash_after: 85c81a1151939fb4ac242bf317cc27fc981bce82
    answered:
      - name: tests
        exit: 0
        said: green, src/modules/check passes
      - name: check
        exit: 0
        said: "   61.3  in all"
    inputs:
      - name: ask
        hash: 26f83c4fce8dd9b0
        size: 552
    def: df12650931d480c9
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

The check, dispatch and update workflows cache `.se/bin`, a folder `install.sh` no longer writes, so every run misses the cache and fetches Biome again. The update key still names the vale the tree dropped. Each workflow caches the Biome binary under `.se/.runtime/bin`, keyed on the Biome version.

The gain is a cache step that saves the download it names.

Without it every run fetches Biome, and the comment above the step says false.

- no workflow under `.github/workflows` caches `.se/bin`
- no cache key names vale
- `./RUNME.sh check` is green

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

    ./RUNME.sh test src/modules/check

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The check, dispatch and update workflows cached .se/bin, which install.sh moved to .se/.runtime/bin, so each run missed the cache and fetched Biome again. Each workflow now caches .se/.runtime/bin/biome*, the Biome binary alone, since se-index builds from source under its own stamp. A step reads biome_version out of install.sh, and the key names it, so the pin stands in install.sh alone and a bump fetches once. The vale part of the update key leaves with the vale the tree dropped. No test reads a workflow, so the module check stands as the tests line, and the next CI run on this branch shows the cache step saving.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: each workflow caches the runtime Biome under a key read off install.sh
- the cleanup the change reveals stands in the change: the stale vale key part and the false comment go
- every fact the change adds stands in one place: the Biome pin stays in install.sh, and the key reads it

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
