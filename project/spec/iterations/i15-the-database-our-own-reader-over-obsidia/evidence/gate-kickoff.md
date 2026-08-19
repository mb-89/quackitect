---
form: gate-kickoff
bless: blessed by agent
by: agent
signed_off: 2026-08-19T16:57:48.684Z
amended: 2026-08-16T16:29:52.357Z by agent — ref "main" is reachable — verified 2026-08-16 via se_file_glob/se_file_read at ref:main after the operator fetched all refs; correcting the stale kill-criterion and follow-up text
authors: agent
files: null
---

# Evidence form / gate-kickoff

## current_situation

The walk stands at iterations/i15/gate-kickoff (M0), just after onboard-retro signed.

Goal, vision and the two riders (BM25 sibling, the rescheduled delta-default debt) are read from record.md and version-planning.md §i15.

A working-tree scan found substantial prior art: engine/tables.ts, bases.ts, baseui.ts and basesclient.ts already implement most of the described reader as a mirror HTML widget. No MCP-callable query verb exists yet.

Two RAID entries were minted this walk: raid-asm-v1-ref-for-spec-queries-is-reachable and raid-risk-i15-ships-without-a-live-prior-art-scan.

## retro_drained

- notes inbox: empty at survey time, nothing pending
- note-5d892f5b1e18: drained backlog, ready when an attended session opens
- onboard-retro: signed 2026-08-16 by agent

## goal

The database: our own reader over Obsidian Bases compatible files, extending the format where we need to, harvesting the 26 working query files v1 already wrote (record.md).

DONE LOOKS LIKE, verbatim from record.md: a query verb reads nodes, edges, states and notes from .base files, returns filtered rows with chosen fields, and refuses an unknown field by naming the field list. Obsidian can still open the files it understands.

THE RULING: compatibility is one-way. Our reader understands everything; Obsidian understands the part it knows. We may extend the format.

A RETRIEVAL SIBLING RIDES ALONG (owner ruling 2026-08-13): BM25 over the same corpus, proposing candidate nodes a change may couple to that no edge records — forced disposition of each candidate, not speed. Deterministic, ~150 lines, zero dependencies, embeddings deferred and only added after BM25's misses are measured.

