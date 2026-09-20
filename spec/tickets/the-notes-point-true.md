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
    does: mints the children, or assigns standing tickets, each naming this group
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
process_hash: 3c35c048932fd579
step: retro/cloud
record:
  - step: sync
    hand: box 1670436ae0bb · claude-code-remote
    hash_before: 755d043c1c6aed5c3de31802fd11036d1226ef27
  - step: sync
    hand: box 1670436ae0bb · claude-code-remote
    hash_before: 941b12c531dce1b1f0dff4a8d998ff88602155bf
    hash_after: e7a38e81128a6d9534245818278b0261624815a7
    answered:
      - name: sync
        exit: 0
        said: work/the-notes-point-true already carries every commit on main.
  - step: split
    hand: box 1670436ae0bb · claude-code-remote
    hash_before: 2e905e779f839762f0bc1e051581662e21e9a702
    hash_after: 2e905e779f839762f0bc1e051581662e21e9a702
  - step: children
    hand: the engine
    hash_before: d2517cc7319f99547318e4b2d44eb9595f3cc416
    hash_after: d2517cc7319f99547318e4b2d44eb9595f3cc416
  - step: retro/notes
    hand: box 1670436ae0bb · claude-code-remote
    hash_before: 8206370d0d5ebbb9cb82a0f88924f2a3c6391f38
    hash_after: 8206370d0d5ebbb9cb82a0f88924f2a3c6391f38
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
  - step: retro/write
    hand: box 1670436ae0bb · claude-code-remote
    hash_before: e1380ffae1afb765b0451f3b532ff0ca4ed26ae3
    hash_after: e1380ffae1afb765b0451f3b532ff0ca4ed26ae3
  - step: retro/cloud
    hand: box 1670436ae0bb · claude-code-remote
    hash_before: 38f9f361292308180e0ecf39bef57938a2426a74
    hash_after: 38f9f361292308180e0ecf39bef57938a2426a74
reason: done
---

# Ask

A reader follows a pointer and lands where it says. A check nobody holds says so in the log, and the window's parts stand apart, one folder a tab.

# sync

<!-- takes trunk into the branch, so the box works on the latest -->

## sync

<!-- branch sync, so the branch carries trunk -->

<!-- the form is command -->

./RUNME.sh branch sync

# split

<!-- mints the children, or assigns standing tickets, each naming this group -->

## children

<!-- every child as a link, one a line, with its process -->

<!-- the form is list -->

- [[spec/tickets/a-pointer-resolves]], on [[spec/processes/standard]], closed
- [[spec/tickets/the-unknown-runs-stays-quiet]], on [[spec/processes/standard]], closed
- [[spec/tickets/the-window-splits-by-tab]], on [[spec/processes/standard]], closed

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- every child is small enough to review whole, or is a group itself. Each child stands on the standard route, and a verdict hand read each one whole.
- the children add up to the goal, and nothing of the goal stands outside them. The three children the ask names are the three standing, and the ask names no fourth.
- a child that waits on another names it under depends_on. None waits on another, so none names one.

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

- [[spec/tickets/a-pointer-resolves]]: the server gains `EveryPointerResolves`, which follows every pointer a tracked file writes into its chapter, and the tree loses every dead pointer
- [[spec/tickets/the-unknown-runs-stays-quiet]]: the stop door writes one warn line a rule naming a check it holds nowhere, and `never` joins its checks
- [[spec/tickets/the-window-splits-by-tab]]: the window's one package becomes the six the chapter names, a tab owns its state, and every import runs down
- the commit door passes a hunk adding comment lines alone, with its case
- the server note gains the chapters its code pointed at, and the tree note names the order a finding list takes
- trunk comes into the branch, and the split carries trunk's held place, its cloud inheritance and its route tones
- three private notes decided: one done, and two became [[spec/tickets/the-links-verb-tries-yaml]] and [[spec/tickets/one-reader-judges-a-verdict]]

### well

<!-- what went well, and what made it go well -->

<!-- the form is list -->

- the review hands read the ask against the code and found what the drafter left out, because each round read the earlier findings and the tree as it stood
- the pointer gate found a dead pointer the scan of this box missed, because the rule reads a note's front and the scan read the body alone
- the layout case in `src/tui/layout_test.go` reads the chapter's table as a map, so the chapter stayed the one list through six review rounds
- the check stayed green at every hand-back, because each step ran the tests it touched before the pull ran the battery

### badly

<!-- what did not, each with its moment in the log or the transcript -->

<!-- the form is list -->

- the commit door refused the change hand-back on a-pointer-resolves for comment-only repoints in eight files, in the record of that step, and the fix to the door rode a ticket about pointers
- a refused commit put the staging back, and the next lint read the old paths of the moved window files as empty Go, in the log at the window's change step
- the window split's design took six review rounds and its verdict six, each round naming names the last left behind, in the ticket's record
- the mechanical rename of the frame's files reached prose and pointers in comments, in the transcript at the split's first pass, and every file came back rewritten by hand
- a claim in a reflect said a probe turns a case red, and no probe had run, in the fifth verdict's record
- the private notes stood behind the group's own leaf until each took the tag, in the transcript at the retro's notes step
- `./RUNME.sh branch review` failed in every verdict on a plugin file its worktree lacks, in each verdict's findings

