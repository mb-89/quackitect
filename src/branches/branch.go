// The branch and cloud verbs: one table, each verb a function over the doors,
// and the log row a loud verb leaves, as work, cloud and tell in
// src/scripts/work.js answer them.
// [[spec/design_output/work#the-round-trip]]
package branches

import (
	"fmt"
	"strings"
)

// The exit codes a verb answers: done, red, and a call the verb refuses. [[spec/design_output/work#the-round-trip]]
const (
	codeOK      = 0
	codeRed     = 1
	codeRefused = 2
)

// A branch verb: the doors, the name past the verb, and every word. [[spec/tickets/branch-list-reads-work-table]]
type verb func(d *Doors, name string, argv []string) int

// One verb of the table with its usage row. [[spec/tickets/branch-list-reads-work-table]]
type verbRow struct {
	Name  string
	Usage string
	Run   verb
	Loud  bool
}

// The verbs branch answers, in the order the usage prints them. [[spec/tickets/branch-list-reads-work-table]]
var table []verbRow

func init() {
	table = []verbRow{
		{"open", "  open <group>  push work/<group> off main for a group ticket, so the cloud finds it", openGroup, true},
		{"take", "  take [--over] [name] take the next branch marked todo, or with --over a hold whose box stopped beating, and print its ask", take, true},
		{"beat", "  beat [--end]  push this box's beat on the group it holds, or end the hold at once", beatVerb, false},
		{"sync", "  sync          take main into this branch before you start", func(d *Doors, _ string, _ []string) int { return d.sync() }, false},
		{"done", "  done          mark this branch done, commit and push", finish, true},
		{"release", "  release       put this branch, or the one you name, back to todo", release, true},
		{"read", "  read <name>   print what stands on work/<name>", read, false},
		{"review", "  review <name> gather what a reader needs, and answer the report", review, false},
		{"list", "  list [--all|--done|--queue|--fetch] what stands open, everything, the done ones, the pull's order, or the refs again", list, false},
		{"merge", "  merge <name>  take a done branch into main", merge, true},
		{"close", "  close [name]  delete a branch already inside main, or every one", closeVerb, true},
		{"escalate", "  escalate <question> [--options a,b,c] put a person step before the leaf in hand", escalate, false},
		{"guidance", "  guidance [note] the notes the held step reads, or the one note you name", guidance, false},
		{"unblock", "  unblock <t> <successor> close a ticket waiting on a person, and hand it to its successor", unblock, true},
		{"test", "  test [file]   run the tests the branch changes since the take: green, assertion, build or missing", testVerb, false},
	}
}

// The usage head the branch verb prints. [[spec/design_output/work#the-round-trip]]
const branchUsage = "Usage: ./RUNME.sh branch <verb>\n"

// The names of every branch verb, which a step's needs read. [[spec/tickets/branch-list-reads-work-table]]
func verbNames() []string {
	out := make([]string, 0, len(table))
	for _, one := range table {
		out = append(out, one.Name)
	}
	return out
}

// Runs the branch verb its first word names, or prints the usage. [[spec/design_output/work#the-round-trip]]
func Branch(d *Doors, argv []string) int {
	what, name := word(argv, 0), nameWord(argv)
	for _, one := range table {
		if one.Name != what {
			continue
		}
		code := one.Run(d, name, argv)
		if one.Loud {
			d.tell(what, code)
		}
		return code
	}
	d.say("%s", branchUsage)
	for _, one := range table {
		d.say("%s", one.Usage)
	}
	if what != "" {
		return codeRefused
	}
	return codeOK
}

// Runs the cloud verb: the routine's trigger, or the usage. [[spec/design_output/work#the-routine-a-verb-names]]
func Cloud(d *Doors, argv []string) int {
	switch word(argv, 0) {
	case "trigger":
		return d.trigger()
	case "prompt":
		return d.prompt(word(argv, 1))
	case "fleet":
		return d.fleet()
	case "route":
		return d.route(word(argv, 1))
	}
	d.say("Usage: ./RUNME.sh cloud <verb>\n")
	d.say("  trigger       the routine that works a branch, and what stands free")
	d.say("  prompt <group> the prompt a box starts with, off the group and its route")
	d.say("  fleet         each box with its tip, age, holder and pull request, and a wake for each that stalls")
	d.say("  route [event] the session that holds the branch a pull request event names")
	if word(argv, 0) != "" {
		return codeRefused
	}
	return codeOK
}

// The word at a place, or nothing past the end. [[spec/design_output/work#the-round-trip]]
func word(argv []string, at int) string {
	if at < len(argv) {
		return argv[at]
	}
	return ""
}

// The name past the verb, or nothing where a flag stands there. [[spec/tickets/boxes-write-their-final-record]]
func nameWord(argv []string) string {
	if said := word(argv, 1); !strings.HasPrefix(said, "--") {
		return said
	}
	return ""
}

// The log row a loud verb leaves: debug on zero, which the floor hides, and warn on any other code. [[spec/design_output/log#which-kind-says-what]]
func (d *Doors) tell(what string, code int) {
	if d.Log == nil {
		return
	}
	level := "warn"
	if code == codeOK {
		level = "debug"
	}
	d.Log(level, "work", fmt.Sprintf("%s answered %d", what, code), map[string]any{"branch": d.here()})
}
