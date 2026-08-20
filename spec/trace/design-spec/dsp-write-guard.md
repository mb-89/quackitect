---
minted_in: i6-conformance-goes-mechanical-checks-bind-
id: dsp-write-guard
type: "[[design-spec]]"
statement: one pass over the content a write carries, answering refuse or land-with-findings, with the rules read from the corpus rather than compiled into the engine
realizes:
  - el-walk-engine
files:
  - deliverable/engine/guard.ts
  - deliverable/engine/rules.ts
  - deliverable/engine/vocabulary.ts
  - deliverable/engine/sweep.ts
  - deliverable/engine/bin/sweep.ts
  - deliverable/engine/files.ts
  - deliverable/engine/tools.ts
---

## One realizes edge was removed, and it is worth saying why

`if-satellite-to-walk-engine` was named here and no longer exists. The core-and-satellite subsystem was cut from this branch — its code, its design spec and its elements are all gone — and the interface node was the last file left behind. i5 removed it and recorded the finding as raid-iss-a-cut-subsystem-left-its-interface-node-behind.

WHAT THE GUARD STILL DOES IS UNCHANGED. The crossing this edge named was one caller reaching the guard, and the guard sits where it always did.

## Responsibility

The check that stands between a write verb being called and anything
landing. One question asked of the incoming content, and the answer
picks one of three outcomes.

- REFUSE, typed, with the file, the line, the value and the fix.
- LAND, with what the corpus already carried reported on the result.
- LAND CLEAN.

## Behavior and constraints

- IT READS THE CONTENT BEING WRITTEN, never the file on disk. A check
  that runs after the write has prevented nothing.
- IT USES THE SAME YAML PARSE EVERY READER USES. Four import sites all
  take the same package today; the guard joins them rather than adding a
  fifth. A guard more lenient than a reader is a false assurance.
- THE SEAM IS WHO CAUSED IT, not severity. A break that arrived with
  this write refuses; one the corpus already carried reports.
- A RULE THAT DECLARES NO WAY FORWARD DOES NOT ARM. Three are accepted:
  report instead of refuse, accept a signed answer, carry.
- NO FLAG CLEARS IT. `force` is for a flake hunt in the test lane and
  has no meaning here.
- A CORPUS-WIDE SUBJECT NEVER REFUSES. It reports, through the sweep.

## The four files, and what each holds

- `guard.ts` — the one pass. Takes the path and the incoming content,
  returns refuse or land-with-findings. Everything else feeds it.
- `vocabulary.ts` — the enumerable keys and their allowed words, read
  from the same place the downstream checks read them. This is the file
  that would have refused `status: part-closed` at the write.
- `rules.ts` — rules declared on corpus nodes, loaded and bound. This is
  where `req-a-check-binds-without-engine-code` lives or fails: adding a
  rule must touch no file in this list.
- `sweep.ts` — the whole-repo runner. `se_lint` takes one file per call
  today while its own description promises a pass over everything.

## The crossing this spec used to realize, and why there is none now

IT NAMED `if-satellite-to-walk-engine`, an interface whose source element was
`el-satellite`. That element has never existed in the committed record, and the
satellite architecture it came from was never chosen.

SO THE CROSSING IS INTERNAL RATHER THAN OWED. `el-walk-engine` implements
`guard-a-write` itself, which means the write and the guard that judges it live
in one element and no interface is demanded between them.

WHAT SURVIVES UNCHANGED is the synchronous property and its reason: the answer
decides whether the write happens at all, so the caller waits. That is a
property of this design rather than of a crossing.

THE INTERFACE WAS DELETED AT i9, 2026-08-19, because it blocked the element
matrix in every iteration and could not be repaired without inventing an element.
note-723fa9d36107 carries what it was for.

THE SPEC CHECK FOUND THE OMISSION. The first version of this node named
only the element, and the submit refused with the interface named. An
interface no design realizes is a crossing nobody built.

## What changes in the files that already exist

- `files.ts` calls the guard before it writes, and returns its findings
  on the result.
- `tools.ts` gains nothing per rule. If it does, the constraint failed.

## The measurement this design rests on

A WRITE COSTS 4 TO 12 ms TODAY against a 1000 ms budget, measured over
twelve consecutive `se_file_write` calls from the call log's own
`duration_ms` on 2026-08-16.

THE UNMEASURED HALF IS THE CORPUS READ. `guard.ts` and `vocabulary.ts`
need no corpus and are provably cheap. `rules.ts` reads nodes, and the
first chunk takes that number before anything commits to it.

IF IT DOES NOT FIT, `rules.ts` moves behind `sweep.ts` and the write
reports rather than refusing. That fallback is named in
`req-a-check-too-slow-for-the-write-moves-to-the-sweep` rather than
improvised.

## The conformance sweep

THE CONFORMANCE SWEEP, as a condition script (exit 0 = green).

  node deliverable/engine/bin/sweep.ts --root <project root>

