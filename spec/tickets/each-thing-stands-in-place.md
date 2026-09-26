---
kind: [[ticket]]
state: closed
steps:
  - name: sync
    does: takes trunk into the branch, so the box works on the latest
    when: cloud
    by: agent
    needs: ["branch sync"]
    evidence:
      - name: sync
        form: command
        expects: 0
        says: branch sync, so the branch carries trunk
  - name: split
    does: reads the standing children, and mints more where the goal needs them, each naming this group
    from: anyone
    by: anyone
    input: ask
    reads: [[spec/guidance/working]]
    checklist: ["every child is small enough to review whole, or is a group itself", "the children add up to the goal, and nothing of the goal stands outside them", "a child that waits on another names it under depends_on"]
    evidence:
      - name: children
        form: list
        says: every child as a link, one a line, with its process
  - name: children
    by: children
    on_fail: split
  - name: retro
    reads: [[spec/guidance/working]]
    to: retro
    steps:
      - name: notes
        does: decides every private note on the box, and works what it mints into this group
        needs: ["retro"]
        evidence:
          - name: drained
            form: command
            expects: 0
            says: retro notes, which passes when the private folder is empty
      - name: write
        does: writes the retro over the box's own window
        input: ["children", "notes"]
        checklist: ["every fact the change adds stands in one place, and a note points at the file instead of repeating it", "every number the change adds carries a name in one place, and a copy a technical reason forces says so beside it", "every header the change writes says what its file is for, and counts nothing"]
        evidence:
          - name: done
            form: list
            says: what was done, one line a ticket or a thing
          - name: well
            form: list
            says: what went well, and what made it go well
          - name: badly
            form: list
            says: what did not, each with its moment in the log or the transcript
          - name: improve
            form: list
            says: how each bad line stops happening, named by its home
          - name: thoughts
            form: text
            says: what the thoughts say that the actions do not, off the transcript
      - name: cloud
        does: names what the box lacked, met and leaves for a person
        when: cloud
        input: write
        evidence:
          - name: lacked
            form: list
            says: a tool, a host the proxy refused, a right the platform refused, an install, each with its moment
          - name: met
            form: list
            says: the trunk guard, a conflict at sync, the cap, a hook, a test that fails on the box alone
          - name: left
            form: list
            says: every person step parked, every ticket minted with no group, and what the handover says
process: [[spec/processes/group]]
process_hash: 94d924fb96257431
step: retro/cloud
record:
  - step: sync
    hand: box b8ae1b45d463 · claude-code-remote
    hash_before: 24c5ff7c229e6eb08bfb916f0b9eda7b349e7dad
    hash_after: 13e59f68f5da41047d6aa8f1562249e208b15917
  - step: sync
    hand: box b8ae1b45d463 · claude-code-remote
    hash_before: d1e40bc5b723f3ed94d9af103fd235df1dd74b7e
    hash_after: f7b7a842d915829ede147cb7f7418ba3a1ac19ca
    answered:
      - name: sync
        exit: 0
        said: work/each-thing-stands-in-place took 25 commit(s) from main.
  - step: split
    hand: box b8ae1b45d463 · claude-code-remote
    hash_before: d66e10d5034f0ed0c7cac82d977cb1d9b6fb77af
    hash_after: d66e10d5034f0ed0c7cac82d977cb1d9b6fb77af
  - step: children
    hand: the engine
    hash_before: cfa1e932b3ef51645f8ebb55341924fa6359b8b7
    hash_after: cfa1e932b3ef51645f8ebb55341924fa6359b8b7
  - step: retro/notes
    hand: box b8ae1b45d463 · claude-code-remote
    hash_before: be58dfdcbdf973065b8ce92433c4eced3e338ee0
    hash_after: be58dfdcbdf973065b8ce92433c4eced3e338ee0
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
  - step: retro/write
    hand: box b8ae1b45d463 · claude-code-remote
    hash_before: 470baff3e4a17e49b67a9eeaf548a9253fff2a06
    hash_after: 470baff3e4a17e49b67a9eeaf548a9253fff2a06
  - step: retro/cloud
    hand: box b8ae1b45d463 · claude-code-remote
    hash_before: fca7c9488303f99ba621439a3e13ba4e64d759ab
    hash_after: fca7c9488303f99ba621439a3e13ba4e64d759ab
