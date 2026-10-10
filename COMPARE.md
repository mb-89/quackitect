# This answer against quackitect's level two

Read after the design stood: quackitect's README.md and
`spec/design_input/level-two.md`, and nothing else of its tree. One more
source is first hand: this session ran under quackitect's level zero,
so its doors (the write door, the shell door, the plan questions, the
output style) are known by being refused by them, not by reading them.

The bottom line: quackitect's design is deeper on the organisation of
work, and this answer is sharper on the three failure mechanics the
task stressed and on the owner's phone. Neither replaces the other. The
list of what to take from each is at the end, and one recommendation.

## The same words for the same things

| quackitect | this answer | the same thing? |
|---|---|---|
| level zero: the doors over the agent | the hooks: SessionStart, Stop, PreToolUse, PostToolUse | yes, with fewer doors here |
| level one: the ticket, one step, its requirements and guidance | the briefing of one attempt on one step | yes |
| level two: processes, gates, the engine with no model call | the routes, the gates, the service with no model call | yes |
| process, nested | route; a ticket runs one | theirs nests, this one does not |
| delivery: one branch, one final acceptance | group: one branch, one pull request | yes |
| ticket file as the truth, in git | the store, SQLite, one writer, with the event log | no: see below |
| the pull and the hand-back with a fields payload | claim, evidence, done | yes |
| a bare pull after a clear hands out the step again | the SessionStart hook on `compact` re-injects the briefing | yes |
| the reviewer spawned cold, a hand other than the author | the helper attempt with a fresh context, refused if it committed | yes, stricter here |
| accept, accept with points, reject, second reject to a person | pass, fail, hold after max fails | theirs is richer |
| the bless, bound to a hash, written by the editor alone | the owner's decision | theirs is stronger |
| a person step on a cloud box leaves as a question ticket | the ticket holds with reason `question`, in the inbox | yes |
| guidance resolved by tags into the hand-out | `brief` per step, under a budget | theirs is richer |
| the final acceptance reads the diff since its last verdict | the accept step after review on the final commit | theirs is explicit about reruns |

## Where the answers differ, and which is better

| point | quackitect | this answer | better | why |
|---|---|---|---|---|
| where truth lives | ticket files in git; the engine runs cold at each pull; the index is the warm part | a service with a clock; leases, heartbeats, fencing | depends | a cold engine needs no infrastructure and git backs it up; it cannot see a hand that is alive and making no progress until a pull, and the inbox is as fresh as the last pull. A service sees stalls and keeps the inbox live, and is one more process the owner runs. Their dispatcher on Actions is a tick at five-minute grain, which is the middle path. |
| what the agent carries | the output style's rules, the plan questions on every call, the resolved guidance per step, the doors | one briefing under two thousand tokens, six verbs, four hooks | this answer, for long work | fewer rules compete for attention, and nothing is in context that the store does not own. The cost seen first hand: this session was refused by the doors eight times for engine-specific form (a ticket name on every command, the plan questions, the index to revive), each refusal a turn; on a cloud box with no owner watching that is attempts. In their favour: every refusal said what to do next, and the writing rules serve a goal this answer does not have, a tree of prose that stays one voice. |
| the reviewer | spawned cold, and fixes within its own diff as its own commit, grading the fix it made; a cost the owner accepts | may not commit; a nit is a one-line `request_changes` the next attempt applies | this answer | a reviewer who edits is an author. Run 2 shows the cost of the strict form: one more attempt of seven turns per round of nits. Their case, a cheap fix avoids a round trip, holds for a typo and fails for anything a test should cover. |
| the verdicts | accept with points mints a fix ticket a point, a child the process waits on | a review carries findings as text; a non-blocking note is lost | quackitect | in both live runs the reviewer's non-blocking notes (a committed `.pyc`, an untested `n=0`) went nowhere. A fix ticket is tracked work. |
| red then green | tests the process lists as expected red read as red until tests-green closes | the test command fails at the test commit and passes at the implement commit, in a clean checkout, and the test files stand unchanged or explained | this answer, on verification; quackitect, on grain | a clean checkout at the exact commit guards against work that passes on the hand's tree alone, and the tamper check guards the tests; their per-test expectation is finer than a whole command's exit code. Both are worth having. |
| the owner's approval | the bless binds to the hash of what it blesses, and an edit strips it; the editor writes the key and the door refuses the agent | the decision records a verdict; a later commit goes back through implement and review | quackitect | binding the approval to the hash is explicit and cheap; this answer gets the same effect by routing and should record the sha it approved. |
| the owner's interface | the sidebar in the editor at a desk; a cloud box sends a person step out as a question ticket | the inbox first, on a phone, one card per decision with two or three buttons; the board and the timeline behind it | this answer, for the stated owner | the task says the owner reads and steers from a phone. The two files read say nothing of a phone. |
| a crash, a stall, a handover | the handover before a clear, the stale hold taken at a later pull | a lease per attempt, a progress clock, a kill after grace, a synthesised handover from the branch and the evidence, bounded attempts, then a hold | this answer | the three mechanics are explicit and tested, and run 2 exercised them. Theirs may hold the same in files this comparison did not read. |
| parallel work in a branch | a delivery splits into children on one branch, and an engine verb merges conflicts in a record by step and hash | one worker per group branch at a time; parallelism across groups | depends | theirs is more throughput and more merge surface; this answer gives the throughput up for zero merges inside a branch. For one owner on a phone, fewer conflicts to decide is the better trade. |
| a moved input | hashes of every input and of the step definition; a moved input marks exactly the steps whose checks read it; an edit upstream rewinds to the last whole step | an edited ask mints a new version and the running attempt hands over | quackitect | precise invalidation is the right model for a tree that is edited at runtime. This answer has nothing like it. |
| the retro | a process of its own, with findings that take a road: a ticket in a group, a person ticket, a note | one step, filing slow and change as lists | quackitect | a finding that becomes tracked work is the point of a retro; run 2's retro named a real gap (no timeline in the retro briefing) and it reached the tree only because a person read it. |
| the size cap | measured, with a margin and a split of the hand-out | a budget on the briefing, not measured | quackitect | measured beats assumed. |