THERE IS NO VERB FOR THIS, ON PURPOSE (owner ruling 2026-08-16). A verb an
agent can call is a verb an agent will call, over and over, and the whole
point of moving a check out of the write is that it costs too much to run
per write. So the sweep runs where the ENGINE decides, at moments that are
mechanically clear:

  - THE BOOT, in prepare_idle's exit, beside preflight and the smoke test.
    Every session starts on a corpus somebody has read.
  - sweep-consistency's OWN EXIT. That row's job is "everything this
    iteration changed is re-documented where it is taught", and it is
    floor: true — never struck at any size. The findings land in front of
    the state whose job is fixing them.
  - THE TEST DECISION, when the diff is mostly DOCUMENTS. `decideScope`
    already reads what changed to size a test run; a diff of prose and trace
    nodes is exactly the change a test battery says nothing about and a
    sweep says everything about.

WHAT IT REPORTS. Four kinds, all from sweep.ts: a node that will not parse,
a value outside its key's vocabulary, a rule with no way forward, and a rule
bound to a node the corpus does not hold.

EXIT 1 ON FINDINGS, because a condition script's exit code IS the condition.
The write guard REPORTS a standing break and lands the write
(req-a-standing-break-reports-and-lands); the sweep is where the same break
finally blocks something, and the thing it blocks is leaving a state whose
job was to clear it.

## The engine corrects what is mechanical and says so

THE ENGINE CORRECTS WHAT IS MECHANICAL AND SAYS SO (owner ruling
2026-08-02). The commonest 0-match cause is INVISIBLE: a CRLF file
against an old_string written with LF. The old behaviour diagnosed it
and refused anyway — one round-trip spent re-copying text that differs
in nothing a model can see. Now: when the strings match under the
file's own line endings, the patch is applied in those endings and the
correction is NAMED on the result. Whitespace near-misses still refuse
— collapsed indentation is a real difference, not an encoding one.

## A function replacement

A FUNCTION REPLACEMENT, NEVER A STRING (found 2026-08-07, the hard way).
String.replace reads dollar sequences in a STRING replacement as
instructions:   const next = w.op.replace_all === true ? w.current.split(oldStr).join(newStr) : w.current.replace(oldStr, newStr); is the match, $1 a group, and dollar-backtick is
everything BEFORE the match. new_string is DATA — code, prose, a regex
someone is editing — and it must never be read as an instruction.

What it did: two engine files were spliced full-length into themselves
by patches whose new_string happened to contain a regex ending in
dollar-backtick. Both doubled in size, both still "applied" cleanly, and
the only signal was a parse error hundreds of lines away.

split().join() was already safe; join takes its argument literally. Only
the single-replacement path was exposed, which is why replace_all never
showed it.

## The round-trip verify

THE ROUND-TRIP VERIFY (owner ask 2026-08-07: escaping kept eating
writes, and every instance was silent). new_string is DATA and must
land verbatim. If the applied buffer does not contain it, something
between the tool boundary and the buffer transformed it — refuse
rather than report a success that is not one. This catches the CLASS,
including whatever eats the next one.

## The write guard

THE WRITE GUARD. One pass over the content a write carries, before anything
lands. It answers refuse or land, and the refusal names the file, the line,
the value and the fix.

WHY IT READS THE CONTENT AND NOT THE FILE. A check that runs after the write
has prevented nothing — the corpus was broken for however long the complaint
took to arrive, and every reader in between saw it.

THE COST IS THE WHOLE DESIGN RISK, and it is measured rather than assumed.
raid-asm-a-bound-check-runs-inside-the-write-budget: twelve consecutive
se_file_write calls of 2251 to 3086 bytes ran in 4 to 12 ms against a 1000 ms
budget on 2026-08-16. This pass parses the incoming string and reads nothing
else, so it is the cheapest check there can be.

req-a-write-that-breaks-the-corpus-refuses

## Two scripts that were only ever reachable through the

TWO SCRIPTS THAT WERE ONLY EVER REACHABLE THROUGH THE SHELL (owner
ruling 2026-08-07). Measured over one 15-hour window: 8 of 23 se_run
calls were these two, four runs each, every one carrying a
no_tool_reason that said the same thing — the lane has no verb for it.

One of those eight died MODULE_NOT_FOUND because the shell's working
directory was trunk while the script it wanted lived in a worktree.
These resolve the tree the way every other lane call does, so that
failure stops being possible rather than stopping by luck.

## The root-picker takes a path

THE ROOT-PICKER TAKES A PATH, and se_lint called it with none.
That is the whole of the 2026-08-14 defect: laneRoot(rel) already
chose the right tree per path kind, and this handler asked for the
default instead, so `.se/...` resolved into whatever worktree was
bound. The per-path calls are below; this one is only for lintProse,
which reads configuration rather than the file under test.

## Scopedfiles is gone

`scopedFiles` IS GONE (owner ruling 2026-08-16). It turned the agent's
`files` argument into a scope, and there is no such argument any more — the
engine reads what changed and decides. `decideScope` in discipline.ts names
the files, and they are already full paths.

## And so does the accepted one

AND SO DOES THE ACCEPTED ONE (note-792c32b5425e item 5; the hole it
left was found live on 2026-07-29). The update's answer went only to
the LOG. So the node ids needed to resolve anything were invisible
unless you deliberately named a node that does not exist and read the
refusal — and the checklist nudge fired TEN times into a void, seen by
nobody, including the agent it was nudging.

A guard nobody can hear is not a guard. It rides the result now.
