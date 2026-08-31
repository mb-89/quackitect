---
id: wk-58bceb45f3
seq: "25"
type: work
title: source becomes src
status: closed
assignee: main
scope: single-step
traced: true
disposition: done
subs:
  - wk-25feb4418f
rounds: "1"
minted_by: person
---

## detail

Rename source to src, with the move verb, and run the battery.

THE RENAME IS A TEST OF THE MOVE VERB. The owner asked for it that way. If
anything fails afterwards, the verb missed a reference, and that failure is a
finding on the verb rather than a chore to patch by hand.

DO IT LAST. Every other piece of work in the queue names paths under source,
and moving the folder under them costs more than it saves.

WHAT COUNTS AS DONE: se move --from source --to src, then the whole battery.
go test in each module, se lint, and the render check. A green suite is the
evidence. A red one is the next piece of work on the verb, and the fix belongs
in the verb.

## evidence: and I narrowed rather than dropped, which is the choice the finding offered

A bare name is reported only where a quote or a separator sits on both sides of it. That is what a path segment looks like in join(root, "source", "engine") and it is not what a sentence about a source looks like. The comment says which of the two answers was chosen and why.

## evidence: and driven through the verb

A throwaway tree with source/engine, a run.sh naming source/engine and a check.mjs naming it as a segment. se move --from source --to src answers rewritten 1, unrewritten 1, and the unrewritten entry names check.mjs with its line. Before this it answered unrewritten 0 with the same file broken.

## evidence: checks

sh .se/scratchpad/battery.sh, run immediately before this submission. go build ok, go test ok (quackitect/engine 42.7s), go test mcp ok, go test viewer ok, se lint ok, render-check 0 failed, drive-editor 11 messages sent 0 failed, engine-args 0 failed, one-look 0 failed, panel-icons 0 failed, no-loose-glyphs 0 failed, no-loose-spawns 7 files read 0 failed. All ok.

## evidence: finding 1, the verb went silent about what it decided not to rewrite

The finding is right and it is the verb's own named failure one spelling along. The comment in move.go already says that asking the report with the narrowed spelling meant it could not see what that spelling skipped. The fix that comment records made the sweep use every spelling the REWRITE used. It does not cover the spelling the rewrite deliberately does not use, and that is the one that bit this move.

## evidence: proved red

With the declined spelling out of the sweep it reports that check.mjs and check.py name the folder as a path segment and the report is silent about them, and that it reports 0 references it could not reach.

## evidence: the check, and it pins both sides of the branch

TestATopLevelMoveReportsWhatItDeclinedToRewrite builds a top-level move with one file naming the folder with a slash, one .mjs naming it as a quoted segment, one .py doing the same, and one sentence about a source. It requires the report to name the .mjs and the .py by path, requires it not to name the sentence, requires the count to be at least two, and requires the slashed spelling to still be repaired. TestANestedMoveRewritesTheSameSegments puts a nested move beside it and requires the same two files to be REWRITTEN and nothing reported, so the check holds the difference between the branches rather than one side of it.

## evidence: the four things the rename found are unchanged

The named files, the path written out in full, the shell scripts, and the escape for a file whose every path is a fixture. The reviewer proved two of the four red itself.

## evidence: the rewrite rule is unchanged

A top-level folder's bare name is an English word and it is not edited. That decision is right and I would keep it too.

## evidence: what changed is the report

The rewrite asks may I change this. The report asks does the caller still owe something here. They are different questions. declinedPairs answers the spelling the rewrite refuses, and the sweep carries it alongside the ones it uses, so the unrewritten list names every place the old name was written as a path.

## finding 1 · round 1 · THE RENAME IS A TEST OF THE MOVE VERB. If anything fails afterwards, the verb missed a reference, and that failure is a finding on the verb rather than a chore to patch by hand. / move.go: What was repaired, and what it could not reach. The second is work the caller still owes, which is why it is answered rather than swallowed. · by reviewer4

