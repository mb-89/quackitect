---
form: expedition-leave
status: done
by: agent
files:
---

# e22 — the guidance splits, and several things that knew the answer start saying it

## What was the goal

Split `voice.md` into three homes, and clear a bundle of small fixes with it.

The owner grew the scope live, in chat, as each thing surfaced. It ended up
covering the guidance split, the Copilot port, the survey's truncation, the
voice lint, the deferred render, the details pop-out, draining at the desk,
and two laws stranded in a parked note.

A theme showed up that was not in the seeded goal. Most of these are the
same defect wearing different clothes: a mechanism that HAD the answer and
would not say it. The survey knew the note and showed its title. The
pop-out knew the card and opened a default. The machine markdown was the
single truth and the running lane enforced yesterday's copy of it.

## What was done

THE GUIDANCE SPLITS THREE WAYS. `voice.md` keeps words. `software.md` takes
DRY, comments and provenance, and dated guidance. `ux.md` takes visual
design and figures. Both new homes sit at the guidance root, so the pull
serves them always — that is the half of the ruling that is easy to skip,
because a guidance nobody pulls is a guidance nobody reads.

`ux.md` opens with NOTHING EVER HANGS, in both halves. `voice.md` already
carried the half about showing a spinner. The half that actually bit this
project is the other one: never block the process that draws the interface.

THE SURVEY ANSWERS IN FULL. One line took each note's first line and then
cut it at 120 characters. Every note in the store opens with a heading and
carries its substance below, so the only view the desk and the retro have
showed a title, truncated mid-word, and none of the content.

THE DRAWING IS READ LIVE. Editing a state note used to do nothing until
`se_reload`, which contradicts the law that the markdown is the single
truth. The compile is cached against the files it read.

THE POP-OUT CARRIES THE READER'S PLACE, and opens frozen so several can
stand side by side. It says it is frozen, quietly.

DRAINING SPLITS BY DISPOSITION. `done` and `obsolete` are mechanical checks
and drain wherever the tool is legal, the front desk included. `carried`
and `backlog` decide what work MEANS and stay the retro's. The mirror is
the person's own hand and keeps all four.

THE VOICE LINT gains dash chains and a whole-tree sweep.

THE LAUNCHER SPEAKS COPILOT. It detects the host, Claude winning when both
are installed. The terminal host gained `--send`, which types the kickoff
in.

DEFERRED STOPS LOOKING KILLED — it keeps the open colour and leans.

A CHECKLIST IS A PROGRESS VIEW, and the engine now says so.

## What settled it

THE SUITE. 160 tests at boot, 172 at close, all passing. Twelve new tests,
each pinning one of the above.

TWO OF THEM PINNED A MISTAKE I MADE FIRST, which is the part worth reading.

- The live-machine cache was first stamped by size and modification time,
  the usual cheap answer. It is wrong here: a priority edited from `0.01`
  to `0.75` changes not one byte of length, so a same-size edit inside one
  filesystem timestamp tick goes unseen. It is stamped by CONTENT now, and
  the test writes a deliberately same-length edit to keep that honest.
- The pop-out's `frozen` flag was going to be an exemption in the existing
  place-registry test. That test refused it, correctly. `frozen` is a
  registered place instead, so a snapshot window that follows a link inside
  itself stays a snapshot.

THREE PARKED NOTES TURNED OUT TO BE MOSTLY BUILT ALREADY, and the code said
so before any of it was rewritten.

- The voice lint already had long sentences, comma chains, walls and the
  pyramid, with its thresholds already data. Two things were missing.
- DEFERRED already had its arrow badge, its origin line and the
  "…and N more" open map. Only the CSS rule was missing.
- The software guidance already existed as `method/engineering.md`, so the
  split folded into it rather than minting a fourth overlapping file.

This is the handover's own lesson holding up: a parked note is a claim
about the past, and the code is checked before building from one.

THE COPILOT RESEARCH, not guesswork. GitHub's documentation answers the
load-bearing question: Copilot CLI can deny its own built-in tools. It also
settles that `copilot -p` answers once and exits, which is not a session —
hence `--send`.

THE LINT WAS RUN ON ITS OWN AUTHOR. Sweeping `product/guidance` found
fifteen findings, two of them in guidance written an hour earlier in this
same expedition. Those two were fixed.

## What was not done

THE FIVE STALE BACKLOG NOTES ARE NOT DRAINED. Draining is not legal in an
expedition state, and the desk legality built here needs a reload before it
exists. The point is deferred to `front_desk`, where it arrives as an open
to-do.

THE COPILOT CAGE IS UNVERIFIED, and this is the one a reader should not
skim. Copilot CLI is not installed on this machine, so every deny flag came
from documentation and has never been run. The sources disagreed on whether
the flag is `--deny-tool` or `--excluded-tools`, and on the exact spelling
of the built-in tool names.

The flags are DATA for that reason, and the file says so on its own face. A
flag Copilot does not recognise may be silently ignored, and a cage that
reads as installed while the agent keeps every native tool is worse than no
cage. `note-231e38c9eb92` carries the one command that settles it. The
owner said they would check it tomorrow.

THE PRE-EXISTING LINT FINDINGS ARE LEFT. Thirteen of the fifteen are in
documents this expedition did not write. They belong to a pruning round.

THE GENERAL READ CACHE WAS DECLINED. The owner floated caching every file
read the way the compile is cached. The compile is cached because its
output is expensive and derived. Ordinary reads feed the read-proof, which
depends on seeing the file as it stands, so a cache there risks proving a
read of something the disk no longer holds. It wants measuring first.

NO VISUAL VERIFICATION. The pop-out, the frozen marker and the deferred
style are pinned by tests over the rendered HTML. Nobody has looked at them
in a browser. The mirror cannot be called from inside its own session.
