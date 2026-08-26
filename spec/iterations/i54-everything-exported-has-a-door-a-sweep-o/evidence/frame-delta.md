---
form: frame-delta
by: agent
signed_off: 2026-08-26T11:14:22.517Z
authors: agent
files: null
---

# Evidence form / frame-delta

## current_situation

THE VISION, THE ACTUAL AND THE REGISTER ARE SIGNED. This state says what the gap is, why it is closable now, and which promise it serves.

THE FIELD HAS BEEN SCANNED. Six systems were read at their own documentation on 2026-08-26, and the comparison stands at `spec/iterations/i54-everything-exported-has-a-door-a-sweep-o/evidence/prior-art-one-door.md`.

NO PROPOSITION IS MINTED HERE. The one-door promise is a criterion under `vp-the-engine`, per the owner's ruling of 2026-08-21.

## gap_claim

THE GAP, AS A CLAIM. Every system that enforces a boundary lets somebody bypass it, and none of them makes the bypass explain itself. The record of why a codebase departed from its own design does not exist anywhere, in any of them.

### What each alternative sheds

DEPENDENCY-CRUISER SHEDS THE AUTHOR. Its baseline is generated: `depcruise-baseline src` writes every current violation to a file, and thereafter the tool lowers each one's severity to ignore. Nobody typed a line of it, so nobody can be asked about any line. Its `comment` field is documented as "not used in any rule logic", and it sits on the rule rather than on the exception.

ARCHUNIT SHEDS THE REASON ENTIRELY. Its frozen store maps a rule's English description to a UUID naming a file of violation lines. There is nowhere in that format for a person to write anything.

ESLINT SHEDS THE OBLIGATION. It has the syntax — a description after two or more dashes — and its documentation asks for one under the heading "Document the Reason". Asking is all it does. Forcing takes `@eslint-community/eslint-comments/require-description`, which is opt-in and third-party.

RUST SHEDS THE REQUIREMENT AND KEEPS THE DISPLAY. `reason = "..."` is optional on every lint attribute, and where it is given the compiler shows it in the lint message. That is more than anyone else does with a reason, and a bare `#[allow]` is still legal everywhere.

GO SHEDS THE EXCEPTION. Internal packages have no hatch at all. That is a real position and it works, at the price of the rule having to be cheap enough to obey — which is why it is a directory rename.

BAZEL SHEDS THE PER-CASE RECORD. An exception is a package name added to a list. The list is readable and reusable, and it says who is allowed rather than why.

### What we would do differently

THE REASON IS THE ENTRY, NOT METADATA ON IT. A registry line without a reason is not a line. That is the whole difference, and the scan says nobody else does it.

WE ALSO SHED THE BLANKET SWITCH. Rust has `--cap-lints allow`. Bazel has `--check_visibility=false`. dependency-cruiser has `severity: "ignore"`. The widget precedent has no equivalent, and adding one would undo everything above it.

### Where we are behind, said first

THREE OF THE SIX DO SOMETHING WE CANNOT.

- EXPIRY. Rust's `#[expect]` reports itself when the lint stops firing. ESLint reports an unused disable directive by default. Ours has nothing, and that is registered as `raid-risk-an-exemption-registry-with-no-expiry-silts-up`.
- RATCHET. ArchUnit's freeze moves a large codebase onto a rule gradually. With 79 engine modules importing `node:fs` directly, that gap is registered as `raid-risk-seventy-nine-modules-cannot-reach-a-door-in-one-step-and-nothing-ratchets`.
- GROUPING. Bazel names an exception once for many callers. A flat per-site registry repeats itself.

A COMPARATIVE CLAIM NEEDS EVIDENCE ON BOTH SIDES, and on our side the thing being compared exists once, for widgets. Everything above is a claim about a pattern proven at one capability, not about a shipped general mechanism.

## why_now

FOUR THINGS MATURED, AND THE FOURTH IS FROM THIS WEEK.

1. THE PATTERN HAS BEEN BUILT ONCE AND HELD. `deliverable/machines/widget-exemptions.md` with the SE-C-146 section of `guidance/refusals.md` gives one rule, one registry, one declared hatch with a reason per line, and two callers with no second copy. Generalising a shape that has run is a different act from inventing one.

2. AN INTERNAL SEAM HAS PROVEN ADHERABLE HERE. `paths.ts` has 20 importers. Before it, the argument that an internal door would simply be ignored had no counter-example in this codebase.

3. THE SCALE IS MEASURED FOR THE FIRST TIME. 180 files scanned, 93 reaching disk or the network directly, 398 disk sites and 52 network sites. That count did not exist before 2026-08-26, and without it the work could only be argued from a feeling.

