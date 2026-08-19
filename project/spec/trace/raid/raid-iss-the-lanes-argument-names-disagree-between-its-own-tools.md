---
minted_in: i5-engine-hygiene-one-version-source-every-
id: raid-iss-the-lanes-argument-names-disagree-between-its-own-tools
type: "[[raid]]"
kind: issue
statement: "Tools in one lane take different names for the same thing, so a caller who has just used one guesses wrong on the next and is refused."
owner: the maintainer
trigger: any new lane verb, and any agent's first hour
status: open
impact: "Twenty-one refusals in one session — sixteen per cent of every refusal in the window — were an argument named right for a neighbouring tool. Each costs a round trip that produces nothing, and none of them is a mistake about intent."
breaks_how_badly: crippling
how_likely: expected
source_refs:
  - i5-engine-hygiene-one-version-source-every-
weighs_with: none
weighs_against: none
---
## What was observed

MEASURED OVER THIS SESSION'S 1150 CALLS. SE-C-101 unknown argument fired 13
times and SE-C-046 missing argument 8 times, against 129 refusals in the window.

THE PAIRS THAT COLLIDE:

- `se_file_search` REQUIRES `intent`. `se_file_read` REFUSES it.
- `se_log_query` takes `filter: {since}`. Passing `since` at the top level
  is refused.
- `se_aim` takes `to`. `goal` is refused, and `goal` is the word the
  walk itself uses.
- `se_file_list` takes `path`. `dir` is refused.
- `se_file_patch` takes `ops` with `old_string` and `new_string`.
  `old` and `new` are refused, one round trip each.
- `se_file_write` requires `base_hash`, and `null` is what creates a file.
  Omitting it is refused; guessing an empty string is refused differently.

## Why it is an issue and not a nuisance

THE REFUSALS ARE ALREADY GOOD. Every one carries the accepted list and an
executable remedy, and every one was recovered in a single turn.

THAT IS THE POINT. The machinery is doing everything right and the cost is
still paid, because the cost is in the vocabulary rather than in the handling.
An agent cannot learn its way out of it either — the correct guess for one tool
is the wrong guess for its neighbour.

## What repair consists of

- One argument vocabulary across the lane, with the refusal list generated from
  it rather than written per tool.
- Where two tools genuinely need different things, accept the sibling's name as
  an alias rather than refusing it.
- The measurement to re-take afterwards is this one: SE-C-101 and SE-C-046 as a
  share of all refusals in a window.
