---
id: refusals
statement: Every refusal clause, stated as feed-forward — know the rule before the engine refuses.
---

# refusals — the rules ahead of the refusal

A refusal is typed. It carries the clause and the remedy — the feedback
side. This page is the FEED-FORWARD side: every clause in the registry has a
section here, so the rule can be known before it fires. The registry lives in `deliverable/engine/errors.ts`.

The pairing rule: a new clause is not done until its section stands here.
The mechanical enforcement of that rule is parked for the engine iterations;
until it lands, authorship carries it.

## ANYTHING THAT BLOCKS OWES A REMEDY, NOT ONLY A TYPED REFUSAL

It generalises the rule above.

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
payload is a remedy nobody receives, so it goes at the top rather than behind a
verb for fetching it.

THE TEST OF A REMEDY: could somebody act on it without asking a second
question? If not, it is a diagnosis rather than a remedy.

## NO BLANKET ERROR MESSAGE

Errors are specific, and so are the remedies for them.

A BLANKET MESSAGE IS ONE THAT COVERS SEVERAL CAUSES WITH ONE SENTENCE. It says
something went wrong, or that a check failed, and leaves the reader to find out
which thing and why. It is the shape of an error with the error taken out.

TWO THINGS ARE OWED, NOT ONE.

- THE ERROR NAMES ITS OWN CAUSE, specifically. Which check, which file, which
  value, which line.
- THE REMEDY IS SPECIFIC TO THAT CAUSE. A remedy that would fit any failure of
  this kind is a blanket message wearing a remedy's clothes.

A WRAPPER NEVER SWALLOWS WHAT IT WRAPS. Where one check runs several others,
the failing one's OUTPUT rides out with the verdict. "The battery failed" is
not a report; "tests/work-account.test.ts:278 expected 'finished', got
undefined" is.

AND A RE-RUN NEVER HIDES THE LAST RESULT. A long check that goes red gets
started again by the next attempt, and while the second run is in flight the
only honest answer carries BOTH: that it is running again, and what the
previous run said.

THE COST IS ALWAYS THE SAME. A reader who cannot see the cause guesses at it,
and every guess is a call spent proving something the message already knew.

## The git lane

### SE-C-002 — no history rewrite
Never rebase, never rewrite. Superseded content stays in history. Land
forward with a new commit.

### SE-C-003 — the agent never pushes
Pushing is the owner's act. Do not attempt it, and do not ask the shell to.

NOTHING PUSHES, not even the engine. A record is a folder on trunk, so there is
no stub to announce and no claim file to write. Every push refuses here,
without exception.

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

WITHOUT THE REFUSAL the write lands and the NEXT pull throws, naming a line and
a column in no particular file. One refusal here costs nothing; the alternative
costs four calls of hunting.

### SE-C-102 — the path escapes the root
Paths are root-relative to the project root. Outside the root there are two
doors only: a committed `ref` for the past, a declared `@name` root for
another folder. There is no third door for a path you pass.

A PRODUCING ACT IS NOT A THIRD DOOR. It writes into the tree it is making,
and that destination is the act's own bound rather than a path anybody
passed. SE-C-141 governs it, and the bound is torn down when the act ends.

THIS CLAUSE ALSO REFUSES A WRITE TO A ROOT THAT IS NOT WRITABLE. A declared
root is read-only unless its declaration says `writable: true`, and only a
writable one is a legal write target. The refusal's own remedy carries the
shape to declare.

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

### SE-C-139 — the ref does not resolve here
A `ref` this clone cannot resolve. The refusal names the ref, quotes what git
said, and hands back the pair of calls that fixes it.

A SHALLOW CLONE IS THE ORDINARY CAUSE. A cloud box clones one branch, so `main`
and `v2` do not exist locally at all.

A FETCH ALONE IS NOT ENOUGH, and that is the part that surprises people. After
`git fetch --all --prune`, `ref: main` still fails with `unknown revision`. The
local branch has to be created from the remote-tracking one.

- `se_git {args: ["fetch", "--all", "--prune"]}`
- `se_git {args: ["branch", "main", "origin/main"]}`

