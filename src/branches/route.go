// The route a ticket walks and who takes which leaf, the pieces of the pull the
// branch verbs read: the walk, the leaf and what it inherits, the conditions,
// the hand rule, and whether a hand here takes a ticket at all.
// [[spec/design_output/pull#what-a-hand-out-reads]]
package branches

import (
	"bytes"
	"encoding/json"
	"fmt"
	"math/bits"
	"regexp"
	"slices"
	"strings"
	"unicode/utf16"

	"quackitect/src/yaml"
)

// The words a leaf's by and a condition read. [[spec/design_output/pull#the-hand-rule]]
const (
	byAnyone   = "anyone"
	byPerson   = "person"
	byAgent    = "agent"
	byHelper   = "helper"
	byChildren = "children"
	byRetro    = "retro"
	// The view the owner reads the change in, where the ask comes from, and the word saying it comes off nothing. [[spec/tickets/the-owner-view-decides-done]]
	askView     = "view"
	askFrom     = "from"
	handover    = "handover"
	askNone     = "none"
	retroStep   = "retro"
	backlogWhen = "backlog"
)

// The verbs a step's needs name, which this box holds. The branch verbs read the table this package answers. [[spec/design_output/pull#a-need-is-a-verb]]
var needVerbs = map[string][]string{
	"ticket": {"pull", "note", "update", "open"},
	"retro":  {"notes", "audit", "collect", "new", "timeline", "chapters", "matrix", "read", "effect", "classes", "mint"},
}

// One step of a route as the walk reads it. [[spec/design_input/the-agent-pulls-tickets#the-route]]
type entry struct {
	Name, Path, Parent, At string
	Said                   *yaml.Doc
	Leaf                   bool
}

// Every step of a route, depth first, each with its path. [[spec/design_output/schema#keywords-that-name-a-step]]
func walkOf(doc *yaml.Doc) []entry {
	if doc == nil {
		return nil
	}
	return entriesIn(doc.Get("steps"), "steps", "", nil)
}

// The walk under one list of steps. [[spec/design_output/schema#keywords-that-name-a-step]]
func entriesIn(list any, base, parent string, out []entry) []entry {
	for at, item := range yaml.AsList(list) {
		one := yaml.AsDoc(item)
		if one == nil {
			continue
		}
		name := yaml.AsString(one.Get("name"))
		path := name
		if parent != "" {
			path = parent + "/" + name
		}
		where := fmt.Sprintf("%s[%d]", base, at)
		var under []any
		for _, step := range yaml.AsList(one.Get("steps")) {
			if yaml.AsDoc(step) != nil {
				under = append(under, step)
			}
		}
		out = append(out, entry{Name: name, Path: path, Parent: parent, At: where, Said: one, Leaf: len(under) == 0})
		if len(under) > 0 {
			out = entriesIn(one.Get("steps"), where+".steps", path, out)
		}
	}
	return out
}

// The leaves of a route alone. [[spec/design_input/the-agent-pulls-tickets#the-route]]
func leavesOf(doc *yaml.Doc) []entry {
	var out []entry
	for _, one := range walkOf(doc) {
		if one.Leaf {
			out = append(out, one)
		}
	}
	return out
}

// The step a ticket stands at: its step field, or the first leaf of its route. [[spec/design_output/pull#what-a-hand-out-reads]]
func stepPathOf(doc *yaml.Doc) string {
	if said := strings.TrimSpace(yaml.AsString(doc.Get("step"))); said != "" {
		return said
	}
	if leaves := leavesOf(doc); len(leaves) > 0 {
		return leaves[0].Path
	}
	return ""
}

// A leaf with what it inherits from the steps above it. [[spec/design_input/the-agent-pulls-tickets#the-route]]
type leaf struct {
	entry
	By, Not, OnFail, When, Gate, Asks string
	Final                             bool
	Needs                             []string
	At                                int
	Walk, Leaves                      []entry
}

