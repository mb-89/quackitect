---
form: define-actual
by: agent
signed_off: 2026-08-19T16:50:16.590Z
authors: agent
files: null
---

# Evidence form / define-actual

## current_situation

i37 stands at define-actual, the second step of M1. draft-vision is signed.

The vision inherited the resident big idea and added one sentence to it: nobody can say whether the machine is getting better, so every improvement is taste.

This step says where the project actually stands on that, good and bad, with witnesses named.

## as_is

EVERY NUMBER BELOW WAS MEASURED ON THIS BUILD ON 2026-08-19. Nothing here is recalled.

### What is already good

THE HALF-BUILT BENCHMARK EXISTS AND THE OWNER ASKED FOR IT. project/deliverable/tests/fallback-outcome.test.ts carries a section headed THE BENCHMARK WALK, quoting the owner on 2026-08-18: "I imagine that we have a session that is like a benchmark. So we start the session, we walk all the steps."

WHAT IT ALREADY DOES. It stands a real session on a throwaway root, seeds an iteration, blesses the kickoff, and walks the pinned column. Its fillFor function fills any form from the form's own field templates. Its walkTo returns the number of forms filled, and its comment says why: so a stop that costs more than it should is visible rather than silent.

THE THROWAWAY ROOT IS MATURE. project/deliverable/tests/helpers.ts builds a fresh temp project root carrying the real boot machine. It links what is only read and copies what is written, and it fingerprints its template so a stale one cannot be found.

THE TIMING DATA IS ALREADY CAPTURED. engine/calllog.ts records ref, ts, tool, args, ok, outcome, duration_ms, actor and se_version for every dispatch through the single MCP path. No new capture is needed.

THE ARCHIVE HOLDS REAL DESIGN INPUTS AT THE RIGHT COMMITS. Witness: at 5f85977f^, the commit before i33 started, its record stands with status seeded, carrying goal, vision and inputs, and carrying no pin.

THE COMMIT RANGE OF ANY ITERATION IS MECHANICALLY FINDABLE. Every lifecycle commit carries the record id in its message: seed, started, pin <size>, shipped.

THE SHELL IS ALREADY DISCIPLINED. engine/discipline.ts classifies each se_run command into eight categories, allows one warned run per category, then refuses with SE-C-129. The counters persist in .se across sessions. A no_tool_reason valve runs it anyway and files the reason.

### What is bad

NOTHING MEASURES THE MACHINE TODAY. The owner's complaint that iterations run too slowly has stood since 2026-08-14 with no number behind it. That is the whole as-is.

THE FORMS ARE FILLED BY A FUNCTION, NOT BY AN AGENT. fillFor is machine-side. It proves the machine can be walked. It says nothing about what walking costs an agent, which is the only question this iteration cares about.

THE LANE'S PATH HIDING IS THREE LISTS THAT DISAGREE. Witnesses, all read on this build.
- paths.ts EXCLUDED_DIRS holds .git, node_modules, .se, .venv and __pycache__, and only se_file_list and se_file_glob call it.
- search.ts carries its own two-entry ripgrep list and never reads EXCLUDED_DIRS.
- se_file_read applies no exclusion at all. A lane read of .se/reading.md returned the file and its hash.
This is minted as wt-three-separate-lists-decide-which-paths-a-lane-verb-may-see-, and it is this iteration's own dependency.

HISTORY IS FULLY REACHABLE THROUGH THE LANE. se_git's allowlist is status, log, diff, show, add, commit, fetch, branch, rev-parse, restore, merge and checkout. Nothing bounds which commit those verbs may reach, and se_file_read and se_file_search both take a ref.

THE ARCHIVE IS NARROW BY COLUMN. 37 iteration records: 19 seeded, 15 shipped, 3 open. Only 11 carry a pinned size, and they are 8 minor and 3 major. Patch, product and specification have none. The owner ruled these are not gaps.

AN ITERATION'S OUTPUT DOES NOT STAY IN ITS FOLDER. 282 files under project/spec/trace mention i15 or i34, and some carry the iteration id in their own filename. This is why a path mask was struck in favour of the rewind.

THERE IS NO PLACE TO PUT A RESULT. project/spec/benchmarks does not exist, machines/items has no benchmark-run template, and .se is machine-local so a cloud box takes its call log with it when it is reclaimed.

NOTHING SCHEDULES ANYTHING. There is no record of which iteration was benchmarked when, because no iteration has been benchmarked.

### The witness for the state of the walk itself

THIS SESSION IS ITS OWN AS-IS EVIDENCE. 218 calls, 16 rejected, which is 7 percent.

- SE-C-121 fired 4 times, all on se_update, all from one cause: the chained-brief correction mints node ids the caller never chose.
- SE-C-040 fired 3 times, inside long reading runs.
- SE-C-101 fired twice on sibling-verb drift. se_file_search REQUIRES intent and se_file_glob REFUSES it.
- SE-C-046 fired twice.
- se_update is the most-called verb at 47, ahead of se_file_read at 35 and se_pull at 32.

NARRATION COSTS MORE CALLS THAN READING DOES. That is the kind of sentence this iteration exists to produce, and today it exists only because somebody looked by hand.

## follow_up

- log-risks takes the register additions. The git ceiling failing open is the first, and the three-list drift is the second.
- frame-delta names the gap between this as-is and the vision.
- wt-three-separate-lists-decide-which-paths-a-lane-verb-may-see- is pulled into this iteration rather than parked.
- The narration lead — chained briefs minting invisible node ids — belongs to a later retro, not to this iteration.

## anything_else

ONE PIECE OF THE AS-IS IS UNCOMFORTABLE AND BELONGS HERE RATHER THAN IN A GATE.

The benchmark walk in the test suite was found AFTER the first full design for this iteration had been written. The agent proposed an authored scenario pool and a sandbox package, and both were struck by the owner because the repository already held what they were for.

THAT IS AN AS-IS FACT ABOUT THE MACHINE, not just about one agent. Prior art inside the repository was not surfaced by anything the walk does automatically. It was found by a search that happened to use the right word.

IT IS ALSO THE FIRST DATA POINT FOR THIS ITERATION'S SECOND OUTPUT. Re-walking an old design surfaces what the original missed. Here the design being re-walked was one hour old.