WHY IT IS TYPED. Raw git text reads as "the file is missing" when what is
missing is the BRANCH. That misreading mints a wrong assumption, and a wrong
assumption spreads through every evidence form that cites it.

A GIT FAILURE THAT IS NOT ABOUT THE REF STAYS AN ERROR. A broken pattern is an
internal fault rather than something the caller can fix, and a remedy that does
not apply is worse than none.

### SE-C-127 — the root is not declared
`@name` reaches only roots declared in `.se/roots.json`.

DECLARE IT YOURSELF AND CARRY ON. The agent writes the declaration through the
lane, where it is logged like every other call. Nobody has to be woken to
approve a path.

STOPPING TO ASK COSTS THE STEP. The retro's memory drain reaches the harness's
folder through a declared root, and an agent that waits for permission reports
that step unreachable — which is the step saying nothing at all.

A DECLARED ROOT IS STILL READ-ONLY BY DEFAULT, and the guard on writing back
into the tree a vehicle came from is untouched (SE-C-143).

### SE-C-143 — the write target is the tree this one came from
A declared root may be made writable, and that is how this system drives a
project that is not itself. What it may never reach is the tree it was
produced from.

THE CHECK IS ON IDENTITY, NOT ON A PATH. A vehicle records the identity of the
engine it came from. Every tree states its own. The two are compared, so
moving, copying or renaming either tree changes nothing.

IT FAILS CLOSED. Where the identity file exists but cannot be read, the guard
cannot prove the target is safe and refuses on the same clause. A guard going
quiet looks exactly like a guard passing, and this is the one law a vehicle may
never breach.

THE ENGINE ITSELF IS NEVER AFFECTED. It was produced from nothing and has no
upstream file, so the guard has nothing to say and returns at once.

### SE-C-141 — the write left the tree this act is producing
An act that produces a tree is bounded BY that tree while it runs. This is not
SE-C-102 wearing a different number: a write that left the act's bound is a
different fault from one that left the project, and the two are told apart so
the mechanism can be debugged.

THE BOUND BEATS THE ORDINARY ROUTING, for writes only. Method and session
paths normally resolve to the machine root whatever is bound. During
production that would write the ENGINE while the engine was being copied, so
the act's bound wins.

READS ARE NEVER BOUNDED. The act copies FROM the engine, so bounding its reads
would leave it unable to read the thing it is reproducing.

THE BOUND IS A PROPERTY OF THE ACT, never a mode. It is torn down when the act
ends, including when the act throws, and a second act cannot open one while
one is open — a nested bound silently narrows the outer act's guarantee.

### SE-C-142 — the producing act stopped before writing anything
Making a vehicle or a project refuses rather than half-producing. A half-made
tree is worse than none, because the half looks finished.

FOUR THINGS STOP IT, all before the first byte:

- The destination is not empty. Name an empty folder, or an absent one.
- The name is missing, or the abbreviation is not two or three letters.
- The name has no letters or digits to make an id from.
- The tree it is producing FROM cannot say what it is called.

THERE IS NO FALLBACK TO THIS PRODUCT'S OWN NAME, on purpose. A forgotten
argument would otherwise ship this product to somebody else under our name,
which is the failure the shipped export learned from.

IT ALSO FIRES ON A MALFORMED DRIVEN RECORD. A record nobody can read must
never pass for a tree that has none — that would turn a broken file into the
answer "this is not a driven project", which is a wrong answer rather than an
absent one.

### SE-C-132 — a raw NUL byte in text
A NUL makes the whole file unsearchable. In code, write the escape sequence.

## Running things

### SE-C-106 — no search backend answered
`se_web_search` already tried its configured and keyless server-side providers.

Use native `WebSearch` when the harness exposes it. Every native query is still logged by the harness hook.

If native search is unavailable, fetch known primary URLs with `se_web_fetch`. State that discovery was incomplete.

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

`no_tool_reason` RUNS IT ANYWAY and logs why. A warning stood here first and
failed twice, the second time inside the work that was building this refusal.

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
RETIRED. THE AGENT ASKS FOR A TEST AND THE ENGINE DECIDES WHAT RUNS. Neither
number is reused, and nothing here claims them.

