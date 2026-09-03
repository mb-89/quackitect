# Use cases — v4

**Status: first draft, for cutting.** These are tests of the design, not new design. Every
step below must be answerable from the level documents. Where a step has no answer, the
design has a hole and the use case says so.

| | |
|---|---|
| Date | 2026-08-30 |
| Scope | v4, all levels |
| Depends on | Level 0, Level 1, Level 2, Level 3, cross-cutting |

**How to read one.** Each case gives a trigger, the walk, and three verdict fields.
**Proves** names what passes if the walk completes. **Fails if** names the design entry that
is wrong if the walk cannot complete. **By hand** names how a person runs the same walk with
no LLM, with the extension available.

A use case that cannot fill **Fails if** is not a test. It is a story. Cut it.

---

## Index

| # | Case | Levels | First build |
|---|---|---|---|
| 0 | One script installs everything | 0 | yes |
| 1 | Cold start in an empty folder | 0 | yes |
| 29 | Idle to ready, with Claude | 0 | yes |
| 30 | Idle to ready, with Copilot | 0 | yes |
| 31 | An original changes, and its projection follows | 0 | yes |
| 32 | A document that breaks a voice rule | 0 | yes |
| 33 | A session measured for voice | 0 | yes |
| 34 | Every call is in the log | 0 | yes |
| 35 | Level 0 alone, with no authority | 0 | yes |
| 36 | Read a growing log while reading a detail | 0 | yes |
| 37 | Filter down to one call | 0 | yes |
| 2 | Two engines on one machine | 0 | yes |
| 3 | A write to a projection | 0 | yes |
| 4 | A shell command | 0 | yes |
| 5 | Emergency mode | 0 | yes |
| 6 | The engine dies mid-session | 0 | yes |
| 7 | Compaction, and a config change | 0 | yes |
| 8 | A stop with work still open | 0+1 | no |
| 9 | An ad hoc token | 1 | no |
| 10 | A token that becomes two | 1 | no |
| 11 | A token assigned to the human | 1 | no |
| 12 | The reviewer refuses | 1 | no |
| 13 | A nested walker | 1 | no |
| 14 | The first walk to the first gate | 2 | no |
| 15 | Approvers at a gate | 2 | no |
| 16 | Amend a cleared state | 2 | no |
| 17 | Reopen a cleared state | 2 | no |
| 18 | Escape from a nested machine | 2 | no |
| 19 | Close a machine | 2 | no |
| 20 | A factory builds a machine | 3 | no |
| 21 | Delta review of iteration two | 3 | no |
| 22 | Drive a foreign folder | 3 | no |
| 23 | A claim and its chain | cross | no |
| 24 | Guidance found for a state | cross | no |
| 25 | A confidential source | cross | no |
| 26 | A source changes upstream | cross | no |
| 27 | A coverage question | cross | no |
| 28 | Two people, one repository | cross | no |

**Numbers are identities, not order.** The index gives the order. A case keeps its number
for life, so a new case is appended rather than inserted.

**First build** marks the set that Level 0 alone must pass. Cases 0 to 7 and 29 to 37 are
the acceptance set for the first branch. UC-0 comes before all of them, because nothing else can run until
it passes. Nothing above Level 0 may be needed to run them.

---

## A. Level 0

### UC-0 — One script installs everything

**Story.** As a user, I want to install the whole system by running one script.

This case has four walks. All four must pass.

**Walk A — Windows desktop, from a clone.**

1. The user clones the repository. The user runs the script.
2. The script detects Windows and the desktop profile.
3. The script reads the manifest and checks each dependency.
4. Missing dependencies are installed through `winget`. Present ones are left alone.
5. The editor is installed if it is absent.
6. The method root is put in place and registered.
7. The extension is installed. The editor opens on an empty folder.
8. The extension is idle. The welcome page is shown.

**Walk B — Windows desktop, from a folder with no git.**

