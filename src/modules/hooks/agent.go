// The Agent door: a call waiting on its
// helper refuses, and so does a call naming no model of the tiers, where the
// config names any. [[spec/design_output/level0#an-agent-call-runs-behind]]
package hooks

import (
	"strings"

	"quackitect/src/modules/hooks/brief"
)

// The tool the door reads, and its refusal of a call held in the foreground. [[spec/design_output/level0#an-agent-call-runs-behind]]
const (
	agentTool  = "Agent"
	foreground = "This Agent call carries run_in_background: false, and the turn waits on the helper while the owner waits on you. Call it again with run_in_background: true, and read its hand-back when it lands."
)

// The refusal of an Agent call, or nothing. [[spec/design_output/level0#a-helper-ends-no-turn]]
func agentRefusal(e map[string]any, settings Settings) string {
	if background, ok := e["run_in_background"].(bool); ok && !background {
		return foreground
	}
	model := strings.TrimSpace(textOf(e, "model"))
	for _, one := range brief.Tiers {
		if held := strings.TrimSpace(settings.Helpers[one[0]]); held != "" && held == model {
			return ""
		}
	}
	line := brief.TiersLine(settings.Helpers)
	if line == "" {
		return ""
	}
	named := "names no model"
	if model != "" {
		named = "names model " + model + ", a model of no tier"
	}
	return "This Agent call " + named + ". " + line
}
