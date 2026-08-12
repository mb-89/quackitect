---
form: package
by: agent
signed_off: 2026-08-12T15:17:50.166Z
authors: agent
files:
---

# Evidence form / package

## current_situation

The 4.0.0 archive assembled by script from the record tree, twice: the first run exposed two defects the check caught, and the second run ships clean.

## package

- dist/quackitect-4.0.0.zip

## works

yes — checked by using it, 2026-08-12:

- Extracted: the archive holds README, RELEASES with the 4.0.0 entry, RUNME.ps1 and the project tree. No records, no session state, no scratch probes.
- Installed: npm install added 30 packages in 3 seconds.
- Cold boot: the packaged engine ran its own desk-offer suite - 5 of 5 pass. Boot reaches the desk in one call, the desk offers idle, an option above the dial says who it needs.
- The README rendered with zero unexpanded placeholders and opens in plain language.

The check caught and fixed two defects before the final assembly:

- The scratch probes (project/scratchpad, 16 files) were riding the archive. The packager's exclude list now keeps them home (trunk commit 3af19d31).
- A second release-notes file forked RELEASES.md. The fork is deleted; the 4.0.0 entry lives in the standing home.

Named gap: the install-on-a-fresh-machine run with a real first-timer stays owed, as it was at 3.0.0. The contained check installs and boots from the package without touching this machine's setup.

## follow_up

gate-release judges the ship; the retro drains the register debts after.

## anything_else

