---
kind: [[guidance]]
scope: ["every test, check and benchmark in this tree"]
rationale: [[spec/rationales/testing]]
---

# Actionables

1. Reach the outside through a door under `src/doors`, and nowhere else. *
2. Write a normal test against a fake from `src/doors/fake`. It touches memory and nothing else. *
3. Put a test that drives the real thing in `test/contract`, one per door. *
4. Write a fake that behaves. A double scripting the answer tests the script. *
5. Open a hard piece with a design doc, and a simple one with the test. Then write the code, and watch a test fail for the reason you expect before you make it pass. *
6. Name a test as the claim it makes, and assert every word of that claim.
7. Share a fixture nobody writes to, and make what a test changes inside the test.
8. Take the clock and the random source as arguments, so a failing case replays.
9. Let every test run beside every other. A test needing an order is a red test.
10. Run `./RUNME.sh check` before you finish, and read what it names.
