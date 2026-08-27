---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: req-work-says-when-a-hand-is-on-it
type: "[[requirement]]"
statement: "When a hand starts on a piece of work, the system shall record on that work that the hand is on it, before the hand acts, and shall keep that record until the work settles or moves elsewhere."
kind: functional
verify_method: test
breaks_if_removed: "Nothing distinguishes an work token nobody has touched from one a hand is working, so the narration machinery is removed and the account it produced is replaced by silence."
breaks_how_badly: crippling
refines:
  - uc-work-a-states-work-tokens-to-completion
  - uc-read-what-the-system-owes-and-what-it-is-doing
source_refs:
  - "record.md lines 82 to 86: a token has an in-work state, and before the agent does anything with a token it says it is working on that token. THAT IS THE CHECKLIST."
  - "scope-non-goals: the status a token can have is open, in work, or one of several terminal kinds"
  - req-the-progress-account-is-derived-from-the-work-itself
priority: must
weighs_with:
  - none
weighs_against:
  - none
---

## Detail

THIS IS WHAT REPLACES NARRATION, and it is why the removal is safe. The
account of what a hand is doing is derived from the work rather than typed
beside it, and the in-work mark is the thing that makes the derivation
possible.

FIVE REFUSAL CLAUSES GO WITH THE MACHINERY it replaces: the narration toll, a
malformed update, an unknown node, a done over open children, and the stall
guard.

SAYING IT COMES FIRST. The mark goes on before the hand acts, not after, or
the account reports work as beginning at the moment it ended.

WHAT THE MARK IS NOT. It is not a lock and nobody holds an work token. A
second hand meeting work already in progress reads that fact; nothing here
says it is refused.

## Behaviour

The lifecycle gains the transition its first draft omitted.

    (nothing)  -> open:     the position mints it, or a person places it
    open       -> in work:  a hand says it is starting
    in work    -> terminal: the hand settles it, any of the terminal ways
    in work    -> open:     the hand raises the difficulty and leaves it
    open       -> moved:    it is placed elsewhere
    in work    -> moved:    it is placed elsewhere mid-work

WHAT THE MODEL SHOWS THAT THE STATEMENT CANNOT is the pair of exits from in
work. A hand that stops without settling has to leave the work findable, and
both routes back out are drawn rather than assumed.

WHAT IT DOES NOT SETTLE, and the register carries it: whether the in-work
fact survives a restart for work outside a record.
