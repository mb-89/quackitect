---
kind: [[ticket]]
state: open
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
        checklist: ["every fact the change adds stands in one place, and a note points at the file instead of repeating it", "every number the change adds carries a name in one place, and a copy a technical reason forces says so beside it", "every header the change writes says what its file is for, and counts nothing", "the chapter carries the run's owner prompts and errors off the transcript, each with its time", "the chapter says the role, and carries no name, address or path of the box"]
        evidence:
          - name: done
            form: list
            says: what was done, one line a ticket or a thing
          - name: well
            form: list
            says: what went well, and what made it go well
          - name: badly
            form: list
            says: what did not go well, each error of the run and each owner prompt turning it, with its time
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
step: retro/cloud
process: [[spec/processes/group]]
process_hash: 57b2cccd0445ea9a
depends_on: [the-migration-writes-its-specs]
enabled_by: migration.phase1
record:
  - step: sync
    hand: box d7a69cb6601d7 · claude-code-remote
    hash_before: ef191748722031f7e521c65f9fb70c78629bde96
    hash_after: 319b492fc19b8cc33bc1afebdea3e909ce808be6
  - step: sync
    hand: box d7d598fb92101 · claude-code-remote
    hash_before: cc0d22d667f2e4cc30e00c7151403383dd75945b
  - step: sync
    hand: box d7d598fb92101 · claude-code-remote
    hash_before: 78c6db313bb78c3777aba655c898d03e806a86cd
    hash_after: f478158901b57c00906a51263b9b5ff3b4db4f25
    answered:
      - name: sync
        exit: 0
        said: work/the-foundation-lands-unchanged already carries every commit on main.
  - step: split
    hand: box d7d598fb92101 · claude-code-remote
    hash_before: 3e064c85f62618d412b45d64f7b37483b0e32c32
    hash_after: 3e064c85f62618d412b45d64f7b37483b0e32c32
  - step: children
    hand: the engine
    hash_before: f67d97ff5c7a88dd659f452060e6ff41bf6cc803
    hash_after: f67d97ff5c7a88dd659f452060e6ff41bf6cc803
  - step: retro/notes
    hand: box d7d598fb92101 · claude-code-remote
    hash_before: 8f709bab5d59169177b42709fc88f63adfe2acd0
    hash_after: 8f709bab5d59169177b42709fc88f63adfe2acd0
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
  - step: retro/write
    hand: box d7d598fb92101 · claude-code-remote
    hash_before: c6021f4fa4bca79718b6f548ea7a06e21bdf603e
    hash_after: c6021f4fa4bca79718b6f548ea7a06e21bdf603e
---

# Ask

