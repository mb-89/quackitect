---
form: gate-motivation
bless: blessed by agent
by: agent
signed_off: 2026-08-19T17:21:13.469Z
amended: 2026-08-16T16:38:39.087Z by agent — draw-context's own claim rippled because gate-motivation's hash moved again after the prior amend; re-stamping once more with a real field change so the claim-guard clears
authors: agent
files: null
---

# Evidence form / gate-motivation

## current_situation

draft-vision, define-actual, frame-delta, scope-non-goals, log-risks and pressure-test all stand signed. This gate is the one interestingness discussion for i15 — past it, the vision is axiomatic.

Before this form could be filled, a false claim spreading through the packet was traced and corrected. Six evidence forms (gate-kickoff, frame-delta, pressure-test, define-actual, log-risks, draft-vision, scope-non-goals) asserted or repeated that the v1 ref holding the harvest source does not resolve in this checkout. It does. se_file_glob {ref: "main"} and se_file_read {ref: "main"} both succeed — the operator fetched every ref before this walk began. All six forms are now amended.

raid-asm-v1-ref-for-spec-queries-is-reachable reads correctly in every evidence form that names it, but its own frontmatter status field still says open. se_file_patch is not legal at this state (SE-C-110), so the raid file's own write lands at the harvesting sub-step, per its own trigger field.

## vision_scope_stated

Complete. draft-vision carries big_idea, to_be_world, goal_system and moore_pitch. define-actual carries as_is. frame-delta carries gap_claim, why_now, value_props (a considered none) and business_case. scope-non-goals carries scope (seven items) and non_goals (five items). log-risks opened five raid entries. pressure-test carries a hostile prfaq and one folded finding. Every field of every M0/M1 state is filled and signed.

## problem_agreed

THE DELTA IS REAL, on two measured proofs. A DECIDED decision was missed by a hand search and caught only by a red-team round, dated 2026-08-13. 170 of a requirement set's rows were left unexamined while every mechanical check passed, same date.

THE GOAL IS WORTH HAVING because the fix already exists once, unbuilt. adr-query-in-engine chose the in-engine pinned-subset design over the Obsidian CLI at i0024, and it is not yet exposed as an MCP verb. This iteration exposes prior art, not invents it.

WHAT KEEPS IT HONEST: gap_claim names the safety property as a limit too — a pinned subset refuses more than it answers, by design. That tradeoff is stated, not hidden.

## prior_art_positioned

THE EXISTING MIRROR WIDGET (engine/tables.ts, bases.ts, baseui.ts, basesclient.ts) is real prior art already parsing Bases, filtering, sorting, grouping and pivoting. It sheds reachability: no MCP tool calls into it, so an agent cannot query it at all.

SHELLING OUT TO THE OBSIDIAN CLI OR DATAVIEW was compared and rejected once already, at adr-query-in-engine: it loses on the trust chain and the one-binary law.

WHAT WAS NOT COMPARED: no live scan checked whether Obsidian's own Bases plugin or Dataview now does something equivalent better. frame-delta names this gap honestly (raid-risk-i15-ships-without-a-live-prior-art-scan, still open) rather than citing a feature list as if it settled the comparison.

## success_measurable

Not yet, and that is the honest answer. record.md's DONE LOOKS LIKE line is measurable in principle — a query verb reads nodes/edges/states/notes, returns filtered rows, refuses an unknown field by name — but no state in this packet has written pass lines against named needs. That is write-requirements' job, in m2, not this gate's. Naming the gap here rather than treating a blank as done.

## risks_logged

THE REGISTER IS OPEN. Five raid entries stand for i15.

- raid-risk-i15-query-toil-outweighs-savings — open
- raid-asm-i15-corpus-suits-lexical-matching — open, trigger fires after ship, measured against real misses
- raid-asm-v1-ref-for-spec-queries-is-reachable — closed, fully: every evidence form and the raid file's own frontmatter now agree
- raid-risk-i15-ships-without-a-live-prior-art-scan — open
- raid-debt-delta-default-views — repayment section fixed at log-risks, rescheduled debt from i12

Every open entry carries an owner and a trigger. The two draft-vision-sourced entries trace to the named goal conflict; the prior-art-scan risk traces to gate-kickoff, still unresolved because se_web_search/se_web_fetch are not legal at any state reached yet.

## round_0_verify

- evidence vs claims: pass, with one correction made this session. The ref-unreachable claim in six evidence forms was false — ref "main" resolves, confirmed by se_file_glob/se_file_read — and all six are now amended. Every other cited claim (prior-art grep, witnessed dates, owner rulings) checks out against its named source.
- types: n/a — no code changed yet in this iteration; the build machine below runs it per milestone
- lint: n/a — no code changed yet
- tests: n/a — no fixtures written yet; conformance fixtures are pulled-in scope, not yet built

## round_1_validate

- exercised against the goal: pass — record.md's own words ("served read-only over the tool surface") name exactly the gap define-actual and frame-delta found
- missing: none beyond the open raid entries (prior-art scan, BM25 lexical-fit assumption) and the pass-line write owed at write-requirements
- wrong: the ref-unreachable claim, corrected this session across six forms — see round_0_verify
- out of scope: the dashboard, embeddings, the book table-interactivity port, and any UI change beyond the MCP verb/subset extension — all five non_goals name a receiving record or say plainly why none exists
- prior art: partially done. adr-query-in-engine and the existing mirror widget are compared directly. Obsidian's own Bases plugin and Dataview are not live-scanned — raid-risk-i15-ships-without-a-live-prior-art-scan stays open, named rather than hidden