WHAT THEY WERE FOR. SE-C-130 refused a re-run over an unchanged tree.
SE-C-131 graded the scope: it refused the battery while every change mapped to
a scoped run, and refused scoped runs once piecemeal coverage crossed a flip.

WHY THEY ARE GONE. They guarded the same decision from opposite sides, and they
closed on each other. With the odometer past the flip and the battery illegal
outside verification, NO TEST CALL WAS LEGAL at all. Each refusal's remedy was
the other refusal, and narrowing to one file changed nothing, because the flip
counts the odometer rather than the call.

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

TWO PATHS UNDER THIS CLAUSE SURPRISE PEOPLE, and both are about the two acts
on a standing claim.

AN AMEND DOES NOT RE-GREY. A REOPEN DOES.

- An AMEND corrects a claim that still stands: a wrong figure, a stale
  sentence, a typo. The signature is kept, and nothing below it is disturbed.
- A REOPEN says the work is WRONG. The claim goes grey, its form is owed
  again, and everything downstream falls with it.

SO A STALE CLAIM CANNOT BE AMENDED BACK. If a state is down because a feeder
RE-SIGNED above it, that feeder answered again against ground that moved, and
a correction of wording does not answer it. The act is se_reopen, and it is
cheaper than it sounds: the pull hands the form straight back with a recheck
block, body and signature both still on the file. Read it, decide only whether
the change moved it, and submit. The submit is the re-sign.

AND A FIELD ANOTHER FORM READS CANNOT BE AMENDED AT ALL. The refusal names
what reads it. Changing such a field changes what a DIFFERENT state must
answer, and an amend would leave every one of them standing against wording
that is gone — which is exactly how a kickoff's goals list was rewritten under
ten signed states that never heard about it. A changed question is a reopen.

The rule is req-an-amend-leaves-the-tree-standing.

#### A GATE IS NOT BLESSED WHILE THE RECORD STILL HOLDS OPEN WORK

The leaving guard is PER STATE: a state's own open work holds that state. A
gate asks a wider question, and it asks it under this clause.

EVERY STATE INSIDE THE BOUND RECORD IS IN SCOPE. So a gate cannot be blessed
while fix-findings, or any other state behind it, still holds something open.
The refusal names the record and the work.

EMERGENCY DOES NOT LIFT THIS ONE, and it lifts every other work hold. That is
deliberate: with emergency armed a walk once reached a gate over ten open
tokens, and nobody inside the engine objected.

TWO PILES ARE OUT BY CONSTRUCTION rather than by a list. The BACKLOG sits
outside every record's prefix, so it can never hold a gate. PENDING has never
held anything, so a standing pool token does not either.

THE WAY THROUGH IS TO SETTLE THE WORK OR MOVE IT. There is no override
argument, and the refusal hands back the call that clears the first item.

#### A LIST FIELD SENT AS A JSON ARRAY IS ACCEPTED AND LOSES EVERY ANSWER

A per-item or list field takes ONE STRING with a line per item. Sending an
ARRAY of strings instead is taken, the call succeeds, and the submit then
refuses the field as unanswered.

THE TWO FAILURES LOOK IDENTICAL. "You sent nothing" and "you sent everything in
a shape the parser does not read" both arrive as unanswered, and the second is
the one an agent reaches for first.

WHAT PASSES: `items.map((s) => "- " + s).join("\n")` and nothing else changed.

THE PARSER KNOWS WHICH OF THE TWO IT GOT, so this belongs in the refusal itself
rather than here.

### SE-C-113 — the step outweighs the dial
A step weighing more than the session autonomy is the person's. Present it,
then stop. A message from them resumes the walk.

### SE-C-114 — stale position
Reserved. Never issued by this engine; old logs carry it.

### Two doors out of a stuck walk that look open and are not

Not a clause. It is the pair of moves an agent reaches for when a state will
not let go, and neither does what its name suggests.

AN ESCAPE UNBINDS THE RECORD. It lands at the front desk, and afterwards every
`se_reopen` and `se_why` resolves state names against trunk instead of the
iteration, refusing with "a state of main with an evidence form". Re-entering
through the iterations container does not rebind it.

A RELOAD DOES NOT MOVE THE WALK. Its own note promises the walk reboots and
walks back to the target. What it actually does is clear the blockers `se_why`
reported, leaving the position exactly where it stood.

