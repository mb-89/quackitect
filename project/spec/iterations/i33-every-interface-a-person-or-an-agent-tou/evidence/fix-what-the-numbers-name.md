---
form: fix-what-the-numbers-name
by: agent
signed_off: 2026-08-17T14:08:14.501Z
authors: agent
files:
---

# Evidence form / fix-what-the-numbers-name

## current_situation

The instrument now names an order, so this chunk follows it rather than fixing what was most recently annoying.

WHAT IT NAMES TODAY, over 2026-08-17, at the one-second line: 181 breaches. mirror_slow 82, se_pull 63, se_test_verdict 20, se_aim 6, mirror_profile 4, se_run 2, se_file_search 2, se_git 1, se_seed_iteration 1.

AT FIVE SECONDS AND ABOVE: 38, of which se_test_verdict is 20. Those twenty are HONEST rather than breaches — if-test-runner-to-toolchain declares a bound that is deliberately not one second, and the battery is a minute by design. Excluding them the order is mirror_slow 9, se_aim 5, se_pull 3, se_file_search 1.

## built

TWO FIXES LANDED AGAINST THE TOP OF THAT ORDER, and both are shape rather than speed.

ONE — THE DUPLICATE GREEN PASS IN THE RENDER. blessedGates recomputed recordPaint although render.ts had computed it one line above, so every draw walked the whole corpus twice. It now takes the caller's set. That is the mirror_slow path directly.

TWO — THE SIGNATURE READ. The ripple's time half needed every claim's signature, and fetching it in a second pass over the same files put recordDone at 1117 ms over 200 nodes against a 1000 ms budget. It now comes out of the read standingClaims already does. THIS ITERATION'S OWN ONE-SECOND RULE CAUGHT THIS ITERATION'S OWN CHANGE, and the fix was this iteration's own new requirement.

WHAT I FOUND AND DID NOT FIX, because fixing it would break what it protects. A sweep recomputes the route after EVERY hop, so se_aim over a long route pays the green walk once per hop. That is not waste: it is the detour that stops a moved ground being followed off a cliff, and its own comment says so. A cache across hops would be wrong the moment a hop signs something.

SO THE LEVER IS THE COST OF ONE RECOMPUTE, not the number of them, and both fixes above are exactly that.

VERIFIED: 1399 tests, 0 failures, sweep green over 1219 nodes.

## follow_up

WHAT THIS CHUNK CANNOT REACH, and why it is the next iteration's rather than a gap here.

THE INSTRUMENT NAMES A TOOL, NOT A CROSSING. se_pull and mirror_slow are lane verbs; twelve of the thirteen modelled boundaries have no calls attributed to them at all. Until a logged call says which crossing it made, fixing per boundary is impossible and a silent zero on twelve of them would read as a clean bill.

ATTRIBUTING A CALL TO ITS CROSSING is the work that widens this from one boundary to thirteen. It is named in breachItems' own comment and in tsp-a-breached-bound-reaches-a-reviewer, so the next reader meets it where the limit lives rather than in a report.

AND EVERY GATE IN THIS ITERATION NOW OWES bound_breaches, because adding a required round greys every signed gate. That is the ripple working on my own change, and they are re-earned rather than waved through.

## anything_else

