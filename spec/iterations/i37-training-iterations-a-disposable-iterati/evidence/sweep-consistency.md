---
form: sweep-consistency
by: agent
signed_off: 2026-08-20T13:17:15.866Z
authors: agent
files: null
---

# Evidence form / sweep-consistency

## current_situation

sweep-consistency, walked rather than ticked.

WHAT THIS ITERATION CHANGED, from the evidence trail: one lane verb, one item template, one new field on every call record, one refusal that did not exist, four call sites that now ask a question they did not, and three new engine modules.

EACH CLASS WAS SEARCHED for text teaching the old behaviour, and the searches are named below rather than summarised as done.

## swept

- [x] command and tool docs
- [x] engine-served strings
- [x] method cards
- [x] matrix rows
- [x] templates and skeletons
- [x] guidance chapters
- [x] book chapters
- [x] README and entry documents
- [x] panels and form help

## follow_up

- gate-validation is next and it closes M8.
- IT SHOULD RECORD THAT gate-implementation's FIRST OVERRIDE NO LONGER STANDS. req-the-benchmark-history-is-unreadable-while-a-run-is-bound is met, its cases are green, and both demos watched the doors close.
- THE SECOND OVERRIDE STILL STANDS AND IS NARROWER THAN IT WAS. No lane verb consults `resolvesInBoundTree`, so the git ceiling holds structurally inside the rewound tree and nothing enforces it at a verb. The concealment work made this cheaper: `isBound` now has four consumers and the choke points are known.
- ONE SURFACE IS DELIBERATELY UNCHANGED AND IT IS NOT RESIDUE. `guidance/method/lane.md` carries a table of NATIVE TOOLS AND THEIR REPLACEMENTS. `se_benchmark` replaces no native tool, so adding it there would teach the table's shape wrongly to buy one mention.
- THE POOL FINDING NEEDS A SURFACE IT DOES NOT HAVE. Ten of sixteen shipped iterations cannot be benchmarked, and nothing outside the register says so. If this ships, `se_benchmark`'s own description is where a caller would learn it.

## anything_else

WHAT WAS SEARCHED, so a reader can check the sweep rather than trust it.

- COMMAND AND TOOL DOCS. `se_benchmark` carries its own description, which states the cycling rule, the bind-or-refuse law, and the limit that it measures process overhead under observation and never quality. `lane.md`'s table is native-replacements only and correctly does not list it.
- ENGINE-SERVED STRINGS. Two are new and both were written with the change: the concealment refusal names `se_benchmark {stop: true}` as its remedy, and the bind refusals name which condition is unset rather than always naming the env vars. Grepped the engine for the changed vocabulary.
- METHOD CARDS. `meth-benchmarking` is about observing what COMPETITORS shipped — a design method for enumerate-space, a different subject that shares a word. Nothing in it teaches anything this iteration changed.
- MATRIX ROWS. No row changed. The benchmark run is not a walk state.
- TEMPLATES AND SKELETONS. `machines/items/benchmark-run.md` is new, and its skeleton carries `stamp_covers`, both stop fields, and the NOT BUILT YET marker on the forbidden request.
- GUIDANCE CHAPTERS. Searched for text claiming the reports folder is readable or that cost per state cannot be derived. Nothing.
- BOOK CHAPTERS AND README. No mention of benchmarks or training iterations in either, so nothing teaches the old behaviour.
- PANELS AND FORM HELP. `mirror.ts` and `panel.ts` carry no benchmark vocabulary.

NO RESIDUE IS BEING LEFT SILENTLY. The one class where I expected residue was the design brief `project/spec/training-iterations.md`, because the shipped design dropped three things the original brief specified — an authored scenario pool, a sandbox package, and separate `t<n>` ids. It was already rewritten during the walk and now says why each was struck. That is the one surface that would have taught a reader a design nobody built.
