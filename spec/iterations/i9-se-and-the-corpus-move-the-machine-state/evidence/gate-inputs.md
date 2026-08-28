---
form: gate-inputs
amended: 2026-08-19T15:12:47.615Z by agent — a coverage claim cites a use-case extension the owner struck, and the inherited-work list still names a record that is not kept
bless: blessed by human
by: agent
signed_off: 2026-08-19T12:47:14.866Z
authors: agent
files: null
---

# Evidence form / gate-inputs

## current_situation

M2 is complete and this gate adjudicates it. Four states signed: draw-context, map-stakeholders, write-stories, generalize-use-cases.

Two stories carry the delta. sty-ramp-up was revised on three slides. sty-work-on-two-machines gained the hand migration the owner accepted on 2026-08-19.

One use case was revised. uc-install-quackitect described two folders as though they were one, and now describes the collapsed shape.

Two further use cases were read in full and left standing. The sentence that saved each is quoted at generalize-use-cases rather than asserted here.

THIS GATE FOUND THREE THINGS THE FEEDER STATES DID NOT, AND REPAIRED ALL THREE. The verdict below was fail until they were, and the record keeps that order deliberately: the holes were found first and closed second, rather than the gate being written to pass.

## picture_judged

THE JOURNEYS ARE THE RIGHT TWO, and the test is who the collapse can actually reach.

- Somebody arriving with nothing installed. That is sty-ramp-up.
- Somebody who already holds a checkout in the old shape. That is sty-work-on-two-machines.

There is no third population. The folder rule only shows itself at the moment somebody opens a folder, so everyone meets it as one of those two.

ONE JOURNEY WAS WRONG, AND IT IS FIXED HERE. uc-install-quackitect said the person runs the launcher ONCE and never said what "once" was counting. Once per machine and once per project are different products. The second forces a newcomer to reinstall for every folder they open, which contradicts the entry-point goal the kickoff blessed. Extension 1a now says once per machine, and the notes record that the question was asked at this gate.

THE TERMINAL IN SLIDE 2 IS NOT A DEFECT, though it reads like one against the vision's line that they never open a terminal. That line describes the daily world. The first install on a bare machine is the single moment the entry-point goal's own wording excludes, by saying after the first install.

WHAT THIS GATE CANNOT JUDGE. Whether a real newcomer finds the launcher. The picture asserts they do. Nobody has watched one try, and the ramp-up report has said so since i1.

## unspecified_capability

WALKED BY HAND, against the live lane list this session's engine served — 36 verbs — and against the doors the machine offers. Scoped to what this delta changes, per this state's own scoping line.

THE COVERAGE COUNTS ARE NOT REPEATED HERE. Story-inside-use-case is computed, and it is green, or generalize-use-cases could not have signed.

WHAT THE COLLAPSE CHANGES AT THE USER LEVEL, each with its coverage:

- Opening the editor becomes the only entry point after the first install. COVERED by uc-install-quackitect steps 8 and 9, with extension 9a for the restart message.
- A folder that is not a project is refused rather than seeded. COVERED by uc-install-quackitect extension 5b. This is the owner's ruling of 2026-08-19 and it had no use-case home before this milestone.
- A second project on the same machine needs no install at all. COVERED by uc-install-quackitect extension 1a, written at this gate.
- A folder that arrived by clone asks once before anything starts. WRITTEN AT THIS GATE AS EXTENSION 8a, AND STRUCK BY THE OWNER THE SAME DAY. The extension no longer exists in the use case, so this line cites nothing. A clone carrying machine state comes up like any other folder.
- The machine-state folder becomes readable in the editor. COVERED by sty-walk-it-by-hand, which states in its own words that the reading file is the reading loop as a file for a person to open.
- MIGRATING AN EXISTING CHECKOUT. Deliberately uncovered, and now argued as such.

THE PATH-RESOLVING VERBS NEED NO NEW USE CASE. Nine file verbs, the shell verb and the git verb all resolve from the project root. The collapse changes what that root IS and changes no verb's contract. A tool whose contract is unchanged is not an uncovered capability, and treating it as one would turn this field into a list of everything.

THE DOORS ARE UNCHANGED. This iteration adds no state and no machine, so the offered set is the set the last gate saw.

### The migration, found uncovered and repaired here

WHAT HAPPENS. An existing checkout keeps its machine state where the move left it. The owner ruled on 2026-08-19 that no mechanism is built for it, asking only that a hand migration strategy be presented.

