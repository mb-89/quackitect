---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: colonless pushes go unread
# where the token stands. The process owns these values.
status: open
# the person's own name for a group. It does not move the work
bucket: claims
claimed_by: 7e7f0da1/main
claimed_at: "2026-09-06T20:42:44Z"
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - eeaead7d7261b6bfc98990eae543f72f9df9b9e0
---

## detail

util/checks/pushes-name-a-branch, written on wk-ea4718cc4c, reads a push argument only when it holds a colon. theRefspecs ends with a filter on a.includes of a colon, so an argument without one is dropped before anything judges it. git push origin refs/tags/archive/<id> carries no colon. That form is the second regression the check names in its own header, beside the claim relay, and the check cannot see it.

MEASURED, 2026-09-06, reviewing wk-ea4718cc4c. A copy of the check was run over a tree holding the real src/engine/claim.go beside one file whose whole body is gitIn(ctx, r, "push", "origin", archiveRefs+id) with archiveRefs = "refs/tags/archive/". It answered: 2 push(es) read over 2 file(s). 0 failed. Exit 0. The archive push was neither counted nor named.

Three more shapes are dropped the same silent way. A push whose arguments wrap over two lines is never seen, because theRefspecs reads one line. A refspec built by a call is cut short, because the line is split at its first closing paren. A package under src that is not engine, mcp or viewer is not read at all, because that list is written into the check.

The only guard against a drop is the line that says a push was found to judge, and it counts every push together. The two in claim.go keep it satisfied, so all four shapes stay green.

## proposed action

Judge every argument after the remote as a ref rather than only the ones holding a colon. A colonless refspec lands on the remote where it names, so refs/tags/archive/<id> gets read exactly as refs/heads/se/claims does. Read the whole call rather than one line of it, and read every package folder under src rather than three that were written down.

## done when

- the check exits 1 and names the offending line over a tree whose only extra push is gitIn(ctx, r, push, origin, archiveRefs+id) with archiveRefs of refs/tags/archive/, beside the real src/engine/claim.go
- the check still exits 0 over the tree as it stands, by ./RUNME.sh test --on <this token> --propose pushes-name-a-branch
- a push whose arguments wrap over two lines is read and judged, and a fixture under the same run proves it

## evidence: step 1. ask

<!-- write what is asked and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | what is gained by doing it, and not only what it does | The check now judges four shapes it dropped: a colonless refspec, a wrapped call, a refspec a call builds, and a package outside three written-down folders. | reader.mjs over the probe tree |
| [x] | what breaks if it is never done, and not only that it stays undone | A push to refs/tags or refs/notes ships green and fails only on a cloud box. Six archived notes were already lost that way. | doc/work/wk-73c44bed1d.md detail |
| [x] | the ask is small enough to review whole, or it is split first | — | one file changed |
| [x] | every done-when line is decidable, and names the command where one decides it | Line one runs the check over a probe tree. Line two names RUNME.sh test. Line three names a fixture in the same run. | the three done-when lines |
| [x] | the basics it stands on exist, or are minted first | — | the check already stands |

## evidence: step 2. do

<!-- write one test, watch it go red, make the change, watch it go green -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the guidance this token names was read and applied | — | trivial process |
| [x] | one test was written first and seen red for the reason expected | Over a probe tree holding the real claim.go beside one colonless archive push, the check answered FAIL src/engine/archive.go:6, exit 1. The old reader answered exit 0 over the same tree. | node reader.mjs .se/scratchpad/pushprobe |
| [x] | the same test was seen green after the change, and named | pushes-name-a-branch ran green over the tree as it stands, 2 pushes read, 6 fixtures driven. | ./RUNME.sh test --on wk-73c44bed1d --propose pushes-name-a-branch |
| [x] | the change is git diff began..ended, the two hashes the engine wrote on this token | — | one file, util/checks/pushes-name-a-branch.mjs |
| [x] | the cleanup the change revealed is in the change, or is a token of its own | The hard-coded package list and the line-at-a-time reader went with it, rather than being left beside the fix. | util/checks/pushes-name-a-branch.mjs theSource |

