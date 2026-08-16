---
id: refusals
statement: Every refusal clause, stated as feed-forward — know the rule before the engine refuses.
---

# refusals — the rules ahead of the refusal

A refusal is typed. It carries the clause and the remedy — the feedback
side. This page is the FEED-FORWARD side (owner ruling 2026-08-06):
every clause in the registry has a section here, so the rule can be known
before it fires. The registry lives in `deliverable/engine/errors.ts`.

The pairing rule: a new clause is not done until its section stands here.
The mechanical enforcement of that rule is parked for the engine iterations;
until it lands, authorship carries it.

## ANYTHING THAT BLOCKS OWES A REMEDY, NOT ONLY A TYPED REFUSAL

Owner ruling 2026-08-07, and it generalises the rule above.

A typed refusal is one shape of block. There are others, and they owe the
same thing. A `fill` that comes back unchanged is a refusal wearing an
instruction's clothes: the submit did not stamp, and the agent is expected to
work out why.

THE MACHINE HOLDS THE VERDICT, SO THE MACHINE HANDS IT OVER. It is never the
agent's job to ask why it was blocked, and a mechanism whose answer is "call
another verb to find out" is the wrong fix. Say what is wrong, and say it
clearly enough to act on.

PUT IT WHERE A TRUNCATING HOST STILL SHOWS IT. A large result is moved to disk
by some hosts, which hand back the HEAD of it. A remedy buried deep in a big
payload is a remedy nobody receives. This cost five calls of guessing at a
one-word mistake on 2026-08-07, and the fix was to move the block to the top
rather than to add a verb for fetching it.

THE TEST OF A REMEDY: could somebody act on it without asking a second
question? If not, it is a diagnosis rather than a remedy.

## The git lane

### SE-C-002 — no history rewrite
Never rebase, never rewrite. Superseded content stays in history. Land
forward with a new commit.

### SE-C-003 — the agent never pushes
Pushing is the owner's act. Do not attempt it, and do not ask the shell to.

NOTHING PUSHES ANY MORE, not even the engine (i34). The machinery used to push
the iteration seed stub, the expedition seed stub and the claim file, as acts
of the claim lane. A record is a folder on trunk now and the claim system is
retired, so there is no stub to announce and no claim file to write. Every push
refuses here, without exception.

### SE-C-004 — git beyond the allowlist
`se_git` covers an allowlist of verbs. A job outside it belongs to the
engine, not to a workaround. If a merge or sync fails here, the result names
the conflict — that is information, not an obstacle.

## Files and paths

### SE-C-046 — a required argument is missing
Fill every required field. The schema is the contract.

### SE-C-101 — an unknown argument name
A wrong arg name is never silently coerced. Check the schema before inventing
a field.

A SIBLING VERB'S WORD IS UNDERSTOOD, and the repair is announced. The lane's
verbs disagree about what to call their subject: search takes `query`, glob
takes `glob`, list takes `dir`, the readers and writers take `path`. Sending
one verb's word to another resolves, and `arg_repaired` on the result says
what was read as what.

TWO CASES STILL REFUSE, and both are the same rule: the lane does not guess.

- The canonical name was ALREADY SENT. Then the extra word is a second thing,
  and rewriting one over the other would lose it.
- The word could mean two of the verb's own arguments. Two meanings is a
  guess.

The refusal names the candidates it considered.

### SE-C-138 — the write would leave the corpus unreadable
A corpus node's frontmatter must parse. A write carrying frontmatter the
engine's own reader cannot load is refused BEFORE anything lands.

THE COMMON CAUSE IS ONE COLON. A colon followed by a space inside an
unquoted YAML value reads as a nested mapping. `impact: The second is worse:
it taxes an unrelated edit` does not parse; quoting the whole value fixes it.

THE REFUSAL CARRIES FOUR THINGS, because three of them are a diagnosis and
the fourth is what makes it actionable.

- the file
- the line, counted in the file rather than in the block
- the offending line, quoted back
- the fix, as the same value quoted

WHY IT IS A REFUSAL AND NOT A REPORT. The break arrived with THIS write, so
the author is present and one edit closes it. A break the corpus already
carried lands and reports instead — that is the seam, and it turns on who
caused it rather than on how serious it is.

MEASURED, on 2026-08-16: a write carrying this shape was accepted, and the
next pull threw naming a line and a column in no particular file. Four calls
to find and fix. One refusal here costs none.

### SE-C-102 — the path escapes the root
Paths are root-relative to the project root. Outside the root there are two
doors only: a committed `ref` for the past, a declared `@name` root for
another folder. There is no third.

### SE-C-103 — the read is oversize
A big file is read in parts: `offset` and `limit`. Nothing is ever silently
truncated.

