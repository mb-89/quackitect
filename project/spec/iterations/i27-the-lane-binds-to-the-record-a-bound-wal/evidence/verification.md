---
form: verification
amended: "2026-08-14T18:21:50.469Z by agent — nine claims were owed on the fresh-eyes rule; four are inspections or analysis a careful reader performs, and doing them found a real defect"
by: agent
signed_off: 2026-08-14T18:06:53.500Z
authors: agent
files:
---

# Evidence form / verification

## current_situation

The build closed with thirteen signed chunks, and the mechanical half of verification is done.

THE BATTERY IS GREEN: 1271 of 1271, preflight green, lint clean. Job `test-mst98hdl-12`.

The checklist below is the other half, and it is where this verification is honest rather than complete.

## claims

- [owed] tsp-autonomy-tiers — raid-iss-the-autonomy-number-still-rides-every-answer
- [owed] tsp-bound-surface — raid-debt-human-observed-demonstrations
- [x] tsp-derivation-analysis
- [owed] tsp-desk-and-gates — raid-debt-human-observed-demonstrations
- [owed] tsp-first-run — raid-issue-package-live-check-owed
- [owed] tsp-panel-walkthrough — raid-debt-human-observed-demonstrations
- [x] tsp-prose-inspection
- [x] tsp-read-back-inspection
- [x] tsp-record-inspection
- [owed] tsp-tour-run — raid-debt-human-observed-demonstrations

## follow_up

FIX-FINDINGS HAS THREE THINGS TO WEIGH, and none of them is a broken build.

- `raid-iss-the-autonomy-number-still-rides-every-answer` is a live red against a standing spec. Either the number leaves the answer or the criterion is rewritten, and the second is the owner's call rather than the verifier's.
- `raid-iss-whole-product-claims-reverified-by-every-record` is why six of these boxes are owed. It is a process defect, not a product one.
- The 18 off-scale grades on trunk stand corrected on this branch and stale on trunk. Levelling moves them, and levelling needs the git adapter that `satellite-process` built but nothing yet calls.

After that, `gate-implementation`, which is the owner's to bless rather than mine.

## anything_else

FOUR OBSERVED, SIX OWED. The first version of this form owed nine of ten, and that was wrong.

WHY IT WAS WRONG. I leaned on the fresh-eyes rule — the builder must not verify their own build — and used it to mark claims owed. But four of these specs' own methods are INSPECTION and ANALYSIS. Those are things a careful reader performs with the artifacts in front of them. Fresh eyes improves them; its absence does not make them impossible. I turned a quality concern into an impossibility.

DOING THEM FOUND A REAL DEFECT, which is the argument against having owed them.

`tsp-prose-inspection` item three: stored records carry every acting party as a role, zero usernames or hostnames. A search of `project/spec/**/*.md` for account names found ONE: `exp-one-seam.md` line 52 carried the machine's own account name inside a path, in a committed trace node. It violates `req-roles-never-usernames` and the standing rule that no personal data goes in anything stored. Rewritten to say what the probe showed without the path. The other hits were the product's own port number.

WHAT EACH CHECKED BOX RESTS ON.

`tsp-read-back-inspection` — read `tests/resolution.test.ts`. `writeThenReadBack` resolves through the seam, writes, then reads from the store the ANSWER named rather than the path it wrote. Every assertion is on the read-back content or the store's identity. None is on a write's return value.

`tsp-prose-inspection` — eight items. Item 3 measured by search, and the one violation fixed. Item 8 observed directly: the desk's greeting this session listed the tour first among its offers. Items 1 and 2 read: the entry document defines `the pull` at first use rather than leaving it bare. Items 4 to 7 judged over this record's own answers, research and notes rather than swept across the whole corpus — that limit is real and it is `raid-iss-whole-product-claims-reverified-by-every-record`.

`tsp-record-inspection` — twelve items. Two are now mechanically guaranteed rather than inspected: a test run cannot be recorded without its question, because SE-C-136 refuses a scoped run that carries none; and a trace node's upward links are checked both ways by the trace sweep, which caught a truncated use-case id in this very record. The provenance items were read on this record's own evidence, where every choice carries its losers and its reasoning.

`tsp-derivation-analysis` — the model asks two things. View derivation: every served view names the files it derives from, and the design trace signed at `trace-design` IS that enumeration, spec by spec, with the dead-code sweep passing both ways. Capability coverage: idle's live offer was read from `se_survey` this session, and each door resolves to a state whose evidence forms trace to requirements. No view holds truth outside a file, and no door is untraced.

WHAT IS STILL OWED, AND WHY IT REALLY IS.

Five of the six need something this session does not have. `tsp-bound-surface` wants a person opening a link. `tsp-panel-walkthrough` and the highlight stop of `tsp-tour-run` want the editor panel, and contract rule 10 says the screen is not looked at unasked. `tsp-first-run` wants a fresh machine. `tsp-desk-and-gates` wants a gate shown whole on a surface.

The sixth, `tsp-autonomy-tiers`, is owed because it is RED rather than unobservable, and the fix has now started: the autonomy number no longer rides the agent's packet. It stays owed because the requirement says no numeric value survives on ANY surface, and the panel and the weighing machinery still carry one. That half is i14's stated goal.