// The leaf at a path, or nil where the route holds none there. [[spec/design_input/the-agent-pulls-tickets#the-route]]
func leafOf(doc *yaml.Doc, path string) *leaf {
	walk := walkOf(doc)
	at := slices.IndexFunc(walk, func(one entry) bool { return one.Path == path && one.Leaf })
	if at < 0 {
		return nil
	}
	found := walk[at]
	parts := strings.Split(found.Path, "/")
	var chain []entry
	for i := 1; i < len(parts); i++ {
		above := strings.Join(parts[:i], "/")
		if up := slices.IndexFunc(walk, func(one entry) bool { return one.Path == above }); up >= 0 {
			chain = append(chain, walk[up])
		}
	}
	chain = append(chain, found)
	nearest := func(key string) (string, bool) {
		for i := len(chain) - 1; i >= 0; i-- {
			if chain[i].Said.Has(key) {
				return yaml.AsString(chain[i].Said.Get(key)), true
			}
		}
		return "", false
	}
	var needs []string
	for _, one := range chain {
		for _, need := range yaml.StringsOf(one.Said.Get("needs")) {
			if need = strings.TrimSpace(need); need != "" {
				needs = append(needs, need)
			}
		}
	}
	by, said := nearest("by")
	if !said {
		by = byAnyone
	}
	not, _ := nearest("not")
	onFail, _ := nearest("on_fail")
	leaves := leavesOf(doc)
	return &leaf{
		entry:  found,
		By:     by,
		Not:    not,
		OnFail: onFail,
		When:   yaml.AsString(found.Said.Get("when")),
		Gate:   yaml.AsString(found.Said.Get("gate")),
		Final:  yaml.AsString(found.Said.Get("final")) == "true",
		Asks:   yaml.AsString(found.Said.Get("asks")),
		Needs:  needs,
		At:     slices.IndexFunc(leaves, func(one entry) bool { return one.Path == path }),
		Walk:   walk,
		Leaves: leaves,
	}
}

// Whether a need names a verb this box holds. [[spec/design_output/pull#a-need-is-a-verb]]
func holdsVerb(need string) bool {
	words := strings.Fields(need)
	if len(words) == 0 {
		return false
	}
	subs, ok := needVerbs[words[0]]
	if words[0] == "branch" || words[0] == "work" {
		subs, ok = verbNames(), true
	}
	if !ok {
		return false
	}
	return len(words) == 1 || slices.Contains(subs, words[1])
}

// Whether a leaf's condition holds on this box, and why not where it fails. [[spec/design_output/pull#a-condition-skips-a-leaf]]
func holdsHere(cloud bool, when, text string) (bool, string) {
	switch when {
	case "":
		return true, ""
	case "cloud":
		return cloud, "the box runs off the cloud"
	case "desk":
		return !cloud, "the box runs on the cloud"
	case askView:
		return askLine(text, askView) != "", "the ask names no view the owner reads"
	case "handed":
		return strings.ToLower(askLine(text, askFrom)) == handover, "the ask comes off no handover"
	case backlogWhen:
		return groupLine(text) == "", "the delivery's acceptance reads this ticket"
	}
	return false, when + " names no condition the pull reads"
}

var otherHeading = regexp.MustCompile(`(?m)^# `)

var askHeading = regexp.MustCompile(`(?m)^# Ask\s*$`)

// The value of a name: line under the Ask heading, or nothing where it stands elsewhere or says none. [[spec/tickets/the-owners-words-travel-verbatim]]
func askLine(text, name string) string {
	ask := text
	for _, at := range otherHeading.FindAllStringIndex(text, -1) {
		if !askHeading.MatchString(text[at[0]:lineEnd(text, at[0])]) {
			ask = text[:at[0]]
			break
		}
	}
	loc := askHeading.FindStringIndex(ask)
	if loc == nil {
		return ""
	}
	found := regexp.MustCompile(`(?im)^` + regexp.QuoteMeta(name) + `:[ \t]*(.*)$`).FindStringSubmatch(ask[loc[0]:])
	if found == nil {
		return ""
	}
	said := strings.TrimSpace(found[1])
	if strings.ToLower(said) == askNone {
		return ""
	}
	return said
}

// Where the line holding an offset ends. [[spec/tickets/the-owners-words-travel-verbatim]]
func lineEnd(text string, at int) int {
	if ends := strings.IndexByte(text[at:], '\n'); ends >= 0 {
		return at + ends
	}
	return len(text)
}

var groupRow = regexp.MustCompile(`(?m)^group:[ \t]*(\S.*)$`)

var fenceRow = regexp.MustCompile(`(?m)^---\s*$`)

// The parts two fences cut a note into: before, the front, and the rest. [[spec/design_output/pull#the-final-acceptance]]
const fenceCuts = 3

// The group the front names off its raw rows, or nothing. [[spec/design_output/pull#the-final-acceptance]]
func groupLine(text string) string {
	parts := fenceRow.Split(text, fenceCuts)
	if len(parts) < 2 {
		return ""
	}
	if found := groupRow.FindStringSubmatch(parts[1]); found != nil {
		return strings.TrimSpace(found[1])
	}
	return ""
}

