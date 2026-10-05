// The tickets the tree holds, public and private, and the reads of one
// ticket's front every verb shares, off src/engine/group.js and the reads
// in src/scripts/pull-hand.js.
// [[spec/design_output/work#a-group-is-a-ticket]]
package pull

import (
	"strings"

	"quackitect/src/note"
	"quackitect/src/yaml"
)

// The folders tickets stand in, the end each carries, and the words a front holds. [[spec/design_output/work#a-group-is-a-ticket]]
const (
	Tickets    = "spec/tickets"
	Notes      = ".se/tickets"
	noteEnd    = ".md"
	GroupField = "group"
	groupName  = "group"
	Open       = "open"
	Closed     = "closed"
	Draft      = "draft"
	WorkBranch = "work/"
)

// One ticket as the tree holds it. [[spec/design_output/work#a-group-is-a-ticket]]
type Held struct {
	Name, Path, Text string
	Front            *yaml.Doc
	Private          bool
	// What the ticket held before a payload rode in, and the payload, which a refusal past its cap puts back. [[spec/design_output/pull#the-hand-back-refused]]
	Stood, Payload string
}

// Every ticket under the public folder, then every note under the private one. [[spec/design_output/work#a-group-is-a-ticket]]
func TicketsHere(disk Disk) []Held {
	out := []Held{}
	for _, folder := range []string{Tickets, Notes} {
		for _, one := range disk.Files(folder) {
			if !strings.HasSuffix(one, noteEnd) {
				continue
			}
			text, _ := disk.Read(folder + "/" + one)
			out = append(out, Held{
				Name: strings.TrimSuffix(one, noteEnd), Path: folder + "/" + one, Text: text,
				Front: FrontOf(text), Private: folder == Notes,
			})
		}
	}
	return out
}

// The front a note carries, empty where it carries none. [[spec/design_output/work#a-group-is-a-ticket]]
func FrontOf(text string) *yaml.Doc { return note.Read(text).Front.Said }

// One field of the front as a word, with the brackets of a link taken off. [[spec/design_output/work#a-group-is-a-ticket]]
func FieldOf(text, key string) string { return Bare(yaml.AsString(FrontOf(text).Get(key))) }

// A word with the brackets of a link taken off. [[spec/design_output/work#a-group-is-a-ticket]]
func Bare(said string) string {
	said = strings.TrimSpace(said)
	said = strings.TrimSuffix(strings.TrimPrefix(said, "[["), "]]")
	return strings.TrimSpace(said)
}

// The mint links the process by its path, and a hand by its name. [[spec/design_output/work#a-group-is-a-ticket]]
func IsGroup(text string) bool {
	process := FieldOf(text, "process")
	return text != "" && process[strings.LastIndex(process, "/")+1:] == groupName
}

// The public tickets under the group, its groups' children among them. [[spec/design_output/pull#children-before-their-group]]
func ChildrenOf(all []Held, group string) []Held {
	names := map[string]bool{group: true}
	for grew := true; grew; {
		grew = false
		for _, one := range all {
			if one.Private || names[one.Name] {
				continue
			}
			if names[FieldOf(one.Text, GroupField)] {
				names[one.Name] = true
				grew = true
			}
		}
	}
	delete(names, group)
	out := []Held{}
	for _, one := range all {
		if names[one.Name] {
			out = append(out, one)
		}
	}
	return out
}

// Why a group no ticket names stands refused, or nothing. [[spec/design_output/work#a-group-is-a-ticket]]
func EmptyGroup(disk Disk, text, name string) string {
	if !IsGroup(text) || len(ChildrenOf(TicketsHere(disk), name)) > 0 {
		return ""
	}
	return name + " is a group, and no ticket names it under group. Mint a child naming " + name + " under group first, then the group."
}

// Why a ticket naming a closed group stands refused, or nothing. [[spec/design_output/pull#a-closed-group-hands-nothing]]
func ClosedGroup(disk Disk, text string) string {
	return ""
}

// A ticket a box mints on its branch joins the group the box works, unless it is that group, names one already, or runs a person's process. [[spec/tickets/a-box-keeps-its-tickets]]
func JoinsGroup(group, process, branch, name string) string {
	if group != "" || !strings.HasPrefix(branch, WorkBranch) {
		return group
	}
	works := strings.TrimPrefix(branch, WorkBranch)
	bare := Bare(process)
	if works == name || bare == personWord || strings.HasSuffix(bare, "/"+personWord) {
		return ""
	}
	return works
}

// The role a person's hand and a person's process both carry. [[spec/design_output/pull#the-hand-rule]]
const personWord = "person"
