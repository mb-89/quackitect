---
form: gate-motivation
bless: blessed by agent
by: agent
signed_off: 2026-08-28T10:40:18.025Z
authors: agent
files:
---

# Evidence form / gate-motivation

## current_situation

M1 is complete. The vision is inherited, the delta is framed on two standing value propositions, three register entries are open, and the scope takes all seven of the seed's item groups.

This gate is the last place the frame is arguable. Past it the vision is axiom.

The question it has to answer is narrow: is repairing the corpus and arming its lints worth an iteration.

## vision_scope_stated

The resident vision is untouched and out of scope here. i44 mints no value proposition and changes no audience or outcome.

What is in scope at vision level is one extension: the ledger's promise of a followable reference becomes mechanically enforced rather than periodically repaired.

## problem_agreed

The problem is agreed and it was demonstrated this morning rather than argued.

One raid entry carried the frontmatter key `probed` twice. Preflight exited 1, the conformance sweep reported the file unparseable, and boot would not complete until the file was fixed.

So corpus rot is not cosmetic in this product. A single bad node stops every session.

The standing backlog is counted, not estimated: 24 files with a doubled Detail heading, re-measured today, and about 46 unresolvable path-shaped references recorded by the overhaul.

## prior_art_positioned

THE COMPARISON, and both sides are named.

WHAT THE OTHER SIDE DOES BETTER, first. markdownlint ships a duplicate-heading rule, MD024 `no-duplicate-heading`, documented at https://github.com/DavidAnson/markdownlint/blob/main/doc/md024.md. remark-validate-links checks that links between markdown files point at something that exists, at https://github.com/remarkjs/remark-validate-links. Both are mature, configurable, widely installed, and neither has to be written or maintained here. Two of this iteration's five lints have an off-the-shelf equivalent.

WHAT THEY SHED. They read markdown as prose. This corpus's references live in TYPED FRONTMATTER KEYS between typed nodes, and a reference is valid only if the target is a standing node OF THE RIGHT KIND. A link checker sees a string, not a kind, so it cannot tell a resolving reference from one pointing at the wrong type.

THE SECOND THING THEY SHED is the refusal. These tools report; boot's exit check refuses. The value here is not the finding, it is that a bad node stops the machine before it reaches trunk.

WHAT THIS COSTS US, stated as a tradeoff rather than a win: five lints to maintain that somebody else would have maintained two of.

NOT MEASURED, and it is worth saying plainly. Neither tool was run against this corpus. The claim that they cannot express a typed reference rests on reading what they document, not on a trial.

## success_measurable

Three pass lines, each a count rather than a judgment.

- The duplicate-heading count reaches zero, from twenty-four re-measured today.
- Every reference key in the corpus resolves, or carries its explicit marker.
- Boot's exit check stays green with every new lint armed.

A FOURTH NUMBER IS OWED by the second risk: repairs against markers, reported as two figures. The overhaul's own split of 35 marked and 11 repaired is the shape to compare against.

## risks_logged

Three entries stand, opened at log-risks.

- Arming the reference sweep turns every boot red, graded crippling and plausible, mitigated by repairing each class before arming its lint.
- The unreachable marker becomes the cheap answer, graded corrosive and plausible, mitigated by reporting repairs and markers as two numbers.
- A signed vision cites a value prop that does not stand, an issue, found while writing this iteration's own vision.

## round_0_verify

- evidence vs claims: Every count in this gate is either re-measured today or cited to the overhaul that measured it. The duplicate-heading count was re-run and returned twenty-four.
- types: Not run. No code exists yet; the machine makes the type check legal at verification.
- lint: Boot's own preflight, smoke test and conformance sweep are green, after this session repaired the duplicate frontmatter key that was refusing them.
- tests: Not run at kickoff or here. The five new lints carry their own tests and are this iteration's acceptance points.

## round_1_validate

