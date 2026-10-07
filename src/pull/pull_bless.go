// The bless: a gate carrying bless true waits after its verdict, and a bless
// binds to the hash of what it blesses, so an edit strips it, off
// src/scripts/pull-bless.js.
// [[spec/design_output/pull#the-bless]]
package pull

import (
	"encoding/json"
	"fmt"
	"regexp"
	"strings"

	"quackitect/src/yaml"
)

// The owner's word on who blesses, and the prefix naming the desk's own word. [[spec/design_output/pull#the-bless]]
const (
	BlessFile = runtimeFolder + "/bless.json"
	Desk      = "--desk="
)

var entryRow = regexp.MustCompile(`^\s*- `)

// What a door says to an agent reaching the bless file. [[spec/design_output/pull#the-bless]]
func BlessRefusal() string {
	return BlessFile + " is the owner's word on who blesses, and the sidebar button alone writes it. An agent reads and writes it nowhere."
}

// [[spec/design_output/pull#the-bless]]
func asksBless(leaf *Leaf) bool {
	return leaf != nil && leaf.Gate != "" && leaf.Said.Get("bless") == true
}

// The gate's own chapter, then the chapter of each leaf under its input, through the hash the stale read takes. [[spec/design_output/pull#the-bless]]
func blessHash(text string, leaf *Leaf) string {
	inputs := yaml.StringsOf(leaf.Said.Get("input"))
	read := []any{[]any{leaf.Path, chapterText(text, leaf.Path)}}
	for _, one := range WalkOf(FrontOf(text)) {
		if !one.Leaf {
			continue
		}
		for _, input := range inputs {
			if one.Path == input || strings.HasPrefix(one.Path, input+"/") {
				read = append(read, []any{one.Path, chapterText(text, one.Path)})
				break
			}
		}
	}
	return HashText(Canonical(read))
}

func blessedEntry(entry *yaml.Doc) bool {
	return strings.TrimSpace(yaml.AsString(entry.Get("blessed"))) != ""
}

func verdictEntry(entry *yaml.Doc) bool {
	return !blessedEntry(entry) && !yaml.Truthy(entry.Get("skipped")) && !yaml.Truthy(entry.Get("returns")) &&
		!(yaml.AsString(entry.Get("hash_before")) != "" && yaml.AsString(entry.Get("hash_after")) == "")
}

// The record entries a leaf wrote. [[spec/design_output/pull#the-bless]]
func entriesAt(text, path string) []*yaml.Doc {
	out := []*yaml.Doc{}
	for _, entry := range recordIn(text) {
		if yaml.AsString(entry.Get("step")) == path {
			out = append(out, entry)
		}
	}
	return out
}

// Whether a bless matching what the gate reads now follows its last verdict. [[spec/design_output/pull#the-bless]]
func blessedAt(text string, leaf *Leaf) bool {
	mine := entriesAt(text, leaf.Path)
	hash := blessHash(text, leaf)
	verdict, blessed := -1, -1
	for i, entry := range mine {
		if verdictEntry(entry) {
			verdict = i
		}
		if blessedEntry(entry) && strings.TrimSpace(yaml.AsString(entry.Get("blessed"))) == hash {
			blessed = i
		}
	}
	return verdict >= 0 && blessed > verdict
}

// The gate holds a verdict as the last word on it, and no bless yet. [[spec/design_output/pull#the-bless]]
func waitsBless(text string, leaf *Leaf) bool {
	if !asksBless(leaf) {
		return false
	}
	var last *yaml.Doc
	for _, entry := range entriesAt(text, leaf.Path) {
		if !blessedEntry(entry) {
			last = entry
		}
	}
	return last != nil && verdictEntry(last) && !blessedAt(text, leaf)
}

// Every bless whose hash no longer matches what it blesses drops from the record. [[spec/design_output/pull#the-bless]]
func blessKept(text string) string {
	kept := text
	front := FrontOf(text)
	for _, entry := range recordIn(text) {
		if !blessedEntry(entry) {
			continue
		}
		leaf := LeafOf(front, yaml.AsString(entry.Get("step")))
		hash := strings.TrimSpace(yaml.AsString(entry.Get("blessed")))
		if leaf == nil || blessHash(text, leaf) != hash {
			kept = withoutBlessed(kept, hash)
		}
	}
	return kept
}

// The record entry carrying this bless leaves the front matter whole. [[spec/design_output/pull#the-bless]]
func withoutBlessed(text, hash string) string {
	rows := strings.Split(text, "\n")
	at := -1
	for i, row := range rows {
		if strings.TrimSpace(row) == "blessed: "+hash {
			at = i
			break
		}
	}
	if at < 0 {
		return text
	}
	start := at
	for start > 0 && !entryRow.MatchString(rows[start]) {
		start--
	}
	indent := indentOf(rows[start])
	end := at + 1
	for end < len(rows) && indentOf(rows[end]) > indent {
		end++
	}
	return strings.Join(append(rows[:start:start], rows[end:]...), "\n")
}

