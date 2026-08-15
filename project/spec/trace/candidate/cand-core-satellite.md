---
minted_in: i27
id: cand-core-satellite
type: "[[candidate]]"
name: "Core and satellite"
statement: "one core that knows the whole state and one satellite per agent that knows its own, so the shared state has an owner by design"
picks:
  - "[[opt-a-core-and-a-satellite-per-agent]]"
  - "[[opt-one-process-per-record-rooted-by-the-os]]"
  - "[[opt-one-rule-covers-reads-and-writes-alike]]"
  - "[[opt-the-common-path-needs-no-tree-the-rare-one-names-it]]"
  - "[[opt-thin-tree-reads-shared-from-trunk]]"
  - "[[opt-name-the-resolved-tree-in-every-answer]]"
  - "[[opt-the-claim-file-registers-the-tree]]"
  - "[[opt-one-resolution-seam-not-a-rule-per-tool]]"
  - "[[opt-refuse-an-ambiguous-path-by-default]]"
---

## Why this one

IT IS THE OS-ROOTED LINE WITH ITS OWN WORST PROBLEM SOLVED. cand-os-rooted
puts one process per record and then says, in its own text, that the mirror,
the claim ledger and the note inbox are machine-wide and single and that
neither way of sharing them is designed. That undesigned wall is what cost it
five of its twelve cells.

HERE THE WALL IS THE DESIGN. The core owns exactly what must be one. A
satellite owns exactly one agent's work. Nothing is left over.

IT ANSWERS THE ENGINE ROW WITHOUT A SEPARATE MECHANISM. An engine change
reaches the satellite of the agent who made it. The core and every other
satellite keep what they were running, and no agent steps out of their work.

IT DEGENERATES CLEANLY, which is the owner's own test of it. One core and one
satellite is a working system, so the shape costs nothing until a second agent
arrives.

AND IT MAY PAY FOR ITSELF IN THROUGHPUT. One process uses one core; N
satellites can use N cores. The owner abandoned a session on another machine
on 2026-08-14 because performance drove them off it. That argument is real and
unmeasured, and it is recorded as note-1e3da015c26e rather than claimed here.

## What it sheds

THE SINGLE PROCESS, and with it the assumption that a shared read is free.
Every shared read becomes a call between satellite and core.

SIMPLICITY OF FAILURE. One process either runs or does not. A core with N
satellites has partial failures, and what happens to an agent's work when
their satellite dies is a question no other line on this chart has to answer.

## How it works

ONE CORE PROCESS, ONE SATELLITE PROCESS PER AGENT AT WORK.

THE CORE OWNS WHAT IS GENUINELY ONE THING: the mirror, the claim ledger, the
note inbox, the call log, and the routing that sends a call to the right
satellite. It also serves trunk. A call about trunk is answered by the core.

A SATELLITE OWNS ONE AGENT'S WORK: the walk position, the bound record, the
record's worktree, and the engine code that agent is running. A call about a
record is answered by that record's satellite.

WHERE A SATELLITE LOADS ITS ENGINE CODE FROM, stated because the line is
incomplete without it: TRUNK, OVERRIDDEN BY A DELTA IN THE RECORD'S OWN
FOLDER. The satellite resolves each engine file by asking the record first and
trunk second.

CORRECTED 2026-08-14. An earlier draft said the record's tree carried a whole
engine, which contradicted the thin-tree pick this line also takes and priced
twenty-seven engine copies on disk. A blind scorer found the contradiction.
The delta resolves it by keeping both picks: the tree stays thin, and what a
record has done to the machine is the short list of files in its own folder.

CHANGE THE ENGINE INSIDE A RECORD and that record's satellite comes up on the
new code, while the core and every other satellite keep what they were
running. The owner ruled on 2026-08-14 that a record carrying the machine it
may change is not forbidden; the delta is the cheapest form of that door.

THE RESTART IS THE SATELLITE'S AND THE AGENT NEVER SEES IT. The walk resumes
from the repository by construction - the pull recomputes position from disk
and the reading is re-owed - so the satellite can be replaced under a walk
without the agent stepping out of anything.

ROOTING COMES FREE. A satellite started in its record's tree resolves relative
paths by the platform's own mechanism, so the engine writes no resolution rule
for the common case, exactly as [[opt-one-process-per-record-rooted-by-the-os]]
describes.

## What it costs

A PROTOCOL AND A SUPERVISOR, which is the largest build on the chart. Starting,
watching and reaping satellites. Deciding what happens to an agent's work when
their satellite dies. Every core-owned read becomes a call rather than a
function invocation.

