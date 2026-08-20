---
form: gate-inputs
bless: blessed by agent
by: agent
signed_off: 2026-08-16T16:52:49.725Z
authors: agent
files: null
---

# Evidence form / gate-inputs

## current_situation

write-stories and generalize-use-cases both stand signed. Three new stories carry the two roles map-stakeholders named — the agent and the engineer — through concrete passes over the query verb and the BM25 sibling, and three new use cases generalize them with full bidirectional coverage across the standing 31-story, 38-use-case set. This gate judges the user picture before any system-level writing starts.

## picture_judged

PASS. Four resident roles stand, re-checked at map-stakeholders rather than re-derived: the agent, which stops missing decisions and unexamined rows a hand search would have caught; the engineer, who stops carrying a search that was never systematic; the vehicle owner, served passively through the same lane capability; the newcomer, correctly neutral. The acquirer stays struck, unchanged from i27's own finding. Every value prop's audience resolves to stk-engineer-driving-agents, and the agent is named as the role most directly served.

draw-context's excluded_use list is current. Five lines, each still holding: no dashboard, no embeddings until BM25 ships and its misses are measured, no book-script port (that is i20's), no UI change beyond the new verb and subset extension, and read-only reaffirmed as what keeps the vault the single source of truth.

Three new stories carry the two roles map-stakeholders named as owed: sty-answer-what-does-this-touch and sty-dispose-a-candidate-coupling for the agent, sty-trust-a-repeatable-answer for the engineer. Each is an ordered pass, not a capability statement — checked against meth-story-slideshow's own test (any two sentences could swap = not a story) and none fails it.

## unspecified_capability

Scoped to the change, per this gate's own guidance. Two new lane verbs are proposed this iteration: the query verb and the BM25 sibling. Both have use-case coverage minted this state: uc-query-the-corpus-by-structure (query verb, agent actor) and uc-dispose-of-a-candidate-coupling (BM25 sibling, agent actor); uc-get-a-trustworthy-answer covers the same query verb from the engineer's side.

Walked the remaining five scope-non-goals items by hand for a missed capability. Harvesting the .base files, extending the pinned subset, adding conformance fixtures, and minting the interface entries are build and spec-bookkeeping steps, not actor-facing goals — Cockburn's own test (verb plus object, from the actor's side) does not apply to them, so none is owed a use case.

raid-debt-delta-default-views (the $-item resolver default change) is the one item worth naming explicitly, because it does touch user-visible behavior. Read uc-view-notes-as-a-table and uc-shape-the-view directly: both already describe a reference view listing a kind's rows, sorted/grouped/filtered, written to the view's own file. The debt narrows what that existing view SHOWS by default (the bound record's own delta, opt-in widens to the corpus) — it changes an existing capability's default, not a new actor-facing goal, so it is covered by the use cases already standing rather than needing its own.

No use case was found refining nothing, and no story was found un-generalized — both already computed green by generalize-use-cases' own covers: story check. Nothing unspecified.

## passes_concrete

PASS. All three stories name real things rather than describing the mechanism in the abstract, per meth-story-slideshow's own test.

sty-answer-what-does-this-touch names the fields a query would ask for (id, statement, decided_in), the node kind (decision), and the measured scale it replaces (four search calls across roughly 300 files, cited from this iteration's own draft-vision).

sty-trust-a-repeatable-answer names the same node kind and topic-filter pattern, and its result slide states the checkable property directly: the same query, run again by anyone, returns the same rows.

sty-dispose-a-candidate-coupling names the actual mechanism it forces (every candidate disposed, real or not) and ties its problem slide to gate-kickoff's own witnessed language about the BM25 sibling.

None narrates the pinned subset or the ranking math, per map-stakeholders' own instruction that the mechanism stays architecture's question. Concrete enough to script at M6 once the verbs exist.

## round_0_verify

- evidence vs claims: pass — write-stories' stories field and generalize-use-cases' use_cases field both resolved and signed; every cited id in this form's own text (roles, value props, prior stories) checks out against its named source
- types: n/a — no code changed yet in this iteration
- lint: n/a — no code changed yet
- tests: n/a — no fixtures written yet; conformance fixtures are pulled-in scope, not yet built

## round_1_validate

- exercised against the goal: pass — the two roles map-stakeholders named (agent, engineer) both got a concrete pass, and both facets frame-delta and draft-vision named (vp-the-ledger, vp-rigor-without-toil) are refined by at least one story
- missing: none found beyond the raid entries already open
- wrong: none found in this pass
- out of scope: unchanged from scope-non-goals, still correctly excluded
- prior art: NOT SCANNED at the user-picture level (does Obsidian's own Bases view already give an engineer the same click-to-rationale pass). Native WebSearch was tried again at this gate and was declined at the permission layer, the same outcome gate-kickoff hit. raid-risk-i15-ships-without-a-live-prior-art-scan stays open and unchanged; no comparison is invented in its place.

## round_2_red_team

- sty-trust-a-repeatable-answer looks close to the resident sty-answer-why-a-year-later (same actor, same value prop, both about answering "why") — is it a second pass or the same one narrated twice? => distinct: the resident story walks the existing trace-graph click UI, already built; the new story walks the query verb this iteration adds and stakes a specific new property, repeatability by anyone re-running the query, that the click UI does not claim. Kept as written.
- is the engineer's own use case (uc-get-a-trustworthy-answer) really a second actor, or is the agent still the one doing everything and the engineer just watching? => real: the trigger is the engineer's own question, and step 5's guarantee (anyone can re-run the query) is a property the engineer, not the agent, needs to trust it. Kill criterion: if no engineer ever independently re-runs a query the agent already ran, the repeatability property buys nothing beyond what showing the query text already gave — untested here, worth checking once the verb ships and is used a few times.

## raid_additions

- project/spec/trace/raid/raid-risk-i15-ships-without-a-live-prior-art-scan.md

## verdict

pass with overrides — the user picture is sound: four roles re-checked, an excluded-use list still current, three new stories generalized into three new use cases with full bidirectional coverage across the standing 31-story, 38-use-case set. One item stays open, not blocking: raid-risk-i15-ships-without-a-live-prior-art-scan, because no search tool is permitted in this session, same as at gate-kickoff and gate-motivation. change_size stays major, unchanged from gate-kickoff.

## follow_up

On a passing bless: write-requirements is next, in m3. It should derive from uc-query-the-corpus-by-structure's extensions (the unknown-field refusal, the empty-result case), uc-get-a-trustworthy-answer's repeatable-query guarantee, and uc-dispose-of-a-candidate-coupling's forced-disposition step.

raid-risk-i15-ships-without-a-live-prior-art-scan stays open, resolved at the next state where a search tool is actually permitted — unchanged from gate-kickoff's and gate-motivation's own plan.

## anything_else