- exercised against the goal: The three pass lines map onto the two value propositions the delta serves, and each is a count somebody else could re-run.
- missing: The prose-reference class is not covered by anything this iteration arms. It is named as a non-goal and stands as a register issue.
- wrong: Nothing found wrong in the frame. The one contradiction met so far was in the corpus, and it is repaired.
- out of scope: Seven exclusions are named at scope-non-goals, the largest being the source_refs migration, which belongs to i10.
- prior art: Compared above, with both sides named and the limits of the comparison stated. Two of five lints have mature equivalents; neither was run against this corpus.

## goals_served

- Sweep the duplicate headings and duplicate reference entries out of the corpus.: Serves vp-the-ledger. Twenty-four doubled headings were re-counted today, and the duplicate-heading lint keeps the count at zero.
- Make every id-shaped and path-shaped reference resolve, or carry an explicit marker saying why it cannot.: Serves vp-the-ledger most directly. A reference nobody can follow is a ledger entry that has stopped being one.
- Rewrite stale narration bodies into the past tense, and reconcile rows that contradict newer rulings.: Serves vp-the-ledger. A row that contradicts a newer ruling misroutes the reader who trusts it.
- Land the work-token vocabulary wherever the pool spec still teaches the old noun.: Serves vp-the-ledger. The corpus follows the code here, since pool.ts is the reality.
- Take the dead git verbs out of the use cases and the story that teach them.: Serves vp-rigor-without-toil. A use case teaching a verb that no longer exists costs the next reader a wasted call.
- Settle the test-spec layer's file and path references on the repository root.: Serves vp-the-ledger. A path reference resolving from the wrong base is a dangling reference with a plausible shape.
- Arm the lints that make each of the above impossible to reintroduce.: Serves vp-rigor-without-toil. This is the half that makes the repair hold without another overhaul.

## bound_breaches

- if-agent-harness-to-entrypoint: none breached, and nothing has been measured against it. This gate has never signed before, so its window opens at this session's first call, and the only slow records it holds are mirror page loads that this interface does not cover.

## round_2_red_team

- Steelman: this is churn dressed as engineering => At its strongest the case is that a dangling reference harms nobody until somebody follows one, and that a week spent on headings buys nothing a reader would notice. It fails on a fact from this morning: preflight refuses the whole boot over one malformed node, so the corpus is load-bearing rather than decorative.
- Kill-criterion: the plan's counts no longer describe the corpus => This would be the wrong call if the item lists had gone stale in the eight days since they were written. The one class cheap enough to re-count was re-counted and matched exactly, twenty-four for twenty-four. A later class that has drifted is the signal to re-derive rather than follow.
- The lints could be somebody else's job => markdownlint and remark-validate-links already do two of the five, and maintaining our own versions is a real cost. The answer is the typed reference, which neither expresses. That answer is read off their documentation and not off a trial, which is the weakest link in this gate.
- Arming could stop the machine for everybody => This is the first register entry, graded crippling. The mitigation is an ordering rule rather than a hope, and the ordering is written into the scope.
- The rename could spread a wrong noun => The corpus is being made to follow the code, since pool.ts is named as the reality. If the code chose the wrong noun, this iteration propagates it. Nothing in the plan questions it, and neither does this gate.

## raid_additions

- none

## verdict

pass — The problem is demonstrated rather than asserted, the success lines are counts, the prior art is compared with both sides named and its own limit stated, and the largest risk has an ordering rule rather than a hope behind it. The dissent worth recording is that the prior-art comparison rests on documentation rather than a trial, which is enough to position the work and not enough to prove the two overlapping lints are worth writing.

## follow_up

Walk into M2 and M3: the stories and the requirements, which the machine has already drawn as the next doors.

The repairs-against-markers count is owed at the validation gate, and the prose-reference class needs its own decision before anything claims the sweep is complete.

## anything_else

The gate was blessed by the agent. It weighs tactical and the session dial stands at strategic, so the choice was within the dial rather than the owner's.
