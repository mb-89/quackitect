---
form: scope-non-goals
by: agent
signed_off: 2026-08-17T11:37:51.157Z
authors: agent
files:
---

# Evidence form / scope-non-goals

## current_situation

The delta is framed and the size is pinned minor. Four of the six seeded findings are settled and the arrival is landed.

What remains open is not work this iteration can do. Three findings are owner rulings, one is a rename routed to i10, and one is a duplication debt this iteration created and filed.

So scope here is mostly a matter of saying what is already in, and being exact about what is deliberately not.

## scope

WHAT THIS ITERATION TAKES ON, all of it landed and tested:

- The container blind spots. shoot.ts learns the Playwright browser path and passes --no-sandbox as root, conditionally. Both halves proven on the box before the change.
- The corpus guard. preflight refuses an unterminated frontmatter block, an unparseable one, and a trace note carrying none — three cases pinned.
- The fallback loop, settled by evidence rather than patched. Two red rounds driven on the shipped matrix at every column, plus a test pinning the dead guard counter so a half-fix fails loudly.
- THE ARRIVAL, which the seed did not name and which turned out to be the largest item. One command and a SessionStart hook take a fresh clone to a live lane, including the ref repair a shallow clone needs.
- The guidance that describes all of it, with the measurements behind each claim.

## non_goals

- The full battery firing at verification. An owner ruling with two stated options; no measurement settles it.
- How verification is stopped from looping. A rule, not a bug, and the enforcement mechanism is the owner's to choose.
- The short-name rename. The seed itself calls it a sweep rather than a patch; routed to i10 by the kickoff gate, because bundling 69 minted_in fields and every folder name here would bury four landed fixes under a rename.
- Lowering the node floor to 22.18. Measured and evidenced, but lowering a declared pin is the owner's act, and cloud-runner.md forbids editing engines.node to make verify pass.
- Folding se-arrive and se-start into one module. Filed as raid-iss-two-entrypoints-place-the-cage-and-nothing-compares-them. It changes the unattended start path, which deserves its own verification rather than riding along at the end of an iteration about something else.
- The nesting.test.ts red. Root-caused to the test template carrying no @biomejs; the fix is a judgment about linking versus a 127 MB copy, and it is not i35's.
- The emergency flake. Needs a hunt, which is a run rather than a fix.

## follow_up

- Owner: the three rulings, plus the cloud default for the dial.
- i10: the short-name rename.
- A later iteration: the shared arrival module and the cage-comparison test.
- The next cloud run: measure the arrival on a genuinely fresh box, which this one can no longer do.

## anything_else

THE NON-GOALS ARE LONGER THAN THE SCOPE, and that is the honest shape of this iteration rather than a failure of it.

The seed carried ten findings from a previous run. Six of them turned out to need a decision rather than a change, or to belong somewhere else, or to be already fixed on trunk. Only four were code this iteration could write.

WHAT THAT SUGGESTS ABOUT THE SEED, and it is worth the retro's attention: a field report is a good instrument for finding what broke and a poor one for deciding who fixes it. Every item arrived phrased as work, and a third of them were rulings wearing work's clothes.
