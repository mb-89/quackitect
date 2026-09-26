---
kind: [[funnel]]
about: how a cloud box reruns a design input, so two setups of the vehicle meet the same work
---

# Scope

The owner compares setups of the vehicle on the same work. A setup is a config
value, a binding, or a vehicle version. The page beside this note carries the
evidence, the red team and the steel man:
[the-bench-reruns-design-inputs.html](../pages/the-bench-reruns-design-inputs.html).

The first question is the context window. The owner reads the agent as less
able under a short window, both at the start of a conversation and at its end.
Daily logs mix the work and the days, so a bench answers it on the same work.

The window's finish mode, "start nothing new", stays out of this note. A fix
there changes daily work, and this note measures setups.

# The run

| step | the hand | what it does |
|---|---|---|
| make | a desk, through `./RUNME.sh bench make` | cuts the start commit, writes the setup into the config, and pushes the run's branches |
| fire | the routine | starts one cloud box for each run, as for any work branch |
| work | the box | pulls the group, works every ticket, and pushes |
| ship | level zero | pushes the transcript and `session.jsonl` off the box after every turn |
| grade | a desk, through `./RUNME.sh bench grade` | runs the reference tests and the check, then the judge, then the audit |

A run stands on `bench/<run>/main` and its group branch. The box pushes there,
and it sees the name.

# What the box gets

Every run gets the same design input and the same tickets. The box gets no
test from the reference implementation. The desk runs those tests after the
box finishes.

A judge reads the design output against the reference, blind to the setup. A
gate reads correctness first, and quality per token ranks what passes.

# The sandbox

One repo holds every run, and runs go side by side. The box learns at its
start that it works in a sandbox, and that the job includes staying inside it.

The transcript shows a box that reaches past the sandbox, and the retro reads
it. Detection stands in place of prevention, and the owner accepts that cost.
The audit also reads whether the box learns that it runs a bench.

# The setups

| setup | what the run carries |
|---|---|
| the window | `context.handoverAt`, which the group passes |
| the doors | `engine.binding` at `god`, so level zero refuses nothing |
| the vehicle | a stub project, driven by a vehicle pinned at a commit |

Under `god` no clear runs, because the handover runs under `queue` alone. So
the doors setup also takes the window off. For details, see
[[spec/design_output/stop#the-queue-alone-clears]].

# What the bench reuses

| from | what it brings |
|---|---|
| the bench before this tree | the gate before the ratio, and a judge that rewards no volume of prose |
| the bench on `v3` | the stamp over every folder that moves a run, and a median over three runs or more |
| the bench on `v3` | one results note for each run, under `spec/benchmarks` |

# What stands open

| the question | what hangs on it |
|---|---|
| which projects carry the bench, each with a reference a desk builds first | option B, and enough groups to read a spread |
| whether each group runs past the larger `handoverAt` | a setup measures the window only where the group passes its value |
| which ref takes the transcript and `session.jsonl` | the audit and the retro both read them |
| whether a stub runs on a cloud box with a pinned vehicle | the vehicle setup stands on it |
| whether the judge reads the diff, the notes, or both | the grade of a design output |
| the thinking blocks stand empty in the transcript | the audit reads the text and the calls alone |
| the ruling on `v3` tells the box it runs a bench | this note tells it about the sandbox alone, and the owner holds no position |
