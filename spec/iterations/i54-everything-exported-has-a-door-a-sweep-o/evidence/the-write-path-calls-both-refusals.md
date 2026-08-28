---
form: the-write-path-calls-both-refusals
by: agent
signed_off: 2026-08-26T14:08:02.815Z
authors: agent
files: null
---

# Evidence form / the-write-path-calls-both-refusals

## current_situation

Both refusals stand in the lane's own write path, beside the widget guard.

```
guardNoUnregisteredEmitter(root, path, content, SRC);
guardNoUndeclaredReach(root, path, content, SRC);
guardDepartureHasReason(root, path, content, SRC);
```

### No condition stands around them

That is the point of this chunk rather than a detail of it. `req-no-setting-disables-every-rule-at-once` forbids a blanket switch, and a caller that wrapped a guard in its own test would have MOVED the switch rather than removed it.

So the three calls sit in a row, unguarded, at the last point before anything lands.

### They take the shape the call site already knew

`(root, path, content, source)` is what `guardNoUnregisteredEmitter` already takes. Giving the new pair a different arity would make one call site learn two shapes for one job.

That is why `guardDepartureHasReason` keeps a root it does not use. It judges the content being written rather than the tree, and the parameter reads as `_root` to say deliberately unused rather than forgotten.

### What this makes true

A write that turns a quiet engine module into one reaching a governed conversation is now refused, with the patch that declares it handed back.

A write that adds a departure line carrying a path and no reason is now refused, naming the file, the line and the path.

The seven chunks of the build drawing are complete.

## built

`deliverable/engine/files.ts` gains two guard calls and one import.

The import line pairs them with the widget guard so a reader sees the three rules together.

The machine commits.

## follow_up

- Verification comes next and spawns fresh eyes. That is where the cost of walking this build myself is paid back.
- The prompt layer is stale because this record edited `guidance/refusals.md` to add two clause sections. `se_prompt_place` is not legal in a build state, and preflight names it as the remedy, so the walk will reach it.
- A full run is in flight. Two failures stand at the time of writing, one of them the drift ceiling that predates this record.

## anything_else

### What the build actually delivers, in one place

- One module states each conversation's rule once and answers four questions about it.
- Two refusals read that module and hold no copy of any predicate.
- One departure list a person edits, where a line without a reason cannot exist.
- One whole-tree sweep that asks the same questions and reports what the write guard cannot see.
- The entry points counted from the tree rather than from a list of six.

### What it deliberately does not deliver

The outward door. The sixth kickoff goal asks for one, and the prototype gate logged as a dissent that the goal is served by a count of 17 modules and no probe at all.

The ratchet. 81 modules reach the disk conversation and nothing here moves them in stages.

Both are registered rather than quietly dropped, and the build drawing says why neither was seeded.