### SE-C-123 — a dead end in the drawing
Completing this state would leave the machine open with nothing active — a
starved join. Fix the drawing, not the walk.

A GREEN BRANCH DOES NOT COUNT AGAINST YOU. A busbar waits only for the inbound
edges whose source is not already filled.
A branch that stands green has nothing left to deliver, so it is not walked
again to satisfy the bar.

What still fires this clause is a branch that is genuinely owed. Walk that
one.

WHY THE RULE IS SHAPED THIS WAY. Counting every inbound edge makes a three-way
join unreachable by a single token: walking one branch fires one edge, reaching
a sibling routes BACK through the fork, and the re-walk clears the fuel the last
leg laid down. All three branches walk, the gate stays shut, and stepping out to
re-enter resets the count to zero.

### SE-C-124 — the canvas fails to compile
The walk stands where it is. Fix the drawing; the walk resumes.

## Narration

### SE-C-040 — the toll, retired
RETIRED. It refused the next call whenever narration lapsed. Nothing raises it
now, and the number is not reused.

WHAT IT WAS FOR. A silent walk left the log with nothing in it. A floor on
narration bought a sentence every few calls, so the record said what the hand
was doing.

WHY IT IS GONE. Work tokens replaced the update. A token opened, taken or
settled logs itself, and every act carries a comment the store refuses to leave
empty. The narration is already in the record, so a floor has nothing left to
enforce.

WHAT STANDS IN ITS PLACE IS A QUESTION. When one piece of work has held the
hand for a minute, the engine asks whether it is still the work in hand.

IT RIDES A GOOD ANSWER AND NEVER REFUSES. Nothing is counted, and no answer is
owed. Strayed onto something else? Open a token for it. Genuinely one long
piece of work? Carry on.

### Three retired clauses — the decision graph, once SE-C-120, SE-C-121 and SE-C-122
RETIRED. None of the three numbers is reused, and nothing here claims them.

WHAT THEY WERE FOR. SE-C-120 refused a malformed update. SE-C-121 refused an
update naming a node that was unknown or already resolved. SE-C-122 refused
closing a node over open children.

WHY THEY ARE GONE. The graph they guarded is gone. It was a second system
saying what the hand was doing, beside the tokens already saying it, so a reader
watching the board had to read both to know either.

WHAT REPLACED IT: sub-tokens. A piece of work broken into parts is parts, on the
surface the person already reads, and each settles the way anything else does.

OWNER RULING: the graph was only a display for a person, it was never as good as
the editor is now, and it comes out.


### The stop tooth refused your turn
It is not a typed refusal — it arrives as hook feedback, not as a clause.

THE WALK CAN STILL GO ON. That is what the refusal is saying. Pull and keep
walking; a report is not a checkpoint and size is not a reason.

GENUINELY ONE OF THE SANCTIONED STOPS? Claim it: `se_stop {because: "<which
one, and why>"}`, then stop again.

THE ORDER MATTERS. The tooth must have bitten first, so a force cannot become
the ordinary way to end a turn. One force releases one stop, and the next pull
spends it.

### SE-C-147 — a second piece of work is already open
One engine walks one record. Something else is open and unfinished.

Park the standing one with `se_park {id, why}`, or finish it. Wanting both at
once is wanting two engines, and that is a clone.

A parked record resumes by starting it again. Nothing is lost.

### SE-C-148 — the point is parked for nowhere
`defer {to}` names ONE THING, not a sentence. Three shapes answer:

- A STATE, by its plain name. `verification` is enough.
- A FULL ADDRESS, where you need to be exact.
- A RECORD, so the point arrives when that iteration starts.

PROSE IS NOT A TARGET. "the owner", "after the fixtures land", "once the gate
stands" — nothing delivers those, so the point waits forever.

WAITING ON A PERSON IS NOT A PARK. Say so and stop; their answer resumes you
where you stand.

WAITING ON OTHER WORK IS NOT A PARK EITHER. Name the state that work ends in,
or seed it.

A MARK IS NOT ENOUGH HERE. While this was only marked, 8 of 28 abandoned points
came in through it.

