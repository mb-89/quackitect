# A Claude Code mod UI

| question | answer |
|---|---|
| Can a mod be a good UI for the harness? | Yes, as a complement: the in-session view, on every surface the session reaches. Keep the VS Code sidebar for what needs an editor or a text field. |
| Which surfaces render it? | The kit draws the pane and the band on terminal, desktop, VS Code and mobile. The live check in this cloud session is under [Live in this session](#live-in-this-session). |
| Does it work in a cloud session? | Yes. The mod runs in the container, reads the index over loopback, and draws on whatever client attaches. |
| Latency? | 1 to 20 ms a read with the mod alone. With level0 loaded, the same read stalls for seconds while the agent works. |
| What can a mod not do? | Stream through its own fetch, take text on mobile, size its own pane, or sleep past a short hook budget. The full list is under [Limits](#what-a-mod-cannot-do). |
| Does it work beside level0? | No drawing conflict. With level0 loaded, the mod's reads stall while the agent works. |
| What does the owner consent to? | Hot reload, one question a session, and only for a mod the agent writes mid-session. A mod checked in under `.claude/skills/<name>` loads like level0, and the client asks nothing. |

- The prototype `quack-work` draws the queue, the work tree, the current ticket and step, and the log. It shows these as a docked pane, a band above the prompt and a status line.
- It holds no work logic. It reads index values over `/v1` and calls the `work/pull` action, the same ones the TUI and the sidebar read.
- Recommendation: build it as a complement, checked in as `.claude/skills/quack-work`. First, give the index a narrow value, and find what blocks the shared hooks host in a turn.

## What the spike builds

| file | what it is |
|---|---|
| `quack-work/.claude-plugin/plugin.json` | the manifest |
| `quack-work/hooks/register.tsx` | the hooks module: pane, band, status line, commands, a refresh timer |
| `quack-work/types/index.d.ts` | the `$.state` contract |
| `quack-work/tests/quack.test.ts` | the pane, the pull and the band on all four surfaces |
| `quack-work/tests/render.test.ts`, `fixture.ts` | the text renders below, drawn from a snapshot of the live index |

What the mod reads, and from where:

| state | source |
|---|---|
| the work tree for the branch | `/v1/values/work/rows`, the value the TUI's work pane reads |
| what waits on the owner | `/v1/values/work/yours`, the sidebar's list |
| the open count | `/v1/values/work/open-tasks` |
| the log rows | `/v1/values/log/rows`, the index's read of `.se/.log/session.jsonl` |
| a ticket's text | `/v1/values/files/<path>` |
| the current ticket | `working` in `.se/.runtime/plan.json`, its step from the matching `work/rows` row |
| "Pull for me" | `POST /v1/actions/work/pull`, the sidebar's action, then the pane shows the ticket it answers |
| the branch | `git branch --show-current` |

The mod's commands and actions:

- `/quack` opens the pane.
- `/quack-show <ticket>` shows one ticket in the pane.
- `/quack-bench` times each read through both routes.
- A press on a row shows that ticket.
- **Pull for me** (`p`) calls `work/pull`.
- The `a` key, `Ask the agent to pull`, fills the prompt with "Pull the next ticket." The owner sends it.
- **Refresh** (`r`) reads every value again.
- **Work** (`w`) on the band opens the pane.

Run it from a checkout: `claude --plugin-dir spike/mod-ui/quack-work`, then `/quack`. Test it: `claude plugin test spike/mod-ui/quack-work`.

## Text renders

The kit's tree, flattened to text by `tests/render.test.ts` over the live snapshot. A `[...]` is a Button. These are the elements the mod hands each surface. Each surface paints them in its own style.

The pane, on terminal and on mobile alike:

```text
spike/mod-ui · 20 open · index 3 ms via fetch
Now mod-ui-spike step decide
Waiting on you
[  the-fleet-routine-stands do q-10]
[  answer-rules-read-one-file do q-9.1]
[  cloud-setup-runs-root-install do q-8]
[  copilot-shell-trial do q-7]
Work tree
[▸ check-notices-leave-the-cap sync 0/7]
[    check-lines-read-as-notices design/owner-read 0/8 you]
[▸ windows-check-holds sync 0/7]
[    doors-walk-reads-clean design/owner-read 0/8 you]
[    quack-build-copies-on-windows design/owner-read 0/8 you]
[· mod-ui-spike decide 0/1]
[· answer-rules-read-one-file do 0/1]
[· cloud-setup-runs-root-install do 0/2 you]
[· copilot-shell-trial do 0/2 you]
[· the-fleet-routine-stands do 1/2 you]
Todos
  build prototype mod
  write REPORT.md and push spike/mod-ui
Log
  18:27:09 context: 2 block(s) reach the session
  18:30:02 agent: Run one Bash command: sleep 40, with the description …
  18:30:10 level0: the canary opens the answer whole
[Pull for me] [Ask the agent to pull] [Refresh] [Hide ticket]
Ticket the-fleet-routine-stands
# the-fleet-routine-stands

The ticket's text, as the index's files value hands it.
```

The band above the prompt:

```text
quack · spike/mod-ui · now mod-ui-spike/decide · 20 open · level0: the canary opens the answer whole  [Work]
```

The status line under the prompt:

```text
quack · 20 open · now mod-ui-spike / decide
```

The spike takes no screenshot. A cloud container has no client of its own, and the kit checks the tree against each surface's element table and paints nothing.

## Surfaces

| surface | draws the pane and band | what it lacks |
|---|---|---|
| terminal | yes, kit-tested | `Svg`, and a pane the mod opens unasked waits below 144 columns |
| desktop | yes, kit-tested | `Raster`, `Image` |
| VS Code | yes, kit-tested | `Client`, `Raster`, `Image` |
| mobile app | yes, kit-tested | `Input`, `Select`, `Client`. It docks no pane, so the pane sits inline above the prompt |
| claude.ai web | unverified | this build's `RenderSurface` names no web surface |

The kit holds each tree to the surface's element table. The kit refuses a tree with an element the surface lacks, and the engine draws its own in its place. The mod draws only `Box`, `Text`, `Button` and `Markdown`, which every surface has, so one tree serves all four.

### Live in this session

The spike copies the mod into this cloud session's mods folder. It loads only if the owner answers the hot-reload question with "Enable for this session". Once loaded, it writes what it sees to `.se/mod-ui/seen.json`. It records the surfaces attached, renders per surface and component, fetch times, and the lag from a state write to a render.

Result: pending the owner's answer. The section below names what it finds once it runs.

A headless session on this box also loads the copy in the mods folder. With that copy and a `--plugin-dir` copy of the same name, the CLI loads one and says so: `another plugin of that name loads first`.

## Latency

The numbers come from `/quack-bench` and from the refresh timer's record, measured in this container, in milliseconds.

| read | shell `curl` | mod alone | mod beside level0 |
|---|---|---|---|
| `work/open-tasks` | about 1 | 1 to 4 | 9 to 9060 |
| `work/yours` | about 1 | 2 to 6 | 6 to 4718 |
| `log/rows` | about 1 | 2 to 3 | 6 to 4951 |
| `work/rows` (about 1 MB) | 2 to 5 | 9 to 20 | 20 to 4900 |
| one full refresh | | 34 | 38 to 60 idle, 1000 to 8000 while the agent works |
| one `$.state` write | | 1 | 6 |

- The index answers in milliseconds, and the stall sits in the host. Fetched through `$.http.fetch` or through `curl` under `$.process.run`, the read stalls alike.
- The stalls come in falling runs, each a few hundred milliseconds shorter than the one before. That is the shape of calls queued behind one blocker that clears. Level0's per-event forwarding during a turn stands as the prime suspect. The spike measures the effect alone, and the cause stays open.
- `work/rows` carries every ticket, the closed ones too, and the mod drops all but the open rows. A narrow value saves the parse and the transfer.

## What a mod cannot do

- **Stream.** `$.http.fetch` resolves once the body is read, so the mod sees none of `/v1/watch`'s server-sent events. The mod polls every five seconds. `$.process.spawn` does stream: `/quack-watch` runs `curl -sN` on `/v1/watch` and reads each event as it comes. The first events reach the mod at 1324 ms, and a later log change arrives on its own.
- **Long hook work.** A hook has a 10 s budget, and a `$.clock.sleep` spends it. The host stops the bench's sleep with `ran past its 10s budget`. Long work goes on a `$.clock.every` timer.
- **Write while drawing.** A render hook reads `$.state` and writes nothing. Writes come from a press or a timer.
- **Keep state across reloads.** A reload runs `register` again from the top. Values live in `$.state`, or in `$.store` to outlast the session.
- **Take text on mobile.** Mobile has no `Input` or `Select`. A ticket mint or a field write needs a text field, so on mobile it goes to the prompt.
- **Place or size panes.** The surface docks or inlines the pane. `rows` and `columns` are wishes, and an unasked open waits below 144 terminal columns.
- **Draw text past caps.** A tree draws its first 100,000 characters. A status line or toast draws 2,000 characters on the terminal and 10,000 remotely.
- **Take every key.** Keys reach a pane while it holds focus. A command key is one digit or lowercase letter.
- **Share the band.** A band hook that answers without `next` hides every band beneath it. Two mods that both want the band need one to yield, as this one yields to a survey.

## Beside level0

- level0 is a plugin of the same kind. The client loads it from `.claude/skills/level0` by default. It hooks session start, prompts, tool calls and turns, and draws nothing. The two mods share no site.
- The stall shows only with level0 loaded, so level0's work during a turn delays the mod's reads by seconds. A shared hooks host fits that. The spike leaves the mechanism open.
- A mod's own `$.fs.write` goes past level0's write door, since the door guards tool calls. This mod writes only `.se/mod-ui/seen.json`, a file git ignores. A real mod keeps to that, and makes every tracked change through a verb.
- A UI fault stays out of level0 when the UI is its own plugin. The host skips a hook that throws, and the session goes on.

## What the owner consents to

| route | what the client asks | when it loads |
|---|---|---|
| written mid-session to the session's mods folder (this spike) | "Enable hot reloading for this session?", once, answered by the person alone, and no permission mode or hook answers it | at the end of the turn, then on each later edit. If the person declines, at the next session start |
| `claude --plugin-dir <folder>` | nothing beyond starting the session with the flag | at start, hot-reloaded while interactive |
| checked in as `.claude/skills/<name>` | nothing: the client adopts the folder, as it adopts level0 | every session on every clone, cloud boxes too |
| `/plugin install` from a marketplace | add the marketplace, pick a scope | at once, then each session in that scope |

## Recommendation

Build it as a complement, checked in as its own plugin at `.claude/skills/quack-work`.

- It is the one UI that reaches a cloud session and the mobile app. The TUI is a window on the owner's machine, and the sidebar lives in VS Code.
- It stays thin. Every value comes from the index, so the mod is a view, like the TUI and the sidebar.
- Keep the sidebar for what needs an editor or a text field: opening files, minting tickets, config.

The cost: a fourth view to keep in step with the index, on an API the types mark early access. It also inherits the hooks host's stalls until somebody finds their cause.

The strongest objection: the TUI already shows all of this, and a mod duplicates it. The answer: the TUI cannot reach a cloud session or a phone, and the mod duplicates no logic. Both draw the same index values, so the index stays the one owner.

The call goes the other way if the stalls trace to the host's design, and level0 holds no part in them. A UI that freezes for seconds whenever the agent works is worse than none.

## What a group holds

1. **The stall's cause.** Reproduce the falling-run stalls with level0 and a bare mod. Find what holds the shared hooks host during a turn, and fix it in level0 or report it upstream. This decides the rest.
2. **A narrow index value.** Add one value the mod reads in a call. It holds open rows, the current ticket and step, and the latest log rows. This replaces the mod's read of `plan.json` and its filter over the whole of `work/rows`.
3. **A push stream.** Run the `/quack-watch` stream from a `session.start` loop, and drop the five-second timer.
4. **Ship the plugin.** Move `quack-work` to `.claude/skills/quack-work`. Open the pane only where `e.viewport.isFullscreen` says it docks, and keep the band and status line everywhere else.
5. **The actions.** Add place and urgent through `/v1/actions`, and hand the agent's pull to the prompt. Each action reaches its verb, as the sidebar's do.
6. **Tests in the check.** `claude plugin test` runs under `./RUNME.sh check`, with the four-surface mount tests.
7. **The owner's pass.** A `view:` row for each surface, with a screenshot from terminal, desktop and the phone.
