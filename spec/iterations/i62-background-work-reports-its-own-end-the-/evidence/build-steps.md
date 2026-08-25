---
form: build-steps
by: agent
signed_off: 2026-08-24T16:28:02.367Z
authors: agent
files:
---

# Evidence form / build-steps

## current_situation

The build is done. Five chunks landed across two files, and the tests written before it now describe behaviour that exists.

Nothing new was invented during the build. Every mechanism is the one the design spec named, and the one place the design met reality is recorded below.

The engine runs the tests at verification. This state does not, and did not try.

## follow_up

Verification runs the battery next, with fresh eyes on the result.

TWO THINGS DESERVE A CLOSE LOOK THERE.

- The sweep rides the read that composes the account, so it touches every lane answer. If anything in the suite goes red that this record did not touch, that seam is the first place to look.
- The gate now returns early for one shape of se_run call. The exemption is per argument, and a test asserts that nothing else the verb carries moved.

## anything_else

WHERE THE DESIGN MET REALITY, and it changed a test rather than the design.

THE TEST FOR AN ORDINARY EXIT ASKED FOR AN EXIT CODE FROM A PROCESS NUMBER. A number can say a process is gone and can never say how it went, so that case now registers the handle instead. The design had already ruled that the handle is the channel; the test had not caught up with its own ruling.

ONE DEFECT WAS FOUND BY RE-READING THE DIFF, before anything ran. The sweep and a run's own exit listener race whenever a child ends between two reads of the account. As first written the sweep would have won and recorded `gone`, throwing away a real exit code that the handle was holding. It now reads the outcome off the handle where there is one, and `gone` is left for the case where only a number was ever given.

WHAT THE LINTER CAUGHT AND I DID NOT. A safe fix froze the sweep's own timestamp into a constant, which the next call then could not assign. It is named here because the fix arrived silently and the typechecker, not the linter, is what surfaced it.
