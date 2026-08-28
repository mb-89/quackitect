---
form: fix-delta-default-resolvers
by: agent
signed_off: 2026-08-19T19:41:02.501Z
authors: agent
files: null
---

# Evidence form / fix-delta-default-resolvers

## current_situation

conformance-fixtures just signed, having found and fixed the same underlying pattern this chunk targets (promotionItems's broken owner check) as a side effect of proving the new file.inFolder/file.hasTag subset extensions. The $-item resolver default fix itself -- the whole point of this chunk -- landed alongside it, test-first, and is already proven green.

## built

Rewrote the $-item resolvers in engine/stateform.ts to default to the bound record's own minted_in delta, with an explicit `:all` suffix as the opt-in that widens back to the whole corpus. boundOwner(evidenceDir) derives the record id from the evidence folder path (spec/iterations/<id>/evidence -> <id>); scopedToOwner(nodes, owner, all, mintedInOf) is the shared filter. Eight source names are fixed: $experiments, $requirements, $test-specs, $design-specs, $value-props (via typedItems, which reads TraceNode's new minted_in field, added to engine/trace.ts's loadTrace output), $claim-specs, $must-stories, and $promotions. $promotions had its own pre-existing owner check (basename(traceRoot)), which turned out to never actually match under the current one-tree-one-path ADR (traceRoot resolves to the project root, whose basename is never an iteration id) -- fixed to use the same evidenceDir-derived owner as everything else. Seven pool/comparison-machine sources ($functions, $clusters, $flows, $options, $candidates, $criterion_pool, $compounding_suspects, $assumptions) are deliberately left corpus-wide: they model something that spans records (an architecture, a candidate pool), and scoping them needs a design pass this chunk did not do -- documented with rationale in raid-debt-delta-default-views.md's new Repayment-landed section, which also records that status stays open since the debt's own closure bar names 'every' resolver. Proven test-first: node-scoping.test.ts's new 'the delta-default view' describe block fixtures two records' worth of requirement nodes and a bound evidence folder, exactly the debt's own closure bar ("a reference table in a fresh record showing only that record's own nodes until the opt-in is set") -- three cases: bare source shows only the bound record's own node, `:all` shows both, and with nothing bound the legacy corpus-wide behaviour is untouched. Fixing this also required updating promotions-stay-home.test.ts's white-box source check, which pinned the literal (broken) basename(traceRoot) text; it now checks for the corrected `=== owner` comparison instead, with the history explained inline. Whole battery: 1492/1492 green.

## follow_up

raid-debt-delta-default-views stays open: seven pool/comparison-machine sources are deliberately still corpus-wide, with rationale recorded in the raid entry's own new Repayment section. mint-interface-entries and a re-walk of trace-design/verification/gate-implementation remain for this iteration.

## anything_else

