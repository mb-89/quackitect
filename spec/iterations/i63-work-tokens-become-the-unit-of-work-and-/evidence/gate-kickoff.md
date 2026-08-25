---
form: gate-kickoff
bless: blessed by agent
by: agent
signed_off: 2026-08-25T16:48:07.066Z
checked: Read refusals, Read template-free-form, Read template-per-item, Read template-list, Read template-choice-with-rationale, Read template-findings, Read template-refs
authors: agent, human
files:
---

# Evidence form / gate-kickoff

## current_situation

M0 is walked and this gate is the last position of the milestone. The spawn form and the onboarding retro are signed.

THE SCOPE CHANGED DURING THIS GATE, and that is what the gate is for. The owner walked the machine position by position and ruled on each. Two research files now stand beside the record: the prior art, and the owner's design input.

EVIDENCE QUALITY, and it improved twice. Five researchers ran while the outward verbs were refused by the position gate, so none of them opened a page body. That is fixed and the verbs are legal everywhere now. Twenty primary sources were then read in full, which changed four conclusions and added two mechanisms.

THE OWNER HAS RELEASED THIS GATE. An earlier pass left it unstamped, waiting for the editor drawing. The owner has since said the subject is discussed enough and that this gate may be filled and blessed from here, with every step after it waiting for their word. That is why it stamps now.

NOTE ON THIS FIELD ITSELF: the owner has ruled that the current-situation and follow-up sections are dropped. They are filled here because this form still asks for them, and removing them is this record's own work.

## retro_drained

- inbox: empty, and the drawing confirms it. The onboarding retro walked fifteen notes across two passes. Two were folded into homes that already carry them. Thirteen were authored into work tokens now standing in the pool. Seven of the fifteen came from the owner driving the walk by hand, which is what the session was for.

## goals

- Every piece of work is a work token: one markdown file per item, carrying frontmatter and prose together.
- A position has TWO SLOTS. Incoming holds what must be taken in before it can be worked. Outgoing holds what must be produced before it can be left.
- A method's steps become outgoing tokens, one per marked heading, each carrying its own guidance in the body beneath it and its evidence in subheadings under that.
- Reading requirements become incoming tokens, and only where the evidence is not already proven. Read evidence is global and version-keyed.
- A token has a PLACE and a STATUS, and they are separate. Place is a position or the backlog. Status is open, in work, or one of several terminal kinds.
- A position may be left when every token in it has reached a terminal status or moved elsewhere. Moved is a real exit, not a failure.
- A token may depend on another token, or on a position finishing.
- Outside a record everything is ephemeral. Inside a record a done token IS the evidence, and there is no second act of writing it.
- The pull returns open tokens rather than instructions.
- The four ladders become two. Complexity is a ROUTING key that decides which hand a token is given to. Autonomy is unchanged.
- Every position shows a count per slot, and clicking one opens the token editor.

## pulled_in

- THE OWNER'S DESIGN INPUT at research/design-input-from-the-owner.md. Captured live while the owner walked the machine position by position. IT IS THE SCOPE THIS GATE PRICES, and it ends with a section addressed to whoever picks the work up next.
- THE EDITOR'S SPECIFICATION at design/worktokens.excalidraw.svg. It is a DRAWING and it is deliberately not transcribed. Owner ruling: a drawing of a surface is the specification, and if the drawing changes then the specification changed. It is an Excalidraw SVG, so the same file renders and reopens for editing.
- THE PRIOR ART at research/prior-art-by-sketch-element.md. Twenty primary sources read in full, arranged by which part of the sketch each one judges.
- WHERE THOSE DISAGREE, THE OWNER'S FILE WINS. Prior art is evidence; the rulings are decisions.
- A DRAWN FIELD MUST DECLARE WHETHER IT IS A SNAPSHOT OR A LIVE READING, carried in from a note drained in the onboarding retro. A field drawn from a live source re-opens every time anything is captured, so a long milestone that keeps noticing things can never stamp. This gate's own drain re-opened exactly that way while it was being walked, and so did the retro before it. It is the sharpest evidence for the settled-token design: a token asked once is answered once and then settles.
- Thirteen work tokens minted by this milestone's retro, and the 139 already in the pool. Candidates for scope rather than commitments.
- The engine change that landed mid-milestone: the outward verbs are legal in every position.
- i59's ruling arrives as a constraint. A position carries only what its reader must act on, and this round gives the provenance somewhere else to go.

## left_out

- A SPIKE ON CROSS-PANEL DRAG IS THE FIRST THING TO DO, and it is not left out so much as sequenced first. The owner wants a token dragged from the editor panel onto the state machine panel. Nobody has established that it is buildable in this host. Owner instruction: if it is a big risk, spike it.
- COUNTING A RECORD'S TOKENS. One script over an archived record answers it, and the bubble surface cannot be designed honestly without the number.
- Whether private tokens exist, and therefore whether a note becomes a token. Open, the owner's, and it costs two stores either way.
- Rebuilding how the pool is stored. The prior art argues hard against the present shape and the owner has not ruled.
- Whether the seven surfaces that filter share one mechanism or seven copies. Worth knowing before an eighth is added.
- The archive living only in version history. A note, and possibly already seeded.
- Walking the holding counters downward, and the duplicate-code-path sweep. Both placed in a later round by the owner.

