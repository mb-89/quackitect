# Specifying

Read this before drafting a token. It says what a spec has to carry and why,
and a reviewer judges a draft against it.

## What a spec is for

A spec says what the problem is and what done means, before anybody works on
it.

The failure it exists to stop is a reviewer telling a worker it has not done
the work. That is a fault in the token rather than in the review: nothing said
what done meant, so nothing could be checked before the submission, and the
review became the first place anybody looked.

## The two parts

THE PROBLEM, in the words it was asked in. What is wrong, or what is wanted,
and enough of the circumstances that somebody arriving later can tell whether
it still applies.

THE CRITERIA. One line each, saying what has to be true. Where a criterion can
be a command, it is one, and it passes when it exits zero.

## A criterion that can be a command is one

A command fails and a sentence does not.

A criterion nobody could check is not a criterion. If a line cannot be judged
by running something or by a reader looking at one named thing, it is a wish.

Where no command decides it, the worker answers it by name in the evidence and
a reviewer judges the answer. That is worse than a command and better than
nothing.

## The command decides the sentence above it

A criterion is two things, and they have to be about one thing.

The sentence says what has to be true. The command decides it. When the two
drift apart the command still exits zero, so the gate opens on a sentence
nobody checked, and the token closes carrying a claim that is false.

The shapes of the drift, each found on a real token here.

BORROWED. The command was copied from a neighbouring token and still names that
token's deliverable. It passes because the neighbour is finished. Read every
command you copied and ask what file it names.

A LITERAL NOBODY DERIVED. The command searches for a string that encodes a
claim about the tree, and nothing ever ran the thing that would establish the
claim. The search proves the string is present and says nothing about whether
it is true. Derive the literal by running the command that decides it, then
write what that command answered.

A SET COVERED BY ONE MEMBER. The sentence is about all of them and the command
names one. A deliverable naming three of thirteen passes. When a criterion is
about a set, the command walks the set and fails on the first miss.

AND WALKING THE SET IS NOT WHAT MOST TOOLS DO WHEN HANDED ONE. `rg -q PATTERN
a.md b.md c.md` exits zero when ANY of the three matches, so a command that
names every member reads as the remedy and quietly ORs them. Anything with a
find-and-stop exit code does the same. Write the loop, and let it fail on the
first miss:

    for f in a.md b.md c.md; do rg -q PATTERN "$f" || exit 1; done

THE TELL IS THE EXIT CODE'S SUBJECT. Ask whether the tool exits on any or on
every, and where the answer is any, the command is one member's however many
you list.

AN EXTENT IS MEASURED, NOT INHERITED. A reviewer's finding names the places it
happened to look. Writing those places into the criteria and calling them all of
them turns a sample into a measurement silently, because the draft then carries
the word every and a list, which reads exactly like one. Re-sweep the file
yourself and say what the sweep answered.

A LIVE FACT DEMOTED TO PROSE. The engine runs a command criterion once, at the
submission gate, so it reads the world at the moment of submission. That is
exactly the instrument a live fact wants. Prose is for a fact no program can
decide, and not for one that changes.

A SNAPSHOT TAKEN AFTER THE WORK HAS STARTED. Pinning a one-time assertion to
what existed is right, and taking that pin late is how it goes wrong. The set is
frozen after part of it has already been settled, so the token closes showing
every verdict it owes and owing fewer than it did. Every criterion then agrees
with itself.

MEASURED. A backlog pass froze thirteen ids. Four more had been settled by the
same token eight minutes earlier and were gone from the live list by the time it
was written down. The set owed seventeen.

TAKE THE PIN FROM THE COMMIT THE WORK STARTED AT, not from disk, because disk is
now. Where part of the set is not in version control, read that part off disk
and say in the token which part that is and why it will not show in a diff.

A ONE-TIME ASSERTION WRITTEN AS A STANDING RULE. The opposite mistake, and it
looks the same on the page. A criterion asserting something about the project's
own data becomes a permanent rule the moment it is agreed, so it goes red the
next time anybody adds an ordinary row. Pin a one-time assertion to what existed
when the work started, by id or by a snapshot inside the token.

THE TWO LAST ONES ARE ONE QUESTION. Ask whether the criterion is about the
change or about the project, and then whether it is asserted once or forever.
Say which in the sentence, so the reviewer judges the instrument and not only
the words.

## What a criterion is not

It is not a plan. How the work is done is the worker's, and a spec that
prescribes the method has decided something it does not own.

It is not a restatement of the problem. "The editor works" says nothing a
reviewer could hold up against the tree.

## Who drafts

Everything a person mints, and everything an agent mints that is not a
sub-token.

A sub-token breaks down work whose criteria are already agreed, so drafting it
again would agree the same thing twice.

## Prior art

These are the findings this method rests on. Each one is stated with what is
known about it, and an estimate is marked as an estimate.

**Fit.** Ward Cunningham, around 2002. Framework for Integrated Test. Tables
written inside a document are executed against the system, so one artefact is
both the specification and the test. What this method takes is the central
claim: an example that a program can run is worth more than a sentence that
only a person can read, because only one of them can disagree with the code.

**FitNesse.** Robert Martin and others, built on Fit in the years after it. It
put those executable tables in a wiki so the people who own the requirement can
edit them. The part this method takes is that the criteria live in the token a
person reads and edits, rather than in a test file only a programmer opens.

**Specification by example.** Gojko Adzic, in the 2011 book of that name. It
describes a cycle: derive scope from goals, illustrate with examples, refine
the specification, automate validation without changing the specification, and
let what results become living documentation. Two of those are load-bearing
here. Automating validation WITHOUT CHANGING the specification is why a
criterion carries its command rather than being replaced by one. And living
documentation is why the criteria stay on the token after it closes.

**The three amigos.** The practice of a specification being agreed by more than
one role before the work starts, commonly credited to George Dinwiddie, who
named the three as business, development and testing. This method has two roles
rather than three, so what it takes is the shape rather than the count: the
draft is agreed by somebody other than the person who will do the work, before
the work starts, which is what spec_in_review is.

**Behaviour-driven development.** Dan North, from around 2006, out of work on
JBehave. Its argument is that the vocabulary of testing misleads people into
describing implementation, and that describing BEHAVIOUR instead produces
specifications a non-programmer can agree. This method takes the diagnosis and
not the given-when-then form: a criterion here is one line rather than a
scenario, because a token is not a user story and forcing the form on it would
produce ceremony rather than clarity.

ESTIMATE, MARKED AS ONE: that agreeing the criteria before the work costs less
than the rounds it saves. This project has one data point, a token that took
five rounds because nothing said what done meant, and one data point is an
anecdote rather than a measurement.

## Where this came from

Written after the owner asked for the specs to have a proper format and for the
prior art to be read and cited rather than invented.

What is deliberately not here is the SHAPE of a spec on the page: which
headings, which frontmatter. That is a template question, and templates are
their own piece of work.
