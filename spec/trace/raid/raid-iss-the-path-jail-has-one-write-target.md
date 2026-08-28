---
minted_in: i16-the-vehicle-overlay-a-vehicle-vendors-th
id: raid-iss-the-path-jail-has-one-write-target
type: "[[raid]]"
kind: issue
statement: The lane refuses every write outside the project root, and the one mechanism for reaching another tree is read-only by design, so nothing can drive a product that is not its own.
owner: the owner
trigger: already true - it blocks uc-drive-a-foreign-product's step 5 today
status: open
breaks_how_badly: crippling
how_likely: expected
impact: The second of the two capabilities the owner asked for cannot be built without changing the one mechanism that makes the first one safe. Every write the system makes on a driven product's behalf lands outside its own root, and the resolver refuses exactly that.
source_refs:
  - req-where-each-artifact-lands-when-driving
  - uc-drive-a-foreign-product
  - fn-run-a-governed-walk.resolve-a-path
  - deliverable/engine/paths.ts lines 1-12
place: i30-reverse-engineering-point-the-system-at-
---

## What the code says, read this session

`deliverable/engine/paths.ts` opens with the rule in its own words.

- "The path jail. Every lane path is root-relative; anything resolving outside
  the project root is refused. The jail is checked at the resolver - no tool
  implements its own path handling."
- And on the one way out: declared roots stand in `.se/roots.json`, are
  addressed as `@name/rest`, and are "READ surfaces, never write targets,
  machine-local on purpose".

## Why this is an issue rather than an assumption

IT HAS ALREADY HAPPENED, in the sense that matters: the constraint is in the
code today and it blocks a step this iteration signed. An assumption is
something not yet established. This is established, and it says no.

RECORDING IT AS AN ASSUMPTION WOULD HIDE THAT IT ALREADY BITES, which the
method card names as a specific error made on 2026-08-07 with the reload's tool
list.

## The good half, which is larger than the bad half

THE ISOLATION RULE IS ALREADY MOSTLY ENFORCED, and by exactly this mechanism.
`req-nothing-a-copy-does-reaches-its-source` demands that every write resolve
inside a tree the system was pointed at. The jail already refuses everything
outside one root, at ONE resolver, with no tool implementing its own path
handling.

SO THE HARDEST-GRADED ROW IN THE REGISTER IS CLOSE TO MET before any design
starts, and the reason it is met is a decision somebody made for a different
purpose.

AND THE READ-ONLY RULE ON DECLARED ROOTS IS THE SAME INSTINCT, written down for
the same reason: a reachable folder that could be written to is a path out.

## What the design has to answer

NOT "how do we get out of the jail". The jail is the thing that makes a copy
safe to hand somebody, and any candidate that weakens it fails
`req-nothing-a-copy-does-reaches-its-source`, which is graded fatal.

THE QUESTION IS HOW A SECOND TREE BECOMES A LEGAL TARGET WITHOUT MAKING EVERY
TREE ONE. Two shapes are already visible and M4 will find more.

- The driven tree becomes a second ROOT of the same kind - named, declared,
  logged - with write permitted only to it.
- Or the system RUNS FROM the driven tree, with the method resolved from
  elsewhere, so the jail's single root is the driven product and the copy's
  own tree is the read surface.

THE SECOND INVERTS THE PROBLEM RATHER THAN WIDENING IT, and it is the shape
v1's line hints at: a vehicle's method extensions merge over the vendored layer
"for itself and for every stub it drives".

## RULED 2026-08-18 BY THE OWNER: the second shape is not enough on its own

THE OWNER'S POSITION, on being shown that this constraint had excluded an
option before scoring: driving a foreign project means the foreign project is
outside our own tree, so writing outside it is unavoidable, and the rule has to
change or a declared channel has to carry the write.

### Why inverting alone fails, which is the part that needed proving

THREE THINGS ARE WRITTEN OR READ WHILE DRIVING and they belong to two trees.
`req-where-each-artifact-lands-when-driving` says which.

- THE WORK goes to the driven tree.
- THE METHOD is READ from the system's own tree, which declared roots already
  serve.
- THE MACHINERY NOTE, when the system notices a fault in ITSELF while driving
  somebody else's product, goes to the SYSTEM's tree, and the walk continues.

SHAPE TWO HANDLES THE FIRST TWO AND BREAKS THE THIRD. Point the single root at
the driven tree and every work artifact lands correctly. The machinery note is
then outside the root and refused.

AND DEFERRING THAT NOTE FAILS BOTH WAYS. Queue it in the driven tree and the
system's business is now in somebody else's repository, which the requirement
names as the whole failure. Queue it in memory and it dies with the session,
because a walk on a foreign product need never return home.

SO TWO WRITE TARGETS ARE REQUIRED AT ONCE. That is what the third facet says,
and that facet exists to make the sixth goal checkable.

### The law is DIRECTION, and one target was never the law

[[raid-dec-an-import-is-read-only-and-a-vendored-copy-is-yours]] states it in
one line: "The rule names the DIRECTION OF WRITES rather than any mechanism."
Nothing a copy does may reach its SOURCE.

ONE WRITE TARGET IS AN IMPLEMENTATION OF THAT LAW AND IT IS TOO STRICT. It
forbids writing to the source, correctly. It also forbids writing to a driven
tree, which is not the source, which the system exists to write to, and which
no safety argument covers.

BOTH HALVES STAY TRUE UNDER THE CORRECTION, which is why this is a resolution
rather than a weakening. The source stays unreachable. The driven tree becomes
reachable because it was never the thing being protected.

### The mechanism is already on the chart

[[opt-the-bound-travels-with-the-act]] carries it: "An ordinary call during a
walk is bounded by the tree being walked", and "Producing a driven project is
bounded by the tree being produced."

