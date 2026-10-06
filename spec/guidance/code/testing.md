---
kind: [[guidance]]
tags: [testing]
scope: ["every test, check and benchmark in this tree"]
rationale: [[spec/rationales/testing]]
---

# Actionables

1. In the VS Code extension under `src/extension` and the level-zero hooks under `.claude/skills/level0`, reach the outside through a door under `src/doors` alone. The Go IO modules follow rules 11 to 15 instead. A module reading the outside in place takes the box into every test of it. *
2. In that JavaScript, write a normal test against a fake from `src/doors/fake`. It touches memory and nothing else. *
3. In that JavaScript, put a test that drives the real thing in `test/contract`, one per door. A door nobody drives fails on the first box its fake misses. *
4. Write a fake that behaves. A double scripting the answer tests the script. *
5. Open a hard piece with a design doc, and a simple one with the test. Then write the code, and watch a test fail for the reason you expect before you make it pass. For a defect, that failing case is a `./RUNME.sh probe` run or a contract case showing the live fault through the real door, since a fix against a guess lands green while the fault stands. The commit door refuses a change standing with no test, and `EveryModuleTested` reads the tree. *
6. Name a test as the claim it makes, and assert every word of that claim.
7. Share a fixture nobody writes to, and make what a test changes inside the test.
8. Take the clock and the random source as arguments, so a failing case replays.
9. Let every test run beside every other. A test needing an order is a red test.
10. Read the rule on the check in [[spec/guidance/code/code]], which holds it over every change. Read the rules on behavior tests in [[spec/guidance/code/examples]].
11. Test a Go module without the `io` flag against the fake index in `q/qtest`, and against nothing else. Import nothing past `q`, `q/qtest` and the pure standard library. A fixture rides in through `embed`, or the case seeds it. [[spec/design_output/model#the-fake-index]] *
12. Test an IO module against `q/qtest` and the fake of its outside world. A fake disk, git, process or clock stands local. [[spec/design_output/model#its-file-carries-its-fake]]
13. Every fake stands for a contract. Each contract has one suite of cases, written once, that runs against both the fake and the real thing. The check refuses a fake with no suite beside it. [[spec/design_output/model#the-fake-keeps-a-contract]] *
14. Test the index against a fake module. It registers reads and writes, and drives every transaction a module makes. [[spec/design_output/model#the-index-meets-fake-modules]]
15. Cross no module boundary in a test, past a contract suite, the fake module and the cage's replays.

# Examples

| the rule | do | do not |
|---|---|---|
| 4 | a fake disk that reads what it writes | a double answering a scripted string |
| 5 | a red test before the code | code first, a test after |
| 5 | a contract case red on the live fault, then the fix | a fix to the code a guess names, green on the fake |
| 11 | a module test seeding `files/` through `q/qtest` | a module test reading a file off the disk |
| 13 | one suite of cases run over `FakeGit` and a real repository | a fake no suite holds to the real thing |