## The strongest objection to each, and the answer

**Against this answer:** a daemon is infrastructure, and the owner's
fifth attempt chose files in git and a cold engine for a reason. If the
service is down, nothing moves and nothing is visible. Answer: the
service is one process on the smallest machine, its store is one file,
and its event log exports to a branch for audit. The clock is not
optional: a stall is only visible to something that runs when no hand
pulls. A cron tick over the ticket files, which quackitect's dispatcher
already is, gets most of the way with no daemon, at five-minute grain.

**Against quackitect:** the agent's context carries the rules, the
doors' demands and the plan questions on every call, and each refusal
costs a turn. On a cloud box that costs attempts with nobody watching.
Answer, in their favour: the refusals seen today each named the fix, so
one turn is the whole cost, and the output style buys a tree that reads
as one author. The counter stands for long work alone: the fewer rules
in context, the fewer the model drops under pressure, and a rule a hook
enforces needs no place in context at all.

## What to take from quackitect into this answer

1. `accept with points`: a non-blocking finding mints a fix ticket in
   the group, and the group waits on it.
2. The approval binds to a sha: a decision records what it approved,
   and the accept gate fails when the branch tip moved.
3. Hashes on inputs, so an edited ask invalidates exactly the steps
   that read it, instead of the whole attempt.
4. Per-step guidance resolved by tags, under the briefing budget.
5. A measured size cap on the briefing and the verb answers.
6. A retro whose findings take a road into tracked work.

## What quackitect could take from this answer

1. The lease and the progress clock with a kill after grace, and the
   synthesised handover from the branch and the evidence when a hand
   dies silent.
2. Verification in a clean checkout at the filed commit, and the test
   tamper check with the baseline that moves on every green pass.
3. A reviewer that may not commit.
4. The inbox as the owner's first screen on a phone: one card per
   decision, the evidence the decision turns on, two or three buttons.
5. Fewer doors in the agent's way on a cloud box: a hook that refuses
   should refuse writes and stops, and ask nothing the store can answer
   itself.
6. A fault-injected benchmark against a lone agent, with the
   planted-defect study of the reviewer first.

## One recommendation

Keep quackitect's ticket files and cold engine as the truth, and add
three things from this answer that cost little: a clock (the
dispatcher's tick) that expires a hold and synthesises its handover, a
gate that verifies in a clean checkout, and an inbox for the phone
rendered from the ticket files. Drop the reviewer's own commits. The
cost is one more tick to run and one more attempt per round of nits.
What would show this wrong: a measured run where the cold engine's
stale-hold pull recovers crashed cloud boxes as fast as a lease does,
and where reviewer commits break nothing over a hundred gates.
