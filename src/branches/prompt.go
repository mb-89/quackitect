// The prompt a box starts with, off the group ticket and its route, so no
// spawn types the rules again.
// [[spec/tickets/a-verb-writes-box-prompts]]
package branches

import (
	"strings"

	"quackitect/src/yaml"
)

// Prints the prompt a box starts with on the group named, or refuses where the ticket or its route stands nowhere. [[spec/tickets/a-verb-writes-box-prompts]]
func (d *Doors) prompt(group string) int {
	if group == "" {
		d.warn("cloud prompt needs a group: ./RUNME.sh cloud prompt <group>")
		return codeRefused
	}
	at := ticketAt(group)
	text := d.read(at)
	if text == "" {
		d.warn("%s stands nowhere, so no box starts on it.", at)
		return codeRefused
	}
	if !isGroup(text) {
		d.warn("%s names no group route, so no box starts on it.", at)
		return codeRefused
	}
	route, missing := d.processAt(routeOf(text))
	if missing != "" {
		d.warn("%s", missing)
		return codeRefused
	}
	var steps []string
	for _, one := range route.Steps {
		if step := yaml.AsDoc(one); step != nil {
			steps = append(steps, yaml.AsString(step.Get("name")))
		}
	}
	var children []string
	for _, one := range d.ticketsOnDisk() {
		if fieldOf(one.Text, groupField) == group && stateOf(one.Text) != closedState {
			children = append(children, one.Name)
		}
	}
	d.say("%s", promptOf(group, steps, children))
	return codeOK
}

// The prompt itself: the work skill line, the group, its open children, its route in order, and the box rules. [[spec/tickets/a-verb-writes-box-prompts]]
func promptOf(group string, steps, children []string) string {
	return strings.Join([]string{
		"run the work skill",
		"Your group: " + group + ". Its child tickets stand under " + ticketsFolder + ": " + strings.Join(children, ", ") + ".",
		"Its route: " + strings.Join(steps, ", ") + ".",
		"",
		boxRules,
	}, "\n")
}

// The rules every box prompt carries, in the order a box meets them. [[spec/guidance/cloud/cloud]]
const boxRules = `Rules for this box (the owner is away; decide every step yourself, never ask anybody anything, never end a turn on a question or a confirm):
- Take the branch with ./RUNME.sh branch take <group>, and read the ask it prints.
- Work the group to done with ./RUNME.sh ticket pull. Pass person steps yourself where the ticket's ask already answers them.
- After every clear or handover, run ./RUNME.sh ticket pull and continue; never stop at a handover.
- No timers and no sleeps in code or tests: wait on events; time only through the clock door.
- Each door is tested once against the real thing; every other test uses the door's fake; modules stay pure over the index.
- Commit with ./RUNME.sh commit, push yourself, keep ./RUNME.sh check green, merge main in (never rebase, never force-push, never --no-verify).
- When the group is done: ./RUNME.sh branch done --model <id> --cost <usd> --final "<your last line>", open the PR against main and turn on auto-merge with method MERGE. Watch its CI and fix any red until it merges.
- Other boxes work other groups in parallel; on a merge conflict, merge main and resolve.`
