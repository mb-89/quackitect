# quackitect bench: does v5 make a coding agent better than a plain one?

A benchmark built from the repository's own history. Each task is a closed ticket: the tree
just before its work, the ask as written before the work, and the tests that work added,
withheld as the hidden grader. Three arms work every task with the same model, tools and caps:
a plain Claude Code session, the same session told when to stop, and the same session under the
v5 harness as the repository ships it. RESULTS.md holds what came out; this file says how, and
how to run it again.

The design answers the gap the clean-room comparison named (`compare/cleanrooms.md` §4.1): team B
and team C measured their own harnesses against a single agent, and v5 itself was never
measured. Their drivers are the starting point: B's stopping rule is the third arm verbatim in
spirit, and C's `claude -p` driver (stream-json usage, stripped session env) is the session
runner's ancestor.

## 1. The question, and what would answer it

| question | measured by |
|---|---|
| Does v5 make the agent solve more of the owner's real tickets? | hidden-test pass rate, paired per task, v5 against plain |
| Does it leave the tree cleaner? | the repository's own `./RUNME.sh check` on the agent's final tree, against the same check on the base |
| What does it cost? | dollars and tokens from the client's own usage (plus every model call the harness makes outside the session), wall-clock, turns, tool calls |
| Does it keep work in scope? | files changed outside the directories the true change touched |
| Does it need the owner less? | sessions that end on a question, on an owner stop reason, at a cap, or with no code change |
| Is v5's gain just a stopping rule? | the plain+stop arm (team B's control) |

A change to v5 is then judged by running the same frozen tasks again and comparing the v5 arm
with its earlier batch, paired per task (§9).

## 2. Tasks: mined from the repository's own work

`mine.py` reads every ticket under `spec/tickets/` on `origin/main` (1,310 at the time of the
first run) and every commit reachable from `origin/main`. Every hand in this tree, the verbs
included, writes commit subjects as `<ticket>: <what>`, so a commit belongs to a ticket by its
subject prefix.

A ticket becomes a candidate when all of these hold:

1. It is closed with `reason: done`, and it is not a group (`process: group`).
2. Its own commits, after the bookkeeping that may come before the work (the mint, `opens`,
   `skips design/owner-read`, `takes <route> again`, each touching ticket files only), form one
   unbroken run along first parents, ending on its `closes done` commit. Unbroken means every
   commit on that line is the ticket's own, or touches ticket files only; no merge sits inside,
   and no commit of another ticket that touches code. (A standard-route ticket whose code was
   done by child tickets fails this, by design: its unit is not the ticket.)
3. `base` = the parent of the first work commit; `solution` = the closing commit. Starting the
   run at the first non-bookkeeping commit puts the base *before* `passes design/draft`, so the
   approach a draft writes into the ticket is never in the agent's tree.
4. The run changes non-test code and at least one test file.
5. The ask: the ticket's `# Ask` section as it stood at `base` (every kept task had its ticket
   file at base; a ticket minted inside its own run is dropped).

`bench.py mine` then narrows to what the frozen set uses:

- Go test files only (`*_test.go`, `testdata/`): the JavaScript era's tests need its own runner;
- no change to the harness surface (`.claude/`, `AGENTS.md`, `.githooks/`), so the plain arm,
  which runs with those files inert, can reach every file the solution reaches;
- at most 250 changed non-test code lines (the original work took minutes to an hour);
- `base` on or after 2026-10-04: the work verbs run in Go from that day, so the v5 setup below
  (mint, `branch open`, `cloud prompt`, `branch take`, `ticket pull`) runs the same way on every
  base. Earlier bases carry a node-era harness the current client and these verbs do not drive.

## 3. Graders, and the flake control

