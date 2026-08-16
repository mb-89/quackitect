---
minted_in: i28-the-cloud-runs-from-its-seed-alone-a-fre
id: uc-start-an-unattended-machine
type: "[[use-case]]"
statement: Turn a bare machine into a peer that is walking a named iteration, with nobody at the keyboard after the first command.
actor: stk-engineer-driving-agents
trigger: the work outgrows one machine, or an iteration should run somewhere that is not the person's own computer
precondition: a machine reachable over a network, with a shell and a network route to the remote, and nothing else
guarantee: the named iteration is claimed by that machine, its folder exists there, and the walk is under way — or the run has stopped with one sentence naming the step that failed
refines:
  - sty-work-on-two-machines
priority: must
---

## Main scenario

1. The person supplies the repository address, one iteration id, and the entrypoint command.
2. The machine obtains the product's folder and verifies the runtime it needs, installing what is missing and nothing else.
3. The machine starts the lane without a panel, and waits for it to answer rather than assuming it has.
4. The machine asks git which iterations exist, and finds the named one among them without any folder having been copied.
5. The machine claims the iteration, and its folder is created at that moment.
6. The agent boots, is handed everything it owes, and walks the iteration until a gate the person did not authorise in advance.

## Extensions

- 2a. A required runtime is absent and cannot be installed. The run stops and names that runtime, rather than continuing and failing later as something else.
- 3a. THE PORT IS HELD BY ANOTHER INSTANCE OF THIS ENGINE ON THIS ROOT. The run refuses and says which process holds it. It never takes the port, because taking it turns a careless restart into a cascade.
- 3b. The port is held by something unrelated. The engine picks the next one, as uc-install-quackitect step 3a already has it. THE TWO ARE DIFFERENT CASES and neither replaces the other: 3a here is our own engine already serving this root, and moving aside would silently split the session.
- 4a. The remote cannot be reached. Reading which iterations exist still succeeds from local refs, and the run says how old that answer is rather than presenting it as complete.
- 4b. The named iteration is not among them. The run stops and lists what it did find, rather than reporting that the server is not there.
- 5a. Another machine already holds the claim. The run stops and names the holder. It does not wait and it does not take the claim.
- 5b. THE REMOTE CANNOT BE REACHED TO RECORD THE CLAIM. The run WARNS and continues unclaimed, because work starting is worth more than the claim landing (owner ruling, settled before this iteration and restated 2026-08-15). The warning says the iteration is unclaimed and another machine may take it. The desync risk is accepted knowingly and is not a reason to refuse.
- 6a. The walk reaches a gate nobody authorised in advance. The walk stops there and the iteration waits, which is correct rather than a failure.
- 6b. THE MACHINE STOPS WITHOUT CLOSING, which is the expected ending for an ephemeral host rather than an exceptional one. The claim is what expires; the folder left behind is not evidence of anything. See [[raid-a-crashed-walk-leaves-a-folder-that-means-nothing]].

## Notes (not load-bearing)

DISTINCT FROM uc-install-quackitect, and the three header fields carry the whole
distinction. That one has a newcomer at a computer with an editor, and it
guarantees a front desk waiting for a sentence. This one has no person present
after the first line, no editor at all, and it guarantees a walk under way.

An unattended machine that reaches a waiting front desk has failed.

IT REFINES sty-work-on-two-machines RATHER THAN A STORY OF ITS OWN, and that is
a correction rather than the original plan. A separate story was written at M2
and REMOVED on 2026-08-15 after the owner asked whether it overlapped the
bootstrap story. It did, on nearly every slide: installing and booting belong to
sty-ramp-up by the method's own rule, seeing seeds from git and claiming belong
to sty-work-on-two-machines, and walking unattended to a gate belongs to
sty-hand-over-and-walk-away.

WHAT WAS GENUINELY NEW survived as one slide on sty-work-on-two-machines: the
second machine need not be one anybody owns or configured.

THE WITHDRAWN STORY IS STILL NAMED IN `refines` AND THAT IS TEMPORARY. The file
could not be deleted from M2, because no M2 work state grants se_file_delete,
and a superseded story left in the corpus fails the coverage check that every
story be refined by something. So it is bridged here rather than orphaned.

WHEN THE FILE GOES, THIS LINE GOES WITH IT. The owner asked for the deletion at
the first state that can write it, on 2026-08-15.