// What a hand is, as the one answer reads it. [[spec/tickets/the-one-answer-takes-shape]]
type handRule struct {
	Helper, Agent, OwnerSays, Cloud, AtRetro bool
}

// Whether a hand works a leaf, and why not. [[spec/tickets/the-one-answer-takes-shape]]
func writesHere(one *leaf, hand handRule) (bool, string) {
	at := one.Path
	switch {
	case one.By == byPerson && hand.Agent && !hand.OwnerSays && !hand.Cloud:
		return false, "waits for a person at " + at
	case one.By == byAgent && !hand.Agent:
		return false, "waits for an agent at " + at
	case one.By == byHelper && !hand.Helper:
		return false, "waits for a hand the engine spawns at " + at
	case one.By == byChildren:
		return false, "waits for its own children at " + at
	case one.By == byRetro && !hand.AtRetro:
		return false, "waits for a hand at a retro step, at " + at
	}
	return true, ""
}

// The hand rule over this box: a harness, a cloud, and whether the group stands at its retro. [[spec/design_output/pull#the-hand-rule]]
func (d *Doors) handRule(doc *yaml.Doc, all []named, group string) handRule {
	return handRule{
		Helper:  d.agent(),
		Agent:   d.agent(),
		Cloud:   d.cloud(),
		AtRetro: todoOf(doc) != "" || atRetro(all, group),
	}
}

// Whether the group stands at its retro. [[spec/design_output/pull#the-hand-rule]]
func atRetro(all []named, group string) bool {
	for _, one := range all {
		if one.Name == group {
			return strings.HasPrefix(yaml.AsString(frontOf(one.Text).Get("step")), retroStep)
		}
	}
	return false
}

// The step a hand here takes on a ticket, or nothing where it waits or no hand here takes it. [[spec/design_output/pull#done-leaves-no-takeable-step]]
func (d *Doors) takeable(one named, all []named, group string) string {
	doc := frontOf(one.Text)
	if yaml.AsString(doc.Get("state")) != openState && !agentOpens(one.Text) {
		return ""
	}
	for _, dep := range dependsOn(doc) {
		if !d.closedHere(all, dep) {
			return ""
		}
	}
	at := leafOf(doc, stepPathOf(doc))
	if at == nil || (at.Final && acceptWaits(one, all) != "") || blessWait(one, at) != "" {
		return ""
	}
	if writes, _ := writesHere(at, d.handRule(doc, all, group)); !writes {
		return ""
	}
	if slices.ContainsFunc(at.Needs, func(need string) bool { return !holdsVerb(need) }) {
		return ""
	}
	return at.Path
}

// Whether a dependency stands closed, here or on trunk, and closed where it stands nowhere. [[spec/design_output/pull#children-before-their-group]]
func (d *Doors) closedHere(all []named, dep string) bool {
	for _, one := range all {
		if one.Name == dep {
			return fieldOf(one.Text, "state") == closedState
		}
	}
	said := d.textAt("origin/"+trunk, ticketsFolder+"/"+dep+noteEnd)
	if said == "" {
		return true
	}
	return fieldOf(said, "state") == closedState
}

// The open tickets naming this one as parent or group, as a reason to wait. [[spec/design_output/pull#the-final-acceptance]]
func acceptWaits(one named, all []named) string {
	var open []string
	for _, held := range all {
		if held.Name == one.Name || fieldOf(held.Text, "state") == closedState {
			continue
		}
		if fieldOf(held.Text, "parent") == one.Name || fieldOf(held.Text, groupField) == one.Name {
			open = append(open, held.Name)
		}
	}
	if len(open) == 0 {
		return ""
	}
	return "waits for " + strings.Join(open, ", ") + ", which the acceptance reads"
}

// Why a gate waits for its bless, or nothing. [[spec/design_output/pull#the-bless]]
func blessWait(one named, at *leaf) string {
	if !waitsBless(one.Text, at) {
		return ""
	}
	return fmt.Sprintf("waits at %s for a bless: ./RUNME.sh ticket bless %s", at.Path, one.Name)
}

// Whether a record item blesses. [[spec/design_output/pull#the-bless]]
func blessedEntry(one *yaml.Doc) bool { return entryField(one, "blessed") != "" }

// Whether a record item is a verdict: no bless, no skip, no return and no open take. [[spec/design_output/pull#the-bless]]
func verdictEntry(one *yaml.Doc) bool {
	return !blessedEntry(one) && !truthy(one.Get("skipped")) && !truthy(one.Get("returns")) &&
		!(truthy(one.Get("hash_before")) && !truthy(one.Get("hash_after")))
}

