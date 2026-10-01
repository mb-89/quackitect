// The plan's answer riding a Go-answered call: the door calls the plan action
// with the field first, as the bridge's planRides did.
// [[spec/tickets/plan-writes-off-go]]
package hooks

import "quackitect/src/q/tool"

// The plan field a call carries goes to the action listed under the plan tool's name, before the call itself and past the plan tool's own call. The fold already starts the count over, so the door writes the file alone. [[spec/design_output/stop#the-plan]]
func (d *Door) rides(session, action string, args map[string]any) {
	field, ok := args[tool.PlanArg].(map[string]any)
	if !ok {
		return
	}
	plan, ok := tool.Action(d.from.Store, tool.PlanTool)
	if !ok || plan == action {
		return
	}
	input, err := tool.Input(d.from.Store, plan, field)
	if err != nil {
		return
	}
	d.from.Call(plan, input, session, d.waitOf(nil))
}
