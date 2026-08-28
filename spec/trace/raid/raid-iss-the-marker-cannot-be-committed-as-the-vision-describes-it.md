---
minted_in: i9
id: raid-iss-the-marker-cannot-be-committed-as-the-vision-describes-it
type: "[[raid]]"
kind: issue
statement: The iteration's marker plan cannot work as written, because git tracks files and never directories, so a folder whose every file is ignored appears in no clone.
owner: the driving agent
status: superseded
impact: The headline outcome fails silently. A fresh clone finds no marker, and nothing says so, because the folder exists locally for whoever made it.
breaks_how_badly: crippling
how_likely: certain
source_refs:
  - "the vision's own words: change .gitignore so the folder itself is tracked and its contents are ignored"
  - git FAQ, recommending a .gitignore inside the directory over a .gitkeep placeholder
---

## What the vision asks for

THE FOLDER IS TRACKED AND ITS CONTENTS ARE IGNORED, so a fresh clone still
finds the marker.

## Why that cannot happen

GIT TRACKS FILES, NEVER DIRECTORIES. A directory exists in a clone only
because a file inside it does. Ignore every file in a folder and the folder is
not in the repository at all.

SO THE TWO HALVES OF THE SENTENCE CONTRADICT EACH OTHER. Tracked and
contents-ignored cannot both hold with no exception.

## The analogy in the vision is false, and it is worth saying why

THE VISION CITES OUR OWN `.gitignore` LINE 10, which ignores one named file
inside the editor's folder and not the folder itself.

THAT FOLDER SURVIVES A CLONE FOR A DIFFERENT REASON: it holds other files that
ARE committed. One ignored file among several committed ones is not the same
shape as every file ignored.

## The fix, and it is small

PUT A `.gitignore` INSIDE THE FOLDER carrying two lines: `*` and a negation of
itself. Git's own FAQ recommends exactly this over a placeholder file, because
one file then does both jobs — it keeps the directory in the repository and it
excludes everything beside it.

THE PREDECESSOR'S ANSWER ALSO WORKS AND IS STRONGER. It committed a named
marker FILE, found by walking up from wherever the caller stood, with absence a
loud error rather than a silent fallback. The vision already says to weigh it
first.

SO THE CHOICE IS BETWEEN TWO WORKING MECHANISMS rather than between a working
one and a broken one. That choice belongs to the design milestone.

## Why this was not caught before

THE SENTENCE READS CORRECTLY. Every word in it is ordinary, the analogy sounds
apt, and nothing in the corpus contradicts it. It was found by a prior-art scan
at the gate asking how other systems mark a project root.

## Superseded 2026-08-19, hours after it was minted

THE FINDING IS STILL CORRECT AND NOTHING RESTS ON IT ANY MORE. A folder whose
every file is ignored appears in no clone, and the vision did ask for exactly
that. Both halves of this entry hold.

WHAT REMOVED IT. The owner ruled that the folder open in the editor IS the
project being worked on, and that the differentiation between one project and
another is which folder is open. Nothing has to be recognised from inside a
clone, so no marker is needed at all.

SO THE QUESTION THIS ENTRY ANSWERED STOPPED BEING ASKED. It was not solved and
it was not dropped. The mechanism it was about is gone from the iteration.

WHAT IT IS STILL WORTH READING FOR. The git pattern it names — one committed
file carrying a catch-all and a negation of itself — is the right answer
whenever somebody genuinely does need a directory to survive a clone. That is
not this iteration, and it may be another one.

AND THE SHAPE OF THE ORIGINAL MISTAKE OUTLIVES BOTH. A sentence where every
word is ordinary, an analogy that sounds apt, and nothing in the corpus to
contradict it. It took a prior-art scan at a gate to catch, and the scan was
run because the method demands one rather than because anybody suspected.
