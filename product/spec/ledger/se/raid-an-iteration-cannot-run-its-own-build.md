---
id: se.raid-an-iteration-cannot-run-its-own-build
kind: raid
statement: "AN ITERATION CANNOT EXERCISE ITS OWN BUILD THROUGH THE LIVE SURFACE. The MCP server and the board both run TRUNK's code; an iteration's build lives in its worktree and only reaches trunk at the close - which the release gate gates. So a change to the engine's own behaviour cannot be demonstrated by the engine before it ships. i8d hit this at its release gate: the new push path was built, verified 28/28 and proven live against the real store, then the agent parked on the gate and NOTHING was sent, because the se_wait being served was trunk's. Worse, the pre-fix board was still pushing its BROKEN card at the owner from its own timer throughout the iteration. Self-hosting makes this structural, not incidental - it will recur for every engine-behaviour change."
provenance:
  iteration: i8d-phone-brief
  ai_involvement: agent-drafted
raid_kind: issue
raid_owner: agent
trigger: "Open now; hit at i8d's release gate. Today's workaround, declared under se.law-workaround-then-record-the-gap: stop the board so the stale pusher is silent, drive the announce and the tap-read from the worktree build directly, and say plainly that the card came from the new code invoked out-of-band rather than from the shipped path. Fix candidates for i9: a lane to run the engine FROM a worktree for the length of a demonstration, or a reload that points the live server at the open iteration's build (the hot-reload gap already noted at i5c), or accept it and make the bootstrap explicit in the machine so the demonstration is a declared state rather than an improvisation."
---