4. THE COUNT HAS NOW BEEN JUDGED, NOT ONLY TAKEN. All 64 writes in the seven heaviest modules were read on 2026-08-26 and sorted: 42 a door would improve, 22 it would only lengthen. That is what makes this sizeable rather than open-ended.

### The thing that makes it closable rather than merely visible

THE ONE-DOOR RULE ALREADY WORKS HERE IN THE OTHER DIRECTION. The lane refuses the agent's native tools and hands it `files.ts` and `web.ts` instead, and the cage list in `.claude/settings.json` enforces it. The inward version is the same idea turned around, aimed at the engine rather than at the agent.

SO THE QUESTION IS NOT WHETHER THE SHAPE WORKS. It is which capabilities earn a door, and the falsifier pass has started answering that with numbers instead of opinion.

## value_props

- spec/trace/value-prop/vp-the-engine.md

## business_case

NO ACQUIRER EXISTS, so this is written in the maintainer's currency rather than in money.

WHAT THE EFFORT BUYS. A question that currently costs a full-codebase read — where are we departing from our own design, and why — becomes a file somebody reads in a minute.

WHAT IT COSTS, ON THE EVIDENCE RATHER THAN AN ESTIMATE. 42 of the 64 examined write sites would change. 22 would not and should not. The other 53 engine-core writes are unjudged, and that is registered as an assumption with its own probe rather than folded into a number.

THE CHEAPEST ITEM PAYS FOR ITSELF ALONE. Exporting the containment predicate from `paths.ts` and deleting its five hand-written copies settles a live disagreement between two guards on two recursive deletes. That is a small change against a crippling-graded issue, and it needs no door at all.

WHY THIS SECTION IS FILLED RATHER THAN SKIPPED. The template allows skipping it where no acquirer exists. It is filled because the honest case here is a cost comparison the iteration can be held to, and writing it down is what lets a later state say the effort overran.

## follow_up

1. THE PROBE ON THE SAMPLING ASSUMPTION COMES BEFORE THE SCOPE DECISION. `raid-asm-the-seven-heaviest-modules-speak-for-the-other-fifty-three` carries its own probe: ten of the remaining 43 engine-core files, read the same way. Setting scope from an unprobed sample is the error this iteration already caught once.

2. THE EXPIRY AND RATCHET RISKS LAND ON ONE DESIGN STATE and should be answered together. Merging the frozen set into the exemption registry answers both badly at once, and that is the specific trap named in the ratchet entry.

3. THE CONTAINMENT ISSUE NEEDS NO DESIGN DECISION AND CAN GO FIRST. Export the predicate, delete five copies.

4. THE INTERNET DOOR STILL HAS A COUNT AND NO JUDGMENT. 52 sites, none read. It must not inherit the disk verdict in either direction.

5. THE WARM MODEL IS IN THE SAME POSITION. Six private caches named, none read.

6. THE THIRD METRIC ADDED TO `vp-the-engine` IS THE ITERATION'S OPEN QUESTION, written as a target rather than a claim. Whether a door can be declared without engine code is not yet known, and the criterion says so in its own text.

## anything_else

NO VALUE PROPOSITION WAS MINTED, and the reason is a permission rule rather than a judgment. The value-prop template carries the owner's ruling of 2026-08-21: "A value proposition is added ONLY where the person asked for one, in words."

THE SAME PAGE SAYS WHERE THIS BELONGS. "A promise about how the machine itself runs is a criterion under vp-the-engine." The one-door rule is exactly that, so it was added there as a sixth consequence the drawing attaches, beside a state refusing tools, a gate refusing passage, a write refusing a break and the machine naming its driver.

THE RULING NAMES FOUR PROPOSITIONS THAT WERE MINTED AND LATER FOLDED AWAY BY HAND, and says every one of them read as obviously warranted to its author. This one read that way too. That is the whole reason the rule is a permission and not a taste.

IF THE OWNER WANTS ONE, THE SENTENCE IS READY. As an engineer, I need to know where my codebase has departed from its own design and why, without reading it. It is recommended and not minted, which is what the ruling asks for.

### One honest limit on the gap claim

THE COMPARISON IS AGAINST WHAT SIX SYSTEMS DO WITH AN EXCEPTION, and that is a narrow axis chosen because it is the half the owner cares most about. None of those systems set out to record why a design bends, so being better at it than they are is a low bar and is stated as one.

THE STRONGER TEST IS WHETHER OURS SURVIVES THEIR OWN STRENGTHS, and on three of them it does not yet. Expiry, ratchet and grouping are all listed above and all registered.
