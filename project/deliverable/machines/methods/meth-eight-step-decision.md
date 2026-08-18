---
kind: method
statement: The 8-step decision model runs from collecting criteria to selecting a winner. Every step is recorded.
---

## Situation
Spans M4 (steps 1-4: criteria and variants) and M5 (steps 5-8: rating and selection). The Pugh convergence ([[meth-pugh-convergence]]) is the selection discipline on top.

## Procedure
1. Collect decision criteria from the requirements and the RAID register, whose risks include the stakeholder tensions ([[meth-stakeholder-tensions]]).
2. Prune to the vital few (fewer than 11), each with a definition and its requirement id. THREE CUTS, and one of them cannot run yet.
   - Discard what does not differentiate. Needs the variants, so it runs at step 5 and sends step 2 back.
   - Discard duplicates and co-movers, and check for counter-movement. Criteria that move together weigh one thing twice.
   - Compound related axes into one dimension.
3. Estimate weights: direct comparison (order, assign range, normalize) or pairwise comparison when differences are not obvious. At M4 this is mechanical — see [[meth-derive-criteria]].
4. Define the variants (the design-space exploration; the Pareto front - [[meth-set-based-pareto]]).
5. Rate each variant against each criterion.
6. Sum weighted ratings.
7. Discuss the high scorers - add qualitative criteria the numbers missed.
8. Select - and record why, beyond the arithmetic.