SO IT IS GENUINELY OUT OF SCOPE, and this state's rule then applies exactly: an out-of-scope capability belongs in the non-goals, argued.

IT WAS NOT IN THE NON-GOALS WHEN THIS GATE OPENED. scope-non-goals signed at 12:06 on 2026-08-19 and the ruling came later the same session, so the exclusion list was stale on this one point. That is what the fail verdict rested on.

IT IS THERE NOW. scope-non-goals was AMENDED rather than reopened, because nothing the state attested to changed — the list was incomplete rather than wrong. The signature stands and no downstream state fell. The owner restated the ruling in their own words while the repair was landing, which is now the wording the exclusion carries: the few things to migrate get migrated by hand, and that is acceptable.

## passes_concrete

CONCRETE ENOUGH TO SCRIPT, WITH ONE NAMED HOLE.

sty-ramp-up's slides are already a runnable sequence. Clone into a folder. Run one launcher. The editor opens. The panel appears. The agent boots. The desk greets. Each is an observable state a script can assert.

uc-install-quackitect steps 8 and 9 are the sharpest pass in the set and the cheapest to script. Open the editor on the folder. Assert the lane answers. Assert no script was run. That is the entry-point goal reduced to something that either holds or does not.

THE HOLE IS SLIDE 2. A script cannot run a launcher whose location is undecided, and the location is open — raid-iss-the-collapse-hides-the-one-thing-a-newcomer-must-run. Every other slide can be scripted before that is settled. This one cannot.

ONE HALF IS NOT SCRIPTABLE AT ALL, and pretending otherwise would be the worse error. Slide 2 also claims the newcomer SEES what to run without being told. A script can assert a file exists. It cannot assert a person noticed it. That half wants the fresh-machine run with a real first-timer that the ramp-up report has owed since i1.

## round_0_verify

- evidence vs claims: Opened rather than trusted. Each standing use case was read in full before being called untouched, and the sentence that saved it is quoted at generalize-use-cases. The one claim that did not survive reading was my own, in the use case I had just written.
- types: Nothing compiled, and nothing should have. This milestone changed corpus prose and no code, so a type check has no question to answer here.
- lint: Not run, and the reason is mechanical rather than a judgment. The lint verb is not among this state's legal tools. The prose it would check belongs to the states that own that text.
- tests: None run, correctly. No code changed, so a run could only reassure, and the method forbids running to reassure.

## round_1_validate

- exercised against the goal: The entry-point goal is the one M2 could reach, and it was reached. uc-install-quackitect steps 8 and 9 turn it into a pass a machine can fail: open the editor, assert the lane answers, assert no script ran. The collapse goal is exercised only as the shape the stories are now told against, because nothing at M2 moves a file.
- missing: TWO WERE MISSING AND BOTH ARE NOW PRESENT. The migration of an existing checkout had no argued exclusion, and scope-non-goals was amended to carry one. The consent record had no home outside the tree, and draft-vision was amended to require one. Both were amendments rather than reopens, so every signature above this gate stands.
- wrong: TWO FOUND, BOTH FIXED. The install use case never said whether "once" counted machines or projects, and the two readings give different products — extension 1a settles it as machines. The consent ruling read a cloned tree as though the person opening it had consented — the fourth bullet now draws the edge around a clone, and extension 8a is its face in the use case.
- out of scope: The foreign-driving collision, filed rather than resolved. Nothing in i9 drives a foreign product, and i9 changes neither the extension that demands the separation nor the clause that may block it. It carries a one-call probe so the next person to touch it settles it rather than re-derives it.
- prior art: COMPARISON MADE, against systems people actually use, reading vendor source and documentation files rather than articles about them. WHAT THEY DO BETTER, FIRST. Every command-line tool sampled finds its root by walking UP to a marker, and npm states the reason in its own documentation — the command still works when you have moved into a subdirectory. git, Cargo, Black, Ruff and uv all pay that cost for that benefit. Ours is root-equals-opened-folder, which has no precedent outside a graphical editor, and the one system that matches owns the folder handle in a way a terminal never does. Cargo's refusal also names the fix, detecting a mis-cased manifest and telling you to rename it, where ours would name only the failure. And three vendors independently keep the TRUST decision outside the tree — that one did not stay a comparison, it became a repair to this iteration's own ruling. WHERE OURS AGREES WITH EVERYBODY: state living inside the project folder is unanimous across all seven systems checked, so this collapse moves us toward the mainstream rather than away from it; refusing rather than seeding is the majority position; the dot-prefixed name is universal. WHAT OURS SHEDS: running from a subdirectory. TWO CORRECTIONS THE COMPARISON FORCED ON OUR OWN TEXT: we claim to need no marker file, and after the collapse a check for the machine-state folder at the root IS a marker check whether we call it one or not; and "hidden" buys less than the name suggests, because the editor's shipped exclusion list names five specific patterns rather than a rule about dots. The sourced detail is in anything_else.

