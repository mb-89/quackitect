# Overnight run, 3 September 2026

Written for you to read in the morning. Bottom line first, then the detail.

## The one thing to do first

**Stop the engine, then run `.\RUNME.ps1`.** That is the whole fix. It rebuilds by itself.

`.se/runme.json` now names its sources as `src/engine src/viewer src/mcp`. RUNME rebuilds whenever a source file is newer than `.bin\se.exe`. Stopping it first matters, because Windows locks a running binary and the build would fail.

The running binary is build `7f22e1a3.210143`. Much of `src/engine` is modified against that commit. So the engine is not running its own source.

The rebuild will work. I checked it late, after all the night's edits were in: `src/engine`, `src/mcp`, `src/viewer` and `util/setup` each build to a scratch path with exit 0, and `go vet -C src/engine ./...` is clean, so the test files compile too. The engine binary I built runs and answers its version.

That matters because RUNME refuses out loud on a failed build rather than falling back to the old binary. Earlier in the night the package did not compile for about twenty minutes, from other agents' half-landed edits, so this was worth checking last rather than first.

Almost everything below clears when that rebuild lands. Four separate things stop work tonight and all four are already fixed in source and not in the running binary: the queue that only answers investigate, the wipe that deletes evidence on submit, the gate that refuses an honestly answered line, and the shell the battery could not find.

**READ THIS BEFORE YOU RESTART.** The rebuild also makes the battery runnable for the first time. Another hand closed `wk-840c81485d` tonight, so the engine can now find the shell that Git brought. While `wk-212909368a` is still open, `se test` with a whole ruling runs the battery inside the living engine, and the battery stops that engine. That is your afternoon of red windows, armed by the same restart that fixes everything else.

So read `wk-212909368a` first. If it is still open, land it before you let anything call `se test`.

I could not do this myself. The engine cannot restart itself by design, because whoever started it decides that. Stopping it tonight would have severed every agent mid-token, with nobody here to bring it back.

## The worst thing found tonight

**Submitting a token destroys the evidence written on it.** `wk-7887984486`.

One line in `src/engine/pull.go`, in `submit`: `t.Submission = p.Evidence`. The gate reads the author's tables off the note to decide the move. Then this assignment throws those tables away and writes the payload's map in their place. A `se_pull` carrying no `evidence` carries nil, so the note is rebuilt with every table gone and the frontmatter perfectly current.

So the record looks healthy and the work behind it is deleted. Nobody notices, because the token still reads closed and done.

It is fixed in source, proven by three red-then-green tests, and it merges now rather than overwriting. It is NOT fixed in the running binary, so it kept happening all night. It took my own evidence off two closed tokens, and it took a reviewer's restored tables a second time.

I told all twelve agents to re-apply their tables after each submission, and restored what I could.

**On a token that CLOSES, the loss is permanent.** The submit wipes the tables and closes the token in one move, and `se_apply` then refuses an ended token. So there is no way to put them back. A worker hit this after following my instructions exactly. Where a token was tracked in git you can recover from its `ended` hash with `git show <hash>:<path>`, but `.se` is gitignored, so most of tonight's closed notes have no such copy.

What that means for reading the backlog in the morning: a token closed tonight carries its criteria and its disposition, and many carry no checklist. The work was done and the evidence was recorded and then deleted by the engine. Where a worker's report to me carried the evidence, it is in the engine's log.

This is another reason the restart at the top matters.

## The one judgement I want you to check

I did not restart the engine, and I was asked to twice by my own workers. Here is the reasoning, so you can overrule it in the morning if you disagree.

Restarting fixes almost everything below at once. It is also the thing that arms the failure you described to me as killing the binary with the battery.

Tonight another hand closed `wk-840c81485d`, so the engine can now find the shell that Git brought. It could not before, which is why no battery has ever run inside the living engine on this machine. The moment the new binary is in place, `se test` with a whole ruling will run the battery, and the battery stops the engine hosting it. That is `wk-212909368a`, and it is still open.

