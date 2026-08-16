---
id: i32-the-agent-s-thinking-is-measured-capture
status: seeded
opened: 2026-08-14T20:41:49.600Z
goal: "The agent's thinking is measured: capture it per turn, and rank the states by drag so the guidance is fixed where it actually fails."
vision: "SEEDED SEPARATELY ON THE OWNER'S RULING, 2026-08-14. The agent had put this together with the rewind work; the owner would have made it two. \"I would have not put the replay and the thinking log into one iteration. I would have put it into two.\"\n\nIT WAITS ON i31, and the dependency runs one way only. Measuring whether a guidance change helped needs comparable runs, which is what i31's recorded history gives. Without it, two runs differ in a hundred ways and the numbers measure noise. i31 does not need this one at all.\n\nTHE METRIC IS SHARP BECAUSE THIS SYSTEM DEFINES PROGRESS OBJECTIVELY. A state transition IS progress. Everything between two transitions is the cost of that progress. So DRAG = thinking characters spent per state transition. Rank the states by drag. The worst are where the guidance is failing, and that ranked list IS the deliverable.\n\nSTEP 0 IS A REAL GATE, AND IT IS THE STEP MOST LIKELY TO BE SKIPPED. Thinking text is not always present. Measured on a cloud session: 36 thinking blocks, every one carrying a full signature of 856 to 6348 characters, every one with the thinking field an EMPTY STRING. The reasoning was stripped. A block count alone would have said the opposite. So check for TEXT, never for blocks, and check on every host actually used. No text on a host means nothing else in this iteration applies there.\n\nTHE COLLECTION LANE ALREADY EXISTS. Claude Code hooks receive `transcript_path` on stdin, and `engine/bin/se-hook-stop.ts` is already wired. Add to that hook rather than writing a second one: one hook, one lifecycle. Keep the thinking text, the timestamp, the effort level, the usage counts, the session and request ids, the branch and cwd. Drop the signature, which is opaque, large, and answers nothing.\n\nFOUR SUPPORTING MEASURES, cheapest first. Repeat tool calls, which the call log already holds and which are usually the clearest signal. Block similarity between consecutive thinking blocks. Turns per transition. Refusal loops, where a refusal is followed by a retry and the same refusal.\n\nTHREE FAILURES LOOK ALIKE AND WANT DIFFERENT FIXES, and this is the reason the ranking matters rather than a total. High drag with repeated reads is guidance that does not say what the state needs, so the agent hunts. High drag with refusal loops is a remedy that is not executable. High drag with high block similarity is a decision the agent cannot settle, usually two rules that appear to conflict. Do not apply one fix to all three.\n\nCORRELATE EVERYTHING AGAINST THE EFFORT LEVEL. That answers the reasoning-toggle question with data instead of impression, and the expected answer is not on-or-off but WHICH STATES DESERVE WHICH SETTING. Run the same walk several times per setting; one run per setting proves nothing.\n\nTHE LOG LIVES OUTSIDE THE REPOSITORY, one file per session, append-only JSONL so the analysis streams rather than loads.\n\nTWO CAUTIONS THAT BEAR ON THE RESULT. The transcript format is internal and changes between releases, so isolate the parsing in one module and record the version field with every entry. And the thinking may be a SUMMARY rather than the raw trace, which matters here specifically because a summary smooths over the loops being hunted; if it is, the tool-call repeat metric becomes the more trustworthy signal.\n\nWHAT IT DOES NOT ANSWER. It measures drag, never quality. A walk that thinks less and produces worse evidence is not an improvement, so any guidance change is paired with the evidence the walk actually produced.\n\nFULL BRIEF: project/scratchpad/HANDOVERthinkinglog.md."
inputs:
depends_on:
---

# i32-the-agent-s-thinking-is-measured-capture

## Goal

The agent's thinking is measured: capture it per turn, and rank the states by drag so the guidance is fixed where it actually fails.

## Rough vision

SEEDED SEPARATELY ON THE OWNER'S RULING, 2026-08-14. The agent had put this together with the rewind work; the owner would have made it two. "I would have not put the replay and the thinking log into one iteration. I would have put it into two."

IT WAITS ON i31, and the dependency runs one way only. Measuring whether a guidance change helped needs comparable runs, which is what i31's recorded history gives. Without it, two runs differ in a hundred ways and the numbers measure noise. i31 does not need this one at all.

THE METRIC IS SHARP BECAUSE THIS SYSTEM DEFINES PROGRESS OBJECTIVELY. A state transition IS progress. Everything between two transitions is the cost of that progress. So DRAG = thinking characters spent per state transition. Rank the states by drag. The worst are where the guidance is failing, and that ranked list IS the deliverable.

STEP 0 IS A REAL GATE, AND IT IS THE STEP MOST LIKELY TO BE SKIPPED. Thinking text is not always present. Measured on a cloud session: 36 thinking blocks, every one carrying a full signature of 856 to 6348 characters, every one with the thinking field an EMPTY STRING. The reasoning was stripped. A block count alone would have said the opposite. So check for TEXT, never for blocks, and check on every host actually used. No text on a host means nothing else in this iteration applies there.

THE COLLECTION LANE ALREADY EXISTS. Claude Code hooks receive `transcript_path` on stdin, and `engine/bin/se-hook-stop.ts` is already wired. Add to that hook rather than writing a second one: one hook, one lifecycle. Keep the thinking text, the timestamp, the effort level, the usage counts, the session and request ids, the branch and cwd. Drop the signature, which is opaque, large, and answers nothing.

FOUR SUPPORTING MEASURES, cheapest first. Repeat tool calls, which the call log already holds and which are usually the clearest signal. Block similarity between consecutive thinking blocks. Turns per transition. Refusal loops, where a refusal is followed by a retry and the same refusal.

THREE FAILURES LOOK ALIKE AND WANT DIFFERENT FIXES, and this is the reason the ranking matters rather than a total. High drag with repeated reads is guidance that does not say what the state needs, so the agent hunts. High drag with refusal loops is a remedy that is not executable. High drag with high block similarity is a decision the agent cannot settle, usually two rules that appear to conflict. Do not apply one fix to all three.

CORRELATE EVERYTHING AGAINST THE EFFORT LEVEL. That answers the reasoning-toggle question with data instead of impression, and the expected answer is not on-or-off but WHICH STATES DESERVE WHICH SETTING. Run the same walk several times per setting; one run per setting proves nothing.

THE LOG LIVES OUTSIDE THE REPOSITORY, one file per session, append-only JSONL so the analysis streams rather than loads.

TWO CAUTIONS THAT BEAR ON THE RESULT. The transcript format is internal and changes between releases, so isolate the parsing in one module and record the version field with every entry. And the thinking may be a SUMMARY rather than the raw trace, which matters here specifically because a summary smooths over the loops being hunted; if it is, the tool-call repeat metric becomes the more trustworthy signal.

WHAT IT DOES NOT ANSWER. It measures drag, never quality. A walk that thinks less and produces worse evidence is not an improvement, so any guidance change is paired with the evidence the walk actually produced.

FULL BRIEF: project/scratchpad/HANDOVERthinkinglog.md.
