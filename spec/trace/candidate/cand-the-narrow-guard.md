---
minted_in: i54-everything-exported-has-a-door-a-sweep-o
id: cand-the-narrow-guard
type: "[[candidate]]"
name: The narrow guard
statement: two callers read one rule, one at the write and one over the tree
picks:
  - "[[opt-the-write-time-guard-judges-only-the-write-in-front-of-it]]"
---

## Why this one

It is the shape the requirements were written for, and drawing it makes that
assumption arguable rather than inherited.

WHAT IT IS FOR. Catching a departure while the author is still there, without
making every write pay to read the whole rule. The split is by what each caller
may LOOK at, not by what each may decide.

WHAT IT TRADES AWAY. A break that arrives without a write is invisible until
the sweep runs, and the length of that window is the sweep's interval. It also
leans on every departure-adding write passing through a path-carrying verb,
which this record could not probe and which the shell already breaks.

## How it works

The shape already stands in this tree for one rule. Composing this candidate is
generalising it, not inventing it.

### The one module

[deliverable/engine/widgets.ts](deliverable/engine/widgets.ts) is 186 lines and
holds the whole rule for widget markup. It exports six things, and the split
between them is the seam this candidate copies.

- `emitsWidget(text)` — the predicate. It reads ONE string and answers yes or
  no.
- `surfaceFiles()` — what the registry names.
- `exempted(root)` — what the departure list declares.
- `emitters()` — every file in the governed set that trips the predicate.
- `guardNoUnregisteredEmitter(...)` — the write-time caller.
- `strays(root)` — the sweep's caller.

The predicate is called from three places, all inside the module. No caller
outside it holds a copy.

### The three callers

- [deliverable/engine/files.ts:449](deliverable/engine/files.ts) — the write
  path, one line, inside the write itself.
- [deliverable/engine/bin/sweep.ts:94](deliverable/engine/bin/sweep.ts) — the
  sweep over the tree.
- [deliverable/tests/widget-emitters.test.ts:19](deliverable/tests/widget-emitters.test.ts)
  — the test, which asks the sweep's question and nothing else.

Three, not two. The test is a caller like the others, and it reads the same
rule rather than restating the expected answer.

### What each caller may look at

This is the seam, and it is about REACH rather than about authority.

- The write-time caller is handed the root, one path, and the content being
  written. It reads at most one file from disk, the one it is about to
  overwrite, at [widgets.ts:154](deliverable/engine/widgets.ts).
- The sweep is handed the tree. `emitters()` reads every engine `.ts` file to
  run the predicate over it.

Neither decides anything the other does not. Both consult the same registry and
the same departure list.

### What generalising it means

The module's shape carries over unchanged. What changes is the predicate and
the two lists.

- `emitsWidget` becomes a predicate over a conversation: does this reach the
  disk, the web, or a version of the tree.
- `surfaceFiles()` becomes the set of modules that hold each door.
- `exempted()` becomes the departure list, and it already demands a reason on
  the same line.

### The one place the two callers already disagree

[widgets.ts:154](deliverable/engine/widgets.ts) lets a write through when the
file ALREADY tripped the predicate. That is deliberate — eighteen files emit
today, and a guard that froze them would block the repair as well as the fault.

`strays()` at line 184 has no such clause. It reports those eighteen files.

So the write path is permissive where the sweep is strict, ON PURPOSE, and the
difference is one line rather than two rules. That is what the split is for.

## What it costs

### The build

One module in the shape of `widgets.ts`, plus one call line in the write path
and one in the sweep. The rough size is the smaller half of the record, and the
existing module is the worked example to copy.

### The run, at the write

Four cheap tests, then at most one `existsSync` and one `readFileSync` of the
target file. It never reads the tree.

The measured budget is one second per lane call. Observed writes run at 4 to 12
milliseconds. A content-only check has two orders of magnitude of headroom.

A CORPUS-READING CHECK HAS NEVER BEEN EXERCISED AT WRITE TIME, and this
candidate is chosen so that it never has to be.

### The run, at the sweep

`emitters()` reads every engine `.ts` file. The whole sweep measured 974
milliseconds over 3053 nodes, which is the cost of the current rule set and not
of this one alone.

### The freedom it takes away

A departure has to be written down in one file, in a shape somebody else picked.
An author who wants a reach and has a reason cannot simply take it.

### The failure mode that decides viability

A departure written through a channel the write path cannot see. The shell is
such a channel today, and it is registered as an open issue rather than
guessed at.

It fails silently, and it fails toward permission. The sweep is what catches
it, and the window is the sweep's interval.

## What it leans on

- [[raid-asm-every-write-that-adds-a-departure-passes-through-the-lane]] —
  registered, unprobed, and one counterexample already stands: the shell
  writes with no path to judge.
- [[raid-asm-an-exemption-key-reads-the-same-on-every-platform]] — unprobed. It
  needs a machine this container is not. `widgets.ts:149` already normalises
  backslashes, which is evidence the question is real.
- [[raid-asm-an-author-refused-at-write-time-states-a-usable-reason]] — the
  kill criterion. The supporting sample is one line: the whole tree carries a
  single declared widget exemption.
- [[raid-asm-every-export-in-this-tree-is-declared-statically]] — probed, and
  it holds. 984 exported declarations across 156 files, zero computed.
