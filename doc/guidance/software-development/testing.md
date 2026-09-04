---
kind: [[guidance]]
scope: ["every agent or person writing a test, a check or a benchmark, in any language"]
out_of_scope: ["the craft of the change, which is [[writing-software]]", "the shape of a Go test, which is [[writing-go]]", "the structure a test exercises, which is [[shape-of-a-program]]"]
depends_on: ["[[writing-software]]", "[[behaviour]]"]
---

# Motivation

A test earns its place by going red when the program is wrong, and loses it when it can go red for anything else.
The suite is paid for on every run, by everybody, so what a test depends on and what it costs are decided here.
This file is about tests as such: how one is designed, what it may touch, and when a property, a fake or a benchmark fits.
A reader of it needs to know nothing about the engine.
A rule a program can check is a check in [[util/checks]], and it is not repeated here.
This is craft guidance, read when writing a test, and it is not part of the standing layer.

# Actionables

1. Write the test before the change. Watch it go red for the reason you expect, then green once. *
2. A test that will not go red is the finding. Write it down before anything else.
3. Test at the surface the user meets. A test of the code's own output proves the output. *
4. One behaviour per test, named as the claim it makes. Assert every word of the claim, not the half that moved. *
5. Size a test by what it touches: memory, then one process and its disk, then the network. Most are the first. *
6. For a pure function, state the property and generate the inputs. *
7. Where a claim covers a set, count it from the side that produces it: every cause, spelling, value and exit. *
8. A sweep guards the set the claim counts, not one member, and refuses to report until it finds one known to be there. *
9. Feed the reader input the writer would never emit. A round trip proves only the writer.
10. A test builds what it needs and reads nothing it did not write. Where a case came from stays out of it. *
11. Fake the world at the boundary you own, with a fake that behaves. A mock that scripts the answer tests the script. *
12. A shared fixture is made once, read by all and written by none. What a test changes, it makes itself. *
13. A test runs nothing found on the machine and never waits on a clock. Its tools, clock and randomness are fixtures. *
14. Every test runs in parallel and shares nothing: no file, no port, no order. A flaky test is a red one. *
15. Timing is a benchmark, run at the retro on one machine. A measurement proves its command ran: real output, an asserted exit code. *

# Discussion

## 1. The test comes first

A test built after the work asserts what the fix happens to produce.
Shapes: a class name nothing writes, a scope drawn around what was touched.
A test comparing two spellings of one path could not fail on Windows, where both spell one string.
Inherited work arrives green, so break what its test guards and watch it go red.

## 3. Building to the test

A 2026 study gave two agents a hidden test suite.
With the tests visible the scores went near perfect and the feature was left dead.
A worker delivers what is checked, so a test reads the command a person runs or the file they open.
Fowler calls these sensors, and one on the wrong surface reads clean while the product is wrong.

## 4. The claim and the assertion

A criterion said one divider is the same as another and checked only that a divider was there; the other changed and three checks stayed green.
So where a criterion says the same as, name both places and compare the declarations field by field.
Another drove a configurable number only at its default, which a hardcoded literal survives: fixture it away from the default and assert the behaviour moves both ways.

## 5. Sizes

Google's engineering book sizes a test by what it may touch, not by what it covers.
A small test runs in one thread with no disk, no network and no sleep; a medium one on one machine.
The size says what can make it slow or flaky.

## 6. Properties

An empirical evaluation over forty projects: a property-based test finds about fifty times the mutants of a unit test.
A property is the invariant the core promises: a round trip, an order preserved, a total that matches.
The core is pure, so inputs are generated and the shrinker returns the smallest failing case.

## 7. Counting the set

A detail named three causes of a crash and fixtured one, so a classifier reading exit status let a build failure and a panic through.
A guard over a flag matched one spelling and answered nought where it carried quotes or backticks.
A walk of the explicit returns was offered as every way a thing can fail, missing a catch resolving undefined and an unread stream.
So count exits from the bottom, and ask the language for its spellings, writing them into the pattern's comment.
Build the hardest fixture first; where none can be built, say so in the detail.

## 8. A guard that has never found anything

A sweep counting a silent loss answered nought, and that nought went into the evidence while three real instances sat nearby.
A positive control comes first: name a member known to be there and refuse to report until it is found.
Another guard drove one producer and refused only when it emitted nothing, controlling the member, not the set.
Count the producers into the criterion, plant a violating second producer in a copy, and watch the check go red.

## 10. What a test may read

A test read a document for a list of ids and held each one answered.
Ordinary work rewrote the document, and no change to the program could make the test pass.
It was retired rather than fixtured, because a fixture copied from that document compares a constant with a constant.
A test depends on behaviour, never on documentation.
So where the case came from stays in the record that holds cases, because a comment carrying it is a second copy nothing keeps in step.

## 11. Fakes, stubs and mocks

Meszaros named the doubles; Fowler drew the line: a fake behaves, a mock is scripted.
A mock passes when the code calls what was scripted, so a refactor turns it red for nothing.
So the world is replaced at a boundary the program owns, by a fake keeping the contract: an in-memory store.
One test of that size meets the real thing; everything above it runs on the fake.

## 12. Shared and fresh fixtures

The suite once built the same binary from every test that wanted it, at the cost of a link no warm cache removes.
Measured: a hundred and ten seconds fell to forty-nine when `TestMain` built it once.
Meszaros' shared fixture pays only while nobody writes to it; his erratic test reads what another wrote.
So a binary or a parsed corpus is shared, and anything a test changes is fresh, made by the test's own helper.

## 13. The machine is not a fixture

A probe test named `go` as certainly present, because it was running under it.
Under load `go version` outlasted its bound and read as a defect.
A test waiting for the operating system to notice a file failed under load, so the daemon now takes its events from the test.
It probes a binary the suite holds now, by path, and answers the same everywhere.

## 14. Parallel, isolated, and never flaky

The suite ran serially while seven of eight cores idled, and the parallel call brought forty-nine seconds to seventeen.
It could take the call because nothing changed the working directory and every tree was temporary.
A check that read another's output passed while the battery was serial and failed at random after.
Google quarantines a flaky test the day it flakes, then fixes or deletes it.

## 15. Benchmarks and measurements

A benchmark asks whether this is faster than that, here, today.
So both sides run on one machine in one sitting, enough times for the noise to show, and `benchstat` reports only a difference that clears it.
Six measurements once measured something else: a hook timed at fifty-eight milliseconds had failed on its first line, and vet piped to head printed clean while reporting errors.
So a measurement reports only when its command produced output and the caller read the exit code itself, never one inherited through a pipe.
