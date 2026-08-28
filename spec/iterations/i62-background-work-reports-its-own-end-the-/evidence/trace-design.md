---
form: trace-design
by: agent
signed_off: 2026-08-24T16:31:01.098Z
authors: agent
files: null
---

# Evidence form / trace-design

## current_situation

The build is done and every chunk is signed. Two design specs stand for the two elements this record touches.

The checks here are the engine's, not mine. Every element realized by a spec, every spec's files on disk, every code file claimed by a spec.

What I can say for this delta is which files it added and which spec claims each.

## design_trace

THREE FILES CHANGED OR ADDED, and each is claimed.

- deliverable/engine/run.ts. Claimed by both new specs, and by dsp-the-work-account before them. The registry's entry life is dsp-the-entry-that-closes-itself; the workspace hold and the registration exemption are dsp-one-instance-holds-the-workspace.
- deliverable/engine/session.ts. Claimed by dsp-the-work-account already. This record added the registration exemption to its state gate and claimed no new spec for it, because the gate is not new.
- deliverable/tests/work-lifecycle.test.ts. Claimed by both new specs as realization, and by tsp-background-work-reports-its-own-end as its test file.

NO FILE WAS CLAIMED TO SILENCE THE SWEEP. Each link is a contribution: a spec names a file only where its design actually lands there.

ONE HONEST GAP AT THIS GRAIN. The sweep works per file, so nothing here can tell whether every function inside run.ts is still reached. run.ts is a large file that three specs now claim, and dead code inside it stays invisible until the grain gets finer.

## follow_up

Verification runs the battery next, with fresh eyes.

ONE SEAM DESERVES ATTENTION THERE. The sweep rides the read that composes the account, so it touches every lane answer. Anything that goes red outside this record's own cases points at that seam first.

## anything_else

THE ONE FILE THIS RECORD TOUCHED WITHOUT MINTING A SPEC FOR IT IS session.ts, and that is deliberate rather than an omission.

The state gate already stands, already has a spec, and this record added six lines to it. Minting a spec so a small change could point at something of its own would be coverage theatre.

WHERE THE CHANGE IS DESCRIBED INSTEAD: dsp-one-instance-holds-the-workspace carries the registration exemption in full, including the fallback if legality cannot be expressed per argument.
