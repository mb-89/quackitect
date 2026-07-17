# engage — advance the iteration:  start | next | refine | ship

> **Re-read the contract.** Load `product/quackitect/method/prompts/contract.md` before you touch the ledger. It binds every step below. If this session has NO visible recital out yet, recite NOW — as a message that ends your turn, no tool call after it. A session's visible recital carries over between engages.

## start  (plan + begin an iteration)
0. **health check** — a sound workspace before any planning: `git status` clean (expected strays only) and `git fsck --no-dangling` quiet; then `quack build` green. The FULL battery is NOT part of the health check — it runs once per iteration, at V&V, via an explicit `quack verify <verification-check>` in its own visible console (req-lazy-verdicts). A corrupt git index (`rm .git/index; git reset`) is recoverable while the objects are intact — external agents with filesystem access have silently truncated files here before. Do not plan on a sick workspace.
1. **retro** — run `/review retro`. It opens with the field-feedback question and emits notes.
2. **triage** — process the notes inbox in the workspace data home (`quack version` prints it; `<data-home>/notes/inbox/`) — see triage.md.
3. **migration** — walk the ready backlog. For each item: keep, drop, or pull into this iteration.
<!-- design: versioning-method  implements: versioning :: A version IS an iteration. Create a planned one by writing iteration.md; ids are i_NNNN_name; only engage start mints versions; notes stay trunk-owned. -->
4. **version planning** — assess what is NEW: retro notes, the drained backlog, field feedback. Then suggest how to version it.
   - Things that go together belong in one version.
   - Prefer folding small tool or infra work into the ACTIVE iteration. Do not spin a dedicated tooling version for it.
   - Create a **planned** version with `quack start --plan <id> "<one-line motivation>"`. It writes the planned `iteration.md`. Type and rigor stay unset until you activate it.
   - You MAY add to an already-planned version that has not started.
   - **Only `engage start` creates versions.** Never mint them ad-hoc. Ids are `i<NNNN>_<name>`, four-digit zero-padded.
<!-- enddesign -->
<!-- design: planning-method  implements: planning :: quack start composes the project type over a rigor floor. It tailors it to the idea, above the floor, never removing a killer. It runs a plausibility check. It bakes a self-contained checklist of gates and subtasks. -->
5. **plan & bake** (for the version being started now):  → **load `compose-reference.md`** for the exact node/gate frontmatter, edge directions, coverage-rule names, rigor→milestone mapping, and plan-lock semantics. Do not re-derive them by reading example files.
   a. Confirm the project TYPE and RIGOR (`spec/project.toml`). If the vision mismatches either, run the plausibility check. Re-confirm with the user. Then `quack start <version> "<motivation>"` — it activates the version (status active, type/rigor inherited), points config at it, and SEEDS the rigor checklist skeleton into `tasks/` (pre-filled statements to tailor — filling is vetoing, not authoring). A planned version flips to active. The motivation surfaces in the report's iteration detail.
   b. `quack gather <version>` — collect ALL the rigor and type source into the data home (`<data-home>/gather/<version>/source.md`). That is checklists, prose, prompts, spreadsheets, and links.
   c. Read the WHOLE bundle. Open any flagged file. Follow any link. Then COMPOSE the plan as two separate layers in `spec/iterations/<version>/`:
      - **Trace** (content) — the typed design nodes: need, use-case, requirement, design, test, ADR, question. Use semantic edges only: refines, implements, verifies, addresses. The trace is content, not gates. It is never blessed and carries no DONE/SUSPECT/OPEN. It only ripples change downstream.
        A genuine unknown found while composing does NOT become a guess or a TODO in prose — mint it: `quack mint question --id q-<slug> --statement "<the question>"` (`state: open`), linked to what it blocks. Only the owner decides a question; the decision stamps `state: decided` + `decided_via:`, and that hash move reopens whatever was built on the open assumption.
      - **Gates** — the ENGINE seeds them: `quack start` already emitted every milestone gate and subtask of the rigor checklist into `tasks/` (go-seed-skeleton) with namespaced ids and milestone-monotonic wiring, the template wording as pre-fill. TAILOR the seeded statements to THIS idea — seeding proposes, the composer vetoes; hand-seed only when the seeder emitted nothing. Do not reuse old checklists, neither from your own early iterations nor from other projects — the rigor template is the single source of truth. Give every gate and subtask an **iteration-unique id**: namespace the local name by the iteration tag (`m1-gate` → `i3-m1-gate`). Ids share one global keyspace, so a reused id silently shadows the other iteration's node on load. `quack lint` fails on any duplicate. Seed each milestone's subtasks `depends_on` the prior milestone gate (milestone-monotonic) so `next` cannot jump a later milestone ahead. **ORDER IS NOT DEPENDENCY (owner law): a `depends_on` edge states a real prerequisite, never a display order.** Parallel subtasks hang off the prior gate FLAT — the report ranks real chains topologically and breaks ties deterministically by ID. Wire only genuine prerequisites (a build step on the step it builds on; `build` on its children; a check that consumes an artifact on its producer). Do not chain fillers behind a killer: with flat wiring the agent-blessable fillers finish first and the ready killer(s) + gate arrive as ONE combined pager.
        - **Milestone gate** — id `<itag>-m<n>-gate`, `class: review`, `killer: true`, `milestone: M<n>`, `depends_on` its subtasks plus the prior milestone gate. It is the increasing-scrutiny review (`guides/milestone-review.md`).
        - **Subtask** — one per acceptance item, `milestone: M<n>`. A subtask that checks the TRACE is **derived**: `class: executed`, `verify: coverage:<rule>` — the engine computes it live, no user stamp. The rest are **judgment**: `class: review`.
        - **Coverage rules**: `req-traced`, `req-has-test`, `req-has-design`, `adr-traced`, `designs-realized`, `tests-pass`.
        No milestone may be empty.
      Then tailor the statements to THIS idea. Add subtasks above the rigor floor. Never remove a killer gate.
   d. On the user's approval, the plan is set — its gates start **OPEN**, to be walked. **Do NOT `quack bless --all`.** Blessing at plan time marks every milestone DONE, makes `next` a no-op, and shows a falsely-green board. Executed/derived checks compute live; each **review gate is blessed one milestone at a time as you genuinely complete it**, via its handover pager (see next → ADJUDICATE).
