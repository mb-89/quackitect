---
id: wt-a-single-test-file-eats-a-tenth-of-the-whole-suite-and-sets-
type: "[[work-token]]"
statement: |-
  A single test file eats a tenth of the whole suite and sets a floor nothing else can go under.

  THE NUMBERS, from the most recent complete run. Roughly 1,900 cases, none failing, about 316 seconds of work spread over about 112 seconds of clock.

  THE HEAVIEST FILE takes almost 32 seconds by itself. That is a tenth of the total effort, and roughly two and a half times whatever sits second.

  NO SINGLE CASE EXPLAINS IT. Twenty-three cases live there and the worst of them finishes inside three seconds, so the average is well over a second and the weight is spread evenly.

  THAT SETTLES WHICH REMEDY APPLIES. Our own method card says a file is the smallest unit that can occupy a second processor, and that a file dominating the clock is divided before anything subtler is tried inside it. Spread weight is the case division helps.

  THE RUNNER IS ALREADY WORKING IN PARALLEL, since the effort is nearly three times the elapsed time. One heavy file therefore bounds the whole run.

  STILL UNKNOWN: what those twenty-three cases build, and whether some shared setup is being rebuilt for each one.
ready_when: ready when the test suite's wall clock is next worked on
source: note-30585716d23d
---

## Why it stands

A single test file eats a tenth of the whole suite and sets a floor nothing else can go under.

THE NUMBERS, from the most recent complete run. Roughly 1,900 cases, none failing, about 316 seconds of work spread over about 112 seconds of clock.

THE HEAVIEST FILE takes almost 32 seconds by itself. That is a tenth of the total effort, and roughly two and a half times whatever sits second.

NO SINGLE CASE EXPLAINS IT. Twenty-three cases live there and the worst of them finishes inside three seconds, so the average is well over a second and the weight is spread evenly.

THAT SETTLES WHICH REMEDY APPLIES. Our own method card says a file is the smallest unit that can occupy a second processor, and that a file dominating the clock is divided before anything subtler is tried inside it. Spread weight is the case division helps.

THE RUNNER IS ALREADY WORKING IN PARALLEL, since the effort is nearly three times the elapsed time. One heavy file therefore bounds the whole run.

STILL UNKNOWN: what those twenty-three cases build, and whether some shared setup is being rebuilt for each one.

## When it comes back

ready when the test suite's wall clock is next worked on
