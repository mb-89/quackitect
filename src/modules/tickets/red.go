// The tests a ticket lists as red: a ticket past tests-red and short of
// tests-green names the files it expects to fail, and the check leaves them
// out until tests-green closes.
// [[spec/design_output/pull#the-gate]]
package tickets

import (
	"regexp"
	"slices"
	"strings"

	"quackitect/src/note"
	"quackitect/src/yaml"
)

// The leaves the red list reads, and the field it reads under them. [[spec/design_output/pull#the-gate]]
const (
	redLeaf   = "tests-red"
	greenLeaf = "tests-green"
	redField  = "red"
)

// A reject inserts a round of its own, as tests-red-2, and its list stands red as the first round's does. [[spec/tickets/red-list-reads-inserted-leaves]]
var redRound = regexp.MustCompile(`^tests-red(-\d+)?$`)

var listMark = regexp.MustCompile(`^[-*]\s+`)

// The files one ticket names red, sorted, and none where it stands closed, short of tests-red, or past tests-green. [[spec/design_output/pull#the-gate]]
func RedList(text string) []string {
	front := note.Read(text).Front.Said
	if front == nil || strings.TrimSpace(yaml.AsString(front.Get("state"))) == closedState {
		return nil
	}
	passed := map[string]bool{}
	for _, item := range yaml.AsList(front.Get("record")) {
		if one := yaml.AsDoc(item); one != nil && !yaml.Truthy(one.Get("skipped")) {
			step := yaml.AsString(one.Get("step"))
			passed[step[strings.LastIndex(step, "/")+1:]] = true
		}
	}
	if !passed[redLeaf] || passed[greenLeaf] {
		return nil
	}
	out := []string{}
	for _, one := range entriesIn(front.Get("steps"), "", nil) {
		if one.leaf && redRound.MatchString(one.name) {
			out = append(out, RedRows(text, one.path)...)
		}
	}
	slices.Sort(out)
	return slices.Compact(out)
}

// The files one leaf names under its red field, each row a path, and the case a row names after its path read as the path alone. A row a list payload wrote before formatted took arrays holds its paths joined by commas. [[spec/tickets/check-skips-named-red-tests]] [[spec/design_output/pull#kept-red-leaves]]
func RedRows(text, path string) []string {
	out := []string{}
	for _, row := range chapterFields(note.Read(text).Sections, path)[redField] {
		for _, one := range strings.Split(listMark.ReplaceAllString(row, ""), ",") {
			if words := strings.Fields(strings.ReplaceAll(one, "`", "")); len(words) > 0 {
				out = append(out, words[0])
			}
		}
	}
	return out
}
