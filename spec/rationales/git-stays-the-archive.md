---
kind: [[rationale]]
---

# Why

The owner decided this for the migration, and the decision is final. Git is the
archive and the transport, and no live value reads it. An agent reads this note
before it asks again.

## 1. What each part does

| the part | what it does |
|---|---|
| the files on the checkout | every live value: the queue, the standing, the hold |
| a group ticket on `main` | carries `cloud: true` from the moment its branch opens in the cloud |
| the merge, the release and the close of that branch | clear the marker |
| the git door | commits and pushes, as actions |
| the git door, asked by name | reads the archive: old logs, closed work, history |
| the index | holds none of the archive |

So the queue reads files alone, and a question about the past says it wants
the past.

## 2. What it gave up

A value git answers for free, such as whether a branch stands merged, now needs
a marker a verb writes and clears. A verb that forgets to clear it leaves a
group reading as in the cloud.

## 3. What would make it wrong

A live value no file can carry without drifting from git. The marker and the
branch then disagree often enough that the queue hands out the wrong group. A
single drift is a bug in the verb, and the verb gets fixed.

## 4. What still reads git

The queue reads the refs and the ticket contents out of git today, and a claim
is a push. The migration replaces these chapters:

- [[spec/design_output/work#one-reading-answers-git]]
- [[spec/design_output/work#the-listing-reads-git-once]]
- [[spec/design_output/work#what-the-standing-says]]
