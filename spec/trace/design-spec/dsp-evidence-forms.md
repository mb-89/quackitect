---
unreachable_citations:
  - spec/trace/neighbour/nbr-something.md
minted_in: i1
id: dsp-evidence-forms
type: "[[design-spec]]"
statement: evidence forms built from state declarations and checked at every save, carried by one form model over markdown sections
realizes:
  - el-walk-engine
files:
  - deliverable/engine/stateform.ts
  - deliverable/engine/forms.ts
  - deliverable/engine/sessionforms.ts
  - deliverable/engine/stateform-problems.ts
  - deliverable/engine/stateform-sheet.ts
---

## A live source that resolves to nothing says so

req-an-empty-live-source-names-itself.

A `$name` NOBODY RESOLVES already throws, and that is the typo case. The
dangerous one is the source that resolves CORRECTLY and returns nothing: the
field renders as a plain control with no offer, which reads exactly like a
field somebody forgot to wire up.

THE FIELD'S RESOLVED ARGUMENTS NOW CARRY WHICH DECLARED SOURCES CAME BACK
EMPTY. A literal is not a live source, and a field declaring no source says
nothing — silence about a source nobody declared is correct silence.

## Responsibility

The form a state owes is derived from its declaration: fields, live
sources, templates and checks. The same checks run at save, at submit
and over stored evidence, so a signed claim that stops holding turns
grey. The per-state laws live here too — coverage, the spec laws, the
observation checklists.

## Behavior and constraints

- A live source resolves at serve time and freezes on a signed form.
- Bound fields rebuild from trace nodes on every look; a cell write
  lands on the node it names.
- A derived field is a reading, never a claim: nothing stored, nothing
  demanded.

## Coverage is mutual, and both sides are computed

`covers: <type>` ON A REFERENCE FIELD MEANS TWO THINGS AT ONCE, and neither
is a judgment call.

- Every referenced node must refine one of the covered type. A story serving
  no proposition is work nobody asked for.
- Every standing node of that type must be refined by SOMETHING IN THE CORPUS.
  A proposition no story serves is a promise nothing shows.

THE SECOND HALF USED TO READ THE AGENT'S LISTING, and that was the defect. The
covered side came from disk and the covering side came from whatever the agent
typed, so the check could be satisfied by naming nodes without examining any of
them.

MEASURED ON ONE WALK, FOUR TIMES: five typed names at write-stories,
twenty-two at generalize-use-cases, thirty-three at write-requirements, and a
fifty-five-row table echoed back at the engine at derive-functions. Nothing was
examined on any of them, and the cost of passing grew with the corpus while the
value stayed at zero.

BOTH SETS ARE ON DISK. The nodes are files and every `refines` edge is in
frontmatter, so the engine enumerates the covering side exactly as it already
enumerates the covered one.

WHAT THE FIELD STILL CARRIES is the one thing the corpus cannot answer: which
nodes THIS delta touched. That is judgment, and it stays.

## An empty set is a claim, and it is written

A BLANK FIELD AND A FIELD THAT HONESTLY FOUND NOTHING LOOK IDENTICAL
AFTERWARDS. So "one line saying none" is a legal answer, and a shaped field
needs the same door — without one, a state with nothing to tabulate can only be
passed by inventing a row.

FOUND AT A SCORE TABLE. A record that composes no candidates by construction
has no rows to score, and the only way past the check was a fabricated score.
The whole method exists to stop exactly that.

IT MUST OPEN THE SHAPE CHECK TOO. A `none` that satisfies the table and then
fails the line grammar is the same unsatisfiable pair by another route, which
this checker has now hit five times.

A CHART IS THE EXCEPTION. Two candidates is the floor, because one combination
is not a choice, and that check runs BEFORE the `none` door on purpose. An
enumerated space nobody has combined is unfinished, never empty, so `none`
may not buy its way past it. It once reached a gate with zero candidates drawn
and the only complaint was "no references", which reads like a formatting slip
rather than the missing work it was.

## Checking is the claim, and owed is the third state

A CHECKLIST REFUSES WHILE ANY NAMED ITEM STANDS UNCHECKED. There is no text to
write — the deliberate click is the record, and an unchecked box is work still
owed.

A THIRD STATE EXISTS FOR WHAT CANNOT BE HONESTLY OBSERVED. Rather than
fabricate a tick, `- [owed] <item> — <ref>` addresses the claim to an OPEN
entry in the register, so the debt has somebody with a trigger rather than
being merely declared.

