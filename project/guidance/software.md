---
id: software
statement: How to write code and record work. The universal rules; the project's own rulings live in method/engineering.md.
---

# software — how you write it

These rules bind every artifact you build.

How you TALK about it is voice.md. How you build an INTERFACE is ux.md.

This document carries what binds every piece of work. The project's own
engineering rulings live in `project/guidance/method/engineering.md`. Read
that one when you touch what it covers.

## Do not repeat (DRY)

- Single source of truth. Each fact lives in one place. Everything else points to it.
- Markdown is the truth. Anything whose truth lives in markdown keeps it Obsidian-compatible and human-editable IN THE REAL WORLD — a million-line file is not editable. Generated surfaces derive from the markdown, never the reverse. Log files are the one exception.
- Machines are drawn. A state machine's truth is its Obsidian canvas, and a person edits it in Obsidian, in the real world (owner law, 2026-07-28). The engine accepts what a person naturally draws. A mechanism that depends on metadata Obsidian does not surface to its editor is a defect — rework the mechanism, never the person.
- The truth is read LIVE (owner ruling, 2026-07-29). A running system holding a stale copy of a file it calls the single truth is enforcing a lie. Where re-reading is too expensive, cache it against the CONTENT of the files it was built from — never against size and modification time, which a same-length edit walks straight past.
- Do not repeat prose, data, or code. Not across files. Not across panels. Not within one screen.
- If two places show the same thing, delete one. A detail view should not echo what its parent already shows.
- A field that restates another field is NOISE. A statement that repeats the id, a title that repeats the name, a label that echoes the filename — strike it. Empty is better than an echo; a field is filled only when it ADDS something.
- Repeat only when strongly advised. Then say why.

## Comments and provenance

- Write comments the way people write them: only where a reader would be surprised.
- A comment states a constraint the artifact cannot show itself. Nothing else.
- Never comment that a rule was followed, who ruled it, or when. No dates. No step numbers. No law citations at application sites.
- The why lives ONCE, in its designated home: an ADR, a `decided_via`, an evidence doc, a note, the ledger. Everywhere else, the artifact just IS the consequence.
- A deliberate choice that must survive future edits gets a TEST or a LINT, not a comment. A comment is the weakest guard.
- PREFER DELETING A COMMENT TO WRITING ONE (owner ruling 2026-08-02). Nobody maintains them. An unmaintained comment goes stale, and a stale comment does not merely age — it lies, and nothing in the build catches it. More of this project's staleness has come from comments than from any other source.
- REFERENCE, NEVER COPY. Point at the one place the fact lives: a path, a condition note, a guidance file. A comment that restates what another file says has FORKED the truth, and only one fork ever gets updated.
- The test of a comment is whether it can go stale. If the code changing would make it wrong, and nothing would fail, delete it or turn it into a check.

## Guards that teach

A guard exists to move the work on, never to prove a rule. These four came
out of one day of measuring what the lane actually cost its callers.

- CORRECT WHAT IS MECHANICAL. ANNOUNCE WHAT YOU CORRECTED. REFUSE ONLY THE
  AMBIGUOUS (owner ruling 2026-08-02). A refusal over a difference nobody
  can see on screen spends a round and teaches nothing. A silent correction
  teaches nothing either. Do it, and say what you did.
- ONE TABLE, THREE OUTPUTS. Where a rule is enforced, the warning it prints
  and the tool description that announces it all generate from ONE table.
  Feed-forward and feedback cannot drift apart if there is nothing to drift
  between.
- SHIP AT WARN, BLOCK ON EVIDENCE. A new guard warns first. It only starts
  refusing once the log shows its warn rate near zero AND the lane
  demonstrably serves the job it is fencing off. A guard that blocks work
  the lane cannot yet do is a trap.
- THE AGENT THINKS ABOUT THE WORK. THE ENGINE THINKS ABOUT THE BOOKKEEPING.
  Every protocol element that spends the agent's attention on something the
  engine could carry is a defect with a deadline. The reading loop, the
  update ruling and the auto-corrections are all this law being applied.

## Dated guidance

This applies to every citation, and to your own instincts.

- Do not ask how OLD a piece of guidance is. Ask which resource it was RATIONING.
- Rations human LABOUR: suspect it. That cost collapsed once a machine started doing the work.
- Rations human JUDGEMENT or ATTENTION: it still holds. There is still one owner, and they still have to look at the diff.
- Most guidance predates AI and was written for human teams. Split it along that seam instead of quoting or discarding it whole.
- This binds the assistant's own instincts too. The training assumes writing the code is the expensive part. Where a recommendation rests on that assumption, say so rather than asserting it.

## Use the cores

The target machine has MANY cores, and always will. Twelve is the floor,
not the expectation. Work that leaves nineteen of twenty idle is a defect,
not a slow machine.

- Parallelise anything that can be parallelised. Independent work runs at
  once, by default. Sequential is the exception, and it says why.
- Size the fan-out from the machine, never from a constant. Read the core
  count at run time.
- A single-threaded step that dominates a wall clock gets SPLIT until it
  fits the cores. A test file with fifty sequential cases is one such step.
