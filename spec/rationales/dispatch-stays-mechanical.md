---
kind: [[rationale]]
---

# Why

The owner decided how the cloud works its own queue, in
[[spec/design_input/the-cloud-runs-itself]], and the decision is final. A verb
computed the plan, a skill started the sessions, and the state lived on
`main`. An agent reads this note before it asks again.

## 1. Why no fix itself

A dispatcher that fixed a small thing would have been a worker nobody
reviewed. Its change reached `main` beside the hand-over, and no branch, no
check and no pull request stood in its road. The size of a fix was the
judgement the owner kept out of the dispatcher, so every fix rode a fix group.

## 2. Why no standing agent

An agent living across runs held the plan in its context, and that context died with
its session. The system ran the queue instead: a verb read `main`,
computed the plan, and wrote the result back to `main`. Any session, or an
Action with no model, then ran the same step and reached the same answer.

## 3. Why no lease

A lease guarded a step that went wrong when two runs took it. Every step of a
run repeated safely instead. A bundle stood written before a worker started,
a grouped ticket read loose no more, and a take claimed its branch. The write
branch carried the name of the commit it read. A second run found the work done, and changed nothing.

## 4. Why fixes stop

A feature group's follow-ups went to one fix group. Had a fix group filed its
own, each round of fixes could have opened the next round with no end. So what a fix
group left went to a person, and the chain ended at the owner.

## 5. Why parents, not switches

A switch per group held the cloud until the owner edited a config file, and
the switches multiplied with the migration. A parent group held its dependents
until its children closed, and a review became a ticket for a person inside
the parent. So one mechanism, the dependency graph, carried the order and the
owner's reading together.

## 6. What it gave up

A fix waited a run, because its bundle landed by pull request first. The
dispatch verb stood in JavaScript, and the Go migration ported it again. The
first live run bundled the whole loose backlog into one fix group.

## 7. What would make it wrong

A queue whose hourly run left workers idle for hours, or whose fix groups grew
too wide to review whole. The answer then was an event trigger on each merge,
or a cap on a bundle, and no agent in the loop.