1. The user is handed the folder. There is no clone and no git.
2. The script runs from inside the folder.
3. Git is a dependency like any other. It is installed.
4. Everything else is the same as Walk A.

**Walk C — cloud Linux, agent-driven.**

1. The agent has the repository and nothing else.
2. The script detects Linux and the headless profile.
3. The editor is not in the headless manifest. It is not installed.
4. The package manager is detected. If none is found, static binaries go to a user prefix.
5. No step needs root. No step asks a question.
6. The method root is registered. The engine can be attached.
7. The agent starts work without reading any documentation.

**Walk D — the second run.**

1. The user runs the script again.
2. Every dependency is present. Nothing is installed.
3. The register entry already exists. It is not duplicated.
4. The script reports that the machine is ready.
5. Nothing on the machine changed.

| | |
|---|---|
| Proves | One entry point, two profiles, idempotence, and the plain-folder case |
| Fails if | Any walk needs a manual step, a question, or a second document to read |
| By hand | Read the manifest and do what it says. This is the definition of the manifest. |

**Note.** Walk C is the harder one. It has no user to answer a prompt and no root to fall
back on. Design the script for Walk C and the other three follow.

### UC-1 — Cold start in an empty folder

**Trigger.** A person opens an empty folder in the editor. The extension loads.

1. The extension starts idle. It does not act.
2. The extension checks whether the stub is installed. If not, it installs it.
3. The extension reads the register and lists the engines it finds.
4. An entry in the register that does not resolve is skipped. No error, no crash.
5. The person picks an engine, or one engine exists and is picked for them.
6. The engine attaches. The work root is the opened folder. The method root is the engine.
7. The state is the start state. The read cache is empty.

| | |
|---|---|
| Proves | Two roots, the register, idle by default, and the floor at rest |
| Fails if | The register cannot be read without a fixed path, or an empty folder cannot be driven |
| By hand | Run the stub from a terminal. Read the register file. Print the resolved roots. |

### UC-2 — Two engines on one machine

**Trigger.** Two copies of the method are cloned. Both register themselves.

1. Each copy registers where it is cloned, under its own identity.
2. The person opens a folder. The extension finds both.
3. The extension asks which one to attach.
4. The choice is written where the UI can read it back.
5. A second window on the same folder reads the same answer.

| | |
|---|---|
| Proves | The register holds more than one entry, and choice is recorded, not inferred |
| Fails if | The design assumes one engine per machine |
| By hand | Two clones, one folder, the choice made at the terminal |

### UC-3 — A write to a projection

**Trigger.** The agent tries to write a file that is a projection of an original.

1. The interception fires before the write.
2. The guard refuses. There is no override.
3. The answer names the original to write instead.
4. The reason reads as a fact, not as a policy.
5. The record names which rule decided.
6. The agent writes the original and continues. It is not stopped.
7. The same agent writes a file on the desktop, outside the roots. Nothing intervenes.

| | |
|---|---|
| Proves | The one hard refusal, the named alternative, and that outside the roots is free |
| Fails if | A denial cannot name its rule, or an ordinary write outside is guarded |
| By hand | Call the guard with both paths and read the two answers |

### UC-4 — A shell command

**Trigger.** The agent wants to run a script.

1. The agent gives a reason for the command.
2. The command runs. Writes through the shell are not guarded.
3. Everything is logged, with the writer identified.
4. Nothing blocks on the log.
5. The log is read later, in the retro, to decide whether a rule should change.

| | |
|---|---|
| Proves | The accepted hole is deliberate, and the log is the compensation |
| Fails if | The log does not identify the writer, or the reason is not captured |
| By hand | Run the command through the same entry point and read the log line |

### UC-5 — Emergency mode

**Trigger.** Something is broken and repair needs powers the floor lacks.

1. The owner arms emergency mode. Only the owner may.
2. The floor widens. The arming is recorded, with who and when.
3. Work proceeds with the wider floor.
4. The mode is disarmed, by the owner or by the session ending.
5. The record shows every action taken while armed.