IT NEVER COUNTS AS CHECKED. A missing or unresolved ref refuses exactly like an
unchecked box, because the only honest alternative to an owed box is a stall,
and an owed box is strictly more information than a tick.

## A cell that lost its tail

A NODE-TABLE CELL LANDS VERBATIM on the node's frontmatter. Four experiments
once reached their nodes ENDING IN AN ELLIPSIS with the clause that carried the
meaning gone, and all four were rewritten by hand.

THE COMMENT THAT USED TO SIT HERE SAID THE ENGINE WROTE NO ELLIPSIS, and that
was wrong in both halves. A one-line helper cut every frontmatter value at 200
characters and appended one. The searches the comment reported missed it
because the ellipsis was a template literal rather than a string literal, and
the limit was a bare number rather than a named maximum.

IT MISDIRECTED THREE HUNTS, because a comment asserting the result of a search
reads like evidence and nobody re-runs it. The cut is removed; this record
stands as the warning that A RECORDED SEARCH RESULT IS NOT A CHECK.

THE GUARD DOES NOT NEED THE CULPRIT. Whatever cut it, a frontmatter value that
trails off is not an answer, and the one outcome that must not stand is the
SILENT one: the form shows the whole text, the node carries a fragment, and the
ellipsis reads as style rather than as loss.

## The hint order

IT IS THE DIFFERENCE BETWEEN 149 QUESTIONS AND 873. Taken
most-important-first, every item is predicted to be the new bottom of the
chain, so the walk's one probe is the question most likely to be confirmed. A
wrong hint costs one question, never a wrong answer.

DAMAGE LEADS IT. Ordered from MoSCoW alone, a response-time requirement came
out above the foundations of the system — and no amount of pairwise comparison
discovers that, because the comparison never reads what breaks. Every
requirement already carries that line, and the grade leads the sort.

IT IS A HINT, NOT THE ANSWER. The walk still settles the order and a person
still overrules any pair. This only decides where it starts.

AN UNGRADED ROW SORTS IN THE MIDDLE. Not last, or every row written before the
scale existed would sink beneath rows nobody has thought about; not first, or
leaving it blank would be the way to the top.

## Fields are not what makes a claim

IN THE PLAINEST WORDS THE RULE HAS HAD: if it is not submitted, you are not
going to the next state.

THE CHECK ASKED WHETHER THE STATE DECLARED FIELDS, which is a PROXY. It holds
for almost every state and it failed on the one where it does not: a
law-proven state declares no fields on purpose, because its check is computed
rather than typed. Its own guidance says signing is a bare submit. So the state
read as claimless, the guard was skipped, and the walk completed a state that
had never been signed.

WHAT THAT COST: the walk crossed it three times. Two states were signed
underneath the gap, one of them a gate. The panel painted them green, an agent
read the record as finished and merged it to trunk, and the only route back to
the crossed state was twenty-five hops forward and around the entire machine.
The walk had to escape to the desk.

ASKING WHETHER THE STATE OWES A SIGNATURE ANSWERS IT, and it stays cheap: a
state with no form has no file, so machinery never pays the corpus load.

THE CORPUS LOAD IS PAID ONLY BY A CLAIMFUL COMPLETION. Hoisting it above that
condition put a full green recomputation on every mechanical hop and took the
green pass to 3683 ms over 200 nodes against a 1000 ms budget.

## An amend does not re-grey; a reopen does

WHAT STOOD HERE WAS THE OPPOSITE, and the correction is worth keeping rather
than the code alone. The rule read "an amend counts as freshly as a signature".
The effect was that every correction anywhere greyed every claim below it.
Fixing one sentence in a kickoff sent ten signed states back to be re-freshened
by hand, and each of those amends greyed everything below IT in turn. The walk
stopped converging.

THE TWO ACTS ARE DIFFERENT ACTS, and that is the whole distinction.

- An AMEND corrects a claim that still stands — a wrong figure, a stale
  sentence, a typo. The signature is kept because it still attests. Nothing
  below it is disturbed, because nothing below it was answering the corrected
  words.
- A REOPEN says the work is WRONG. The claim goes grey, its form is owed
  again, and everything downstream falls with it. That is the ripple, and it is
  the act to reach for when the QUESTION below has changed.

