// The start road: a desk session that writes and loads no level-zero plugin
// meets a refusal naming the repo folder and ./RUNME.sh.
// [[spec/tickets/the-coordinator-runs-under-level0]]
package hooks

// Answers the reason a session start refuses, or nothing where it passes. [[spec/tickets/the-coordinator-runs-under-level0]]
func StartRefusal(root string, plugin, cloud bool, mode string) string {
	if plugin || cloud || mode == "plan" {
		return ""
	}
	return "This session loads no level-zero plugin, so no door or gate reaches its turns. " +
		"Open it in the repo folder " + root + " once ./RUNME.sh has run there, or start it in plan mode to read alone."
}
