# engage — advance the iteration:  start | next | refine | ship

> **Re-read the contract.** Load `product/quackitect/method/prompts/contract.md` before you touch the ledger. It binds every step below.

## start  (plan + begin an iteration)
1. **retro** — run `/review retro`. It opens with the field-feedback question and emits notes.
2. **triage** — process `.quack/notes/inbox/` (see triage.md).
3. **migration** — walk the ready backlog. For each item: keep, drop, or pull into this iteration.
<!-- design: versioning-method  implements: versioning :: A version IS an iteration. Create a planned one by writing iteration.md; ids are i_NNNN_name; only engage start mints versions; notes stay trunk-owned. -->
4. **version planning** — assess what is NEW: retro notes, the drained backlog, field feedback. Then suggest how to version it.
   - Things that go together belong in one version.
   - Prefer folding small tool or infra work into the ACTIVE iteration. Do not spin a dedicated tooling version for it.
   - Create a **planned** version with `quack start --plan <id> "<one-line motivation>"`. It writes the planned `iteration.md`. Type and rigor stay unset until you activate it.
   - You MAY add to an already-planned version that has not started.
   - **Only `engage start` creates versions.** Never mint them ad-hoc. Ids are `i<NNNN>_<name>`, four-digit zero-padded.
<!-- enddesign -->
<!-- design: planning-method  implements: planning :: quack start composes the project type over a rigor floor, tailors it to the idea (above the floor, never removing a killer), runs a plausibility check, and bakes a self-contained checklist of gates+subtasks. -->
5. **plan & bake** (for the version being started now):  → **load `compose-reference.md`** for the exact node/gate frontmatter, edge directions, coverage-rule names, rigor→milestone mapping, and plan-lock semantics. Do not re-derive them by reading example files.
   a. Confirm the project TYPE and RIGOR (`.quack/config.toml`). If the vision mismatches either, run the plausibility check. Re-confirm with the human. Then `quack start <version> "<motivation>"` — it activates the version (status active, type/rigor inherited) and points config at it. A planned version flips to active. The motivation surfaces in the report's iteration detail.
   b. `quack gather <version>` — collect ALL the rigor and type source into `.quack/gather/<version>/source.md`. That is checklists, prose, prompts, spreadsheets, and links.
   c. Read the WHOLE bundle. Open any flagged file. Follow any link. Then COMPOSE the plan as two separate layers in `spec/iterations/<version>/`:
      - **Trace** (content) — the typed design nodes: need, use-case, requirement, design, test, ADR. Use semantic edges only: refines, implements, verifies, addresses. The trace is content, not gates. It is never blessed and carries no DONE/SUSPECT/OPEN. It only ripples change downstream.
      - **Gates** — SEED every milestone of the rigor checklist into `tasks/` as a GATE plus its subtasks. Give every gate and subtask an **iteration-unique id**: namespace the local name by the iteration tag (`m1-gate` → `i3-m1-gate`). Ids share one global keyspace, so a reused id silently shadows the other iteration's node on load. `quack lint` fails on any duplicate. Seed each milestone's FIRST subtask(s) `depends_on` the prior milestone gate (milestone-monotonic) so `next` cannot jump a later milestone ahead. **Within a milestone, the report orders subtasks by their in-set `depends_on` chain** — so wire intra-milestone edges to reflect the intended sequence: a subtask that must run/display AFTER another depends on it, not on the prior gate. E.g. in M6, `build-planned` hangs off the prior gate, `build` depends on its LAST build step, and the quality/verification subtasks (`detailed-design-complete`, `internal-quality-ok`, `verification-green`, `impl-risks-acceptable`) `depends_on` `build` so they render after it. Wiring them all to the prior gate flattens them to one rank and mis-orders the lane.
        - **Milestone gate** — id `<itag>-m<n>-gate`, `class: review`, `killer: true`, `milestone: M<n>`, `depends_on` its subtasks plus the prior milestone gate. It is the increasing-scrutiny review (`guides/milestone-review.md`).
        - **Subtask** — one per acceptance item, `milestone: M<n>`. A subtask that checks the TRACE is **derived**: `class: executed`, `verify: coverage:<rule>` — the engine computes it live, no human stamp. The rest are **judgment**: `class: review`.
        - **Coverage rules**: `req-traced`, `req-has-test`, `req-has-design`, `adr-traced`, `designs-realized`, `tests-pass`.
        No milestone may be empty.
      Then tailor the statements to THIS idea. Add subtasks above the rigor floor. Never remove a killer gate.
   d. On the human's approval, the plan is set — its gates start **OPEN**, to be walked. **Do NOT `quack bless --all`.** Blessing at plan time marks every milestone DONE, makes `next` a no-op, and shows a falsely-green board (the exact trap that lets an un-built M5 read green). Executed/derived checks compute live; each **review gate is blessed one milestone at a time as you genuinely complete it**, via its handover pager (see next → ADJUDICATE).
