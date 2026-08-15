---
id: cloud-agent-handover
statement: Everything an agent on a fresh Linux machine needs to bring this system up and run one iteration unattended.
---

# Handover for the cloud agent

Written 2026-08-12. You are on a machine that has never run this before,
probably Linux, and probably headless. Read this whole file first. It is
short on purpose.

---

## 1. What this system is

This repository is **quackitect**: a harness that drives engineering work
through a state machine and keeps an auditable record of every decision.

It is NOT a chatbot wrapper. It is a machine you WALK. The machine decides
what happens next; you do that and ask again.

Three things make it what it is.

**A STATE MACHINE DRIVES THE WORK.** Work happens by moving through drawn
states. Each state says what it wants, which tools are legal in it, and what
evidence it needs before the walk moves on.

**EVERY TOOL GOES THROUGH ONE LANE.** You do not read, write, search or run
anything with your own native tools. An MCP server called `se` replaces all of
them, and every call is logged.

**A PERSON ADJUDICATES THE GATES.** The agent fills evidence. Gates are where
a human decides. How much you may do alone is set by a dial.

---

## 2. The one rule

**EVERYTHING RUNS THROUGH THE `se` MCP SERVER.**

Your native tools are blocked by an explicit deny list. That is deliberate and
it is not an obstacle to route around. The lane replaces every one of them:

| you would reach for | use instead |
| --- | --- |
| Read | `se_file_read` |
| Write | `se_file_write` |
| Edit | `se_file_patch` |
| Glob | `se_file_glob` |
| Grep | `se_file_search` |
| Bash | `se_run` |
| git | `se_git` |
| WebFetch | `se_web_fetch` |

Paths are **root-relative to the project root**, which is the parent of the
folder you open. You open `project/`, so a path you pass starts `project/`.

If a call is refused you get a typed rejection carrying the clause, what was
expected, what it got, and **an executable remedy — the exact call to make
instead**. Follow the remedy. Recover in one turn. Never work around a refusal
with another lane.

---

## 3. Bring it up on Linux

### 3.1 What must already exist

- **git**
- **Node.js 24 or newer.** The engine runs TypeScript files directly, with no
  flag, so it needs the version where that is the default. `package.json`
  declares `>=24.0.0` and the entrypoint reads that declaration rather than
  carrying a copy of it.

  An earlier version of this page said 22.6. That is the version where type
  stripping became possible behind a flag, which is not the same thing, and a
  host landing on 22.x would pass the check and then die inside a spawned
  script.

### 3.2 Install

```
git clone <this repo>
cd <repo>/project/deliverable
npm install
```

**IF `npm install` FAILS, IT WILL BE A NATIVE MODULE.** Three dependencies
build native code: `@lydell/node-pty`, `@parcel/watcher`, `@vscode/ripgrep`.
They normally ship prebuilds. If yours does not, install build tools first —
on Debian or Ubuntu that is `python3`, `make` and `g++`.

`@vscode/ripgrep` is the search lane. Without it `se_file_search` will not
work, so do not skip past a failure there.

### 3.3 Start the server

From `project/deliverable`:

```
npm run serve
```

That runs `node engine/bin/se-mcp.ts --root ../..` and serves MCP over HTTP at
`http://localhost:7333/mcp`. Leave it running.

### 3.4 Place the cage

**A FRESH CLONE HAS NO CAGE.** The config files are gitignored because a
running editor normally writes them. On a headless box you place them
yourself, from the committed source at `project/deliverable/cage/`.

Into the folder you open — that is `project/`:

- `cage/mcp-http.json` → `.mcp.json`
- `cage/claude-settings.json` → `.claude/settings.json`

The settings file is what denies your native tools and allows `mcp__se__*`. It
also sets the output style and installs two session hooks. **Place it. Running
without it means running uncaged, which this system does not support.**

If your harness is not Claude Code, `cage/copilot-cage.json` and
`cage/copilot-mcp-config.json` are the equivalents for GitHub Copilot CLI.

### 3.5 What you do NOT have to place

`project/CLAUDE.md` and `project/AGENTS.md` are **committed and already in the
clone**. They carry the contract, the walk, the lane and the voice — the four
documents that bind every turn. Preflight refuses to boot if what is placed is
not the projection of `project/guidance/`, so if boot complains about the
prompt layer, something rewrote those files and you should stop and say so.

---

## 4. How to walk

**ONE VERB DRIVES EVERYTHING: `se_pull`.**

Pull. Do what comes back. Pull again. There is nothing else to learn.

Your **first call is `se_pull` with no payload**. It answers with one of five
instructions, and the answer names which one you got:

