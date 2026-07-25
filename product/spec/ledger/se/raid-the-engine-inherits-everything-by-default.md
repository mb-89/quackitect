---
id: se.raid-the-engine-inherits-everything-by-default
kind: raid
statement: "THREE SEPARATE DEFECTS, ONE CAUSE: child processes inherit the parent's whole environment, and each leak was found only when it broke something. Owner: the engine. Trigger: any new spawn site, or any fourth inherited-state defect.\n\nTHE THREE, all found the hard way in one day:\n  1. The test-runner context variable. A suite spawned from inside a test declines to run ANY files and exits reporting zero passed, zero failed - which reads as green. A promotion could have run nothing and changed trunk on the strength of it.\n  2. The session file. The promotion's suite inherited the LIVE session's admission, so a test asserting that an unadmitted call is refused saw an admitted world. Two promotion refusals on a red that had nothing to do with the code.\n  3. The console window. Every spawn without the hide flag flashes a window that steals focus. Sixteen call sites, and it was degrading the owner's ability to use the machine while it ran.\n\nEACH WAS FIXED BY DELETING ONE VARIABLE as it was discovered. That is a blacklist, and it grows only when something breaks.\n\nWHY THIS IS A RISK RATHER THAN THREE CLOSED BUGS: the owner's standing law is that guards are WHITELISTS. A child should receive an allowlist of what it may inherit, not the parent's environment minus whatever has bitten us so far. There is no reason to believe the list of three is complete, and the failure shape of the first two was SILENT - a green that proved nothing, and a red that blamed the wrong thing.\n\nTHE FIX: one place that builds a child environment from a declared allowlist, used by every spawn site. Cheap, and it converts an open-ended class of defect into a closed one."
provenance:
  iteration: i12-tool-surface
  ai_involvement: agent-drafted
---


