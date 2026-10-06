// The fleet routine: one stored routine checks the fleet on a schedule, and a
// pull request event goes to the box that holds its branch.
// [[spec/tickets/one-routine-checks-the-fleet]]
package branches

import (
	"cmp"
	"encoding/json"
)

// The variable a GitHub workflow names its event file in. [[spec/tickets/one-routine-checks-the-fleet]]
const eventPathVar = "GITHUB_EVENT_PATH"

// The fleet routine's name, the config key its stored id stands under, and the prompt it carries. [[spec/tickets/one-routine-checks-the-fleet]]
const (
	fleetRoutineName = "fleet_check"
	fleetRoutineKey  = "cloud.fleetRoutine"
	fleetPrompt      = "Run ./RUNME.sh cloud fleet. For each wake line it prints, read the box it names and act on it: message a stalled box, take a failed branch back with ./RUNME.sh branch release <name>, or fire a box at it. End the run once no wake line stands unanswered."
)

// The session of the box holding the head branch, or nothing where no box holds it. [[spec/tickets/one-routine-checks-the-fleet]]
func pullRouteOf(head string, rows []boxRow) string {
	for _, one := range rows {
		if one.Branch == head && one.Standing == held {
			return one.Session
		}
	}
	return ""
}

// Prints the fleet routine: its name, the id the config stores and the prompt it carries, or the prompt to store where no id stands. [[spec/tickets/one-routine-checks-the-fleet]]
func (d *Doors) fleetRoutine() {
	id := d.config(fleetRoutineKey)
	if id == "" {
		d.say("\nNo %s id stands under %s. Store a routine on claude.ai with the prompt below, and write its id there:\n", fleetRoutineName, fleetRoutineKey)
	} else {
		d.say("\n%s checks the fleet on its schedule. Fire it now with:\n", fleetRoutineName)
		d.say("    action=run  trigger_id=%s\n", id)
	}
	d.say("%s", fleetPrompt)
}

// Prints the session that holds the branch a pull request event names, off the event file past the verb or at GITHUB_EVENT_PATH. [[spec/tickets/one-routine-checks-the-fleet]]
func (d *Doors) route(path string) int {
	at := cmp.Or(path, d.env(eventPathVar))
	var event struct {
		PullRequest struct {
			Head struct {
				Ref string `json:"ref"`
			} `json:"head"`
		} `json:"pull_request"`
	}
	if err := json.Unmarshal([]byte(readFile(at)), &event); err != nil || event.PullRequest.Head.Ref == "" {
		d.warn("cloud route reads no pull request event at %q: ./RUNME.sh cloud route <event.json>", at)
		return codeRefused
	}
	head := event.PullRequest.Head.Ref
	d.fetch()
	stood, _ := d.readWork(false)
	if session := pullRouteOf(head, fleetRows(stood, standingAll(stood))); session != "" {
		d.say("%s goes to session %s.", head, session)
		return codeOK
	}
	d.say("%s goes to the coordinator, since no box holds it.", head)
	return codeOK
}
