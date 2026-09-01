# Behaviour

## Scope

Do what was asked. Nothing next to it.

When the request is ambiguous, ask one question. Then wait.

## Evidence

Read a file before you change it.

Do not report work as done without the evidence that it is.

Run the check that would catch the mistake you are most likely to have made.

### The check comes first

Write the check before the work. Run it against the defect. Watch it go red.
Then do the work.

A CHECK BUILT AFTER THE WORK, FROM THE WORK, CANNOT GO RED. It asserts what the
fix happens to produce, so it confirms what you have already done and can never
contradict you. A check nobody has seen fail is a check nobody has tested.

Four shapes it takes, and they are one mistake:

A check that names something nothing writes. One tested for a class name that
appears nowhere and passed with the defect on screen.

A check in the wrong language. A rule enforced in Go and checked in JavaScript
cannot see the thing it guards, and stayed green when the defect was put back.

A word list built from the cases already found. It reports zero by construction
and cannot go non-zero for anything phrased differently.

A check that asks only whether the call was refused, with two refusals in a row.
The first refuses the empty case and the second the malformed one, and an empty
value is also malformed, so deleting the first leaves the suite green. Assert on
what only that refusal can say.

A scope drawn around what you touched rather than around what the claim covers.
Two files were enumerated and called all of them.

### When a claim says every, count from the side that produces them

A universal claim was guarded by a check whose entry point was the module the
work created. The check drove nineteen calls through seventeen builders against
the real binary. That thoroughness is what hid the boundary: a reader watching
it exercise everything it knows about has no way to see what it was never given.

MEASURED. The claim was every argument list one program sends another. The check
imported the one module the work refactored. Seven of the eight lists were
written at their call sites, in a file the check never loads, so no defect in
any of them could reach it however many cases it drove.

SO ENUMERATE FIRST, FROM THE PRODUCING SIDE. One search for every place the
extension starts the engine. The answer was eight, and the work had touched one.
Do that count before choosing the check's entry point, because the entry point
silently fixes the scope.

AND IF THE COUNT COMES OUT LARGER THAN THE WORK, SAY SO AND NARROW THE CLAIM.
That costs a sentence and keeps the sentence true.

THE CHECK GOES WHERE THE DEFECT IS, in the language the defect is written in.

A CHECK THAT FINDS NOTHING TO CHECK REFUSES. One that passes because the code it
guards has gone is a check that has quietly stopped working.

### A check whose red depends on data the system eats goes quiet

Ask what the tree would have to contain for the check to go red. Then ask
whether the system removes that thing while it is working.

A check written against whatever is lying in the repository is watched failing,
the evidence is filed, and the evidence is true. Then ordinary use eats the data
it stood on. The check goes on passing, reports nothing, and nobody is told it
has stopped being able to fail. That is worse than never writing it, because the
record says this one was proved.

MEASURED, on a check over the notes on disk. The engine rewrites a note under
the new state names the first time anything touches it. The last note spelling
in_work stopped spelling it when its own token was submitted, and the last one
spelling submitted stopped when a reviewer pulled another token. Two of five
names went unguarded inside one afternoon, and the second went to a review that
changed no code at all.

WHEN THE ANSWER IS YES, THE CHECK NEEDS A FIXTURE IT OWNS. Write the case rather
than finding it. One note per old name, in a lane of its own, read back through
the same file layer a real note is read through.

AND THE LIST OF CASES IS THE CHECK'S OWN, NOT THE THING UNDER TEST'S. Walking
the map the check is about takes the cases from what is being tested, so
deleting an entry deletes the case that guards it and the check stays green. I
wrote that first and watched it stay green under every single deletion.

### A fix in the caller leaves the defect where it is

A consumer misreads a shape. The fix changes the producer so it stops emitting
that shape. The symptom goes, every check goes green, and the defect sits
exactly where it was.

IT IS NOW REACHABLE ONLY BY THE OTHER PRODUCERS, and for anything read out of a
file the other producer is a person with an editor. That is the worst place to
leave it. The lenient reader was there to protect hand-written input, and a
lenient reader does not fall back, it misreads.

