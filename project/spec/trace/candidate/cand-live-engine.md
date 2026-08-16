---
minted_in: i27
id: cand-live-engine
type: "[[candidate]]"
name: "Live engine"
statement: "one engine that never restarts: paths judged at one seam, and the engine's own modules resolved per record"
picks:
  - "[[opt-swap-the-changed-module-in-place]]"
  - "[[opt-judge-every-path-in-one-dispatch-pass]]"
  - "[[opt-separate-rules-for-reads-and-writes]]"
  - "[[opt-the-common-path-needs-no-tree-the-rare-one-names-it]]"
  - "[[opt-thin-tree-reads-shared-from-trunk]]"
  - "[[opt-read-back-from-the-tree-the-caller-meant]]"
  - "[[opt-the-claim-file-registers-the-tree]]"
  - "[[opt-one-resolution-seam-not-a-rule-per-tool]]"
---

## Why this one

IT IS THE ONLY LINE WITH NO RESTART ANYWHERE. Every other answer on the
engine-change row stops something: the whole machine, or the one record that
made the change. This one stops nothing.

THE DEMAND IT EXISTS FOR is req-an-engine-change-applies-in-its-own-record,
minted 2026-08-14 after the first four lines were drawn. None of the four
answers it, and three of them fail it outright.

## What it sheds

THE ASSUMPTION THAT A MODULE IS LOADED ONCE. Every module the engine reaches
from a call has to be resolvable per record, and any module holding state
across calls has to say what happens to that state when it is replaced.

That is discipline the engine does not have today, and it is the whole cost.

## How it works

ONE PROCESS, ONE PORT, ONE SESSION, and everything cand-judged-path does for
paths. The root never moves. A path is judged at one dispatch seam against
the record the call belongs to. Reads are permissive and carry their source;
writes are strict and prove where they landed by reading back. The record's
worktree is thin and shared method is read from trunk when it is needed.

WHAT IS NEW IS ONE LAYER LOWER: the engine's own modules.

The engine keys its module registry by record. A call belonging to record A
resolves the engine's modules through A's entry; a call belonging to record B
resolves through B's. A changed engine file invalidates the entry for the
record that changed it, and nothing else.

THE NEXT CALL IN THAT RECORD LOADS THE NEW CODE. Calls in every other record
keep the module already resolved for them. Nothing restarts and nothing else
notices.

THE SEAM THAT MATTERS IS STATE ACROSS CALLS. A module holding nothing but
functions swaps cleanly. A module holding a session, an open handle or a
cache does not, and this engine holds all three. Every such module has to
say, in its own code, what happens to what it holds when it is replaced.

THAT IS THE WHOLE DESIGN AND THE WHOLE RISK, in one sentence: a stateless
module swaps for free, a stateful one has to be told how.

## What it costs

MODULE-GRAPH DISCIPLINE THE ENGINE DOES NOT HAVE. Today the runtime caches a
module once per process, which is the default and the fastest thing. Keying
that cache by record means every module reached from a call must resolve
through a per-record entry, and any module that escapes the keying silently
serves the wrong version.

A PARTIAL SWAP IS WORSE THAN NONE, the same shape as a partial fan. Half the
graph new and half old does not compile and does not fail cleanly. Ordering
and failure handling are the build.

N COPIES OF THE ENGINE IN ONE PROCESS'S MEMORY, one per open record that has
changed something. Nobody has measured that, and twenty-seven trees stood on
this machine on 2026-08-13.

THE THIN TREE'S READ COST IS INHERITED WHOLE: 2.04 ms per shared file through
one long-lived batch reader, against 0.46 ms on plain disk. Measured at
exp-trunk-read-cost. The naive shape - a git process per read - is 47 to 54
ms and fails the one-second rule under load.

AGAINST ALL OF THAT: one process to start, one to supervise, one to reap, and
one session holding the mirror, the claim ledger, the note inbox and the call
log. Every shared-state problem the per-process line has to solve does not
arise here.

## What it leans on

- THAT A STATEFUL MODULE CAN BE TOLD HOW TO HAND OVER. Unproven here, proven
  elsewhere: Erlang OTP does exactly this in production with code_change and
  two live versions per module. Nothing says a TypeScript engine written
  without that discipline can be retrofitted with it, and this one was.
- THAT THE KEYING CANNOT BE ESCAPED. This is the same shape as the seam
  cand-speaking-root leans on, and it fails the same way: one module reached
  outside the keying serves the wrong version and reports success. The i8
  field report of 2026-08-12 records exactly that class of bypass being used
  against a guard that covered five verbs and not the shell.
- THAT THE THIN TREE CAN BE BUILT. raid-dec-thin-tree reads decided, and the
  probe of 2026-08-14 found the bound worktree still holding deliverable,
  guidance and spec. Unbuilt, and priced here as build rather than
  inheritance.