// The gate holds a verdict as the last word on it, and no bless yet. [[spec/design_output/pull#the-bless]]
func waitsBless(text string, at *leaf) bool {
	if at.Gate == "" || at.Said.Get("bless") != true {
		return false
	}
	var last *yaml.Doc
	for _, one := range recordIn(text) {
		if yaml.AsString(one.Get("step")) == at.Path && !blessedEntry(one) {
			last = one
		}
	}
	return last != nil && verdictEntry(last) && !blessedAt(text, at)
}

// Whether a bless matching what the gate reads now follows its last verdict. [[spec/design_output/pull#the-bless]]
func blessedAt(text string, at *leaf) bool {
	verdict, blessed := -1, -1
	hash := blessHash(text, at)
	mine := 0
	for _, one := range recordIn(text) {
		if yaml.AsString(one.Get("step")) != at.Path {
			continue
		}
		if verdictEntry(one) {
			verdict = mine
		}
		if blessedEntry(one) && entryField(one, "blessed") == hash {
			blessed = mine
		}
		mine++
	}
	return verdict >= 0 && blessed > verdict
}

// The hash over the gate's own chapter and each chapter under its input. [[spec/design_output/pull#the-bless]]
func blessHash(text string, at *leaf) string {
	inputs := yaml.StringsOf(at.Said.Get("input"))
	read := [][2]string{{at.Path, chapterText(text, at.Path)}}
	for _, one := range leavesOf(frontOf(text)) {
		if slices.ContainsFunc(inputs, func(input string) bool { return one.Path == input || strings.HasPrefix(one.Path, input+"/") }) {
			read = append(read, [2]string{one.Path, chapterText(text, one.Path)})
		}
	}
	var said bytes.Buffer
	writes := json.NewEncoder(&said)
	writes.SetEscapeHTML(false)
	_ = writes.Encode(read)
	return hashText(strings.TrimSuffix(said.String(), "\n"))
}

var commentRow = regexp.MustCompile(`^\s*<!--.*-->\s*$`)

// The chapter a step's path opens, its sub-chapters and all, the comments past. [[spec/design_output/pull#an-input-marks-its-steps]]
func chapterText(text, path string) string {
	sections := sectionsOf(text)
	if path == "ask" {
		path = "Ask"
	}
	found := sectionAt(sections, path)
	if found < 0 {
		return ""
	}
	level := sections[found].Level
	var rows []string
	for i := found; i < len(sections); i++ {
		if i > found && sections[i].Level <= level {
			break
		}
		if i > found {
			rows = append(rows, strings.Repeat("#", sections[i].Level)+" "+sections[i].Header)
		}
		for _, row := range sections[i].Own {
			if !commentRow.MatchString(row) {
				rows = append(rows, row)
			}
		}
	}
	return strings.TrimSpace(strings.Join(rows, "\n"))
}

// The section a step's chapter opens on, one heading level a step deep, or -1. [[spec/design_output/schema#what-a-note-reads-as]]
func sectionAt(sections []section, path string) int {
	parts := strings.Split(path, "/")
	from, found := 0, -1
	for depth, part := range parts {
		level := depth + 1
		found = -1
		for i := from; i < len(sections); i++ {
			if sections[i].Level < level && i > from {
				break
			}
			if sections[i].Level == level && sections[i].Header == part {
				found = i
				break
			}
		}
		if found < 0 {
			return -1
		}
		from = found + 1
	}
	return found
}

// The constants of HashText in src/pull/hash.go. [[spec/design_input/the-agent-pulls-tickets#the-drawing-is-a-projection]]
const (
	fnvOffset = 0x811c9dc5
	fnvPrime  = 0x01000193
	mixSeed   = 0x9e3779b9
	mixPrime  = 0x85ebca6b
	mixRotate = 13
)

// The hash hashText answers, over the UTF-16 units JavaScript reads. [[spec/design_input/the-agent-pulls-tickets#the-drawing-is-a-projection]]
func hashText(text string) string {
	low, high := uint32(fnvOffset), uint32(mixSeed)
	for _, code := range utf16.Encode([]rune(text)) {
		low = (low ^ uint32(code)) * fnvPrime
		high = (high + uint32(code) + 1) * mixPrime
		high = bits.RotateLeft32(high, mixRotate)
	}
	return fmt.Sprintf("%08x%08x", low, high)
}