SO WHAT ABOUT A GATE WHOSE GOALS LIST IS REWRITTEN? That does change what every
gate below must answer, and an amend would slip it past them. The answer is not
to make amend behave like reopen. It is to REFUSE THE AMEND: a field that other
forms READ is not amendable, and the refusal names the reopen. Both halves stay
true — a correction stays cheap, and a changed question re-earns its answers.

## Evidence forms

Evidence forms — A3-shaped one-pagers (owner design 2026-07-27): a
TEMPLATE (machines/forms/<name>.md) declares the fields; an INSTANCE in
the expedition's record is the filled page. The check is a MECHANICAL
LINT — required sections carry visible content, listed files exist,
status is done. Quality is reviewed where the walk reviews, never here.

THE PREFILL LAW: an HTML comment is INVISIBLE content. Agent prefills
are written commented out and count as EMPTY until a human confirms
each one (uncomment, or the mirror's confirm) — a form can never pass
on unconfirmed prefills.

## A heading inside a field stays inside the field

A HEADING INSIDE A FIELD STAYS INSIDE THE FIELD (seen four times on
 2026-08-09). Sections are `## <field>`, so a `#` or `##` line in a body
 would END the section and strand the rest under a made-up sibling —
 invisibly, because the required-check still sees the first paragraph.
 The voice rules ASK for small headings in long prose, so the author's
 heading is meant: it demotes to `###` on write, lossless, never refused.
 Fenced code is left alone.

## No space is demanded after the colon

NO SPACE IS DEMANDED AFTER THE COLON, anywhere in this file (owner
ruling, 2026-08-06). `key:` and `key: value` are one line to a reader and
must be one line to the engine. A regex that wants the space matches
nothing on an empty key, and a replace that matches nothing returns the
string UNCHANGED — so the caller writes the file, sees no error, and the
change is simply absent. Nothing fails, which is why it took four
attempts to see it.

## The key may be present and empty

THE KEY MAY BE PRESENT AND EMPTY, and it usually is: a hand-written or
template-minted form carries `signed_off:` with nothing after it. Matching
on "signed_off: " — colon SPACE — missed exactly that case, so neither
branch fired the replace and the anchor appended a SECOND key. The parser
then read the first one, which was the empty one, and the stamp vanished
while the file plainly contained it (found live 2026-08-06).

## Nothing writes a suspect mark any more

NOTHING WRITES A SUSPECT MARK ANY MORE (owner ruling 2026-08-06, built
 2026-08-07). There was a `withSuspect` here that stamped a reason onto a
 claim, and it STRIPPED the signature, the author and the bless to do it.

 Two faults in one function. It stored a derived value, which then went
 stale between the passes that wrote it. And it destroyed a person's act to
 record a machine's opinion — a checker may refuse to paint a claim green,
 but it may never erase what somebody signed.

 Green is computed now, on every look, in Session.recordDone. The reason a
 claim fell is in the log, which had it all along.

 THE STRIPPER STAYS, for the claims the old code already marked: reading one
 still has to ignore a leftover line.

## Frontmatter holds one line per key so a value

Frontmatter holds ONE LINE PER KEY, so a value folds onto one.

 IT IS NEVER SHORTENED (owner ruling 2026-08-16). This used to cut at 200
 characters and add an ellipsis, and the cut is what made a form
 unsubmittable: a probe result is prose, the node-table shows every
 standing node's value, and the submit refuses a cell that trails off. So
 answering three empty cells meant resending twenty-two that the writer had
 already truncated, and no amount of retyping could fix them.

 IT COST THIRTEEN STANDING PROBE RESULTS, cut mid-sentence on their own
 nodes, plus two earlier incidents recorded as note-54c7a1cdfc4e and
 note-567aef4660ba. Both of those hunted the wrong culprit, and one comment
 in stateform.ts still claims no maxlength exists anywhere. It was here.

 A QUOTED YAML SCALAR HAS NO LENGTH LIMIT, so folding is all that was ever
 needed. Every value this writes is quoted unconditionally by yamlValue.

## Every written value is quoted

EVERY WRITTEN VALUE IS QUOTED, unconditionally (found the hard way twice
 on 2026-08-07).

 A bare scalar containing ": " is a YAML syntax error. The parse then
 throws, the node leaves the corpus, and the symptom lands somewhere else
 entirely — first a raid entry reported as a missing artifact two states
 away, then a gate whose own frontmatter stopped reading.

 QUOTE ALWAYS RATHER THAN SNIFFING for dangerous characters. A sniff is a
 list somebody has to keep complete, and colon-space was already missed
 once by exactly that reasoning.

## The reopen mark

THE REOPEN MARK — A COMPARISON, NEVER AN ERASURE.

 A reopen used to strip the signature and stamp a reason in its place. That
 destroyed the one fact that genuinely had to be stored: who signed, and
 when (owner ruling 2026-08-06). So the signature STAYS and a date lands
 beside it.

 Green then asks one question — is the reopen newer than the signature? —
 and re-submitting stamps a newer signature, which clears the mark with
 nothing having to erase anything. This is v1's adr-evidence-hash shape: a
 comparison made at look time, never a written verdict.

 WHY THE FILE AND NOT THE HISTORY. The machine instance lives in memory and
 is rebuilt from the repo each boot, so a reopen recorded only in its
 history dies at the next restart. The repo is the memory.

## A key owns its block

A KEY OWNS ITS BLOCK: the key line, plus every indented line under it.

 That is what a YAML block list is, and replacing only the key line leaves
 the old items dangling beneath a scalar. The result is not YAML at all.

 IT COST FIVE CANDIDATE NOTES THEIR PICKS on 2026-08-09. The chart wrote
 `picks` as a scalar over a block list, every note stopped parsing, and the
 five drawn lines vanished off the chart with no error anywhere.

## The state form

THE STATE FORM (owner rulings 2026-08-04): every state derives its
evidence form from markdown — the A3 shape (machines/forms/a3.md), the
state's own note or matrix row, and the generated reading list. The
engine DERIVES; the markdown DECIDES. Instances are multi-pass and
stored; every form is a CLAIM until its gate passes it. The portable
copy is one HTML with ONE JSON island — the island is the only thing
the save rewrites and the only thing the ingest reads (the v1 book's
comment law, reapplied).

## What each picked columns offer is called

WHAT EACH PICKED COLUMN'S OFFER IS CALLED, unresolved.

 AN EMPTY OFFER MUST SAY SO. `$clusters` before partition-functions has
 run resolves to nothing, and a chooser with nothing in it looks exactly
 like a text box — which is how a wired-up column got reported as free
 text (owner, 2026-08-08). The editor names the source in that case.

## Type prefix and folder filled from the fields declared

{type}, {prefix} and {folder} filled from the field's declared type.

 {folder} is what makes the placeholder TEACH. Showing
 `spec/trace/neighbour/nbr-something.md` says root-relative path
 without a sentence about it — and the id inside it says an id is fine too.

 IT ALWAYS STARTS `project/` (owner, 2026-08-06). That first segment is the
 whole reason the placeholder works: it tells the reader where the path is
 measured from. A folder is root-relative already, so it carries it; the
 fallback for a type with no folder declared carries it too.

## The label is stable and the count is the

THE LABEL IS STABLE AND THE COUNT IS THE ANSWER'S (i33, 2026-08-17).

IT CARRIED THE COUNT FIRST, and that made the item a MOVING TARGET: a
per-item field matches on the item text, the count changed between the
serve and the check, and the field could not be answered reliably at all.
One gate showed "9 call(s)", then "none", then "11 call(s)" inside a few
minutes, each time refusing the answer written for the last one.

SO THE ROW IS THE BOUNDARY, always, and how many crossed it slowly is what
the reviewer writes down. A row that is always present also stops a clean
window and an unasked question looking identical — the same defect as a
control that declines in silence.

ONE BOUNDARY IS MEASURABLE TODAY. Every lane call crosses
if-agent-harness-to-entrypoint, so the log answers for it directly. The
other twelve need their crossings attributed in the log first, and a
silent zero on them would be a measured zero dressed as a clean bill.

## Does a standing claim still pass its own form

DOES A STANDING CLAIM STILL PASS ITS OWN FORM?

 The checks run when a form is saved and when it is submitted. Nothing ever
 re-ran them over evidence already on disk. So a claim signed under an older
 form kept its stamp and its green while answering a question the form had
 since stopped asking — and because it looked green, nobody was asked to
 answer the new one.

 Same checks, run against what is stored. Empty fields stay the
 required-check's business, here as everywhere.
THE CORPUS IS THE CALLER'S TO LOAD, and it is not optional (owner ruling
 2026-08-07). It used to default to `corpus ?? loadTrace(root)`, which made
 an expensive call look free at the call site — and recordDone duly called
 it once per state, reloading roughly 250 files about fifteen times per
 paint. That was enough to hang the engine once the route started calling
 recordDone on every packet.

 THE DEEPER REASON IS CONSISTENCY, not speed. Read the input, process it,
 produce the output. A corpus re-read between two states means those two
 states were judged against different worlds, and nothing would report the
 difference. One load per call is the only way the answer is coherent.

 Required, so the cost is always visible where it is paid.

