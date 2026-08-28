---
form: specify-build
by: agent
signed_off: 2026-08-28T11:00:12.624Z
authors: agent
files: null
---

# Evidence form / specify-build

## current_situation

The checks are written and red. The build has to remove two named reasons: a module that does not exist, and a key list that is not exported.

One design spec covers it. The five sweeps share one shape, so splitting them across specs would file the same design four times.

The chunk order is small and mostly serial, because each sweep is a few dozen lines and the whole build is one file plus two edits.

## design_specs

- dsp-the-corpus-sweeps

## promotions

- none. No expedition spike was promoted into this iteration, and no experiment node names a chunk here.

## follow_up

Build in this order, and the order is the first risk's mitigation rather than a preference.

- Write the module with its four classifiers, and export the widened key list. The ten checks go green.
- Repair each class in the corpus until its count is zero or marked.
- Only then wire each classifier into the corpus sweep, so no arming meets a backlog.

The last step is where the boot could turn red for everybody, and it is deliberately last.

## anything_else

TWO LENSES SHAPED THE ORDER, and the plan says which.

RISK FIRST is the dominant one. The named crippling risk is arming a sweep over a corpus that still carries its backlog, so the arming is the LAST chunk rather than the first, and each class is emptied before its own lint goes live.

SPINE FIRST is the second. The module with all four classifiers and their tests is the thinnest slice that exercises every seam, and it lands before any repair, so the repairs have a checker to measure against.

PARALLEL FLOW DOES NOT APPLY and it is worth saying so. The build is one deep chain: classifiers, then repairs, then arming. Forcing width onto a chain only adds seams.