| | |
|---|---|
| Proves | The floor is a value, not a constant, and arming is an authority question |
| Fails if | The floor is compiled in, or arming is not attributable |
| By hand | Arm from the terminal, act, disarm, read the record |

### UC-6 — The engine dies mid-session

**Trigger.** The engine stops answering while the agent works.

1. The heartbeat stops.
2. The next interception cannot reach the engine.
3. The guard refuses, because a guard that cannot tell must refuse.
4. The person is told, in the UI, that the engine is not answering.
5. The agent is not left guessing and does not proceed silently.

| | |
|---|---|
| Proves | Liveness, fail-closed, and that the failure reaches a human |
| Fails if | A dead engine looks the same as a permitting engine |
| By hand | Kill the engine, attempt a guarded action, read what is displayed |

### UC-7 — Compaction, and a config change

**Trigger.** The context is compacted. Later, a configuration file changes on disk.

1. The agent gets a warning before compaction.
2. After compaction the read evidence is reset. What was read is no longer claimed as read.
3. The agent must read again before it may act on those files.
4. A configuration file changes. The read evidence for that file is reset the same way.
5. No other evidence is touched.

| | |
|---|---|
| Proves | Read evidence is a real set with real invalidation, not a flag |
| Fails if | Evidence survives compaction, or invalidation is all or nothing |
| By hand | Trigger the reset, then ask the engine what counts as read |

### UC-8 — A stop with work still open

**Trigger.** The agent tries to stop. Work assigned to it is still open.

1. The stop is refused. The answer names what is open.
2. The agent works, or declares itself blocked.
3. A blocked agent asks to stop a second time.
4. The second ask is granted. The block is recorded.
5. The stop-at control decides whether a bless is also needed.

| | |
|---|---|
| Proves | The stop rule is not purely mechanical, and one retry is the escape |
| Fails if | An agent can be trapped, or can stop with obligations open |
| By hand | Open a token, ask to stop, read both answers |

---

## B. Level 1

### UC-9 — An ad hoc token

**Trigger.** The agent notices work while doing other work.

1. The agent creates an ephemeral token. Form, guidance, scope, assignee.
2. The token is assigned to the agent itself.
3. The agent works and attaches evidence.
4. The token is closed by the creator's reviewer, because that is the default.
5. The disposition is **done**.

| | |
|---|---|
| Proves | Ephemeral tokens, the default closer, and the evidence field |
| Fails if | Creating work needs the engine, or an agent can close its own token by default |
| By hand | Write the token, attach evidence, close it as the reviewer |

### UC-10 — A token that becomes two

**Trigger.** The work turns out to be two pieces of work.

1. The agent splits the token into two sub-tokens.
2. The parent takes the disposition **became**, and names its children.
3. The children carry the parent scope.
4. Closing both children satisfies the parent.
5. The chain from parent to children stays readable.

| | |
|---|---|
| Proves | Sub-tokens and the **became** disposition |
| Fails if | Splitting loses the parent, or a parent can close while children are open |
| By hand | Edit the tokens and read the chain back |

### UC-11 — A token assigned to the human

**Trigger.** A decision needs the person. The rest of the work does not.

1. The token is created and assigned to the human.
2. Work continues everywhere the token is not needed.
3. The token is placed on a state. That state cannot be left.
4. The person answers. The token closes.
5. The state can now be left.

| | |
|---|---|
| Proves | Blocking is positional, not intrinsic, and humans are assignees |
| Fails if | An open human token stops all work, or the token must know it is blocking |
| By hand | This is the hand case already. The person is the assignee. |

### UC-12 — The reviewer refuses

**Trigger.** The evidence does not support the claim on a token.

1. The walker submits the token to its reviewer.
2. The reviewer reads the evidence and refuses.
3. The refusal names what is missing.
4. The token stays open, with the refusal attached.
5. The walker works again and submits again.