<!-- enddesign -->

## next  (walk the next forward check)

> **TRUST THE PROCESS — do not over-check (a known, costly failure mode).** Concentrate ONLY on the
> check in your hand. Do exactly what it asks, produce its evidence, and move to the next. **Do NOT run
> `status` / `lint` / `why` / `selftest` between steps "to see if anything broke", and do NOT re-inspect
> the trace outside a milestone review.** The engine already does the checking for you: derived gates
> compute coverage live, executed checks re-run themselves, and a change ripples to SUSPECT
> automatically. **Verification belongs at the milestone gate — nowhere else.** Mid-build, transient
> OPEN/SUSPECT is NORMAL (global V&V stays red until the build's tests all exist and pass); do not chase
> it, do not narrate impact analysis, do not re-derive what the ledger already tracks. Checking traces
> between milestones is wasted motion that breaks your concentration and burns the user's trust. Build
> heads-down; review only when you reach a `…-m<n>-gate`.

0. **Pick the version.** Default to the latest not-done version. If every version is done, start the earliest planned one. Compose its checklist as in `start`. Announce which you chose. If several versions are open and the human names one, lock onto that version. Hold it for this and the following `next` calls until told otherwise.
1. `quack next` — the determinizer hands you the next ready check. Its upstreams are satisfied.
2. **FILL** it. Do the work. Produce the evidence. For executed checks, make `verify` pass.
   - **Code that realizes a requirement IS its design node.** Declare it inline where the code lives, never in a `.md`:
     ```
     # design: <id>  implements: <req-id>
     # one-line description of the design (becomes the node's statement)
     <the code>
     # enddesign
     ```
     The engine scans `product/` for these markers. `quack lint` surfaces a requirement with no design. It folds the region's hash into the design. So editing the code reopens the design SUSPECT. Architectural **decisions** stay as ADRs in `spec/`. Only **realized code** gets a `design:` marker. A requirement with no realized code is an honest design-hole. Leave it.
3. **ADJUDICATE.** A gate → present the evidence. **For a killer OR milestone gate, ALWAYS render and SHOW the handover pager — `quack progress --pager <gate>` — as the hand-off (bar + decisions + risks + readiness + the y/n question). Never hand off a killer/milestone with a bare prose ask.** Ask the human to bless. Do not bless a killer on their behalf unless they explicitly tell you to bless that specific gate — a blanket "continue" is not permission; a human "y" to the presented pager IS that explicit bless (stamp `actor=human`). An executed check passes on re-run. Then run `quack next` again.
   - **Tag the adjudicator honestly.** `quack bless` stamps `actor=human` by default. When YOU (the agent) run a bless — a non-killer review you adjudicate, or one a human explicitly delegates to you — record it as agent: PowerShell `$env:QUACK_ACTOR='agent'; .\quack bless <id>; $env:QUACK_ACTOR=$null`. Leaving the default stamps an agent bless as human and blinds the self-cert metric (agent-blessed killers ÷ killers). A human's own bless keeps the default. Never tag a human bless as agent or vice-versa.
   - **Stop at every milestone gate.** A milestone gate (`…-m<n>-gate`) is a hand-off to the human, not a step you walk past. Before you stop, **write the milestone's evidence doc** (below), then render and SHOW the report (`quack report`) so the human reviews the board. Then run the increasing-scrutiny review (`guides/milestone-review.md`) and ask them to bless. Always show the report whenever you stop for the human at a milestone.
   - **Write the evidence doc — the verdict referent.** For each milestone, persist the FILLed evidence and the increasing-scrutiny review into `spec/iterations/<iteration>/M<n>-<slug>.md` (plain markdown, no frontmatter — it is evidence, not a node). One `## <heading>  → <check-id>` section per subtask, capturing what satisfied it; end with the review rounds and the verdict. The report's `verdict ↗` link on every DONE check in that milestone globs `M<n>-*.md` and opens this doc — **no doc, no verdict link.** Use the canonical slugs: `M1-frame`, `M2-inputs`, `M3-candidates`, `M4-decision`, `M5-spike-findings`, `M6-build-plan`, `M7-validation`, `M8-handover`. Write/extend it as you FILL the milestone's checks, and finalize it with the verdict before you ask for the gate bless.
   - **Entering M6, plan the build FIRST.** The first M6 step is `build planned`: decompose the build into small, resumable steps and seed them as CHILDREN of a generic **build** task (`parent: <itag>-m6-build`), in dependency order, with iteration-unique ids (mint them so they never collide — see the compose step). A monolithic build is lost on interruption; small nested steps make progress durable. **Lower bound — a step must earn its checkpoint.** Split by *unit of durable progress*, not by file: a step should be worth resuming on its own AND carry a single design or verification concern (a `design:` region, one test hook, one coherent behavior). Files authored together in one sitting that share a verification are ONE step, not several. If losing a step on interruption wouldn't hurt, fold it into its neighbour. **If your plan is a nested list, mirror that hierarchy 1:1 with `parent:` at any depth** — each item's `parent` is the item it sits under; the report nests and collapses the tree accordingly. The steps nest under the build task in the report; the **verification** task rolls up the tests. Tests stay in the trace (they verify requirements) — they are never task-tree subtasks.
   - **V&V is global.** Verification (`coverage:tests-pass`) runs EVERY test across all iterations; validation (`meets the need`) checks EVERY need across all iterations. New work is always re-checked against the whole suite so a regression in earlier work is caught.
Repeat until `next` reports "done".

<!-- design: refine-method  implements: refine-track :: Refine is a track orthogonal to rigor: explore an idea in a gitignored spike, capture the keeper backward into a design-input check (which reopens the affected cone via suspect), then re-walk. It is the default working mode in late phases. -->
## refine  (explore an idea, capture the keeper backward)  ← default in late phases
Once a build exists (post-M6) and you are NOT starting a new iteration, refine is the default working mode. It is M5's spike, turned into a cycle.
1. Take the human's **idea and their motivation**. Run a light coherence check. Does it fit the frame and vision? This is a quick judgment, not a gate. If it clearly does not fit, capture it as a note and stop.
2. **SPIKE** it in `.quack/spikes/<id>/`. This is throwaway, gitignored scratch space. Do NOT touch `product/` or any gated check yet. Iterate fast. Keep or discard.
3. On a **keeper**, **capture backward**. Write what you learned into the right design-input check (M1, M2, or M3 — the requirement or design it really was). That edit reopens the affected checks SUSPECT.
4. `quack next` then walks exactly the reopened cone. A contained change reopens little. An architecture-break steps back to M3. Re-walk. Then keep refining, or `ship`.
Discard the spike when done. A rejected idea → archive a note WITH its reason. That makes the rejection durable.
<!-- enddesign -->

## ship  (output the iteration)
`quack ship` packages `product/` into `.quack/out/`. Ship is the END of a forward iteration. The zip is ephemeral output. Do not commit it.

Reaches: `defer` (push a check to a later iteration), `retire` (drop one).
