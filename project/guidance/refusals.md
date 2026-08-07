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

## The git lane

### SE-C-002 — no history rewrite
Never rebase, never rewrite. Superseded content stays in history. Land
forward with a new commit.

### SE-C-003 — the agent never pushes
Pushing is the owner's act. Do not attempt it, and do not ask the shell to.

### SE-C-004 — git beyond the allowlist
`se_git` covers an allowlist of verbs. A job outside it belongs to the
engine, not to a workaround. If a merge or sync fails here, the result names
the conflict — that is information, not an obstacle.

## Files and paths

### SE-C-046 — a required argument is missing
Fill every required field. The schema is the contract.

### SE-C-101 — an unknown argument name
A wrong arg name is refused, never silently coerced. Check the schema before
inventing a field.

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

### SE-C-129 — the shell asked to do a lane tool's job
`se_run` is for what the lane cannot do. The lane's own jobs stay in the
lane, logged and structured:

- read
- search
- list
- patch

The ladder blocks after one warned run.

## Tests

### SE-C-130 — the tree is unchanged
An unchanged tree keeps its last verdict. Re-running proves nothing.
`force: true` is the flake door, and only that.

### SE-C-131 — the wrong test scope
Tests answer a question: did THIS change break THAT. A scoped run answers a
small diff. The battery is for when the diff outgrows scoped runs — the
refusal computes the flip point and hands you the right call.

## The walk

### SE-C-110 — the tool is not legal in this state
Tools are granted per state. A tool being illegal here means the machine
holds that job elsewhere — it is never an obstacle to route around.

### SE-C-112 — a condition is unmet
Entry and exit conditions want their evidence. The pull tells you which one
stands in the way and how to work it.

### SE-C-113 — the step outweighs the slider
A step weighing more than the session autonomy is the person's. Present it,
then stop. A message from them resumes the walk.

### SE-C-114 — stale position
Reserved. Never issued by this engine; old logs carry it.

### SE-C-123 — a dead end in the drawing
Completing this state would leave the machine open with nothing active — a
starved join. Fix the drawing, not the walk.

### SE-C-124 — the canvas fails to compile
The walk stands where it is. Fix the drawing; the walk resumes.

## Narration

### SE-C-040 — the toll is due
Narration rides the work: an update on every call that changes something.
When the toll lapses, the next call must carry one — resend the same call
with the update field.

### SE-C-120 — the update is malformed
A brief is ONE line carrying ONE thought. A brief chaining three or more
parts wanted to be a plan — send `{op: plan, items: [...]}` instead. Owner
ruling 2026-08-06: the refusal goes uniform on every op, with the engine's
proposed split riding the remedy; until that lands, resolutions refuse and
other ops auto-apply as plans.

### SE-C-121 — the node is unknown or resolved
Updates name an OPEN node. Check the node map that rides every result.

### SE-C-122 — done over open children
Everything started gets resolved. Resolve or re-home the children first.

### SE-C-133 — the checklist stopped moving
Narration that never closes anything records intent, not progress. After five
updates with nothing resolved you get one warning, riding the result as a
`nudge`. Ignore it and the next update refuses.

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

### SE-C-134 — a method write while a record is bound
Method cannot be changed from inside a record. Guidance, machines, matrix
rows, templates, the engine and the tests are SHARED, so a write to one while
a record is bound lands in that record's worktree and fans out from there,
pushing the record's copy over trunk.

That is not theoretical. It happened twice on 2026-08-07, and the first time
it overwrote trunk's tool list and deleted two lane verbs.

The remedy is one call. Step out with `se_pull {escape: "<why>"}`, make the
edit unbound, then aim back. The walk is left standing where it was.

A RECORD'S OWN CONTENT IS NEVER REFUSED here. Evidence and decisions under
the record's own folder are exactly what a bound walk is for.

## Notes and prose

### SE-C-073 — the note ref is unknown
Draining takes an existing `note-...` ref, exactly as listed.

### SE-C-125 — a wall of prose
Long prose carries line breaks. Paragraphs are the author's job — no
renderer can invent them.
