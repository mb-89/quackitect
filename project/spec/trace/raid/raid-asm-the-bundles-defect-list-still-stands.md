---
minted_in: i11-the-engine-fix-bundle-about-twenty-named
id: raid-asm-the-bundles-defect-list-still-stands
type: "[[raid]]"
kind: assumption
statement: The twenty defects i11 was seeded with in August still stand, after i34 rewrote the resolution seam, both containers, the claim system and the archive.
owner: the driving agent
trigger: frame-delta, where each named defect is checked against the system as i34 left it
status: open
probe: half. Ten of about twenty-four read against the system i34 left. One obsolete, one fixed, two half-fixed, six live and confirmed by walking into them. The pattern is the real result — items are partly done and the surviving half is not what the item says, and in one case the fix reintroduced the structural fault the item named. Fourteen remain.
probed: 2026-08-16
impact: the iteration builds against a list nobody re-read, and spends its pass fixing what is already fixed while missing what i34 broke.
breaks_how_badly: crippling
how_likely: plausible
source_refs:
  - i11 gate-kickoff round 0, the one item checked
  - req-mirror-stays-on-the-machine
  - "i34 retro: ten requirements deleted on a list nobody re-read, producing a day of rework"
---

## The assumption

i11 WAS SEEDED 2026-08-12 AND IS BEING WALKED ON 2026-08-16. In between, i34
deleted the resolution seam, the claim ledger, every worktree and 67 branches,
and rewrote both containers. The bundle names defects in exactly those areas.

## Probe

READ EACH OF THE TWENTY NAMED DEFECTS against the system as i34 left it, and strike any already fixed WITH its evidence rather than dropping it silently. Twenty items, each answerable by reading. frame-delta is where it happens.

## The sample already run, and what it returned

ONE ITEM OF TWENTY WAS CHECKED AT THE KICKOFF, chosen because i11 itself calls
it "worth doing first": the stale must-priority security row.

IT WAS ALREADY FIXED. req-mirror-stays-on-the-machine's Detail now opens "MET,
as of a later fix", rewritten during i8's ATAM walk — before i11 was ever
walked.

TWO HALVES SURVIVED ANYWAY, which is why the probe reads half rather than
clean. Its source_refs still cite the pre-fix `server.listen(o.port)` with no
host argument. And the STRUCTURAL fault i11 named — verification status does
not belong in a requirement body — was reintroduced by the very sentence that
recorded the fix.

SO THE HONEST READING OF ONE SAMPLE: the list is neither trustworthy nor
worthless. Items are partly done, and what remains is not what the item says.

## Why this is an assumption rather than a risk

IT IS CHEAP TO SETTLE AND NOBODY HAS SETTLED IT. Twenty items, each answerable
by reading. frame-delta is where that happens, and the rule is that a struck
item is struck WITH ITS EVIDENCE rather than silently dropped.

THE FAILURE THIS GUARDS AGAINST IS i34'S OWN. Ten requirements were deleted on
a list nobody re-read, and two of them turned out to be wrong. Repeating that
inside the bundle meant to fix rework would be the joke writing itself.
