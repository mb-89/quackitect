---
kind: [[guidance]]
scope: ["every agent working in a tree the engine drives"]
out_of_scope:
  - "how an engineer conducts work, which is [[behaviour]]"
  - "what a token says and how it is used, which is [[work-token]]"
depends_on:
  - "[[voice]]"
  - "[[behaviour]]"
---

# Motivation

The engine governs your work.
It provides you with what you need to do and know, and the tools for it.
You pull the engine for input, and answer what it tells you.
Everything that is about this engine is here, and nothing about it is anywhere else.

For what the engine offers, run `se --help`.

# Actionables

1. On errors, the engine provides remedies. Incorporate them in your way of working.
2. Answer prompts before anything else with `se --answer "..."`. Copy the prompt verbatim. *
3. Stopping is claim then stop, in that order. Every call between them clears the claim, an answer included. *
4. A standing claim is granted at once, so a refusal means a call cleared it rather than that it was refused. *
5. `asked` outranks every other reason when their word is what stopped you. On an interrupt, claim it. *
6. Use the tool the engine gives you. *
7. Change files with `se_apply`, naming the token on every write. *
8. Run every shell command with `se_run`, naming the token. It could write. *
9. A helper script goes in `.se/scratchpad/`. A standing check goes in `util/checks/`. *
10. Search the tree through the index: `se_find` for words, a regex or a path glob, `se_ask` for SQL. *
11. Test through the engine: `se_test` runs what your delta reaches. A test you name runs, a pattern narrows. *
12. Break work into sub-tokens with `se_work`, naming the parent. Your own todo list is refused. *
13. Replace the engine with `se --swap`. A build aimed at `.bin` is refused. *
14. Bound to the queue, claim a block with `se claim --next <n>` or `--these`, sized to what you finish before the claim lapses.
15. Inside a box, take up what it holds rather than claiming again: a claim is between boxes, a hold within one.

# Discussion

## 2. The person comes first

The engine reads the harness transcript on every call and copies what the person said into the log, word for word.
Then it refuses every call until an answer follows.
An agent that keeps working through a question has already decided the question did not matter.

Copy their sentence.
Do not shorten it, tidy it or join two of them.
A summary is your reading of what was said, and the record is for the saying.
`se --said "..."` is the fallback for a message the engine did not copy, and it refuses a repeat.

## 3. A stop the engine knows about

Stopping is two calls in this order: claim, then stop.
No stop is granted without a claim standing, and `asked` is no exception.
Every call after the claim clears it, and a status, a search and an answer are all calls.
Answer them first, then claim, then stop.

## 4. A standing claim is granted

A claim that is standing is granted, whatever is still open.
So a second refusal has one cause: a call cleared the claim between the claim and the stop.
Claim again, and make it your last call.

## 5. Their word is the reason

Which stops are sanctioned is the engine's, and a refusal is not permission to carry on.
`asked` is granted on the claim that names it, whatever is in your hands, because their word is not yours to weigh.

`asked` is also the reason for an interrupt, on which the harness fires no hook event.
So an interrupt nobody names is a turn the record cannot tell from one that never ended.

## 6. The tool it found, not the one you know

The engine probes the machine and hands you what is there.
A tool you reached for yourself is one the engine cannot account for.
On a machine without it the work stops for a reason nobody wrote down.
Inside the tree the search tool is the index, rule 10.
Outside it, `rg` is what the probe hands over when it is here.

## 7. The write says which work it is

`se_apply` takes the token id on the write itself, so naming the work and doing the work are one act.
The harness's Write and Edit are refused, because they carry no field for a token.
A change nothing can file is a change nobody can find.

One manifest changes as many files as you like.
Every edit is checked before any is written, so one bad edit writes nothing and the tree is never half changed.
Naming a token you were not on puts the old one back and takes the new one up.

## 8. A command could write, so it names its work

The engine cannot read a command and know whether it writes.
`sed -i`, a redirection, `mv`, `rm` and a script you wrote all reach the filesystem.

Output and errors come back as one stream with the exit code.
A long output is kept whole and answered a window at a time, so nothing is lost.
Ask from the end with a negative offset, which is usually where a failure says why.

## 9. Where a script lives

A script that earns its place moves from the scratchpad to `util/checks/`, which is in version control.
So a worktree gets it and a retro cannot drain it.

## 10. The index is the search

Every line of every text file in the tree is in the index.
The engine keeps it in step with the tree as files change.
`se_find` answers a path, a line number and the line.
It answers the best hit first for words, every hit for a regex, and the files a glob names when given a path alone.
`se_ask` takes SQL over the same tables, so a question no search can put is still a question.
The harness's Grep and Glob and a shell's `rg` or `grep` aimed inside the tree are refused and told this door.
The recursive form is refused, and a `grep` on one named file is left alone.
Aimed outside the tree, they are yours.

## 11. The engine owns the tests

Every test is mapped to the lines it exercises, by running it once under coverage, and the map lives in the index.
`se_test` reads your delta, the tree against the snapshot taken when you took the token up, and runs the tests whose lines you changed.
Name a test and it runs whether or not your delta reaches it.
Give a pattern and it narrows the engine's selection, never widens it.
The whole battery runs when the engine's rules say so, and the answer says why.
`go test`, a check script or the battery run by hand inside the tree are refused and told this door.

## 12. The plan is in the record

The harness carries a todo list of its own, and a plan written there lives inside one agent.
It goes when the agent goes, and the person reading the queue never sees what the work was broken into.
A sub-token says the same thing where everybody reads it.
The queue hands the parts out before their parent, and the parent cannot close while one is open.
So the harness's todo tools are refused, and the refusal names the token to mint under.

## 13. One door to the next engine

Windows locks a running program, so replacing the engine by hand is a stop and a start.
That severs the calls in flight and begins a new log session.

`se --swap` is the engine doing it to itself.
It builds the next one, checks that it answers, waits for the calls in flight, and hands over on the same session.
A build aimed at `.bin` is refused, because the running program and the one on disk being two builds is a thing nothing says out loud.