A RESCHEDULED DEBT RIDES ALONG TOO (raid-debt-delta-default-views, swept into i15 at i12's 2026-08-15 retro): the $-item resolvers must default to the bound record's own delta, with an explicit opt-in to widen to the whole corpus; the coverage laws stay corpus-wide.

## pulled_in

- Harvest v1's Bases queries and its reader ADR. VERIFIED 2026-08-19 at ref `main`, correcting the count the vision carried: `spec/queries/` holds 25 `.base` files, not 26. A SECOND COPY of 23 sits at `product/quackitect/method/templates/documents/spec/queries/` — the template set, which is a different shelf and not the harvest target. The reader ADR is `spec/decisions/adr-query-in-engine.md`, present at that ref. Harvest `requirements.base` first for its filters/views/order/sort/groupBy shape, then the other 24 (assumptions, constraints, criteria, decisions by kind, fundamentals, ifus, interfaces, methods, needs, neighbours, qualities, raid, rationales, references, rules, stakeholder matrix, tensions, use cases, force rationales, two V&V views).
- PRIOR ART FOUND IN THIS CHECKOUT, changing the shape of the remaining work: engine/tables.ts, bases.ts, baseui.ts and basesclient.ts already parse the Bases format, already read the whole project vault as rows (frontmatter plus file.* fields), and already support filter, sort, groupBy and pivot with a pinned subset that refuses an unmatched filter shape by name. This is an HTML-widget editor for the mirror, not a lane verb. VERIFIED 2026-08-19: all four files exist.
- Expose that reader as a read-only lane verb. VERIFIED 2026-08-19 against the registered tool list: the 36 verbs carry se_web_search, se_log_query and se_file_search, and nothing that reads a .base file. So the verb is genuinely missing.
- The unknown-COLUMN-field refusal the goal names is real build work. The existing refusal covers an unmatched filter shape, never a requested-but-absent column.
- Extend the pinned subset only where a harvested v1 query needs it, test-first, reopening the decision rather than smuggling in a silent extension. That is v1's own discipline, recorded in the ADR.
- Add conformance fixtures pinning the subset against drift, alongside the existing tests/fixtures/*.base.
- Fix raid-debt-delta-default-views: the $-item resolvers default to the bound record's minted_in delta, an opt-in widens to the corpus, and the coverage laws stay corpus-wide.
- Build the BM25 retrieval sibling as its own lane verb, over the same corpus, skipping what the graph already encodes structurally.
- Mint the interface entries both new lane verbs owe.

## left_out

- The dashboard / live view over the query layer — record.md itself scopes this to "the owner's UI sitting, not this iteration."
- Embeddings for the retrieval sibling — explicitly deferred until BM25 ships and its misses are measured.
- Porting v1's book table-interactivity script — named in record.md only as context for why the query layer matters beyond queries; it belongs to i20 (emit.book), not here.
- Any UI change to the existing mirror bases widget (tables.ts/bases.ts/baseui.ts) beyond what the MCP verb and the subset extension require — it already works and is out of this goal's DONE LOOKS LIKE.

## change_size

major — two new lane verbs (the query verb, the BM25 sibling) each owing an interface entry, plus a corpus-wide resolver-default change (the rescheduled debt). Substantial prior art narrows the build, but does not shrink the surface being changed. The bless is the owner's column choice, not this proposal's final word; if the MCP-verb gap turns out to be a thin wrapper with no subset extension needed, the next gate can re-size down.

## round_0_verify

- evidence vs claims: pass — the prior-art claim is grep-verified (tables.ts/bases.ts/baseui.ts/basesclient.ts, no se_query/se_table/se_base tool), the debt-reschedule claim is sourced to raid-debt-delta-default-views.md, and the ref-unreachable claim is sourced to four refused se_file_glob/se_file_read calls (SE-C-102)
- types: n/a at kickoff — no code changed yet; the machine below runs it per milestone
- lint: n/a at kickoff — no code changed yet
- tests: n/a at kickoff — conformance fixtures are pulled-in scope, not yet written

## round_1_validate

- exercised against the goal: pass — the goal's own words ("served read-only over the tool surface") name exactly the gap the working-tree scan found
- missing: none beyond what is already filed as the two raid entries
- wrong: nothing in the goal contradicts what already exists in the repo
- out of scope: the dashboard and embeddings, both correctly excluded per record.md's own words
- prior art: not scanned — se_web_search/se_web_fetch are not legal in gate-kickoff, and native WebSearch was tried twice and declined at this session's permission layer; filed as raid-risk-i15-ships-without-a-live-prior-art-scan

## round_2_red_team

- the reader already exists, so is i15 just paperwork over shipped code => no: no MCP verb exists (verified by search), the debt fix and BM25 sibling are unbuilt, and the 26 v1 files are unharvested; kill criterion: a one-line MCP wrapper needing no subset extension makes this patch-sized, re-open the size then
- the v1 ref could not be located, so is the harvest even reachable => RESOLVED 2026-08-16: ref "main" holds spec/queries/ (25 .base files, not 26) and adr-query-in-engine.md, confirmed by se_file_glob/se_file_read at ref:main once the operator fetched every ref. The block was this state's tool list, never the repository; kill criterion did not fire.
- does the corpus-wide debt fix belong in i15 or is it scope creep => no, it is an explicit owner-swept rescheduling into i15 by name because the resolvers it needs are what i15 builds (raid-debt-delta-default-views.md, swept 2026-08-15)
- major is a big commitment sight-unseen, could this be minor given so much prior art => proposed major because two lane verbs are minted and the debt fix has corpus-wide blast radius; the owner's bless decides, not this proposal

## raid_additions

- raid-asm-v1-ref-for-spec-queries-is-reachable
- raid-risk-i15-ships-without-a-live-prior-art-scan

## verdict

pass with overrides — change_size: major. Reviewed the standing evidence: prior art (tables.ts/bases.ts/baseui.ts/basesclient.ts) is real and grep-verified, no lane verb reads a .base file today, the 25-file count at ref main is verified and the earlier 26 error is corrected throughout the form. Blessing major: two new lane verbs plus a corpus-wide resolver-default change justify full rigor even though prior art narrows the build.

## follow_up

On a passing bless, the machine below walks: harvest the 25 .base files and the reader ADR at ref `main`, extend the pinned subset test-first where needed, expose the reader as a lane verb, fix raid-debt-delta-default-views, and build the BM25 sibling with its interface entry.

One backlog item rides along: raid-risk-i15-ships-without-a-live-prior-art-scan, to be resolved at the next gate where a search tool is legal.

raid-asm-v1-ref-for-spec-queries-is-reachable is closed. Ref `main` resolves and the harvest source is confirmed: 25 `.base` files under `spec/queries/`, plus the ADR.

note-5d892f5b1e18 stays parked for the next attended session.

## anything_else

## goals

- Ship a read-only lane verb that reads nodes, edges, states and notes from .base files, returns filtered rows with chosen fields, and refuses an unknown field by naming the field list.
- Harvest v1's 25 working .base query files from `spec/queries/` at ref `main`, plus the reader ADR at `spec/decisions/adr-query-in-engine.md`.
- Extend the pinned Bases subset only where a harvested query needs it, test-first, reopening the decision rather than smuggling in a silent extension.
- Add conformance fixtures that pin the subset against drift.
- Fix raid-debt-delta-default-views so the $-item resolvers default to the bound record's minted_in delta, with an opt-in to widen to the corpus.
- Build the BM25 retrieval sibling as its own lane verb over the same corpus, forcing per-candidate disposition rather than raw retrieval, and skipping what the graph already encodes structurally.
- Mint the interface entries both new lane verbs owe.

## bound_breaches

- if-agent-harness-to-entrypoint: not breached — no calls against this interface have run since this gate last signed; kickoff has not exercised any modelled interface yet.
