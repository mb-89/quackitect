---
id: software
statement: How to write code and record work. These are the universal rules, and the project's own rulings live in `guidance/method/engineering.md`.
applies_to:
  - work
  - overhaul
  - run-spikes
  - author-tests
  - specify-build
  - observe-red
  - build-steps
  - trace-design
  - verification
  - fix-findings
  - gate-implementation
  - package
---

# software — how you write it

These rules bind every artifact you build.

How you TALK about it is voice.md. How you build an INTERFACE is ux.md.

This document carries what binds every piece of work. The project's own
engineering rulings live in `guidance/method/engineering.md`. Read
that one when you touch what it covers.

## Do not repeat (DRY)

- Single source of truth. Each fact lives in one place, and everything else points to it.
- Markdown is the truth. Anything whose truth lives in markdown keeps it Obsidian-compatible and human-editable IN THE REAL WORLD.
  - A million-line file is not editable.
  - Generated surfaces derive from the markdown, never the reverse.
  - Log files are the one exception.
- Machines are drawn. A state machine's truth is its Obsidian canvas, and a person edits it in Obsidian, in the real world.
  - The engine accepts what a person naturally draws.
  - A mechanism that depends on metadata Obsidian does not surface to its editor is a defect. Rework the mechanism, never the person.
- The truth is read LIVE. A running system holding a stale copy of a file it calls the single truth is enforcing a lie.
  - Where re-reading is too expensive, cache it against the CONTENT of the files it was built from. Never against size and modification time, which a same-length edit walks straight past.
- Do not repeat prose, data, or code.
  - Not across files.
  - Not across panels.
  - Not within one screen.
- If two places show the same thing, delete one. A detail view should not echo what its parent already shows.
- A field that restates another field is NOISE. A statement that repeats the id, a title that repeats the name, a label that echoes the filename — strike it.
  - Empty is better than an echo. A field is filled only when it ADDS something.
- Repeat only when strongly advised. Then say why.

## Dependencies: pull assets, never lean on servers

The rule, and it has been restated harder once already:

- PULLING an asset is free. A one-time download from a CDN or registry is
  fine — you had to be online to clone the repo anyway.
- DEPENDING on a server is forbidden. Nothing we ship may need someone
  else's server at RUN time — no CDN script tags, no online renderers, no
  API a page calls to do its job. The agent's own model service is the one
  exception.
- The pulled asset is VENDORED: committed under deliverable/vendor with a
  README naming version, source, date and license.
- A missing vendored asset REFUSES with the pull that fixes it. An online
  fallback is the dependency wearing a disguise.

The case that set the restatement: the mermaid check page loaded its
renderer from a CDN on every open. Offline it checked nothing while
looking like a checker. It now inlines the vendored renderer and works
forever as generated.

## A stored copy never beats a derived one

Five defects have been drained with one shape. A value the system can COMPUTE
was also WRITTEN somewhere, and the written copy won.

- The chart's picks beat the option nodes.
- A stored criteria order beat the computed one. A corrosive row sat first
  of seventy-two, above every fatal one.
- The cutoff mark rides a row's position. A recomputed order silently
  redraws the boundary.
- A duplicated form section beat the section the check read.
- The live run's colouring beat the record. A finished machine drew grey.

The rule:

- Where a value can be derived, derive it on every look. Do not store it.
- Where a stored copy must exist, the derived value wins every
  disagreement. The disagreement is reported, never silent.
- A mark on a row names its own row. A mark riding on position makes
  every reorder a silent edit.

The precedent is the green light: calculated from the live files on every
look, never written.

## Derive on every look, but never re-derive what has not changed

The sibling of the rule above, and it must be read WITH it. "Derive on
every look" is about where truth lives. It is not an instruction to read
the same unchanged files forty times in one call.

A single `se_pull` once took 274,270 ms entering an iteration. The server
answers NOTHING while that runs, because the lane's endpoint shares one event
loop with the mirror, so the transport gives up and the extension has to be
restarted.

### The rule

CACHE THE COMPUTATION. Never cache the truth.

- Key the answer to a HASH OF ITS INPUT plus the build identity.
- Recompute when either moves. Never on a timer, never on a guess.
- Keep it OUT OF THE REPO. A cache is never truth, and the repo stays
  cache-free.

