---
name: work
description: Takes one work branch, works its group to done, and hands it back through a pull request. Use it where a session starts with the prompt run the work skill.
---

# Work

One session works one group. For the rules on the way, see [[spec/guidance/cloud/cloud]].

1. Run `./RUNME.sh branch take`, and read the ask it prints.
2. Work the group as the cloud guidance says, one ticket a pull, through `./RUNME.sh ticket pull`. Decide every step yourself, keep each ticket you mint in the group, and open no GitHub issue. [[spec/guidance/cloud/cloud]]
3. Run `./RUNME.sh branch done` once the pull answers wait.
4. Open a pull request from `work/<group>` against `main` through the GitHub connector. Turn auto-merge on, with the merge method `MERGE`. The owner merges nothing by hand.
5. Where the fire names a red pull request, switch onto its branch, fix the red cases its check log ends on, run `./RUNME.sh check`, and push. The pull request lands on green. [[spec/tickets/ci-reds-name-their-cases]]
