// The holds fold over a session's events: the finish calls of the turn, and
// the agent's calls since the plan's last answer, counted the way the box
// counts them.
// [[spec/tickets/cage-call-holds-port]]
package session

import (
	"encoding/json"
	"testing"

	"quackitect/src/q"
	"quackitect/src/q/qtest"
)

// The config words a tool.call carries under held, as the door stamps them. [[spec/tickets/cage-call-holds-port]]
var finishHeld = map[string]any{"stop.hold": "finish", "ask.wanted": "quiet", "cloud": false}

func TestTheHoldsFoldCountsAsTheBoxCounts(t *testing.T) {
	ix := qtest.New(t, func(c *q.Catalog) { Registers(c) })
	seq := int64(0)
	land := func(kind, agent string, fields map[string]any) map[string]any {
		t.Helper()
		seq++
		event := q.Event{Seq: seq, Kind: kind, Hand: q.Hand{Session: "s1", Agent: agent}, Fields: fields}
		if err := ix.Store().Land("s1/holds", event); err != nil {
			t.Fatalf("the holds fold takes no event: %v", err)
		}
		body, _ := json.Marshal(ix.Read("s1/holds"))
		var state map[string]any
		if err := json.Unmarshal(body, &state); err != nil {
			t.Fatalf("the holds fold reads %s, and wants an object", body)
		}
		return state
	}
	call := func(tool string, more map[string]any) map[string]any {
		fields := map[string]any{"tool": tool, "held": finishHeld}
		for key, value := range more {
			fields[key] = value
		}
		return fields
	}
	wants := func(state map[string]any, finish, calls float64, after string) {
		t.Helper()
		if state["finish"] != finish || state["calls"] != calls {
			t.Fatalf("after %s the fold reads %v, and wants finish %v and calls %v", after, state, finish, calls)
		}
	}
	wants(land("tool.call", "", call("Read", nil)), 1, 1, "a call under the finish hold")
	wants(land("tool.call", "", call("Read", nil)), 2, 2, "a second call")
	wants(land("tool.call", "", call("mcp__level0__plan", map[string]any{"working": "a-ticket"})), 3, 0, "the plan call")
	wants(land("tool.call", "a1", call("Read", nil)), 3, 0, "a helper's call")
	wants(land("tool.call", "", call("mcp__level0__log", map[string]any{"plan": map[string]any{"working": "a-ticket"}})), 4, 1, "a plan field riding a level zero call")
	wants(land("turn.complete", "", map[string]any{"reason": "answer"}), 0, 1, "the turn's end")
}

// The finish hold's ride ends the chain, so the engine's grace stays unspent behind it, as the bridge chains the holds with ??. [[spec/tickets/cage-call-holds-port]]
func TestTheOwnersHoldEndsTheChainBeforeTheGrace(t *testing.T) {
	held := map[string]any{HeldHold: "finish", HeldPlanEvery: 1, HeldPlanGrace: 1}
	var state Holds
	for seq := int64(1); seq <= 3; seq++ {
		state = StepHolds(state, q.Event{Seq: seq, Kind: "tool.call", Hand: q.Hand{Session: "s1"}, Fields: map[string]any{"tool": "Read", HeldField: held}})
		if state.Said.Word != RideWord {
			t.Fatalf("call %d reads %+v, and wants the finish hold's ride", seq, state.Said)
		}
	}
	if state.Grace == nil || state.Grace.Left != 1 {
		t.Fatalf("the grace reads %+v, and wants its one call left, since the hold's ride ends the chain", state.Grace)
	}
}