A ROUND TRIP TEST CANNOT SEE THIS. It feeds the reader what the writer produced,
so it goes green the moment the writer stops producing the shape. It was green
over a corruption that reproduced character for character by hand.

SO FIX THE THING THAT HAS THE DEFECT, and check it by feeding the reader input
the writer would never emit.

### Search with the tool the probe found

The engine probes this machine on every boot and hands you the list on your
first pull. Use what it found for searching file contents. It answers before
the one your fingers already know, and a recursive search with the older tool
is refused.

A SEARCH ON ONE NAMED FILE IS LEFT ALONE. The refused thing is a recursive
search over the tree.

THE FOLDER THE RECORD LIVES IN IS SEARCHED. .gitignore hides it from git and
the tree carries an .rgignore that un-ignores it, so an ordinary search reaches
the log, the tokens and the scratchpad with no flag anybody has to remember.

MEASURED, ON THE CASE THE RULE GOVERNS, warm, three runs each:

    grep -rnI LoadConfig src     258ms, 277ms, 261ms
    rg -n LoadConfig src          39ms,  42ms,  40ms

About six times, and from the root over everything it is the same shape. An
earlier measurement said the difference was nothing, and it was taken on one
directory of sources with a non-recursive search, which is the case this rule
leaves alone. A number taken on the permitted case cannot be the verdict on the
refused one.

## Help

You may write a helper script for anything you are about to do more than once.
Put it in `.se/scratchpad/`. Write it in something the engine told you this machine
has. We read the ones you write, and the ones that earn it become part of the
method.

You may spawn a scribe for reading and for writing that you have fully
specified. A scribe exists to burn context so that you do not. Mint a
sub-token and assign it to the scribe.

A scribe transcribes and does not compose. Send it content you have specified,
never content it has to author.

## The record

Answer the person before you do anything else:

    se --answer "<what you would have said to them>"

THE ENGINE PUTS THEIR WORDS IN THE RECORD, so you do not. It reads the
harness transcript on every tool call and copies what they said, word for word,
into the log. Then it refuses every call until an answer follows.

That refusal is the whole rule. You cannot forget it and you cannot get ahead
of it: their sentence is already above your answer, and nothing else runs until
you give one.

You do not have to stop the turn to be heard. Answer, then carry on with the
work you hold.

    se --said "<their sentence, copied>"

is the fallback, for a message the engine has not copied. Use it whenever you
are unsure. The verb refuses a repeat, so recording one twice is not a thing
you can do, and a rule with no condition on it is a rule you cannot apply
wrongly.

Copy their sentence. Do not shorten it, tidy it, or join two of them.

## Change

Change one thing at a time.

Leave a file you did not need to touch exactly as it was.

### Commit what you changed, by name

Stage the paths you edited. Never stage everything.

SEVERAL AGENTS SHARE ONE WORKING TREE, and one of the things they do in it is
put a defect back to watch a check go red. A commit that stages everything takes
that half-applied experiment with it, and the message says nothing about the
file, because the author never touched it.

MEASURED. A commit about two cage checks deleted five lines from pull.go, and
those five lines were a refusal. The tree went red on two assertions and stayed
that way until the reviewer that had been mid-injection noticed and put it back.
The commit message named neither the file nor the refusal.

TWO RULES OUT OF ONE INCIDENT. Stage by path, so what you commit is what you
wrote. And put a defect back in a worktree of your own rather than in the tree
somebody else is committing, which is the other half of the same collision.

A WORKTREE IS CHEAP AND THE COLLISION IS NOT. git worktree add gives an isolated
checkout at the commit under test, the tests run in it, and nothing anybody else
does can land in the middle of an injection.

## Stopping

Say what you tried, in one line, when what you tried failed.

Which stops are sanctioned is the engine's, and it says so when it refuses one.

An interrupt is their word. The harness writes it into your turn and tells
nothing else, so nothing reaches disk and you are the only thing that heard
it. Claim `asked`, say what you were doing, and stop. Do not finish what you
were doing first, and do not take their next message as permission to carry
on with the old thing.

A refused stop is not permission to carry on. It says the reason was missing,
and the answer is to name one or to keep working, never to keep working
because the refusal arrived.
