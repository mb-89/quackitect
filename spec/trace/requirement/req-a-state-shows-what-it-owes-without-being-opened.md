---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: req-a-state-shows-what-it-owes-without-being-opened
type: "[[requirement]]"
statement: "The system shall show on every state how much that state must still take in and how much it must still produce, without that state being opened."
kind: functional
verify_method: demonstration
breaks_if_removed: "What is outstanding stays spread across three stores with no surface holding them together, which is the reason the owner gave first for wanting this round."
breaks_how_badly: corrosive
refines:
  - uc-read-what-the-system-owes-and-what-it-is-doing
source_refs:
  - "kickoff goal: every position shows a count per slot, and clicking one opens the token editor"
  - "uc-read-what-the-system-owes-and-what-it-is-doing steps 2 to 7 and extensions 2a, 4a and 7a"
priority: must
weighs_with:
  - none
weighs_against:
  - none
---

## Detail

FOUR RULES GOVERN WHAT THE SURFACE SHOWS.

| case | what is shown |
| --- | --- |
| a count of zero | nothing, so a state with a bare top row is finished |
| a machine holding other machines | its own count beside the sum of everything beneath it |
| work belonging to no state | its own group beside the machine, hidden when it is empty |
| work that has finished | filtered out of what is owed, askable for as its own group |

READING A COUNT COSTS NOTHING. A person reads any one state's counts without
opening it, and opens a group only to see the pieces themselves.

THE COUNT IS AN INDICATION AND NOT A SIZE. It tracks how finely a method
card's author cut their headings, so it must not be used to compare two
records or to set a budget.