## The fill-story law

THE FILL-STORY LAW (owner ruling 2026-08-11): validation is computed,
 never claimed. A story is FILLED when every slide's evidence half
 carries something, so the unfilled list IS the finding and the state
 carries no form. The must stories fill from their demonstration
 reports, which run-demos mints AFTER the fill state — so the musts,
 and their demonstration coverage, get their teeth at the gate.

## The records own experiments where its fold-back says so

The record's OWN experiments, where its fold-back says so. An experiment
 from an earlier record keeps its assignment to THAT record's drawing, which
 this tree does not carry — sweeping it against the current drawing failed i2
 on i1's promotion (2026-08-12).

 UNDEFINED MEANS THE RECORD HAS NO FOLD-BACK, which is not the same as
 "folded nothing back". A minor strikes M6 whole, so it never has one. The
 caller falls back to the experiment's own owner there.

## The record the walk is in

THE RECORD THE WALK IS IN, as its directory name. The state id carries the
 short id — `iterations/i12/specify-build` — and the directory is the one it
 prefixes.

 WHY IT IS NOT A SCAN. Both lookups above used to read whichever record
 readdir handed back first, which is right only while one record's files sit
 on disk. Landing i27's spec into i12's tree put two drawings and one
 fold-back side by side, so i12 read its OWN drawing (i12- sorts first)
 against i27's fold-back, and i27's promotions were swept against i12's
 steps (2026-08-15). Both functions' doc comments already said "the
 record's"; neither had a way to know which record that was.

 UNDEFINED FALLS BACK TO THE SCAN. The unit fixtures call the laws directly
 with no state, naming their record `itx` inside a temp root, so there is no
 short id to resolve and the lone record on disk is the right answer.