A WELL-SHAPED NAME NOTHING ANSWERS TO IS STILL ONLY MARKED. A park written
inside a record names that record's own states, and those are drawn only while
it is bound.

### A retired clause — the checklist stall, once SE-C-133
RETIRED. The number is not reused, and no section here claims it.

WHAT IT WAS FOR. Narration that never closed anything recorded intent rather
than progress, so a checklist standing open past twelve updates refused the
next one.

WHY IT IS GONE. It guarded the decision graph's checklist, and the graph is
gone. What holds a state shut over unfinished work is the leaving guard over
its work tokens — and that one cannot be satisfied by narrating.

WHAT IT TAUGHT, kept because the shape outlives the mechanism. Measured on the
i15 walk: 59 refusals, every one this clause, every one carrying the same two
items — one that ended hours earlier and one that could not close until the
iteration did. The work was real and the narration was honest. The ITEM was the
wrong shape, and naming what was open sent the reader hunting for work to finish
that did not exist.

SO SIZE A TOKEN SO IT CAN CLOSE WHERE YOU STAND. That rule survives the clause,
and it now binds work tokens.


### SE-C-135 — the write did not land as asked

A write verb's payload is DATA. It must land in the file verbatim.

This refusal fires when the applied text does not contain the payload. That
means something between the tool boundary and the buffer transformed it — the
class that splices a file into itself and reports success.

Nothing was written. Read the file, then report the payload that triggered
this: the escape-eating class has a new member, and the payload is the
evidence.

### A retired clause — the method write, once SE-C-134
RETIRED. It refused a method write made from inside a record. The number is not
reused, and no section here claims it: this is history, not a rule you can trip.

WHAT IT WAS FOR. Back when a record was its own checkout, a method write made
inside one landed there and fanned out at the merge, once overwriting the shared
tool list and deleting two lane verbs.

WHY IT IS GONE. The refusal was REPLACED BY A RESOLUTION, never merely
dropped. Shared method resolves to the MACHINE ROOT whichever record is bound,
so there is nothing left to refuse.

SHARED MEANS THESE:

- guidance
- machines
- the engine
- the tests
- the prompt layer

THE HOLE IT NEVER COVERED. It guarded five path-carrying tools and could not
watch `se_run`'s shell commands, which are handed no path to judge. That is
`raid-iss-the-shell-writes-method-with-no-path-to-judge`, and resolution does
not close it either. A shell still writes wherever it is pointed.

### SE-C-144 — a structured query names a field the matched kind does not carry
`se_query` refuses by name rather than returning an empty column. The
refusal lists the fields the matched kind actually carries, so the next
call can ask correctly without a second guess.

A KIND FILTERS WHICH FIELDS EXIST. `id`, `type` and `statement` are always
legal; everything else comes from that kind's own frontmatter, so two
kinds rarely carry the same field list. Asking a raid entry for a
requirement's `verify_method` is this clause, not a bug in the corpus.

## Work

### SE-C-149 — the close is not `done` and carries no reason
A piece of work reaching `done` needs no reason. Every other terminal status
does, and the reason lands ON THE ITEM rather than in a log.

WHY THE ITEM AND NOT A LOG. The item is what a person reads six months later.
A reason in a log is a reason nobody finds.

THE REFUSAL NAMES THE STATUS IT REFUSED and hands back the same call with a
`reason` on it. Nothing is written, so the item is exactly as it was.

WHAT COUNTS AS A REASON is any non-empty text. The engine does not grade it,
because a grader would be refusing on style and there is no honest bar.

### SE-C-150 — a person must settle this one
An item can be marked person-only. An agent settling one is refused, and the
refusal names the rule rather than the field.

THE LIMIT IS VISIBLE BEFORE ANYTHING IS ATTEMPTED. It stands on the item's own
face, so a hand reads it rather than discovering it at a refusal. This clause
is the backstop, not the notice.

THE REMEDY IS NOT A FLAG. There is no override argument, on purpose. Ask the
person, or move the item on.

### A retired clause — the two models, once SE-C-151
RETIRED. The number is not reused, and nothing here claims it: this is history,
not a rule you can trip.