So the order matters. Read `wk-212909368a` first. If it is still open, land it before you let anything call `se test`. Then restart.

The other half of the reasoning is smaller and still real. Stopping the engine severs every agent mid-token, and nobody was here to bring it back. `src/engine/main.go` says the engine cannot restart itself because whoever started it decides that, which reads like your ruling rather than an oversight.

## Two more that stop work, found late

**No verdict could be recorded, and this one is now fixed.** The cause was one line. `Ended()` reads true whenever a disposition is set, and `submit` wrote a disposition on every submission. So the work step, which goes open to done, stamped an ending on a token that had not ended, and the engine then told the reviewer the token was already closed. The frontmatter comment on the field already stated the invariant, "Only an ended token carries one", and nothing enforced it.

A disposition is now written only by a step that actually ends the token, and a real ending offered on a non-ending step is refused rather than silently dropped. Proved by a named test that fails without the fix. The two stranded tokens were also freed by hand, so they can take their verdicts on the running binary rather than waiting for your restart.

What it looked like before the cause was found: `wk-d63b7128ce`. A reviewer passed both standard tokens tonight and could record neither. Submitting a done token as reviewer answers refused, saying the token is already closed, while `standard.process.yaml` declares the verdict step as done to closed. Naming a done token on `se_run` is refused the same way, so a reviewer cannot even run a criterion's command against what it is reviewing. Every standard token that reaches done is stranded there.

The two it reviewed both pass: `wk-c93aac62be` and `wk-526ac833fb`. The verdicts exist, in the reviewer's own words, and the engine would not take them.

**A write can lock you out of the engine.** `wk-9935549f19`. `se_apply` does not enforce the schema's size caps, and every other door does. I grew a note's detail past the cap through apply, and after that every engine call I made was refused, naming that size for tokens I had not named. Switching tokens puts the held one back, and putting it back validates it. The guard measures the file as it stands, so it also blocks the very edit that would shrink it.

I got out by naming the broken token on `se_apply`, which puts nothing back. It cost the fleet several minutes. Keep writes short until this is fixed.

## What you asked for, and where it stands

### Dead comments in processes: DONE and reviewed

`wk-00c162f56e`, passed by a reviewer.

All 46 comment lines are gone from the three files under `src/processes`. Four rules that a doer needs moved into the steps that govern them.

The one you named is fixed. The standard process described how a reviewer works in a header comment. That text now sits in the verdict step itself, where a reviewer reads it. So does the rule that a verdict blocks nothing and each finding is a trivial token.

The note process gained the `depends_on` against `ready_when` distinction in its decide step. No activity, state or disposition was added, removed or renamed.

You can see it worked. Mint anything as a note now. Its decide step reads back the rule that was dead in a comment yesterday.

### The UI, live and rendering: DONE, with one caveat to check

`wk-51858264b4`, minted from your words, trivial as you asked. Closed done.

LIVENESS. There are exactly two panels, found by searching for createWebviewPanel and registerWebviewViewProvider. Both now run off a one-second clock, reading only while visible, one read at a time, and quietly.

The old check passed over the dead panel. It was satisfied by a read that only fires on a parameter change or a control being used. Neither happens when a token changes hands, which is why you had to open and close.

The live parts now arrive as a message rather than by replacing the page. Replacing it would empty the line you are typing in and shut the picker under your hand once a second.

RENDERING. Both causes were found, not patched. For the agent name: `.head` is a flex row justified to its end and `.doings` had no width rule. A long line then overflowed past the START, off the left, where nothing can scroll to it. An m with its opening stem cut reads as an h. For the counter: every item in `.bar` could shrink, so the number gave way before the tabs did. Both now have rules that make the text give way instead.

**THE CAVEAT.** Those two are asserted by rule, not measured. jsdom has no layout, so the checks hold the CSS that makes it true rather than pixels in a running window. Nobody has looked at the running UI. Please look before you believe those two.

### The battery killing the binary: CONFIRMED, not fixed

Two separate defects sit here.

