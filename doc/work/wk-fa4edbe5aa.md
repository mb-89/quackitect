---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: the retro collects voice
# where the token stands. The process owns these values.
status: closed
author: worker-hollis
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - 773c4716567da690699d6b02e40a5895f4472f68
# the tree each time the work was put down or closed, snapshots the engine wrote
ended:
  - 9250f3c101c7555b67c90d208bdf3ce37ce6ab14
# how it ended. Only an ended token carries one.
disposition: done
# why it was dropped
reason: "The voice rules refused a write and nothing read a finished session, so a habit across forty answers looked exactly like nothing. se retro now runs the same VoiceRules.Check over the sessions it has just drained and writes voice.json into the retro folder beside the manifest: which rule, how many, and where, as log/<session file> record <n>, <line>. Collected gains Voice, the path, so the answer says where the findings went rather than leaving it to be found. WHOSE WORDS ARE JUDGED, which is the judgement in this change: the agent's only. The record carries three writers and the rules are about one of them. The person writes their prompt however they like, and the engine's own messages are nobody's prose to improve. So the reading keeps records whose src is agent and skips the other two. Counting either would put the number out of reach of the one who could act on it. The test writes breaks into all three writers and expects two of them ignored, which is what pins it. A checker that cannot run does not take the retro down: a retro is a cycle boundary, and hook.go already allows a write and says so loudly when the rules will not load. So an unreadable rules file writes unavailable with the reason. That is deliberately not nought breaks, because nought reads as a clean session and would let the checker rot unnoticed. A second test removes the rules file and asserts that. Two smaller things a reviewer should look at. The scanner buffer is lifted to 8MB because a record is one line and an answer passes the 64k default. Without that lift the long ones would be dropped, reading low while looking like a measurement. The places are capped at ten per rule while the count stays whole. Changed: src/engine/retro.go and src/engine/retrovoice_test.go. Both new tests seen red first, for the defect, then green. I named 13 existing retro tests alongside them, TestARetroCollectsAndDrains through TestASecondRetroTakesNothingTwice, all ok:true, so the drain and the manifest still behave. Not done: I could not run the whole battery. Proposing a pattern escalated to it and it answered \"no sh on this machine, so the battery cannot run\". That is wk-f4ad7bc41a, open and held by another hand. So the evidence here is fifteen named tests and not the battery."
---

## detail

The voice check refuses a write in hook.go using util/voice-rules.json, but nothing reads a finished session and says how it went. In se retro, run the same VoiceRules.Check over every message the agent wrote in the retired session. Put the findings in the retro folder: which rule, how many, where. The retro guidance judges what the count means. Done when a retro folder carries the voice findings and a test writes a record with known breaks and asserts they are counted. This was UC-33.

## done when

- A test writes a record with known breaks, runs the retro, asserts counts, red then green. Decided by se test proposing TestTheRetroCountsTheVoiceBreaksTheAgentWrote.
- The retro folder carries which rule, how many, where. Decided by the same test, which reads voice.json out of the folder the retro answered.