This is v1's adr-verdict-cache, and its wording is the test: verdicts
keyed to full input hash plus build identity, in the data home, because
"a cache is never truth and the repo must stay cache-free".

### Why it does not break the rule above

Nothing is stored that anyone reads as an answer. A stamp is not a value.
An edit moves the input, the stamp stops matching, and the work runs
again. There is still ONE source of truth and it is still the files.

AN IN-MEMORY CACHE GETS BUILD IDENTITY FREE. v1 needed to key on the
build because its cache was on disk and outlived the engine. A map that
dies with the process cannot be reached by the code that replaced it.

### The stamp is stat, never content

Where the input is files, hashing their CONTENT means READING them, which
is the cost being avoided. Size and modification time answer the same
question for one syscall each.

### What it was worth here

Measured on 328 nodes: a cold corpus load is 312.9 ms, a stamped one is
4.3 ms. Eleven walk hops over three machines went from 10,325 ms to
142 ms.

### Where to look for the next one

The test is one question: does this recompute the same answer from
unchanged input more than once in a call?

- A whole-corpus load behind a function that looks like a getter.
- A per-node file read inside a loop over every node.
- A check re-run per state when the corpus it reads is the same corpus.

A CALL SITE HIDES THE COST. `loadTrace(root)` reads like a variable and
costs a third of a second. Name the cost in the comment where the cheap
spelling hides it.

### Input, process, output — and the cache is the consolation prize

This OUTRANKS the section above.

Four acts, in order.

- COLLECT THE INPUT ONCE.
- PROCESS IT.
- OUTPUT IT.
- CHECK AT THE END, where it matters, whether the input moved while you
  worked. Redo or refuse if it did.

WHAT YOU DO NOT DO is ask an outside system the same question sixty-six times.

### The measurement that set it

Entering one record asked for the same 328-node corpus SIXTY-SIX TIMES. Each
hop of the walk asked what was green; each green pass asked for the corpus;
each container asked again for itself.

Stamping made each ask cost 4 ms instead of 300 ms. The route still asked
sixty-six times.

SO THE CACHE FIXED THE PRICE AND NOT THE SHAPE, and that is the trap: cheap
waste stops appearing in profiles, so nobody removes it. The 21,648 stats that
replaced the reads were invisible until somebody counted CALLS rather than
milliseconds.

### Where the defect actually lives

A FUNCTION THAT FETCHES ITS OWN INPUT IS FINE AT THE TOP AND WRONG IN A LOOP.
The walk's objective finder loads the corpus because it needs the corpus, which
reads perfectly well at the call site — and it is called once per hop.

Pass the input DOWN. A parameter cannot be fetched twice, cannot go stale
within the operation, and needs no invalidation. It is the version of a cache
that cannot be wrong.

### When a cache is still right

Between INDEPENDENT operations, where there is no call chain to thread through.
The mirror renders and the lane pulls; neither can hand the other its inputs,
so the model holds them and both read it.

Inside ONE operation, a cache is an admission that the shape is wrong.

### The test

COUNT THE ASKS, NOT THE MILLISECONDS. If one operation asks an outside system
for the same thing more than once, the number of times is the defect, whatever
each one costs.

### The pass, for readers too deep to thread a parameter through

Some readers sit twenty frames below the operation. Threading a parameter to
all of them is a refactor nobody will finish, and half-done it is worse than
not started.

SO THE OPERATION DECLARES ITSELF INSTEAD. It opens a PASS. Inside one, the
door verifies each file ONCE and answers every later access from what it holds.

- `withPass(fn)` wraps a synchronous operation.
- `passEpoch()` keys anything derived from MANY files on the pass that built it.
- Outside a pass, every access asks. That is what a test gets, and it is right.

WHAT IT IS WORTH, measured on one record entry:

- The door's stats: 19,730 to 583.
- The corpus sweep: 19,024 stats to 2,952.
- The route: 2,488 ms to 1,271 ms.

### A pass covers reading, never writing

TWO ATTEMPTS TO MAKE THE PASS AUTOMATIC FAILED, both on the same day, both on
the same law.

The first held files for 2,000 ms of wall clock. Five tests refused it.