`wk-212909368a` "one build door" already carries the real one. `se test` with a whole ruling runs the battery inside the living engine, and the battery stops that engine. That is your afternoon of red windows.

I found a second one underneath it and wrote it up as `wk-f4ad7bc41a`. `exec.LookPath("sh")` at `src/engine/tests.go:557` and `src/engine/run.go:202` misses Git for Windows. Git puts `git.exe` on PATH from its `cmd` folder and leaves `sh.exe` in `bin`. So the engine concludes this machine has no shell.

Two silent consequences follow. The battery cannot run at all, so no token can show a green `se test`. And every `se_run` command runs in `cmd`, so shell syntax fails while the answer still reads exit 0.

**I deliberately did not fix the `sh` lookup.** This is the one judgement I want you to check. Making `sh` findable would make `se test` actually launch the battery. The battery would then stop the engine hosting it. Fixing the lookup before the build door turns a harmless refusal into the storm. So `wk-f4ad7bc41a` waits on `wk-212909368a`.

**Later in the night another hand fixed it anyway.** `wk-840c81485d` is closed done. `batteryShell` in `src/engine/tests.go` now derives the shell from where the tool probe found git, and it names every place it looked. Two tests hold that, `TestTheBatteryFindsTheShellGitBrought` and `TestTheBatterySaysWhereItLookedForTheShell`, and both were green when this line was written.

So read the judgement above once more before you act on the headline. The fix is in the source and not in the running binary, which is why no battery has run inside the living engine yet. The rebuild at the top of this report is what makes it findable. If the build door in `wk-212909368a` is still open at that moment, the rebuild is what turns the refusal into the storm. Read `wk-212909368a` first.

## What blocked the night

The queue jammed, and it stayed jammed. Every worker pull was answered `investigate`, pointing at a hold. Nobody could be handed work while that stood.

There are TWO causes, and the second is the one I would fix first.

**The reclaim never lands.** The notice promises that pulling again takes the hold back. It does not, because that fix is in the source and not in the running binary. Six agents ruled `worker-one` gone and pulled again. The counter went past seventy and nothing moved. `src/engine/investigate.go:92` records this same loop measured once before at twenty-eight pulls.

**The staleness measure ignores how many hands are in the room.** This is `wk-48e28eb9c2`, and I only saw it late. `limits.pulls_before_hold_is_stale` is 10, and the engine counts pulls by everybody rather than by the holder's peers. With one worker, 10 pulls is a long time. With twelve, 10 pulls go past in under a minute.

So every holder deep in a real token looks dead. I watched the engine send me to investigate `reviewer-nyx`, which was alive and seven minutes into its first verdict. The engine cannot tell that from a genuinely dead agent, and neither can the walker it wakes.

That second one matters more than the first. A perfect reclaim would still leave the queue answering investigate all night, because healthy work keeps tripping the alarm. `wk-48e28eb9c2` has a hand on it.

**One correction to that, seen later on the same binary.** The reclaim does work, at least once. An investigate notice named `wk-12c6e7ad1e`, held by `orchestrator-mb`. The next pull took that hold back and handed the token over, saying so in its own words. So the promise is not broken everywhere. `wk-191014c633` is the case that will not move, and nobody has shown why that one differs.

Eight holds belong to agents that are gone: `wk-191014c633`, `wk-212909368a`, `wk-218e541ec2`, `wk-2ef79848eb`, `wk-3b5205ef21`, `wk-345a943f66`, `wk-452e29212c`, `wk-5b5ede3926`. They clear themselves once the engine is rebuilt.

**I did not force any of them.** `writeField` refuses `holder` with "moved by a pull, not by a keystroke". That refusal is deliberate. Editing those files by hand would have gone behind a control you built on purpose.

What I did instead is the notice's own second sentence: *"name your own work again with se work --on and carry on."* Taking an unheld open token by id works on the running binary. It touches nothing protected. The fleet has worked that way since.

**I did not swap the engine while it ran.** Windows locks a running binary. There is no swap door, and building one is what `wk-212909368a` proposes. Every agent reaches the tree through that engine's socket. Killing it would have ended the run with nobody here to bring it back.

