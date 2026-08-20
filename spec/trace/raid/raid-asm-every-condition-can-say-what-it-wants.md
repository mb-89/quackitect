---
minted_in: i3
id: raid-asm-every-condition-can-say-what-it-wants
type: "[[raid]]"
kind: assumption
statement: Every condition that can hold a state grey can state what it wants in words, so a verb asking why can name it rather than reporting that something unnamed blocks.
owner: the driving agent
trigger: the grey-state verb is designed, or a condition type is added
status: open
impact: The verb answers "blocked, reason unavailable" for some states. That is the shell-probe cluster it replaced, wearing a verb's clothes, and it would be worse than the probes because it looks authoritative.
breaks_how_badly: crippling
how_likely: plausible
probe: partially probed, holds so far. Five condition types stand under machines/conditions and every one carries a note saying what it wants. The weight-against-dial case answers itself, since the engine holds both numbers. The COMPUTED pile is not counted, and that half decides the verb's contract.
probed: 2026-08-13
source_refs:
  - req-one-verb-says-why-a-state-is-grey
  - "the contract's condition rule: every entry/exit key is a condition type, and its note says what it wants"
---

## What is being relied on

The verb's whole value is naming the conditions in the way, each with what it
wants. A condition it cannot describe makes the answer useless for that state.

The contract says each condition type has a note saying what it wants. That
covers the TYPE.

What is not established is that a condition's note, written for a type, says
something useful about THIS state's particular blockage at runtime.

## The three shapes, and only one is safe

- A TYPED condition with a note. Its note answers, and this is the common
  case.
- A WEIGHT above the dial. The engine already holds both numbers and can say
  both, so this answers itself.
- ANYTHING COMPUTED. A guard expressed as code rather than as a declared type
  has no note to read, and there is no general way to make code explain
  itself.

The third shape is the assumption. Nobody has counted how many of the engine's
grey states come from it.

## Probe

Enumerate every path by which a state can be withheld, and for each one ask
whether a sentence naming its want can be produced.

Count them into three piles: typed with a note, weight against the dial, and
computed with nothing to read.

If the third pile is empty, the assumption holds and the verb is safe to build
as specified.

If it is not empty, the verb's contract needs one honest branch: name what it
can, and say plainly that a computed guard is in the way rather than
pretending completeness.

## Why the honest branch matters more than the count

A verb that silently omits a blocker teaches the reader to trust an
incomplete answer. That is worse than the shell probes, which at least
announced their own crudeness.