WHAT IT WAS FOR. A tree carrying work in the current shape AND in an older one
was refused, and the refusal named both shapes with a path to each. Two models
means two counts, and two counts means every question about what is owed has
two answers with nothing to choose between them.

WHY IT IS GONE. Its only raiser was `checkOneModel`, one of eight work verbs
that had no caller anywhere in the engine. The owner ruled them out on
2026-08-27: "Remove them. We don't need that code. If we ever find that we
needed them, we can read them."

SO NOTHING CHECKS FOR A SECOND SHAPE NOW. That is a real gap and not a
resolution, said plainly here rather than left to be discovered. The migration
it would have caught is a migration nobody is watching for.

THE RULE ITSELF STILL STANDS: work lives in one shape. What is gone is the
mechanism that enforced it.

### SE-C-153 — the title is more than four words
A token NAMES its work. It does not describe it, and four words is the whole
name.

WHY IT IS MECHANICAL. The bar draws the piece of work in hand beside the
position, and a sentence there is unreadable at a glance — which is the one
thing the chip exists for.

EVERY SEPARATOR COUNTS AS A SPACE. An underscore, a dash, a slash and a colon
all break a word, so joining words together does not fit more in. That is the
workaround the count exists to close rather than to catch.

THE DETAIL ALREADY HAS A HOME. Whatever the four words cannot hold goes in the
comment on the take or the settle, which is what a reader opens the token for.

ONLY A HAND IS HELD TO IT. A title derived from a card's heading is the card
author's sentence. Refusing that here would refuse the engine's own minting and
teach nobody anything.

THE REFUSAL HANDS BACK THE FIRST FOUR WORDS, ready to send. Nothing is written,
so the store is exactly as it was.

### SE-C-152 — a hand is already on this one
Taking a piece of work marks it before that hand acts, and the mark is what the
progress account is derived from. A second take is refused.

WHY REFUSED RATHER THAN IGNORED. Two hands on one item is the thing the mark
exists to make visible. Letting the second take succeed quietly would make the
account say one hand where two are working.

THE REFUSAL NAMES THE HAND THAT HOLDS IT, so the second hand knows who to ask
rather than only that it may not proceed.

THE WAY THROUGH IS A MOVE OR A SETTLE, never a retry. The first hand settles it,
or the item is placed somewhere else.

## Notes and prose

### SE-C-073 — the note ref is unknown
Draining takes an existing `note-...` ref, exactly as listed.

### SE-C-140 — the mint would carry the note's own text
An option's statement is AUTHORED. A statement sharing a run of six or more
words with the raw note it came from is a copy, and it is refused before
anything is written.

WHY IT IS ITS OWN CLAUSE AND NOT A MISSING ARGUMENT. A field left empty and a
field filled with the thing that must not travel are different mistakes with
different remedies. One says fill this in; this one says you filled it in with
the note.

RAW NOTES NEVER ENTER VERSION CONTROL, and this is the only mechanical thing
holding that line. A note is written mid-walk by whoever noticed something and
may carry anything — a path, a name, a customer. An option lands on trunk,
where SE-C-002 means it can never be taken off again.

THERE IS A SECOND BRANCH AND THE SIX-WORD RULE DOES NOT DESCRIBE IT. A
DISTINCTIVE SINGLE WORD carried over is refused on its own, because an address,
a path or a name is one word, and one word is enough to leak.

THREE THAT FIRED, each alone and each with no run around it: `reachability`,
`implementation`, `documentation`. None is secret and that is the point — the
guard cannot tell a rare technical word from a rare private one, so it refuses
both and asks you to say it differently.

WHAT THIS MEANS WHEN YOU WRITE ONE. Do not paraphrase the note sentence by
sentence. Put the note down, say what the thing IS in your own vocabulary, and
expect an unusual word you kept to bounce.

AND TELL A SUBAGENT THIS IF IT DRAFTS ONE FOR YOU. A reader that has just read
the note writes in the note's words without meaning to. Eight statements were
refused and rewritten in one retro for exactly that.

THE REFUSAL QUOTES THE OVERLAP BACK, so the fix is one edit rather than a
guess at which sentence was recognised.

WHAT IT DOES NOT CATCH, said here so nobody reads it as a guarantee: a
REWORDED private sentence. The check makes the lazy path illegal; it does not
make the honest path easier. That limit is
raid-asm-a-verbatim-overlap-check-catches-the-paste-that-matters.

