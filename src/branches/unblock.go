// The box hands a person's work out of its branch: the child closes as became,
// the successor stands outside the group carrying the question, and the group
// is free to close, as src/scripts/work-unblock.js answers it.
// [[spec/design_output/work#a-person-step-leaves]]
package branches

import (
	"fmt"
	"regexp"
	"strings"

	"quackitect/src/yaml"
)

// The chapter a hand writes on a ticket it holds no step of. [[spec/design_output/work#a-person-step-leaves]]
const discussion = "# Discussion"

var (
	emptyChapter = regexp.MustCompile(`(?s)Nothing stands here yet\.|<!--.*?-->`)
	escapedLine  = regexp.MustCompile(`\\{1,2}n`)
	askCut       = regexp.MustCompile(`;\s`)
)

// A ticket on disk: its name, where it stands, its text and its front. [[spec/design_output/work#a-person-step-leaves]]
type onDisk struct {
	Name, At, Text, Why string
	Front              *yaml.Doc
}

// Closes a ticket waiting on a person as became, and hands the question to its successor. [[spec/design_output/work#a-person-step-leaves]]
func unblock(d *Doors, name string, argv []string) int {
	next := word(argv, 2)
	if name == "" || next == "" {
		d.warn("branch unblock names the ticket and its successor:")
		d.warn("  ./RUNME.sh branch unblock <ticket> <successor>")
		return codeRefused
	}
	if d.cloud() {
		d.warn("A cloud box hands no question out. Answer it, and carry the branch to done.")
		d.warn("Take the step: ./RUNME.sh ticket pull %s, and write the answer under it.", name)
		return codeRefused
	}
	child := d.noteAt(name)
	if child.Why != "" {
		return d.refuse(child.Why)
	}
	branch := d.here()
	group := strings.TrimPrefix(branch, workBranch)
	if branch == trunk {
		group = asText(child.Front.Get(groupField))
	}
	successor := d.noteAt(next)
	if successor.Why != "" {
		d.warn("%s stands nowhere yet.", next)
		d.warn("Mint it first: ./RUNME.sh mint ticket %s --process=<name>.", ticketAt(next))
		return codeRefused
	}
	if fault := refuses(child, successor, group, next); fault != "" {
		return d.refuse(fault)
	}
	at := leafOf(child.Front, stepOf(child.Text))
	if at == nil {
		return d.refuse(name + " stands at no leaf of its own route.")
	}
	if at.By != byPerson {
		d.warn("%s stands at %s, and a hand can take it.", name, at.Path)
		d.warn("Work it, and run branch unblock on what only a person answers.")
		return codeRefused
	}
	successor.Text = withQuestion(successor.Text, name, at)
	_ = d.write(successor.At, successor.Text)
	child.Text = withField(withField(withField(child.Text, "state", closedState), "reason", "became"), "successors", "["+next+"]")
	if finding := d.landedAlone(note{Name: child.Name, At: child.At, Text: child.Text}, []string{"closes became " + next}, successor.At); finding != "" {
		d.warn("the hook refuses the commit, so nothing lands:")
		d.warn("%s", finding)
		return codeRed
	}
	outside := ""
	if group != "" {
		outside = ", which stands outside " + group
	}
	d.say("%s closes became %s%s.", name, next, outside)
	d.say("%s carries the question %s asks, and waits for a person.", next, at.Path)
	if group != "" {
		d.say("Work what is left of this group, then run ./RUNME.sh branch done.")
	}
	return codeOK
}

// Prints a refusal, and answers the refused code. [[spec/design_output/work#a-person-step-leaves]]
func (d *Doors) refuse(why string) int {
	d.warn("%s", why)
	return codeRefused
}

// A ticket by its name off the disk, or why it stands nowhere. [[spec/design_output/work#a-person-step-leaves]]
func (d *Doors) noteAt(name string) onDisk {
	at := ticketAt(name)
	if !d.exists(at) {
		return onDisk{Why: name + " stands nowhere yet."}
	}
	text := d.read(at)
	return onDisk{Name: name, At: at, Text: text, Front: frontOf(text)}
}

// Why the child and its successor refuse the hand-over, or nothing. [[spec/design_output/work#a-person-step-leaves]]
func refuses(child, successor onDisk, group, next string) string {
	switch {
	case fieldOf(child.Text, "state") != openState:
		return fmt.Sprintf("%s stands %s, so nothing moves.", child.Name, fieldOf(child.Text, "state"))
	case asText(child.Front.Get(groupField)) != group:
		return fmt.Sprintf("%s names no group of %s, so this branch does not hold it.", child.Name, group)
	case fieldOf(successor.Text, "state") != openState:
		return fmt.Sprintf("%s stands %s, and a successor stands open.", next, fieldOf(successor.Text, "state"))
	case group != "" && asText(successor.Front.Get(groupField)) == group:
		return fmt.Sprintf("%s stands in %s, and a successor stands outside the group it frees.", next, group)
	}
	return admits(successor, next)
}

// A successor opens at a step waiting for a person, on the person route. [[spec/design_output/work#a-person-step-leaves]]
func admits(successor onDisk, next string) string {
	path := stepPathOf(successor.Front)
	var opens *leaf
	if path != "" {
		opens = leafOf(successor.Front, path)
	}
	if opens == nil {
		return next + " names no step, and a successor opens at one waiting for a person."
	}
	if opens.By == byPerson {
		if onPersonRoute(successor.Text) {
			return ""
		}
		return next + " stands off the person route, and only work a person alone can do leaves a group. Mint it with --process=" + personRoute + "."
	}
	by := opens.By
	if by == "" {
		by = byAnyone
	}
	return next + " opens at " + opens.Path + " under by: " + by + ", and a successor waits for a person."
}

// The successor with the question written under its Discussion chapter. [[spec/design_output/work#a-person-step-leaves]]
func withQuestion(text, from string, at *leaf) string {
	rows := questionRows(from, at)
	if !strings.Contains(text, discussion) {
		return strings.TrimRight(text, " \t\r\n") + "\n\n" + discussion + "\n\n" + rows + "\n"
	}
	parts := strings.Split(text, discussion)
	tail := strings.TrimRight(emptyChapter.ReplaceAllString(strings.Join(parts[1:], discussion), ""), " \t\r\n")
	if tail != "" {
		tail += "\n"
	} else {
		tail = "\n"
	}
	return parts[0] + discussion + "\n" + tail + rows + "\n"
}

// The question in the shape its author gives it: a line each, and a block of its own where it runs over lines. [[spec/design_output/work#a-person-step-leaves]]
func questionRows(from string, at *leaf) string {
	items := []string{"- [[spec/tickets/" + from + "]] hands this over at `" + at.Path + "`, which waits for a person."}
	var blocks []string
	for _, one := range asked(at.Asks) {
		if strings.Contains(one, "\n") {
			blocks = append(blocks, one)
		} else {
			items = append(items, "  - "+one)
		}
	}
	return strings.Join(append([]string{strings.Join(items, "\n")}, blocks...), "\n\n")
}

// The questions a leaf asks, cut at a semicolon whitespace follows, an escaped line end read as one. [[spec/design_output/work#a-person-step-leaves]]
func asked(asks string) []string {
	var out []string
	for _, one := range askCut.Split(escapedLine.ReplaceAllString(asks, "\n"), -1) {
		if one = strings.TrimSpace(one); one != "" {
			out = append(out, one)
		}
	}
	return out
}