AN ENGINE PER RECORD ON DISK. Twenty-seven trees stood on this machine on
2026-08-13, and each would carry the code its satellite runs.

START-UP, MEASURED PARTLY. 67 ms cold per process and about 36 ms warm on
2026-08-14, with the engine module load NAMED AS EXCLUDED. That exclusion is
the number this line actually needs and it is still missing.

AGAINST ALL OF THAT: the shared state has an owner by design. That is the one
cost cand-os-rooted pays and does not price, and here it is the design rather
than a leftover.

## What it leans on

- THAT THE SHARED STATE CAN BE SERVED OVER A LOCAL CHANNEL. The mirror is a
  server today, so it is the natural core. Nothing says the note inbox and the
  claim ledger can live behind it, and no probe has been run.
- THAT SATELLITES ARE AFFORDABLE ON THE TARGET MACHINE.
  raid-asm-the-target-machine-is-many-throttled-cores says about twenty cores
  at 2 GHz, and this is the shape that can use them. It is also the shape that
  pays a start-up per record, and nobody has measured that with the engine
  load included.
- THAT PARALLELISM IS WHERE THE TIME GOES. Unprofiled. If the slow calls are
  IO-bound, more processes buy nothing and this line's throughput argument is
  worth zero.
- THAT A PARTIAL FAILURE IS DESIGNABLE. One process either runs or does not. A
  core with N satellites has states in between, and no other line on this chart
  has to answer for them.

## The storage refinement, folded in 2026-08-14

THIS LINE MAY HOLD A RECORD'S WORK ON A VOLUME OR IN THE SATELLITE'S OWN
MEMORY, and that choice is a refinement of this line rather than a rival to
it. It was briefly drawn as a separate candidate, cand-memory-served, and the
owner ruled that wrong the same day: the two do not preclude each other, so a
front comparing them compares a design against itself.

WHAT MEMORY RESIDENCY BUYS.

- Write and metadata cost. The read half is already true today without it,
  because Windows caches file content and metadata in standby memory and
  standby RAM is as fast as empty RAM.
- Isolation with no filesystem boundary at all. Unlanded work has no presence
  on disk until a gate, so another record cannot reach it even by an absolute
  path. A blind scorer put that at prior-art par with PostgreSQL MVCC, where
  an uncommitted transaction's changes live in its own backend and are
  invisible to every other backend until commit.
- No RAM disk, no kernel driver, no administrator prompt. The process that
  already serves the record holds the files, so req-one-script-installs and
  req-newcomer-one-command survive untouched.

WHAT IT COSTS.

- DURABILITY BETWEEN GATES. Work in memory is gone on a crash. req-crash-
  lands-safe and req-no-agent-act-destroys-work both stand, and how long the
  window between gates actually is has never been measured.
- THE VIEW'S BACKING. Between gates the truth is in the satellite's heap and
  the node files on disk are stale, so req-trace-view-derived-from-files can
  no longer be met by the files.
- THIRD-PARTY SIGHT. An editor, a hand-run git command, tooling we did not
  write - none speaks to a satellite. Our own surfaces are unaffected, because
  they resolve through the lane and the lane resolves to the satellite.
- A WRITE-BACK DESIGN NOBODY HAS DRAWN. What is flushed, when, in what order,
  and what happens when a flush fails halfway. A partial flush that reports
  success is the forbidden failure mode exactly.
- AND THE FLUSH LANDS IN THE TREE THAT CARRIES THE ENGINE COPY, which nothing
  yet says it may not.

THE HONEST STATE OF IT: the isolation is real and the speed argument is
unprofiled, so this refinement is decided after a profile rather than before
one.

## What happens to a path that escapes the record

ADDED 2026-08-14 AFTER THE COMPARISON HAD RUN, and stamped as such because
completing a candidate once the result is visible is exactly the move that
needs watching. A reader should discount this section accordingly, and the
cell it touches is owed a fresh blind score rather than an assumed one.

WHY IT WAS MISSING. The record said what happens to a path naming the record
and said nothing about one climbing out of it. The owner asked why this line
could not refuse such a path. Nothing stops it, and the silence was a gap in
the writing rather than in the design.

THE ANSWER: IT REFUSES. Every path goes through the one resolution seam this
line already picks, the seam no tool may bypass. The seam resolves the path,
compares the result against the record's own root, and refuses anything
falling outside rather than letting the operating system serve it.

SO THE ROOTING AND THE REFUSAL ARE NOT ALTERNATIVES. The working directory
makes the common case free and correct. The seam catches the case the working
directory would happily resolve out of the record, which is the hole
[[cand-os-rooted]] leaves open by its own admission.