## goals_served

- COLLAPSE THE WRAPPER. Everything at the repository root moves into the folder that gets opened, until the root holds the project and the repository's own plumbing and nothing else. A level above the project that carries product files is a level that should not exist.: Nothing moved yet, and that is correct — the design milestone owns the move. What M2 produced is the shape the stories are now told against: sty-ramp-up slide 4 asserts the opened folder IS the product, and uc-install-quackitect's "Why one folder" section records what the two-folder layout had done to that use case's own text.
- THE MACHINE-STATE FOLDER LEADS THAT MOVE, because it is the one whose home the rule settles first: it belongs to the thing being worked on rather than one level above it.: Nothing yet — the design milestone owns the ordering. M2 produced no artifact whose truth depends on which folder moves first.
- MOVE FIRST, CLEAN SECOND, AND STOP IN BETWEEN. Nothing is renamed and nothing is deleted while things are moving. Then the owner decides what should not have travelled at all.: Nothing yet — the build milestone owns it. It is an ordering rule over edits, and M2 made no edits to order.
- OPENING THE EDITOR IS THE ONLY ENTRY POINT AFTER THE FIRST INSTALL, for a folder that IS a project. The launcher runs once. From then on, opening a project gets it everything it needs, and anything that cannot apply to a running window says so instead of going quiet.: SERVED, and this is M2's largest contribution. uc-install-quackitect steps 8 and 9 state the goal as a pass. Extension 1a settles that once counts machines. Extension 9a carries the owner's restart message. Extension 5b carries the consent line at the folder's edge. sty-ramp-up slides 2, 3 and 8 were revised to match.
- SPLIT THE LANE'S EXCLUSION BY FILE INSTEAD OF BY DIRECTORY, so the three files with a structured door stay hidden and everything else becomes readable.: Served at the user level, and M2 added nothing to it. sty-walk-it-by-hand already carries the payoff in its own words, that the reading file is the reading loop as a file for a person to open. What this milestone did was confirm a story already stands over the goal rather than write a new one.
- GIVE THE ENGINE ONE CORPUS READER, so what the corpus IS has a single answer rather than one per caller.: Nothing yet — the design milestone owns it. It is an internal consolidation with no user-facing pass, so what will serve it is a design decision and a test rather than a story. M2 was the wrong milestone to reach it.
- PIN BRANCH INDEPENDENCE WITH A TEST. The folder resolves to one place while a record is bound, and that guarantee stops being trusted and starts being checked.: Nothing yet — verification owns the test. The assumption it probes stands open and graded crippling from M1, as raid-asm-the-branch-independence-ruling-constrains-branch-and-not-depth.

## bound_breaches

- if-agent-harness-to-entrypoint: BREACHED, and standing rather than new. The last trustworthy measurement is 2026-08-17: 1834 of 8424 calls over the one-second bound, worst answer 33,461 ms. M2 adds no number and should not pretend to, because the aggregate instrument is itself the broken part — the call log query omits matching records and reports that it omitted none. DISPOSITION: verification owns the re-measure, and it matters more this iteration than usual, because the one-corpus-reader goal changes what an answer is assembled FROM, which this interface names as where the cost lives. Every figure stays a floor until the log query is fixed.

## round_2_red_team

