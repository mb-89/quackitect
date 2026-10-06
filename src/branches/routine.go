// The fleet routine: one stored routine checks the fleet on a schedule, and a
// pull request event goes to the box that holds its branch.
// [[spec/tickets/one-routine-checks-the-fleet]]
package branches

// The fleet routine's name, the config key its stored id stands under, and the prompt it carries. [[spec/tickets/one-routine-checks-the-fleet]]
const (
	fleetRoutineName = "fleet_check"
	fleetRoutineKey  = "cloud.fleetRoutine"
	fleetPrompt      = "Run ./RUNME.sh cloud fleet. For each wake line it prints, read the box it names and act on it: message a stalled box, take a failed branch back with ./RUNME.sh branch release <name>, or fire a box at it. End the run once no wake line stands unanswered."
)

// The session of the box holding the head branch, or nothing where no box holds it. [[spec/tickets/one-routine-checks-the-fleet]]
func pullRouteOf(_ string, _ []boxRow) string {
	return ""
}
