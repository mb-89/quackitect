// The wording of a command's refusal, off refusedCommand in lib/refuse.js:
// the command, each rule with the words it reads, and the rules to hold.
// [[spec/tickets/cage-command-rules-port]]
package command

import "strings"

// The letters the command line and a finding's words keep, and the mark a cut ends on. [[spec/design_output/bash#what-every-refusal-owes]]
const (
	commandCut = 120
	lineCut    = 72
	ellipsis   = "..."
)

// The refusal naming every finding over a command. [[spec/design_output/bash#what-every-refusal-owes]]
func RefusedCommand(command string, found []Row) string {
	lines := []string{"Level zero refuses this command.", "", "  ran: " + cut(command, commandCut), ""}
	var names []string
	for _, one := range found {
		lines = append(lines, "  "+one.Rule)
		if one.Said != "" {
			lines = append(lines, "    reads: "+cut(one.Said, lineCut))
		}
		lines = append(lines, "    "+one.Message, "")
		if !holds(names, one.Rule) {
			names = append(names, one.Rule)
		}
	}
	named := names[len(names)-1]
	if len(names) > 1 {
		named = strings.Join(names[:len(names)-1], ", ") + " and " + named
	}
	return strings.Join(append(lines, "Hold "+named+" for the rest of this turn."), "\n")
}

// A text flattened to one line, cut at a count of letters. [[spec/design_output/bash#what-every-refusal-owes]]
func cut(said string, at int) string {
	letters := []rune(flat(said))
	if len(letters) > at {
		return string(letters[:at-len(ellipsis)]) + ellipsis
	}
	return string(letters)
}
