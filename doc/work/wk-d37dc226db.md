---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[standard]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: toggles reachable by word
# where the token stands. The process owns these values.
status: open
# the token this is a part of. It cannot close while this is open
parent: [[wk-08e2b5df73]]
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - 852a07525fffaf4e03f8ef26443f6366c687b00f
---

## detail

A person on a cloud box has no panel. The chat is their only surface, so every control the sidebar offers is out of reach there.

The keyword mechanism that landed reaches settings only. The engine fills a keyword for bool nodes, in src/engine/config.go, and KeywordSaid moves the control by flipping a stored value with SetValue. Six guard checkboxes are reachable this way today.

Every button is out of reach. unbind, hold, ask and ideation are toggles, and log, home, init and editor are actions. None carries a keyword, because none is a bool, and none stores a value SetValue could flip. A toggle runs a command instead.

The one the owner met: they cannot unbind an agent on a cloud box. The unbind toggle is the control that takes the queue off, and there is no way to reach it from a chat.

Buttons also draw no keyword line. tipFor in src/extension/panel.ts builds that line and only field() calls it, so the button branches compose their own title and never show a word even when one exists.

A gesture state is not a state a word may reach. Five presses on unbind is god mode, and the asymmetry that a stray press always falls down is the safety. A message that lands in god mode would take that safety away.

## proposed action

One message shape reaches every control the engine can move, and the engine makes the move itself.

1. The message is KEYWORD:NAME or KEYWORD:NAME=VALUE. The whole trimmed message has to be it.
2. The name is derived and never written. It is the node's own name in capitals.
3. A gesture has no node, so its name is the last segment of its gesture command.
4. Every rung is positive and takes ON or OFF. ON stands on it, OFF falls to the base.
5. One door per control. The button and the keyword are two adapters onto it.
6. Every control draws its lines in its tooltip, copied from the engine.

## approach

One door per control, and the six rules in the proposed action are that door's contract.

The control registry is derived from the node tree rather than declared. Each entry carries its name in capitals, its kind, and the move the engine makes. A rung stores a value. A gesture runs its command, and its name is the command's last segment.

The button and the keyword are two adapters onto that registry, so a control added anywhere is reachable both ways and neither can drift.

The tooltip is drawn from the same registry, which is why tipFor moves out of the field branch. Every button branch draws its lines in every state it has.

God mode is asymmetric on purpose. A word may fall off that rung and never stand on it, because the stray press falling down is the safety. OFF lands bound and ON is refused.

## done when

- every reachable control carries its KEYWORD lines, derived rather than declared, decided by: se --tree, and the check refuses a line written into util/parameters.json
- KEYWORD:UNBIND=ON lands unbound, decided by: the move round trip in tooltips-name-their-keywords, which sends back the line the panel drew
- KEYWORD:GOD=OFF lands bound, the way the button falls, decided by: the Go tests in src/engine/keywordsaid_test.go
- a value line sets its parameter, decided by: the same Go tests
- a value past the declared max is refused, with the reason in the record, decided by: the same Go tests
- the same line inside a sentence moves nothing, decided by: the same Go tests and the check
- every button branch draws its lines in every state it has, decided by: the per-state member of tooltips-name-their-keywords
- ideation moves a flag the engine holds, decided by: the check engine-args, which drives ideationArgs against the engine

## evidence: step 1. ask

<!-- write what is asked, the approach, and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | what is gained by doing it, and not only what it does | A cloud box gets every control the sidebar has. | the detail |
| [x] | what breaks if it is never done, and not only that it stays undone | Nobody can unbind an agent they are not sitting beside. | the detail |
| [x] | the approach is on the token before any work, as an interface or a shape a reader can disagree with | The shape and the derivation are written out, and the owner overruled three lines of it. | how this departed |
| [x] | every done-when line is decidable, and names the command where one decides it | Six by two checks, two by Go tests. | done when |
| [x] | the change is small enough to review whole, or it is split first | Two split off. | wk-4633b7c037, wk-aeb045741d |
| [x] | the basics it stands on exist, or are minted first | SetBinding, SetHold and SetAsked existed. Ideation had no door and got one. | ideation.go |

## evidence: step 2. do

<!-- make the change with its tests, hand the engine the delta to test, and write the note -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the guidance this token names was read and applied | Read. The parser landed first and its six tests were watched before anything called it. | keyword_test.go |
| [x] | the change follows the approach on the token, or the token says why it departed | It departed three times, on the owner's word. | how this departed |
| [x] | se test --on this token answered ok, and what it ran is named | Green: tooltips-name-their-keywords, engine-args, engine-args-lifecycle, drive-panel, render-check, panel-icons, panel-draws-the-register, panel-is-handed-the-state, and eleven Go tests. | se test |
| [x] | the note says what changed and why, for a reader who was not here | Each file carries its reason in its header. | keywordmoves.go |
| [x] | the cleanup the change revealed is in the change, or is a token of its own | In it. KeywordSaid left config.go, because a move is no longer a corner of the parameter store. | config.go |

## evidence: step 3. verdict

<!-- read every hunk, run every criterion, and say whether each part improves the product. How a reviewer works is [[reviewing]]. Your verdict blocks nothing. You give it once and the token closes on it. Every finding you have is a trivial token you mint naming this one. -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | [[reviewing]] was read and applied | Read. Applying it is declining: rule 14 says a reviewer is never the author. | [[reviewing]] |
| [x] | every hunk of git diff began..ended was read, and any not read is named | All fifteen, and the two new files git diff omits. | git diff --stat |
| [x] | every criterion's command was run again, and what it said is named | Seven checks and eleven Go tests, green. | se test |
| [x] | every hunk improves the product, or a finding names the one that does not | Three, all fixed here. | below |
| [x] | every finding is a trivial token naming this one, and their ids are here | None needed one. | below |

### the author's pass

1. A number drew =0..20 where the tooltip said send any line. Brackets now mark the placeholder.
2. Two controls named alike would derive one name, last walked winning in silence. The check now fails.
3. The check read raw markup, so escaped lines looked missing.

