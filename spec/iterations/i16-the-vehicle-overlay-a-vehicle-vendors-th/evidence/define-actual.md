---
form: define-actual
by: agent
signed_off: 2026-08-18T09:55:53.588Z
reopened: 2026-08-18T09:53:21.714Z — The vision re-signed with a sixth goal — nothing a descendant does can reach its parent. The as-is owes where we stand on that today, and the honest answer is a good rather than a pain.
authors: agent
files: null
---

# Evidence form / define-actual

## current_situation

The walk stands at define-actual, RECHECKED after the vision re-signed with a sixth goal: nothing a descendant does reaches its parent AUTOMATICALLY.

THE BODY BELOW STOOD AND STILL STANDS. Nothing in it was written on the sealed model — it records what the product does today, and none of those facts moved.

WHAT THE RECHECK ADDED is a section that should have been here from the start: what everybody else already does. The owner ruled it plainly — vendoring with updates is ordinary, and nothing here is being reinvented. That is a baseline fact and it had been missing, so the register was carrying an ordinary engineering choice as an unsolved problem.

ITS WITNESS IS PRIMARY AND WAS FETCHED THIS SESSION: git-subtree's own documentation in git's tree, which describes the whole round trip in its own words.

AND ONE FRAMING LINE IS CORRECTED. The earlier version described this state as one the recompile had crossed. That is history rather than baseline and it is gone.

## as_is

PRESENT TENSE, GOOD AND BAD, and every claim below carries a witness read or measured THIS SESSION rather than recalled.

### What works, and it is more than the pains suggest

THE ENGINE GOVERNS A REAL PRODUCT AND HAS FOR MONTHS. Witness: our own history. Three iterations shipped on 2026-08-17 alone — i33, i34 and i35 — each with 25 or 26 signed evidence forms, three blessed gates and a green battery. The battery stood at 1439 tests this morning.

A COMPLETE COPY CAN ALREADY BE PRODUCED, TWO WAYS. Witness: the code, read this session. `RUNME.ps1 --export <folder> <name> <abbr>` at lines 57-155 copies the tree, renames the brand and makes a fresh repository with one commit and no history. `engine/bin/package.ts` assembles a shippable archive under dist. Both run and both produce something that starts.

SO ONE GOAL IS ALREADY HALF MET AND NOBODY HAD NOTICED. A descendant that runs alone, with nothing of the parent installed beside it, is what `--export` already produces today.

AND THE COPY IS A REAL COPY RATHER THAN A LINK. Witness: the export creates a fresh git repository with its own single commit. Whatever else is wrong with it, it leaves no path back into this tree.

THE METHOD ITSELF IS ALREADY FILE-SHAPED AND IDENTIFIED, which is what makes an override layer possible at all. Guidance cards, machine states, matrix rows and form templates are documents with an `id:` in their frontmatter. Witness: `id: front-desk`, `id: voice`, `id: boot-method`, read this session.

### What everybody else already does, and we do not

THIS IS ORDINARY. A copy that takes updates and sends changes back through a review step is a solved, widely used arrangement. Witness, primary and fetched this session: git-subtree's own documentation at raw.githubusercontent.com/git/git/master/contrib/subtree/git-subtree.adoc.

WHAT IT SAYS, IN ITS OWN WORDS, on each half of what this iteration wants.

- OWNERSHIP: "A subtree is just a subdirectory that can be committed to, branched, and merged along with your project in any way you want."
- RECEIVING WITHOUT LOSING YOUR CHANGES: `merge` "doesn't remove your own local changes; it just merges those changes into the latest <local-commit>".
- COLLISIONS: "If your merge introduces a conflict, you can resolve it in the usual ways." A person decides, and that is the whole answer.
- SENDING BACK, AND ONLY ON PURPOSE: "changes made in your local repository remain intact and can be later split and send upstream to the subproject." It takes two explicit commands, `split` then `push`. Nothing travels on its own.
- AND IT IS DESIGNED TO BE INVISIBLE TO THE RECEIVER: subtrees "do not force end-users of your repository to do anything special or to understand how subtrees work".