### SE-C-104 — the hash does not match disk
Writes are compare-and-swap. Write with the hash from your latest read. If
anything touched the file since, read again first.

### SE-C-105 — the patch is ambiguous
`old_string` must exist and be unique. Add surrounding context to pin it, or
say `replace_all` and mean it.

### SE-C-126 — unreadable bytes
Images travel as pictures. Arbitrary binary does not travel at all.

### SE-C-127 — the root is not declared
`@name` reaches only roots the owner declared in `.se/roots.json`. Ask the
owner before declaring one.

### SE-C-132 — a raw NUL byte in text
A NUL makes the whole file unsearchable. In code, write the escape sequence.

## Running things

### SE-C-106 — the lane is not configured
The capability exists but wants owner configuration. Ask; never route around.

### SE-C-107 — the command timed out
Scope the command down, or hand it off and poll the job.

### SE-C-128 — the job is unknown
Job handles belong to the session that started them.

### SE-C-137 — a truncating shape in the command
A TRUNCATING PIPE CUTS BEFORE THE ENGINE SEES. `Select-Object -First`, `head`,
`tail`, `cut -c` and `Measure-Object` drop output between the command and the
capture, so what they removed exists NOWHERE — not on the result, not in the
log, not under the ref.

ENDS CARRY VERDICTS: exit codes, totals, units. A shape that keeps the head
throws away exactly the part that says whether it worked.

THE REFUSAL NAMES THE VERB YOU WANTED, because the pipe is reached for when
the output is expected to be long and every long thing has a verb for it.

- A test run wants `se_test` — structured counts, only the failures' detail.
- A search wants `se_file_search` — it windows with `limit` and SAYS when it
  truncated, which a pipe never does.
- A file wants `se_file_read` — it pages by line and refuses an oversize read
  rather than cutting it silently.
- Anything else: run it whole. The lane captures the full output under the
  call's ref, and `se_log_query {ref}` serves it back a page at a time.

`no_tool_reason` RUNS IT ANYWAY and logs why. It was a warning until
2026-08-16, and the warning failed twice — the second time inside the
iteration that was building this refusal.

### SE-C-129 — the shell asked to do a lane tool's job
`se_run` is for what the lane cannot do. The lane's own jobs stay in the
lane, logged and structured:

- read
- search
- list
- patch

The ladder blocks after one warned run.

## Tests

### SE-C-136 — a run with no question
Say what you want to know, in one line. The engine says which tests ran; only
this says why you asked, and the record keeps it.

### Two retired clauses — the test scope, once SE-C-130 and SE-C-131
RETIRED by owner ruling, 2026-08-16. THE AGENT ASKS FOR A TEST AND THE ENGINE
DECIDES WHAT RUNS. Neither number is reused, and nothing here claims them.

WHAT THEY WERE FOR. SE-C-130 refused a re-run over an unchanged tree.
SE-C-131 graded the scope: it refused the battery while every change mapped to
a scoped run, and refused scoped runs once piecemeal coverage crossed a flip.

WHY THEY ARE GONE. They guarded the same decision from opposite sides, and on
2026-08-16 they closed on each other. At i6's sixth build chunk the odometer
stood at 42 and the battery was illegal outside verification, so NO TEST CALL
WAS LEGAL — with four milestones still to walk before the state that fires the
battery. Each refusal's remedy was the other refusal. Narrowing to one file
changed nothing, because the flip counts the odometer rather than the call.

THE CAUSE WAS NOT THE THRESHOLD. It was that the AGENT chose the scope and the
ENGINE graded the choice. Two graders with different subjects eventually
disagree, and an agent standing between them has no move.

WHAT REPLACED THEM is a decision rather than a pair of refusals. `se_test`
takes a `question` and nothing else. The engine reads what changed, picks the
battery, a named set of files, or nothing at all, and the verdict carries
`decided: {scope, files, why}`.

NOTHING IS NOW AN ANSWER. An unchanged tree keeps its last verdict and the
result says so, which is what SE-C-130 meant and could not do without
stopping the walk.

`force: true` REMAINS, and it is the one thing a person asks for directly: a
flake hunt, which is the whole suite by definition.

## The walk

### SE-C-110 — the tool is not legal in this state
Tools are granted per state. A tool being illegal here means the machine
holds that job elsewhere — it is never an obstacle to route around.

### SE-C-112 — a condition is unmet
Entry and exit conditions want their evidence. The pull tells you which one
stands in the way and how to work it.

### SE-C-113 — the step outweighs the dial
A step weighing more than the session autonomy is the person's. Present it,
then stop. A message from them resumes the walk.

### SE-C-114 — stale position
Reserved. Never issued by this engine; old logs carry it.