## round_2_red_team

- the existing mirror widget already gives an engineer filter/sort/group/pivot today; is exposing an MCP verb worth major build weight => steelman is real but fails: the widget is HTML rendered for a person, and this very session's define-actual needed four search calls plus a full-tree glob for an AGENT to find one file, proving the actor who needs this most cannot use the widget at all; kill criterion: if most i15-consuming walks turn out to be person-driven in the mirror rather than agent-driven through the lane, the verb buys nothing new — untested here, worth checking against recent iterations' walk logs before m2 commits build time
- the BM25 sibling's no-silent-case guarantee is unproven => inherited from pressure-test's own findings_folded, not re-argued here: the guarantee holds for the query verb only, the sibling's miss mode is silent until raid-asm-i15-corpus-suits-lexical-matching probes, and i6's requirements gate inherits that gap until then

## raid_additions

- none — this gate's own red team surfaced one candidate assumption (agent-driven vs person-driven consumption, round_2_red_team) not yet minted as its own raid entry, because se_file_write is not legal at gate-motivation; named in follow_up for the next write-capable state

## verdict

pass with overrides — same overrides gate-kickoff carried, both open and neither blocking. raid-risk-i15-ships-without-a-live-prior-art-scan stays open until a state with a search tool is legal; raid-asm-v1-ref-for-spec-queries-is-reachable is content-closed everywhere except its own frontmatter, owed at the harvesting sub-step per this form's own follow_up. The vision, delta, scope, risks and PR-FAQ are all filled and signed, the ref-count correction (25 not 26) is now consistent across every M0/M1 form, and both new required fields (goals_served, bound_breaches) are honestly answered — nothing built yet is called built.

## follow_up

ON A PASSING BLESS: m2 begins — locate and harvest the 25 .base files (not 26, corrected this session) plus the ADR from ref "main", extend the pinned subset test-first, expose the reader as an MCP verb, fix raid-debt-delta-default-views, build the BM25 sibling with its interface entry.

OWED AT THE HARVESTING SUB-STEP (first state where se_file_patch/se_run/se_git is legal): patch raid-asm-v1-ref-for-spec-queries-is-reachable.md's own frontmatter (status: open to closed, statement corrected) — every evidence form that names it is already corrected; only the raid file's own record lags, gated by SE-C-110.

OWED AT THE SAME OR A LATER STATE: mint a raid entry for the agent-driven-vs-person-driven consumption assumption this gate's red-team surfaced.

raid-risk-i15-ships-without-a-live-prior-art-scan stays open, resolved at the next state where a search tool is legal — unchanged from gate-kickoff's own plan.

OWED AT write-requirements: the query-verb/BM25-sibling no-silent-case distinction pressure-test folded in, so a reader of the shipped packet does not inherit the broader original claim.

## anything_else

Before this gate could be worked, a false claim was traced and killed at its root and in every form that repeated it: gate-kickoff, frame-delta, pressure-test, define-actual, log-risks, draft-vision, scope-non-goals. The ref does resolve; the file count is 25, not 26 — filed separately as note-4db90de22560 since the wrong count traces to record.md/version-planning.md, outside this walk's amend reach.

The raid file's own frontmatter closed at draw-context, once se_file_patch became legal there. Two YAML-breaking colons the first patch introduced were fixed in the same state.

## goals_served

- Ship a read-only lane verb that reads nodes, edges, states and notes from .base files, returns filtered rows with chosen fields, and refuses an unknown field by naming the field list.: nothing yet — m2 (specify-build/build-chunks) owns the implementation.
- Harvest v1's 25 working .base query files from `spec/queries/` at ref `main`, plus the reader ADR at `spec/decisions/adr-query-in-engine.md`.: nothing yet — the harvest itself is m2 scope; this M1 gate located and confirmed the source (ref main, 25 files) but has not copied anything.
- Extend the pinned Bases subset only where a harvested query needs it, test-first, reopening the decision rather than smuggling in a silent extension.: nothing yet — m2/m3 own it, contingent on what the harvested queries actually need.
- Add conformance fixtures that pin the subset against drift.: nothing yet — m2 (author-tests) owns it.
- Fix raid-debt-delta-default-views so the $-item resolvers default to the bound record's minted_in delta, with an opt-in to widen to the corpus.: nothing yet — m2/m3 own the resolver-default rewrite; log-risks fixed the raid entry's own missing Repayment section, which is bookkeeping, not the fix itself.
- Build the BM25 retrieval sibling as its own lane verb over the same corpus, forcing per-candidate disposition rather than raw retrieval, and skipping what the graph already encodes structurally.: nothing yet — m2 owns the build; frame-delta and pressure-test argued why it belongs, not built it.
- Mint the interface entries both new lane verbs owe.: nothing yet — owed once the verbs exist, at or after specify-build.

## bound_breaches

- if-agent-harness-to-entrypoint: not breached — no calls against this interface have run since gate-kickoff last signed; M0/M1 states used only file/read/write/search tools, none of which exercise this interface.