| | |
|---|---|
| Proves | One reviewer per walker, and refusal as an ordinary outcome |
| Fails if | Refusal has no place to live, or a refusal closes the token |
| By hand | Read the evidence, write the refusal, re-submit |

### UC-13 — A nested walker

**Trigger.** A state needs its own machine.

1. The outer walker starts an inner walker on the sub-machine.
2. The inner walker cannot move the outer machine.
3. The inner walker uses its own reviewer.
4. Questions travel up the chain of walkers.
5. Above all walkers is the person.

| | |
|---|---|
| Proves | Nesting, the movement restriction, and the single human door |
| Fails if | An inner walker can move an outer machine, or a question has no route up |
| By hand | Two machines, one person, the same routes |

---

## C. Level 2

### UC-14 — The first walk to the first gate

**Trigger.** A machine is started.

1. The position is at the start state.
2. Entry conditions for the next state are read as tokens.
3. Open tokens block. Cleared tokens do not.
4. The position moves, as a baton handed over, never taken.
5. The walk arrives at the gate state.

| | |
|---|---|
| Proves | Conditions expressed as tokens, and the baton |
| Fails if | Position can be acquired, or a condition is not a token |
| By hand | Move the baton by editing the position and read what the engine says |

### UC-15 — Approvers at a gate

**Trigger.** The walk reaches a quality gate.

1. Approvers are spawned for this gate.
2. Each reads all evidence up to the gate.
3. Each answers. The answers are recorded.
4. The approvers go away.
5. The gate opens or does not.

| | |
|---|---|
| Proves | Approvers are per gate and short-lived, and the gate reads the whole span |
| Fails if | Approver state must persist, or a gate reads only the last state |
| By hand | Read the same span and record the same answers |

### UC-16 — Amend a cleared state

**Trigger.** A small correction is needed in a state already cleared.

1. The walker walks back into the cleared state.
2. The change is made as an amendment.
3. Nothing downstream reopens.
4. The amendment is recorded, with its reason.
5. The walker returns to the position it left.

| | |
|---|---|
| Proves | Walk back anywhere, and amend as distinct from reopen |
| Fails if | Every backward step reopens, or an amendment cannot be told from a reopen |
| By hand | Edit, mark it as an amendment, walk forward |

### UC-17 — Reopen a cleared state

**Trigger.** A decision in a cleared state is wrong.

1. The walker reopens the state.
2. Everything that depends on it is suspected, by the propagating connection types.
3. The suspected set is shown before anything is done.
4. Work re-clears the set.
5. The record shows the reopen and its cone.

| | |
|---|---|
| Proves | The reopen cone is a graph filter, and suspicion is bounded |
| Fails if | Reopen suspects everything, which is the v3 failure |
| By hand | Ask for the cone and read the list |

### UC-18 — Escape from a nested machine

**Trigger.** The inner machine cannot finish.

1. The inner walker escapes.
2. The escape unwinds exactly one level.
3. The outer walker receives the position and the reason.
4. The outer machine decides what to do next.
5. Nothing above the outer level is affected.

| | |
|---|---|
| Proves | Escape is one level, not a global abort |
| Fails if | Escape unwinds to the top, or the reason is lost |
| By hand | Record the escape and hand the baton up |

### UC-19 — Close a machine

**Trigger.** The last state is cleared.

1. The engine closes the machine.
2. The engine pushes a tag. One tag per closed machine.
3. A record is written, with its own number.
4. The record goes to the archive, which is a list.
5. The archive lives in the version history, not as a folder on disk.

| | |
|---|---|
| Proves | The archive is history, and numbering is per record |
| Fails if | The archive needs a directory, or a tag needs a human to push it |
| By hand | Close, tag, write the record |

---

## D. Level 3

### UC-20 — A factory builds a machine

**Trigger.** A new piece of work needs a machine of a known kind.

1. A token is created and assigned to the engine.
2. The factory runs. It is deterministic.
3. The factory writes the machine as a diagram source.
4. The states are written as documents.
5. The token closes with the machine as evidence.