- STEELMAN, the strongest case for leaving the two folders exactly as they are: geometry gives an exclusion guarantee that costs no code, because state sitting above the packaged folder cannot be shipped by any tool that packages that folder, cannot be swept in by a careless add, and cannot be caught by a glob over the product => Accepted as true, and it is the best argument against this iteration. The answer is that nobody knew they had the guarantee and nothing was designed to rely on it. The collapse converts an accident into a rule with a test, which is worse than free and better than unowned.
- KILL-CRITERION: the collapse is the wrong call if any consumer of this tree REQUIRES machine state to sit above the project => Looked for it rather than asserting its absence. The packager, the vendoring path and the arrival hook all resolve from the root, and none is documented as needing a level above the project. NOT FOUND. The scope item that counts every caller before the first edit is where it would surface if it exists.
- The collapse makes shipping session state the DEFAULT, where geometry used to make it impossible => Real, new at this gate, and now carried as raid-risk-geometry-stops-excluding-session-state-and-nothing-replaces-it, with the packaging test that would retire it.
- THE ATTACK THE PRIOR ART SUPPLIED, and the heaviest one here: this iteration's own consent ruling let a tree answer a question about itself, because a clone arrives already seeded and the rule read that as the opener's consent => CONCEDED AT THE TIME, AND OVERRULED THE SAME DAY. Three vendors met this and each kept the trust record outside the tree, which is why the finding read as strong. The owner struck it on 2026-08-19: if it finds the machine-state folder it can work on it, and if it does not it does not. WHAT THE COMPARISON MISSED is that all three cited systems guard against a tree that can EXECUTE on arrival, and this folder holds a call log and session state rather than anything that runs. The borrowed threat model was the whole strength of the finding, and it did not transfer. raid-iss-the-consent-line-reads-a-clone-as-though-the-opener-had-consented is superseded and carries the reasoning so nobody rebuilds it.
- Three standing rules may leave nowhere to write a note about the system's own machinery while a driven folder is the open one => Carried as raid-asm-a-machinery-note-still-has-a-home-when-the-open-folder-is-not-ours, with a one-call probe. NOT resolved here, and the reason is that the collision stands today with today's layout: nothing in i9 drives a foreign product, and i9 changes neither the extension that demands the separation nor the clause that may block it.
- The user picture asserts a newcomer finds the launcher, and no newcomer has ever been watched trying => OPEN, and the prior art sharpens it from an instinct into a measured gap. Everything that surfaces itself to a person does so because a host scans for a specific filename. A conventionally-named script at the root is not one of those, and the convention works only for a reader who has met it before.
- A gate that repairs what it finds could be a gate that never fails anything => The guard is that the repair has to be legal from here. Two amendments were, because neither claim's content changed. Anything needing a reopen would still have stopped this gate, and the record keeps the fail verdict's reasoning rather than deleting it.

## raid_additions

- project/spec/trace/raid/raid-asm-a-machinery-note-still-has-a-home-when-the-open-folder-is-not-ours.md
- project/spec/trace/raid/raid-risk-geometry-stops-excluding-session-state-and-nothing-replaces-it.md
- project/spec/trace/raid/raid-iss-the-consent-line-reads-a-clone-as-though-the-opener-had-consented.md

## verdict

pass — the three holes this gate found were repaired inside it rather than carried past it. The exclusion list now argues the owner's ruling that migrating an existing checkout gets no mechanism, in the wording they restated while the repair landed. The consent rule was redrawn here so a cloned folder asks once, AND THE OWNER STRUCK THAT THE SAME DAY — the folder answers for itself by carrying machine state or not, and nobody is asked anything. This verdict is left standing with the correction recorded rather than quietly rewritten to look right. The install use case also now says that once means once per machine. All three were amendments rather than reopens, so every signature above this gate stands and nothing downstream fell.

## follow_up

NOTHING BLOCKS THIS GATE. Both repairs landed as amendments, and the states above it kept their signatures.

WHAT THE DESIGN MILESTONE INHERITS FROM THIS REVIEW.

- STRUCK, having been a demand for about an hour. There is no consent record to hold anywhere. The owner ruled the same day that the folder answers for itself, so design inherits nothing from this line.
- Where the launcher sits, so a fresh checkout shows it. The prior art narrowed this to four mechanisms that actually surface something, and a conventionally-named script is not one of them.
- An explicit packaging exclusion for the machine-state folder, with a test that packages a tree and asserts its absence.
- The vendoring path checked separately from the packaging path, because different code produces each and only one may get fixed.

WHAT VERIFICATION INHERITS.

- Re-measure the agent-to-entrypoint crossing after the corpus reader lands.
- The branch-independence test, which is a blessed goal and an open crippling assumption at once.

ONE PROBE IS CHEAP AND UNOWNED. Declare the system's own tree as a writable root from inside a produced project and see whether the produced-tree guard fires. That single call closes the machinery-note assumption either way.

