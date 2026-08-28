---
form: spawn-for-implementation
judgment: passed at 2026-08-26T14:46:26.098Z with deliverable/engine/bin/hands-spawned.ts@8be27987d4e0
by: agent
signed_off: 2026-08-26T14:46:14.564Z
authors: agent
files: null
---

# Evidence form / spawn-for-implementation

## current_situation

The prototype gate is blessed and the build begins. The design is settled enough to write code against, and four things are owed to it before anything ships.

THIS SESSION IS THE ARGUMENT FOR SPAWNING A SEPARATE HAND. Three cold reviews ran today and each found what a self-review had missed. The architecture gate failed twice before it passed. The prototype gate failed once. Eleven of the twelve faults were mine, and five of them were false claims about measurements I had taken myself.

THE HAND THAT WROTE THE EVIDENCE COULD NOT SEE THE EVIDENCE. That is not a lapse to try harder against; it is the reason the roster exists.

WHAT THE BUILD INHERITS. A compiler rule that reads a mark rather than inferring from shape. Two surfaces that must share one webview while looking like two editors. A marking pass over 137 cards, ordered last. And a mint whose cost cannot be measured until it exists.

## hands

- [x] a walker for the build, separate from the hand that verifies it — today's own record is the argument, and the state's motivation says it plainly
- [ ] no second builder — the build is one coherent change to the compiler and one surface, and splitting it would buy parallelism at the cost of two hands disagreeing about the same seam

## follow_up

The build owns four things and the order matters.

FIRST THE COMPILER READS A MARK. Any line that opens a part — a heading at any level, or a top-level list item — carrying the reserved tag is a piece of work. An unmarked card mints nothing and says so, which is the safe direction.

THEN A FEW CARDS PROVE THE FORMAT. Pick the two that disagree: a card whose steps are headings, and the retro whose steps are a numbered list. The format holds on both or it does not, and finding out costs two cards rather than 137.

THEN THE TWO SURFACES SHARE ONE WEBVIEW, looking like two editors. Independent viewports: zooming the machine leaves the work list untouched. The drag between them is then the ordinary one that already works in basesclient.ts.

LAST THE BULK PASS marks the rest of the cards, once the format has been proven on the awkward cases.

TWO MEASUREMENTS ARE OWED DURING THE BUILD RATHER THAN BEFORE IT. The whole cost of a mint, once minting exists — its own probe is one hop timed twice, with and without. And the write half of that mint, since only the derivation was ever timed.

## anything_else

