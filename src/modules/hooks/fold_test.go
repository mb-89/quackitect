// The holds fold over a session's events: the finish calls of the turn, and
// the agent's calls since the plan's last answer, counted the way the box
// counts them, and the chain's order.
// [[spec/tickets/cage-call-holds-port]]
package hooks

import (
	"strings"
	"testing"

	"quackitect/src/q"
)

// The config words a tool.call carries under held, as the door stamps them. [[spec/tickets/cage-call-holds-port]]
var finishHeld = map[string]any{heldHold: "finish", heldAsk: "quiet", heldCloud: false}

func TestTheHoldsFoldCountsAsTheBoxCounts(t *testing.T) {
	var state Holds
	seq := int64(0)
	land := func(kind, agent string, fields map[string]any) Holds {
		seq++
		state = stepHolds(state, q.Event{Seq: seq, Kind: kind, Hand: q.Hand{Session: "s1", Agent: agent}, Fields: fields})
		return state
	}
	call := func(tool string, more map[string]any) map[string]any {
		fields := map[string]any{"tool": tool, heldField: finishHeld}
		for key, value := range more {
			fields[key] = value
		}
		return fields
	}
	wants := func(state Holds, finish, calls int, after string) {
		t.Helper()
		if state.Finish != finish || state.Calls != calls {
			t.Fatalf("after %s the fold reads %+v, and wants finish %d and calls %d", after, state, finish, calls)
		}
	}
	wants(land(toolEvent, "", call("Read", nil)), 1, 1, "a call under the finish hold")
	wants(land(toolEvent, "", call("Read", nil)), 2, 2, "a second call")
	wants(land(toolEvent, "", call(planCall, map[string]any{"working": "a-ticket"})), 3, 0, "the plan call")
	wants(land(toolEvent, "a1", call("Read", nil)), 3, 0, "a helper's call")
	wants(land(toolEvent, "", call(levelZero+"log", map[string]any{"plan": map[string]any{"working": "a-ticket"}})), 4, 1, "a plan field riding a level zero call")
	wants(land(turnEvent, "", map[string]any{"reason": "answer"}), 0, 1, "the turn's end")
}

// The finish hold's ride ends the chain, so the engine's grace stays unspent behind it, as the bridge chains the holds with ??. [[spec/tickets/cage-call-holds-port]]
func TestTheOwnersHoldEndsTheChainBeforeTheGrace(t *testing.T) {
	held := map[string]any{heldHold: "finish", heldPlanEvery: 1, heldPlanGrace: 1}
	var state Holds
	for seq := int64(1); seq <= 3; seq++ {
		state = stepHolds(state, q.Event{Seq: seq, Kind: toolEvent, Hand: q.Hand{Session: "s1"}, Fields: map[string]any{"tool": "Read", heldField: held}})
		if state.Said.Word != RideWord {
			t.Fatalf("call %d reads %+v, and wants the finish hold's ride", seq, state.Said)
		}
	}
	if state.Grace == nil || state.Grace.Left != 1 {
		t.Fatalf("the grace reads %+v, and wants its one call left, since the hold's ride ends the chain", state.Grace)
	}
}

// Once the plan's grace runs out, ToolSearch still passes and spends nothing, Bash meets the refusal, and the refusal names the load. [[spec/tickets/toolsearch-rides-the-plan-ask]]
func TestToolSearchRidesASpentGrace(t *testing.T) {
	held := map[string]any{heldPlanEvery: 1, heldPlanGrace: 1}
	step := stepper()
	call := func(tool string) Holds {
		return step(toolEvent, "", map[string]any{"tool": tool, heldField: held})
	}
	if state := call("Read"); state.Said.Word != RideWord {
		t.Fatalf("the first call reads %+v, and wants the grace's ride", state.Said)
	}
	if state := call("Read"); state.Said.Word != RefuseWord {
		t.Fatalf("the second call reads %+v, and wants the spent grace's refusal", state.Said)
	}
	for range 3 {
		if state := call(schemaTool); state.Said.Word != "" || state.Grace == nil || state.Grace.Left != 0 {
			t.Fatalf("ToolSearch reads %+v with the grace %+v, and wants a pass that leaves the grace standing", state.Said, state.Grace)
		}
	}
	state := call("Bash")
	if state.Said.Word != RefuseWord || !strings.Contains(state.Said.Text, "ToolSearch with the query select:"+planCall) {
		t.Fatalf("Bash reads %+v, and wants the refusal naming the load", state.Said)
	}
}

