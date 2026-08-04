---
state: prepare_idle
state_kind: work
priority: 0.01
tags: boot
exit_script:
  - project/deliverable/engine/bin/preflight.ts
  - project/deliverable/engine/bin/smoketest.ts
repair_tools: se_file_read, se_file_search, se_file_glob, se_file_list, se_file_patch, se_file_write, se_run
guidance: BOOT METHOD rides in from guidance/method/boot.md by tag - follow it. Preflight and the SMOKE test run on exit, and both are quick. If this state allows no tools, pull to run them; do not read/search here. A failure is named in the refusal. While a check stands red, the repair tools are legal HERE - fix what the output names, then pull again.
---

# Prepare idle

The checks before idle. The ENGINE evaluates them — the agent cannot claim
a green engine, only trigger the run. Two scripts, both fast: the
sub-second preflight (canvases compile, hard deps answer, .se writable —
RUNME runs the same one at launch so starting stays instant) and the SMOKE
test (every engine module imports, the machines compile, the cards and the
rigor matrix read).

THE FULL BATTERY IS NOT HERE (owner ruling, 2026-07-30). Boot asks whether
this engine can run, not whether every behaviour is correct. The battery
answers the second question and belongs to validation — se_test, and the
end of an expedition. It was measured at fifty-three seconds for one file
alone on a machine held at its base clock, spent before the first useful
word.

Lineage: v1's selftest verified the pointer chain; v2's admission verified
the contract hash and warmed the index.