<!-- enddesign -->

## research  (a referenced, pluggable capability)
<!-- design: method-research-ref  implements: req-pluggable-capabilities.2 :: Research (prior-art at M3, field/retro scans at start) is a REFERENCED capability, never vendored. Claude Code delegates to the built-in deep-research skill (parallel fan-out + adversarial verification); any other harness runs the SAME method inline. Do NOT copy a harness's research implementation into the repo. -->
When a step needs multi-source research — `start` (retro/triage field scans), M1 (the
state-of-the-art check of the idea), M2 (the requirement set against prior art and best
practice), or M3 (candidate prior-art) — **Claude Code** invokes the
built-in `deep-research` skill; **any other harness** runs the
same method inline: decompose into search angles → search each → fetch sources → adversarially
cross-check → synthesize with citations, using whatever web tools it has. **Never vendor** a harness's
research skill into the repo — reference it.
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

0. **Pick the version.** Default to the latest not-done version. If every version is done, start the earliest planned one. Compose its checklist as in `start`. Announce which you chose. If several versions are open and the user names one, lock onto that version. Hold it for this and the following `next` calls until told otherwise.
   - **Weak-model delegation.** A weaker model may take only a bounded substep with a named artifact and a deterministic check. Do not give it a broad grant, milestone review, iteration start, architecture decision, or evidence sufficiency judgment unless the engine has a guard that refuses the invalid state transition.
1. `quack next` — the determinizer hands you the next ready check. Its upstreams are satisfied.
2. **FILL** it. Do the work. Produce the evidence. For executed checks, make `verify` pass.
   - **Research evidence is SHOWN, never silent (owner law).** A fill that rests on research — prior art, state of the art, a field scan — puts its findings WITH SOURCE LINKS in front of the owner before any bless. Either lane satisfies: shown in chat at fill time, or carried visibly on the hand-off card (an evidence line the owner can read on the page). The evidence doc records it; one of the two lanes SHOWS it. An agent bless on an unseen research fill is the defect this law kills.
   - **Amend, then re-observe, then build.** Amending a requirement or test statement AFTER `quack observe-red` moves the hash and strands the red record. Fix the statement first, re-run `observe-red`, then build. Amending a test to behavior ALREADY built leaves no observable red: mark it `tests_red: exempt - <reason> (adr-red-unobservable)` instead - the citation is mandatory, the sweep checks it. **The trap extends past statements: TRACE WIRING moves the hash too** (a refines retarget, a verifies edge, realized design markers folding into the verified requirement). Wire the COMPLETE trace first — uc, edges, markers — and run `observe-red` LAST, immediately before the build.
   - **A ruling that changes rendered behavior owes its test sweep IN THE SAME walk.** Cached verdicts mask tests asserting the OLD behavior until the next rebuild flushes them; sweep and amend the affected tests when the behavior changes, not when the cache betrays you.
   - **Code that realizes a requirement IS its design node.** Declare it inline where the code lives, never in a `.md`:
     ```
     # design: <id>  implements: <req-id>
     # one-line description of the design (becomes the node's statement)
     <the code>
     # enddesign
     ```
     The engine scans `product/` for these markers. `quack lint` surfaces a requirement with no design. It folds the region's hash into the design. So editing the code reopens the design SUSPECT. Architectural **decisions** stay as ADRs in `spec/`. Only **realized code** gets a `design:` marker. A requirement with no realized code is an honest design-hole. Leave it.