The second held them for one turn of the event loop — indivisible, with no
interval of trust at all, since nothing else can run inside a synchronous
region. Seven tests refused it, one of them a product law:

> a state note edited on disk binds the NEXT call, no reload

SHRINKING THE WINDOW FROM SECONDS TO MICROSECONDS DID NOT CHANGE THE CLASS OF
THE BUG. That is the finding. Both failed because a caller writes through
something other than the lane and reads back inside the same window.

SO THE RULE IS NARROW ON PURPOSE. An operation that only READS may be a pass.
The route and the mirror's render qualify. Anything that writes while it walks
does not.

### A door only helps what walks through it

Four caches were built before anyone counted. Together they cost 39,857 stats
and left the three biggest readers untouched, because those readers called
`readFileSync` themselves and no cache stood in their way.

A DOOR THAT CAN BE WALKED AROUND IS A SUGGESTION. So the count of direct reads
is held by a ratchet test: it may fall freely and cannot rise
(`deliverable/tests/files.test.ts`).

A ban would be a lie. Ninety-nine of those reads are legitimate — JSON, a
canvas, a git object, a one-shot script. What must never happen is the number
growing without somebody deciding it should.

### And none of it makes a long scan acceptable inline

Capping the work makes it cheaper. It does not make it correct to run on
the request path. Anything that scans thousands of things belongs where
`se_test` already goes: past a second, hand it off and report.

## Comments and provenance

### The rule: a comment is almost always the wrong home

REASONING ABOUT DESIGN BELONGS IN THE DESIGN DOCUMENT. Not in the source.
This is close to a ban, and it is meant to be.

- A comment may state a CONSTRAINT the artifact cannot show itself.
- A comment may POINT at where the reasoning lives.
- A comment may not BE the reasoning.

WHY A REFERENCE BEATS A COPY. The design document is where a reader looks
for a design. A comment restating it has forked the truth, and only one
fork ever gets updated.

### What a pointer looks like

    // see dsp-mirror-render.md#the-vendored-renderer

ONE LINE. The section, not just the file. A whole-file reference sends the
reader hunting, which is most of the way back to no reference at all.

THE POINTER IS ALSO A TRACE. A per-section reference says which part of
which design this code realises, so the link runs both ways: the design
finds its code, and the code finds its design. Making that mechanical —
so the trace is derived from the references rather than maintained beside
them — is its own iteration and is not built yet. Write the references in
this shape now, and that iteration inherits a corpus already in it.

### What is forbidden outright

- NEVER comment that a rule was followed, who ruled it, or when.
  - No dates.
  - No step numbers.
  - No law citations at application sites.
- NEVER narrate a change in the source. A comment saying what a thing USED
  to do, or that something was deleted, is a ledger entry filed in the
  wrong drawer. The history is in git and the reasoning is in the design.
- NEVER restate what another file says. Point at it instead.

### Why this is strict

AN UNMAINTAINED COMMENT DOES NOT MERELY AGE, IT LIES, and nothing in the
build catches it. More of this project's staleness has come from comments
than from any other source.

PREFER DELETING A COMMENT TO WRITING ONE. Nobody maintains them.

THE TEST OF A COMMENT is whether it can go stale. If the code changing
would make the comment wrong, and nothing would fail, then delete it or
turn it into a check.

A DELIBERATE CHOICE THAT MUST SURVIVE FUTURE EDITS GETS A TEST OR A LINT,
never a comment. A comment is the weakest guard there is.

### The rule has a ratchet, and it names the tree it watches

`deliverable/tests/comment-rule.test.ts` counts every comment line carrying a
date or an owner attribution, per tree, and refuses a rise. The count may fall
freely and may never grow.

A CEILING PER TREE, never one number for all of them. The engine stands at
zero, and a shared ceiling would let test debt spend that.

AIM IT AT EVERY TREE THE RULE BINDS. It watched the engine alone for months,
so the engine reached zero while the tests reached 521 under a guard that
looked like it covered them. A ratchet over half a tree measures the half that
was already clean.

## Guards that teach

A guard exists to move the work on, never to prove a rule. These four came
out of one day of measuring what the lane actually cost its callers.

- THE CORRECTION RULE. Correct what is mechanical,
  announce what you corrected, and refuse only the ambiguous.
  - A refusal over a difference nobody can see on screen spends a round and
    teaches nothing.
  - A silent correction teaches nothing either.
  - Do it, and say what you did.