## walkers

0 — the guide alone, which is the default and needs no argument. Three things make it right here rather than merely cheap. The owner is beside the session and is the hand that decides the scope this gate sets. The milestone's work was a conversation about design input, not a walk. And a fresh walker would need this whole session's context to be useful, which is the opposite of what the separation is bought for. Five researchers ran and returned, and they stand outside this count by their own role.

## change_size

major — proposed, and the owner decides. The walkthrough made this MORE clearly major rather than less. It removes a submachine level, since where the machine spawns a submachine it will spawn tokens instead. It changes what the pull returns. It removes two positions from boot outright and collapses the rest to one. It rewrites the retro's card and the overhaul's. It turns every evidence field in every form into a token. It adds a dependency edge, a place, a status vocabulary and a person-needed flag to a node type. And it adds a surface. STRIKES NAMED: nothing struck. A change reaching the engine, the machines, the corpus and the surface at once is what this column is for. THE ONLY ARGUMENT FOR PRODUCT rather than major would be that the pull's contract changes, which is the system's one verb. That is worth the owner's thought and the agent does not make it.

## round_0_verify

- evidence vs claims: checked, and one claim was struck. Every figure here came from the call log or a run. The agent asserted that the kickoff's redistribution would deadlock; the owner showed it does not, because MOVED is already a terminal exit and the agent had recorded that itself earlier in the same file. The claim is struck in place rather than quietly edited.
- types: clean. Nothing was built for this record's goals. The one engine change that rode alongside typechecked on every edit.
- lint: clean, with one real catch. A complexity ceiling fired on a function that had grown a third branch, and the fix was to split the wording out of the decision rather than suppress the rule.
- tests: 663 of 663 green, sweep green, four new cases.

## round_1_validate

- exercised against the goal: yes, and the goal moved. The owner walked every position and the goals above are the result. What this gate can test is whether they are stated well enough for later gates to measure against, and they are.
- missing: the token editor, which the owner is drawing. And a written mapping if complexity is to carry what the reading ladder controlled.
- wrong: nothing now stands wrong. The two things the agent called wrong were both answered. The exit rule is answered by terminal statuses including rejected and skipped, plus MOVED as an exit. The surviving-axis objection is answered differently: complexity here is not a rigor dial at all but a ROUTING key deciding which hand gets the work, and the estimation critique does not reach that.
- out of scope: the storage question. It got stronger on the primaries and the owner has not ruled.
- prior art: COMPARED. GITLAB, PRIMARY, has converged on this record's central idea and shipped it: work items are "a unified way to represent units of work at any level", and in 18.10 they replaced separate issue and epic lists with one. Their status carries a CATEGORY, and Done and Canceled both close — which is the terminal-status idea in production. Their custom fields are capped at ten per type and archived rather than deleted. WHAT THEY DO BETTER: it is shipped. WHAT OURS SHEDS: a per-transition opt-in, because the gate is the machine's own law here. BACKLOG.MD, PRIMARY, is the closest analogue and is dogfooded by agents: markdown file per task, acceptance criteria, and Definition-of-Done defaults that arrive on every new task and can be declined. Their sizing rule is "one task = one context window = one PR". CREWAI, PRIMARY: description and expected output are both REQUIRED on a task, and a guardrail actually tests the output and sends failures back, bounded by a retry count. That is what turns an evidence field into a check. BEADS, PRIMARY, and this CORRECTS an earlier report: it now runs on a version-controlled SQL database with cell-level merge, not one JSONL file, and it tells agents not to use markdown lists. WHAT THEY DO BETTER: mechanical merge. WHAT OURS SHEDS: needing a tool to read your own work. DAGSTER and ARGO, PRIMARY: readiness is a composable condition, testable in isolation, and Argo's keys on a predecessor's OUTCOME rather than its completion — a distinction that matters here, given three terminal exits. TEMPORAL and AIRFLOW, PRIMARY: every wait carries a clock, and the framing worth stealing is Temporal's — a heartbeat is not about time, it is about how you know progress is being made.

## bound_breaches

- if-agent-harness-to-entrypoint: none recorded, and that is unobserved rather than clean. Nothing this milestone exercised it under measurement. The milestone's own timing work is separate and sits in a token: opening a checking session costs 536 milliseconds alone and 4013 under forty-two-way parallelism.

## round_2_red_team

