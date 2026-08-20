---
id: i31-the-process-becomes-measurable-a-walk-re
status: seeded
opened: 2026-08-14T20:12:52.111Z
goal: "The process becomes measurable: a walk replays from recorded events, the agent's thinking is captured, and drag per state names where the guidance fails."
vision: |-
  TWO HANDOVERS, ONE ITERATION, and the dependency is why. project/scratchpad/HANDOVERreplay.md says it in as many words: recorded replay "turns prompt work from taste into measurement", and "it is also the prerequisite for the thinking-log analysis in the sibling handover to mean anything". Split them and the second half measures noise.

  WHAT REPLAY BUYS. Two payoffs, and the second is hard to get any other way.

  - RESUME AFTER INVALIDATION. Suspect propagation and blast radius already compute WHICH states an input change invalidates. Nothing can act on the answer. The expensive half exists; this is the cheap half bolted on.
  - COMPARABLE EXPERIMENTS. Two live runs differ in a hundred ways, so a guidance change cannot be A/B tested honestly today. With a recorded walk you change one document, replay, and compare.

  THE DISTINCTION THAT MUST NOT BLUR. Replay feeds recorded results back and never re-invokes the agent. Re-run re-invokes it from a chosen state. Those are two modes and conflating them will cause pain.

  DETERMINISM IS THE WHOLE GAME. Replay only works if folding the recorded history reproduces the recorded state. The packet already carries `now` from the server for exactly this reason. Audit for clock reads, filesystem scan order, map iteration order reaching output, and anything random.

  STEPS 1 AND 2 ARE WORTH SHIPPING ALONE — record, then rebuild. The null case is the selftest: fold a complete history and assert it equals live state. If that is not exact, nothing downstream matters.

  WHAT THE THINKING LOG ADDS. The Stop hook already receives transcript_path, so the collection lane exists. The metric is sharp because this system defines progress objectively: a state transition IS progress, so DRAG = thinking characters spent per state transition. Rank states by drag; the worst are where guidance is failing.

  STEP 0 IS A REAL GATE. On a cloud session, 36 thinking blocks each carried a full signature and an EMPTY thinking string. Check for TEXT, never for blocks. No text on a host means the rest does not apply there.

  THREE FAILURES LOOK ALIKE AND WANT DIFFERENT FIXES. High drag with repeated reads is guidance that does not say what it needs. High drag with refusal loops is a remedy that is not executable. High drag with high block similarity is two rules that appear to conflict.

  WHY IT MATTERS NOW. The owner's complaint on 2026-08-14 was that running an iteration costs too much agent reasoning, and that the engine should simply work. Today that complaint has no measurement behind it. This iteration is what turns it into a ranked list of states.

  ONE JUDGMENT IS THE OWNER'S, not the implementer's. An adjudication recorded in a replayed history was given against the old state. Whether a replayed bless still stands or must be re-asked is theirs to decide.
inputs: null
depends_on: null
---

# i31-the-process-becomes-measurable-a-walk-re

## Goal

The process becomes measurable: a walk replays from recorded events, the agent's thinking is captured, and drag per state names where the guidance fails.

## Rough vision

TWO HANDOVERS, ONE ITERATION, and the dependency is why. project/scratchpad/HANDOVERreplay.md says it in as many words: recorded replay "turns prompt work from taste into measurement", and "it is also the prerequisite for the thinking-log analysis in the sibling handover to mean anything". Split them and the second half measures noise.

WHAT REPLAY BUYS. Two payoffs, and the second is hard to get any other way.

- RESUME AFTER INVALIDATION. Suspect propagation and blast radius already compute WHICH states an input change invalidates. Nothing can act on the answer. The expensive half exists; this is the cheap half bolted on.
- COMPARABLE EXPERIMENTS. Two live runs differ in a hundred ways, so a guidance change cannot be A/B tested honestly today. With a recorded walk you change one document, replay, and compare.

THE DISTINCTION THAT MUST NOT BLUR. Replay feeds recorded results back and never re-invokes the agent. Re-run re-invokes it from a chosen state. Those are two modes and conflating them will cause pain.

DETERMINISM IS THE WHOLE GAME. Replay only works if folding the recorded history reproduces the recorded state. The packet already carries `now` from the server for exactly this reason. Audit for clock reads, filesystem scan order, map iteration order reaching output, and anything random.

STEPS 1 AND 2 ARE WORTH SHIPPING ALONE — record, then rebuild. The null case is the selftest: fold a complete history and assert it equals live state. If that is not exact, nothing downstream matters.

WHAT THE THINKING LOG ADDS. The Stop hook already receives transcript_path, so the collection lane exists. The metric is sharp because this system defines progress objectively: a state transition IS progress, so DRAG = thinking characters spent per state transition. Rank states by drag; the worst are where guidance is failing.

STEP 0 IS A REAL GATE. On a cloud session, 36 thinking blocks each carried a full signature and an EMPTY thinking string. Check for TEXT, never for blocks. No text on a host means the rest does not apply there.

THREE FAILURES LOOK ALIKE AND WANT DIFFERENT FIXES. High drag with repeated reads is guidance that does not say what it needs. High drag with refusal loops is a remedy that is not executable. High drag with high block similarity is two rules that appear to conflict.

WHY IT MATTERS NOW. The owner's complaint on 2026-08-14 was that running an iteration costs too much agent reasoning, and that the engine should simply work. Today that complaint has no measurement behind it. This iteration is what turns it into a ranked list of states.

ONE JUDGMENT IS THE OWNER'S, not the implementer's. An adjudication recorded in a replayed history was given against the old state. Whether a replayed bless still stands or must be re-asked is theirs to decide.