// Where a row's first word stands, and -1 on a blank row, as search finds it. [[spec/design_output/pull#the-bless]]
func indentOf(row string) int {
	for i, r := range row {
		if r != ' ' && r != '\t' {
			return i
		}
	}
	return -1
}

// A step past a bless gate whose bless fails its hash goes back to the gate. [[spec/design_output/pull#the-bless]]
func (it *It) blessHolds(one *Held) *Held {
	front := FrontOf(one.Text)
	leaves := LeavesOf(front)
	now := 0
	for i, leaf := range leaves {
		if leaf.Path == StepPathOf(front) {
			now = i
			break
		}
	}
	kept := blessKept(one.Text)
	for _, found := range leaves[:now] {
		gate := LeafOf(front, found.Path)
		if !asksBless(gate) {
			continue
		}
		verdict := false
		for _, entry := range entriesAt(kept, gate.Path) {
			verdict = verdict || verdictEntry(entry)
		}
		if !verdict || blessedAt(kept, gate) {
			continue
		}
		one.Text = withField(kept, "step", gate.Path)
		one.Front = FrontOf(one.Text)
		it.landedAlone(one, []string{fmt.Sprintf("waits at %s again, because an edit strips its bless", gate.Path)})
		return one
	}
	return one
}

// The hand-out reads a ticket again before it offers a leaf: the bless, then the inputs and the process. [[spec/design_output/pull#an-input-marks-its-steps]]
func (it *It) readAgain(one *Held) *Held { return it.staleRead(it.blessHolds(one)) }

// Why the hand-out passes a gate waiting for its bless, or nothing. [[spec/design_output/pull#the-bless]]
func blessWait(one *Held, leaf *Leaf) string {
	if waitsBless(one.Text, leaf) {
		return fmt.Sprintf("waits at %s for a bless: ./RUNME.sh ticket bless %s", leaf.Path, one.Name)
	}
	return ""
}

// A person blesses anywhere, an agent on a cloud box, and an agent at a desk where the bless file says so. [[spec/design_output/pull#the-bless]]
func (it *It) mayBless() string {
	if !(it.Agent || AgentOf(it.Env) != "") || it.Cloud {
		return ""
	}
	var said struct {
		Agent bool `json:"agent"`
	}
	if text, ok := it.Disk.Read(BlessFile); ok {
		_ = json.Unmarshal([]byte(text), &said)
	}
	if said.Agent {
		return ""
	}
	return "an agent at a desk blesses where " + BlessFile + " holds agent true, and the sidebar button writes it."
}

// A person writes whether an agent at this desk blesses, and an agent writes it nowhere. [[spec/tickets/the-sidebar-writes-through-actions]]
func (it *It) BlessDesk(word string) int {
	if it.Agent || AgentOf(it.Env) != "" {
		it.Say(Refused, BlessRefusal())
		return 1
	}
	agent := strings.TrimSpace(word) == "true"
	_ = it.Disk.Write(BlessFile, fmt.Sprintf("{\"agent\":%v}\n", agent))
	it.Println(fmt.Sprintf("an agent at this desk blesses: %v", agent))
	return 0
}

// The bless verb: the gate's verdict stands blessed, and the step moves on. [[spec/design_output/pull#the-bless]]
func (it *It) Bless(path, name string) int {
	if path == "" {
		if name == "" {
			name = "nothing"
		}
		it.Say(Refused, name+" names no ticket, so nothing blesses.")
		return 2
	}
	text, _ := it.Disk.Read(path)
	one := &Held{Name: name, Path: path, Text: text, Front: FrontOf(text), Private: strings.HasPrefix(path, Notes+"/")}
	leaf := LeafOf(one.Front, StepPathOf(one.Front))
	if !asksBless(leaf) {
		at := "no step"
		if leaf != nil {
			at = leaf.Path
		}
		it.Say(Refused, fmt.Sprintf("%s stands at %s, which asks no bless.", one.Name, at))
		return 1
	}
	if !waitsBless(one.Text, leaf) {
		it.Say(Refused, fmt.Sprintf("%s at %s holds no verdict to bless yet.", one.Name, leaf.Path))
		return 1
	}
	if refusal := it.mayBless(); refusal != "" {
		it.Say(Refused, refusal)
		return 1
	}
	changes := []string{"blesses " + leaf.Path}
	text = withEntry(one.Text, pair("step", leaf.Path), pair("hand", RoleOf(it.HandOf())), pair("blessed", blessHash(one.Text, leaf)))
	one.Text = it.stepOn(one, leaf, text, &changes, false)
	if finding := it.landedAlone(one, changes); finding != "" {
		it.Say(Refused, finding)
		return 1
	}
	it.Println(fmt.Sprintf("%s %s.", one.Name, strings.Join(changes, ", ")))
	return 0
}
