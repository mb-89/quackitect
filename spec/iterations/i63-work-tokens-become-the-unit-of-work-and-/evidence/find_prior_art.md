---
form: find_prior_art
judgment: passed at 2026-08-26T11:40:43.319Z with deliverable/engine/bin/outward-search.ts@6a89bb9173af
by: agent
signed_off: 2026-08-26T10:28:39.785Z
authors: agent
files:
---

# Evidence form / find_prior_art

## current_situation

The cluster under search is the work itself: minting a piece of work, placing it, offering it, settling it and counting what is owed.

THE QUESTION IS HOW A PIECE OF WORK IS HELD. Everything else in the cluster follows from that answer, so the search was aimed at it rather than at the five acts separately.

THE SEARCH FOUND THE OPPOSITE OF WHAT THE ROUND ASSUMED, and that is the finding worth carrying to the gate.

## applies

yes

## options

- opt-work-is-a-file-in-the-working-tree
- opt-work-lives-in-the-version-control-object-store
- opt-work-state-is-replayed-from-an-append-only-change-log
- opt-work-is-instantiated-from-the-definition-and-only-outcomes-are-kept

## literature

FOSSIL WROTE DOWN WHY IT REFUSED THE FILE, and it is the most useful page the search found. Its ticket design note rejects storing tickets as files in the source tree for three stated reasons.

- Check-ins are immutable, so a ticket inside one cannot be added to afterwards.
- A project of any size generates thousands of ticket files that clutter the tree.
- Tickets should be creatable by people who have no check-in rights at all.

WHAT IT DOES INSTEAD is replay. Every change is an immutable artifact carrying an identity, a timestamp and name-value pairs, and a ticket's current state is the result of replaying its changes in time order. Independent changes merge without branching, and the history is free.

IT NAMES ITS OWN PRICE TOO, which is what makes it evidence rather than a brochure. A change stamped months out of true confuses the replay badly enough to need an administrator.

Source: fossil-scm.org/home/doc/trunk/www/bugtheory.wiki, read at the page itself rather than through a summary.

WORKFLOW ENGINES SUPPLY THE FOURTH SHAPE, where a task instance is derived from the definition on each run and only its outcome is kept. That is the option that stores nothing, and the chart needs it.

## shipped

GIT-BUG IS EMPHATIC IN ITS OWN README: it embeds issues, comments and more as objects in a git repository, and the parenthesis says "not files!". Its stated purchase is that the repository stays versioned and clutter-free while the work still travels on push and pull.

SO TWO OF THE BEST-KNOWN REPOSITORY-NATIVE TRACKERS BOTH REFUSED THE WORKING-TREE FILE, independently, and each wrote down why. Neither is a vendor page; both are the projects' own design notes.

OUR OWN PREDECESSOR WAS NOT READ FOR THIS FINDER, and that is a gap rather than a nil result. Earlier versions are one ref away on every read verb, and the method card names the predecessor as the rich source. It is recorded here so the gate can weigh a search that stopped short.

REVERSE ENGINEERING WAS NOT RUN. There is no running artifact of this design to read a format or a protocol off, because the thing does not exist yet.

## dry_wells

- the-account: not searched, because this round changes what the account reports rather than how the account is built
- the-walk: not searched, for the same reason
- our own predecessor, on this cluster: reachable and not read, which is a hole in this sweep rather than an absence of literature

## follow_up

THE SWEEP PRODUCED A COUNTER-ARGUMENT, not a confirmation, and the gate should read it that way. The register carries an open assumption that one file per work token stays workable in the vault and the repository. Two shipped systems have already answered that question the other way, in writing, and the assumption should be re-weighed against them rather than probed from scratch.

THE PREDECESSOR READ IS OWED. It is one argument on a read verb, and the method names it as the source people skip. Whichever candidate wins should not be blessed before it runs.

## anything_else

