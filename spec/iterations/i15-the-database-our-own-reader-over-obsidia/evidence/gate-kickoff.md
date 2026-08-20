---
form: gate-kickoff
amended: 2026-08-16T16:29:52.357Z by agent — ref "main" is reachable — verified 2026-08-16 via se_file_glob/se_file_read at ref:main after the operator fetched all refs; correcting the stale kill-criterion and follow-up text
bless: blessed by agent
by: agent
signed_off: 2026-08-16T16:15:51.664Z
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

- Locate the real git ref holding v1's spec/queries/ (26 .base files) and spec/decisions/adr-query-in-engine.md, then harvest them — requirements.base's filters/views/order/sort/groupBy shape, plus the other 25 files (assumptions, constraints, criteria, decisions by kind, interfaces, methods, needs, neighbours, qualities, raid, rationales, references, requirements, rules, stakeholder matrix, tensions, use cases, two V&V views).
- PRIOR ART FOUND IN THIS CHECKOUT, changing the shape of the remaining work: engine/tables.ts + bases.ts + baseui.ts + basesclient.ts already parse the Bases format, already read the whole project vault as rows (frontmatter + file.* fields), and already support filter/sort/groupBy/pivot with a pinned subset that refuses an unmatched filter shape by name. This is an HTML-widget editor for the mirror, not an MCP verb.
- Expose that reader as a read-only MCP lane verb — confirmed missing (no se_query/se_table/se_base tool exists) — with the unknown-COLUMN-field refusal the goal names (verified: the existing refusal covers an unmatched filter shape, not yet a requested-but-absent column; that gap is real build work).
- Extend the pinned subset only where a harvested v1 query needs it, test-first, reopening the decision rather than smuggling in a silent extension (v1's own discipline, ADR-cited).
- Add conformance fixtures pinning the subset against drift, alongside the existing tests/fixtures/*.base.
- Fix raid-debt-delta-default-views: $-item resolvers default to the bound record's minted_in delta; opt-in widens to the corpus; coverage laws stay corpus-wide.
- Build the BM25 retrieval sibling as its own lane verb, with its own interface entry, over the same corpus, skipping what the graph already encodes structurally.
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

pass with overrides — two named register entries stand open (raid-asm-v1-ref-for-spec-queries-is-reachable, raid-risk-i15-ships-without-a-live-prior-art-scan). Neither blocks kickoff: both are reachable from a later state's tools, not evidence against the scope proposed here. change_size: major.

## follow_up

On a passing bless, the machine below walks: locate the v1 ref and harvest the 26 .base files, extend the pinned subset test-first where needed, expose the reader as an MCP verb, fix raid-debt-delta-default-views, and build the BM25 sibling with its interface entry.

One backlog item rides along: raid-risk-i15-ships-without-a-live-prior-art-scan (resolve at the next gate where a search tool is legal). raid-asm-v1-ref-for-spec-queries-is-reachable is closed — ref "main" resolves and the harvest source is confirmed (25 .base files, not 26, plus the ADR).

note-5d892f5b1e18 stays parked for the next attended session.

## anything_else

