# COMPARE: clean-room design C and quackitect v5

## How this comparison was made

- **What I read, and when.** C's design, prototype and evaluation were committed first (commit `8beb70c`,
  "Design final, before reading any prior implementation"). Only after that did I read two files from the
  owner's repo, via `git show origin/main:<path>`: `README.md` and `spec/design_input/level-two.md`. I did
  not read `spec/` beyond that, nor `src/`, `.claude/` or the v1–v4 branches. Running `git branch -a` to
  find `origin/main` also printed branch names. I did not use them.
- **Contamination disclosure.** Before I started, this session's tool context listed two skills from the
  owner's repo, with one-line descriptions:
  - `dispatch`: "reads the dispatcher's plan and leaves; a GitHub Action (`dispatch.yml`) lands the writes,
    opens their pull request, fires one worker per ready group and per stuck hand-over, hands a question to
    a box, opens no GitHub issue"
  - `work`: "takes one work branch, works its group to done, hands it back through a pull request"

  Two C choices sit close to these and may have been primed: Tier 1′ (Actions as clock and dispatcher)
  and rejecting GitHub issues as the source of truth. I think both are natural options and C argues for
  them independently, but I cannot rule out the priming. C's primary recommendation (an always-on
  coordinator) differs from what the descriptions imply.
- **Limits.** Below, "v5" means what those two documents say. Many details v5 surely has (how holds
  expire, how the box is launched) are not in them, so a "v5 lacks X" here means "these documents do not
  describe X".

## Side by side

| Question | C (`hx`) | v5 (from level-two.md and README.md) |
|---|---|---|
| Layers | outer loop (harness: tickets, steps, leases) and inner loop (Claude Code turns) | level 0 the doors (plugin), 1 the ticket, 2 the processes/gates/deliveries engine, 3 applications (retro, sprint, …) as processes |
| How the agent gets work | `hx claim` or a dispatched session; the SessionStart hook injects the **brief** | a hand **pulls**, and the engine hands out the next step as a ticket (does, ask, fields, checklist, checks, guidance) |
| What survives a reset | the brief is re-injected after compaction; fresh session per step; checkpoints | "a bare pull after a clear or a compaction hands out the step in hand again"; phases "block a clear"; handover, clear, read-handover |
| Who writes state | only the engine, by validated events; agents send intents | "No hand writes the ticket file"; the engine merges the answer |
| Where state lives | append-only **event log**, folded deterministically (JSONL, git ref, or coordinator) | **ticket files** per process and delivery, in the repo; steps with states in a record; a warm index; engine verb merges records by step and `hash_before` |
| Engine runtime | CLI folds the log per call; coordinator holds it in memory (designed) | "the engine stays cold and runs at each pull, and the index is the warm part" |
| Standard route | (draft) → design → red → green → **review** → accept (risk-based owner approval) → land (merge queue) → retro | design: draft, tests-red → **gate after design** (reviewer) → implement: change, tests-green → **final acceptance** (reviewer) |
| Reviewer | cold, non-author session; **may not edit**; verdict approve/changes/reject routes the ticket | cold, non-author; **may fix within its own diff as its own commit**; verdict accept / accept-with-points (fix tickets) / reject; a second reject inserts a person step |
| Evidence | pointers to pushed commits, verified in a clean export (red loads/runs/fails and is frozen; green keeps frozen blobs; review pinned to the candidate SHA) | forms: command, verdict, list, file; hashes of inputs and of step definitions; a moved input marks exactly the dependent steps stale |
| Human sign-off | owner answers in the inbox; approval keyed to step and visit; land merges the exact reviewed SHA | the **bless**, bound to the hash of what it blesses, stripped by any edit; doors stop the agent forging it |
| Loops and limits | `max_visits` leads to an escalation card (one more / take over / redesign / cancel) | a second reject inserts a person step; past its cap the final acceptance closes `became` onto a question |
| Groups | group process (plan → run → retro) over **per-ticket branches** that land through a serial merge queue | **delivery**: one branch, one final acceptance, then sync, split, children, acceptance, retro |
| Parallelism | across tickets: scope-overlap scheduling, dependency DAG, merge queue | (from the skill description) one worker per ready group |
| Liveness | leases with **epochs** as fencing tokens; activity vs progress; nudge → fresh agent → owner | "stuck hand-over" (in the dispatch skill description); not described in level two |
| Owner surface | phone-first web inbox (one tap, defaults, deadlines), board, detail; push batching | VS Code sidebar at the desk; person steps on cloud leave as question tickets via `branch unblock` |
| Guidance | step instructions in the process; protocol skill | tag-resolved guidance notes printed into the ticket; a check that every note reaches a step |
| Limits as requirements | measured: hook 50–90 ms, brief 240–550 tokens | time budgets per call tested in the battery; tool-answer size cap measured, hand-outs split under a margin |
| Proof | paired A/B protocol, Monte Carlo on the real engine, real-model pilot | an adversarial attack on the design and "the strongest case against it", answered finding by finding |

