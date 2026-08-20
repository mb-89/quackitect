---
minted_in: i11-the-engine-fix-bundle-about-twenty-named
id: tsp-carry-a-finding
type: "[[test-spec]]"
statement: An engineer meets a real defect that blocks nothing, records it as owed, walks on, and is stopped at the close until it is cleared — verified by demonstration.
method: demonstration
demonstrates:
  - sty-carry-a-finding-without-stopping
verifies:
  - "none — this spec demonstrates a story end to end, so the demonstrates edge above carries its trace; the two requirements stating the mechanics are req-a-harmless-finding-is-carried-not-stopped-on and req-a-harmless-finding-names-an-open-entry; both are verify method test so both belong on a test spec"
files:
  - none — the procedure below is the definition; the observed session is the evidence
---

## Scope

One pass through the bucket, watched by a person. The story is a MUST, and a
must story is demonstrated end to end rather than checked cheaply.

WHY A DEMONSTRATION AND NOT A TEST. tsp-the-bucket already drives the
mechanism with assertions. What a test cannot show is whether the path is
REACHABLE — whether somebody meeting a real finding mid-walk actually reaches
for `[owed]` rather than fixing it out of turn or dropping it in a note.

i34 IS THE EVIDENCE THAT REACHABILITY IS THE RISK. The `[owed]` shape existed
for months and was written zero times in a whole iteration. Every box was
ticked `[x]`.

## Approach

System level, in a real walk, on a finding nobody planted. The demonstration
waits for one to turn up rather than staging it, because a staged finding
proves the mechanism and not the reach.

## Procedure

1. Walk a real state until a check turns up a defect that blocks nothing
   downstream — a stale comment, a mis-citation, a name that no longer matches.
2. Judge whether it blocks. Say out loud which later claim would rest on it,
   and why none does.
3. Record it as `- [owed] <item> — <ref>` on the state's checklist, pointing at
   an open register entry that carries an owner.
4. Submit. Observe that the state signs and the walk moves on.
5. Walk several more states. Observe that nothing re-raises the finding, and
   that no later claim quietly depends on it.
6. Attempt the close. Observe that it refuses and names the owed item with its
   entry.
7. Clear it or argue it, then close.

## What the demonstration must NOT do

IT MUST NOT PLANT THE FINDING. Step 1 waits. A demonstration that manufactures
its own defect answers whether the mechanism works, which tsp-the-bucket
already answers, and says nothing about whether anybody would use it.

IT MUST NOT SKIP STEP 2. The judgment is the part that can be wrong, and
writing it down is what makes it arguable later. A disposition nobody can
disagree with is the failure raid-risk-an-owed-item-without-a-guard-ships-a-
known-defect describes.

## Not yet performed

THIS PROCEDURE HAS NOT BEEN RUN. The spec defines how the story is
demonstrated; it does not claim the demonstration happened. It fills at M8,
which is what makes the story its own validation container.