### improve

<!-- how each bad line stops happening, named by its home -->

<!-- the form is list -->

- the commit door reads a hunk adding comment lines alone as no code, in `.claude/skills/level0/lib/tested.js`, and this branch carries it
- a refused hand-back leaves the staging as it stood, in `src/scripts/pull.js`, so the lint reads the tree the hand left
- a rename lists every name it touches and searches the notes, the case messages and the data keys for each before the hand-back, in [[spec/guidance/code/refactoring]]
- a rename runs over code lines alone and leaves a comment and a pointer as they stand, in the hand's own script under `.se/scripts`
- a reflect names what a probe answered, and no probe it never ran, in [[spec/guidance/review/reviewing]]
- a note a hand mints names its group, so the pull hands it to the retro without the tag, in `src/scripts/ticket.js`
- `./RUNME.sh branch review` builds its worktree with the plugin file git leaves out, in `src/scripts/work.js`

### thoughts

<!-- what the thoughts say that the actions do not, off the transcript -->

<!-- the form is text -->

The review rounds on the window split read as a long tail. Each hand found a
smaller thing than the last, and each thing was real. A rename touches more
readers than the code: the notes, the case messages, the data keys, the
tables. The class named in the second reflect held through the sixth round,
and a search before the hand-back would have closed it in one.

The pointer gate paid for itself on its own branch: it found a dead pointer
in a closed ticket's record, and every review hand read the notes it repointed.

The scan this box wrote before the rule stood, under `.se/scripts`, read the
tree the way the rule does now, and the rule replaced it:

~~~
// Every [[pointer]] a tracked file writes, and where each one lands.
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { slugOf } from "../../.claude/skills/level0/lib/slug.js";
const files = execSync("git ls-files", { encoding: "utf8" }).split("\n").filter(Boolean);
const set = new Set(files);
const ids = new Map();
for (const n of files) if (/\.(md|ya?ml)$/.test(n)) ids.set(n.replace(/^.*\//, "").replace(/\.(md|ya?ml)$/, ""), n);
const folders = new Set();
for (const f of files) { const parts = f.split("/"); for (let i = 1; i < parts.length; i++) folders.add(parts.slice(0, i).join("/")); }
function headingsOf(path) {
  const out = new Set(); let fence = false;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    if (/^\s*```/.test(line)) { fence = !fence; continue; }
    if (fence) continue;
    const m = /^#{1,6}\s+(.*)$/.exec(line); if (m) out.add(slugOf(m[1]));
  }
  return out;
}
function resolvePath(name) {
  name = name.trim().replace(/^\/+|\/+$/g, "");
  for (const said of [name, name + ".md", name + ".yaml", name + ".yml"]) if (set.has(said)) return said;
  if (ids.has(name)) return ids.get(name);
  if (folders.has(name)) return name;
  return "";
}
for (const f of files) {
  const text = readFileSync(f, "utf8");
  const isNote = f.endsWith(".md");
  text.split("\n").forEach((line, i) => {
    const scan = isNote ? line.replace(/`[^`]*`/g, "") : line.slice(Math.max(0, line.search(/(^|\s)(\/\/|#|\*|<!--)/)));
    for (const m of scan.matchAll(/\[\[([^\]]*)\]\]/g)) {
      const [path, anchor] = m[1].trim().split("#");
      const at = resolvePath(path);
      const dead = !at || (anchor !== undefined && !(at.endsWith(".md") && headingsOf(at).has(anchor.trim())));
      if (dead) console.log(`${f}:${i + 1}\t${m[1]}`);
    }
  });
}
~~~

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- every fact the change adds stands in one place, and a note points at the file instead of repeating it. The pointer rule's chapter holds its reading, the tree rules table points at it, and the window's chapter holds the packages' one list.
- every number the change adds carries a name in one place, and a copy a technical reason forces says so beside it. The widths, the wheel step, the floor width, the poll and the no-sort mark each carry a name, and the held place spelled again in Go says why beside it.
- every header the change writes says what its file is for, and counts nothing. Each new file opens on what it holds, and none counts its lines or its sections.

## cloud

<!-- names what the box lacked, met and leaves for a person -->

### lacked

<!-- a tool, a host the proxy refused, a right the platform refused, an install, each with its moment -->

<!-- the form is list -->

- nothing: every tool the tree names stood, the proxy refused no host, and every install ran at the first take

### met

<!-- the trunk guard, a conflict at sync, the cap, a hook, a test that fails on the box alone -->

<!-- the form is list -->

- a conflict at sync, in seven files, where trunk moved the window's places and tones and the branch moved the files
- the commit hook, which refused comment-only repoints once and a code change whose test landed a step earlier twice
- `./RUNME.sh branch review`, which fails in its worktree on a plugin file git leaves out, so every verdict hand read git and the check by hand

### left

<!-- every person step parked, every ticket minted with no group, and what the handover says -->

<!-- the form is list -->

- no person step parked
- [[spec/tickets/the-links-verb-tries-yaml]] minted with no group, on the trivial route, for the index to resolve a process pointer with the ending off
- [[spec/tickets/one-reader-judges-a-verdict]] minted with no group, on the standard route, for the pull to read a hand-back's fields at the lint's level
- the handover says the branch stands at done, with the check green on its tip and trunk taken in

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
