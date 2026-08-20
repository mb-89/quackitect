# Overhaul plan — 2026-08-20

Input: 12 sweep reports (11 workflow finders + 1 machines finder), 252 findings
total, plus three mechanical passes (module reachability, trace-orphan scan,
machines cross-reference). The five sharpest correctness claims were re-verified
at byte level before this plan was written.

The output is EIGHT ITERATION SEEDS sized for weaker models — every item
carries file:line, the expected change, and a named verification — plus a
DECISION LIST only the owner can rule on. Per the overhaul method: removal is
the owner's word; nothing here deletes on its own judgment.

## Honest gaps (not examined)

- The ui-render sweep (render.ts, mirror.ts, traceui.ts, tables.ts,
  trace-layout.ts, iterations-draw.ts, renderclient-live.ts, vault.ts, bases*)
  was blocked by a host safety classifier and never ran. Reference-level
  coverage came from the machines finder and the raid register only. The
  two-drawing-mechanisms debt is already parked on i13 — fold a render audit
  there.
- Flows sampled 10 of 74; use-cases 10 of 52; options judged 22 zero-reference
  of 191; ~47 of 53 rigor rows unswept for body drift.
- The raid sweep read all 216 open entries; closed/decided entries were only
  cross-tabbed.

## Corrections to earlier claims

- "16 open debts unswept since i5" was wrong on both halves: 12 of 16 debt
  entries are open, and every debt carries sweep sections through 2026-08-20.
  The real hole: 202 of 220 open entries carry no `looked:` date, and ~20 open
  issues/risks are provably already fixed.
- My orphan scan excluded spec/iterations/, so 60 of its 82 "orphaned" options
  are actually cited from iteration evidence. True zero-reference count: 22.

---

## Iteration seed 1 — the lane tells the truth about itself

Doc/behavior contradictions in served strings. Mechanical; each item is one
edit plus one test. Model: weak is fine.

1. se_amend `chain` — description (tools.ts:289) says NOT IMPLEMENTED, handler
   forwards it (tools.ts:302) and refreshChain rewrites downstream signed
   claims (sessionclaims.ts:918-963). Fix per the description's own intent:
   STRIP THE FORWARD, keep refreshChain unexported or delete it (owner reversed
   re-greying 2026-08-17). Test: amend with chain:true touches no downstream
   file.
2. se_run `timeout_ms` — declared (tools-run.ts:296), never read; SE-C-107
   defined (errors.ts:64), documented (refusals.md:238), raised nowhere.
   DECISION 9 picks implement-or-delete; default proposal: implement (killTree
   on expiry, verdict carries SE-C-107). Test either way.
