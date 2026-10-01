// The body a voice refusal frames: each finding's place, rule, the text it
// wrote, its line and message, then the Hold line. The write door and the
// draft checks each open it their own way.
// [[spec/tickets/prose-tools-answer-in-go]]
package prose

import (
	"strconv"
	"strings"
)

// One finding a voice refusal names: where it stands, its rule and message, the text it wrote, cut by the caller, and the line it stands in, where the caller hands one. Vale's own row stands as Finding in prose.go. [[spec/tickets/prose-tools-answer-in-go]]
type Refused struct {
	Line    int
	Column  int
	Rule    string
	Message string
	Said    string
	Context string
}

// The lines each finding takes, then the Hold line naming each rule once, off bodyOf and taught in lib/refuse.js. [[spec/tickets/prose-tools-answer-in-go]]
func Body(where string, found []Refused) string {
	var lines, names []string
	seen := map[string]bool{}
	for _, one := range found {
		lines = append(lines, "  "+where+":"+strconv.Itoa(one.Line)+":"+strconv.Itoa(one.Column)+"  "+one.Rule)
		if one.Said != "" {
			lines = append(lines, "    wrote: "+one.Said)
		}
		if one.Context != "" {
			lines = append(lines, "    in: "+one.Context)
		}
		lines = append(lines, "    "+one.Message, "")
		if !seen[one.Rule] {
			seen[one.Rule] = true
			names = append(names, one.Rule)
		}
	}
	return strings.Join(append(lines, "Hold "+namesOf(names)+" for the rest of this turn: apply the same rule to every line you write next, and fix the lines you already wrote if they break it."), "\n")
}

// The rule names as one phrase: the last joined by and. [[spec/tickets/prose-tools-answer-in-go]]
func namesOf(names []string) string {
	if len(names) == 0 {
		return ""
	}
	last := names[len(names)-1]
	if len(names) == 1 {
		return last
	}
	return strings.Join(names[:len(names)-1], ", ") + " and " + last
}
