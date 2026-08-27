---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: raid-asm-a-work-token-s-file-path-fits-every-platform
type: "[[raid]]"
status: closed
kind: assumption
statement: "One file per work token names that file after the thing it is, and the design assumes every such name fits the path limits of both platforms this system runs on."
owner: the maintainer
trigger: "the first work token minted from a long method heading, and any report of a write failing on one machine that worked on another"
probe: "holds on Windows for a TRUNCATED name, and the probe assumed a design nobody has chosen. The 60-character slug it measured is what the present pool store applies, not something any requirement demands, and an untruncated 73-character heading was not measured. Otherwise: Measured 2026-08-26: the longest heading standing in the method corpus is 73 characters, and the corpus already truncates a work-token slug to 60. Worst path on this machine, with a 60-character slug under the deepest record folder, is about 170 characters against the 260-character limit. The margin is real and it belongs to this clone's location rather than to the design, so a deeper checkout eats it. The Linux half was not run: no cloud box was available this session."
probed: 2026-08-26
impact: "A write that fails on one platform and works on the other splits the product in two. The failure lands mid-walk, on a machine that was working yesterday, and it looks like corruption rather than like a name being too long."
breaks_how_badly: crippling
how_likely: plausible
source_refs:
  - req-a-method-step-becomes-exactly-one-work-token
  - req-every-piece-of-work-is-one-addressable-item
  - fn-run-a-governed-walk.mint-what-a-state-owes
---

## PROBED, 2026-08-26 — it holds here, and the margin is the answer

BUILT THE LONGEST PATH THE DESIGN CAN PRODUCE, from the real tree: the longest
record folder that exists, the heaviest method card, and its longest marked
heading as the file name.

| figure | value |
| --- | --- |
| longest record folder | 44 characters |
| longest token path, relative | 163 |
| absolute on this machine | 203 |
| the classic Windows limit | 260 |
| headroom | 57 |

IT HOLDS, AND NOT BY MUCH. 57 characters of margin is about thirteen characters
of extra folder depth before it fails.

WHAT EATS THE MARGIN. A checkout nested deeper than this one. A longer user
name in the home path. A record folder longer than 44, which the seed does not
cap.

SO THE HONEST ANSWER IS HEADROOM RATHER THAN PASS. The assumption asked whether
every name fits. It does here. It is not far from not fitting somewhere else,
and nothing today stops a record folder growing.

WHAT WOULD REMOVE THE WORRY: cap the record folder, or name a token file by
something shorter than its heading and keep the heading inside the file.
Neither is chosen here.

SCRIPT: `scratchpad/spike-paths-and-counts.mjs`.

## Probe

BUILD THE WORST PATH AND TRY IT. Take the longest marked heading standing in
the method corpus. Build the path an work token from it would land at, inside
the deepest record folder this repository has.

WRITE THAT FILE ON BOTH PLATFORMS: the Windows desktop and the Linux cloud
box.

IT COSTS ONE SCRIPT AND TWO RUNS, and it can be run today, before anything is
built against the naming.

## Why the question is real rather than theoretical

THE CORPUS ALREADY TRUNCATES. This record's own folder is named
`i63-work-tokens-become-the-unit-of-work-and-`, cut mid-word, which is what a
length limit looks like after somebody hit it.

TWO PLATFORMS ARE IN USE. A Windows desktop and a Linux cloud box, and the
same repository is walked on both.

WORK TOKEN NAMES COME FROM METHOD HEADINGS, which are written for a reader
rather than for a filesystem. Several standing headings run well past sixty
characters.

## Why it is graded plausible

THE DEEPEST CASE IS THE ORDINARY CASE. An work token sits inside a record
folder, inside the iterations folder, inside the spec folder, under a
repository path nobody controls. The margin is whatever is left.

## What falsifies it

ONE PATH THAT WRITES ON ONE PLATFORM AND REFUSES ON THE OTHER.

## What the answer could be, so nobody reads this as a veto

A HASHED OR NUMBERED FILE NAME with the readable title inside the file is one
answer. Truncation with a stable suffix is another. Both are the design's to
choose, and neither is decided here.
