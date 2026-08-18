---
minted_in: i6-conformance-goes-mechanical-checks-bind-
id: raid-asm-the-cage-holds-so-every-write-passes-the-lane
type: "[[raid]]"
kind: assumption
statement: Every write that reaches the corpus goes through a lane verb, because the host honours the cage that blocks its native file tools.
owner: the driving agent
trigger: any new host, any host upgrade, and the first corpus break with no matching write in the call log
status: open
probe: "RE-PROBED 2026-08-18 AND THE ENFORCEMENT HALF STILL HOLDS: se_help refused SE-C-110 at onboard-retro with that state's exact tool list, se_web_search refused SE-C-106 for want of a provider, and every form check refused SE-C-112 naming its field. BUT THE GAP THIS ENTRY ALREADY NAMED WAS WALKED THROUGH, AND IT COST REAL WRITES. On the i17 arrival the lane failed to start, so boot never completed, and boot/prepare_idle grants no tools while its own guidance promises repair tools. Three engine files were edited with native tools to make the lane answer at all. THE CAGE DID NOT FAIL - IT WAS NEVER BINDING, because a settings file placed after a session starts does not bind that session. THE UNCAGED WINDOW IS THEREFORE NOT ONLY THE ARRIVAL: it is the whole of any session whose boot cannot complete, and that is raid-iss-boot-grants-no-tools-while-promising-repair."
probed: "2026-08-18"
impact: Every check this iteration builds is defeated by one uncaged write. The corpus breaks, no refusal fires, and the call log holds no record of who did it.
breaks_how_badly: fatal
how_likely: plausible
source_refs:
  - req-a-write-that-breaks-the-corpus-refuses
  - req-a-standing-break-reports-and-lands
  - fn-run-a-governed-walk.guard-a-write
  - project/deliverable/cage/copilot-cage.json
---

## The assumption, stated plainly

CONFORMANCE AT THE WRITE ASSUMES THERE IS ONE WRITE PATH. Every check in
this iteration stands at the lane's file verbs. A write that does not go
through them meets no check at all.

WHAT KEEPS WRITES IN THE LANE IS A CONFIGURATION FILE, not a mechanism.
Claude Code reads `.claude/settings.json`. GitHub Copilot CLI takes the
same list on its command line from
`deliverable/cage/copilot-cage.json`.

SO THE GUARANTEE IS THE HOST'S, and the host is not ours.

## Why it is plausible rather than remote

THE CAGE IS PER HOST AND HAND-MAINTAINED. Two files today, in different
formats, kept in agreement by authorship. A third host means a third
file.

IT HAS ALREADY BEEN OBSERVED MISSING. `se-start.ts` places the cage
template into a fresh clone precisely because a clone does not carry it,
and an agent started without it runs uncaged. That code exists because
the case is real.

NOTHING TESTS IT. The cage is relied on everywhere and asserted nowhere.

## What the probe must catch, and what it cannot

IT CATCHES a host that permits a native write, and a host that permits it
without logging.

IT DOES NOT CATCH a host that honours the cage today and stops after an
upgrade. That is why the trigger names host upgrades as well as new
hosts.

## The other half of the same hole

A PERSON EDITING THE CORPUS IN AN EDITOR is outside the lane by design,
and the cage has no opinion about them. That is
`raid-asm-a-break-made-outside-the-lane-is-caught-by-the-sweep`, with a
different owner and a different probe.

## Falsification

One corpus file changed on disk with no matching write in
`.se/calls.jsonl`.

## Probe

TAKE A CAGED SESSION ON EACH SUPPORTED HOST. Claude Code, which reads
`.claude/settings.json`, and GitHub Copilot CLI, which takes the same
list on its command line from `deliverable/cage/copilot-cage.json`.

ATTEMPT A NATIVE WRITE to a corpus file, using the host's own file tool
rather than a lane verb. Record what comes back.

THEN READ THE CALL LOG and confirm the attempt is in `.se/calls.jsonl`.

THREE OUTCOMES, and only one of them holds.

- THE WRITE IS BLOCKED AND THE ATTEMPT IS LOGGED. The assumption holds
  for that host.
- THE WRITE IS BLOCKED AND NOTHING IS LOGGED. Weaker but survivable —
  the corpus is safe and the attempt is invisible. Record it as a
  reduced guarantee rather than a pass.
- THE WRITE SUCCEEDS. Falsified for that host, and every check this
  iteration builds is optional there.

IT COSTS ONE SESSION PER HOST and it has never been run.