- ONE TABLE, THREE OUTPUTS. Where a rule is enforced, the warning it prints
  and the tool description that announces it all generate from ONE table.
  Feed-forward and feedback cannot drift apart if there is nothing to drift
  between.
- SHIP AT WARN, BLOCK ON EVIDENCE. A new guard warns first.
  - It only starts refusing once the log shows its warn rate near zero AND the
    lane demonstrably serves the job it is fencing off.
  - A guard that blocks work the lane cannot yet do is a trap.
- THE AGENT THINKS ABOUT THE WORK. THE ENGINE THINKS ABOUT THE BOOKKEEPING.
  Every protocol element that spends the agent's attention on something the
  engine could carry is a defect with a deadline. The reading loop, the
  update ruling and the auto-corrections are all this law being applied.

## A file another program owns

SOME FILES BELONG TO SOMETHING ELSE. An editor's registry, a package manager's
lock file, a runtime's cache. We sometimes have to add a line to one. We never
get to decide what the rest of it means.

THREE RULES, AND EACH ONE COST A REAL BREAK.

- DROP THE ELEMENT YOU CANNOT IDENTIFY. Never carry it through a rewrite.
  - Carrying it makes the damage permanent, because every later run writes it
    back.
  - This is about elements, not about keys. Keys you do not recognise on an
    element you DO recognise are carried verbatim.
- WRITE THE SHAPE, NEVER THE SERIALISER'S GUESS AT IT. A list of one is still
  a list.
- VERIFY WHAT WAS ALREADY THERE, not what you added. Read the file back, check
  that every entry you found is still findable, and roll the write back if one
  is not.

CHECKING ONLY YOUR OWN ENTRY IS THE TRAP. It passes while everything else is
gone, which is the exact state it was meant to catch.

### The break that set this

VS Code listed no extensions at all and printed `Invalid extensions content` at
its own registry file. Seven extensions sat on disk, correctly built, and none
loaded.

The installer had rewritten `extensions.json` through a PowerShell JSON round
trip. Three defects, in one block of forty lines.

- It kept an element carrying no identifier, so no later run could undo a bad
  one.
- It serialised a one-entry list as an object, because piping an array of one
  into `ConvertTo-Json` unrolls it.
- It verified only that our own id was present, which it was.

THE WRITE MOVED INTO THE ENGINE, where JSON is JSON. The module is
`vscoderegistry.ts` and the guard is `vscoderegistry.test.ts`.

### Structured data does not go through a text-shaped language

POWERSHELL'S `ConvertFrom-Json` AND `ConvertTo-Json` ARE NOT A ROUND TRIP.
They reshape what passes through them.

- A collection inside a collection comes back wrapped under a `value` key.
- An array of one comes back as an object.

NODE IS ALREADY A HARD DEPENDENCY of every install path here. Where a script
has to touch structured data, hand the job to node. Keep the shell for what
only a shell does.

## The toolchain is mechanical

What a machine can check, a machine checks. What a machine can fix, the
ENGINE fixes — and says so. The concrete tools and their flags are the
project's own rulings, in `guidance/method/engineering.md`.

- RUNNING IS NOT CHECKING. The runtime strips TypeScript's types without
  reading them. Only the typechecker reads them. A tree that runs clean can
  still be full of type lies.
- THREE GATES, ONE ORDER: the typechecker, then the linter-formatter, then
  the scoped tests. The commit hook runs the first two and BLOCKS — a red
  gate is fixed now, never committed around.
- THE LANE FIXES WHAT A MACHINE CAN FIX. A write to a covered file comes
  back formatted and safe-fixed. The result names what changed, and the
  returned hash is the FIXED content. Never re-apply what the result says
  was fixed; never hand-format.
- WHAT THE FIX CANNOT REACH RIDES THE RESULT as findings, at the same bar
  the commit hook holds. Fix them when they appear — they are the exact
  list the hook would refuse.
- AFTER A REFLOW, YOUR EXCERPTS ARE STALE. The fixer may move lines the
  moment you write them. Re-read before the next patch instead of patching
  from memory — a stale old_string is the most common self-inflicted
  refusal.
