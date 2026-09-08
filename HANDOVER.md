---
kind: [[handover]]
status: held
---

# One door per outside thing, and a fake for each

The tree reaches binaries, disk, git and the clock from wherever it likes. So a
test that needs any of them pays the real cost, and 8 such tests already cost
862ms against 43ms for the 33 that stay in memory.

## What stands on this branch

- `src/doors/` holds `proc`, `disk`, `clock` and `git`. Each is the one place
  this tree reaches that thing.
- `src/doors/fake/` holds a fake for each. They behave: the disk keeps a map,
  and the process throws on a command nobody taught it.
- `spec/config/styles/VoiceVale/DoorsOnly.yml` refuses a `node:` import, a
  clock read and a random call outside `src/doors`.
- `spec/config/styles/VoiceVale/FakeDoorsInTest.yml` refuses a normal test
  importing a real door.
- `.vale.ini` scopes both, exempting the doors and the hooks module.
- `spec/guidance/testing.md` and its rationale carry the rules.
- `src/scripts/work.js` takes its doors as an argument already.

## Do this

1. Run `./RUNME.sh lint .` and read the 25 breaches it names. They are the debt.
2. Move each test that drives Vale or Biome into `test/contract/`, one per door.
3. Rewrite the rest against the fakes, so they touch memory alone.
4. Give `src/scripts/cli.js` its doors, the way `work.js` takes them.
5. Add the check no pattern can hold: every real door has exactly one contract
   test. It reads two folders, so it belongs in the command line.
6. Measure the suite before and after, and write both numbers here.

## What holds

- `./RUNME.sh check` is green, and `lint` names no `DoorsOnly` or
  `FakeDoorsInTest` breach
- the suite runs faster than 862ms of spawns, and the number is on this file
- a fake and its real door answer the same in the contract test
