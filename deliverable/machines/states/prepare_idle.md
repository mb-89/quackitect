---
state: prepare_idle
state_kind: work
priority: mechanical
tags: boot
exit_script:
  - deliverable/engine/bin/preflight.ts
  - deliverable/engine/bin/smoketest.ts
  - deliverable/engine/bin/sweep.ts
  - deliverable/engine/bin/prose-inspect.ts
  - deliverable/engine/bin/record-inspect.ts
repair_tools: se_file_read, se_file_search, se_file_glob, se_file_list, se_file_patch, se_file_write, se_run
guidance: BOOT METHOD rides in from guidance/method/boot.md by tag - follow it. Preflight, the SMOKE test and the CONFORMANCE SWEEP run on exit, and all three are quick - the sweep reads about a thousand nodes in a third of a second. If this state allows no tools, pull to run them. Do not read or search here. A failure is named in the refusal. While a check stands red, the repair tools are legal HERE - fix what the output names, then pull again.
---

# Prepare idle

THE SWEEP RUNS HERE BECAUSE THERE IS NO VERB FOR IT (owner ruling
2026-08-16). A verb an agent can call is a verb an agent will call, over
and over, and the whole reason a check moves out of the write is that it
costs too much to run per write. So the engine decides when it runs, at
moments that are mechanically clear, and every session starts on a corpus
somebody has read.

MEASURED 2026-08-16, its first run against the real corpus: 1015 nodes in
388 ms, and six standing breaks nobody had seen — five option nodes and
one register entry carrying a word outside the list their own item
template declares. Every one predated the write guard, which is exactly
the class the sweep exists for: the guard stops new breaks at the door,
and the sweep finds the ones already inside.

The checks before idle. The ENGINE evaluates them — the agent cannot claim
a green engine, only trigger the run. Three scripts, all fast: the
sub-second preflight (canvases compile, hard deps answer, .se writable, and
the files the readers are told to read are THERE — RUNME runs the same one at
launch so starting stays instant) and the SMOKE test (every engine module
imports, the machines compile, the cards and the rigor matrix read).

A CONFIGURATION FILE IS CHECKED WHERE ITS READER LOOKS, never at a path the
check spells for itself. The brand file and the palette are asked for by the
module that owns them, so a moved file fails the check by the same path that
would have failed the product — and the failure says what it costs, not just
that something is absent.

THE FULL BATTERY IS NOT HERE (owner ruling, 2026-07-30). Boot asks whether
this engine can run, not whether every behaviour is correct. The battery
answers the second question and belongs to validation — se_test, and the
end of an expedition. It was measured at fifty-three seconds for one file
alone on a machine held at its base clock, spent before the first useful
word.

Lineage: v1's selftest verified the pointer chain; v2's admission verified
the contract hash and warmed the index.
