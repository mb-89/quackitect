---
minted_in: i5-engine-hygiene-one-version-source-every-
id: req-a-preflight-check-asks-the-reader-where-it-looked
type: "[[requirement]]"
statement: Where a check confirms that a configuration file is present, the engine shall obtain the path from the reader that consumes that file, and shall not hold a second copy of it.
kind: quality
characteristic: maintainability
verify_method: test
breaks_if_removed: A moved configuration file passes its own check and then renders from a silent fallback two layers away, so the symptom names something that is not the cause.
breaks_how_badly: corrosive
measure: 1 occurrence of each configuration path in the source, counted across the reader and every check of it.
refines:
  - uc-quality-maintainability
  - uc-install-quackitect
source_refs:
  - "engine/render.ts: palette() reads the file live and falls back silently by design"
  - "engine/bin/preflight.ts: the palette and brand checks join their own path from root"
  - "note-13b3b5ae5a93: the comment above the fallback claims preflight guards it"
priority: should
---

## Scenario

SOURCE. Anybody who moves, renames or reorganises a configuration file — a
maintainer, a produced vehicle, a merge.

STIMULUS. The file no longer sits where the reader looks for it.

ENVIRONMENT. A normal boot, with preflight running before anything renders.

ARTIFACT. The preflight check and the configuration reader.

RESPONSE. Preflight fails and names the file, because it asked the reader
where it looked rather than checking a path of its own.

RESPONSE MEASURE. One occurrence of the path in the source. Two occurrences is
the defect this row exists to make impossible.

## Detail

THE SILENT FALLBACK IS CORRECT AND STAYS. A missing palette must not take
every surface down over a colour, and a missing brand file must never leak the
name of whichever product the source last belonged to. That is settled and
this row does not touch it.

WHAT IS WRONG IS THE PAIR. Silent at render time is right. Silent at boot is
wrong, and preflight exists to say it out loud — but preflight checks its own
copy of the path, so the two go stale together and the guard the comment
promises is not there.

## Behaviour

None wanted. The gap is one duplicated string, not a missing transition.
