---
form: package
by: agent
signed_off: 2026-08-24T13:12:45.352Z
authors: agent
files:
---

# Evidence form / package

## current_situation

THE VALIDATION GATE IS BLESSED, the battery is green at 1803 of 1803, and the package assembled by script on its first run.

THE VERSION WENT 7.0.0 TO 8.0.0, a major bump, matching this record's pinned change size.

NOTHING WAS ASSEMBLED BY HAND. The script is deliverable/engine/bin/package.ts and it produced the archive in nine seconds.

THE ARCHIVE HOLDS 665 ENTRIES IN 3,330,235 BYTES: a README, the one-time installer, the rendered editor extension with its manifest, the engine entrypoint, and underneath them 63 method rows, 74 method cards and 20 guidance documents. Nothing from the session's own state directory travels, and the count of things that should not travel is zero.

## package

- dist/quackitect-8.0.0.zip

## works

yes — installed from the archive into a scratch directory and brought up, and it came up green.

WHAT WAS ACTUALLY RUN, against the extracted package rather than the tree it was made from.

- The engine entrypoint answered its version: 8.0.0, the bumped one.
- The installer script was read and parsed.
- The placement step the installer performs placed four files.
- The startup check ran again and reported preflight green.
- The smoke test reported green in 0.4 seconds, having read the rigor matrix, compiled the machines and loaded the engine modules.
- The conformance sweep reported markers green and widget guard green.

ONE THING FAILED FIRST AND IS WORTH RECORDING. Before the placement step, the startup check named a missing file and said which one, and told the caller exactly which command places it. That is the check working, not the package failing: a bare extraction has not been installed yet, and the installer is what closes it.

WHAT IS STILL NOT PROVED, and it is not this round's to prove. The archive carries no installed dependencies, so a genuinely fresh machine needs a network install first. Dependencies were junctioned in for this check rather than downloaded. That gap already stands as raid-debt-i16-ships-with-its-demonstrations-unperformed, which names it in its own words: the copy needs a network install before it runs.

SO THE YES IS BOUNDED AND SAYS SO. What was observed is a package that extracts, places, passes its own startup check and boots. What was not observed is a machine that had nothing on it beforehand.

## emit_back

- NOTHING IS OWED UPSTREAM. Every change this round made lives in the product itself rather than in a record-local copy, so there is no local shape to promote back to a template.
- THE FOUR REPAIRS ARE ENGINE CHANGES: the startup reap, a run that settles itself, the running-only listing, and the startup guard on the installed editor extension. All four sit where the template sits.
- SIX NOTES CARRY WHAT DOES NOT FIT HERE, and they belong to the retro rather than to this state.

## follow_up

THE OWNER RESTARTS BEFORE THE RETRO, and that restart is when the rebuilt editor extension reaches the window. The engine changes are already live in the lane.

ONE CHECK REMAINS FOR A MACHINE THAT HAS NOTHING ON IT. The archive carries no installed dependencies, so a truly fresh machine needs a network install first. That is an entry the register already carries rather than a new finding.

## anything_else