3. se_run "logged IN FULL" (tools-run.ts:282, calllog.ts:3) is false past the
   30,000-char middle cut (run.ts:21,156); full text sits in .se/jobs/*.stdout
   which no verb reads. Fix: se_log_query {ref} pages the persisted job files;
   fix the capMiddle marker text (jsonio.ts:12). Test: a 40k-output run is
   fully recoverable through the lane.
4. Small served-string fixes, one commit: se-hook-stop.ts:171 "FOUR STOPS" →
   five; se-start.ts:5,270 "SEVEN STEPS" → six; place-prompt-layer.ts:18 help
   default; se-mcp.ts:426 drop SE-C-114 citation (reserved clause);
   errors.ts:99-105 comment glue; tools.ts:1-4 header rewrite;
   tools-file.ts:259 `expected` generated from KNOWN; tools-file.ts:127
   handover example swapped; tools-run.ts:341 se_test description matches the
   real split (scoped inline, battery hands off); tools-run.ts:449 "Configurable"
   comment; se_shoot (tools-run.ts:244) widget list = renderer's list;
   se_amend `all` vs se_file_patch `replace_all` — one spelling + alias.
5. Source-label sweep: 15 labels in tools-desk/file/run say "engine/tools.ts"
   (e.g. tools-desk.ts:34); 21 of 22 in sessionclaims.ts say
   "engine/session.ts" (lines listed in findings). Sweep, then ARM THE LINT: a
   Rejection's `source` names the file it is thrown from.
6. ARM: served-path lint (path-shaped tokens in tool descriptions resolve from
   the root — catches tools-desk.ts:118 "machines/lint/voice-lint.md");
   clause-has-raise-site test (catches SE-C-107-class rot).

## Iteration seed 2 — every write path is guarded

Correctness fixes with reproducible tests. Model: weak-to-mid.

1. pool.ts:122 — `/\\\\/g` matches TWO literal backslashes; a
   `spec\trace\work-token\...` path bypasses the one-door guard. Fix to /\\/g;
   test writes a backslash-spelled pool path and expects SE-C-140.
2. guardParses (SE-C-138) and guardNoSecondDoor run only on se_file_write
   (files.ts:409-421); se_file_patch (files-patch.ts:277-278) and
   se_file_replace (files.ts:600-601) bypass both — and patch is the
   RECOMMENDED edit verb. Fix: call both from writeStaged and the replace
   staging loop. Tests: patch frontmatter into broken YAML → SE-C-138; patch a
   pool file → SE-C-140.
3. tools.ts:449 argRepairs module state leaks a refused call's repair note onto
   the next successful call (decorators run only on success, mcp.ts:241-258).
   Fix: reset at guard entry. Test: repair+refuse then unrelated success
   carries no arg_repaired.
4. tools-run.ts:430 runSweep hardcodes ok:true — a red conformance sweep can
   never fail the battery. Fix: ok: r.status === 0. Test: seeded broken corpus
   turns the battery verdict red.
5. stateform.ts:448 mergeEqualities lacks the ids.has guard its sibling has
   (stateform.ts:1188) — `weighs_with: none` rides in as an equality judgment
   against a phantom node. Fix + guard test. Companion sweep: 7 scalar
   weighs_with values normalized to lists (files named in findings); ARM the
   weighs-must-be-list lint.
6. mirror.ts:744,758 — access-control-allow-origin:* on /api/levels and
   /api/cards while the justifying comment covers only /api/alive (:793-799).
   Fix: restrict to /api/alive (or serve the webview origin). Test: allowlist
   assertion with recorded reason per endpoint.

## Iteration seed 3 — green is computed once, and right

Subtle engine correctness. Model: the strongest of the weak tier; every item
has a repro recipe.

1. trace.ts:624-646 rootsAllOf — roots enter `seen` before the isRoot return
   and are never cached, so diamond refinement drops nodes (repro: A refines
   B,C; B,C refine vp declared last → C gets []). trace-layout.ts:258 then
   hides C. Fix: cache roots (or path-local seen). Test: the diamond corpus.
2. stateform.ts:1083,1061 — minted_in compared against the FULL record folder
   name while the ruling (dsp-evidence-forms.md:488) says short id; corpus
   mixes both (63 nodes short-stamped). Fix: share
   stateform-problems.ts:305 shortRecordId. Test: short stamp against long
   folder.
3. sessionclaims.ts:476 GreenPass.times keyed by bare state id across machines
   that share state names. Fix: key by `${decl.id}\0${s.id}`. Test: two sibling
   generated machines, one shared state name.
4. Route-memo invalidation moves into the Claims.stateFormSave funnel
   (missing on submitEvidence direct, flipRuling, scenarioVerdict,
   stateFormIngest, formConfirm — sites listed). Test: spy asserts each public
   write door clears the memo.
5. session.ts:2876 legal() omits join from MACHINERY while the three display
   sites include it (2286, 3644, 3965) — the packet advertises what the gate
   refuses. Fix: one machineryFor(s) helper, join included. Test: stand on a
   join, call se_file_read.
6. session.ts:1341 outcomeFor (`some fallback → failed`) vs
   sessionclaims.ts:1643 takesRepairEdge (`every`) — a shared-target hop is
   scored failed AND owes its form. Fix: one quantifier (every). Test named in
   findings.
7. sessionclaims.ts:129 + session.ts:3004 hardcode "expeditions" — a bound
   iteration's graph-is-evidence check reads a nonexistent decisions.jsonl and
   vacuously passes. Fix: boundRecordDir() derived like sessionclaims.ts:256.
   Test: bind an iteration, write an open decision op, assert formLint reports.
8. bound.ts unit mix (chars vs bytes, masked by 3.4x margin) — measure with
   Buffer.byteLength or divide the byte limit by a worst-case factor; rename to
   match. Test: multi-byte payload under the byte limit.

## Iteration seed 4 — the served word matches the machine

Guidance and machines drift. Sweep + rewrite work; the lints make it stick.
Model: weak is fine with the item list.

1. lane.md: the self-negating sentence at :41 ("a path beginning `spec/` where
   it should begin `spec/`") — ships in EVERY prompt layer; rewrite or delete
   the block. The paths block (:38) teaches the project/ prefix — depends on
   DECISION 8. Cage list (:6-14) vs the real deny list — drop or mirror. Push
   row (:33) reworded (lane always refuses; cloud pushes through host git).
2. contract.md rule 11 tail + lane.md:185: the subagent warning prepares for
   the wrong failure (subagents.md measured 2026-08-20: native tools NOT
   blocked). Replace with subagents.md's corrected instruction; fold
   subagents.md's stale opening.
3. walking.md: battery paragraph (:335) — SE-C-130/131 retired, engine picks
   scope; "There is no separate verb and none is missing" (:99) vs se_aim
   twenty lines below; "five notches" (:274) → two 0-1440 integers; wall
   example (:286) says 600, guard fires at 300.
4. refusals.md: SE-C-144 section rewritten to view-order semantics (+ the
   se_coverage thrower); SE-C-106 split or widened to its four call sites;
   "enforcement is parked" (:13) deleted — refusals.test.ts enforces it.
5. retro.md: drain-legality corrected to the two-tier rule; per-step cost
   (:306) now computable via the stamped `where`; roots.json sessions claim
   (:146) made conditional; start_iteration/needs-retro gate (:21) rewritten to
   the onboard-retro mechanism.
6. boot.md:14 dead AGENTS.md pointer — say the per-host way inline.
7. machines: idle.md:6 five-level shutdown → the two toggles; prepare_idle
   "all three"/"Three scripts" → five (and selftest.ts:3-11 comment);
   leave.md:7 pre-i34 merge semantics → ruling-stamp semantics;
   items/benchmark-run.md `folder: benchmarks` → `spec/benchmarks`;
   meth-doc-quality + meth-dependency-ship-review → NOT BUILT YET markers
   pointing at M9_90:51; voice_matrix per DECISION 2; machine.ts:5 header cut
   to the live token model; machine.ts:26 `derived` — implement the promised
   refusal or reword (sub-decision inside the seed); selftest.ts:5 battery
   figure; rigor-matrix.ts:311 "48" → "every row".
8. Guidance dedup: reading-proof rules to ONE prose home (walking.md);
   SE-C-120 chain rules to refusals.md; SE-C-140 mint rules to refusals.md —
   others keep one line + pointer.
9. ARM: cross-guidance longestSharedRun sweep (pool.ts owns the primitive);
   state-name/control-vocabulary existence lint (the dead-vocabulary class:
   shutdown levels, start_iteration, pre-i34 merge — found three times);
   vault reference-closure sweep (the machines finder's script, promoted);
   voice lint `forbidden-word` + `opener` rules in lint.ts with parameters on
   voice-lint.md, plus the served-strings sweep script (full researched design
   in the findings file, with sources).

## Iteration seed 5 — the register is read once, and closed

Raid hygiene. BLOCKED ON DECISION 1 (the close list). After the bless, purely
mechanical. Model: weak is fine.

1. Close ~20 provably fixed/superseded open entries (each with its evidence in
   the findings file): boot-grants-no-tools, write-unparseable, test-timings,
   log-query-paging, path-jail-one-target, lint-no-sweep, acting-role,
   argument-names, log-cut-response, payload-offload, bound-table-header,
   refs-written-cells, lane-not-in-git, collapse-hides-runme, owed-item-guard,
   geometry-session-state, sweeping-folders-early, node-floor, reading-credit,
   core-and-satellite (carry its two named gaps as one new entry if wanted).
2. Close as superseded: 2 i28 branch-model entries, git-fake-drifts, 4
   satellite-hinged architecture entries, 4 i1 convergence relics, 5
   record-scoped risks.
3. Merges: 6 person-check entries → raid-debt-ten-checks (DUE by its own
   sweep); 4 delta-repair entries → raid-debt-delta-default-views; 2
   surface-bound entries → the richer i16 one.
4. Kind flips (5 falsified assumptions → issue, ids keep); 3 open decisions →
   decided; 13 minted_in backfills; looked: on the two i36 debts; fix
   raid-asm-the-stop-hook frontmatter (missing source_refs key); strike the 11
   identical boilerplate sweep paragraphs (3 contradict their own entries);
   dated partial-repayment notes where named.
5. Probe refreshes: 4 i15 assumptions (BM25 shipped), 3 fired triggers
   (se_why/se_help/pool), thin-evidence trigger re-pointed at the i37
   benchmark.
6. ARM the register lints: falsified-kind flag; probed-date-vs-unprobed-text;
   minted_in required; open entry needs recent looked or survey flag; open
   decision flag; trigger-names-shipped-record flag; byte-identical sweep
   paragraph flag.

## Iteration seed 6 — the corpus resolves

Requirements + trace reference hygiene. Model: weak is fine.

1. Mechanical sweeps: 24 duplicate "## Detail" headings (11 + 13, files
   listed); duplicate source_refs/refines entries (6 files); ~46 unresolvable
   path-shaped refs (35 .se/req-mine marked "primary not reachable", 11
   engine/tests prefix fixed, worktree.ts marked dated); YAML-mangled ref in
   req-refusal-carries-remedy:19; empty weighs_against in req-desk-offers-a-tour.
2. Stale-narration bodies → past tense (4+4 files named); handover row
   (req-walk-resumes-from-repo) rewritten to the derived briefing;
   req-container-offers-its-records reconciled with the newer i34 row;
   req-autonomy-is-categorical restated without hardcoded rungs; "slider" swept
   in req-gate-needs-a-persons-verdict; the 3 admitted id misnomers renamed
   with inbound-link sweep.
3. The options-pool rename family: dsp-the-options-pool (:32-48),
   flow-standing-option, uc-see-the-whole-pool — option → work token
   (pool.ts:22,109 is the reality).
4. uc-land-work-on-trunk + sty-land-the-work: dead verbs se_git_sync/se_git_land
   rewritten to the one-tree landing; uc-answer-a-question-with-tests step 2 →
   question-only contract; uc-adjudicate-a-gate guarantee → dial-sanctioned
   hand.
5. test-spec layer: 11 dead file refs repaired; 156 path refs settled on the
   repo-root base.
6. exp-claim-verb-race + exp-watchdog dangling refs marked RETIRED (per
   DECISION 2 disposition); cand-b-the-trimmed-spread reconciled (sub-decision:
   annotate or re-mint).
7. ARM: the corpus-wide dangling-reference sweep (every reference key guard.ts
   names + probes/picks — catches el-satellite-supervisor ×10 as a class);
   verbs/paths sweep extended to spec/trace; stale-code-citation lint (symbol
   exists in named file); duplicate-heading lint; option-coverage report
   (anti-join, se_coverage shape).

## Iteration seed 7 — the suite carries its own weight

Test hygiene. Model: weak is fine.

1. helpers consolidation: gitInit (7 locals → helpers with commit option),
   refusal() (10 locals → helpers, sync+async), seededIterationSession +
   drainToFill (~12 inline copies), drift.test.ts scaffolding.
2. Boot sharing: writeguard cases 1+2 merged, refusal-only cases share one
   server; same in mcp.test.ts — ~10 boots, ~1.5 min battery wall clock.
3. fallback-outcome.test.ts:205 retargeted (frontmatter YAML read, assert NO
   guard key; rewrite the stale comment block; fix the :42 REPO_ROOT comment).
4. testlint extensions: no local redefinition of helpers residents; test-spec
   files: entries resolve; no duplicate test names across files.
5. fixtures/voice-matrix.base per DECISION 2; helpers.readDocs deleted;
   guidanceRoots/laneSources exports demoted; expr/tables duplicate test name
   resolved.

## Iteration seed 8 — one home per idea (engine structure)

The biggest seed; split into 8a (safe dedup) and 8b (the session split, riskier
— DECISION 10).

8a: qualid.ts (split/qual/bare/visitState — replaces ~15 hand-rolled splits,
gives visitState one home instead of three); served-strings module (submit
instruction ×3, dial sentence ×6); fmList one home (trace.ts's asList differs —
comma-split question settled in the seed); escapeRe one home (forms.ts's misses
`$`); tableRow for every cell split (escaped-pipe divergence); wiki-ref
extractor (refId wins); element-matrix builder ×2 → 1; NO_ARGS spread in
claimProblems; recordFile/dirtyFiles helpers; bin dedup (assertNodePin,
argValue ×13); machine.ts dead advance/tryMove deleted (+ completeState's dead
`now`); nodeField/nodeList reimplemented over noteOf (CRLF divergence);
formDone unsigned-feeder dedup; stateFormGet/Export shared prep; claimStall →
ownClaimProblems; stepBackTo/walkBackTo one method with history;
lawProvenStates/suspectStates take the shared pass; LAW_PROVEN_ROWS exported
from rigor-matrix; laneRoot collapsed; escape() drops _channel and the discarded
packet. ARM: dead-export check (knip/ts-prune in preflight, allowlist for
deliberate seams); duplicate-helper/duplicate-literal lint.

8b (separate go): session.ts → sessionroute.ts (~500 lines) + sessionpull.ts
(~750) + sessionsettings.ts (~250), sessionclaims.ts → green/diagnosis/CRUD;
facade delegates → public readonly sub-objects (~150 lines removed);
stalledClaim returns facts, pull shapes answers.

---

## The code, by the numbers

Production TypeScript: ~46,950 lines (engine 40,546 + bin 3,713 + editors
2,023 + machine compiler 674). Tests: 29,750. The owner's "fifty thousand"
memory matches the production half.

Where it goes:

- Presentation (~12,300, 26%): render, mirror, traceui, tables, trace-layout,
  iterations-draw, vault, bases, baseui, six renderclient files (2,673), the
  editors (2,023).
- The session pair + forms/walk core (~12,800, 27%): session* 7,404, stateform*
  2,195, machine+compiler 1,393, expr 654, trace 743, decisions 826...
- The lane surface (~3,500, 7%): tools*, files*.
- The rest (~18,000): git lane, discipline, toll, bound, web, produce,
  benchmark, pool, calllog, search/query, rigor-matrix, and 27 bin scripts.

Is it too much? The sweeps say the mass is NOT rot: only 5 of 117 engine
modules are unreached from any entrypoint (410 lines, all five deliberate
built-but-unwired), one dead edge-walker (~60 lines), ~150 lines of facade
ceremony, and duplication clusters worth perhaps 1,500-2,500 lines across
engine and tests. Seeds 7 + 8a cut roughly 2-3k lines total. Everything else
is load-bearing by reference closure.

So a REAL size cut is a product decision, not hygiene: the presentation half
is a quarter of the product; bases/baseui is its own subsystem; benchmarks and
producing are whole features. Naming one of those is DECISION 11 — the SORTED
verdict on the code itself is overwhelmingly KEEP.

## The decision list (owner only — nothing below happens without a word)

1. RAID CLOSE LIST: bless the ~34 closes/merges in seed 5 (evidence per entry
   in spec/overhauls/2026-08-20/findings.md). Deletion of register entries is yours.
2. REMOVE OR PARK: 8 machine-locking options (retired-whole ruling already
   stands); voice_matrix/ (build the promised reader, mark NOT BUILT YET, or
   fold into voice-lint.md); fixtures/voice-matrix.base; forms/decision-matrix
   (wire or remove); read_consume condition type (retire evaluator or add the
   honesty line); 14 zero-ref options triage (link / judge / remove piles per
   the findings).
3. WIRE OR PARK the three built-but-unwired modules: failure-shapes (natural
   home: retro/boot last-session summary), stopping-layer (boot banner),
   update.inventory (read-only verb or produce-report line). Each is
   fully built and tested; only the wiring is missing.
4. ARCHIVE SLICE for the 208 settled option/candidate/cluster nodes: kept
   readable, dropped from the live conformance sweep and the derived graph.
   Practice-backed (DO-178C scales trace by criticality; nobody keeps decided
   alternatives as live checked artifacts). Not deletion.
5. UNATTENDED WAIT DEADLINES: adopt the Step-Functions/Argo pattern — an owed
   bless or wait on an unattended run gets a duration; expiry notifies or takes
   a drawn fallback. Design decision.
6. OS-LEVEL CAGE for unattended runs: the contract itself records a measured
   silent bypass; config-level blocking cannot reach a host's native tools.
   Design decision.
7. REPAIR/OVERHAUL/REPLACE criteria into overhaul.md: the 8-criteria adaptation
   the card says is owed, each mapped from named maintenance-engineering
   sources (full text in the findings file). Adopt?
8. THE project/ PREFIX CONTRADICTION: CLAUDE.md says the root is the parent of
   the open folder; req-the-machine-state-sits-in-the-folder-that-is-open
   (must, crippling) says the open folder IS the root; the v3 restructure sides
   with the requirement. Rule which way — it misroutes every caged path until
   settled.
9. se_run timeout_ms: implement (killTree + SE-C-107) or delete arg+clause+doc.
10. SEED 8b (session split): go / park.
11. SIZE: hygiene recovers only ~2-3k of the ~47k production lines — the code
    is overwhelmingly KEEP by reference closure. A real cut means naming a
    subsystem (the 12k presentation half, bases, benchmarks, producing). Name
    one, or accept the size as the product's true weight.

## What was KEPT with sources (no action, recorded)

The prior-art sweep names four mechanisms that stand up against everything
surveyed: the recompute-from-repository position model, the graded
autonomy/bless design (every surveyed HITL mechanism is binary), the typed
refusal (RFC 9457 + remedy + repeat counter it lacks), and the reading proof
(no equivalent found; publication candidate). The toll's commit-on-served
counting, the corpus door's caching, decisions' idempotent ops, and the
ratchets' honesty (every ceiling re-counted exact) are the patterns the rest
of the engine should copy.

## The pattern-checklist run (2026-08-20, first run)

Twelve patterns asked against the engine; nine hits, seven already routed
to seeds. TWO NEW, found by no finder:

- ONE DOOR (call log): calllog.ts is the door, and three bins bypass it —
  se-hook-websearch.ts:38 hand-WRITES records, se-hook-stop.ts:84 and
  record-inspect.ts:53 hand-read, preflight.ts:198 copies the path shape.
  Also the settings store: written by se-arrive and se-start, read by
  session, no shared shape module. → seed 8a: export path + append/tail
  helpers from calllog.ts, route the bins through them; one settings-shape
  home or a recorded reason.
- ONE CACHE, ONE OWNER (house rule): 12 module-level caches; the ten
  stamp/epoch-keyed ones are healthy, the only two hand-invalidated ones
  (routeMemo, rootsAllOf's walk cache) are the two that broke. → seed 4:
  an engineering.md line — a new cache keys by a stamp of what it read;
  a hand-invalidated cache is the exception and carries its one funnel.

Clean: typed result, layer direction (no engine→bin imports). Partial:
adapter (cage inventory covers the Copilot host only — seed 1's lint).