**wrong:** SEVEN FILES WERE PATCHED BY HAND AND THE VERB'S OWN REPORT SAID THERE WAS NOTHING TO PATCH. That is the clause, and it is not the hand-patching I am rejecting -- the decision not to rewrite a top-level folder's bare name is right and I would keep it. What is wrong is that the verb went silent about what that decision left behind. MoveResult's own comment says the unrewritten list is 'work the caller still owes, which is why it is answered rather than swallowed'. It swallowed all seven. WHY. residualHits is swept with the same pairs the rewrite used (move.go:218-231, sweep := use). For a top-level directory move, refPairs (move.go:96-114) makes exactly one pair, source/ -> src/, because the bare pair is added only when strings.Contains(from, "/"). So the report looks for source/ and nothing else, and a file that names the folder as its own path segment -- join(root, "source", "engine") -- contains no source/ and is never seen. REPRODUCED, with an engine built from source minutes ago, in .se/scratchpad/reviewer4/a-segment-not-a-slash.sh, run in a lab outside any project. A tree with source/engine/main.go, a run.sh saying go build -C source/engine, a check.mjs saying const here = join(root, "source", "engine"), and a check.py saying the same in Python. se move --from source --to src answers: moved source -> src, 4 files searched, rewritten run.sh with 1 replacement, and unrewritten [] total 0. Afterwards check.mjs and check.py still name source/engine, and the folder they name does not exist. Zero unrewritten, two files broken. THIS IS THE VERB'S OWN NAMED FAILURE, ONE SPELLING ALONG. move.go:218-221 already says it: 'Asking with the narrowed spelling alone meant it could not see what that spelling skipped, and the verb answered zero unrewritten while leaving two.' The fix that comment records made the sweep use every spelling the rewrite used. It does not cover the spelling the rewrite deliberately does NOT use, which is the one that bit this move. EXTENT, one pass. The silence is exactly the set the rewrite declines: for a top-level directory the bare name, and nothing else. For a nested folder refPairs adds the bare pair, so both the rewrite and the report see it and this cannot happen. So it is one branch, move.go:111-113, and its consequence in the sweep at move.go:222. It is also the branch this project will keep using, because source, src, doc and util are all top-level. AND IT IS WHAT ACTUALLY HAPPENED HERE. The submission says six checks and one setup file joined the folder name as its own path segment and were repaired by hand. Nothing in the verb's answer named any of them; they were found when the suite went red, which is the sequence the token's second paragraph was written to prevent. WHAT IS DONE, AND I CHECKED IT RATHER THAN TAKING IT. The folder is src and there is no source folder. I swept the whole tree, hidden files included, for source followed by engine, extension, mcp or viewer, excluding the record and doc/work, which the submission correctly says are history: every remaining hit is a fixture inside move_test.go or roots_test.go, each either on a line marked 'not a path' or inside the file that declares its paths are fixtures. Every bare 'source' left in a config or a script is the English word or a JSON key -- voice-rules.json, setup/editor.go's "source": "vsix", manifest.json's "source": "src/engine". util/setup/manifest.json points at src/engine, src/viewer and src/mcp. I PROVED TWO OF THE FOUR CHECKS RED rather than reading them. Emptying namedFiles makes TestAMoveRepairsAFileNamedRatherThanExtended report that .gitignore still names the old folder. Removing the absolute-spelling pair at move.go:177-181 makes TestAMoveRepairsAPathWrittenInFull report that a path under this folder, written in full, was left behind. Both pass in the tree. The battery is green: I ran the whole set after rebuilding and go build, go test in all three modules, se lint, render-check, drive-editor, engine-args, one-look, panel-icons, no-loose-glyphs and no-loose-spawns all answered ok. One earlier run reported go test FAIL and re-running the same package immediately answered ok -- other agents were editing src/engine while I reviewed, and src/engine did not compile at all at two points during this review. I am not counting that against this submission.

**satisfies:** REPORT WHAT YOU DECIDED NOT TO REWRITE. Keep the rewrite rule exactly as it is -- a top-level folder's bare name is an English word and must not be edited -- and widen only the residual sweep, which is a different question: the rewrite asks 'may I change this', the report asks 'does the caller still owe something here'. Concretely, at move.go:222 build the sweep from refPairs plus, for a top-level directory move, the bare pair the rewrite refused, so unrewritten names every line that still says the old folder's name. IF THAT IS TOO LOUD, NARROW THE REPORT RATHER THAN DROPPING IT, and say in the comment which you chose: report the bare name only in files whose format is in sourceFormats, and only where the character before or after it is a quote or a separator, which is what a path segment looks like in join(root, "source", "engine") and is not what a sentence about a source looks like. Either answer satisfies the clause; silence does not. THE CHECK, RED TODAY, AND I HAVE RUN IT. A fixture tree for a TOP-LEVEL directory move holding three files: one naming the folder with a slash, one .mjs naming it as a quoted path segment, and one .py doing the same. Move the folder and require unrewritten_total to be at least two and the unrewritten list to name both the .mjs and the .py. Today it is 0 and the list is empty. Assert the count and the paths, not just the count, so the check still means something if the report starts listing something else. And put a nested-folder case beside it asserting the same two files ARE rewritten, so the check pins the difference between the two branches rather than only one side of it.

## lesson 1 · round 1 · by reviewer4

**the class:** A deliberate exclusion that was applied to the doing and forgotten in the reporting. The verb has two outputs, what it changed and what it could not reach, and both are computed from the same list of spellings. When a spelling was removed from that list on purpose -- the bare name of a top-level folder, for a good reason -- it left the rewrite AND the report at once, so the one thing that would have told the caller about the exclusion was disabled by the exclusion itself. The report then said zero, which reads as nothing to do, when what it meant was I did not look. That is a stronger failure than the original gap: the caller acted on the zero.

**instead:** Whenever a tool both acts and reports on what it could not do, keep the two lists separate and say so in the code. Anything you deliberately refuse to act on belongs in the report list, not out of both -- a decision not to touch something is exactly the thing the caller needs told. Before shipping such a refusal, write the sentence 'the caller finds out about this by ...' and finish it; if the only ending is 'their test suite goes red later', the refusal is not finished. And distrust a zero from a search whose terms you just narrowed: zero results and zero searches look identical in the output, so make the report say what it looked for, or assert in a test that a known-missable case comes back non-zero.

**minted as:** wk-5544578d91

