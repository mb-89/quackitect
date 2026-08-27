---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: req-a-state-mints-its-work-tokens-on-entry
type: "[[requirement]]"
statement: "When the walk enters a state, the system shall derive the work that state owes from the reading it demands, from the marked steps of its method, and from the evidence it must produce."
kind: functional
verify_method: test
breaks_if_removed: "A state's work tokens go back to being authored by hand in two places that nothing reconciles, which is the gap that let an overhaul agent skip its own steps."
breaks_how_badly: crippling
refines:
  - uc-work-a-states-work-tokens-to-completion
source_refs:
  - raid-risk-a-state-must-mint-its-own-tokens-and-that-machinery-is-undesigned
  - "uc-work-a-states-work-tokens-to-completion steps 1 to 4"
  - "kickoff goals: reading requirements become incoming tokens; a method's steps become outgoing tokens"
priority: must
weighs_with:
  - none
weighs_against:
  - none
---

## Detail

THREE SOURCES, AND EACH HAS ITS OWN RULE.

| source | rule |
| --- | --- |
| the reading the state demands | one piece of work per document still unproven; proven documents produce nothing |
| the marked steps of the state's method | one piece of work per marked step, carrying that step's guidance |
| the evidence the state must produce | one piece of work per field |

SCOPE ARRIVING FROM ELSEWHERE IS MOVED, NEVER MINTED. Work a person placed
on this state was already an item, and minting a second one would split it in
two.

## Behaviour

The entry rule is a lifecycle and the first line is the one that pays.

    (nothing)     -> open:     the walk enters the state and the source demands it
    (nothing)     -> absent:   the reading is already proven, so nothing is minted
    open          -> open:     the walk enters again and the item is matched, not remade
    open          -> terminal: a hand settles it
    open          -> moved:    a hand or a person places it elsewhere

WHAT THE MODEL SHOWS THAT THE STATEMENT CANNOT is the second entry. Minting
sits on the hot path of every entry into every state, so re-entry is the
ordinary case rather than the exception, and nothing above creates a
duplicate.
