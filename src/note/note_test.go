// The note reader: the front, the chapters, and the section a step opens on.
// [[spec/tickets/the-lens-reads-v1]]
package note

import (
	"encoding/json"
	"os"
	"reflect"
	"slices"
	"testing"

	"quackitect/src/yaml"
)

// [[spec/tickets/schema-libs-leave]]
const frontsGolden = "testdata/fronts.golden.json"

// [[spec/tickets/schema-libs-leave]]
type goldenFront struct {
	Name  string          `json:"name"`
	Text  string          `json:"text"`
	Front json.RawMessage `json:"front"`
}

const sample = "---\nkind: ticket\nstep: design/draft\n---\n\n# design\n\n## draft\n\n```\n# fenced\n```\n\n### approach\n\ntext\n\n# draft\n"

// A heading inside a fence names no chapter, and every other heading keeps its level and line. [[spec/tickets/the-lens-reads-v1]]
func TestAFenceParksItsHeadings(t *testing.T) {
	read := Read(sample)
	if !read.Front.Stands || read.Front.Said.Get("step") != "design/draft" {
		t.Fatalf("the front reads %+v", read.Front)
	}
	want := []Section{{Header: "design", Level: 1, Line: 6}, {Header: "draft", Level: 2, Line: 8}, {Header: "approach", Level: 3, Line: 14}, {Header: "draft", Level: 1, Line: 18}}
	if len(read.Sections) != len(want) {
		t.Fatalf("the note reads %d chapters, and wants %d", len(read.Sections), len(want))
	}
	for at, one := range want {
		got := read.Sections[at]
		if got.Header != one.Header || got.Level != one.Level || got.Line != one.Line {
			t.Fatalf("chapter %d reads %+v, and wants %+v", at, got, one)
		}
	}
}

// A step's section stands one level a step deep under its parent's, and a missing step answers -1. [[spec/tickets/the-lens-reads-v1]]
func TestSectionAtWalksOneLevelAStep(t *testing.T) {
	sections := Read(sample).Sections
	if at := SectionAt(sections, "design/draft"); at != 1 {
		t.Fatalf("design/draft opens at %d, and wants 1", at)
	}
	if at := SectionAt(sections, "draft"); at != 3 {
		t.Fatalf("draft opens at %d, and wants the top chapter at 3", at)
	}
	if at := SectionAt(sections, "design/review"); at != -1 {
		t.Fatalf("design/review opens at %d, and wants -1", at)
	}
}

// [[spec/design_output/schema#a-line-per-nested-key]]
func TestTheFrontHoldsTheLineOfEveryNestedKey(t *testing.T) {
	front := Read("---\nkind: ticket\nsteps:\n  - name: do\n    evidence:\n      - name: lint\n        form: command\n---\n").Front
	want := map[string]int{"kind": 2, "steps": 3, "steps[0]": 4, "steps[0].name": 4, "steps[0].evidence": 5, "steps[0].evidence[0]": 6, "steps[0].evidence[0].name": 6, "steps[0].evidence[0].form": 7}
	if !reflect.DeepEqual(front.Lines, want) {
		t.Errorf("the front lines read %v, and want %v", front.Lines, want)
	}
	if !slices.Equal(front.LineKeys, []string{"kind", "steps"}) {
		t.Errorf("the line keys read %v, and want the top keys alone", front.LineKeys)
	}
	spaced := Read("---\nkind: ticket\n\nsteps:\n  - name: do\n---\n").Front
	if got := spaced.Lines["steps[0].name"]; got != 5 || spaced.Lines["steps"] != 4 {
		t.Errorf("a front with a blank row reads %v, and wants steps at 4 and steps[0].name at 5", spaced.Lines)
	}
}

// [[spec/tickets/schema-libs-leave]]
func TestEveryFrontGoldenMatchesTheReader(t *testing.T) {
	body, err := os.ReadFile(frontsGolden)
	if err != nil {
		t.Fatalf("%s reads %v, and wants the entries go test ./src/quack -run TestTheFrontGoldenReadsEveryTextAgain -update writes", frontsGolden, err)
	}
	var entries []goldenFront
	if err := json.Unmarshal(body, &entries); err != nil || len(entries) == 0 {
		t.Fatalf("%s holds %d entries (%v), and wants one a seeded text", frontsGolden, len(entries), err)
	}
	for _, one := range entries {
		got, _ := json.Marshal(FrontOf(yaml.SplitLines(one.Text)).Said)
		var left, right any
		if json.Unmarshal(got, &left) != nil || json.Unmarshal(one.Front, &right) != nil || !reflect.DeepEqual(left, right) {
			t.Errorf("%s reads the front %s, and the golden holds %s", one.Name, got, one.Front)
		}
	}
}