## What the fleet closed

Twelve agents worked through the night. Some of what landed, beyond your three asks.

- The battery now reports every failure with its cause, in one run. It used to print the word FAIL three times and throw the causes away. Two checks even printed an ok line beneath a FAIL verdict. That is why the same two failures were reported five times with nothing to investigate between them.
- A `bad=""` inside `gofmt_clean` shadowed the failure counter, so two failures counted as one.
- The battery never ran `binaries-live-in-bin`. It was a check nobody ran.
- `src/mcp/mcp.exe` was tracked in git. `.gitignore` named engine, viewer and setup, and never mcp. That is how it got committed.
- A new check holds the projected standing layer to one chapter per source, so a stale build that writes whole files is caught at the battery.

The battery is NOT green. Eight failures remained when it was last run on a copy. None came from the work above, and all came from other work in flight. One of them: the `se_pull` door forwards `id`, `evidence`, `successors` and `reason` while its schema declares none of them.

## Findings raised tonight

Still open, and these are the ones that matter.

| id | what | where it stands |
|---|---|---|
| `wk-f4ad7bc41a` | `sh` is not found beside git, so the battery never runs | written and green, deliberately NOT released |
| `wk-65c53d4b97` | the engine binary is stale | waits on your restart |
| `wk-89c10296e6` | the holder belongs in engine state, not in the token file | in hand |
| `wk-7887984486` | work tokens silently lose their evidence tables | in hand |
| `wk-99b563dec1` | the walker cannot reclaim a hold | note |
| `wk-3b1c4ccd8c` | put-down hands the same token straight back | note |
| `wk-f0fedb9d94` | the ruling never lands | note |
| `wk-33ffac1616` | a token's delta carries every other agent's uncommitted work | note, needs your decision |
| `wk-c7f50fc4ac` | apply skips the voice check | note |
| `wk-9773928fc8` | the work flag misses private material | note |
| `wk-9cff60b794` | lint skips work tokens | note |

Closed tonight, done unless said otherwise: `wk-00c162f56e`, `wk-51858264b4`, `wk-6a41371774`, `wk-78af255c33`, `wk-4700fc5ccd`, `wk-9a53c8351d`, `wk-cd1d6e4684`, `wk-cdb6961359`, `wk-840c81485d`, `wk-97f1251d43`, `wk-641e205a7a`, `wk-00b78575d6`, `wk-abfc23e46f`, `wk-7173e90157`, `wk-faeaddd8a7`, `wk-437137c7a1`, `wk-eabe5523ab`, `wk-884cc27283`, `wk-2f780ad15b`, `wk-4c065079cf`, `wk-64421f7772` (became), `wk-532169b502` (became), `wk-ab9b2b6b1e` (dropped), `wk-7910e3b177` (dropped), `wk-374d3be992` and `wk-6cbf5200a9` (dropped as duplicates).

Awaiting a verdict: `wk-c93aac62be`, `wk-526ac833fb`.

## One trap worth knowing about

I worked under two actor names tonight, `orchestrator-mb` and `main`, because the engine addresses this session as both. While I pulled as one, the other looked idle. A walker duly ruled it gone and took its token off it, which was the report you are reading.

Nothing was lost, and it is worth a minute of your time. It is the same root as `wk-89c10296e6`. An identity that stops pulling looks dead, whether it is a crashed agent or the same agent under its other name.

One piece of litter left behind: `.se/tmp-526-ended.md`, a scratch copy of a token written to `.se` rather than `.se/scratchpad`. Harmless. The check that catches it, `wk-abfc23e46f`, closed tonight.
How these lists were built, so you know what they can miss. A token carries no time by rule, so there is no field to sort on. They were assembled by asking the index for token files by modification time, and by naming what was raised as it was raised. A token minted early and never touched again would not show up that way. Read them as what was raised and seen, not as a proof of everything.

`wk-6cbf5200a9` and `wk-374d3be992` are probe notes minted while checking a command, and both were dropped with a reason naming where they came from.

