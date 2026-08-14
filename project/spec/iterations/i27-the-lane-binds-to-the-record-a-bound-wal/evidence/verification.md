---
form: verification
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
- [owed] tsp-derivation-analysis — raid-iss-whole-product-claims-reverified-by-every-record
- [owed] tsp-desk-and-gates — raid-debt-human-observed-demonstrations
- [owed] tsp-first-run — raid-issue-package-live-check-owed
- [owed] tsp-panel-walkthrough — raid-debt-human-observed-demonstrations
- [owed] tsp-prose-inspection — raid-iss-whole-product-claims-reverified-by-every-record
- [x] tsp-read-back-inspection
- [owed] tsp-record-inspection — raid-iss-whole-product-claims-reverified-by-every-record
- [owed] tsp-tour-run — raid-debt-human-observed-demonstrations

## follow_up

FIX-FINDINGS HAS THREE THINGS TO WEIGH, and none of them is a broken build.

- `raid-iss-the-autonomy-number-still-rides-every-answer` is a live red against a standing spec. Either the number leaves the answer or the criterion is rewritten, and the second is the owner's call rather than the verifier's.
- `raid-iss-whole-product-claims-reverified-by-every-record` is why six of these boxes are owed. It is a process defect, not a product one.
- The 18 off-scale grades on trunk stand corrected on this branch and stale on trunk. Levelling moves them, and levelling needs the git adapter that `satellite-process` built but nothing yet calls.

After that, `gate-implementation`, which is the owner's to bless rather than mine.

## anything_else

THE ONE BOX I CHECKED, and how.

`tsp-read-back-inspection` is this record's own spec: every resolution test proves its landing by reading back from the store the caller NAMED, and none asserts on the write's own return value.

I read `tests/resolution.test.ts`. `writeThenReadBack` resolves through the seam, writes to the absolute path it answered, then reads from the store that answer named rather than from the path it wrote. Every assertion is on the read-back content and on the store's identity. None is on a write's return.

THE VERIFIER WAS THE BUILDER, WHICH THE DISCIPLINE FORBIDS, and I am saying so rather than implying otherwise.

`meth-verification-discipline` says an agent verifying SPAWNS A TESTER SUBAGENT with fresh context. That is not achievable here. `note-eccbfe7cd689` records the attempt: thirty-four agents ran, and every verifier was refused before reading a line, because a read-only subagent cannot pay the narration toll.

So fresh eyes is unavailable in this harness, for a KNOWN and RECORDED reason rather than because nobody tried. I checked one box on a mechanical inspection of file contents, where builder-blindness bites least. Everything needing judgment or a person is owed.

WHY I DID NOT TICK THE OTHER NINE. A claim is an observation. Ticking a demonstration nobody watched is fabrication, and it is undetectable afterwards because a ticked box looks identical whoever ticked it.

WHY NINE OWED IS ITSELF A FINDING. An owed list that long stops being a debt and becomes the normal case, which is what the new register entry says. I am not offering it as a satisfactory outcome.
