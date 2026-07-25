---
id: se.adr-reopen-supersedes-and-rearms
kind: decision
statement: "A REOPEN RE-ACTIVATES THE NAMED STATES AND THEIR DOWNSTREAM CONE, MARKS PRIOR FILLS SUPERSEDED RATHER THAN DELETING THEM, AND LEAVES EVERY DOWNSTREAM JOIN REACHABLE. ADDRESSES R31, need N11.\n\nTHE THIRD CLAUSE IS NOT DECORATION - it is two measured failures. A state in the cone may be a join fed by states that are NOT being reopened and remain correctly done. Their edges fired once and were CONSUMED when the join first activated, so after a reopen that fuel is gone and nothing will produce it again: the walk re-does the work and then stops dead at the gate, with no error, no escape and no legal move. Then the fix for that stranding handed fuel back for edges leading INTO the states being activated NOW, so those states re-activated themselves on completion and the walk again never moved - visible on the board as two sequential states live at once. Both are engine defects found by USING the mechanism, in a feature that had shipped with zero tests.\n\nSUPERSEDE RATHER THAN DELETE, because erasing a rejected claim makes a reopen indistinguishable from work that was never done - and the superseded evidence is not merely archived, it is USED: this iteration's own gate had to read a superseded frame to recover the register it was judging against.\n\nREJECTED - abandon and restart the iteration: it destroys the record of what was believed, which is the one thing a reopen is for.\nREJECTED - editing the instance by hand: an out-of-lane write, and this project has already paid for one."
provenance:
  iteration: i12-tool-surface
  ai_involvement: agent-drafted
---