`validate.py` builds three trees per candidate from a mirror (never the owner's checkout), each a
fresh one-commit repository exactly like the grader's (some tests ask git for the tracked files),
and runs `go test -json -count=1` over the packages the hidden tests live in:

| tree | gives |
|---|---|
| base, with its own tests | what passed before |
| base, with the hidden tests laid on | what the agent starts against |
| solution | what the true change achieves |

- **FAIL_TO_PASS**: tests failing (or not building) on base+hidden and passing on the solution.
- **PASS_TO_PASS**: tests passing on base, on base+hidden and on the solution.
- **Flaky**: a test whose outcome differs between reps of one tree. It grades nothing.

Every candidate ran once to select the set; every task that was run then ran three times more
(`--reps 3`, `data/validation-3rep.jsonl`), and `refresh_graders.py` laid those lists onto
`tasks.jsonl` without touching anything an agent sees. Of the first fourteen tasks, the three-rep
lists matched the one-rep lists on thirteen; one PASS_TO_PASS test came out flaky and left. A task
is kept when FAIL_TO_PASS is not empty and the base builds. A test the solution leaves red stays
out of both lists.

**Hidden grade of a run.** The agent's final tree (committed or not, untracked files included;
for v5 the work branch's tip where the session ended elsewhere) is saved as `final.patch` against
the tree the agent started from. The grade applies that patch to the base, leaving out ticket
files (v5's bookkeeping sits on setup commits the base lacks), then in every hidden package the
test files go back to the base's (the agent's own test files there are dropped, so a duplicate
test name cannot break the build), the hidden tests are laid on, and the whole tree is committed
once. Pass = every FAIL_TO_PASS and every PASS_TO_PASS test passes. Grading from the published
patch means anyone can grade a run again (`grade.py --regrade-hidden`). Both measured batches
were graded that way after their sessions; the patch grade agreed with the grade taken as each
run finished on 50 of 51 runs, and the one difference was the early grader's (a tree without a
git repository, where some tests ask git for the tracked files; fixed before the regrade).

**Full check of a run.** `./RUNME.sh check` on the agent's final tree as it left it, installed
the way CI installs it (claude-code 2.1.291 on `PATH` for the types and plugin parts, stdin
closed), compared with the same check on the base (cached per task). The base check is green on
every task where it was measured, so `check green` reads directly. The check runs on every
hidden-pass run (`grade.py --check pass`; `all` adds the rest), after the sessions, one at a
time on the idle machine (`grade.py --checks-only`).

The check has its own flakes, and they follow load: its Vale rules give up after two seconds and
its git helpers carry a wait bound. The first checks, run beside a live session at a load
average near 25, came out red on exactly those (`VoiceParagraph.Vocabulary: did not finish within
2s`, `exec: WaitDelay expired`) for trees that were fine. So a red check is run again, up to three
attempts: the run counts green if any attempt is green, and its red parts are the parts red in
every attempt. Every attempt is kept in `grade.json` with the load it started at, the lines that
made it red (the check's own list of red cases, lint findings, failed tests, build errors, steps
that timed out) and whether a timeout was among them.

## 4. Fairness: interface notes and a screen

Two kinds of task come out of validation:

| kind | what it means | what the agent gets |
|---|---|---|
| behavioral | the hidden tests build against the base: they call only what already stands | the ask |
| interface | the hidden tests call a name the solution adds or changes (they do not build on the base) | the ask, plus an interface note |

An interface note lists, as signatures without bodies, every declaration the solution adds or
changes that the hidden tests mention (`select_tasks.py`, with the `sigs/` helper over
`go/parser`). Without it a correct change under another name fails the build; with it, no arm
guesses a name. Every arm gets the same note: plain in its prompt, v5 inside the ticket's ask.
This follows SWE-bench Pro's interface specifications. Notes over 2,500 characters drop the task.

One gap, found while the first batch ran: the frozen set's notes print a constant as
`const HandOfItsOwn`, without its value, and six of the sixty tasks have one. Where a hidden test
reads the constant's text, an agent that names the constant right but words it differently still
fails. The `sigs` helper now prints a constant's value; `tasks.jsonl` was left as frozen, so the
batches stay comparable, and a newly mined set gets the values.

`verify.py` then screens each task the way SWE-bench Verified screened its issues (OpenAI,
2024): a model reader (Opus, no tools, one call per task, cost logged) sees the ask, the note,
the hidden test diff and the reference change, and rates *spec* (can the ask be followed to a
passing change, 0–3) and *tests* (do the tests check what the ask asks, 0–3). A task is
*verified* at spec ≤ 1 and tests ≤ 1. The screen only labels; RESULTS.md gives every number on
all tasks and on the verified subset, so a reader can see whether the label moves anything.

## 5. Leakage controls