| | |
|---|---|
| Proves | Factories are mechanical work under the same token rules |
| Fails if | Generation needs a model, or the output is not the same for the same input |
| By hand | Run the factory from the terminal |

### UC-21 — Delta review of iteration two

**Trigger.** The second iteration of the same machine is walked.

1. The walk reaches a state that was cleared in iteration one.
2. What changed since then is computed.
3. The review reads the delta, not the whole state.
4. The unchanged part keeps its earlier evidence.
5. The record says which iteration cleared what.

| | |
|---|---|
| Proves | Iterations are addressable, and evidence survives across them |
| Fails if | Every iteration re-reviews everything, which is the cost that killed v3 |
| By hand | Ask for the delta and read it |

### UC-22 — Drive a foreign folder

**Trigger.** A person opens a project that has never seen this system.

1. The folder is the work root. It holds work, not machinery.
2. The method root is the engine, elsewhere.
3. The project records which copy drives it, in a way that survives moves.
4. The copy cannot reach back into the tree it came from.
5. Confidential material stays in the project's private area.

| | |
|---|---|
| Proves | The whole purpose. Two roots, no fork, no reach-back |
| Fails if | The project must be a fork, or the link breaks on a rename |
| By hand | Open the folder, attach the engine, read what is written where |

---

## E. Cross-cutting

### UC-23 — A claim and its chain

**Trigger.** A document states something that is not obvious.

1. The claim carries a reference.
2. The reference resolves to a claim record.
3. The record gives the source, the status, and what would invalidate it.
4. The chain is walked to ground truth.
5. A chain that does not terminate is marked as undeveloped, not as proven.

| | |
|---|---|
| Proves | Claims are enforceable, and an open chain is visible |
| Fails if | A claim can be made with no record, or a chain can loop |
| By hand | Follow the references and read the records |

### UC-24 — Guidance found for a state

**Trigger.** A walker enters a state and needs to know what applies.

1. The state declares the tags it looks for.
2. Guidance declares the kinds of state it applies to.
3. The engine computes the union. The model does not search.
4. The result is bound to the state for this walk.
5. Nothing not in the union is loaded.

| | |
|---|---|
| Proves | Binding is two-way and mechanical |
| Fails if | The model must find its own guidance, or the index must hold every document |
| By hand | Ask the engine what applies here and read the list |

### UC-25 — A confidential source

**Trigger.** Research uses material that may not leave the project.

1. The original is stored in the private area.
2. A digest is written into the knowledge base.
3. The door between them filters. A person or a model judges what passes.
4. The ledger holds the filtered form only.
5. The digest points back to the original, which stays where it is.

| | |
|---|---|
| Proves | Two sides, one filtered door |
| Fails if | Confidential text reaches the shared side, or the digest cannot cite its source |
| By hand | Read both sides and check the door |

### UC-26 — A source changes upstream

**Trigger.** A linked external repository is updated.

1. The staleness handle for the digest is checked.
2. The handle fires, because the hash no longer matches.
3. The digest is marked stale. It is not deleted.
4. Everything derived from it is suspected, by connection type.
5. A re-digest clears the mark.

| | |
|---|---|
| Proves | External material has a freshness contract, and staleness propagates |
| Fails if | Stale digests look current, or a change invalidates everything |
| By hand | Compare the hash and mark the note |

### UC-27 — A coverage question

**Trigger.** Somebody asks what is not covered.

1. The question is a filter over the one graph, by trace connection types.
2. The answer names the nodes with no incoming trace edge.
3. The answer is computed by the engine, not by a model.
4. The same walk with a different filter answers the claim question.
5. No second store is consulted.

| | |
|---|---|
| Proves | One graph, subgraphs as filters, and the reverse index earning its keep |
| Fails if | Coverage needs its own store, or the answer needs a model |
| By hand | Run the query and read the list |

