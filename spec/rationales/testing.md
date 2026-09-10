---
kind: [[rationale]]
explains: [[spec/guidance/testing]]
---

# Why

Everybody pays for the suite on every run. What a test touches decides what it
costs, so that is the thing to rule on.

## 1. One door per outside thing

Measured in this tree at 41 tests: 8 tests that spawn a binary cost 862ms, and
33 tests running in memory cost 43ms. So a fifth of the tests take 95% of the
time, and that ratio worsens as the suite grows.

An earlier line of this project measured the same shape at its own scale. The
suite built one binary from every test that wanted it, and building it once took
110 seconds to 49. Running the tests beside each other took 49 to 17.

A door is the one place a program reaches a binary, the disk, git or the clock.
Everything above it takes the door as an argument, so a test hands in a fake and
touches nothing.

## 2. What the checks hold

Three checks hold the rules above:

| check | what it refuses | where it runs |
|---|---|---|
| `DoorsOnly` | a `node:` import, a `Date.now`, a `new Date()`, a `Math.random` | outside `src/doors` |
| `FakeDoorsInTest` | a real door | inside `test/level0` |
| `./RUNME.sh doors` | a door standing without a contract test | over both folders |

Five modules pass `DoorsOnly`, because they reach nothing outside: `node:path`,
`node:url`, `node:test`, `node:assert` and `node:assert/strict`. Both Vale rules
read the whole file, because a rule over code needs `scope: raw`: on a code file
Vale otherwise sees comments alone. The third rule spans two folders, which no
pattern holds, so the command line holds it and `check` runs it.

The hooks module is exempt, because its environment carries no `node:` at all.
The engine interface `$` is its door layer already, and a test drives it by
handing in a `$` of its own.

An earlier line wrote fifteen rules of testing craft as guidance and enforced
none of them. The rules were right and the suite grew slow anyway, which is the
whole argument for a check.

## 4. A fake behaves

Fowler draws the line: a fake behaves, and somebody scripts a mock. A mock
passes when the code calls what the script expects, so a refactor turns it red
for nothing.

The fake filesystem here holds a map, and what a test writes it reads back. The
fake process answers from a table and throws on a command nobody taught it, so a
wrong answer stays impossible.

## 3. The contract keeps fakes honest

A fake with nothing behind it drifts from the thing it stands for. So one test
per door drives the real tool and holds the contract, and everything above it
runs on the fake.

That test costs what the real thing costs, once for the suite.

## 5. The doc comes first

Agents in this tree keep inverting the order. They build the thing, write the
design doc over what stands, then write tests against the code in front of them.
Each artifact records the implementation and rules on nothing.

| the order | what the doc holds | what the test holds |
|---|---|---|
| doc, test, code | what the work owes | the claim the doc makes |
| code, doc, test | what the code does | the code, in another form |

Read the reason a test gives on its failing run, and match it against the claim
in the test's name. A test that follows the code passes on its first run and
leaves that reason unread. A test failing on a missing import says nothing about
the claim it names.

Weigh the doc against the change. A doc costs a paragraph to change, and the
same design in code costs the code. Write one where the design holds a decision
somebody else would make differently, and skip it on a one-line fix.
