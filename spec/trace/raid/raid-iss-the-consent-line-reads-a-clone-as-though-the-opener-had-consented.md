---
minted_in: i9
type: "[[raid]]"
id: raid-iss-the-consent-line-reads-a-clone-as-though-the-opener-had-consented
kind: issue
statement: This iteration ruled that seeding a folder IS the person's consent, and that inside a seeded folder setup happens without asking again. A folder that arrived by clone was seeded by somebody else, so the rule treats one person's decision as another person's consent.
owner: the driving agent
trigger: the first time anyone opens a checkout they did not create, which includes every second machine this project already runs on
status: superseded
impact: The rule as written would let a tree decide how it is treated, on the strength of an act performed by whoever built the tree. The cage list is a committed file, so it travels in the clone.
breaks_how_badly: corrosive
how_likely: expected
source_refs:
  - "i9 draft-vision, the ruling in its own words: convenience inside a project, consent at its edge, and a folder that IS a project was seeded deliberately, and that act is the consent"
  - "direnv man page: the allow mechanism exists so that any git repo you pull, or tar archive you unpack, cannot act on you when you enter it — and the allow record is kept in the user's data directory, not in the tree"
  - VS Code workspace trust documentation, naming committed task definitions as the vector and answering with Restricted Mode rather than with a file in the tree
  - "git safe.directory: by default git refuses to parse the config of a repository owned by someone else, let alone run its hooks"
  - "uc-arrive-on-an-unattended-machine step 1: the host reads the COMMITTED root settings before the agent reads anything"
---

## What the rule says, and where it holds

CONVENIENCE INSIDE A PROJECT, CONSENT AT ITS EDGE. That is the ruling, and it
is a good one. It settled a real conflict between an entry point that should
need no ceremony and an instinct that nothing should happen to a folder nobody
offered.

IT HOLDS PERFECTLY FOR THE CASE IT WAS WRITTEN AGAINST. A person seeds their
own folder. That act is theirs, it is deliberate, and everything afterwards is
honouring it.

## Where it does not hold

A CLONE ARRIVES ALREADY SEEDED. Nobody at the receiving end performed the act
the rule points at. The rule reads the marks of somebody else's decision and
concludes that consent was given here.

THIS IS NOT HYPOTHETICAL FOR THIS PROJECT. It already runs on two machines, and
the second one got its copy by cloning rather than by seeding.

## What the prior art says, and it is unanimous

THREE VENDORS MET THIS EXACT PROBLEM AND GAVE THE SAME ANSWER. State may live
in the tree. The decision to TRUST that state may not.

- direnv keeps the file in the tree and the permission record in the user's own
  data directory. Its manual gives the reason as plainly as it can be given.
- VS Code answers with Restricted Mode, which is a per-user, per-folder decision
  held by the editor rather than by the folder.
- git answers with an explicit allow list, and refuses to even parse a config
  belonging to somebody else.

NONE OF THEM LETS THE TREE ANSWER THE QUESTION ABOUT ITSELF.

## What is actually exposed here, stated narrowly

THE AUTONOMY DIAL IS NOT THE PROBLEM. It arrives as a launch flag and the
person moves it live on the panel. It is not read out of the tree, so a clone
does not carry a dial setting that binds anybody.

THE CAGE LIST IS COMMITTED, and that is the part that travels. The arrival
use case says in its own words that the host reads the committed root settings
before the agent reads anything.

SO THE HONEST SIZE OF THIS IS CORROSIVE RATHER THAN CRIPPLING. It is not a hole
somebody walks through today. It is a rule that will be implemented as written
unless it is corrected first, and it is being written into the design milestone
right now.

## What would fix it

THE CONSENT RECORD MOVES OUT OF THE TREE. It becomes per person, per machine,
per folder, exactly as all three prior-art systems hold it. The first time this
machine opens this folder, the person confirms once.

BOTH HALVES OF THE ORIGINAL RULING SURVIVE THAT. Convenience inside a project
is untouched, because the confirmation happens once and never again. Consent at
the edge gets stronger, because the edge is now correctly drawn: a tree that
came from somewhere else is outside it.

## Why this is filed rather than fixed

THE RULING LIVES IN A SIGNED STATE ABOVE THIS GATE. Correcting it needs that
state reopened, and this gate holds neither the reopen nor the amend verb.

## Superseded by owner ruling, 2026-08-19

THE OWNER STRUCK THE PROMPT THIS ENTRY ARGUED FOR, on the day it was written,
in one sentence: if it finds the machine-state folder it can work on it, and if
it does not it does not work on it.

WHY THE ARGUMENT DID NOT SURVIVE, stated so nobody rebuilds it. The three
systems cited all guard against a tree that can EXECUTE on arrival - hooks,
tasks, scripts. That is why each keeps its trust decision outside the tree.

THE MACHINE-STATE FOLDER RUNS NOTHING. It holds a call log, notes and session
state. Coming up against it starts a caged agent that does nothing at all until
a person types a sentence. The threat the prompt guards against elsewhere does
not exist here, so the prompt was pure cost.

THE COST WAS NOT SMALL EITHER. Every clone onto a second machine would have
paid a question, and this project already runs on two machines.

WHAT SURVIVES FROM THE ENTRY. The observation that a clone carries the marks of
somebody else's act is TRUE. It is simply not load-bearing, because nothing
those marks authorise can hurt anybody.
