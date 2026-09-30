// The Agent door, off onAgent in src/bridge/agent.js: a call waiting on its
// helper refuses, and so does a call naming no model of the tiers, where the
// config names any. [[spec/design_output/level0#an-agent-call-runs-behind]]
package hooks

import "strings"

// The tool the door reads, and its refusal of a call held in the foreground. [[spec/design_output/level0#an-agent-call-runs-behind]]
const (
	agentTool  = "Agent"
	foreground = "This Agent call carries run_in_background: false, and the turn waits on the helper while the owner waits on you. Call it again with run_in_background: true, and read its hand-back when it lands."
)

// The tiers, lightest first, each with the work it takes. The config names the model of each. [[spec/design_output/level0#a-spawn-names-its-tier]]
var tiers = []struct{ tier, work string }{
	{"find", "find, list, read and report: work you check by looking"},
	{"change", "a scoped change in one to three files with its test, or a review against a list"},
	{"decide", "a design, a cause nobody knows, a change across modules, or a verdict the owner reads"},
}

// The refusal of an Agent call, or nothing. [[spec/design_output/level0#a-helper-ends-no-turn]]
func agentRefusal(e map[string]any, settings Settings) string {
	if background, ok := e["run_in_background"].(bool); ok && !background {
		return foreground
	}
	var rows []string
	model := strings.TrimSpace(textOf(e, "model"))
	for _, one := range tiers {
		held := strings.TrimSpace(settings.Helpers[one.tier])
		if held == "" {
			continue
		}
		if held == model {
			return ""
		}
		rows = append(rows, one.tier+" takes `"+held+"`: "+one.work+".")
	}
	if len(rows) == 0 {
		return ""
	}
	named := "names no model"
	if model != "" {
		named = "names model " + model + ", a model of no tier"
	}
	said := append([]string{"Every `Agent` call names `model` by the tier of the work it hands."}, rows...)
	return "This Agent call " + named + ". " + strings.Join(append(said, "Where you doubt, take the next tier up."), " ")
}