- **`read`** — a document rides along in `document`, and `prove` names its LAST
  WORDS. Read it, then pull again with `form: {"read": "<those words>"}`. Keep
  going until no `read` comes back.
- **`fill`** — the machine built a form. Fill it and return it on the next pull
  as `form: {...}`. **A form you mean to finish carries `submit: true`.** Without
  it the fields save and nothing signs, and the same form comes back looking
  untouched.
- **`choose`** — the road splits. Answer `form: {"choice": "<to>"}`, and only
  when a goal actually needs that door.
- **`do`** — the machine walked for you. Do what the guidance says, pull again.
- **`wait`** — out of work, or the next step outweighs the dial. Stop and say
  which step waits.

**BLOCKING IS AN INSTRUCTION, NOT AN ERROR.** A threshold or an unmet condition
comes back as an answer, not a throw.

Keep boot calls **serial**. Do not batch parallel reads.

**NARRATION RIDES THE WORK.** Most calls take an `update` field carrying a
decision-graph op — `plan` to start a checklist, `update` to say what you are
doing on an item, `done` to close one. Briefs are ONE line under 90 characters.
Resolve something at least every five updates or the next update is refused.

---

## 5. Your job

**Run iteration `i8-se-help-a-logged-keyword-search-over-the`.**

Its branch `it/i8-se-help-a-logged-keyword-search-over-the` is already pushed.
**Entering it claims it** — a claim already held refuses and names the holder,
so nothing else can take it while you have it.

### What it builds

`se.help`: a logged keyword search over the lane's tools and guidance, where
**every MISS is recorded as a ranked missing-tool demand**.

The demand log is the half that matters. Today a retro asks a person to hand-
mine the shell log for missing verbs. This produces that list mechanically.

### Where the full brief is

- **The iteration's own record** carries the goal, the vision and the inputs.
  The walk serves it to you at M0.
- **`project/spec/version-planning.md`** carries everything else: every
  decision taken, what was harvested from earlier versions, and what each
  planned iteration is. It is committed and self-contained.

**Do not go looking in old versions for planning.** They are mined and the
result is in that file. Reading old *code* to see how something was
implemented is fine and encouraged — `se_file_read` takes a `ref`, and `main`
reaches version 1.

### First checkpoint, before anything else

Call `se_survey`. **Confirm the iteration list includes i8.** A fresh clone has
no local worktrees, and iterations are meant to be discovered from their pushed
branches. If i8 is not listed, STOP and report that — do not improvise a
worktree.

---

## 6. The gate, and how far you may go

The iteration stands at **M0**. A retro onboards, then a **kickoff gate**
proposes a change size.

**A GATE NORMALLY NEEDS A PERSON.** Whether you may bless your own is set by
the autonomy dial. At a high dial you may, and the record keeps the fact that
you did. At a lower dial the pull answers `wait`, and that is correct — say
which step waits and stop.

**DO NOT TREAT A GATE AS AN OBSTACLE.** If it waits, it waits.

You are running unattended, so nobody will answer mid-run. That is expected.
Walk as far as the dial allows and stop cleanly.

---

## 7. When something goes wrong

**A REFUSAL IS NOT A WALL.** Read the remedy and make that exact call.

**A STRAY IS A NOTE.** An idea, a bug, a better way — capture it with `se_note`
and keep walking. Never leave the state you are in to chase one.

**BEING STUCK IS AN ESCAPE.** If no answer could let the walk continue from
where you stand, call `se_pull {escape: "<why>"}`. It lands at the front desk
and the reason is the whole record. A QUESTION IS NOT AN ESCAPE — if you are
merely waiting on an answer, stay where you are and stop.

**TESTS ANSWER A QUESTION.** Run scoped tests for what you changed. The full
battery is earned, not routine, and the lane enforces that. A red is understood
and fixed properly.

**THE MACHINE COMMITS, NOT YOU.** Never ask whether something needs
committing. A dirty tree is not a loose end.

---

## 8. What not to do

- Do not use your native tools. They are denied for a reason.
- Do not open a record nobody asked you to open.
- Do not take an offered door just because it is offered.
- Do not remove or weaken a check to make something pass.
- Do not write personal data into anything recorded. Use the role — the owner,
  the maintainer, the driving agent.
- Do not put binaries under `project/`. A figure is authored as inline SVG,
  Mermaid or ASCII. The scratchpad is the one exception and it is gitignored.

---

## 9. What you must write down before you stop

THIS RUN IS TWO THINGS AT ONCE. It builds se.help, and it is the FIRST TIME THIS SYSTEM HAS EVER RUN ON ANOTHER MACHINE, unattended, on Linux. The second is worth as much as the first, and only you can record it.