A RECORD'S ONE NAME (owner ruling 2026-08-15): the short id. "Why are there
 even two names? Just keep the short one, throw away the long one. We don't
 need two names for one note."

 Reducing every spelling to it before comparing is what makes the rename
 safe to do in pieces: a folder still called `i12-some-long-slug`, a folder
 called `i12`, a worktree named either way and a state id carrying just
 `i12` all answer to the same record.

 A name that is not id-shaped comes back unchanged, so the unit fixtures
 naming their record `itx-here` keep matching on the prefix rule below.

## A promotion belongs to the iteration that ran the

A PROMOTION BELONGS TO THE ITERATION THAT RAN THE SPIKE (owner ruling
2026-08-13). It is a spike aimed at a later step of the SAME record and it
does not outlive it — exactly like the spike, which never travelled.

THE OWNER IS ON THE EXPERIMENT, not inferred from a sibling artifact. This
used to scope by looking for the record's fold-back evidence, which broke
twice: absent evidence meant "do not scope", so striking M6 at minor turned
the scoping off silently, and my first repair of that skipped every
experiment in any root that merely had an iterations directory — which is
every unit fixture. The tester caught the second one.

AN EXPERIMENT WITH NO OWNER IS OUT OF SCOPE (owner ruling 2026-08-16, and
it REVERSES what stood here). The old rule was "absence cannot prove it
belongs to somebody else, so ask rather than skip", and the asking is what
the owner struck: "A promotion does not need to survive its iteration. A
promotion doesn't even have to be accessible as far as I'm concerned. We
should only look at promotions from within our own iteration."

WHAT ASKING COST. specify-build refused i11 TWICE over promotions naming
chunks of drawings that shipped with i27, and the agent withdrew both —
work nobody needed, on experiments nobody was going to build.

NOTHING IS LOST BY SKIPPING. An experiment the current record minted is
stamped `minted_in` by the engine at the write, so an unstamped one cannot
be this record's. The only thing the old rule caught was other records'.

TWO WAYS TO KNOW THE OWNER, and they answer in different situations.