- STEELMAN => A token a person can open and edit beats mechanical mergeability here, because the readers are the committers and one engine walks one record. The exit rule is a COMPLETENESS mechanism and completeness is what a governed process sells. GitLab's convergence on one unit at every level is production evidence for the core idea, and Backlog.md is the same shape dogfooded by agents.
- THE KILL-CRITERION, DEFUSED => The wrong call if a position froze on one unfinishable token. It cannot: the token can be cancelled, skipped, rejected, or MOVED. Three of those four are new since the seed and each releases the position.
- THE BATCH ATTACK, WITHDRAWN => It assumed a position recurs. Positions are never reused, so there is no later batch to delay.
- CROSS-PANEL DRAG IS THE LARGEST UNKNOWN => The owner wants a drag that begins in the editor panel and ends on the state machine panel, and that reveals hidden buckets on the receiving panel while it is in flight. None of that was researched, by instruction. Nothing in the tree drags between containers at all: three editors carry pointer machinery and all of it resizes or picks within one grid. A spike answers it and should run first.
- THE TOKEN COUNT IS UNMEASURED => This gate alone became fourteen tokens. A record has many positions with several fields each and nobody has counted. A bubble showing three digits is a different surface from one showing one.
- THE STORAGE, STILL STANDING => Five systems converged on a log with derived state. Two mature projects rejected or abandoned files-in-tree and published why. The closest agent-built analogue moved to a database. Not a majority to outvote lightly, and unruled.
- PRIVATE TOKENS, STILL STANDING => Private and committed are incompatible, so it costs two stores whichever way it goes.
- WHAT SURVIVES => The unit, with production evidence. The four buckets. Method headings as tokens, which fixes a measured failure where an overhaul agent skipped its own steps. Place separate from status. Terminal as a category with members. The dependency edge, which may point at a token or at a position. And complexity as a routing key, a purpose the survey does not cover because human teams never had it.

## raid_additions

- none

## verdict

pass with overrides — RULED. The owner released this gate rather than blessing it themselves, having said the design is discussed enough. THE OVERRIDES, all the owner's own rulings rather than the agent's objections. ONE: a position is left when every token reaches a terminal status OR moves, and terminal has several members. TWO: complexity is a routing key deciding which hand takes the work, not an estimate. THREE: priority is a flag. FOUR: place and status are separate, and nobody holds a token. FIVE: done is a filter over status, not a place, so nothing is ever dragged into it. SIX: the two dropped form sections go. SEQUENCING, AND IT IS THE ONE SCHEDULING CALL THIS GATE MAKES: spike the cross-panel drag before anything is designed against it, and count a real record's tokens before the surface is. STILL THE OWNER'S AND CARRIED FORWARD UNANSWERED: whether private tokens exist, and whether an assigned bucket gates its state. THE DISSENT, recorded rather than resolved: the storage shape is the one five systems moved away from, and the counter-argument is real but must be argued out loud rather than assumed.

## follow_up

THE TOKEN EDITOR IS NEXT and the owner is drawing it. This form reopens when it lands.

THREE ASSUMPTIONS ARE OWED TO THE REGISTER and are deliberately not logged yet. Logging an assumption against a scope that is still moving would file an entry about the wrong thing. They are: that a record's token count stays legible on a surface; that a hand-editable file per token is worth more here than mechanical merge behaviour; and that one complexity axis carries what the reading ladder and the five-name rung controlled between them. Each becomes an entry once the editor lands and the scope stops moving.

ONE THING TO COUNT BEFORE THE SURFACE IS DESIGNED. Take an archived record, count the evidence fields across all its positions, and that is roughly its token count. Nobody has that number and the bubble design depends on it.

THE VERDICT AND THE BLESS ARE THE OWNER'S.

NOTE ON THIS FIELD: the owner has struck the follow-up section. It is filled because this form still asks for it.

## anything_else

WHERE A NEXT AGENT SHOULD START. Read research/design-input-from-the-owner.md whole. Its last section is written for you and names the five things most likely to be got wrong, what is still open and who owns each one, and the three uncosted risks.

THE SHORTEST TRUE STATEMENT OF THE DESIGN. A work token is one markdown file with a PLACE and a STATUS, and they are separate. Its place is a bucket. Four kinds sit on a state: input and output block, done is a filter over status rather than a place, and pending holds work that does not block. A user's own bucket is born holding what was dropped on it and gone when emptied. Status is open, in work, or one of several terminal kinds including rejected and skipped. A state may be left when every token in its input and output buckets is terminal or has moved.

TOKENS COME FROM THREE PLACES. Reading requirements become input tokens, only where the evidence is not already proven. A method's marked headings become output tokens, which is the fix for an overhaul agent that skipped its own steps. Today's evidence fields become output tokens, one per field.

THE SURFACE. Bubbles on a position carrying counts, a zero bubble hidden, input furthest left, output furthest right, done at the bottom. A state machine's pill reads x plus y, its own beside its children's, and you reach the children by opening the machine rather than by clicking the number. Clicking a bubble opens the editor on that bucket.

THE EDITOR IS A DATABASE VIEW AND MOST OF ITS CELLS EXIST. deliverable/engine/editors/node-table.ts is already rows-are-nodes and columns-are-frontmatter, writes straight through with no second copy, resizes columns by dragging their edge, offers a constrained column's source, and keeps a value that is no longer offered rather than blanking it. OWNER RULING: widen that rather than write a second one, because if somebody understands one editor they should understand them all.

WHAT IS GENUINELY NEW: grouping rows into collapsible buckets, two panes, dragging between them, dragging out onto the machine, and a plus that mints from a template.
