---
id: i27-the-lane-binds-to-the-record-a-bound-wal
status: seeded
opened: 2026-08-13T15:10:43.192Z
goal: "The lane binds to the record: a bound walk never has to leave its worktree, and the write it makes lands where the walk stands."
vision: "A record's worktree is the whole workspace while that record is bound. Every write the work needs — engine, tests, matrix rows, guidance, spec — lands in the worktree and travels to trunk by the merge that already exists. Stepping out to trunk stops being a step anybody takes, because there is nothing left on the other side to reach.\n\nWHY, MEASURED. The step-out ran about eight times in one session on 2026-08-13, three of them inside a single verification. Each one re-walks the machine from its start on the way back. It also caused the day's worst incident: the trace edits landed at trunk, a mid-walk sync pulled 26 commits in to carry two files, and four signed claims fell and had to be re-earned.\n\nIt cost the other machine too. The cloud field report records se_help implemented twice, differently, on two branches, and three merge conflicts at the close.\n\nTWO SHAPES ARE ON THE TABLE AND THIS ITERATION CHOOSES, rather than inheriting a choice.\n\n- Bind the lane's ROOT to the worktree while a record is bound, so a write from inside a record cannot address trunk at all. The field report's section 7.6 argues this removes the class instead of adding a check.\n- Or run Quackitect itself on trunk with no worktree, since it is the one product that patches its own engine, and keep worktrees for products that never touch the method. The owner's own idea, and it also ends the two-tree drift.\n\nWHAT MUST SURVIVE EITHER WAY. SE-C-134 exists because of a real accident: on 2026-08-07 a method write from inside a record overwrote trunk's tool list and deleted two lane verbs. Whatever replaces the refusal has to stop that, not merely stop refusing.\n\nTHE LEAK IS PART OF THE JOB. SE-C-134 guards five write tools and not se_run, which is how the same feature got built twice. A fix that leaves se_run addressing trunk has not finished.\n\nWHAT IT IS NOT. Not the frontmatter schema, not the fallback edges, not the commit rhythm — those are their own rows on the backlog. This one is the binding, and it is done when a whole iteration runs without the walk ever leaving its record."
inputs:
depends_on:
---

# i27-the-lane-binds-to-the-record-a-bound-wal

## Goal

The lane binds to the record: a bound walk never has to leave its worktree, and the write it makes lands where the walk stands.

## Rough vision

A record's worktree is the whole workspace while that record is bound. Every write the work needs — engine, tests, matrix rows, guidance, spec — lands in the worktree and travels to trunk by the merge that already exists. Stepping out to trunk stops being a step anybody takes, because there is nothing left on the other side to reach.

WHY, MEASURED. The step-out ran about eight times in one session on 2026-08-13, three of them inside a single verification. Each one re-walks the machine from its start on the way back. It also caused the day's worst incident: the trace edits landed at trunk, a mid-walk sync pulled 26 commits in to carry two files, and four signed claims fell and had to be re-earned.

It cost the other machine too. The cloud field report records se_help implemented twice, differently, on two branches, and three merge conflicts at the close.

TWO SHAPES ARE ON THE TABLE AND THIS ITERATION CHOOSES, rather than inheriting a choice.

- Bind the lane's ROOT to the worktree while a record is bound, so a write from inside a record cannot address trunk at all. The field report's section 7.6 argues this removes the class instead of adding a check.
- Or run Quackitect itself on trunk with no worktree, since it is the one product that patches its own engine, and keep worktrees for products that never touch the method. The owner's own idea, and it also ends the two-tree drift.

WHAT MUST SURVIVE EITHER WAY. SE-C-134 exists because of a real accident: on 2026-08-07 a method write from inside a record overwrote trunk's tool list and deleted two lane verbs. Whatever replaces the refusal has to stop that, not merely stop refusing.

THE LEAK IS PART OF THE JOB. SE-C-134 guards five write tools and not se_run, which is how the same feature got built twice. A fix that leaves se_run addressing trunk has not finished.

WHAT IT IS NOT. Not the frontmatter schema, not the fallback edges, not the commit rhythm — those are their own rows on the backlog. This one is the binding, and it is done when a whole iteration runs without the walk ever leaving its record.