WRITE IT INTO THE RECORD, NEVER INTO A NOTE. `se_note` captures strays, but notes are machine-local and gitignored — nothing you put in one reaches anybody else. Anything that must survive goes in a FILE under the iteration's own folder, which travels with the branch when it lands.

Write `field-report.md` in the record's folder and commit it. Cover the five things below.

### 9.1 The bootstrap, step by step

Section 3 of this file is a GUESS. It was written on a Windows machine by an agent who could not test it. YOU ARE THE TEST.

For every step: did it work, what did it actually need, what did you type.

- Which Node version, and whether running a .ts file worked without a flag.
- Whether `npm install` succeeded. If not, which package failed and what you installed to fix it.
- Whether `@vscode/ripgrep` gave you a working `se_file_search`.
- Whether the server came up on 7333 and your harness reached it.
- Which cage files you placed, and where.
- ANYTHING IN SECTION 3 THAT IS WRONG. Say so plainly. That is the most valuable line you can write.

WHY THIS MATTERS BEYOND YOUR RUN: version 1 of this system shipped a `runme.sh` beside its PowerShell script precisely so the package could run headless in a pipeline. This version ships only the PowerShell one. YOUR TRANSCRIPT IS THE SPECIFICATION FOR THE MISSING SCRIPT. Write it so somebody can turn it into one without guessing.

### 9.2 The register entries this run probes

Several recorded assumptions are about exactly what you just did. Nobody has ever tested them. Name each one and say what your run showed.

- `raid-lane-works-on-posix` — the lane works on POSIX. You are its first probe.
- `raid-asm-peer-runs-supported-platform` — a peer machine runs a supported platform.
- `raid-asm-remote-serializes-claims` — the remote serialises claims. Did claiming i8 behave, and would a second machine have been refused?
- `raid-dep-claim-push-credentials` — the claim lane pushes. Did your box have credentials, and did the push land?
- `raid-harness-half-life` — how much of the harness assumption survived contact with a different host.

For each: HELD, BROKE, or NOT EXERCISED. Give the evidence, not an impression. NOT EXERCISED is a real and useful answer.

DO NOT EDIT THE REGISTER ENTRIES YOURSELF. They live on trunk and are swept at a retro. Name them, state what you saw, and let the landing apply it.

### 9.3 Whether unattended actually worked

This is the question the whole experiment exists to answer.

- How far did the walk get before it stopped.
- What stopped it: a gate, the dial, a refusal, or a real failure.
- Did anything need a person that should not have.
- Did anything let you through that SHOULD have needed a person. That one is a defect and it matters more than the rest.
- How many turns you spent, roughly, and where the time went.

### 9.4 What the lane cost you

Every call is logged, so the numbers are already there — use `se_log_query` with `group_by: "tool"` rather than counting by hand.

- Which verb you reached for most.
- How many `se_run` calls you made, and what each was for. EVERY SHELL COMMAND IS A CANDIDATE SIGN OF A MISSING LANE VERB, and naming the verb is the point.
- Which refusals fired, how often, and whether the remedy actually recovered you in one turn.
- Anything you wanted to do and could not.

That last list is the demand log you are building, arriving from your own run. Put it in the report as well as in the feature.

### 9.5 The ordinary close

When you stop — finished, gated, or stuck — say plainly, in a short message:

- **Where you stand.** The state the walk is in.
- **Why you stopped.** The pull's own answer says which of the three it is.
- **What you built**, and what proves it. Name the test that ran and its result.
- **What you left undone**, and why.

Do not claim something works that you did not verify. If tests failed, say so
and show the output. If a step was skipped, say that.

The call log holds everything you did, so the next session can reconstruct the
run without you.

### 9.6 Commit it yourself

The field report is RECORD CONTENT — it belongs to this iteration and lives
under its folder, so writing it is exactly what a bound walk is for.

Commit it with the work. `se_git` covers the allowlist you need. If a commit is
not legal where you stand, that is the machine holding that job, not an
obstacle — say so in your closing message and leave the file written.

A REPORT NOBODY CAN FIND IS NOT A REPORT. It lands on the branch, so whoever
reviews i8 gets it whether or not anybody thinks to ask.

---

## 10. If it all goes wrong

If you cannot bring the system up at all, that is still a result and it is
still worth the trip.

Write the bootstrap findings anyway — to a plain file in the repository, or
failing that into your closing message. Say exactly where it broke and what you
tried. A failed first cloud run that names its wall is worth more than a
successful one that says nothing.

Do not force it. Do not disable a check to get past it. Do not run uncaged
because the cage would not place.

Stop, report, and stop cleanly.