The record's FOLD-BACK names the experiments it promoted, and where that
evidence exists it is the direct answer. A minor strikes M6 whole, so it
never has one — and reading absence as "folded nothing back" is what broke
the sweep's own test, because every unit fixture is also absent.

So absence falls through to the experiment's OWN `minted_in`.

## The owner is compared as a short id

THE OWNER IS COMPARED AS A SHORT ID, because minted_in carries the short
form after the 2026-08-15 rename and the long one before it.
UNDEFINED MEANS THE ENGINE CANNOT NAME THE RECORD, which is a different
thing from naming a record that owns nothing. Nothing can be called
somebody else's business until we know whose business this is.

## The author-tests law

THE AUTHOR-TESTS LAW (owner ruling 2026-08-11): verification is defined
 test-first as test-spec nodes, and the seams are mechanical.

 - every requirement is verified by at least one test-spec
 - a spec's method equals the verify_method of every requirement it names
 - a spec's verifies entries resolve to requirements
 - a test-method spec NAMES its files — planned names count, because the
   spec is written test-first; existence gets teeth at verification

 The reverse sweep — a test FILE no spec references — ships warn-first
 later (owner: "we'll come to that"), so it is not a refusal here.

## The structural laws

THE STRUCTURAL LAWS, computed at every submit (owner ruling 2026-08-10:
 what the engine can check, the engine checks). They read the corpus, so a
 node landing later greys the signed claim through the stamp, and the
 re-submit refuses until the law holds again.

## A file reference resolves on disk

A FILE REFERENCE RESOLVES ON DISK, not in the trace (owner ruling
 2026-08-11, cutting the package field over from free-form). Some
 artifacts are files and not nodes — a built package, an exported
 archive — and the only honest resolver for those is the filesystem.

## A card answers in rows

A CARD ANSWERS IN ROWS, NOT IN A LIST. Reading it with the list rule
found nothing, so the field refused as empty while its own line check
passed — no content could satisfy both (owner report 2026-08-08).

NOW FIXED BY SHAPE RATHER THAN BY NAME (2026-08-09). Naming compare-card
fixed the one card somebody had walked. `dsm` has the identical shape and
was missed, so partition-functions could not be satisfied by ANY content:
bullets passed the reference check and failed the row check, rows did the
reverse. A template whose line grammar anchors on a leading pipe stores a
TABLE, and every one of them reads rows.

## A cell still carrying its comment is unanswered

A CELL STILL CARRYING ITS COMMENT IS UNANSWERED (owner ruling 2026-08-07).

 A node is minted with `probe: <!-- what the check found ... -->`. The
 comment says what belongs there, sitting exactly where the answer will
 sit, so nothing has to invent a placeholder elsewhere to explain the
 field. Replacing it is what answers it.

 Blank and still-commented are the same verdict on purpose. Both mean
 nobody has said anything, and a check that told them apart would let a
 minted prompt pass as a claim.

## A chart needs candidates drawn across it

A CHART NEEDS CANDIDATES DRAWN ACROSS IT, and two is the floor.

 AND EVERY LINE VISITS EVERY CLUSTER (owner, 2026-08-09). A cluster is a
 job the system has to do, so a line that skips one has not said how that
 job gets done — the item card calls that not-yet-a-candidate, and the
 editor already draws it dashed.

 THE CHECK USED TO COUNT ROWS AND STOP. Five unfinished lines counted as
 five candidates, the state went green, and the walk carried on past a
 chart with no waypoints on it at all.

## A move owes a rationale

A MOVE OWES A RATIONALE (owner ruling 2026-08-08). The order was settled
BLIND, before any candidate existed, and that is what keeps it honest.
Moving a row past another jumps that ordering, so it is the one edit that
can be aimed at a favourite — and the one that has to say why.

The editor writes a bare `[moved]` when the box is empty, so an unreasoned
move reaches the file rather than disappearing when nobody types.

## An empty set is a claim

AN EMPTY SET IS A CLAIM, AND IT IS WRITTEN (2026-08-09). The refs template
already rules this — "one line saying none" is a legal answer — because a
blank field and a field that honestly found nothing look identical
afterwards. A shaped field had no such door, so a state with nothing to
tabulate could only be passed by inventing a row.

FOUND AT evaluate-set. i1 composes no candidates by construction — its
candidates drawing says `none` — so the score table has no rows, and the
only way past the check was a fabricated score. The whole method exists to
stop exactly that.