reason: done
---

# Ask

Each fact and each note stands in its one place, and small faults land fixed. A retro finishes what it asks, and reads what each cloud box says of its own run.

# sync

<!-- takes trunk into the branch, so the box works on the latest -->

## sync

<!-- branch sync, so the branch carries trunk -->

<!-- the form is command -->

    ./RUNME.sh branch sync

# split

<!-- reads the standing children, and mints more where the goal needs them, each naming this group -->

## children

<!-- every child as a link, one a line, with its process -->

<!-- the form is list -->

- [[spec/tickets/each-fact-keeps-one-owner]], standard
- [[spec/tickets/each-folder-holds-its-kind]], standard
- [[spec/tickets/the-retro-finishes-its-asks]], standard
- [[spec/tickets/the-retro-reads-cloud-retros]], standard
- [[spec/tickets/the-small-faults-land]], standard
- [[spec/tickets/a-promotion-names-its-fault]], trivial
- [[spec/tickets/a-promotion-ticket-reads-once]], trivial
- [[spec/tickets/callers-name-work-answer-home]], trivial
- [[spec/tickets/the-quoted-pair-stays-paired]], trivial
- [[spec/tickets/the-second-collect-keeps-lines]], trivial

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- [x] every child is small enough to review whole: each standard child passed a review of its own, and the trivial ones came from the review of `the-retro-finishes-its-asks`
- [x] the children add up to the goal: one owner a fact, one kind a folder, the small faults, and the retro's two asks each hold a child
- [x] a child that waits on another names it: the trivial children follow their parent, and the engine hands them in order

# children

# retro

## notes

<!-- decides every private note on the box, and works what it mints into this group -->

### drained

<!-- retro notes, which passes when the private folder is empty -->

<!-- the form is command -->

    ./RUNME.sh retro notes

## write

<!-- writes the retro over the box's own window -->

### done

<!-- what was done, one line a ticket or a thing -->

<!-- the form is list -->

- `each-fact-keeps-one-owner`: the cloud read, the ticket folders and the port pair each keep one owner, and both count rules widen
- `each-folder-holds-its-kind`: a file off the note end under a governed folder warns in the sweep and meets a refusal at the door
- `the-retro-finishes-its-asks`: the retro route ends on a report and a mint, and `retro read` prints a chapter's lines
- `the-retro-reads-cloud-retros`: `retro collect` gathers the retro chapter of each group closing on trunk in the window
- `the-small-faults-land`: `fix` reads its flags, the cap reads as a ceiling, and a verdict table stays a table
- the trivial children the retro review minted, each closed on its own leaf
- `vale-ls-on-windows`: a question ticket carrying the desk trial a person on Windows runs

### well

<!-- what went well, and what made it go well -->

<!-- the form is list -->

- a reviewer of its own caught the plugin import past its folder, because it read the design note on the bridgehead
- the first review of the cloud retro failed the transcript push, because it read the private rules first
- helpers took whole tickets in the foreground, so one hand at a time wrote the tree

### badly

<!-- what did not, each with its moment in the log or the transcript -->

<!-- the form is list -->

- the first ticket landed its change before its tests-red leaf, so the engine refused the red at hand-back
- a pull committed the whole working tree, and carried a half-done change of another ticket with it
- `apply.js` imported a module past the plugin folder, and the check went red at the manifest step
- the first cloud retro draft pushed raw transcripts to a ref, and the review failed it
- ticket prose carries warnings in every `checked` line, because the form asks for brackets the rule refuses

### improve

<!-- how each bad line stops happening, named by its home -->

<!-- the form is list -->

- `spec/guidance/working`: a hand writes the change after the tests-red leaf lands, never before it
- `src/scripts/pull-chapter.js`: the pull commits the ticket file alone, so another ticket's work stays out
- `.claude/skills/level0/lib/tree.js`: a rule refuses an import past the plugin folder at the write
- `spec/guidance/retro/collect.md`: a transcript stays on its box, and the retro chapter carries its account
- `spec/config/styles/VoiceParagraph/Characters.yml`: a task mark on a checklist line reads as structure