### SE-C-123 — a dead end in the drawing
Completing this state would leave the machine open with nothing active — a
starved join. Fix the drawing, not the walk.

A GREEN BRANCH NO LONGER COUNTS AGAINST YOU (owner ruling 2026-08-09). A
busbar waits only for the inbound edges whose source is not already filled.
A branch that stands green has nothing left to deliver, so it is not walked
again to satisfy the bar.

What still fires this clause is a branch that is genuinely owed. Walk that
one.

WHY THE RULE CHANGED. A three-way join used to be unreachable by a single
token. Walking one branch fired one edge; reaching a sibling routed BACK
through the fork, and the re-walk cleared the fuel the last leg had just laid
down. Measured in iteration one on 2026-08-09: all three branches walked, the
gate still shut, and stepping out to re-enter reset the count to zero.

### SE-C-124 — the canvas fails to compile
The walk stands where it is. Fix the drawing; the walk resumes.

## Narration

### SE-C-040 — the toll is due
Narration rides the work: an update on every call that changes something.
When the toll lapses, the next call must carry one — resend the same call
with the update field.

### SE-C-120 — the update is malformed
A brief is ONE line carrying ONE thought. A brief chaining three or more
parts is an unrendered list, and the engine already computes the split.

WHAT IS CORRECTED, never refused:

- An `update` chain becomes the PLAN it wanted to be. The parts are the items.
- A `fork` chain stays a FORK and the parts become its items, named by the
  first. A fork blocks the current item and a plan does not, so rewriting the
  op would change what the call means.

WHAT STILL REFUSES: a RESOLUTION's chained brief. Which part resolved the
node is not the engine's to guess.

### SE-C-121 — the node is unknown or resolved
Updates name an OPEN node. Check the node map that rides every result.

### SE-C-122 — done over open children
Everything started gets resolved. Resolve or re-home the children first.

### SE-C-133 — the checklist stopped moving
Narration that never closes anything records intent, not progress.

TWO THRESHOLDS, AND THE GAP BETWEEN THEM IS THE GRACE.

- FIVE updates with nothing resolved: a warning rides the result as a `nudge`.
- TWELVE: the next non-resolving update refuses.

BOTH USED TO BE FIVE, so the warning and the refusal arrived one call apart.
That is not a warning, it is a two-stage refusal — and the counter measures
updates since anything CLOSED, which real work legitimately runs past while
reading its way to a root cause.

The way out is always open. A resolving op is never refused, because it is the
remedy:

- `done` — the item landed.
- `obsolete` — it stopped mattering.
- `revert` — it was undone.
- `defer` — it belongs to a later state.

The open node map rides every refusal, so the id you need is already in your
hand. Nothing genuinely finished? Say what is actually blocking the item with
`defer`, or close it `obsolete`. A checklist standing open for hours is the
thing this stops.

### SE-C-135 — the write did not land as asked

A write verb's payload is DATA. It must land in the file verbatim.

This refusal fires when the applied text does not contain the payload. That
means something between the tool boundary and the buffer transformed it —
the class that spliced two engine files into themselves in 2026-08-07 and
reported success both times.

Nothing was written. Read the file, then report the payload that triggered
this: the escape-eating class has a new member, and the payload is the
evidence.

### A retired clause — the method write, once SE-C-134
RETIRED by owner ruling, 2026-08-14. It refused a method write made from
inside a record. The number is retired and is not reused, and no section here
claims it: this is history, not a rule you can trip.

WHAT IT WAS FOR. A method write from inside a record used to land in that
record's own worktree, and fan out over trunk at the merge. On 2026-08-07 that
overwrote trunk's tool list and deleted two lane verbs.

WHY IT IS GONE. The refusal was REPLACED BY A RESOLUTION, never merely
dropped. Shared method resolves to the MACHINE ROOT whatever tree is bound, so
a method write cannot land in a tree that does not own it. There is nothing
left to refuse.

SHARED MEANS THESE:

- guidance
- machines
- the engine
- the tests
- the prompt layer

WHAT IT COST WHILE IT STOOD. Escape to the desk, edit there, aim back — and
the walk back re-walked the whole machine, timing out on the first pull and
erroring on the second. Six times in one session, and twice more on the day it
was removed.

THE HOLE IT NEVER COVERED. It guarded five path-carrying tools and could not
watch `se_run`'s shell commands, which are handed no path to judge. That is
`raid-iss-the-shell-writes-method-with-no-path-to-judge`, and resolution does
not close it either. A shell still writes wherever it is pointed.

## Notes and prose

### SE-C-073 — the note ref is unknown
Draining takes an existing `note-...` ref, exactly as listed.

### SE-C-125 — a wall of prose
Long prose carries line breaks. Paragraphs are the author's job — no
renderer can invent them.
