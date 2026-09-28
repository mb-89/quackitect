// The count the badge and the work tab's header read: every placed row off
// the cloud, the count countTakeable in src/tui/work/workplaces.go answers off
// the verb today.
// [[spec/tickets/open-tasks-come-from-work]]
package work

type openTasksIn struct {
	Places map[string]string `q:"places"`
}

// [[spec/tickets/open-tasks-come-from-work]]
func openTasksOf(in openTasksIn) int {
	return 0
}