CANNOT STATE IT CLEANLY? Say that, in the statement. The pool carries it as an
open question, and an open question is a legal option. What is refused is
silence and paste, never honesty.

### SE-C-125 — a wall of prose
Long prose carries line breaks. Paragraphs are the author's job — no
renderer can invent them.

## The same refusal, three times over

A refusal carries four things.

- the clause
- what was expected
- what it got
- an executable remedy

That is enough to recover in one turn WHEN THE READER TAKES IT.

A reader who does not take it gets the identical answer again. From inside,
the third identical answer looks exactly like the first, so nothing about the
answer itself says a loop has started.

SO THE ANSWER NOW COUNTS ITSELF. From the third identical refusal on — same
tool, same clause, nothing that succeeded in between — the refusal carries a
`repeated` block naming the count and saying the remedy is not landing.

- AT THREE it points you past the remedy line to the CLAUSE. The clause says
  what the engine wanted; the gap between that and what you sent is the thing
  to change.
- AT FIVE it stops advising another attempt. Say plainly what you were trying
  to do and what stands in the way. No answer could unblock you? That is an
  escape. An answer would? Ask where you stand and wait.

A CALL THAT GETS THROUGH CLEARS IT. The memory is one slot deep on purpose:
what matters is a refusal repeating BACK TO BACK, and a clause hit twice an
hour apart is not a loop.

A STATE GATE IS THE COMMON CASE, and it never opens by retrying. The tool is
not legal where you stand, no argument to it changes that, and the state holds
that job deliberately. Do the work the state names, or capture it with
`se_note` and keep walking.

MEASURED ON THE i15 WALK: `se_file_move` was refused 27 times with SE-C-110,
the whole burst inside NINE SECONDS. The two guards that exist measure
something else — the toll counts silence, the stall guard counts updates since
anything closed — and both were satisfied throughout. The walk was narrating
and the walk was busy. It was busy asking one question that had already been
answered.

### SE-C-146 — the write would add a second surface

WHAT IT MEANS. The write would leave an engine module emitting widget markup
while the editor registry does not name it and the exemption list does not
declare it.

WHY IT REFUSES. A second surface accreted once over months and nothing
objected, because nothing could. Both halves kept working, and only their
disagreement was visible.

THE RULE, in one sentence: only a module the editor registry names may emit
widget markup.

WHAT COUNTS AS EMITTING. A template literal carrying an opening block tag —
div, section, main, aside, table, ul, ol, form, button or svg — or a tag with a
class attribute.

### It refuses the addition, never the edit

A FILE THAT ALREADY EMITS STAYS EDITABLE. The check asks whether THIS write
turned a quiet file into an emitter, so a file already on the list is untouched
by it.

THAT IS DELIBERATE. Eighteen engine files already emit, and folding them into
the one surface is the work. A guard that froze them would block the fix as well
as the fault.

### The three ways past it

- IT IS A FORM EDITOR. Register it in
  [deliverable/engine/editors/index.ts](deliverable/engine/editors/index.ts).
- IT IS GENUINELY NOT A SECOND SURFACE — a test fixture, a diagnostic page, a
  vendored component. Declare it in
  [widget-exemptions.md](deliverable/machines/widget-exemptions.md) with its
  reason. A bullet with no reason is ignored.
- IT IS PART OF THE ONE SURFACE. Put the markup where that surface emits it,
  rather than opening a second place that emits.

THE SWEEP ASKS THE SAME QUESTION about the whole tree, for a break no write
arrived with — a rename, a merge, a registry line deleted out from under a
module still emitting. One rule, two callers, no second copy.

### SE-C-145 — the search pattern is not a regex

`se_file_search` runs a regular expression, and an ordinary source fragment is
a regular expression with an unclosed group in it. `function route(` opens a
group that never closes. `catch (e)` does the same.

THE ESCAPED PATTERN RIDES THE REFUSAL. Escaping is mechanical, so the answer
carries the version that would have worked, ready to send. Deciding whether a
literal was meant is not mechanical, so it is offered rather than substituted —
send it, or write a real pattern.