WHAT WE DO INSTEAD: a fork. Witness: `RUNME.ps1` lines 57-155, a fresh repository with one commit and no history. Every property above is available off the shelf and we take none of them.

SO THE GAP IS NOT KNOWLEDGE. The mechanisms exist, they are documented, and one of them ships inside git. What is missing is that our copy step throws away the relationship the moment it makes the copy.

AND THE OWNER RULED EXACTLY THIS, 2026-08-18: "If I vendor or import, then I don't have automatic throughput on the thing that's upstream. That's normal. And then if I wanna push something back, I do it via PR or, in our case, via a note. We are just doing what everybody already does."

### What does not work

THE COPY IS A DEAD END. Witness: the export path itself. A fresh repository with one commit and no history has no relationship to the parent afterwards — nothing to pull from, nothing to send back, and no record of where anything came from. It is a fork in every sense except the name.

METHOD RESOLVES FROM TWO HARDCODED LISTS AND NOTHING ELSE. Witness: `PROMPT_SOURCES` at engine/promptlayer.ts lines 22-34 is four literal paths. `METHOD_PREFIXES` at engine/paths.ts lines 172-177 is three literal prefixes. A descendant wanting to say something different about how it works has exactly one option today: edit the file in place, with no record that it changed and no way to tell later what was ours.

AND THAT IS THE PAIN RATHER THAN THE MISSING FEATURE. After a hundred in-place edits, nobody — not its owner, not us, not the machine — can answer which of them we also changed since. A tool that tracked the copy would answer it for free; ours does not track the copy.

THE BOUNDARY THIS WORK CROSSES HAS NEVER BEEN MODELLED. Witness: `flow-overlay` carries `crosses: in` and appears in exactly two files in the whole corpus — its own node and fn-run-a-governed-walk.hold-the-method, which takes it as an input. NO INTERFACE CARRIES IT. It has stood that way since i1 minted it.

THE SEAM'S TESTS ARE WRITTEN AS PROMISES. Witness: tsp-overlay-seam says in its own Approach that THREE of its four claims are "DEFINED ahead of their cases — the overlay mechanism is not built". tests/overlay.test.ts does not exist.

AND THE PRODUCT HAS ONLY EVER DRIVEN ITSELF. Witness: project/product.md declares `self_hosting: true` and says so plainly — "Only Quackitect works on itself". Every measurement this system has of its own method is a measurement of it working on its own source.

### The pain with the sharpest witness, and it is in the corpus rather than the code

A COPY MECHANISM THAT LINKS RATHER THAN COPIES HAS ALREADY DESTROYED A REPOSITORY. Witness: `product/spec/ledger/se/law-imports-are-read-only.md` at ref v2, read this session. On 2026-07-25, package.json declared the kb module as an npm `file:` dependency, npm implemented that as a SYMLINK into the sibling benjamin checkout, and a routine `git worktree remove --force` followed the link and deleted benjamin's working tree and its .git.

THE LAW'S OWN VERDICT: "The symlink was only the mechanism of the day — what actually failed was that a write reached the imported source at all."

AND v3 DOES NOT CARRY THAT LAW. Witness: a search of the whole corpus for hard link, hardlink, symlink and junction returns 18 hits — ten in vendored mermaid source, four in tests/helpers.ts, two in i23's record, one in RUNME.ps1, one in lintfix.test.ts. No rule, no decision, no requirement.

WHAT v3 CARRIES INSTEAD IS A GARBLED DESCENDANT. `req-engine-folder-is-sealed`, minted i1 and graded crippling, says the engine resolves from inside its own folder and writes zero files there. The law protected the SOURCE upstream; the requirement protects a folder inside the copy. The law GRANTED that a vendored copy may be modified — "only a VENDORED dependency may be modified, and only our own copy of it" — and the requirement reads as forbidding exactly that.

SO THE BASELINE INCLUDES A CORPUS DEFECT AS WELL AS A PRODUCT ONE. The most consequential rule this iteration touches was decided correctly a year ago in a previous version, and arrived here meaning something else. Nobody noticed until the owner read a goal built on it.