- COMPLEXITY HAS A CEILING, enforced as an error. The fix is splitting
  along the function's own phases into named functions. Never suppress the
  rule, never inline-disable it.

## Dated guidance

This applies to every citation, and to your own instincts.

- Do not ask how OLD a piece of guidance is. Ask which resource it was RATIONING.
- Rations human LABOUR: suspect it. That cost collapsed once a machine started doing the work.
- Rations human JUDGEMENT or ATTENTION: it still holds. There is still one owner, and they still have to look at the diff.
- Most guidance predates AI and was written for human teams. Split it along that seam instead of quoting or discarding it whole.
- This binds the assistant's own instincts too. The training assumes writing the code is the expensive part.
  - Where a recommendation rests on that assumption, say so rather than asserting it.

## Use the cores

The target machine has MANY cores, and always will. Twelve is the floor,
not the expectation. Work that leaves nineteen of twenty idle is a defect,
not a slow machine.

- Parallelise anything that can be parallelised. Independent work runs at
  once, by default. Sequential is the exception, and it says why.
- Size the fan-out from the machine, never from a constant. Read the core
  count at run time.
- A single-threaded step that dominates a wall clock gets SPLIT until it
  fits the cores. A test file with fifty sequential cases is one such step.
- Measure before and after. A parallel version that is not faster is
  hiding a shared resource, and the sharing is the real bug.

This binds tests hardest, because a suite is the most parallel workload a
project owns and the one whose slowness is felt every day.

## Writing tests

### Asserting on a refusal

ASSERT AGAINST THE PROSE A READER WOULD SEE. A typed rejection carries an `expected`, a `remedy.note` and a `message`. Those are the words a person acts on, so those are what a test pins.

NEVER ASSERT AGAINST THE SERIALISED ERROR OBJECT. A rejection also carries a field called `source`, and a check that stringifies the whole object matches the KEY NAME rather than the message. It passes while saying nothing.

NEVER ASSERT AGAINST A TOKEN THE INPUT SUPPLIED. A refusal usually echoes back the path or the name it was given. A test that searches the output for its own input matches its own echo and passes for the wrong reason.

BOTH FALSE GREENS HAVE HAPPENED HERE, in one file, and both are written up where they occurred.

### Suite speed

A suite has THREE speeds, and choosing between them is the whole craft.

- ACROSS FILES is real parallelism. The runner gives each file its own
  process, so files use every core. This is the only lever that beats a
  CPU-bound suite.
- WITHIN A FILE is cooperative. Cases share one thread, so concurrency
  there only helps work that WAITS on something outside the process. It
  buys nothing for pure computation.
- SEQUENTIAL is the exception, and it names its reason in a comment.

What decides the speed is SHARED PROCESS-GLOBAL STATE, nothing else:

- A case with its own temp root, its own server and its own fixtures is
  independent. It runs concurrently.
- A case that writes `process.env`, changes the working directory, binds a
  fixed port, or mutates the real repository is not. Its siblings would
  see the change, and the failure would be a rare one — the worst kind.

So the rules:

- PREFER MANY SMALL FILES to one large one. Files are the only unit that
  reaches a second core. A file that dominates the wall clock gets split
  by theme, and the split is worth more than any cleverness inside it.
- QUARANTINE the global-state cases in their OWN file. One case touching
  `process.env` holds a whole file sequential; move it out and the rest
  goes concurrent.
- Where every case in a file is isolated, wrap them so they run together
  and say so at the top of the file.
- NEVER share a fixture between cases to save setup. A fresh root per case
  is what makes the parallelism legal, and setup is cheap.
- MEASURE before and after. A concurrent file that is no faster was
  CPU-bound, and wanted splitting instead.
- A GUARD THAT MAKES A TOOL DO NOTHING IS INVISIBLE to a test that only
  reads that tool's output. The suite sets SE_SELFTEST_SKIP,
  SE_KEEPAWAKE_DISABLE, SE_RELOAD_DRY and SE_SCRIPT_SKIP, and any of them
  can turn a spawned script into one line of nothing. A test that spawns a lane script
  clears the guard it needs cleared, and ASSERTS THE WORK RAN — never just
  that the output looked sound. The tell is a case that passes alone and
  fails in the suite.

