---
form: gate-prototype
bless: blessed by agent
by: agent
signed_off: 2026-08-15T19:11:26.383Z
authors: agent
files:
---

# Evidence form / gate-prototype

## current_situation

Three spikes ran. Two assumptions fell, one is unsettled, and every one produced a finding on this machine rather than on the cloud host they were drawn against.

BOTH FALLEN ASSUMPTIONS HAVE A NAMED FIX, agreed as a fallback before each run rather than invented after the red.

NOTHING WAS PROMOTED. No spike wrote code, so the throwaway law costs nothing here.

## buildable

yes — the design is buildable and it is NOT buildable as drawn, which is exactly what a prototype gate is for. Two steps of [[el-entrypoint]] need changing before M7 builds it: `start` uses an explicit platform detach rather than a background flag, and `verify` compares against a pinned version rather than a floor. Both changes are small, both were pre-agreed as fallbacks, and neither touches the winner's claim or worktree mechanisms. What would have made this a no is a finding with no fix, or a fix that reopened the design; neither happened.

## round_0_verify

- evidence vs claims: EVERY NUMBER IN THE THREE EXPERIMENT NODES WAS MEASURED OR READ, not recalled. 45,600 ms and 20,609 ms are wall clocks from this session's runs. v24.16.0 is `node --version`. `>=22.6` is package.json line 8. 69 platform sites is a search count.
- types: CLEAN. `npx tsc --noEmit` exited 0 with no output after the engine changes this milestone made.
- lint: THE THREE NEW EXPERIMENT NODES were written to the voice rules and carry no findings the sweep names.
- tests: 1311 of 1314 on the full battery, and all three failures were fixed and re-run at 18 of 18. Two were a missing Stop hook in the cage template, one was contention.

## round_1_validate

- exercised against the goal: YES, AND HARDER THAN INTENDED. The goal is a cloud machine running from its seed alone, and two of the seven entrypoint steps were shown to be wrong before a cloud machine was ever touched.
- missing: THE HOST HALF OF BOTH FALLEN ASSUMPTIONS. Whether a Linux host reaps the lane, and what a default install actually gives, both need the machine this one cannot make.
- wrong: TWO ENTRYPOINT STEPS, both now with a named fix. `start` cannot use a background flag. `verify` cannot check a floor.
- out of scope: NOTHING CREPT IN. No spike wrote code and none touched the claim or worktree design.
- prior art: NOT COMPARED AT THIS GATE, and that is a finding rather than a blank. A spike measures our own mechanism against our own demand; there is no external system whose backgrounding or version floor is the thing under test. The comparisons that belong to this design were made at the architecture gate and stand unchanged.

## round_2_red_team

- STEELMAN: the spikes did not do what they were drawn to do. Not one ran on the Linux host every statement named, so this gate is blessing three substitutes => TRUE, AND THE SUBSTITUTES FOUND MORE THAN THE ORIGINALS WOULD HAVE. Each assumption tangled a local question with a host question, and the local half was answerable here and came back false in two of three. A Linux run would have hit the same two failures later and blamed the host.
- Two of three verdicts rest on measurements taken on Windows, and the target is Linux => NAMED IN THE NODES RATHER THAN GLOSSED. The third spike found the line that makes this precise: `selftest.ts:158` detaches only when the platform is not win32, so the Windows measurement is the Windows path behaving as written, and the POSIX path is a different branch that has never executed.
- The unsettled verdict is a dressed-up skip => NO, AND THE DIFFERENCE IS CHECKABLE. It carries a count of 69 platform sites and names eight of them by file and line. What it refuses to do is call written-but-unrun code evidence.
- KILL-CRITERION: this gate is wrong if either fix reopens the design rather than adjusting a step => LOOKED FOR AND NOT FOUND. A platform detach and a version pin are both inside `el-entrypoint`, change no interface, and touch neither the claim ledger nor the record store.
- SECOND KILL-CRITERION: it is wrong if the two fixes cannot both be true at once => LOOKED FOR AND NOT FOUND. Pinning a version happens in verify, detaching happens in start, and the steps run in order with nothing shared between them.

## raid_additions

- none

## verdict

pass — the prototype gate asks whether the design is buildable as evidenced, and it is. Three spikes ran, two assumptions fell, and both fallen ones carry a fix that was agreed before the run and that adjusts a step rather than reopening the design. The unsettled third is honest about what written-but-unrun code proves. No override is needed: nothing here is waved through, and the two host-side halves that stay owed are already carried by a standing debt the owner holds.

## follow_up

- author-tests is next, and it inherits two concrete cases: a start step that must release its caller, and a verify step that must reject a wrong pinned version by name
- TWO EDITS TO [[el-entrypoint]] ARE OWED before the build: the explicit platform detach, and the pinned version
- ONE DECLARATION IS WRONG: package.json's engines floor says `>=22.6` while the engine runs TypeScript unflagged
- THE FIRST CLOUD RUN IS A TEST, not a deployment, and the detach path is the first place to look
- BOTH HOST-SIDE HALVES stay owed under [[raid-debt-cloud-validation-needs-a-machine-this-one-cannot-make]]
- nothing is parked from this state

## anything_else

### What this gate is actually blessing

NOT A WORKING ENTRYPOINT. Nothing has been built.

WHAT IS BLESSED IS THAT THE DESIGN SURVIVED CONTACT WITH MEASUREMENT, and that where it did not, the damage is bounded to two steps with named fixes.

### The finding behind the findings

NONE OF THE THREE SPIKES NEEDED THE HOST IT WAS DRAWN AGAINST.

EACH ASSUMPTION TANGLED TWO QUESTIONS. One local, one about the host. In every case the local half was answerable on this machine, and in two of three it came back false.

THE HOST HALF WAS NEVER THE BLOCKER. It was the reason nobody looked, and rank-unknowns seeded all three as if the host were the whole question.

THAT IS WORTH CARRYING INTO HOW UNKNOWNS ARE PICKED. An assumption whose statement contains an "after" or an "and" is probably two assumptions, and the cheap half is usually the one that falls.

### Why prior art is a finding here rather than a blank

A SPIKE MEASURES OUR MECHANISM AGAINST OUR DEMAND. There is no external product whose process-detach behaviour or version floor is the thing under test.

SAYING THAT IS BETTER THAN NAMING A TOOL for the sake of filling the field. The comparisons this design owes were made at the architecture gate, against Kubernetes leases, vanilla git and devcontainers, and none of them moved.
