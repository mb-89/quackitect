---
form: verification
by: agent
signed_off: 2026-08-18T19:37:38.012Z
authors: agent
files:
---

# Evidence form / verification

## current_situation

A TESTER WITH FRESH CONTEXT VERIFIED i16 AND FOUND TEN THINGS. Five were code defects and are fixed. Five are recorded and belong to fix-findings.

### What the fresh eyes were for, demonstrated

THE BUILDER DOES NOT VERIFY THEIR OWN BUILD, and this round is the argument for that rule rather than an illustration of it. Every one of the five code defects had passed a build, a battery and my own reading.

### The five that are fixed

- A VEHICLE CARRIED 20.8 MB OF THE ENGINE'S RELEASE ARCHIVES. The producing act and the packaging script kept two exclusion lists while a comment claimed they were one. `dist`, `scratchpad`, `.obsidian`, `.vscode` and the root `.github` all travelled. They are one list now, called from both.
- THE ONE FILE THE ARRIVAL NEEDS WAS DROPPED. The root `.claude/settings.json` is committed and is the only hook a fresh clone reads at session start. The packaging script carries a written exception to keep it, found by USING a package rather than building one. The producing act reproduced the exact defect that fixed.
- THE PROJECT ACT WROTE INTO THE TREE IT WAS LAUNCHED FROM, minting an identity into the launcher's brand file. I justified it as "what a normal run records anyway" and the tester checked that claim: nothing else in the product ever writes it. It was the one write outside the produced tree, which is exactly what the requirement forbids. It refuses now.
- A FAILURE PAST THE COPY LEFT A COMPLETE-LOOKING TREE. Three later steps can throw with the tree already on disk. The act now returns the destination to whichever state it was found in.
- TWO ASSERTIONS COULD NOT FAIL. `JSON.stringify(x).includes(windowsPath)` never matches, because JSON escapes every backslash. Both would have passed against an engine that DID write the path back.

### The third wrong-reason pass, as predicted

I TOLD THE TESTER TO ASSUME THERE WAS A THIRD because two had already been found and fixed this iteration. There was. That is worth more than the fix: the failure mode is systematic in how I write assertions, not a run of bad luck.

## claims

- [x] tsp-autonomy-tiers
- [x] tsp-bound-surface
- [x] tsp-coupling-disposition
- [x] tsp-derivation-analysis
- [x] tsp-desk-and-gates
- [x] tsp-first-run
- [x] tsp-panel-walkthrough
- [x] tsp-prose-inspection
- [x] tsp-read-back-inspection
- [x] tsp-record-inspection
- [x] tsp-the-arrival-in-one-act
- [x] tsp-the-cited-refs-resolve
- [x] tsp-tour-run
- [x] tsp-two-machines
- [x] tsp-unattended-start
- [x] tsp-a-slow-signal-keeps-the-wait
- [owed] tsp-a-vehicle-is-made-and-then-drives-something-else — raid-iss-the-vehicle-demonstration-has-never-been-performed
- [owed] tsp-the-engine-keeps-no-record-of-what-it-produced — raid-iss-the-call-log-names-every-vehicle-the-engine-produced

## follow_up

IMMEDIATELY: fix-findings, for the five the tester left standing.

### The five that are not fixed, each with its note

- THE CALL LOG NAMES EVERY VEHICLE. The test-spec says "no log line naming it"; the lane logs every call's arguments, so the engine's own log holds each vehicle's path, name and identity. Two honest resolutions and they are not equal. note-db6817fd0aa0.
- TWO WORKING FUNCTIONS NOTHING CAN CALL. `drivenBy` and `inventory` are built and tested and reachable by no verb, route or command. i16 wrote a reachability test for exactly this and pointed it only at the two producers. note-c1c3a1142cb1.
- THE PRODUCT NAME IS SPELLED IN NINE PLACES BELOW THE ROOT, against a requirement that says zero and asks for a test nobody wrote. The editor icon is the sharpest: a vehicle called Blue Heron ships an icon titled with the engine's name. note-8aae512f9e01.
- THE INVENTORY REPORTS COMMITTED WORK ONLY, so a vehicle owner mid-edit is told they changed nothing. That is the state they will most often ask from. note-6b6478039e3e.
- THE REACHABILITY TEST IS HALF A GUARD, covering two verbs where the enumeration for every verb already exists. note-d0884030dc6c.

### The two claims left unchecked, and why

`tsp-a-vehicle-is-made-and-then-drives-something-else` IS A DEMONSTRATION NOBODY PERFORMED. It needs a second machine with nothing of the engine on it. Checking it would be a claim about an observation that did not happen.

`tsp-the-engine-keeps-no-record-of-what-it-produced` HAS FIVE ATTRIBUTES HOLDING AND ONE FAILING, which is the call-log finding. Five of six is not green.

### And the one red the battery still carries

THE FORMATTER-CHURN ALARM, 874 of 1695 notes against a 50 percent limit. Corpus-wide, spanning i10 through i16 and the method cards. Not this iteration's authorship. The fix is one `se_format` call, proven meaning-preserving by the test directly above the failing one, and it wants the owner's word because it touches method and guidance files.

## anything_else

### On the sixteen claims that are checked

THEY COVER STANDING BEHAVIOUR FROM EARLIER ITERATIONS and i16 changed none of it. The battery re-ran all of it: 1470 of 1471 cases pass, and the one failure is the corpus churn alarm rather than any behaviour.

THAT IS A WEAKER CLAIM THAN "OBSERVED GREEN BY FRESH EYES" and it should be read as what it is. The tester was pointed at what i16 built, because that is where a fresh reading pays. Sixteen unchanged specs re-observed by hand would have cost the round and found nothing.

IF THAT TRADE IS WRONG, the place to say so is the gate.

### What the tester could not do

IT WAS READ-ONLY AND DID NOT RUN THE BATTERY. Every verdict it gave is inspection against cited lines, and it said so rather than borrowing my run as its own observation. The one thing it took from me it labelled as mine.

### The finding I would keep if I could keep only one

THE EXCLUSION LISTS. A comment said two lists were one list; they were not; the difference shipped 20.8 MB into every vehicle and dropped the file the product's headline feature depends on. A comment cannot make two things agree. Only calling one function can — which is the same lesson `readproof.ts` was written for three days ago, in this same repository.
