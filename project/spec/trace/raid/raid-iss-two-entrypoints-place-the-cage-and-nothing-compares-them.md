---
minted_in: i35-the-cloud-run-s-findings-land-the-fix-fi
id: raid-iss-two-entrypoints-place-the-cage-and-nothing-compares-them
type: "[[raid]]"
kind: issue
statement: se-start.ts and se-arrive.ts each place project/.mcp.json and project/.claude/settings.json from the same templates, and nothing checks that the two agree.
owner: the owner
trigger: already live — both entrypoints ship
status: open
impact: "A drift between the two places an agent in a cage that is not the cage anybody reviewed. Because the failure is a MISSING deny rather than a broken one, it produces no error: the agent simply has tools it should not have, and every call it makes looks legal."
breaks_how_badly: crippling
how_likely: expected
probe: OPEN, and named by the iteration that created the second entrypoint. The duplication is four functions — refs, runtime, install, cage. The fix is one shared module plus a test asserting both entrypoints place byte-identical files from the same templates. i35 filed it rather than fixing it, because folding se-start into a shared module is a change to the unattended path that deserves its own verification.
probed: 2026-08-17
source_refs:
  - i35-the-cloud-run-s-findings-land-the-fix-fi
weighs_with: none
weighs_against: none
---

## The shape of it

THE CAGE IS THE ONE THING NEITHER ENTRYPOINT MAY GET WRONG. It is an
explicit deny list by owner ruling: a tool added in future is NOT blocked
automatically. So the cage is only ever as good as the file that gets
placed, and now two programs place it.

WHY IT IS SILENT. A cage that denies too much fails loudly — the agent hits
a refusal and says so. A cage that denies too little fails silently: the
agent simply holds a native tool, uses it, and nothing anywhere calls that
wrong. The bad direction is the quiet one.

## Repayment

Fold refs, runtime, install and cage into one module both entrypoints call,
then add the test that says they place the same bytes. Until that lands,
any edit to `project/deliverable/cage/` has to be made twice and checked by
hand.