IT MUST OPEN THE SHAPE CHECK TOO. A `none` that satisfies the table and
then fails the line grammar is the same unsatisfiable pair by another
route, which this file has now hit five times.
A CHART WITH NOTHING DRAWN ACROSS IT IS NOT A CHART (owner ruling
2026-08-09). The state's own guidance already says two is the floor,
because one combination is not a choice — and this runs BEFORE the `none`
door on purpose. An enumerated space nobody has combined is unfinished,
never empty, so `none` may not buy its way past it.

It reached gate-candidates with zero candidates drawn and the only
complaint was "no references", which reads like a formatting slip rather
than the missing work it was.

## A choice its reason

A CHOICE, ITS REASON, AND WHETHER IT BLOCKS — three separate questions.

 `rationale_for` names which options owe an explanation; absent means all
 of them, which is what a gate verdict wants. `passing` names which ones
 let the form stand.

 THEY ARE NOT THE SAME QUESTION (owner ruling 2026-08-08). A finder that
 cannot apply to a physical build PASSES and still owes its reason, so a
 legitimate skip and an unexplained one are told apart.

## A derived field is a reading

A DERIVED FIELD IS A READING, NOT A CLAIM (owner ruling 2026-08-08:
"if it's derived, then it doesn't need to be in the notes"). It reads
another field, computes, and shows the answer — so there is nothing
for anybody to fill and nothing to demand.

IT STORES NOTHING EITHER. Writing the answer down would be the second
copy this whole design exists to avoid, and the stored one would drift
from the scores the moment a single number changed.

## Inbox resolved live

$inbox, resolved live: one item per pending note — the ref, then the
 note's own title so the filler knows what they are answering.

 A SIGNED FORM FREEZES ITS LIST (owner ruling 2026-08-04). The inbox
 grows all day, and every new note re-opened a stamped form — which
 stripped the bless on the way back through the save. So a signed
 instance keeps only the notes it ALREADY names: its own answers are
 the snapshot, and nothing new has to be stored to hold one. Editing
 the form strips the stamp, and the live list returns with it.
$assumptions, resolved live: one item per STANDING assumption in the
 register, whichever iteration wrote it.

 IT DOES NOT FREEZE, and that is the difference from $inbox. A retro
 answered the notes pending when it walked, and re-checking against
 today's inbox would mark every retro suspect forever. This field is a
 STANDING ARTIFACT instead: at rest, every assumption carries a probe or
 a reason it has none. A new unprobed assumption SHOULD turn the state
 grey, because the claim "they are all probed" stopped being true.

 Closed entries drop out. There is nothing to probe about an assumption
 nobody is relying on any more.

## The criterion pool is requirements

THE CRITERION POOL IS REQUIREMENTS, AND ONLY REQUIREMENTS.

 A REGISTER ENTRY IS NOT A CRITERION (owner ruling 2026-08-08, and the
 method card said so first). It POINTS at requirements through source_refs,
 and a requirement several entries lean on is one that matters — that is a
 hint for the ordering, never a row to weigh against a requirement.

 WHAT IT LOOKED LIKE WHEN IT WAS WRONG. The card put up "no vendor ships
 adjudication provenance" against "the record arrives prefilled" and asked
 which mattered more. Those are not comparable quantities. One is a claim
 about the market, the other a demand on the system, and no honest answer
 exists. The entry was also CLOSED, which nothing checked.

## Promotions resolved live

$promotions, resolved live: the experiments THIS RECORD promoted, whose
 `promote:` names something entering the build. PROMOTIONS ARE A FILTER,
 NEVER A LIST (M6 fold-back): an experiment saying none is honestly absent.

 A PROMOTION BELONGS TO THE ITERATION THAT RAN THE SPIKE (owner ruling
 2026-08-13). It is a spike aimed at a later step of the SAME record, and it
 has no business outliving it — exactly like the spike, which does not.

 IT USED TO RETURN EVERY PROMOTED EXPERIMENT IN THE PROJECT, with no owner
 and no expiry. So i2's promotion turned up in i3's build form, and would
 have turned up in i4's and i5's, each of them asked to plan a chunk that
 somebody else had already built. i3 hit exactly that and could only satisfy
 it by copying a step it had not done.

 THE RECORD'S ID IS THE BASENAME OF ITS TRACE ROOT, so nothing new is
 threaded through. At trunk nothing matches, which is right: no record is
 open, so no promotion is owed.

## Guidance is paragraphs and lists

