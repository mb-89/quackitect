---
form: container-blind-spots
by: agent
signed_off: 2026-08-17T12:08:34.011Z
authors: agent
files:
---

# Evidence form / container-blind-spots

## current_situation

The box had a working Chromium at /opt/pw-browsers/chromium and shoot.ts could not see it. It also runs as uid 0, where Chromium refuses outright.

Three shoot tests were red on a machine that had exactly what they asked for.

## built

project/deliverable/engine/shoot.ts, two changes.

THE BROWSER PATH: /opt/pw-browsers/chromium and its chrome-linux/chrome join the BROWSERS list. That is where every Playwright image lands one, under PLAYWRIGHT_BROWSERS_PATH.

THE SANDBOX FLAG: --no-sandbox is passed when process.getuid?.() === 0, and only then. CONDITIONAL DELIBERATELY — unconditional would weaken a desktop run, which has a sandbox worth keeping.

BOTH HALVES WERE PROVEN ON THE BOX BEFORE THE CHANGE. As root without the flag: 'Running as root without --no-sandbox is not supported', no PNG. With the flag: 1232 bytes written.

MEASURED AFTER: the battery went from 5 red to 1.

## follow_up

- The BROWSERS list is still a hardcoded array. A PLAYWRIGHT_BROWSERS_PATH read would cover images that put it elsewhere, and is not done.
- The emergency flake also went green in that run and is a separate question, captured as a note.

## anything_else

THE FIELD REPORT PREDICTED 5 RED TO 2 AND THE RESULT WAS 5 TO 1. The extra one was emergency.test.ts, which passed here and had failed in the run before with nothing changed between them. That is a flake rather than a fix, and it is recorded as a flake rather than claimed as a win.