// One event of the session s1, or of the helper a1, at the next place. [[spec/tickets/cage-hold-drops-port]]
func stepper() func(kind, agent string, fields map[string]any) Holds {
	var state Holds
	seq := int64(0)
	return func(kind, agent string, fields map[string]any) Holds {
		seq++
		state = stepHolds(state, q.Event{Seq: seq, Kind: kind, Hand: q.Hand{Session: "s1", Agent: agent}, Fields: fields})
		return state
	}
}

// The turn's end drops a finish or a stop hold to off and keeps it as the stood mark. A helper's end and a hold at off drop nothing. [[spec/tickets/cage-hold-drops-port]]
func TestATurnsEndDropsTheOwnersHold(t *testing.T) {
	for _, hold := range []string{finishHold, stopHold} {
		land := stepper()
		end := map[string]any{"reason": answerReason, "answer": "done", heldField: map[string]any{heldHold: hold}}
		if helper := land(turnEvent, "a1", end); len(helper.Said.Drops) != 0 {
			t.Fatalf("a helper's turn end drops %v, and wants nothing", helper.Said.Drops)
		}
		state := land(turnEvent, "", end)
		if state.Said.Drops[heldHold] != offHold || len(state.Said.Drops) != 1 {
			t.Fatalf("the turn's end under %s drops %v, and wants %s to %s alone", hold, state.Said.Drops, heldHold, offHold)
		}
		if state.Stood != hold {
			t.Fatalf("the stood mark reads %q, and wants %s", state.Stood, hold)
		}
	}
	state := stepper()(turnEvent, "", map[string]any{"reason": answerReason, heldField: map[string]any{heldHold: offHold}})
	if len(state.Said.Drops) != 0 || state.Stood != "" {
		t.Fatalf("a turn's end at off reads %+v, and wants no drop and no mark", state)
	}
}

// A prompt opens the next turn, so the stood mark of the turn before clears, whoever sends it. [[spec/tickets/cage-hold-drops-port]]
func TestAPromptClearsTheStoodHold(t *testing.T) {
	land := stepper()
	land(turnEvent, "", map[string]any{"reason": answerReason, heldField: map[string]any{heldHold: finishHold}})
	if state := land(promptEvent, "", map[string]any{"text": "a task's notice", "origin": map[string]any{"kind": "task"}}); state.Stood != "" {
		t.Fatalf("the stood mark reads %q after a prompt, and wants none", state.Stood)
	}
}

// The update the ask opens pays on a text, and the pay drops the ask to quiet where it still stands at the paid value. [[spec/tickets/cage-hold-drops-port]]
func TestAPaidUpdateDropsTheAsk(t *testing.T) {
	land := stepper()
	brief := map[string]any{heldAsk: "brief", heldHold: offHold}
	land(toolEvent, "", map[string]any{"tool": "Read", heldField: brief})
	state := land(displayEvent, "", map[string]any{"delta": "The tests stand green.", heldField: brief})
	if state.Said.Drops[heldAsk] != quiet || len(state.Said.Drops) != 1 {
		t.Fatalf("the paid update drops %v, and wants %s to %s alone", state.Said.Drops, heldAsk, quiet)
	}
	if state.Asked != "" || state.Demand != nil {
		t.Fatalf("the fold reads %+v after the pay, and wants no ask and no demand", state)
	}
}

// An ask pressed to another value since the demand opened stands at its pay. [[spec/tickets/cage-hold-drops-port]]
func TestAnAskPressedSinceStandsAtItsPay(t *testing.T) {
	land := stepper()
	land(toolEvent, "", map[string]any{"tool": "Read", heldField: map[string]any{heldAsk: "brief"}})
	state := land(displayEvent, "", map[string]any{"delta": "The tests stand green.", heldField: map[string]any{heldAsk: "full"}})
	if len(state.Said.Drops) != 0 {
		t.Fatalf("the pay drops %v, and wants nothing, since full stands pressed since", state.Said.Drops)
	}
	if state.Demand != nil {
		t.Fatalf("the demand reads %+v after the pay, and wants none", state.Demand)
	}
}