### thoughts

<!-- what the thoughts say that the actions do not, off the transcript -->

<!-- the form is text -->

The engine's order holds the work honest: a red leaf asks for a red run on a
tree where the change is missing, and a change landing early turns that into a
replay against an earlier commit. The replay stands in `.se/scripts/red-at.sh`
and runs the tip's tests over an earlier tree.

The ask for the cloud retro reads a transcript as the record of a run. The
private rules read it as the owner's names. The group's own retro chapter
answers both, so the owner reads that departure at the merge.

The scripts this box writes:

```sh
# .se/scripts/red-at.sh <commit> <test>...: runs the tip's tests over an earlier tree
at="$1"; shift
root=$(git rev-parse --show-toplevel); tmp=$(mktemp -d)
git -C "$root" worktree add --detach "$tmp/tree" "$at"
ln -s "$root/node_modules" "$tmp/tree/node_modules"
mkdir -p "$tmp/tree/.se" && ln -s "$root/.se/.runtime" "$tmp/tree/.se/.runtime"
for t in "$@"; do git -C "$root" show "HEAD:$t" > "$tmp/tree/$t"; done
out=$(cd "$tmp/tree" && node --test "$@" 2>&1)
git -C "$root" worktree remove --force "$tmp/tree"; rm -rf "$tmp"
echo "$out" | grep -q AssertionError && { echo "assertion at $at"; exit 1; }
echo "$out" | grep -q "^# fail 0" && { echo "green at $at"; exit 0; }
echo "build at $at"; exit 1
```

```python
# .se/scripts/fill.py <ticket> <step> <field> <file>: writes one field under one step
import sys, re
path, step, field, src = sys.argv[1:5]
text = open(src).read().rstrip("\n") + "\n"
s = open(path).read()
i = s.index(f"\n## {step}\n"); j = s.index(f"\n### {field}\n", i)
e = s.index("-->\n", s.index("<!-- the form is", j)) + 4
nxt = re.search(r"\n#{1,3} ", s[e:])
end = e + (nxt.start() if nxt else len(s) - e)
open(path, "w").write(s[:e] + "\n" + text + s[end:])
```

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- [x] every fact the change adds stands in one place: `folders.js` owns the ticket folder, and `port.go` the port pair
- [x] every number the change adds carries a name in one place: the port wait meets a test beside its Go owner
- [x] every header the change writes says what its file is for: the wider rule refuses a number word in a header

## cloud

<!-- names what the box lacked, met and leaves for a person -->

### lacked

<!-- a tool, a host the proxy refused, a right the platform refused, an install, each with its moment -->

<!-- the form is list -->

- the level zero tools `mcp__level0__patch` and `mcp__level0__replace` stood absent from the session, so each write went through the harness's own edit tool
- no Windows box, so the Vale path on Windows stays unproven

### met

<!-- the trunk guard, a conflict at sync, the cap, a hook, a test that fails on the box alone -->

<!-- the form is list -->

- the plugin manifest check refused an import past the plugin folder, at the first full check of `each-fact-keeps-one-owner`
- the commit door refused a code change carrying no test beside it, on the plugin fix and the Go sweep
- the engine refused a tests-red hand-back that ran green, on `each-fact-keeps-one-owner`
- the stop hook asked for a push while a helper held uncommitted work in the tree
- no conflict at sync, and no test failing on this box alone

### left

<!-- every person step parked, every ticket minted with no group, and what the handover says -->

<!-- the form is list -->

- `vale-ls-on-windows`, a question ticket with no group, carrying the desk trial a person on Windows runs
- the pages `harnesssurface_2.html`, `the-agent-pulls-tickets.html` and `the-bench-reruns-design-inputs.html` draw the folder warning, and the owner moves each
- `the-retro-reads-cloud-retros` departs from its ask lines on transcripts, and the owner reads that call at the merge
- no person step parked, and no handover written

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