## Where the two converge (and so are probably right)

1. **The engine owns the process; the model only answers steps.** Both put the route, gates and checks in
   a model-free engine. Both make the step in hand recoverable after a clear or compaction ("bare pull" in
   v5, re-injected brief in C). Neither lets an agent write process state.
2. **Red before green, as gates, not advice.** v5's design phase ends in tests-red, and its check reads the
   expected-red tests as red until tests-green. C freezes the red tests and checks them blob for blob.
3. **A cold, non-author reviewer spawned by the engine.** Both reached this independently, and both give
   it the power to send work back.
4. **Human sign-off is bound to exactly what was judged.** v5 binds the bless to a hash, and an edit strips
   it. C keys approvals to a step visit, pins reviews to the candidate SHA and lands that same SHA. Same
   principle, with v5's more general.
5. **Doors and hooks guard what an agent must not do**, including forging the owner's sign-off (v5: write
   and shell doors refuse the bless key and the box variables; C: owner-only events plus hook denial of
   owner commands). Both treat agent impersonation of the owner as a real risk.
6. **Loops end at a person.** A second reject (v5), or `max_visits` (C), turns an unproductive loop into a
   human decision instead of another round.
7. **Findings and retros are work, not tickets in an issue tracker.** Both refuse GitHub issues as the
   place where work lives, and both feed retros back into the process.

## Where they differ, and what I think

