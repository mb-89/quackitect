<!-- GENERATED. Edit the source named below, not this file. Source: doc/guidance/behaviour.md, doc/guidance/driving-the-engine.md, doc/guidance/voice.md, doc/guidance/work-token.md -->

# Behaviour

## Actionables

1. Follow the process you are in. Take the step in hand rather than arguing with it. *
2. Disagree and commit. Write the concern down where it is triaged, and continue. *
3. Spend your thinking where a mistake is dear to undo. Where it is cheap, decide and move. *
4. Compared two things thrice and still cannot pick? Either will do, or the answer is a third thing. *
5. Invert the question. Ask what would make this fail, what would have to be true, and who has this problem already. *
6. Reproduce the defect before you fix it. A fix without a reproduction is a guess with a commit. *
7. Bisect. Halve what could be wrong, test one half, keep the half that fails. *
8. Name every assumption and the cheapest experiment that decides it. Run the experiment before the argument. *
9. Do not kill yourself because you are afraid of dying. Build against a failure seen, not one feared. *
10. Mark an estimate as an estimate. Say "I do not know" when you do not know.
11. Read a file before you change it. Change one thing at a time, and leave every other file as it was.
12. Stage the paths you edited, by name. Never stage everything. *
13. Private data: names, datetimes and unfiltered notes. They do not go into git.

# Driving the engine

## Actionables

1. On errors, the engine provides remedies. Incorporate them in your way of working.
2. Answer prompts before anything else with `se --answer "..."`. Copy the prompt verbatim. *
3. Stop only with a reason named to the engine. On an interrupt, claim `asked`. *
4. Use the tool the engine gives you. *
5. Change files with `se_apply`, naming the token on every write. *
6. Run every shell command with `se_run`, naming the token. It could write. *
7. A helper script goes in `.se/scratchpad/`. A standing check goes in `util/checks/`. *
8. Search the tree through the index: `se_find` for words, a regex or a path glob, `se_ask` for SQL. *
9. Test through the engine: `se_test` runs what your delta reaches. A test you name runs, a pattern narrows. *
10. Break work into sub-tokens with `se_work`, naming the parent. Your own todo list is refused. *
11. Replace the engine with `se --swap`. A build aimed at `.bin` is refused. *

# Voice

## Actionables

1. One sentence, one idea. At most 25 words, preferably shorter. End lines on sentence ends. Avoid endlines within sentences.
2. One paragraph, one idea. At most 6 sentences. One newline between paragraphs.
3. Three or more parallel things are a list, each with its status, in a chat answer as in a file. *
4. BLUF: bottom line upfront, progressive disclosure: details come later, at the discretion of the reader.
5. Active voice. Name who acts. Present tense for everything except discussions. Past tense is allowed there.
6. Stakeholder-specific communication: do not leak internals, write what is relevant to the audience. For details, see [[doc/guidance/stakeholders]].
7. Use the same word for the same thing every time. For details, see [[doc/glossary]].
8. In general, with few exceptions: say what is. Do not say what is not, the list is endless. *
9. State a fact only if you own it. Otherwise name where it lives, via "For details, see [[link]]". *
10. Follow the technical English rules. For details, see [[doc/guidance/ASD-STE-100]].
11. DRY: do not repeat yourself. SPOT: single point of truth for every datum. A repetition in a spec, finding or answer is a defect. *
12. Do not put history in the current surface. It goes into git commit messages.
13. A number something else answers is never written down. The tree's count is the command that answers it. A list's count is the list. *
14. A compression against a cap lists what it cut in the evidence, each sentence surviving elsewhere or cut on purpose. *

# Work token

## Actionables

### Writing one

1. Write the problem in detail and the answer in proposed action, reduced to the smallest case that still shows it. The detail answers what is gained by doing it, and what breaks if it is never done. *
2. Write acceptance criteria first. A criterion is decidable, names the input, the answer and what survives, and is not a plan. *
3. Where a command decides a criterion, write the command and run it from the root before submitting. Otherwise name who looks at what. A criterion naming a go test names it through se test and reads unreached, because go test -run over a missing name answers ok. *
4. Match on what the check holds at run time: a whole identifier written once into both halves, or a length as a number. *
5. Number what the detail says the change does and put a criterion against each. Work that moves off takes its criteria with it. *
6. A detail names the constraint, never the assignment. A criterion answering with a verb states the effect as field and value.
7. Ask whether a criterion is about this change or about the project. Pin a one-time one. A standing one belongs in a check.
8. One token, one piece of work. One command decides one sentence. A done-when needing "and" is usually two tokens.
9. Before a feature, name the basics it stands on. Mint the missing one first. *
10. A small fix is a trivial token. A note needs a decision first. Everything else is tracked or local, and tracked names no local. *

### Using one

11. Do what the token asks and nothing next to it. If the ask is ambiguous, ask one question and wait. *
12. Write each criterion's check first and watch it redden on an assertion, never on a build failure. One that cannot redden is the finding. *
13. Put both halves of a mechanism in the evidence. Where the system mirrors halves, table them and drive the rule through each. *
14. Report work as done only with the evidence that it is. An observation names the check and what it said. *
15. A checklist carries institutional knowledge. Answer each line rather than ticking it. *