3. **ADJUDICATE.** A gate → present the evidence. **For a killer OR milestone gate, ALWAYS run `quack progress --pager <gate>` — it renders the HAND-OFF PAGE (adr-handoff-html): one phone-friendly HTML carrying the gate's cone as color-coded prefilled rows, expandable to full detail, with the y/n bless ON the page — opens it in the browser, and prints the pointer. Never hand off a killer/milestone with a bare prose ask; the prose-plus-ASCII-card hand-off is retired.** **DECISION FORMAT (owner law): every decision on a hand-off reads in three parts. First the problem, one or two plain sentences. Then the options, lettered `A) B) C)`, one short clear line each. Then `Bless selects <letter>` — the letter only, never a field dump. Content that reaches a hand-off unformatted is REFORMATTED into this shape first: fix the node's statement and its `## Options` section, never improvise on the page.** **BOTH LANES, ALWAYS (owner law): the pager itself sends the DECISION BRIEF to the paired phone — no separate `quack ask` needed. The notification carries the brief text (BLUF, each open decision with its options, the letter a bless selects) and the y/n buttons; no page link (it would reach only the same LAN). Never phone-only, never console-only while paired. The round ends together: an answer on either lane invalidates the other, and a dead page leaves no answerable card behind.** **BLOCK-AND-CONTINUE (owner law): after presenting the hand-off, block on the round — the pager blocks itself; away from the desk, a background `quack await` — and CONTINUE the walk the moment a y lands, no re-prompt.** **`quack await` is AWAY-MODE ONLY (owner law):** run it in the background only while the user is away from the console; the moment they engage at the desk, stop any running await — the throttled drain still catches phone taps on the next command, and a lingering await also holds the binary against build swaps. The engine backstops this: an await ENDS ITSELF with a drain-mode handback when another command runs at the console (req-await-console-exit) — but do not lean on the backstop; stop it yourself. A phone tap records the bless (actor=user, channel noted) and the walk resumes without the desk; the first answer from any lane wins. When the last open killer subtask and its milestone gate are ready together, the pager comes COMBINED (adr-pager-handoff): ONE hand-off names both; a single y blesses both, recorded individually; a split answer stays possible (y the subtask, n the gate with the reopen list). Ask the user to bless. Do not bless a killer on their behalf unless they explicitly tell you to bless that specific gate — a blanket "continue" is not permission; a user "y" to the presented pager IS that explicit bless (stamp `actor=user`). An executed check passes on re-run. Then run `quack next` again.
   - **Bless preflight.** Before ANY bless, name the evidence section you wrote for that exact check, and confirm every prerequisite check is DONE, DEFERRED, or RETIRED. A grant changes only WHO may adjudicate. It never changes WHAT work must exist. If the evidence doc has no section for the check, or any prerequisite is still OPEN, SUSPECT, or RED, the only valid move is to write the evidence or walk the prerequisite. Do not bless.
   - **Bless only roots.** A PROPAGATED suspect ("own inputs unchanged - dragged by: X") clears BY ITSELF when its root re-blesses — blessing it does nothing but spend key budget. `quack triage` names the roots; bless those, let the cone clear.
   - **Tag the adjudicator honestly.** The engine stamps the actor by CHANNEL: a bless typed at an interactive console records `actor=user`; a harness-invoked/piped bless (yours) records `actor=agent` — so your plain `quack bless <id>` is already stamped agent, no env dance. When you record a bless the user explicitly delegated or answered "y" to at the pager, pass `--by user`. Never tag a user bless as agent or vice-versa — a wrong stamp falsifies the adjudication record the whole ledger's trust rests on.
   - **Stop at every milestone gate.** A milestone gate (`…-m<n>-gate`) is a hand-off to the user, not a step you walk past. Before you stop, **write the milestone's evidence doc** (below), then run the increasing-scrutiny review (`guides/milestone-review.md`) and present the hand-off page — its tasks panel IS the board view, no separate report render. **Name every OPEN question in the gate's cone at the hand-off** — an undecided `q-` node the milestone builds on is a readiness fact the owner rules on: decide it (`state: decided` + `decided_via:`), defer it explicitly, or bless past it knowingly.
   - **Write the evidence doc — the verdict referent.** For each milestone, persist the FILLed evidence and the increasing-scrutiny review into `spec/iterations/<iteration>/M<n>-<slug>.md` (plain markdown, no frontmatter — it is evidence, not a node). One `## <heading>  → <check-id>` section per subtask, capturing what satisfied it; end with the review rounds and the verdict. The report's `verdict ↗` link on every DONE check in that milestone globs `M<n>-*.md` and opens this doc — **no doc, no verdict link.** Use the canonical slugs: `M1-frame`, `M2-inputs`, `M3-candidates`, `M4-decision`, `M5-spike-findings`, `M6-build-plan`, `M7-validation`, `M8-handover`. Write/extend it as you FILL the milestone's checks, and finalize it with the verdict before you ask for the gate bless.
   - **Entering M6, plan the build FIRST.** The first M6 step is `build planned`: decompose the build into small, resumable steps and seed them as CHILDREN of a generic **build** task (`parent: <itag>-m6-build`), in dependency order, with iteration-unique ids (mint them so they never collide — see the compose step). A monolithic build is lost on interruption; small nested steps make progress durable. **Lower bound — a step must earn its checkpoint.** Split by *unit of durable progress*, not by file: a step should be worth resuming on its own AND carry a single design or verification concern (a `design:` region, one test hook, one coherent behavior). Files authored together in one sitting that share a verification are ONE step, not several. If losing a step on interruption wouldn't hurt, fold it into its neighbour. **If your plan is a nested list, mirror that hierarchy 1:1 with `parent:` at any depth** — each item's `parent` is the item it sits under; the report nests and collapses the tree accordingly. The steps nest under the build task in the report; the **verification** task rolls up the tests. Tests stay in the trace (they verify requirements) — they are never task-tree subtasks.
   - **V&V is backward-cumulative.** Verification (`coverage:tests-pass`) runs every test UP TO AND INCLUDING the check's own iteration; validation (`meets the need`) checks every need up to its iteration. The current iteration therefore always re-checks the whole past (a regression in earlier work is caught where the causing change lives), while later additions never reopen an earlier iteration's verdicts. A genuinely failing OLD test still flips its own iteration red — that signal is kept.
