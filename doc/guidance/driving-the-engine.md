---
kind: [[guidance]]
scope: ["every agent working in a tree the engine drives"]
out_of_scope: []
depends_on: ["[[voice]]"]
---

# Motivation

The engine governs your work.
It provides you with what you need to do and know, and the tools for it.
You pull the engine for input, and answer what it tells you.

For what the engine offers, run `se --help`.

# Actionables

1. Follow and trust the process. Take the step in hand rather than arguing with it. *
2. Disagree and commit. If in doubt, mint a note about your concern and continue. *
3. On errors, the engine provides remedies. Incorporate them in your way of working.
4. Stop only with a reason named to the engine. On an interrupt, claim `asked`. *
5. Do not kill yourself because you are afraid of dying. Test to find defects, not to feel covered. *
6. Answer prompts before anything else with `se --answer "..."`. Copy the prompt verbatim. *
7. Use the tool the engine gives you. *
8. Change files with `se_apply`, naming the token on every write. *
9. Run every shell command with `se_run`, naming the token. It could write. *
10. A helper script goes in `.se/scratchpad/`. A standing check goes in `util/checks/`. *

# Discussion

## 1. Ruminating reads like working

An agent handed a step and a contract argues with the contract instead of
taking the step, and the argument reads like work.
It costs a turn, it costs what the turn carries, and the step is still there
afterwards.

## 2. A concern is a note, not a halt

Disagreeing is worth something and stopping is not.
A note costs a minute, survives you, and reaches the triage that decides.
An argument inside a turn reaches nobody and is gone when the turn ends.

So the concern goes to the backlog and the work goes on.
The engine reads what is in the backlog, which is how a finding becomes
somebody's decision rather than your delay.

## 4. A stop the engine knows about

Which stops are sanctioned is the engine's, and it says so when it refuses one.
A refused stop is not permission to carry on.
It says the reason was missing, so name one or keep working.

`asked` is the reason for an interrupt, because an interrupt is the person
arriving and the engine cannot see them arrive.

## 5. Fear is not a design input

Machinery written against a failure nobody has seen costs more than the failure
would.
A retry loop, a swallowed error and a second copy of a value each hide the
thing they were added to survive.
The engine records every call and refuses what must not happen, so a failure
leaves a trail somebody can read.

Insurance is bought against a risk you hope never happens and expect never to
collect on.
A test is the opposite: it earns its place by paying out, by going red when the
program is wrong.
One written to feel covered goes red for other reasons, and then it is noise
somebody eventually turns off.

## 6. The person comes first

The engine reads the harness transcript on every call and copies what the
person said into the log, word for word.
Then it refuses every call until an answer follows.
An agent that keeps working through a question has already decided the question
did not matter.

Copy their sentence. Do not shorten it, tidy it or join two of them.
A summary is your reading of what was said, and the record is for the saying.
`se --said "..."` is the fallback for a message the engine did not copy, and it
refuses a repeat.

## 7. The tool it found, not the one you know

The engine probes the machine and hands you what is there.
Measured warm, three runs: `grep -rnI LoadConfig src` about 260 ms, `rg -n
LoadConfig src` about 40 ms.
The `.rgignore` un-ignores `.se/`, so a search reaches the log and the
scratchpad without a flag.

A tool you reached for yourself is one the engine cannot account for, and on a
machine without it the work stops for a reason nobody wrote down.

## 8. The write says which work it is

`se_apply` takes the token id on the write itself, so naming the work and doing
the work are one act.
The harness's Write and Edit are refused, because they carry no field for a
token and a change nothing can file is a change nobody can find.

One manifest changes as many files as you like.
Every edit is checked before any is written, so one bad edit writes nothing and
the tree is never half changed.
Naming a token you were not on puts the old one back and takes the new one up.

## 9. A command could write, so it names its work

The engine cannot read a command and know whether it writes.
`sed -i`, a redirection, `mv`, `rm` and a script you wrote all reach the
filesystem, and a list of safe programs goes stale the day anybody runs a new
one.

So the question is not asked.
Every command names its work because it could write, the same way every edit
does, and the record says which token each one ran under.

Output and errors come back as one stream with the exit code.
A long output is cut at the front, and the cut is reported, because a failure
says why on its last lines.

## 10. Where a script lives

A script that earns its place moves from the scratchpad to `util/checks/`,
which is in version control, so a worktree gets it and a retro cannot drain it.