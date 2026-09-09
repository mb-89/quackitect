---
kind: [[handover]]
status: held
urgency: now
---

# The tooth stands

The three pieces the brief asks for stand, and `./RUNME.sh check` passes over
this branch. The canary earns its keep on the first day: level zero reaches no
cloud session that starts the ordinary way, and this branch proves why.

| piece | where it lives | what holds it |
|---|---|---|
| the log takes every call | `hooks/level0.js`, `lib/log.js` | `test/level0/log.test.js`, `hooks.test.js` |
| the level a box writes at | `lib/log.js`, `spec/config/level0.json` | `test/level0/log.test.js` |
| the tooth | `lib/stop.js`, `spec/config/stop/level0.yml` | `test/level0/stop.test.js` |
| the claim tool | `hooks/level0.js` | `test/level0/hooks.test.js` |
| the canary | `lib/guidance.js` | `test/level0/guidance.test.js` |
| the prune | gone | `test/contract/tree.test.js` |

# What the ten proofs answer

| # | what the brief asks | where it stands |
|---:|---|---|
| 1 | `check` passes, and validates the plugin | `./RUNME.sh check`, 162 tests |
| 2 | no code path deletes a log file | `tree.test.js`, and the grep below |
| 3 | a tool call and a prompt each write one line | `hooks.test.js` |
| 4 | a claim expires two ways | `stop.test.js` |
| 5 | the free stop fires one time | `stop.test.js` |
| 6 | a second rule file needs no code | `tree.test.js` |
| 7 | the vote answers over a table | `stop.test.js` |
| 8 | `mostInARow` ends a runaway | `stop.test.js`, and the trace below |
| 9 | a broken rule file leaves the tooth harmless | `stop.test.js` |
| 10 | the canary carries the counts | `guidance.test.js`, `hooks.test.js` |

The grep for the second proof answers nothing, and a contract test runs it over
every tracked file:

    grep -rnE "remove\(|unlink|rm |prune" src .claude --include=*.js

`test/level0/hooks.test.js` is the piece the brief does not ask for. It drives
`register` against a fake engine interface, so the wiring itself carries tests:
the lines, their order, the claim, the vote and the canary.

# Level zero reaches no box

This is the finding of the branch, and it outranks the work.

    ‼ 1 project-scope directory under ./.claude/skills/ that may load as a
      plugin was skipped because this workspace was not trusted when plugins
      were scanned.

`claude plugin list` says that in this tree, on this box. Client 2.1.266 gates
a skills-directory plugin on the same trust a marketplace waits for, and
`~/.claude.json` carries `hasTrustDialogAccepted: false` on a fresh clone.

So `spec/design_output/level0.md` claims something this branch disproves, and
it now carries the correction. The evidence is three sessions:

| session | what happens |
|---|---|
| this cloud session | no `.se/level0.stamp`, no standing block, and the brief stands |
| `claude -p` in this tree | the same, and the agent knows no canary line |
| `claude -p --plugin-dir .claude/skills/level0` | the stamp lands, the canary comes back whole |

Two ways in stand open, and neither travels in the tree:

- `claude --plugin-dir .claude/skills/level0`, which loads the folder for one
  session and skips the scan.
- A box whose setup writes the trust flag into `~/.claude.json` first.

The next branch belongs here. A cloud routine starting `claude` with
`--plugin-dir` puts every rule in this tree back in front of the agent. A box
accepting trust before the clone runs does the same.

# What one turn end costs

| what runs | milliseconds |
|---|---|
| the vote, the state and the stop line | 0.2 |
| Vale over the answer, which stands there already | 44 |
| the whole turn end | about 45 |

The first row runs 500 times against a fake engine. The second runs Vale five
times over a two-line answer. A tool line costs 0.4 ms, and it grows with the
session, because each line rewrites the whole file.

# The prompt reaches a box

It does, and here is the trace of one `-p` session, ten Bash calls in:

    00:42:09 warn  level0 the canary is absent from the answer
    00:42:09 info  stop   the turn goes on   continue=work-still-stands@80 inARow=1
    00:43:15 info  tool   select:mcp__level0__claim_stop   tool=ToolSearch
    00:43:16 info  stop   claimed the-work-stands-complete
    00:43:17 info  stop   the turn goes on   stop=...@45 continue=...@80 inARow=2
    00:44:23 info  stop   the turn goes on   continue=work-still-stands@80 inARow=3
    00:45:25 info  stop   claimed the-work-stands-complete
    00:45:27 warn  stop   carried enough turns in a row
    00:45:27 info  stop   the turn ends

The re-prompt lands, the agent reads it, and it goes looking for the claim tool
on its own. The whole tooth runs in the open there: the free stop, the carry,
the claim, and `mostInARow` ending the runaway.

## The claim arrives deferred

`mcp__level0__claim_stop` reaches that session as a deferred tool, so the agent
spends one `ToolSearch` before its first claim. The second claim goes straight
to the tool.

## Forty-five under eighty

The trace shows the cost of the brief's own number. A branch at `held` keeps
`work-waiting` true for the whole session, so a claimed
`the-work-stands-complete` at 45 loses to 80 every time.

A cloud session that finishes its work therefore spends three more turns before
`mostInARow` lets it go. Each of those turns costs a model call, and the agent
holds an empty list through all three.

Two ways out, and the owner picks:

- Put `the-work-stands-complete` over `work-still-stands`, which reads as "the
  agent knows more about its own work than the branch status does".
- Take the branch status out of `work-waiting`, and let the todo list stand
  alone.

# Two tool calls is enough

The agent claims and answers inside the same turn both times in that trace, so
every claim reaches the vote with life to spare. Two calls is generous, and the
failure this branch finds sits at the vote instead.

# Where the order surprises me

- A `tool` line lands before the door refuses, which is what the brief asks
  for. The write door and the trunk guard write a second line beneath it, so a
  refusal reads as two events on purpose.
- The plugin's own re-prompt writes no `prompt` line. The engine skips a
  plugin's own hooks for its own `$.prompt.submit`, so the `stop` line saying
  the turn goes on is the only record of it.
- The canary line lands before the stop line, because the first turn checks it
  before the vote.
- A claim writes its line mid-turn, so a `stop` line saying `claimed` stands
  above the `stop` line that counts it.

# The dead ends

1. `claude plugin validate` refuses two hooks on one event where neither
   carries a matcher. So the `tool` line lives inside the write door's own
   hook, and one unmatched hook stands per event.
2. `$` reaches a function only where the hooks file declares that function at
   its top. `bite` moves out of `register` and takes its state as an
   argument.
3. The off switch at priority 0 switches nothing off. A continue rule at 80
   stands above it, so `decide` gives a firing `stop-hook-off` the last word,
   and `spec/design_output/stop.md` argues that one line.
4. Client 2.1.266 carries no `TodoWrite`. Its list is `TaskCreate` and
   `TaskUpdate`, and each names one task. So `todos` counts creations against
   completions, and takes a whole list where a build hands one over.
5. `claude -p` answers exit code 2 on a session the tooth carries, and the log
   shows every turn ending cleanly. Worth one look before somebody reads that
   code as a fault.

# What this branch drops

- The two search hooks go. A web search and a web fetch write the `tool` line
  every other call writes, so the `search` door stands nowhere.
- The receipt block goes. The canary carries the rule count already, and a
  second receipt is a second copy.
- `spec/config/level0.json` carries `log` and `stop` now, and a contract test
  holds every field.