| Topic | Assessment |
|---|---|
| **Staleness** | **v5 is ahead.** It hashes every input and step definition, marks exactly the steps whose checks read a moved input, and rewinds runtime edits to the last step that stands whole. That is the general mechanism of which C's frozen tests and pinned review are special cases. C's open limitations (main changing a frozen test; criteria edited after red not invalidating red) are exactly what it solves. |
| **Reviewer edits** | **The pilot data favours v5's choice; I would take a hybrid.** C's reviewer may not edit (pure separation). In C's real pilot, a reviewer found a one-character defect (`$` → `\Z`), and fixing it cost a full green-plus-review cycle: two extra sessions. v5 lets the reviewer fix "within its own diff, as its own commit", and accepts the self-grading cost explicitly. Hybrid: a reviewer may commit small fixes outside frozen files, those commits are evidence of their own, and the final acceptance (another cold hand, or the owner) reads them. |
| **Accept with points** | **v5 is ahead.** It turns review findings into child fix tickets that go first, while the process continues. C only has route back to green, which re-runs the whole loop for any finding. |
| **State model** | **Both work; they suit different scales.** v5's per-process ticket files keep state *with the work*, need no server, and are diffable and reviewable in PRs, but need merge verbs (`hash_before`) and an index for speed. C's single event log gives atomic transitions, simple concurrency, replay, audit and simulation for free, but needs a writer: a coordinator, or a git ref with compare-and-swap. C's validate-on-fold idea could serve v5 too: records merged by step and hash are close to a fold over per-step events. |
| **Groups and branches** | **A real fork: parallelism against merge simplicity.** v5: one delivery branch, children worked in it, one final acceptance, no merge queue inside a delivery. C: a branch per ticket, parallel sessions and a merge queue. That gives more throughput, but conflicts are real: C's demo hit one, which the queue caught. For groups that touch shared files, v5's model is cheaper. For wide groups of independent tickets, C's is faster. A delivery could pick either. |
| **Liveness** | **C is more explicit here.** It has leases with epochs (fencing), conditional expiry, separate activity and progress signals, and a ladder (nudge, fresh agent, owner) — all tested, including against real sessions. These documents only mention the stuck hand-over. |
| **Owner surface** | **Different bets.** v5 invests in the desk (the VS Code sidebar, the bless button). C is phone-first: an inbox where every decision has a summary, options and a default, with urgent-only push and batching. The problem statement says "mostly from a phone", and v5's person steps on cloud become question tickets, so C's inbox design is directly portable. |
| **Guidance** | **v5 is ahead.** It resolves guidance by tags, prints it into the ticket, and checks that every note reaches a step. C has nothing comparable beyond the brief's step instructions and a skill. |
| **Limits as tests** | **v5 is ahead.** It has time budgets per call in the test battery, and a measured tool-answer size cap with split hand-outs. C measured the same quantities (its O(n) fold is exactly what a budget test would catch) but did not turn them into requirements. |
| **Evidence of value** | **C is ahead.** It has a pre-registered A/B protocol with power analysis, a Monte Carlo that doubles as an engine property test, and a real-model pilot driver. The pilot validated the hook contract against the real binary and found three defects unit tests missed. v5's adversarial design review is a different and complementary practice: it attacks the design before building; C's pilot attacks the build. |

## What C would take from v5

1. **Hash-bound everything, plus exact staleness.** Every approval, verdict and gate result records the
   hashes of the inputs it read. A moved input marks exactly the dependent steps stale, and process edits
   rewind to the last whole step. This replaces C's frozen-test special cases.
2. **Accept with points, and bounded reviewer fixes** (the hybrid above).
3. **Tag-resolved guidance with a reach check**, printed into the brief.
4. **Time budgets and size caps as tests**, for the brief, the hooks and the fold.
5. **An adversarial review before building**: "an attack and the strongest case against", answered finding
   by finding, with costs accepted explicitly in writing.
6. **The findings road**: every finding carries `failure`, `evidence` and `unchecked`. The `unchecked`
   field is a small idea worth a lot.

## What v5 could take from C

1. **Fencing tokens.** An epoch per hold, checked on every write, plus a door that refuses a zombie's tools
   within one call. Even with one box per group, a re-dispatched stuck hand-over can race its predecessor.
2. **The activity/progress split and the escalation ladder.** A fresh session is the cheapest fix for a
   stuck agent, and the owner is the most expensive.
3. **Evidence only from the shared remote.** C's real pilot caught an agent submitting an unpushed commit
   just before its session died. A remote-only evidence rule turns that from silent loss into a
   recoverable refusal.
4. **The real-model pilot as a test layer.** Run the actual agent binary against the doors, budget-capped,
   and grep its stream for the doors' effects. It found false positives in C's doors that no unit test
   could. v5's doors (write, shell) face the same risk.
5. **The phone inbox contract**: a summary of 280 characters or less, options, a default with a deadline,
   urgent-only push, batching, and an attention budget per ticket.
6. **The event-log fold for simulation.** Replaying thousands of randomized fault scenarios through the
   real engine, with invariants checked, is cheap once transitions are a pure function.

## Open questions for the owner

- Does a delivery's one branch cost you parallelism you want? C's data point is that per-ticket
  parallelism needs scope scheduling plus a merge queue, and it still hit a conflict on an undeclared
  shared file.
- Is the reviewer's self-graded fix acceptable for medium and high risk, or only for form faults?
- Where should a stuck hold go first: a fresh session or a person? C's ladder spends sessions before
  attention. v5's "second reject inserts a person step" spends attention earlier, for review loops.