THE BOUND IS PER ACT RATHER THAN PER SESSION, which is what makes two targets
safe. Each act names one tree, each bound is checkable at the same single
resolver, and no act can name the source.

### What this unblocks, and it is the reason the ruling matters

[[opt-a-pointer-outside-both-trees]] WAS EXCLUDED ON THIS CONSTRAINT AND ON
NOTHING ELSE. Its own node says so: the product "forbids the write outright".

THAT IS v1's MECHANISM. v1 keeps the pointer in a per-workspace data home
outside both trees, and `product/engine-go/i18_red3.go` at ref main is a
passing end-to-end test of the chain it belongs to.

SO THE OPTION SPACE WAS BUILT AROUND OUR OWN PROVEN ANSWER, on a constraint
that turns out to be an over-strict implementation rather than the law. The
option is back in play at record-adrs.

## The shape, sharpened by reading v1 on 2026-08-18

THE JAIL IS A LANE-ARGUMENT GUARD, NOT AN ENGINE-WIDE INVARIANT, and that was
not understood when this entry was written. `resolveInRoot` and `resolveForRead`
appear 44 times across 11 files. A bare `join(root, ...)` appears 116 times
across 49 files in the same engine. `bin/se-mcp.ts` appends to the engine log
with a bare join, and the session directory helper is a bare join used 56
times.

SO THE ENGINE ALREADY WRITES OUTSIDE THE RESOLVER BY DESIGN. What the jail
actually constrains is paths an AGENT names through a lane verb, which is the
thing that needed constraining and is not the same as one write target.

### The real blocker is a missing root, not a forbidden write

v1 SPLITS THE ENGINE ROOT FROM THE WORKSPACE ROOT. v3 derives everything from
one: conditions, catalogues and the battery all build method paths as
`join(root, "deliverable", "machines", ...)`.

POINT THE ROOT AT A FOREIGN TREE TODAY AND THE JAIL IS PERFECTLY HAPPY. Every
write lands inside the named tree. What breaks is that the tree has no method
folder, so the machine cannot compile.

### The smallest change, and it adds no write surface

A READ-ONLY METHOD ROOT BESIDE THE PROJECT ROOT. `paths.ts` already classifies
every path and already knows which prefixes and files are method; the
classifier exists and only the resolution is missing. Give the method root its
own containment and make it read-only, so there are TWO JAILS rather than a
hole in one.

AND THE POINTER GOES INSIDE THE DRIVEN TREE, under `.se/`, which the classifier
already treats as session material. v1 put it in a machine-local data home and
that is v1's worst part: six hex characters of a hash over the absolute path,
lost on a move, absent after a clone, and on a moved vehicle it resolves to a
layer-less path, gets skipped, and lets a machine-global pointer answer
instead. A wrong answer rather than an absent one.

SO FACETS 1 AND 2 NEED NO SECOND WRITE TARGET AT ALL. Work resolves inside the
one project root, which is the driven tree. Method resolves read-only from
elsewhere. `req-nothing-a-copy-does-reaches-its-source` is untouched.

THIS IS THE INVERSION THIS ENTRY ALREADY NAMED as its second shape, and reading
v1 is what showed it is the cheaper one.

### What still needs the second write target

FACET 3 AND NOTHING ELSE. A note about the system's OWN machinery, written
while the walk is in somebody else's tree, still has to land in ours. One root
cannot do it, and deferring it either publishes our business in their
repository or loses it with the session.

SO THE RULING STANDS AND ITS SCOPE SHRINKS. One case rather than three, and it
is the case with the least code behind it today.

## Where it goes

THE RULING IS RECORDED HERE AND THE CODE IS M6's. The jail is checked at one
resolver in `deliverable/engine/paths.ts`, which is where a second
containment lands. This state does not build it.

AND IT STAYS OPEN UNTIL THAT CODE EXISTS. A ruling is not a mechanism, and the
isolation guarantee is graded fatal, so the check that a declared write target
can never be the source is owed with the change rather than after it.

## Re-measured 2026-08-18 at evaluate-architecture

THIS NODE'S FIGURE IS STALE AND SO IS THE OTHER ONE. This entry records 44
resolver calls against 116 bare joins across 49 files.
[[raid-risk-a-write-lands-in-the-wrong-tree-silently]] records 40 against 88.
Neither node says what pattern produced its number or which folders it covered,
so the two cannot be reconciled by reading them.

A FRESH COUNT WAS RUN RATHER THAN A THIRD FIGURE GUESSED. Scope
`deliverable/engine`, whole tree including `bin/`.

- Resolver call sites: 31 hits for `\b(resolveInRoot|resolveForRead|resolveDeclaredRoot)\(`
  across 10 files. Three of those are the definitions in `engine/paths.ts`, so
  28 are calls.
- Bare joins: 277 hits for `(^|[^\w.])join\(` across 69 files. The pattern
  excludes `path.join(` and array `.join(` deliberately, so these are the
  imported `join` from `node:path` used directly.

THE RATIO IS ROUGHLY ONE TO TEN. The most optimistic figure standing in the
register was one to two.

WHAT THIS DOES NOT CLAIM. That the surface grew from 116 to 277. The earlier
counts' patterns are not recorded, so the numbers are not comparable and no
trend can be read from them. What is comparable is the direction: bare joins
outnumber resolver calls by an order of magnitude, on any of the three counts.

WHY IT MATTERS HERE. Two FATAL quality scenarios were ruled `at risk` at
evaluate-architecture on exactly this surface —
[[req-a-wrong-act-never-passes-silently]] and [[req-trees-never-mix]]. A verdict
resting on a number that has two recorded values is weak evidence, which is why
the count was run instead of cited.
