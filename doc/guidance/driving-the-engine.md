---
kind: [[guidance]]
scope: ["every agent working in a tree the engine drives"]
out_of_scope: ["how an engineer conducts work, which is [[behaviour]]", "what a token says and how it is used, which is [[work-token]]"]
depends_on: ["[[voice]]", "[[behaviour]]"]
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
3. Stop only with a reason named to the engine. On an interrupt, claim `asked`. *
4. Use the tool the engine gives you. *
5. Change files with `se_apply`, naming the token on every write. *
6. Run every shell command with `se_run`, naming the token. It could write. *
7. A helper script goes in `.se/scratchpad/`. A standing check goes in `util/checks/`. *
8. Search the tree through the index: `se_find` for words, a regex or a path glob, `se_ask` for SQL. *
9. Test through the engine: `se_test` runs what your delta reaches. A test you name runs, a pattern narrows. *
10. Break work into sub-tokens with `se_work`, naming the parent. Your own todo list is refused. *
11. Replace the engine with `se --swap`. A build aimed at `.bin` is refused. *

# Discussion

## 2. The person comes first

The engine reads the harness transcript on every call and copies what the
person said into the log, word for word.
Then it refuses every call until an answer follows.
An agent that keeps working through a question has already decided the question
did not matter.

Copy their sentence. Do not shorten it, tidy it or join two of them.
A summary is your reading of what was said, and the record is for the saying.
`se --said "..."` is the fallback for a message the engine did not copy, and it
refuses a repeat.

## 3. A stop the engine knows about

Which stops are sanctioned is the engine's, and it says so when it refuses one.
A refused stop is not permission to carry on.
It says the reason was missing, so name one or keep working.

`asked` is the reason for an interrupt, because an interrupt is the person
arriving and the engine cannot see them arrive.

## 4. The tool it found, not the one you know

The engine probes the machine and hands you what is there.
A tool you reached for yourself is one the engine cannot account for, and on a
machine without it the work stops for a reason nobody wrote down.
Inside the tree, the search tool is the index, which is rule 8.
Outside it, `rg` is what the probe hands over when it is here.

## 5. The write says which work it is

`se_apply` takes the token id on the write itself, so naming the work and doing
the work are one act.
The harness's Write and Edit are refused, because they carry no field for a
token and a change nothing can file is a change nobody can find.

One manifest changes as many files as you like.
Every edit is checked before any is written, so one bad edit writes nothing and
the tree is never half changed.
Naming a token you were not on puts the old one back and takes the new one up.

## 6. A command could write, so it names its work

The engine cannot read a command and know whether it writes.
`sed -i`, a redirection, `mv`, `rm` and a script you wrote all reach the
filesystem, and a list of safe programs goes stale the day anybody runs a new
one.

So the question is not asked.
Every command names its work because it could write, the same way every edit
does, and the record says which token each one ran under.

Output and errors come back as one stream with the exit code.
A long output is kept whole and answered a window at a time, so nothing is
lost: the answer carries how long the whole thing is and the page to ask for
the rest by.
Ask from the end with a negative offset, which is usually where a failure says
why.

## 7. Where a script lives

A script that earns its place moves from the scratchpad to `util/checks/`,
which is in version control, so a worktree gets it and a retro cannot drain it.

## 8. The index is the search

Every line of every text file in the tree is in the index, and the engine
keeps it in step with the tree as files change.
So a search over the tree is a question, not a walk: `se_find` answers a path,
a line number and the line, best hit first for words, every hit for a regex,
and the files a glob names when given a path alone.
`se_ask` takes SQL over the same tables, so a question no search can put is
still a question.
The harness's Grep and Glob and a shell's `rg` or `grep` aimed inside the tree
are refused and told this door.
Aimed outside the tree, they are yours.

## 9. The engine owns the tests

Every test is mapped to the lines it exercises, by running it once under
coverage, and the map lives in the index.
`se_test` reads your delta, the tree against the snapshot taken when you took
the token up, and runs the tests whose lines you changed.
Name a test and it runs whether or not your delta reaches it.
Give a pattern and it narrows the engine's selection, never widens it.
The whole battery runs when the engine's rules say so, and the answer says
why; nobody asks for it.
`go test`, a check script or the battery run by hand inside the tree are
refused and told this door.

## 10. The plan is in the record

The harness carries a todo list of its own, and a plan written there lives
inside one agent.
It goes when the agent goes, and the person reading the queue never sees what
the work was broken into.
A sub-token says the same thing where everybody reads it: the queue hands the
parts out before their parent, and the parent cannot close while one is open.
So the harness's todo tools are refused, and the refusal names the token in
your hands to mint under.

## 11. One door to the next engine

Windows locks a running program, so replacing the engine was a ritual: stop it,
build, start it again.
It was typed by hand thirty-four times in one day.
Every stop severed the calls in flight and started a new log session, so a test
run that asked for the whole battery killed the process it was running in and
lost its own answer.

`se --swap` is the engine doing it to itself.
It builds the next one beside the current one, checks that it answers, waits for
the calls in flight, hands over, and the successor continues the same session.
A build aimed at `.bin` is refused and told this, because the running program and
the program on disk being two different builds is a thing nothing says out loud.

The whole battery is started rather than awaited, for the same reason.
It replaces the engine, so the answer arrives after the process that would have
carried it has gone.
`se_test` says where the answer will land, and the next engine puts the outcome
in the record.