## What needs you, not me

**A correction first, because I got this wrong and it spread.**

I reported that `dev_guide` was deleted and that no ruling tables survived. That is false. `dir /s /b dev_guide\*.md` lists 19 markdown files on disk, including `coverage.md`, `cross-cutting/cross-cutting-design.md` and all four level designs.

Why three of us believed otherwise: `se_find` with path `dev_guide/**` answers count 0, and the method tells every agent to search through the index rather than the disk. The index itself is not the problem. Its own tables hold all 19, in `file` and in `line_text`. Only the search hides them, and what is different about those files is that git has them staged for deletion while they sit on disk. That is now `wk-45f2de43aa`, and it is the most quietly dangerous thing I found tonight: an answer of zero reads exactly like an empty folder.

What it cost. I dropped `wk-ea29109644` saying its ruling tables no longer existed, which was wrong; its successor `wk-b5486b7243` carries the correction. Another agent parked `wk-c1af38084d` for you on the same reasoning and a third later unparked it, having checked the disk. So the three-tokens-one-ruling consolidation I was about to hand you does not hold as stated.

What may still hold: `wk-788cca53e9` and `wk-c1af38084d` both touch where a standing ruling lives. Read them against the tree that is actually there.

That consolidation came out of a full sweep of the backlog's notes, which is worth knowing about on its own. All thirty-three were read whole and checked against the tree as it stands now, not as they were written. Eleven closed: eight became work with successors carrying verified line references, and two were dropped because the tree had moved under them. Thirteen are parked with a `ready_when` and the analysis written onto them, so each is one question rather than an investigation. Three corrections to the record came out of it, including one token claiming `src/engine` is 24,725 lines when it is 38,098.

Roughly half of what is left is a decision rather than a task. These are the ones I read tonight and deliberately did not answer for you. Each is written so your decision is one question, not an investigation.

**One tree or one worktree per hand.** `wk-1bb23ea110` and `wk-33ffac1616` are the same question from two sides, and I have linked them so they are decided together. The first says a half-landed edit in a shared Go package stops every other worker from compiling any test, including ones it never touched. The second says a token's delta is everyone's uncommitted work. Three options are costed on the first token. A worktree per hand answers both and is the only one that keeps working as hands are added. It needs a merge story that does not exist.

**What counts as identity material.** `wk-c6d1ac4c5b`. The ruling to build it is already yours and made. What stalls it is one question, and I narrowed the note to it. Usernames are mechanical. Personal names need a list, which belongs under `.se`. Dates are the question: read strictly, behaviour rule 13 refuses most of what is written here, including the dated rulings on your own tokens. Read narrowly, it refuses a date that says when a particular person did a particular thing. Which is the rule?

**Three that carry your name already.** `wk-14f7bd73d6` the backlog conversation and `wk-e768fc8a45` the rule book both say in their own `ready_when` that they wait for you. `wk-fded31de93` is marked `needs_human`.

**Appetite, not correctness.** `wk-69150c6d69` wants an experiment measuring whether a standing rule changes what an agent does. `wk-6961e6e3b2` wants new engine verbs for reading and symbol search. Both are sound and neither is mine to start.

The detail on the first of those:

`wk-33ffac1616` asks a question I should not answer for you. When many agents share one tree, a token's delta is everyone's uncommitted work. One token that changed three files got a delta of 57 entries. Its whole-battery ruling was earned by somebody else's file.

Two shapes to choose between. Narrow the delta to the token's own writes, which the engine already records. Or give each holder its own worktree. The first is cheaper. The second is truer.

One correction I owe you. I first wrote in that note that a test proposal cannot escape a whole ruling. The reviewer disproved it by naming two tests and getting both green. The note is corrected. The fault is narrower and still real. The default path gives an agent a red that names no failing test.

## How the night went, in numbers

When I first counted, 211 tokens were closed. At the end, 251. So forty closed while I watched, and the tokens still open are largely findings raised tonight rather than the ones you left me.