And the suite is not one thing. BOOT runs a SMOKE test — seconds, proving
the engine loads and answers. The full battery proves behaviour, and that
question belongs to validation, at the end of a piece of work.

THE BATTERY IS THE EXCEPTION, NOT THE HABIT. Measured: about sixty full runs in
one two-hour session, each piped to a temp file and grepped for a single
failure.

- SCOPED IS THE DEFAULT. Name the files the change touches, and the result
  carries the counts plus only the failures' detail.
- THE BATTERY IS EARNED. It runs when a change maps to no test file, when
  the last one was red, when there is no memory of one, or on demand for a
  flake hunt.
- PAST ROUGHLY A THIRD OF THE SUITE PIECEMEAL, THE ECONOMICS FLIP and the
  battery becomes the cheaper, sanctioned call. Approximating the battery
  is what makes the battery legal, so gaming the scope never pays.
- TEST TO ANSWER A QUESTION, NOT TO REASSURE YOURSELF. In most cases the
  change broke nothing, and a green run you already expected bought you
  nothing but the wall clock.
- THE BATTERY IS FIRE AND FORGET. Call it only
  when the scoped runs make you expect green, then DO OTHER WORK while it
  runs — never sit polling it. Its verdict logs itself when the run ends
  (an se_test_verdict record), and the retro reads the failure rate — and now
  the per-case timings, and the slow surfaces through se_log_query's min_ms — from
  the log. The one exception: do not start work that touches the same
  files the running battery is proving.

## Where things live

A directory listing is a MENU, not an index. The reader is choosing, and a
level that shows twenty things has stopped helping them choose.

- ABOUT FIVE ENTRIES PER LEVEL. It is a shape to aim at, not a count to
  enforce. Well past it, the level wants splitting.
- EVERY ENTRY MEANS SOMETHING AT ITS OWN LEVEL. A reader looking at this
  level should expect to find it here. If they would not, it belongs
  further down, with the thing it serves.
- THE FRONT DOOR IS THE STRICTEST LEVEL. The project root is what a
  stranger sees first, and it carries only what a stranger needs: how to
  start the thing, and the folders the work lives in.
- CONFIGURATION LIVES WITH WHAT IT CONFIGURES. The product's name and the
  product's colours are the product's, not the repository's.

## Sizing and records

- Size work by its CONTENT, never by an agent's time estimate. Those estimates overshoot wildly and have done so repeatedly, a day claimed against an hour spent.
  - Do not parrot an inherited size claim either.
- Never say how long something will take unless you have a measurement. "Roughly a day" from feel is not an estimate; it is a guess wearing one's clothes.
- Size the vehicle before choosing it. An expedition and an iteration are each worth ROUGHLY A DAY of agent work.
  - Anything smaller goes INSIDE one.
- Never spam the archives with many small records. Bundle related small work into ONE expedition or iteration.
  - An archive reader does not care about ten-per-day granularity.
- A single small fix never earns its own record. It is a commit inside an expedition that is already open, or inside one opened to hold the day's work.
- AN EXPEDITION THAT BECOMES THE DAY'S BUCKET SAYS SO IN ITS GOAL. Bundling is right, and it quietly makes the goal a lie.
  - An expedition opened to put the system into VS Code ended up holding a handover law, a rigor column, log paging and a palette file. Nobody looking for those would look there.
  - Amend the goal when the bundle grows past it, or the archive keeps the work and loses the thread.
- Commits stay fine-grained, and records do not. The two answer different questions.
- WORK IS PATCHED INTO A SEEDED RECORD ONLY, never into a started one.
  - A seed is a proposal. Editing it is still composing the record.
  - A started record's scope is signed. Work arriving by a later edit to its seed was never in what anybody blessed.
  - Late work goes to the options pool instead. It reaches a record by the normal route, at the next seeding.
- EVERY WORK ITEM HAS EXACTLY ONE HOLDER, at every moment. The holder is the pool, a retro, an iteration, or the archive.
  - An item held by nothing is the failure this rule exists to stop.
  - It has happened. Eight notes were drained to a record, the record's scope disowned them, and they were held by nothing at all.
  - Draining a note to `backlog` mints a WORK TOKEN under `spec/trace/work-token/`, which is the pool holding it until a seeding pulls it in.
