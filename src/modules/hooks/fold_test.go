// The holds fold over a session's events: the finish calls of the turn, and
// the agent's calls since the plan's last answer, counted the way the box
// counts them, and the chain's order.
// [[spec/tickets/cage-call-holds-port]]
package hooks

import (
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