| route the answer could take | control |
|---|---|
| the answer in the tree | the base precedes every commit of the ticket's work, the draft included (§2.3); later spec notes do not exist at the base |
| git objects reachable from the checkout | each run's origin is a fresh repository holding one commit: the base tree (plus v5's setup commits). No history, no other refs, no packs from the mirror |
| the hidden tests | they are the solution's test files; the base carries the old versions, or none |
| the network | no WebFetch or WebSearch tool; GitHub URLs rewritten to an invalid host in the run's git config; the parent session's `gh` client and GitHub tokens stripped from the environment; every tool input scanned for the upstream's name and GitHub hosts (`leak_flags` per run, reported) |
| the filesystem | every session runs in private mount and PID namespaces (`sandbox.sh`): an empty tmpfs covers the scratchpads (the mirror with full history, the task files, every report), the owner's checkout at `/home/user/quackitect`, the parent session's transcripts and config, and every other run of the batch. The agent's `pgrep` and `pkill` see its own processes alone. PID 1 of the namespace is `reaper.py`, which reaps orphans as an init does: without it, a stopped index server lingers as a zombie and the repository's own contract test ("a stopped index leaves no se-index process") fails for a reason no real box has |
| memory across runs | each run has its own `HOME` and `CLAUDE_CONFIG_DIR`; nothing persists between runs |
| secrets in the published files | `scrub.py --fix` replaces e-mail addresses and the values of the session's id, account and token variables before every push (the repository's own tests print the box's session id into test output), and `publish.sh` refuses to push on any hit left |

The pilot found the filesystem route was real: an unsandboxed agent wrote files two levels up
its tree, into the folder that held the mirror, and a plain agent's `pgrep -f "RUNME.sh check"`
waited on another run's check. Both are closed by the sandbox. Batches before the sandbox
(the first probe) are excluded from every table.

## 6. Arms

Same in every arm: Claude Code 2.1.296 headless (`claude -p`, stream-json with hook events);
model pinned (§6.1); tools `Bash Read Edit Write Glob Grep Task Skill ToolSearch` (no web);
permission mode `acceptEdits` with those tools allowed and nobody to answer a prompt
(`--permission-prompts none`; root rules out bypass mode); `CLAUDE_CODE_REMOTE=true` (every
arm is an unattended cloud box); the repository installed as a developer's box would be
(`./RUNME.sh` runs `install.sh`: Go modules, the index binary, Biome, Vale, the plugin
manifest); the same wall-clock cap; git identity `Claude`.

| arm | harness | prompt |
|---|---|---|
| **plain** | untrusted workspace and user settings only (`--setting-sources user`): no level0 plugin, no project hooks, no output style, no project skills or commands, no `AGENTS.md`, no git hooks (`core.hooksPath` unset, and `SE_INSTALL_SKIP` names `git-hooks`, because every `./RUNME.sh` verb runs `install.sh` first and the install would point git at `.githooks` again). The files stay in the tree, inert, so the tree matches the other arms | the ask (comments stripped) + the interface note + "Make this change in the repository ... (a Go project; `go test ./...` runs the Go tests and `./RUNME.sh check` runs the repository's full check). Add or update tests for the change, and commit your work on the current branch when you are done." |
| **plain+stop** | as plain | plain's prompt + team B's stopping rule: "Stop rule: as soon as tests cover every point of the ask and all pass, commit, and end your reply with the line TASK COMPLETE. Do not refactor or polish working code. Commit before every risky change." |
| **v5** | the workspace trusted, project settings loaded (`--setting-sources project`): level0 plugin (`level0@skills-dir`: the doors on every write and command, the MCP pull tools, the stop hook, the canary), the SessionStart/Stop/SessionEnd hooks, the `level0` output style, `AGENTS.md`, the work and dispatch skills, the git hooks | the box prompt `./RUNME.sh cloud prompt <group>` prints ("run the work skill", the group, its child, its route, the box rules) |

**v5's setup, as the owner and the dispatcher do it.** In a seed clone of the base, from a desk
(no `CLAUDE_CODE_REMOTE`), with the tree's own verbs: `ticket set <ticket> group the-bench-work`;
`mint ticket spec/tickets/the-bench-work.md --process=group --goal=<the ask>`; `ticket open
the-bench-work`; push `main`; `branch open the-bench-work` (pushes `work/the-bench-work` and the
marker on `main`); `cloud prompt the-bench-work`. The task's ticket keeps its own route (trivial
or standard) as it stood at the base; the interface note, where there is one, is appended to its
ask. The agent's box then clones the origin and starts on `main`, as a fired routine does.

