# baton against quackitect level two

Read after DESIGN.md stood: quackitect's `README.md` and `spec/design_input/level-two.md`, and nothing else of its tree.

**Disclosure.** This session ran inside quackitect's level zero: its output style (rules on handovers, tickets, voice) sat in my context from the first turn, and its hooks refused or redirected many of my calls. I read none of its spec, src or `.claude` files before this comparison, but the rules in my context may have shaped baton. The handover rule is the likeliest source of the *baton* idea. Read the convergences below with that in mind.

| question | answer |
|---|---|
| Where do the two agree? | On the core: the engine holds the process out of the agent's sight, the agent hands back answers that checks judge, a re-entry after a clear re-hands the step, tests go red before green, and a cold reviewer who is not the author stands at the gate. |
| Where do they differ most? | Weight and evidence. Quackitect builds four levels with doors over every call, guidance resolution, deliveries, fix tickets and blesses. Baton is one table, nine verbs and a list of steps, and it measured itself against a single agent. |
| Which is better? | For the question asked, neither has shown it beats one agent. Baton measured, and found that at task sizes up to an hour a stopping rule in the prompt matches all of its machinery. Start there; add machinery, from either design, only where an A/B shows it pays. |

## Where the two converge

| idea | quackitect level two | baton |
|---|---|---|
| state out of the agent's hands | the engine merges every answer; no hand writes the ticket file | the model never writes state; it claims, and gates decide |
| re-entry after a reset | a bare pull after a clear or compaction hands out the step in hand again | the card at every session start, compaction included |
| tests first | tests-red, then tests-green | `red` must fail (first pass), `green` passes with tests frozen |
| independent review | the engine spawns a cold reviewer, a hand other than the author | a helper who authored no step, at the exact commit |
| evidence tied to what it judged | a bless binds to a hash; moved inputs mark steps stale | verdicts, approvals and CI bind to the commit sha |
| an exit from loops | a second reject inserts a person step | `max_bounces`, then the owner |
| scope of a review | "an objection blocks only where this gate resolves it" | v4's review goal: reject naming the rule of the ask the code breaks |

Two independent attempts landing on the same core is weak evidence the core is right, weaker given the disclosure above.

## Where they differ

| | quackitect level two | baton | which I think is better, and why |
|---|---|---|---|
| where process state lives | ticket files in git; the engine stays cold and runs at each pull | an append-only event log in SQLite; git holds code only | **mixed.** Files in git survive everything and review like code. A log gives a clock and an atomic claim. The note names no lease, heartbeat or stall detector; baton's whole crash path runs on them, and in the v1 relay runs that path carried 66 of 68 handovers. |
| handover | handover, clear, read-handover at phase boundaries | a baton line required on *every* claim; lease expiry hands over the rest | **baton**, on measurement: agents ended sessions with an explicit handover 2 times against 66 expiries, because a turn cap or a crash comes without warning. A handover written at a boundary is missing exactly when it is needed. Whether quackitect's handover is written that way I cannot tell from this note. |
| review verdicts | accept, accept with points (mints fix tickets), reject; the reviewer fixes small faults in its own commit | approve or reject | **quackitect.** Baton's reject-only reviewer gold-plated: four escalations in v3 came from edge cases the ask never named. *Accept with points* would have let those works land with fix tickets instead of bouncing. |
| what the agent reads | the ticket carries resolved guidance per step, by tags | the card: ask, step goal, gates, baton, findings | **quackitect** for the mechanism. Baton's v4 finding is that a step's goal text steers the agent: "make the tests pass" made the tests the target. Per-step guidance is the general form of that lever. |
| size limits | a measured cap; the hand-out splits and the step stays whole | v1-v2 cut the ask at a fixed length; v3 never cuts it | **quackitect.** It anticipated the exact failure baton hit: a card cut mid-rule, and a false *done*. |
| staleness | hash per input; a moved input marks exactly the steps reading it | any HEAD move stales the review, CI and approval | **quackitect** for precision; baton's rule is coarser but one line of code. |
| unit of landing | a delivery: one branch, one final acceptance, children inside | one work, one branch, one PR | **depends on owner attention.** A delivery costs the owner one acceptance for many works; baton costs a tap per work but lands small PRs independently. |
| final acceptance | a cold reviewer reads the code and the prose criteria | the owner taps, with CI green at the same sha | **quackitect** on attention, **baton** on control. The brief asks for the owner in control at minimal attention; a judge-led acceptance with an owner bless only where a gate asks fits that better. |
| owner surface | a VS Code sidebar | a phone-first inbox of decisions | **baton**, for the brief's owner, who reads and steers from a phone. |
| enforcement on every call | level zero: doors over every write and command | none outside the MCP verbs and three hooks | **baton**, on cost. See below. |
| evidence that it beats one agent | none in this note | the relay experiment, 195 chains | **baton.** Its evidence mostly says that machinery does *not* pay at the scale tested, which is the point. |

## What level zero cost this session

I worked a research task inside quackitect's level zero without being part of its process. Its doors:

- refused every Bash call that did not open with a ticket name, so I had to mint a private ticket before I could create a branch;
- refused `git add` and `git commit` in every form and sent me to a commit verb that lands only on the main checkout, so this branch could not be committed from the session at all;
- lost its index when the shell's working directory moved into a worktree, and refused all commands until it was restarted;
- asked the plan question again whenever its grace ran out, and refused the next call meanwhile;
- refused the reviewer subagent's test runs for want of a ticket name, so the code review reported twelve defects it could not confirm by running code.

Each door guards a real failure, and inside quackitect's own process most of them would not have fired. But the brief asks for the least machinery that keeps a model on track. These doors cost on every call, and a door blocking the correct action (committing the branch the owner asked for) is the gated-process failure baton's measurement kept finding: a guard that blocks honest work costs more than the cheat it stops.

## Recommendation

Start from the measured floor: one agent, a stopping rule, commit discipline. When the work outgrows what a repo can hand over (owner answers, crashes mid-edit, parallel agents), add baton's level 1 (log, card, baton on every claim, one gated step, leases with a supervisor), with four mechanisms from quackitect level two:

1. *accept with points* and fix tickets, in place of reject-only review;
2. a measured size cap that splits a hand-out and keeps the step whole;
3. per-step guidance in the card, since the goal text steers;
4. hash-precise staleness, once routes grow past four steps.

Add each piece of the rest only when a relay-style A/B shows it pays.

What it costs: baton's level 1 gives up the independent reader until work is large, and gives up quackitect's file-in-git durability for a database that needs its own backup (the PR-description export DESIGN.md plans).

**The strongest objection:** quackitect targets long, many-phase projects, and baton's evidence comes from tasks under an hour, where heavy machinery is expected to lose. That is true, and it is the limit of my evidence. My answer: the burden sits with the machinery. In 195 chains, nothing in baton beyond a stopping rule paid measurably at this scale, and its review step produced most of the owner interrupts. Quackitect's machinery should face the same A/B against a single agent at the scale it targets. The relay driver in `eval/` runs any harness that attaches to Claude Code through hooks and MCP.