THIS LINE IS BETTER PLACED TO ENFORCE IT THAN ANY SINGLE-ENGINE LINE. A
satellite is a separate process with its own working directory, so the rule
has an address-space boundary underneath it. A rule inside one shared engine
has only the rule.

WHAT IT STILL LEANS ON, unchanged in kind from every other line here: that
the seam cannot be walked around. The i8 field report of 2026-08-12 records
that exact bypass being used against a guard covering five verbs and not the
shell. Here the shell is a child of the satellite and inherits its working
directory, which closes that particular hole and does not close the class.

## Answers to the demands this record had not addressed

WRITTEN 2026-08-14, when the owner ruled that an unanswered demand is an
incomplete line rather than a weakness.

### A resolution is proven by read-back

THE SATELLITE THAT WROTE IT READS IT BACK, through its own working directory
and its own seam. A read-back that goes through the same process that did the
write proves the landing without a second mechanism, and a proof that crossed
processes would be proving something else.

FOR A CORE-OWNED WRITE the core reads back, on the same rule.

### Version control resolves like every call

THIS IS THE LINE'S STRONGEST ANSWER AND IT COSTS NOTHING EXTRA. Every call is
routed to whatever owns the path: a record's satellite, or the core for
trunk. A version-control call is a call with a path, so it routes the same
way.

A COMMIT IN A RECORD is taken by that record's satellite, in that record's
tree, by the platform's own working directory. A COMMIT TO TRUNK is taken by
the core. Both answer with the store they used, because routing is what this
line does.

SO THE CASE THAT HAS NO DOOR TODAY - work patched into a store the walk is
not bound to, with no way to commit it - has a door here by construction.

### A surface resolves to what it shows

THE CORE OWNS THE MIRROR AND KNOWS WHICH SATELLITE HOLDS WHAT. A surface asks
the core, the core asks the satellite that owns the record being shown, and
the answer comes back naming that record.

SO A SURFACE SHOWING ONE RECORD WHILE THE WALK STANDS IN ANOTHER is
expressible and correct here, rather than a mixture. That is the failure
note-81c6cc77171e and note-b086cd36f9a0 record, where a record's worktree sat
outside the folder the owner had open and the form's links would not open its
own findings.

WHAT IS NEW WORK: the core has to know the mapping, which is the claim file
this line already picks.

### A method change reaches without a step-out

THE CORE IS THE DOOR, and it is the same door version control uses. Shared
method lives in trunk, the core serves trunk, and a call about trunk is routed
to the core. So an agent inside a record writes method through the core
without leaving their record, exactly as they commit through it.

ROUTING IS NOT PATH RESOLUTION, and the two must not be confused. The seam
refuses a path that RESOLVES outside the record it belongs to - a relative
path climbing out, an absolute path into a neighbour. A call naming trunk is
not such a path: it names a different OWNER, and the core owns it. One is a
misresolution and the other is a routing decision.

STATED BECAUSE A BLIND AUDIT FOUND THE TWO READING AS CONTRADICTORY, and the
reconciliation was available and unwritten.

EVERY SATELLITE READS SHARED METHOD FROM TRUNK, because the thin tree holds
none. There is one copy, so a change is visible to every walk at its next
read with nothing to propagate and nothing to drift.

THE WRITING AGENT'S NEXT CALL SEES IT, because their satellite reads the same
one copy.

WHAT IT COSTS: a shared read is a call to the core rather than a local file
read. That price is already on this line's ledger.

### Entry levels the record's tree

A SATELLITE LEVELS ITS RECORD'S TREE BEFORE ITS FIRST CALL, and commits what
it brought. Starting a satellite is the natural moment - there is a process
start already, nothing is in flight, and no walk can observe a half-levelled
tree because the walk has not begun.

WHAT THERE IS TO LEVEL IS THE RECORD'S FOLDER AND ITS DELTA. The thin tree
holds no shared method to go stale, so levelling is the record's branch
against trunk plus a rebase of any engine or method overrides the record
carries.

A DELTA THAT NO LONGER APPLIES STOPS THE RECORD AT ENTRY, with the conflict
named, rather than composing a mixture nobody assembled. That is the harm
req-entry-levels-the-record-tree exists to prevent, stated in its own words: a
walk beginning in a tree that does not compile.

SO A PARTIAL LEVELLING CANNOT BE OBSERVED HERE, which is the failure
req-entry-levels-the-record-tree exists to prevent. The supervisor either
brings the satellite up on a levelled tree or does not bring it up.