Bases before 2026-10-06 predate two of those verbs' current forms: their `mint` takes no
`--goal` (the group's goal goes in as `--Ask`), and `cloud prompt` does not exist (the box prompt
is then the same text `cloud prompt` prints on later trees). `dryseed.py` ran this setup for all
sixty tasks without an agent; all sixty came up with the group open and `work/the-bench-work` on
origin (`data/v5-setup-dryrun*.jsonl`).

The work skill's last steps (open a pull request through the GitHub connector, subscribe to its
activity) cannot run here: there is no GitHub. A session that ends on that is not counted as
needing the owner.

### 6.1 One model

The agent runs on `--model`. Its subagents too:

- plain arms: every model alias resolves to the arm's model (`ANTHROPIC_DEFAULT_{HAIKU,SONNET,OPUS}_MODEL`),
  so a Task call naming `opus` still runs on it. `CLAUDE_CODE_SUBAGENT_MODEL` alone does not
  override a named model (measured);
- v5: level0's helper tiers (`helper.find/change/decide`; the shipped defaults are haiku/opus/opus)
  are set to the arm's model with the tree's own config verb in the box's config layer
  (`./RUNME.sh config helper.<tier> <model>`, as the owner's config commands do; the
  `SE_HELPER_*` variables would do the same, and the pilot showed them leaking into a test of the
  config reader), and level0's own door refuses an `Agent` call naming any other model. The aliases stay unpinned there,
  because the commit door's cold probe starts a client of its own on the client's default model;
  the pilot showed that probe failing its canary check when forced onto Haiku, so pinning it would
  break v5's commit door for a reason the shipped harness never meets.

Every model call a harness makes outside the agent's session (the cold probe, the check's own
client) goes through `claude-meter.sh`, which copies the call's output into the run's folder;
those calls are priced and added to the run's cost (`nested` in `meta.json`). Per-run model mixes
are reported, so any call on another model is visible.

### 6.2 Two runs at a time

The machine has four cores and 15 GB. The repository's own check (`./RUNME.sh check`, which every
arm runs, and v5's commit door runs again) takes about 90 seconds on four idle cores and starts an
index server; its contract and plugin tests carry timing bounds (5-second waits). What the batches
before the measured one taught:

| attempt | what happened | kept? |
|---|---|---|
| three sessions at once, unpinned, beside the validation | load average past 40, checks timing out, timing-bound tests failing, the shared Go build cache filling the disk; agents spent turns on those reds | no: `results/_excluded/haiku-main-contended` |
| two sessions, each pinned to two cores | no cross-talk, but on two cores the plugin tests run past their 5-second bound (7.3 s seen), and v5, which must green the check, chased that red until its cap | no: `results/_excluded/haiku-1-pinned` |
| plain arms before the `git-hooks` skip | `./RUNME.sh` re-installed v5's git hooks under the plain agent | no: `results/_excluded/haiku-1-githooks` |
| **two sessions at once, unpinned (four shared cores)** | a session waiting on the model leaves the cores to the other; both checking at once is the worst case | **the measured batches** |

So the measured batches run two sessions at a time: the Haiku batch ran two of its own at once
(the arms of a task back to back, in a shuffled order, so they share the hour and the load) until
the Sonnet batch started, and from then on one Haiku and one Sonnet session ran side by side.
Hidden grading runs at `nice 19` in the sessions' idle time; the full checks wait for the idle
machine after the sessions (`grade.py --checks-only`), one at a time; and a janitor empties the
shared Go build cache below 8 GB free. The runs are isolated in state (own tree, origin,
HOME, config, TMPDIR, mount and PID namespace; index servers on random ports; the Go cache is
content-addressed and safe to share). What they share is CPU and disk, which is why parallelism
stops at two. Wall-clock carries that noise; every arm meets it alike.

### 6.3 Caps

One session per run, killed at the wall-clock cap (an interrupt first, so the client can still
write its result; cost is otherwise rebuilt from per-message usage and flagged as estimated). No
turn cap and no budget cap: the question includes how long each arm runs when nobody stops it.

## 7. Metrics, per run