ONE THING THE RETRO SHOULD LOOK AT. Fetching a web page did not work this session while searching did, so a comparison had to be assembled from vendor repository files. The note captured today carries it.

## anything_else

### The prior-art comparison, with its sources

WHAT WAS READ, and how. Vendor source and documentation files were read as text from the vendors' own repositories. Page fetching was unavailable in this session, so a handful of statements rest on search summaries of a vendor's own page rather than the page itself. Those are marked below. This matters for the evidence rule: a summary of a primary source is not the primary source.

### How the project root is found

TWO FAMILIES EXIST, and this design joins the smaller one.

WALK UP UNTIL A MARKER IS FOUND. git looks for its own folder through every parent, and its failure text says so. npm copied that logic and wrote down why: the command should still work when you have moved into some other folder. Cargo walks the ancestors and fails by name. Black stops at a version-control boundary. Ruff searches parents. uv takes the nearest.

THE FOLDER YOU OPENED. VS Code, alone in the sample. Its documentation states that a folder becomes a workspace by being opened and nothing else, and that the product has no concept of a project at all.

WHY THE ONE PRECEDENT MAY NOT TRANSFER. The editor holds the folder handle, so there is exactly one root and nowhere else to be. A machine started from a terminal has no handle, and a working directory wanders.

ONE POINT IN THIS DESIGN'S FAVOUR, from git's own security history. Walking up means landing in a repository nobody chose, which is why git now refuses to parse a config owned by somebody else. The folder you opened cannot do that.

### Where per-project state lives

INSIDE THE PROJECT FOLDER, in every system checked: git, VS Code, JetBrains, direnv, aider, Copilot and uv. There is no dissent, so the collapse moves toward the mainstream.

WHAT THEY ALL KEEP OUTSIDE IS THE TRUST DECISION, and each wrote down why. direnv holds the permission record in the user's data directory and says the mechanism exists so a repository you pull cannot act on you when you enter it. VS Code answers with Restricted Mode and names committed task definitions as the vector. git answers with an explicit allow list. JetBrains splits its folder, sharing project settings and ignoring user-specific state. aider adds its own state files to the ignore list automatically rather than leaving it to the user.

### Opening a folder that is not a project

REFUSING IS THE MAJORITY POSITION, so the owner's no-seeding ruling is normal rather than unusual. git refuses. Cargo refuses. direnv refuses to load and waits. VS Code opens anything, creates nothing, and restricts itself. Only npm falls back, and to a search default rather than to seeding.

WHAT THE GOOD REFUSALS ADD is the remedy. Cargo names the file it wanted, the directory it searched, and detects a mis-cased manifest to tell you to rename it. That special case exists because the confusion was worth it.

### How a newcomer finds the thing to run

EVERYTHING THAT SURFACES ITSELF IS A FILE A HOST ALREADY SCANS FOR. A dev-container file raises a notification on open. A workspace recommendations file raises another. An activation event on a matching file starts an extension. A task can be set to run on folder open, gated by a setting and by trust.

EVERYTHING ELSE IS A NAMING CONVENTION THAT SHOWS NOTHING. The setup-script convention says in its own words that it works because contributors know the pattern. A makefile is found only after somebody types the command. A readme is rendered by the code-hosting site, not by the editor.

SO THE OPEN ISSUE ABOUT WHERE THE LAUNCHER SITS HAS FOUR MAINSTREAM ANSWERS, and a conventionally-named script at the root is not among them.

### The hidden name

UNIVERSAL, AND THE OBJECTION IS WEAK. Every system in the sample uses a dot-prefixed name. The real cost is that shell expansion skips such names, which the relevant manual gives as its own example, and that cost is already paid for the version-control folder.

TWO THINGS WORTH KNOWING ANYWAY. The editor's shipped exclusion list names five specific patterns rather than a rule about dots, so this folder will be visible in the file tree regardless of its name. And on Windows the dot prefix does not hide anything at all, since hiding there is a file attribute (from a search summary of the vendor's pages rather than the pages themselves).

### One thing this comparison changed in the record

THE CLAIM THAT NO MARKER FILE IS NEEDED IS LOOSER THAN IT SOUNDS. After the collapse the machine-state folder sits at the root of the opened folder, and testing for it is a marker check under another name. That is not a defect. It is a claim worth stating accurately, because the design is one directory-walk away from the behaviour every command-line tool in the sample has.
