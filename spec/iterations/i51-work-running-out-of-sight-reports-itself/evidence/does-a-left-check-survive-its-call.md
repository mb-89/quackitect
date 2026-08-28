---
form: does-a-left-check-survive-its-call
by: agent
signed_off: 2026-08-21T10:34:47.040Z
authors: agent
files: null
---

# Evidence form / does-a-left-check-survive-its-call

## current_situation

The assumption was probed partly on 2026-08-21 and the untested half was the leaving-check path itself.

THE PROBE COPIES THE PRODUCT'S OWN SPAWN. `deliverable/engine/sessionscript.ts` line 50 starts a condition script undetached with piped stdio, and the probe uses that exact shape.

THE ASSUMPTION HOLDS. The call answered in 4 ms against a 3-second judgment, and the verdict was readable with the stream fully drained.

ONE RESULT WAS NOT EXPECTED. An orphaned judgment whose starter had exited still ran to completion and wrote its verdict. Detaching is not needed on this platform.

WINDOWS AND MACOS WERE NOT REACHED. This machine runs Linux only.

## built

- [[exp-does-a-left-check-survive-its-call]]

## follow_up

THE DESIGN NEEDS NO NEW SPAWN MODE. The build can leave the spawn exactly as it is and stop awaiting it.

[[raid-ar-walk-resumes-from-repo]] IS NARROWER THAN IT WAS WRITTEN. The work does not die when the session goes; the reader does. The entry should be re-stated at fold-back to say the verdict has no route back rather than that it is lost.

THE NEXT SPIKE CONFIRMS THAT HALF. `what-a-fresh-session-sees` asks what the walk reports for a step left deciding, and this result tells it what to look for.

THE ASSUMPTION'S TRIGGER STAYS ARMED. Two of three platforms are unmeasured, and part B is the half most likely to differ because the operating system decides it rather than Node.

## anything_else

THE JUDGMENT'S BODY IS FAKED and the node says so. Nothing in the tree has an exit script slow enough to watch the window open, so a sleeping stand-in stood in for one.

WHAT IS NOT FAKED IS THE SPAWN, which is the part the assumption is actually about. Same binary, same undetached mode, same piped stdio, same drain handlers.

THE THROWAWAY LAW BINDS `scratchpad/spike-left-check.mjs`. It is not a head start on the build and nothing from it enters the product.
