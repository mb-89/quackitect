---
form: satellite-start
by: agent
signed_off: 2026-08-14T14:00:43.657Z
authors: agent
files: null
---

# Evidence form / satellite-start

## current_situation

THE BOARD'S START FIGURE WAS THE FLOOR, NOT THE START. A satellite start with the engine module load included is 306.9 ms median. Every figure recorded so far was 36 ms warm and 67 ms cold, with the load named as excluded.

Seven runs of each, on this machine, Node v24.16.0.

- Bare Node process: 36.4 min, 40.0 median, 67.5 max.
- Walk kernel loaded: 213.4 min, 223.0 median, 258.7 max.
- Verb surface loaded: 288.9 min, 306.9 median, 387.7 max.

The bare column reproduces the board's 36 and 67 exactly, which is what makes the comparison sound. The engine load alone is 267 ms.

IT FITS THE BUDGET AND SPENDS A THIRD OF IT. One second is allowed and a start takes 307 ms.

## built

- exp-satellite-start

## follow_up

THE MEASUREMENT TURNS A PREFERENCE INTO A CONSTRAINT. el-satellite-supervisor already says a satellite starts when a record OPENS. At 307 ms that is now the only affordable shape, not the tidier one.

WHAT A SATELLITE IS NARROWS. A process is fine per record and ruled out per call. The choice between a process, a worker thread and an isolate matters only if starts turn out to be frequent, and under this design they are not - one per record open, plus one per engine delta change.

THE REPLACE ACT NOW HAS A PRICE. An engine delta change costs a 307 ms restart plus the levelling. That is the cost of the seamless swap, and it is worth writing on el-satellite-supervisor at specify-build.

WHAT THE PROBE DID NOT DO. The process imported the engine and stopped. It did not level a tree, rebase a delta or open a channel. The real start is this number PLUS that work, and the levelling is the part most likely to dominate.

## anything_else

WHAT IT SAYS ABOUT THE PARALLELISM CASE, as arithmetic rather than as a profile.

Twenty-seven records opening one after another cost 8.3 seconds of start. The same twenty-seven starting at once cost 307 ms of wall clock, if the cores are real.

That is raid-asm-the-target-machine-is-many-throttled-cores stated on a measured number. It is still not a profile of where the time goes in normal work, and it does not become one.

WHY tools.ts AND NOT SOMETHING SMALLER. It pulls the widest graph in the engine and a satellite needs the verb surface before it can serve anything. The walk kernel alone is 223 ms, so the honest range for a satellite start is 223 to 307 ms depending on how much it loads eagerly. Loading less is a real lever the build has.
