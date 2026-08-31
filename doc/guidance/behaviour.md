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

A scope drawn around what you touched rather than around what the claim covers.
Two files were enumerated and called all of them.

THE CHECK GOES WHERE THE DEFECT IS, in the language the defect is written in.

A CHECK THAT FINDS NOTHING TO CHECK REFUSES. One that passes because the code it
guards has gone is a check that has quietly stopped working.

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
