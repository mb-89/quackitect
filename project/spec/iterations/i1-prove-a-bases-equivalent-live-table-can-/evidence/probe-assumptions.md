---
form: probe-assumptions
by: agent
signed_off: 2026-08-07T15:56:49.023Z
authors: agent
files:
---

# Evidence form / probe-assumptions

## current_situation

Three assumptions stand in the register, all written today at identify-assumptions. None had been probed, which the absent probe field made visible.

The field is a view over the register rather than a list written here. Each row's answer lands on that entry's own frontmatter, so a later iteration reads the result where the assumption lives instead of hunting the iteration that ran it.

## probes

| raid | probe | probed |
| --- | --- | --- |
| [[raid-corpus-stays-small]] | holds. 248 trace nodes counted against a 1000-node trigger, and pulls answer well inside a second. The one time it bit was not size: the corpus was being loaded about fifteen times per call, and hoisting that to one load fixed it. | 2026-08-07 |
| [[raid-lane-works-on-posix]] | unprobed. The check is a full battery run on macOS or Linux, and no such machine is reachable from here. Reading the code for separator handling would find the places somebody remembered, which is exactly the set already correct. | 2026-08-07 |
| [[raid-strip-types-flag-holds]] | holds, and the premise is obsolete. Node's own docs give type stripping Stability 2 (Stable) as of v25.2.0 and v24.12.0, on by default since v23.6.0, with --no-strip-types as the opt-out. It is no longer experimental. | 2026-08-07 |

## follow_up

- raid-strip-types-flag-holds can be CLOSED at the next pass. The thing it guarded against stopped existing when type stripping went stable, so there is nothing left to watch.
- the lane still passes --experimental-strip-types explicitly on every entry point. Node now strips by default, so the flag is dead weight and worth removing.
- raid-lane-works-on-posix stays open and is the register's most load-bearing unknown. One battery run on a second platform settles it.
- every probe carries a date so staleness is a comparison later. Nothing enforces a re-probe interval yet.

## anything_else

