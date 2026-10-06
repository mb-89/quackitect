// A plan field riding a Go-answered call reaches the plan action first, and
// the plan tool's own call rides nothing.
// [[spec/tickets/plan-writes-off-go]]
package hooks

import (
	"reflect"
	"testing"

	"quackitect/src/q"
	"quackitect/src/q/qtest"
	"quackitect/src/q/tool"
)

// A door over a catalog holding the pull and a plan action under the plan tool's name. [[spec/tickets/plan-writes-off-go]]
func ridingDoor(t *testing.T, c *calls) *Door {
	t.Helper()
	var events q.Writer
	ix := qtest.New(t, func(cat *q.Catalog) {
		events = Registers(cat)
		q.ActionIn(cat, "work/pull", func(struct{}) []q.Request { return nil }, q.Doc("pulls the next ticket"))
		q.ActionIn(cat, "work/plan", func(tool.Plan) []q.Request { return nil }, q.Doc("answers the plan"), q.ToolName(tool.PlanTool))
	})
	return New(Outside{
		Store: ix.Store(), As: events, Bound: func(local string) string { return local },
		Call: c.call, Ops: (&book{}).of, Clock: qtest.NewFake(fixed),
	})
}

// [[spec/tickets/plan-writes-off-go]]
func TestAPlanFieldRidingACallReachesThePlanActionFirst(t *testing.T) {
	c := &calls{}
	hooks(t, ridingDoor(t, c), toolCall(map[string]any{tool.PlanArg: map[string]any{"working": "riding"}}))
	if len(c.inputs) != 2 || !reflect.DeepEqual(c.inputs[0], tool.Plan{Working: "riding"}) || c.inputs[1] != (struct{}{}) {
		t.Errorf("the door calls with %#v, and wants the plan first, then the pull past the field", c.inputs)
	}
}

// [[spec/tickets/plan-writes-off-go]]
func TestThePlanToolsOwnCallRidesNothing(t *testing.T) {
	c := &calls{}
	hooks(t, ridingDoor(t, c), Post{Event: toolEvent, E: map[string]any{"tool": tool.PlanTool, "session_id": "s1", "input": map[string]any{"working": "w", tool.PlanArg: map[string]any{"working": "riding"}}}})
	if len(c.inputs) != 1 || !reflect.DeepEqual(c.inputs[0], tool.Plan{Working: "w"}) {
		t.Errorf("the door calls with %#v, and wants the plan's own input alone", c.inputs)
	}
}
