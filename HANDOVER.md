---
kind: [[handover]]
status: held
urgency: now
---

# Where it stands

Both verbs stand on the command line, and `./RUNME.sh check` passes at 697
tests with the rules green. The code lands at `c5b653dd`, and this handover
and the status ride on top of it.

| the piece | where it lives | stands |
|---|---|---|
| `voice measure <folder>` | `src/scripts/voice.js`, `lib/voice.js` | yes |
| `voice measure --transcripts <f>` | the same pair | yes |
| `voice refused [days]` | the same pair | yes |
| both verbs in the help | `src/scripts/cli.js` | yes |

The split follows the brief. `lib/voice.js` holds every function taking rows
and answering rows, and `test/level0/verbs.test.js` drives it over fixtures.
`src/scripts/voice.js` reaches the disk, the clock and the process, and
`test/level0/voiceverb.test.js` drives it over the fakes.

# What waits

| the piece | where | why it waits |
|---|---|---|
| a phrase on a refusal row | `hooks/level0.js` | the doors log the rule and drop the match |
| the second branch | `work/the-schema-projects-vale` | it now declares `depends_on` on this one |

A refusal row carries `rule`, `tool` and `file`, and no phrase. The Vale
finding carries its match as `said`, so one more field on four log rows
lights up the phrase column. This branch changes no door, so that waits.

# The numbers

| what | words | findings | a thousand words |
|---|---|---|---|
| `spec` | 45327 | 0 | 0.0 |
| the whole tree | 49795 | 0 | 0.0 |
| the answers of this session | 1486 | 9 | 6.1 |

The tree scores zero, which the green lint says too. So the delta the next
branch reports comes off a clean floor. The answers score 6.1, and the gate
puts one answer of mine at 8.4 the same day.

# What surprises me

1. Vale takes the folder relative to the root. An absolute path stops its
   per-path sections from matching, and `spec/rationales` then lights up 108
   `PastTense` findings that `.vale.ini` turns off there. The fix is one
   argument, and the trap is silent.
2. The fake disk answers an empty list where the real one throws. A walk
   meeting a file path has to read both.
3. Measuring the root sweeps `.se` in, and the scratch there is the very
   output of `--transcripts`. So the walk skips `.se` unless the folder you
   name opens with it.
4. `voice.test.js` already covers the voice rules, so the verb tests take
   two other names.

# The dead end I meet

The funnel note names six branches in order, and nothing maps that order
where a program reads it. So `work take` hands out the second branch while
this one stands at `todo`, and this session starts on the wrong one.

The owner settles it, and `work/the-schema-projects-vale` now declares
`depends_on: [the-voice-verbs]`. A dependency naming no branch reads as
satisfied, and that is right. A done branch merges into main and goes away,
so its absence says the work lands.
