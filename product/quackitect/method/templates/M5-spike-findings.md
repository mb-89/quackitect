---
template: M5-spike-findings
artifact: evidence-doc
applies_rigor: [systematic, lean]
applies_type: [default]
---
# M5 - Spike (<iteration>, <rigor>)

TL;DR: <what was probed, what passed, what fell back.>

## Riskiest assumptions validated  -> <itag>-m5-riskiest-validated
- **Probe <X> - <unknown>: PASS/FAIL (<who ran it, when>).** <what it proves; the pre-agreed fallback if FAIL.>

## Design is buildable  -> <itag>-m5-design-buildable
Judged against the scope guard: <the guard, item by item.>

## Spike results recorded  -> <itag>-m5-spike-recorded
- <finding -> what it advanced or confirmed.>
- The spike is throwaway; nothing enters the product except as fresh build code.

## Milestone review  -> <itag>-m<n>-gate

**Verify:** did each input check deliver against its referent? **Validate:** does the milestone meet the frame and vision? **Red-team:** argue the opposing case; a significant decision carries a kill-criterion. **Verdict: PASS or the reopen list with reasons.**