GUIDANCE IS PARAGRAPHS AND LISTS, and it has to RENDER as them (owner
 report 2026-08-08: "there is a list in the scores text, so format it like a
 list").

 It used to be escaped into one div. A list authored as a list — which
 voice.md requires — arrived as a run of text with dashes in it, so the one
 place the rule is most visible was the one place it did not survive.

 TWO SHAPES ONLY, deliberately: paragraphs and bullets. This is form help,
 not a document, and a full markdown renderer here would invite headings and
 tables into a box three lines tall.

## The form is bound to the corpus

A FORM IS NOT A TEXT BOX. Its fields resolve against the trace: a reference
becomes a link the reader can follow, a node-table row carries the node's own
frontmatter, and a chart's cells are the option nodes themselves.

THE BINDING NEEDS PATHS AND NOTHING ELSE — which record's corpus, and where
the method cards live. It never asks where the walk stands or what the dial
says, which is why it is a set of functions rather than part of the session.

WHAT MINTING ADDS. Some forms do not only read the corpus, they WRITE it: a
scenario's at-risk verdicts become register entries, and a sensitivity card's
credible rulings become tripwires. Those run at submit, from the same paths.

## The portable copy

A FORM TRAVELS AS ONE FILE. The sheet is a whole HTML document with its own
styles, its own script and the documents it references embedded in it, so the
person filling it in needs nothing but a browser and no network at all.

WHAT COMES BACK IS THE ISLAND, never the page. The returned file carries a
single JSON block naming the form, the author, the field bodies and the input
labels ticked on the sheet; the ingest reads that and ignores the rest. A page
edited by hand outside the island changes nothing, which is what makes the
round trip safe to accept from anywhere.

IT IS A LEAF. Nothing in the form model reaches down into the sheet — the
sheet borrows the model's shapes and renders them, and that one-way edge is
why it is its own file.

## What a form still owes

THE CHECKS ARE THEIR OWN THING. Reading the corpus and returning lines of
prose about what is missing shares no state with building the model, so the
laws, the field checks and the per-editor checks live apart from it.

THEY RENDER NOTHING AND WRITE NOTHING. A check answers with the sentence a
person reads and stops there — the caller decides whether that sentence blocks
a save, greys a claim, or only shows in the panel.


## A checklist over the whole corpus asks for a lie

`$claim-specs` RESOLVED EVERY NON-TEST SPEC IN THE PROJECT, with no owner. Two
states use it — observe-red and verification — and both are per-iteration acts.

WHAT THAT ASKS FOR. observe-red asks whether every new check failed BEFORE the
build. Handed twenty-one specs, twenty of them other iterations', a walk can
satisfy it in one way: tick boxes for reds it never observed, on specs it did
not author, whose reds were observed months ago if at all.

THE SAME SHAPE ALREADY BIT ONCE AND WAS ALREADY FIXED. `$promotions` returned
every promoted experiment in the project. i2 promoted a batch reader and i3's
build form still demanded it. The ruling of 2026-08-13 scoped it to the owning
record and `tests/promotions-stay-home.test.ts` pins it.

`$claim-specs` SITS ONE FUNCTION ABOVE `$promotions` IN THE SAME FILE and was
left unscoped.

## The state disagreed with itself, which is what settles it

observe-red's ENGINE half is scoped. `engine/bin/red-observed.ts` reads each
test spec's `minted_in` and skips every one that is not the record standing
there.

observe-red's FORM half was not. One state, two halves, opposite answers about
whose specs it is asking about — so this is a defect rather than a design
choice, and no assumption about verification is needed to see it.

## The fix

`claimSpecItems` takes the evidence directory and filters on `minted_in`,
exactly as `promotionItems` does six lines below it.

VERIFICATION NARROWS WITH IT, and that is intended rather than collateral.
`observed green by FRESH EYES` is a per-iteration act too, and the corpus-wide
reading grows without bound — twenty-one specs today, every iteration, forever.
A standing corpus-wide obligation is a battery sweep, not a checkbox an agent
ticks.

## What it belongs to

THE GENERAL SHAPE IS `raid-iss-a-corpus-wide-law-with-a-state-local-trigger-bills-a-stranger`.
This is its third measured instance in one iteration: the design-coverage law,
the register's grading condition, and this checklist. The first two land as work
an iteration did not create; this one lands as a request to assert something
untrue, which is worse.
