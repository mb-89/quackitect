---
id: i28-the-cloud-runs-from-its-seed-alone-a-fre
status: shipped
closed: 2026-08-15T20:49:48.268Z
started: 2026-08-15T14:39:57.813Z
opened: 2026-08-13T15:43:52.568Z
goal: "The cloud runs from its seed alone: a fresh machine, a record id and one command produce a working walk, with nothing typed by a person and nothing read as prose."
vision: |-
  ENABLER 2 OF 4 (owner, 2026-08-13). It waits on i27, and it is the one enabler that ADDS MACHINES rather than saving time inside one — which is the owner's reason for placing it this high. Every other enabler multiplies one machine's throughput; this one multiplies how many there are.

  THE ACCEPTANCE CRITERION IS ONE SENTENCE. A fresh machine, plus a seed id, plus one command, produces a walking agent. No handover is read. No step is discovered from prose.

  WHY NOT A HANDOVER. Handovers are the owner's private input and stay out of version control — they may carry credentials, host detail and whatever the owner wants from that run. That is settled and correct. What must NOT live in one is procedure. The bootstrap recipe is not knowledge to be read; it is steps to be run, and every one of them is prose today only because no script exists.

  WHERE IT FAILS TODAY, six named points, each a step rather than a wish.

  - THE SERVER DIES WHEN BACKGROUNDED. se-mcp.ts still treats stdin EOF as a shutdown, and backgrounding is the only way to run unattended. The cloud run held stdin open with `sleep infinity`. The real fix is a daemon mode, or not quitting on EOF while serving HTTP.
  - THERE IS NO ENTRYPOINT. Version 1 shipped a runme.sh beside the PowerShell one; this version ships only PowerShell. It must verify Node, install, start the lane with the panel suppressed, WAIT for the health check rather than racing it, fetch the refspec, adopt the record, launch the caged walker with the cage on its command line, and exit non-zero with ONE clear sentence when a step fails. Every failure in the first run presented as "the server is not there", which is the least informative symptom available.
  - itAdopt IS NOT A LANE VERB. A peer machine cannot pick up a pushed record by itself; the operator ran it through `node -e` from outside the cage.
  - THE FETCH REFSPEC IS MANUAL. A fresh clone sees no iterations until somebody fetches refs/heads/it/*. The lane should own that rather than leaving it to a shell.
  - THE LANE HAS NO LIFECYCLE. A starting instance KILLS whatever holds its port and takes it, turning a careless restart into a cascade. It should refuse and say whose the port is. There is no health endpoint reporting whether a session is attached and when it last called, so the only safe restart is one nobody needs.
  - THE LAST GATE PARKS THE RUN. gate-release needs a person by design, and in an unattended run the person is not there, so a finished iteration waits at the final step. The dial already carries per-session authority; the same idea extends to naming gates the owner authorised for this run — host-local, never committed, recorded in the gate as authorised-in-advance rather than blessed on the agent's own judgment.

  THE CLOUD IS A NEIGHBOUR, NOT A SETTING. It sits outside the system and the system talks to it, so it wants a neighbour node and an interface, and the run itself wants a story. That trace work is part of this iteration rather than a side effect of it.

  NO MORE FIELD REPORTS (owner ruling 2026-08-13). A cloud session ends with its own retro, and everything it learned is packed into backlog rows or technical-debt entries. Those travel; the session disappears. This iteration is the last consumer of a field report, and it should leave nothing that needs another one. DELETE project/spec/cloud-agent-handover.md (owner ruling 2026-08-13). It is committed, it is what a new cloud agent would actually read, and it is false in the three places that matter: it says to place the cage files, which that host refused; it says to install python3, make and g++, which were never needed; and it never mentions SE_PANEL_DISABLE or holding stdin open, which are the two things that decide whether the server survives at all. A committed handover is also the wrong artifact by the owner's own rule that handovers are private input. What replaces it is the script, the seed, and a MODE the system knows it is in — and the engine may be able to DETECT headless rather than being told. That is this iteration's to settle.

  WHAT IT IS NOT. Not the worktree binding, not the ride-along, not the walk-back cost. Those are i27, and i27 runs first.

  FROM THE POOL, 2026-08-13. Four more, and the first is a live hazard with a one-record window.

  - A CLOUD AGENT HOLDS NO CLAIM ON i8 (note-d6bdf43d9dde). It is working that record now, and the ledger did not exist when it entered. The pool fix changes what happens next: the first machine to enter any iteration creates the ledger and claims it, so THE NEXT MACHINE TO ENTER i8 TAKES THE CLAIM and the agent doing the work has nothing on the record - after which the gate would refuse the real worker. It cannot be fixed from here, because recording a claim on that agent's behalf needs its machine id, which is minted locally and outside every push, and a guessed id puts a false holder on an add-only ledger. TWO THINGS CLOSE IT: the cloud agent re-enters i8 once on its own machine, or the owner leaves i8 alone until that machine reports. DO NOT ENTER i8 FROM THIS MACHINE MEANWHILE.
  - THE PACKAGER STARVES THE ENGINE IT RUNS INSIDE (note-86eeb72578bc). It copies the whole project root synchronously and spawns a zip across the result, and the lane goes unresponsive. THE ENGINE BLOCKS, IT DOES NOT DIE - the cloud run's first diagnosis said the listener was gone forever and restarted on that basis, while the caged agent saw the lane self-recover after two or three retries and a later outage cleared by itself. Three candidate causes stand unconfirmed: starvation in a small container, the engine's own watchers churning on the copy, or the packaging touching state the engine holds. DIAGNOSE BEFORE FIXING; a confident wrong mechanism is what this already produced once. THE DESIGN GAP SURVIVES WHATEVER THE CAUSE IS: any tool that can be asked to test itself needs a guard against being run against its own live instance.
  - THE SHIM'S PROXY HAS NO TIMEOUT (note-2fd3ac8a3626). Its aliveness check carries one; the proxy call two dozen lines below carries none. So a live-but-wedged engine makes the proxy wait forever, and it does not self-heal - a reconnect finds the port held, decides a server already walks this root, and proxies into the SAME wedged process, with every new client queuing behind the stuck one. The bound must sit well above the slowest honest call, since the battery runs over a minute, or the proxy starts cutting off work that would have succeeded.
  - THE HEALTH ANSWER, DESIGNED (note-e52632a4f2e1). Its fields: the engine's own pid and parent, who listens on the mirror port and whether that is us, uptime, and the tail of the engine log. THAT LAST FIELD IS THE POINT - the postmortem handlers write to a file nothing can read through the lane, and a record nobody can fetch is half a postmortem. IT REPORTS AND NEVER KILLS, restarts or evicts: a diagnostic that can also shoot processes is one nobody runs calmly.
inputs: null
depends_on:
  - i27
---

# i28-the-cloud-runs-from-its-seed-alone-a-fre

## Goal

The cloud runs from its seed alone: a fresh machine, a record id and one command produce a working walk, with nothing typed by a person and nothing read as prose.

## Rough vision

ENABLER 2 OF 4 (owner, 2026-08-13). It waits on i27, and it is the one enabler that ADDS MACHINES rather than saving time inside one - which is the owner's reason for placing it this high. Every other enabler multiplies one machine's throughput; this one multiplies how many there are.

THE ACCEPTANCE CRITERION IS ONE SENTENCE. A fresh machine, plus a seed id, plus one command, produces a walking agent. No handover is read. No step is discovered from prose.

WHY NOT A HANDOVER. Handovers are the owner's private input and stay out of version control — they may carry credentials, host detail and whatever the owner wants from that run. That is settled and correct. What must NOT live in one is procedure. The bootstrap recipe is not knowledge to be read; it is steps to be run, and every one of them is prose today only because no script exists.

WHERE IT FAILS TODAY, six named points, each a step rather than a wish.

- THE SERVER DIES WHEN BACKGROUNDED. se-mcp.ts still treats stdin EOF as a shutdown, and backgrounding is the only way to run unattended. The cloud run held stdin open with `sleep infinity`. The real fix is a daemon mode, or not quitting on EOF while serving HTTP.
- THERE IS NO ENTRYPOINT. Version 1 shipped a runme.sh beside the PowerShell one; this version ships only PowerShell. It must verify Node, install, start the lane with the panel suppressed, WAIT for the health check rather than racing it, fetch the refspec, adopt the record, launch the caged walker with the cage on its command line, and exit non-zero with ONE clear sentence when a step fails. Every failure in the first run presented as "the server is not there", which is the least informative symptom available.
- itAdopt IS NOT A LANE VERB. A peer machine cannot pick up a pushed record by itself; the operator ran it through `node -e` from outside the cage.
- THE FETCH REFSPEC IS MANUAL. A fresh clone sees no iterations until somebody fetches refs/heads/it/*. The lane should own that rather than leaving it to a shell.
- THE LANE HAS NO LIFECYCLE. A starting instance KILLS whatever holds its port and takes it, turning a careless restart into a cascade. It should refuse and say whose the port is. There is no health endpoint reporting whether a session is attached and when it last called, so the only safe restart is one nobody needs.
- THE LAST GATE PARKS THE RUN. gate-release needs a person by design, and in an unattended run the person is not there, so a finished iteration waits at the final step. The dial already carries per-session authority; the same idea extends to naming gates the owner authorised for this run — host-local, never committed, recorded in the gate as authorised-in-advance rather than blessed on the agent's own judgment.

THE CLOUD IS A NEIGHBOUR, NOT A SETTING. It sits outside the system and the system talks to it, so it wants a neighbour node and an interface, and the run itself wants a story. That trace work is part of this iteration rather than a side effect of it.

NO MORE FIELD REPORTS (owner ruling 2026-08-13). A cloud session ends with its own retro, and everything it learned is packed into backlog rows or technical-debt entries. Those travel; the session disappears. This iteration is the last consumer of a field report, and it should leave nothing that needs another one. DELETE project/spec/cloud-agent-handover.md (owner ruling 2026-08-13). It is committed, it is what a new cloud agent would actually read, and it is false in the three places that matter: it says to place the cage files, which that host refused; it says to install python3, make and g++, which were never needed; and it never mentions SE_PANEL_DISABLE or holding stdin open, which are the two things that decide whether the server survives at all. A committed handover is also the wrong artifact by the owner's own rule that handovers are private input. What replaces it is the script, the seed, and a MODE the system knows it is in — and the engine may be able to DETECT headless rather than being told. That is this iteration's to settle.

WHAT IT IS NOT. Not the worktree binding, not the ride-along, not the walk-back cost. Those are i27, and i27 runs first.

FROM THE POOL, 2026-08-13. Four more, and the first is a live hazard with a one-record window.

- A CLOUD AGENT HOLDS NO CLAIM ON i8 (note-d6bdf43d9dde). It is working that record now, and the ledger did not exist when it entered. The pool fix changes what happens next: the first machine to enter any iteration creates the ledger and claims it, so THE NEXT MACHINE TO ENTER i8 TAKES THE CLAIM and the agent doing the work has nothing on the record - after which the gate would refuse the real worker. It cannot be fixed from here, because recording a claim on that agent's behalf needs its machine id, which is minted locally and outside every push, and a guessed id puts a false holder on an add-only ledger. TWO THINGS CLOSE IT: the cloud agent re-enters i8 once on its own machine, or the owner leaves i8 alone until that machine reports. DO NOT ENTER i8 FROM THIS MACHINE MEANWHILE.
- THE PACKAGER STARVES THE ENGINE IT RUNS INSIDE (note-86eeb72578bc). It copies the whole project root synchronously and spawns a zip across the result, and the lane goes unresponsive. THE ENGINE BLOCKS, IT DOES NOT DIE - the cloud run's first diagnosis said the listener was gone forever and restarted on that basis, while the caged agent saw the lane self-recover after two or three retries and a later outage cleared by itself. Three candidate causes stand unconfirmed: starvation in a small container, the engine's own watchers churning on the copy, or the packaging touching state the engine holds. DIAGNOSE BEFORE FIXING; a confident wrong mechanism is what this already produced once. THE DESIGN GAP SURVIVES WHATEVER THE CAUSE IS: any tool that can be asked to test itself needs a guard against being run against its own live instance.
- THE SHIM'S PROXY HAS NO TIMEOUT (note-2fd3ac8a3626). Its aliveness check carries one; the proxy call two dozen lines below carries none. So a live-but-wedged engine makes the proxy wait forever, and it does not self-heal - a reconnect finds the port held, decides a server already walks this root, and proxies into the SAME wedged process, with every new client queuing behind the stuck one. The bound must sit well above the slowest honest call, since the battery runs over a minute, or the proxy starts cutting off work that would have succeeded.
- THE HEALTH ANSWER, DESIGNED (note-e52632a4f2e1). Its fields: the engine's own pid and parent, who listens on the mirror port and whether that is us, uptime, and the tail of the engine log. THAT LAST FIELD IS THE POINT - the postmortem handlers write to a file nothing can read through the lane, and a record nobody can fetch is half a postmortem. IT REPORTS AND NEVER KILLS, restarts or evicts: a diagnostic that can also shoot processes is one nobody runs calmly.

## From the field, 2026-08-14

The owner ran the whole system on a SECOND MACHINE. Four findings came back, and the first CONFIRMS what this record already predicted.

THE SECOND MACHINE SAW NO ITERATIONS AT ALL (note-90337185ce67). It had no worktrees on disk. The owner had to teach it that iteration state is the MERGE of what is in git and what is on disk. This record already names the mechanism under "THE FETCH REFSPEC IS MANUAL"; the field says the symptom is worse than a missing fetch, because even fetched refs stay invisible while the reader only looks at disk.

THE RULING THAT COMES WITH IT. Seeding puts an iteration in git, and that is enough. Two consequences, both work:

- A SEEDED WORKTREE SHOULD NOT BE KEPT ON DISK. The owner named worktrees-we-should-not-keep as a standing problem. If it is in git, the disk copy is waste.
- ENTERING A GIT-ONLY SEED MUST MATERIALISE IT. The walk enters an iteration that exists only as a branch, and the worktree is created at that moment.

DEPENDENCIES WERE INFERRED FROM GIT, AND INFERRED WRONG (note-20bae969775d). The second machine had to be taught to derive them and got them wrong first. An inference two machines can answer differently is not mechanical. Where a seed RECORDS its dependencies, in a form every reader parses identically, is this iteration's to settle.

UNCERTAIN AND RECORDED AS UNCERTAIN: the owner thinks the archives may not have displayed properly there, and is explicit about not being sure. Check it before treating it as a defect.

THE READ PROOF IS THE HARDEST PART OF BOOTING (note-8de9bfec67b6). This is the finding with the widest blast radius.

- WEAKER MODELS COULD NOT PRODUCE IT AT ALL.
- STRONGER MODELS STILL STRUGGLED.
- The fix was teaching the agent very specifically what counts toward the word count.

The defect is in the ENGINE'S FEEDBACK. A refusal that says the proof was wrong without saying exactly what is counted is a puzzle rather than a remedy, and every other refusal in this lane carries an executable one. The boot is the FIRST thing any machine does, so a first step a weak model cannot pass makes the system unavailable to that model entirely. That is squarely this record's own acceptance criterion: a fresh machine, a seed id and one command produce a walking agent.

AND THE QUESTION UNDERNEATH IT (note-4671c830fca7). If the document arrives through an MCP TOOL CALL rather than as a path to open, the agent has already been handed the text. Does it have to prove it read what it was handed? Answering no may DELETE this problem rather than fix it.

THREE THINGS MUST SURVIVE whatever replaces the proof, and they are why the question is not already settled:

- COMPACTION still has to re-owe the reading. Something must notice the text has left the window.
- THE CREDIT IS PER-AGENT EVIDENCE. The owner ruled on 2026-08-14 that sharing it between agents would be wrong.
- A HOST THAT EATS THE TEXT leaves no other signal today, because a hash the engine supplied would prove only that a message arrived.

## The environment check runs at EVERY boot, not only a cloud one

ADDED AT THE RETRO, 2026-08-14, from this machine's own log rather than from the field.

i27's FIRST PLAN, written at log-risks before the second gate, had four items and THREE OF THEM WERE HARNESS REPAIR:

- "wire the stop hook for this host"
- "prove where the write landed"
- "correct the pagination wording to both"
- "walk to gate-motivation"

The agent hand-wrote `.claude/settings.json` from inside the walk. On a machine that was already mostly configured.

SO IT IS THE SAME FAULT THE SECOND MACHINE HIT, one notch milder. This record's acceptance criterion already covers it word for word: a fresh machine, a seed id and one command produce a working walk, with nothing read as prose. What the retro adds is that the check must fire on EVERY boot, because a local machine drifts too and the agent discovers it mid-milestone.

THE SPECIFIC HOOK CASE IS NOW CLOSED: `cage/claude-settings.json` carries the Stop hook, RUNME places it every run, and `tests/cage.test.ts` pins it. That fixes one instance. It does not stop the next agent repairing the next broken thing inside a milestone, which is what this addition is for.

THE FRONT DESK IS WHERE THE WALK WENT TO BE REPAIRED. 75 updates across its first two visits, before the second gate — more than the whole M0-to-M1 stretch. Most of that was the escape tax, retired with SE-C-134, but the pattern is the thing to prevent.

## Two rulings from the desk, 2026-08-15, before this record was entered

THE CLOUD VALIDATION IS A DEBT, NOT A BLOCKER. This record's acceptance criterion is a fresh machine, a seed id and one command producing a walking agent. The machine walking this record cannot produce a fresh machine, so it cannot close that loop itself.

So the validation is recorded as a TECHNICAL-DEBT ENTRY, with the Repayment section every debt now owes. The owner tests it on a cloud machine themselves, after this record ships.

NOTHING IN THE WALK WAITS FOR IT. The owner said plainly that there is no reason to stop anything. A step that cannot be finished here is written down, not stood in front of.

THE MILESTONE ONE-PAGER IS NOT THIS RECORD'S WORK. M0 kickoff was assigned to i28 by the one-pager programme of 2026-08-15. The whole programme moved to i19 emit.report on the same day, because the page needs the owner's input and this record must stay clear of anything that waits on a person.

See project/spec/version-planning.md, under "The milestone one-pager, all of it in i19 emit.report". Nothing about the one-pager is owed here.

## The defect that blocked this record's own entry, 2026-08-15

FOUND WHILE TRYING TO ENTER i28, and it is this record's subject rather than a stray.

TWO DEFINITIONS OF "OPEN" DISAGREE, and nothing reconciles them.

- project/deliverable/engine/iterations.ts line 70, itList: "Open = the worktree exists. Closed = branch it/* without one." It sets `open: existsSync(path)`.
- project/deliverable/engine/survey.ts line 51: `FINISHED = new Set(["shipped", "closed"])`, read from the record's own status.

SO A SHIPPED ITERATION WITH A LEFTOVER WORKTREE READS AS OPEN FOREVER. The container is a DAG and an iteration cannot be entered until its dependency leaves the open set (iterations.ts lines 180-183). i27 shipped on 2026-08-14 and its worktree stayed on disk, so i28 and i23 were both unreachable and would have stayed unreachable.

WHY i27 HAD A WORKTREE AT ALL. i27 is the iteration that RULED this product gets none, because Quackitect is self-hosting and its records walk on trunk. i27 was seeded before its own ruling landed, so it carried the last worktree of the old regime. i12, seeded after, has none.

HOW IT WAS CLEARED, so the same evidence is not gathered twice. All 34 uncommitted paths in i27's worktree were compared byte for byte:

- 23 identical to trunk's committed content.
- 9 identical to trunk's working copy, uncommitted on both sides.
- 2 differing, AGENTS.md and CLAUDE.md, and the only unique lines were the prompt layer's own provenance stamps carrying older guidance hashes. Both are generated files.

Nothing unique was in the tree. `git worktree remove --force` retired it and the branch it/i27-the-lane-binds-to-the-record-a-bound-wal is untouched, so `git worktree add` restores it.

THREE PIECES OF WORK FALL OUT OF THIS, all inside this record's scope.

- RECONCILE THE TWO DEFINITIONS. One answer to "is this iteration open", read from the record's status, used by both the container and the survey. Disk presence is a cache, never the truth.
- THE CLOSE RETIRES THE WORKTREE. Nothing in the engine removes one today; a search for a worktree removal across the engine returns nothing. The owner's standing rule is already in this record: if it is in git, the disk copy is waste.
- THE LANE HAS NO WORKTREE VERB. se_git's allowlist has no `worktree` and refuses `-C` under SE-C-004, so clearing this needed se_run under no_tool_reason four times. A machine that cannot retire its own worktrees cannot bootstrap itself in the cloud, which is this record's whole point.

## OWNER RULING, 2026-08-15: STARTING AN ITERATION IS ENTERING IT

THEIR WORDS, on being told what blocked this record's own entry: "Starting an iteration is going in it and starting it, not cleaning stuff up." And: "humans also need to be able to do this, and we can't have this. We can't have a system where you need to tinker around the edges every time just because you start some work. This just needs to work."

THIS BINDS THIS RECORD'S SCOPE, and it is wider than the defect that produced it. The three fixes listed above are each necessary and together they are not sufficient. Each one removes a way the entry can break. None of them makes the entry SAY what is wrong and repair it.

WHAT THE DEMAND ASKS FOR, stated so it can be tested:

- ENTERING AN ITERATION NEVER REQUIRES REPAIR. Not by a person and not by an agent. Where the machine needs something moved, the machine moves it.
- WHERE IT CANNOT, IT SAYS SO IN ONE SENTENCE, and the sentence names the remedy. A door silently absent from an offer is the worst available failure. Nothing is wrong, nothing is refused, and the thing simply is not there.
- A PERSON MUST BE ABLE TO DO IT. Clearing this one meant reading two engine files, comparing 34 paths byte for byte, and running five shell commands under an explicit exemption. That is not a bar anybody should clear to begin a day's work.

WHY IT BELONGS HERE RATHER THAN IN A NOTE. The acceptance criterion already written into this record is that a fresh machine, a seed id and one command produce a walking agent. An entry needing a person to diagnose a stale folder fails that criterion on a machine that is already set up, never mind a fresh one.

THE SCOPE IT ADDS: the entry path checks itself, repairs what it can, and refuses with a named remedy where it cannot. Silent absence from the offer stops being a possible outcome.

THE BLAST RADIUS, measured rather than assumed: every seeded iteration on this machine has a folder on disk today. Nothing in the engine removes one. So this recurs at the next close whose iteration anything depends on, and i23 was already the second casualty of this one.

## OWNER RULING, 2026-08-15: THE CLOSE REMOVES THE FOLDER, AND THE DISK GETS SWEPT

THEIR WORDS: "when an iteration is done, we don't need the folder anymore. So bake it in that on closing, the folder gets removed." And: "clean up all the other iterations. We have probably a lot of old iterations lying around that we don't need anymore. Clean this stuff up. If an iteration is in the archive, then it doesn't have to be on disc anymore. The archive reads from Git. That's the whole idea."

THE ORDER IS FORCED, and it is the one thing that must not be got wrong. Today the container reads "open" from whether the folder exists. Sweeping the folders before that test changes would make every seeded iteration vanish from the offer, 26 of them in one act. So the sequence is:

1. The open test moves to the record's status, read from git.
2. Entering a git-only seed materialises its folder at that moment.
3. The close removes the folder.
4. Only then is the disk swept.

WHAT THE SWEEP ACTUALLY FINDS, measured rather than assumed. 28 folders stood on disk at the start of this walk. Exactly one belonged to a finished iteration, i27, and it has been retired. The other 27 all belong to OPEN seeded iterations. i1, i2, i3, i8 and i12 already have no folder at all.

SO THE ARCHIVE IS ALREADY CLEAN, and the owner's expectation of old archived iterations lying around does not match the disk. What IS lying around is 27 folders for iterations nobody is working, which exist only because seeding creates one and nothing ever removes it.

THAT IS THE SAME DEFECT FROM THE OTHER END, and the sweep is worth doing for exactly the reason given: the archive reads from git, and so should the container. A folder on disk should mean somebody is working that iteration right now, and nothing else.

## OWNER DESIGN, 2026-08-15: GIT IS THE TRUTH AND THE DISK IS A WORKSPACE

THE OWNER STATED THE WHOLE RULE, in their own words, after the entry defect above. It is the same rule said five ways, and it supersedes nothing here — it completes what the field report of 2026-08-14 started.

THE FIVE POINTS.

- A SEEDED ITERATION LIVES IN GIT. Seeding does not put a folder on disk. "A seeded iteration is not seeded when it's on disc. It needs to be visible on Git."
- THE ITERATIONS VIEW IS A MERGE of the seeds visible in git and the iterations live on this machine. "the view that opens for me, it's constructed from the iterations on my machine and the iterations in Git that are seeded."
- THE STATE MACHINE SEES A BRANCH THAT IS NOT ON DISK. A seed another machine pushed is SELECTABLE here without downloading anything. "I don't need to download the work tree so I can see it as a selectable iteration."
- ENTERING IS WHAT DOWNLOADS IT. "when I choose to enter that seed, then I download the data." The folder is created at the moment of entry and at no other moment.
- ARCHIVED ITERATIONS HAVE NO FOLDER ANYWHERE, and every machine reads the archive through git. "every iteration, no matter on which machine it's running, should see the archive through Git."

WHAT THIS MEANS IN ONE SENTENCE: a folder on disk means somebody is working that iteration right now, on this machine, and nothing else.

THE WRITE SIDE ALREADY WORKS, and knowing that changes where the work is. Seeding pushes `it/<id>` to the shared remote as one of the engine's own sanctioned pushes, so a seed IS in git today. What is broken is the READER: project/deliverable/engine/iterations.ts line 71 sets `open: existsSync(path)`, so the container asks the disk and never asks git. Plus the fetch refspec a fresh clone needs before it can see `refs/heads/it/*` at all.

SO THIS IS NOT A MISSING FEATURE. It is a reader pointed at the wrong source.

WHY IT MATTERS FOR THE CLOUD, which is this record's whole subject. A cloud machine clones and has no worktrees. Under today's reader it sees zero iterations and cannot be given work at all. The owner put it plainly: how else would the cloud machine see the iterations.

## THE ONE OPEN CHOICE, put to the owner 2026-08-15

AN ITERATION CLAIMED BY ANOTHER MACHINE. The owner said they would be fine with it simply not showing up.

THE TRADEOFF THAT MAKES IT A CHOICE RATHER THAN A DEFAULT. Hiding it means in-flight work appears on NO surface anywhere. [[raid-debt-claim-pool-surfaces]] already records that the holder listing and the force release exist as engine functions with no product surface at all. So a claimed iteration would vanish from the owner's board and appear nowhere else, while the engine knows exactly who holds it.

THE CHEAP ALTERNATIVE, costing about the same to build: the container draws a claimed iteration greyed, carrying its holder, and refuses entry with that holder named. The information already exists in the claim ledger.

RULED 2026-08-15: GREYED, WITH ITS HOLDER. The owner's words: "I would say, yeah, I agree with you. It's better to have it grayed out. That's the better shot. Do it like that."

SO A CLAIMED ITERATION IS DRAWN AND REFUSED, never hidden. It appears in the container carrying who holds it, and entry refuses naming that holder. The information already exists in the claim ledger and today reaches no surface at all, which is [[raid-debt-claim-pool-surfaces]]. This is the first surface it reaches.

## THE ENGINE PUSHES WHAT THE LANE NEEDS, owner ruling 2026-08-15

THE OWNER'S POINT, and it closes a gap the design would otherwise have left: entering an iteration writes a claim, and a claim is a change in git that somebody would have to push. Their words: "the same way you can push claims, I think the engine can already push claims. I feel like the engine can also push seeds. That's fine for me."

BOTH ARE ALREADY SANCTIONED AND THE RULING MAKES IT EXPLICIT. guidance/refusals.md under SE-C-003 records that the machinery itself pushes the iteration seed stub, the expedition seed stub and the claim file, as acts of the claim lane in engine/claims.ts. The agent's own push refusal stands untouched.

WHAT THAT UNBLOCKS HERE. Materialise-on-entry needs a fetch rather than a push, so it is free. The claim written at entry needs a push, and that push is the engine's own and already exists. Nothing in the five points waits on a person pressing anything.

## OWNER RULING, 2026-08-15: EVERY GATE CAN WRITE

THEIR WORDS, after this iteration's own M1 gate found a hole it could not record: "A gate cannot write. I am not sure if we can keep that. The idea is that a gate can create debt. That means it needs to be able to mint notes, and then it should also be able to write. I put you in emergency mode. When you start implementing, fix that for all gates. All gates need to be able to write."

THIS IS SCOPE FOR THIS ITERATION, and it applies to EVERY gate rather than to the one that hit it.

WHAT PROVOKED IT, so the fix has a case to test against. The motivation gate's red-team round found that a crashed walk leaves a folder that means nothing. The finding is real and the gate graded it. It could not mint the register entry, because gate states grant only read tools, so the entry was carried in follow-up and written one state later.

THE METHOD ALREADY CONTRADICTED ITSELF HERE, and that is the stronger argument than the inconvenience.

- meth-raid says any state may add an entry the moment it is noticed, and that waiting for the right state is how an entry is lost.
- machines/items/raid.md says the implementation gate lists what the iteration took in `debt_taken`, and a debt is a node.
- So a gate is REQUIRED to reference debt nodes it is structurally forbidden to create.

A GATE THAT CANNOT RECORD WHAT IT FINDS turns a finding into a note for somebody else, which is exactly the shape the contract's rule 5 names: the defect gets named accurately, in the right place, with the right severity, and then the work continues past it as though naming were fixing.

WHAT TO BUILD. Gate states grant the write tools, at minimum se_file_write, se_file_patch and se_note. The rigor matrix rows for every gate carry it, so it is one sweep rather than a per-gate decision.

THE ONE THING TO KEEP, and it is why the restriction existed. A gate must not quietly rewrite the evidence it is judging. The guard is authorship rather than tool grants: a gate writes NEW nodes and its own form, and never edits an upstream form it is reviewing. That distinction is checkable and the blanket refusal was not.