WHY IT IS A CLAUSE AND NOT AN ERROR. This came back as raw ripgrep stderr with
no clause, no remedy and nothing executable, which is the one thing every other
refusal in this lane is not.

MEASURED ON THE i15 WALK: three searches within a few minutes, all the same
mistake, each one a thing the reader plainly meant literally.

### SE-C-154 — the write would add a reach nobody declared

MINTED AS SE-C-149 AND RENUMBERED AT THE MERGE. i63 shipped its own SE-C-149
first, and a number in a shipped log is never reused. SE-C-143 was renumbered
for the same reason, so this is the second time that rule has been applied.

WHAT IT MEANS. The write would leave an engine module holding a governed conversation while no departure records it.

THE RULE, in one sentence: every reach out of the engine goes through a named door, or is recorded with its reason.

#### It refuses the ADDITION, never the edit

A MODULE THAT ALREADY REACHES STAYS EDITABLE. The check asks whether THIS write turned a quiet module into one that reaches, so a module already on the list is untouched by it.

THAT IS DELIBERATE. Most of the engine reaches the disk conversation today, and moving them is the work. A guard that froze them would block the fix as well as the fault.

HOW MANY IS THE SWEEP'S ANSWER, NOT THIS PAGE'S. A number typed here is right on the day it is typed and wrong on the next import somebody adds. A hand-written count standing beside a computed one is the defect the door rule exists to stop, in prose instead of code.

#### The three ways past it

- ROUTE THE REACH THROUGH THE DOOR. That is the answer where the module has no business talking to the capability directly.
- DECLARE IT, with its reason, in [deliverable/machines/doors.md](deliverable/machines/doors.md). The refusal hands back the exact patch.
- CHANGE NOTHING AND WRITE SOMETHING ELSE. A module that does not reach is never asked.

#### What it cannot see

A REACH THROUGH A SPAWNED PROCESS. A command is a string carrying no path the guard can resolve into a target, and 38 of 178 engine modules hold that channel.

Each door's own rule states this limit rather than implying completeness. The sweep carries the coverage the guard cannot, which is why it is the complete check rather than a second opinion.

### SE-C-155 — the departure states no reason

MINTED AS SE-C-150 AND RENUMBERED AT THE MERGE, for the same reason as its
sibling above.

WHAT IT MEANS. TWO SHAPES fire this clause, and both are a bullet below the marker that grants nothing.

- A line carrying a path and nothing after the dash.
- A line the parser cannot read as a departure at all: no `.ts`, no root-relative path, or a bullet that is prose.

THE REASON IS THE ENTRY, NOT METADATA ON IT. A bare path is not a line.

AND A LINE NOBODY CAN PARSE IS WORSE THAN A BARE PATH. The author is told nothing, believes an exemption stands, and the sweep goes on reporting the module forever. That was the fourth of the four line-shapes the test spec named, and it was silent until it was refused.

#### Why it refuses rather than ignores

IGNORING ONE LEAVES THE LIST UNREADABLE. A reader who finds a bare path cannot tell a rejected line from one nobody wrote, and the module it names goes on being reported with no explanation.

The widget list ignores a reasonless bullet. This one refuses it, and that is the correction.

#### What counts as a reason

ANY NON-EMPTY TEXT AFTER THE DASH, once trimmed. Whitespace alone is refused.

IT DEMANDS A REASON, NEVER A GOOD ONE. Judging quality is a reviewer's job, and the list is what they read. Measured across 113 reasons a refusing verb has actually collected here: 104 are considered, and the 9 that are not sit in a single record where the honest answer genuinely was the same nine times.

#### The refusal names three things

- the file
- the line, counted in the file
- the offending path, quoted back

EVERY BARE LINE IS NAMED, not the first. Reporting one at a time cost an author one refused write per missing reason.

The remedy it hands over is the exact patch that adds a reason to that line, ANCHORED TO THE WHOLE LINE. A bare `- <path>` is a strict prefix of the same path already declared with its reason, so an unanchored match found two occurrences and the patch refused as ambiguous — for the commonest case there is.

#### Any dash separates the path from the reason

Demanding an em dash means a person typing a hyphen gets nothing and no error to explain it.