That is the honest shape of it. The backlog did not shrink much, because working it turned up more than it cleared. I think that is the right trade. Most of what was raised is a defect that was already costing you time silently.

Fourteen agents worked at some point. All of them died at once, twice, on a server overload: once with fourteen running and once with four. I dropped to four hands after the first and stayed there.

What I could not finish: two standard tokens, `wk-c93aac62be` and `wk-526ac833fb`, are reviewed and passed but their verdicts are not recorded. A reviewer had them in hand when I stopped. Both are now free of the defect that stranded them.

## The state I left the machine in

Checked last, after every edit of the night was in:

- `src/engine`, `src/mcp`, `src/viewer` and `util/setup` each build with exit 0.
- `go vet -C src/engine ./...` is clean, so the test files compile too.
- Nothing is committed. Every change is in the working tree, where you can read the diff before you keep any of it.
- Nothing was pushed, and no branch was created.

Two agents were still working when I shut the machine down, one of them six hours into a token. Their writes land immediately, so nothing is half-written, but the tokens they held will read as held by names that are gone. Your restart clears those, because the reclaim works in the new binary.

The engine was left running and stale, deliberately. See the judgement above.

## Notes on my own work

`wk-00c162f56e` met four of its five criteria outright. The fifth said `se test` answers ok, and it does not on this machine, for the battery reasons above. No test failed, because none ran. I did not tick it.

The reviewer verified that property another way. It named two tests that parse and project the edited yaml, and both were green.

Two smaller things I saw and named rather than minted. `se_work` has no field for the approach that the standard process requires, so every standard token is minted already failing its first checklist line. And a token freezes its projection at mint, so a token minted before a process change still shows the old checklist. The second reads as intended.

## Added after the report was first written

The fleet kept working after the lines above were set down, so this section is later than the rest. It was written by `worker-gale`.

### Two more tokens closed

`wk-97f1251d43`, proposed action optional, done. The note process required a proposed action chapter. The panel mints a note from a typed line alone, so every note typed into the panel was born red. The chapter is optional now. `TestANoteNeedsNoProposedAction` was seen red first, for the reason expected, and green after.

That token also carries a finding you may want to read. Its own done-when named `se lint` as the command deciding whether a note is clean, and `se lint` cannot decide that. It never validates a work token against its process schema. The decider on the token was corrected and the gap is `wk-9cff60b794`.

`wk-abfc23e46f`, every .se file owned, done. `util/checks/private-files-have-writers.mjs` walks every entry under `.se` and refuses one that no source under `src` names. It was red on `tickets.json`, which is deleted now, and green after. `util/checks/battery.sh` names the new check, so it actually runs.

The first version of that check could not fail. It read `util` as well as `src`, and its own comment names `tickets.json`. So the sweep found the name in the sweep and called the leftover owned. It answered green on a tree that plainly held the defect. It reads `src` alone now, and the file says why.

### Still red, and not mine

`util/checks/scripts-are-lf` answers red on `RUNME.sh`, which carries a carriage return at byte 86. That file was already modified in the working tree before this work began and nothing here touched it. Two tokens name it, `wk-7910e3b177` and `wk-437137c7a1`, which look like the same finding raised twice.

### One thing this report cannot prove about itself

This token asked that the file pass the voice check the engine applies on write. That check lives in the guard hook and fires on the harness write tools. The engine's own `se_apply` does not go through it. A sentence carrying a semicolon, a contraction and a Latin abbreviation went into this file through `se_apply` and was accepted, then taken back out. So the door most of this file was written through never checked it.

The section you are reading was put through the harness editor, which the guard does hook. It was refused the first time, naming a 29 word sentence, and passed the voice rules once that was fixed. The sections above were written by another hand and were not re-checked here. The gap itself is `wk-c7f50fc4ac`.

### The headline, checked again

The engine still answers build `7f22e1a3.210143`, and `src/engine/pull.go` and `src/engine/investigate.go` are still modified against that commit. So the rebuild at the top of this report had not happened when this section was written.
