---
form: the-sweep-reports-every-undeclared-reach
by: agent
signed_off: 2026-08-26T14:07:38.348Z
authors: agent
files: null
---

# Evidence form / the-sweep-reports-every-undeclared-reach

## current_situation

The sweep asks the rule module the same questions the write guard asks, over the whole tree. It runs and its output is real.

```
door keeping-a-record-on-disk WARNS — 81 undeclared reach(es)
entry points WARN — 4 that nothing invokes
sweep green, with 85 warning(s) above
```

### It warns rather than refusing, and that is the craft rule's own ladder

81 modules reach the disk conversation with no departure declared. Moving them is a record of its own, registered as the ratchet gap.

A new guard warns first, and only starts refusing once its warn rate is near zero. Blocking now would fail every boot for a state nobody has had a chance to fix, which the craft rule names as a trap.

The line it prints says what would make it block, so the ladder is in the output rather than only in a document.

### It states its own blind spot in the same breath

The warning quotes the door's `governs` line: the rule sees a module importing `node:fs` and cannot see one reaching disk through a spawned process, because a command carries no path to judge.

A reader of the output therefore learns the limit at the moment they are reading the finding.

### It carries no copy of anything

Both crossings go through the rule module. The sweep never opens `deliverable/machines/doors.md` itself, so two readers of one file cannot drift.

### It rides an existing pass

The cost spike measured three classes of rule spanning two orders of magnitude. This one reads the engine's own TypeScript files rather than the spec corpus, so it rides the widget guard's pass, which already walks that tree.

Measured: 2214 ms for the whole binary against 1660 ms for the corpus phase, so the door and entry-point halves together cost about half a second on the first run.

## built

`deliverable/engine/bin/sweep.ts` gains two report blocks.

One per door, listing the first ten undeclared reaches with a count of the rest and the remedy. One for the entry points nothing invokes, listing all four.

Both are counted into the closing line, so a green that carries warnings says so rather than reading as clean.

One bug was found and fixed in the same chunk: the loop passed the root where the door id belongs, so `door()` threw. It surfaced as a `sweep.ts --help` failure in the widened help guard, which is the guard built two chunks earlier catching the chunk being built now.

The machine commits.

## follow_up

- The write path wiring is the last chunk. Both guards go in beside the widget guard with no condition around them.
- The 81 undeclared reaches are the ratchet gap. Registered as `raid-risk-seventy-nine-modules-cannot-reach-a-door-in-one-step-and-nothing-ratchets`, and the entry names the trap of answering it by folding a frozen set into the departure list.
- The four unreached entry points each need an answer: a door, a deletion, or the invocation somebody forgot. That is the owner's call.
- Nothing watches the sweep's own runtime. It is now 2214 ms against a two-second line that the corpus half alone used to clear. Registered as `raid-risk-the-sweep-s-own-runtime-has-no-criterion-watching-it`.

## anything_else

The runtime figure deserves saying plainly rather than burying.

The sweep was 1350 to 1422 ms before this chunk. It is 2214 ms after it. The trigger on `raid-asm-the-conformance-checks-stay-affordable-as-the-corpus-grows` names any sweep past two seconds, and this crosses it.

That trigger has now fired twice in one record. The first time was the corpus passing three thousand nodes, which nobody read until a spike went looking. This time the cause is a rule this record added.

The cost spike predicted it: a rule that walks and reads a tree itself costs about a hundred times one that reads parsed frontmatter. This one walks the engine tree twice, once for reachers and once for entry points.

Folding those two walks into one is the obvious fix and it is not in this chunk. It belongs with the criterion that would have caught it.