### UC-28 — Two people, one repository

**Trigger.** A second person works in the same tree.

1. Both write to the log. Each identifies itself.
2. The record is a union, not a last-writer-wins.
3. The machine has one position, and only one walker holds it.
4. The second person waits, or works in another machine.
5. Nothing silently overwrites.

| | |
|---|---|
| Proves | Multiple writers on the log, single walker on a machine |
| Fails if | Two walkers can hold one machine, or a log write can be lost |
| By hand | Two terminals, one tree |

---

## What these use cases did not cover

| Gap | Why it is open |
|---|---|
| The knowledge base beyond the two buckets | The module design is not settled |
| Retro and rule change | Named in UC-4, with no walk of its own |
| The rigor matrix, and templates for machines | Held out of every level document so far |
| Migration from an earlier version | Ruled out. Level 0 starts fresh. |
| Recovery from a corrupt record | No entry anywhere states the intended behaviour |

---

## F. Launch and projection

### UC-29 — Idle to ready, with Claude

**Story.** US-2. **Budget.** 15 seconds on the reference machine.

1. The extension is loaded. The welcome page is shown. Nothing runs.
2. The user presses the button.
3. The preferred harness is detected and found usable. The choice is recorded.
4. The cage is placed for that harness.
5. The engine reports ready. The tool server is connected.
6. The agent starts, inside the cage, in the folder that is open.
7. The agent receives the kickoff text and the prepared payload.
8. The agent reports ready in one short message.

| | |
|---|---|
| Proves | One button, cage before action, one kickoff, and the budget |
| Fails if | The agent acts before the cage is placed, or ready needs a read loop |
| By hand | Place the cage, start the harness, paste the kickoff, and time it |

### UC-30 — Idle to ready, with Copilot

**Story.** US-2.

1. The preferred harness is absent, or present and not usable.
2. The fallback is chosen. The choice is recorded, with the reason.
3. The cage is placed in the shape the fallback needs, which is not the same shape.
4. Capabilities the fallback lacks are named, at launch, in the message the user reads.
5. The agent reports ready.

| | |
|---|---|
| Proves | Two harnesses, one preferred, and honest degradation |
| Fails if | The fallback is silently weaker, or the cage shape is assumed to be portable |
| By hand | Remove the preferred harness and run UC-29 again |

### UC-31 — An original changes, and its projection follows

**Story.** US-1, US-2.

1. A guidance document that feeds the prompt layer is edited.
2. The engine notices. The projection is rebuilt.
3. No installer is run. No file is copied by hand.
4. A user who edits the projection instead is told that it is output.
5. If the projection cannot be rebuilt, the system states that it is stale.

| | |
|---|---|
| Proves | Projection is a maintained relation, not an install-time act |
| Fails if | Refreshing needs the installer, which is the v3 defect |
| By hand | Edit the original and read the projection |

### UC-32 — A document that breaks a voice rule

**Story.** US-4.

1. The agent writes a document. One sentence breaks a mechanical rule.
2. The write path intercepts.
3. The write is refused. The answer names the rule and the place.
4. Only mechanical tiers refuse. A judgement finding does not block.
5. The agent corrects the sentence and writes again.

| | |
|---|---|
| Proves | Voice reaches the record, not only the conversation |
| Fails if | The check runs after the write, or a judgement call can block a write |
| By hand | Run the checker on the file and read the finding |

### UC-33 — A session measured for voice

**Story.** US-4.

1. A person works with the agent for a session.
2. The session record is sampled.
3. The checker runs over the assistant text.
4. Findings are counted by rule, and compared with the last measurement.
5. A breach found while the session is open is reported at the stop, with the rule named.

| | |
|---|---|
| Proves | Conversation adherence is a number with a trend, not an impression |
| Fails if | The record does not hold the assistant text, or no stop-time route exists |
| By hand | Run the checker over the record and count |

### UC-34 — Every call is in the log

**Story.** US-5.