Phase 1 of [[spec/design_input/the-migration-runs-in-slices#the-phases]]: the foundation, with no change in behaviour. One Go module, the pure Go driver for SQLite, the `q` core, the `/v1` door, the import check, a Windows job, and the Go frontmatter writer.

Done when the index answers `/v1` and the old API side by side, and the check stands green on Linux and Windows.

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

- [[spec/tickets/go-code-shares-one-module]], under the standard process
- [[spec/tickets/seven-go-mods-leave]], under the trivial process
- [[spec/tickets/split-tests-take-one-module]], under the trivial process
- [[spec/tickets/tidy-writes-the-go-line]], under the trivial process
- [[spec/tickets/sqlite-runs-pure-go]], under the standard process
- [[spec/tickets/the-compiler-leaves-every-caller]], under the trivial process
- [[spec/tickets/the-q-core-holds-names]], under the standard process
- [[spec/tickets/catalog-holds-name-families]], under the trivial process
- [[spec/tickets/migration-names-the-q-package]], under the trivial process
- [[spec/tickets/actions-declare-op-and-writes]], under the trivial process
- [[spec/tickets/operations-and-leases-land]], under the standard process
- [[spec/tickets/op-moves-reach-the-log]], under the trivial process
- [[spec/tickets/stale-marks-follow-the-provider]], under the trivial process
- [[spec/tickets/quack-why-answers-a-name]], under the standard process
- [[spec/tickets/why-reads-the-stale-mark]], under the trivial process
- [[spec/tickets/files-topic-reads-the-rows]], under the standard process
- [[spec/tickets/the-index-answers-v1]], under the standard process
- [[spec/tickets/v1-values-read-stale]], under the trivial process
- [[spec/tickets/serve-takes-a-catalog-seam]], under the trivial process
- [[spec/tickets/serve-callers-take-the-listener]], under the trivial process
- [[spec/tickets/start-check-runs-in-serve]], under the trivial process
- [[spec/tickets/the-import-rules-get-checked]], under the standard process
- [[spec/tickets/doors-note-names-every-analyzer]], under the trivial process
- [[spec/tickets/check-reads-provider-keys]], under the trivial process
- [[spec/tickets/ci-runs-a-windows-job]], under the standard process
- [[spec/tickets/go-writes-the-frontmatter]], under the standard process

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- each child closes on its own review, and a standard child holds one piece of the goal, a trivial one a single change
- the children cover the goal piece by piece: one module, the pure Go driver, the `q` core, the `/v1` door beside the old API, the import check, the Windows job and the Go frontmatter writer, and every child stands closed
- every child stands closed, so none waits on another and none names anything under depends_on

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

- `why-reads-the-stale-mark` closes answered by `quack-why-answers-a-name`, whose test covers the stale state
- main merges into the branch, with five conflicts resolved and the check green
- the group passes sync, split, children and notes, and every child stands closed

### well

<!-- what went well, and what made it go well -->

<!-- the form is list -->

- the handover named the answer to the stale ticket, so one read of `why.go` closed it
- the merge kept both sides, because the agent read each hunk against the diff from the merge base

### badly

<!-- what did not go well, each error of the run and each owner prompt turning it, with its time -->

<!-- the form is list -->

- no owner prompt reaches this run, and the schedule fires the stored prompt alone
- 02:04, the first command named no ticket in its description, and the door refused it
- 02:04, a landing verb followed a pipe, and `LandingFollowsItsGate` refused it
- 02:06, `git checkout --theirs` on `ticket.js` dropped this branch's side, and `checkout -m` put the conflict back
- 02:07, a regex looked for the merge's own conflict markers, where `checkout -m` writes ours and theirs
- 02:08, `git commit` ran bare, and `GitWritesThroughAVerb` refused it
- 02:10, the sync command stood in a fence, and the hand-back read no line
- 02:11, the split checklist landed three lines at warning, and the hand-back took them
- 02:12, the collect verb refused on those three warnings, and the door refused their fix

### improve

<!-- how each bad line stops happening, named by its home -->

<!-- the form is list -->

- `src/scripts/pull-writes.js`: a hand-back refuses evidence at warning, since `retro collect` refuses the same lines later
- `src/scripts/retro-collect.js`: or collect weighs warnings on passed fields apart, since no hand may fix them
- `spec/guidance/cloud`: the merge verb names `checkout -m` markers, and warns off `--theirs` on a file both sides change
- the command form under a step says it takes a bare line, not a fence

### thoughts

<!-- what the thoughts say that the actions do not, off the transcript -->

<!-- the form is text -->

The run wrote this retro off its own window, because `retro collect` stood refused. The three warnings sit on passed fields, which only the engine writes. So no hand on this branch clears them, and the check stays at warning until a verb reopens split.

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- each finding names the file that owns its fix, and repeats none of that file
- the retro adds no number, so no name for one is due
- the retro writes no header over a file
- the run's errors stand under badly with their times, and no owner prompt reaches this run
- the retro names roles and verbs, and carries no name, address or box path

## cloud

<!-- names what the box lacked, met and leaves for a person -->

### lacked

<!-- a tool, a host the proxy refused, a right the platform refused, an install, each with its moment -->

<!-- the form is list -->

### met

<!-- the trunk guard, a conflict at sync, the cap, a hook, a test that fails on the box alone -->

<!-- the form is list -->

### left

<!-- every person step parked, every ticket minted with no group, and what the handover says -->

<!-- the form is list -->

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