- Measure before and after. A parallel version that is not faster is
  hiding a shared resource, and the sharing is the real bug.

This binds tests hardest, because a suite is the most parallel workload a
project owns and the one whose slowness is felt every day.

## Writing tests

A suite has THREE speeds, and choosing between them is the whole craft.

- ACROSS FILES is real parallelism. The runner gives each file its own
  process, so files use every core. This is the only lever that beats a
  CPU-bound suite.
- WITHIN A FILE is cooperative. Cases share one thread, so concurrency
  there only helps work that WAITS on something outside the process. It
  buys nothing for pure computation.
- SEQUENTIAL is the exception, and it names its reason in a comment.

What decides the speed is SHARED PROCESS-GLOBAL STATE, nothing else:

- A case with its own temp root, its own server and its own fixtures is
  independent. It runs concurrently.
- A case that writes `process.env`, changes the working directory, binds a
  fixed port, or mutates the real repository is not. Its siblings would
  see the change, and the failure would be a rare one — the worst kind.

So the rules:

- PREFER MANY SMALL FILES to one large one. Files are the only unit that
  reaches a second core. A file that dominates the wall clock gets split
  by theme, and the split is worth more than any cleverness inside it.
- QUARANTINE the global-state cases in their OWN file. One case touching
  `process.env` holds a whole file sequential; move it out and the rest
  goes concurrent.
- Where every case in a file is isolated, wrap them so they run together
  and say so at the top of the file.
- NEVER share a fixture between cases to save setup. A fresh root per case
  is what makes the parallelism legal, and setup is cheap.
- MEASURE before and after. A concurrent file that is no faster was
  CPU-bound, and wanted splitting instead.
- A GUARD THAT MAKES A TOOL DO NOTHING IS INVISIBLE to a test that only
  reads that tool's output. The suite sets SE_SELFTEST_SKIP,
  SE_KEEPAWAKE_DISABLE and SE_RELOAD_DRY, and any of them can turn a
  spawned script into one line of nothing. A test that spawns a lane script
  clears the guard it needs cleared, and ASSERTS THE WORK RAN — never just
  that the output looked sound. The tell is a case that passes alone and
  fails in the suite.

And the suite is not one thing. BOOT runs a SMOKE test — seconds, proving
the engine loads and answers. The full battery proves behaviour, and that
question belongs to validation, at the end of a piece of work.

THE BATTERY IS THE EXCEPTION, NOT THE HABIT (owner ruling 2026-08-02).
Measured: about sixty full runs in one two-hour session, each piped to a temp
file and grepped for a single failure.

- SCOPED IS THE DEFAULT. Name the files the change touches. The result
  carries the counts and only the failures' detail.
- THE BATTERY IS EARNED. It runs when a change maps to no test file, when
  the last one was red, when there is no memory of one, or on demand for a
  flake hunt.
- PAST ROUGHLY A THIRD OF THE SUITE PIECEMEAL, THE ECONOMICS FLIP and the
  battery becomes the cheaper, sanctioned call. Approximating the battery
  is what makes the battery legal, so gaming the scope never pays.
- TEST TO ANSWER A QUESTION, NOT TO REASSURE YOURSELF. In most cases the
  change broke nothing, and a green run you already expected bought you
  nothing but the wall clock.

## Where things live

A directory listing is a MENU, not an index. The reader is choosing, and a
level that shows twenty things has stopped helping them choose.

- ABOUT FIVE ENTRIES PER LEVEL. It is a shape to aim at, not a count to
  enforce. Well past it, the level wants splitting.
- EVERY ENTRY MEANS SOMETHING AT ITS OWN LEVEL. A reader looking at this
  level should expect to find it here. If they would not, it belongs
  further down, with the thing it serves.
- THE FRONT DOOR IS THE STRICTEST LEVEL. The project root is what a
  stranger sees first, and it carries only what a stranger needs: how to
  start the thing, and the folders the work lives in.
- CONFIGURATION LIVES WITH WHAT IT CONFIGURES. The product's name and the
  product's colours are the product's, not the repository's.

## Sizing and records

- Size work by its CONTENT, never by an agent's time estimate. Those estimates overshoot wildly and have done so repeatedly — a day claimed, an hour spent. Do not parrot an inherited size claim either.
- Never say how long something will take unless you have a measurement. "Roughly a day" from feel is not an estimate; it is a guess wearing one's clothes.
- Size the vehicle before choosing it. An expedition and an iteration are each worth ROUGHLY A DAY of agent work. Anything smaller goes INSIDE one.
- Never spam the archives with many small records. Bundle related small work into ONE expedition or iteration. An archive reader does not care about ten-per-day granularity.
- A single small fix never earns its own record. It is a commit inside an expedition that is already open, or inside one opened to hold the day's work.
- AN EXPEDITION THAT BECOMES THE DAY'S BUCKET SAYS SO IN ITS GOAL. Bundling is right, and it quietly makes the goal a lie: an expedition opened to put the system into VS Code ended up holding a handover law, a rigor column, log paging and a palette file. Nobody looking for those would look there. Amend the goal when the bundle grows past it, or the archive keeps the work and loses the thread.
- Commits stay fine-grained. Records do not. The two answer different questions.
