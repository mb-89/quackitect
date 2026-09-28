// The count the badge and the work tab's header read: every placed row off
// the cloud, the count countTakeable in src/tui/work/workplaces.go answers off
// the verb today.
// [[spec/tickets/open-tasks-come-from-work]]
package work

type openTasksIn struct {
	Places map[string]string `q:"places"`
}

// The place of a row the cloud holds, which src/modules/queue answers and a module spells again, since no module imports another. [[spec/design_output/pull#the-queue-is-an-outline]]
const cloudPlace = "∞"

// Every placed row off the cloud. [[spec/design_output/tui#the-work-tab]]
func openTasksOf(in openTasksIn) int {
	count := 0
	for _, place := range in.Places {
		if place != cloudPlace {
			count++
		}
	}
	return count
}