| metric | definition |
|---|---|
| resolved | the hidden grade passes (§3) |
| check green | `./RUNME.sh check` exits 0 on the agent's final tree, in any of up to three attempts on the idle machine (§3) |
| cost | the session's `total_cost_usd` (the client's list-price accounting, subagents included) + metered nested calls. Per million tokens (input, output, cache write, cache read): Haiku 5.5 $0.10, $0.50, $0.20, $0.01; Sonnet 5.5 $2, $10, $4, $0.20, each read back exactly off the client's own `costUSD` |
| tokens | input, output, cache read, cache write, from the stream |
| wall-clock | session start to end, setup excluded |
| turns, tool calls | assistant messages of the main thread; tool calls of all threads |
| files outside scope | changed files (tickets and `.se/` left out) whose directory the true change never touched; reported for all files and for non-test code |
| needs owner | the session ended on a question, on a level0 stop reason that hands the step to the owner (`the-owner-holds-the-step`, `a-wrong-answer-leaves-the-box`), at the cap, with an error, or with no code change |
| harness events | stop-hook blocks (a "Stop hook feedback" turn), door refusals (an errored tool call carrying level zero's words: "names no ticket", "Level zero refuses", "The engine asks"...), ticket files written, commits; for v5 also where the task's ticket and the group stood at the end (`v5state.py`), and the share of cost, time and turns spent on tickets other than the task's and the group's, each call put on the ticket it names (`growth.py`) |

## 8. Statistics

- **Paired by task.** Every comparison takes the same tasks in both arms. With several seeds, a
  task's value is its mean over seeds and the task is the unit.
- **Resolve rate:** the mean paired difference, a 95% cluster-bootstrap CI over tasks (10,000
  resamples), and a sign-flip permutation p (exact up to 16 tasks). McNemar's exact test on seed
  1 as a second view.
- **Cost, wall-clock, turns:** the per-task log ratio; its mean back-transformed (a geometric
  mean ratio) with a bootstrap CI and a sign-flip p.
- **Power.** For a paired binary outcome, McNemar's sample size (Connor, 1987) is
  n = (z₀.₀₂₅·√p_d + z₀.₂·√(p_d − δ²))² / δ², where p_d is the share of discordant pairs and δ
  the difference in pass rates. The prior work saw almost no discordance (B: 191 chains, C: 7/7 vs
  7/7), which makes a large effect easy to see and a small one invisible. Planning numbers, at
  α = 0.05 and 80% power:

  | discordant share p_d | tasks to detect δ = 10 pts | 15 pts | 20 pts | 30 pts |
  |---|---|---|---|---|
  | 0.2 | 155 | 68 | 37 | 15 |
  | 0.3 | 234 | 103 | 57 | 24 |
  | 0.4 | 312 | 138 | 77 | 33 |

  The frozen set (§2) holds what the repository's recent history gives under the rules, a few
  dozen tasks, so this benchmark detects a large difference in resolve rate (about 20 to 30
  points at the full set, depending on the discordance the runs show) and any cost difference
  of the size B and C saw (2–4×): the log cost ratio's spread across tasks is small next to
  log 2.

  At the samples actually run, solving the same formula for δ: twelve paired tasks with the
  discordance Haiku showed between plain and v5 (p_d = 0.33) detect δ ≈ 42 points (33 at
  p_d = 0.2, 46 at 0.4); five tasks detect δ ≈ 56 points at p_d = 0.33 and 75 at the 0.6
  Sonnet's plain and v5 showed. Only a very large difference in resolve rate could show at this
  n; cost and time differences of 2× or more show easily.

## 9. Running it again

Everything runs from this folder. The mirror of the repository lives at `../bw/qk` (override
with `BENCH_WORK`); runs live under `/tmp/qb`, never in the owner's checkout.

**One command, the frozen set:**

    python3 bench.py run --name <batch> [--model haiku] [--arms plain,v5,plain+stop] [--seeds 1] [--jobs 2]

It fetches the mirror, installs the pinned check client, runs every task of `tasks.jsonl` in
every arm (task by task in the file's order, best-specified first, the arms of a task in a
shuffled order, two sessions at a time, 45-minute cap), grades the hidden tests as runs finish,
then runs the full checks one at a time on the idle machine (up to three attempts while red),
records where each v5 run left its tickets, deletes the scratch trees, and writes
`results/<batch>/REPORT.md` (the tables of RESULTS.md, for that batch). A stopped batch resumes:
finished runs are skipped. `--only t1,t2` runs a subset. `results_md.py --batch results/<a>
--batch results/<b>` rebuilds the generated half of RESULTS.md (tables per batch and subset,
per-run notes, the cost log); `activity.py`, `growth.py` and `v5state.py` give the tables of
"What v5 does with the time and money".

**A change against its baseline.** The v5 arm runs the harness that stands *at each task's
base*, so a change to v5 reaches the frozen tasks only where it lands at the base. Two ways:

1. *New tasks after the change.* `python3 bench.py mine --since <date of the change> --name <set>`
   mines, validates (3 reps) and screens tasks whose bases carry the change, into
   `tasks-<set>.jsonl`. Run all three arms on it (`bench.py run --tasks tasks-<set>.jsonl ...`).
   The plain arms are the control for how hard the new tasks are: compare v5's gap over plain on
   the new set with its gap on the frozen set (a difference in differences).
2. *The same tasks, another batch.* `python3 bench.py compare --baseline <batch A> --candidate
   <batch B> --arm v5` pairs one arm across two batches by task (e.g. a re-run after a client or
   model change, or a run with `--model sonnet`).

Keep a batch's `batch.json`: it records the client version, model, arms, caps and tool list,
and `costlog.jsonl` records every call's cost.

## 10. Files

| file | what it does |
|---|---|
| `bench.py` | the one command: `run`, `compare`, `mine` |
| `mine.py` | candidates from the history (§2) |
| `validate.py`, `gotest.py` | FAIL_TO_PASS / PASS_TO_PASS / flaky, in temporary worktrees (§3) |
| `select_tasks.py`, `sigs/` | `tasks.jsonl`, task kinds and interface notes (§4) |
| `verify.py` | the Verified-style screen (§4) → `verdicts.jsonl` |
| `arms.py` | seeding the origin per arm, the v5 setup, the session (§6) |
| `sandbox.sh` | the mount and PID namespaces (§5) |
| `claude-meter.sh` | the metered client the harness's own calls meet (§6.1) |
| `run.py` | a batch of sessions, resumable; the cost log |
| `transcript.py` | stream-json → the run's numbers |
| `grade.py` | hidden grade, check, scope (§3, §7) |
| `report.py`, `stats.py` | tables and paired statistics (§8) |
| `results_md.py`, `notes.py`, `checks.py`, `costs.py` | the generated half of RESULTS.md: tables, per-run notes, the full checks, the cost log |
| `activity.py`, `growth.py`, `v5state.py` | where tool calls went by kind; the share of a v5 session spent on tickets outside the task; where each v5 run left the task's ticket and the group |
| `dryseed.py` | the v5 setup on every task without an agent (§6) |
| `refresh_graders.py`, `refold.py` | lay three-rep grader lists onto `tasks.jsonl`; fold transcripts again after `transcript.py` changes |
| `reaper.py`, `janitor.sh`, `stop.py`, `peek.py` | the sandbox's init; keeping the disk; stopping a batch; a look at a live run |
| `scrub.py`, `publish.sh` | redaction before every push; the push to `bench/2026-10-10` (no force) |
| `tasks.jsonl` | the frozen task set |
| `verdicts.jsonl` | the screen's labels |
| `results/<batch>/` | `batch.json`, `run.log`, `grade.log`, `costlog.jsonl`, `growth.json`, and per run `meta.json`, `grade.json` (hidden grade, check attempts, scope), `prompt.txt`, `final.patch` (gzipped past 5 MB), `transcript.jsonl.gz`, and for v5 `v5state.json` |
| `results/_excluded/` | the batches §6.2 set aside, each with its `WHY.txt` |
| `data/` | the mining, validation and v5-setup dry-run outputs (`publish.sh` copies them in) |
| `costlog.jsonl` | every model call this benchmark paid for, across batches |

## 11. Threats to validity

- **Small n.** A few dozen tasks detect only large resolve-rate differences (§8). Cost and time
  differences of the size the clean rooms saw are well within reach.
- **Task shape.** Mined tasks are tickets one session closed in minutes: small, well-scoped,
  with tests. That is v5's commonest unit of work, but not the long, multi-session work its
  leases, handovers and rescue branches exist for. Nothing here injects a crash, a compaction
  or an owner's answer.
- **The harness is the code under change.** The tasks are changes to quackitect itself, so the
  v5 arm meets its own doors and verbs while it changes them, and the plain arm can read the
  same guidance files without being handed them.
- **One machine, four cores.** Agents run the repository's check (about 90 seconds on an idle
  machine) and the v5 arm runs an index server; runs share the cores, so wall-clock carries
  contention noise, spread evenly across arms by interleaving.
- **Model-sensitive harness parts.** v5's commit door runs a cold probe on the client's default
  model (Sonnet here); on another default it may behave differently.
- **The ask as the owner wrote it** is terse and in the tree's own vocabulary. The interface
  notes and the screen address fairness to all arms, not realism.