1. A person works with the agent for a session.
2. Every call the agent makes is written to the log.
3. Each line names the identity that made the call.
4. A refusal names the rule that decided it.
5. A stop names its reason.
6. The person reads the log and reconstructs the session, with no tool.

| | |
|---|---|
| Proves | Completeness of the record, which is this layer's first duty |
| Fails if | A path exists that writes nothing, or a line cannot be read by a person |
| By hand | Read the log |

### UC-35 — Level 0 alone, with no authority

**Story.** US-5.

1. Nothing above Level 0 is present. No authority answers.
2. Every stop is permitted, but a stop with no stated reason is refused once.
3. A write to a projection is refused, and the original is named.
4. A write outside the roots succeeds, unguarded.
5. A write to this layer's own machinery succeeds, and the ordinary rules apply to it.
6. A copy of a private original into the persistent area is refused.
7. An attempt to act as another identity is refused.
8. Each refusal names its rule. Every call is in the log.

| | |
|---|---|
| Proves | The own-guard list, and that Level 0 standalone is worth having |
| Fails if | Any guard needs the authority, or a guard goes quiet instead of refusing |
| By hand | Run each attempt through the guard and read the answers |

### UC-36 — Read a growing log while reading a detail

**Story.** US-6.

1. The window opens. It shows this session and nothing older.
2. The agent is working. New entries arrive every second.
3. The user scrolls up with the arrows. Following the newest line stops.
4. The user selects a line and opens its details.
5. New entries keep arriving.
6. The list does not jump. The details pane does not change or redraw.
7. The user scrolls the details pane. The list stays where it is.
8. The user closes the details with the same key that opened them.
9. The user returns to the newest line. Following resumes.
10. The user asks for an earlier session. It is reachable, and it was not there before.

| | |
|---|---|
| Proves | Session scope by default, independent scrolling, and a log that does not fight its reader |
| Fails if | Either pane redraws on a new entry, which is the v3 defect |
| By hand | Tail the log file while reading it. This is the behaviour being reproduced. |

### UC-37 — Filter down to one call

**Story.** US-6.

1. The user types. The filter applies with no key pressed first.
2. Bare text narrows on every column.
3. The user types a column name and a colon, and narrows to that column.
4. The user types a regular expression. It applies.
5. Halfway through, the expression is invalid. The view keeps the last good filter and says so.
6. The user opens the details with nothing selected. The filter syntax is shown there.
7. The filter matches one line. The user opens it.

| | |
|---|---|
| Proves | The filter floor, and that help sits where the user is looking |
| Fails if | The view blanks while typing, or the syntax lives only in documentation |
| By hand | Apply the same expressions with a command-line tool and compare the results |

---

### UC-38 — The window reloads and the engine keeps running

**Story.** US-7.

1. The engine is running and writing the session.
2. The user reloads the editor window.
3. The engine is still running, because it was not started as a child of the window.
4. The window reads what the engine says about itself, and checks that the process is there.
5. The engine shows as running. The user presses nothing.
6. The log window shows the session that is still being written, and nothing was set aside.

| | |
|---|---|
| Proves | A reload costs nothing, and the record stays in one piece |
| Fails if | The engine dies with the window, or the log is set aside while it is still being written |
| By hand | Reload the window with an engine running, and read the log |

---

### UC-39 — Start is pressed while an engine is running

**Story.** US-7.

1. An engine is running.
2. The user presses start, having forgotten, or on a second window.
3. The window attaches to the engine that is there, and says so.
4. No second engine starts.
5. The log is untouched.

Then the engine is killed rather than stopped, so its file is left behind.

6. The user presses start.
7. The file names a process that is gone, so it is not believed.
8. A fresh engine starts.

| | |
|---|---|
| Proves | A file is not a process, and two engines never write one log |
| Fails if | A second engine starts and sets aside the log the first is writing |
| By hand | `TestWhatIsRunningIsCheckedAndNotTrusted`, then press start twice |

---