Repeat until `next` reports "done".

<!-- design: refine-method  implements: refine-track :: Refine is a track orthogonal to rigor. Run an expedition in a spike outside the repo. Promote the keeper backward through the owner's gate, which reopens the affected cone via suspect. Then re-walk. It is the default working mode in late phases. refine (run an expedition, promote the keeper backward) is the default in late phases. -->
## refine  (run an expedition, promote the keeper backward)  ← default in late phases
Once a build exists (post-M6) and you are NOT starting a new iteration, refine is the default working mode. Load `method/prompts/refine.md` — it carries the full method: the **expedition** invariant (unlimited epistemic reach, zero authority, findings enter the ledger only through the owner's promotion gate, interior churn never moves a hash), the spike cycle, and the open-question discipline.
<!-- enddesign -->

## bugfix  (a reported defect; no dedicated iteration)
Bugfixes ride the ACTIVE iteration (owner law) — never mint one for them.
1. REPRODUCE the report exactly, first. No fix before the failure is observed live.
   A fix with ARCHITECTURAL weight names its resolution model in ONE sentence to the
   owner before coding.
2. **Guard the CLASS, not the instance (owner law, every bugreport):** one
   executed test that covers the whole class of bug — the unit semantics AND the
   end-to-end lane the bug traveled.
3. The red ritual holds: test red → `observe-red` → fix → green. The test node verifies
   the EXISTING requirement the bug violated; a bug rarely needs a new requirement.
4. Re-verify the original repro against the fixed binary, not only the test.

## ship  (output the iteration)
`quack ship` packages `product/` into the data home (`<data-home>/out/`), with the freshly
regenerated BOOK and REPORT at the zip root; the committed `spec/book.html` refreshes in the
same move. Ship is the END of a forward iteration. **Run it immediately after the M8 gate's
bless - never wait for a separate ask (owner law).** The zip is ephemeral
output. Do not commit it.

Reaches: `defer` (push a check to a later iteration), `retire` (drop one).