- THAT AN ENGINE CHANGE IS WORTH ISOLATING AT ALL. This line assumes a
  half-finished engine edit in one record should not reach another. The
  owner ruled that on 2026-08-14. Nothing else establishes it.

## How this record was composed, which is a defect rather than a method

THIS CANDIDATE HAS NO COMPOSE STATE OF ITS OWN. Its line was added to the
candidate drawing on 2026-08-14, after build_chart and run-candidates had
both signed, and neither submachine can be re-entered - a reopen refuses with
"no form on disk" because a submachine carries none, and reopening a substate
leaves the parent's view of it met.

SO THE CHART ROW AND THIS RECORD WERE WRITTEN FROM evaluate-set, by the
walking agent, without the blind separation the method asks for. The scoring
is still blind. The composition is not, and that is recorded here rather than
smoothed over.

## The contradiction, resolved 2026-08-14

A BLIND SCORER FOUND IT AND IT WAS REAL. This line takes
[[opt-thin-tree-reads-shared-from-trunk]], where a record's worktree holds
only that record's own folder and everything shared is read from trunk. Under
that pick THE RECORD HOLDS NO ENGINE TO CHANGE - and this line's whole
mechanism assumes it does.

IT IS RESOLVED BY KEEPING BOTH PICKS RATHER THAN DROPPING ONE.

THE RECORD CARRIES A DELTA, NOT A COPY. A record's folder may hold engine
files that OVERRIDE trunk's, and nothing else. The module registry, keyed by
record, resolves each module by asking the record's folder first and trunk
second.

SO A RECORD WITH NO ENGINE EDITS HOLDS NOTHING EXTRA, which is the thin tree
exactly as picked. A record whose agent changes the engine holds only the
files they changed.

WHAT THAT BUYS BEYOND CLOSING THE CONTRADICTION.

- The disk cost is the diff rather than the engine. Twenty-seven trees carry
  twenty-seven small deltas, most of them empty, instead of twenty-seven
  engines.
- The change is legible. What a record has done to the machine is the list of
  files in its own folder, readable without diffing anything.
- Landing is ordinary. A record's engine delta lands on trunk with the rest
  of its work, by the path every other output takes.

WHAT IT COSTS.

- TWO-LEVEL RESOLUTION ON EVERY MODULE LOAD, record first then trunk. That is
  a lookup per module per record rather than per call, so it is paid at load.
- A DELTA CAN GO STALE AGAINST THE TRUNK MODULE IT OVERRIDES. Trunk moves,
  the override does not, and the composed engine is a mixture nobody
  assembled. That is the same failure the retired
  req-entry-levels-the-record-tree named for method, and it wants the same
  answer at entry.
- THE KEYING STILL HAS TO BE UNESCAPABLE, unchanged. One module reached
  outside it serves the wrong version and reports success.

## Answers to the demands this record had not addressed

### A method change reaches without a step-out

THE SAME DELTA ANSWERS IT. Method is content the engine reads, and a record's
folder may hold overriding method files exactly as it may hold overriding
engine files. The reader asks the record first and trunk second. Nobody steps
out, and the change is local until it lands.

### Version control resolves like every call

THROUGH THE SAME DISPATCH SEAM as every other path, inherited from the line
this one derives from. A commit of a record's own folder is ordinary. A
commit reaching trunk needs the trunk-directed write path that line also
needs, and neither has one today.

### A surface resolves to what it shows

ONE PROCESS, ONE SESSION, so a surface resolves through the lane and the lane
resolves per record. The record's own delta is what a surface sees for that
record, which is the same answer the agent gets.

### A write lands where it is meant

THE PREDICATE IS INHERITED WHOLE from the line this one derives from: writes
resolve into the bound record and are proved by reading back from the tree
the caller named. The module keying adds no new write path.

### Entry levels the record's tree

THE DELTA IS LEVELLED AT ENTRY, and this is the answer to the staleness this
record names as a cost above.

ENTERING A RECORD REBASES ITS OVERRIDES ON TRUNK AS IT NOW STANDS, and
commits the result before any work begins. A record whose delta still applies
cleanly comes up levelled. A record whose delta conflicts with trunk's
current module STOPS AT ENTRY with the conflict named, rather than composing a
mixture nobody assembled.

THAT IS THE SAME ANSWER THE DEMAND ALREADY WANTS FOR METHOD, applied to
engine and method deltas alike, because under this line they are the same kind
of thing: files in the record's folder that override trunk's.

WHY ENTRY IS THE RIGHT MOMENT AND NOT LOAD TIME. A rebase during a walk would
change what the agent is running mid-flight. At entry nothing is in flight and
no walk can observe a half-levelled state.

WHAT IT COSTS: a record opened long after its delta was written may not come
up at all until somebody resolves the conflict. That is the intended
behaviour and it is stricter than levelling method, because a stale method
file is wrong and a stale engine module does not compile.