### One more thing that is new and belongs here

SHIPPING A COPY IS NOT THE SAME AS SHIPPING A WORKING PRODUCT, and we learned it by using one. Witness: i35's package evidence, read this session. Everything upstream was green — 1404 of 1404, three blessed gates, the sweep closed its gap, the archive built without error — and the archive shipped its headline feature with the wire cut. `.claude/settings.json` at the repository root is the only file a fresh clone reads at session start, and a name-match written before that feature existed filtered it out.

WHY IT BELONGS IN THIS BASELINE. The mechanism produces a tree, and nobody can tell from inside this repository whether that tree works, because every check we have describes this repository.

### What the baseline inherits rather than restates

THE RESIDENT AS-IS FOR THE ENGINE ITSELF IS UNCHANGED and is not re-derived here. The walk, the lane, the gates, the ledger and the mirror all stand as the last records left them.

## follow_up

IMMEDIATELY: log-risks, and one entry there is now WRONG rather than merely stale.

raid-risk-ownership-and-receiving-pull-against-each-other is graded CRIPPLING and frames taking an update onto a modified copy as an open problem. The git-subtree witness above settles that it is not. Merging upstream changes into a locally modified subdirectory is a documented, shipped operation, and its answer to a collision is that a person resolves it in the usual ways. THE ENTRY IS REWRITTEN THERE, not deleted: what remains is real and much smaller — WHICH ordinary mechanism, and what our method layer needs on top of it.

AND THAT REWRITE DOES NOT MOVE THE COLUMN. major was argued on a certain interface tell and on three candidate overlay locations, neither of which this changes. It makes M4 a comparison of known options rather than an invention, which is what M4 is for.

THEN frame-delta, which wants the same recheck. Its gap claim must now say the gap is the RELATIONSHIP rather than the knowledge: everything needed is off the shelf, and our copy step discards it at the moment of copying.

THE REMOVAL OF req-engine-folder-is-sealed IS CARRIED TO write-requirements at M3. That is the state that may retire a requirement, and it must sweep what points at the node first. i34 deleted ten requirements without sweeping and had to restore two.

THREE THINGS IN THIS BASELINE BECOME PASS LINES DOWNSTREAM, so write-requirements does not rediscover them.

- A descendant runs with nothing of the parent installed. Measurable as the count of its dependencies on this working copy, target zero.
- No structure a descendant carries lets an operation reach the parent. Measurable, and it is the law's own subject.
- An interface carrying flow-overlay. Today zero, target one.

AND ONE CONSTRAINT ARRIVES THAT NOTHING IN THIS ITERATION HAD ASKED FOR: the SPAWNING mechanism is constrained, not only the running one. However a descendant comes into being it must be a real independent copy — no symlink, no junction, no hardlink, no mount, no install step that writes to the source.

ONE MORE THING IS OWED AND IS NOT DONE HERE. The prior-art comparison is one mechanism deep. git-subtree is read and quoted; vendor directories, package managers and copy-with-history tools are not. enumerate-space is where that widens, and gate-motivation passed on that condition.

## anything_else

WHY THE SEARCH TOOL WAS NOT USED, since a witness this central should say how it was found.

se_web_search is refused with SE-C-106: no provider is configured, and it wants SE_BRAVE_API_KEY in the server's environment. Its own remedy points at se_web_fetch, which needs no key.

SO THE CITATION IS A FETCH OF THE PRIMARY DOCUMENT rather than a search result. git-subtree's manual page in git's own tree, at master. The first attempt went to git-scm.com/docs/git-subtree and returned 404 — that page moved in a site redesign, by the site's own message.

WHY THAT IS BETTER RATHER THAN A FALLBACK. The rule is to prove to the original source and not to an article about it. A search would have returned blog posts about vendoring; this is the tool's own documentation saying what the tool does.

AND IT IS ALSO THE LIMIT OF THE COMPARISON. One mechanism, read properly. That is a start rather than a survey, and the survey is owed at enumerate-space.
