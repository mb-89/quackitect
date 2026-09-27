---
name: dispatch
description: Reads the dispatcher's plan and acts on it. Opens the pull request over the write branch, starts one worker session a ready group and a stuck hand-over, and messages the owner with each question. Use it where a routine says to run the dispatch skill.
---

# Dispatch

The verb decides, and this skill acts on its answer. Count, sort and judge nothing the answer carries. For the plan, see [[spec/design_input/the-cloud-runs-itself#the-dispatcher]].

1. Run `./RUNME.sh dispatch --json`, and read the one object it prints.
2. Read `write`. Where the run pushes its branch, or finds it standing, open a pull request over that branch against `main`. Open it through the GitHub connector, with auto-merge on. Leave a pull request that stands already.
3. Start one session for each entry under `ready` and under `stuck`. Start each through the cloud-sessions connector, with the prompt `run the work skill`.
4. Send the owner one message naming each entry under `questions`, with its ticket and its group.
5. Leave.
