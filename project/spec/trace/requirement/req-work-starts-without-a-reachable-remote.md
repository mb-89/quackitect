---
minted_in: i28-the-cloud-runs-from-its-seed-alone-a-fre
id: req-work-starts-without-a-reachable-remote
type: "[[requirement]]"
statement: If the remote cannot be reached, then the engine shall list every record standing on trunk and shall enter one, without asking the network anything.
kind: functional
characteristic: reliability
verify_method: test
breaks_if_removed: A machine off the network is told there is no work, which removes a capability the folders on disk provide today.
breaks_how_badly: corrosive
refines:
  - uc-start-an-unattended-machine
source_refs:
  - uc-start-an-unattended-machine ext 4a
  - raid-no-iterations-are-visible-without-a-reachable-remote
  - raid-dec-one-tree-beats-a-record-travelling-between-machines
priority: must
weighs_with:
  - req-the-lane-runs-without-a-console ! — one is listing/entering work offline, the other is the process surviving stdin close and port conflict; different failure modes under the same use case

## Detail

TWO ACTS, AND NEITHER NEEDS THE NETWORK.

| act | needs the remote | offline behaviour |
| --- | --- | --- |
| listing what exists | no | every record's folder is on trunk, in this clone |
| entering a record | no | proceeds, and stamps it started |

THE FETCH IS FRESHNESS, NEVER ACCESS. A fetch brings trunk up to date. Without
one the clone still holds every record it had at its last fetch, and the answer
says how old that is rather than presenting a possibly stale list as complete.

## What i34 rewrote here, and why the demand survived it

THE STATEMENT USED TO NAME TWO MECHANISMS THAT NO LONGER EXIST: listing from
`refs/heads/it/*`, and recording that a claim did not land.

- THE LIST DOES NOT COME FROM REFS. A record is a folder on trunk, so listing
  is reading a directory.
- THERE IS NO CLAIM TO FAIL TO RECORD. The machine-locking specification was
  retired whole on 2026-08-16.

THE DEMAND ITSELF WAS NEVER ABOUT EITHER. It is that a machine off the network
can still find work and start it, and one tree makes that true by construction
rather than by a fallback path.

SO THE ROW GOT EASIER TO SATISFY AND STAYED WORTH CHECKING. A row that becomes
true by construction is exactly the kind that quietly stops being tested, which
is why it keeps a spec rather than being retired.

THE THIRD ROW OF THE OLD TABLE IS GONE WITH ITS MECHANISM, and with it the
accepted desync: two machines entering one record while one was offline. What
replaces it is [[raid-asm-only-one-agent-works-a-clone-at-a-time]], which is an
assumption with a trigger rather than a cost taken knowingly.

## Where the earlier answer went wrong

The M1 pressure test found the offline case and answered that entering was
impossible. That contradicted a ruling settled before that iteration opened.
The finding underneath is recorded on that M1 gate: a pressure test that folds
a discovery upstream never checks whether the discovery contradicts a standing
decision, and nothing in the method asks it to.
