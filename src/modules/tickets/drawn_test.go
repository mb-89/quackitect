// The drawing of a ticket: its graph, its route, and each leaf's fields with
// the line a mark stands at and whether the chapter fills it.
// [[spec/tickets/the-lens-reads-v1]]
package tickets

import (
	"embed"
	"encoding/json"
	"reflect"
	"strings"
	"testing"

	"quackitect/src/q"
	"quackitect/src/q/qtest"
)

//go:embed testdata/drawn-one.md testdata/drawn-two.md
var drawnData embed.FS

// The family the drawing stands under, by its local name, and the folder a fixture seeds into. [[spec/tickets/the-lens-reads-v1]]
const (
	drawnFamily = "drawn/<path...>"
	drawnSeeded = "spec/tickets/"
)

var drawnFixtures = []string{"drawn-one.md", "drawn-two.md"}

type drawnField struct {
	Name   string   `json:"name"`
	Form   string   `json:"form"`
	Says   string   `json:"says"`
	Items  []string `json:"items"`
	Line   int      `json:"line"`
	Filled bool     `json:"filled"`
}

type drawnLeaf struct {
	Does   string       `json:"does"`
	Fields []drawnField `json:"fields"`
}

func fixture(t *testing.T, name string) string {
	t.Helper()
	body, err := drawnData.ReadFile("testdata/" + name)
	if err != nil {
		t.Fatal(err)
	}
	return string(body)
}

// The JSON form of every fixture's drawing, keyed by the path it seeds at. [[spec/tickets/the-lens-reads-v1]]
func drawnOver(t *testing.T) map[string]json.RawMessage {
	t.Helper()
	index := qtest.New(t, func(c *q.Catalog) { withTips(c) })
	files := map[string]any{}
	for _, name := range drawnFixtures {
		files["files/"+drawnSeeded+name] = q.Content{Hash: name, Text: fixture(t, name)}
	}
	index.Seed(files)
	out := map[string]json.RawMessage{}
	for _, name := range drawnFixtures {
		path := drawnSeeded + name
		read := "drawn/" + path
		if err := index.Store().Run(read); err != nil {
			t.Fatalf("%s runs to %v, where it answers the drawing", read, err)
		}
		body, err := json.Marshal(index.Read(read))
		if err != nil {
			t.Fatal(err)
		}
		out[path] = body
	}
	return out
}

// A leaf's fields run in route order with checked last, each at the line of its heading or its leaf's, and filled where the chapter holds a line under it. [[spec/tickets/the-lens-reads-v1]]
func TestDrawnMarksTheOpenFields(t *testing.T) {
	path := drawnSeeded + "drawn-one.md"
	var drawn struct {
		Leaves map[string]drawnLeaf `json:"leaves"`
	}
	body := drawnOver(t)[path]
	if err := json.Unmarshal(body, &drawn); err != nil {
		t.Fatalf("drawn/%s reads %s: %v", path, body, err)
	}
	leaf, ok := drawn.Leaves["design/draft"]
	if !ok || leaf.Does != "writes the approach the ask calls for" || len(leaf.Fields) != 3 {
		t.Fatalf("drawn/%s draws design/draft as %+v, and wants its does and three fields", path, leaf)
	}
	lines := strings.Split(fixture(t, "drawn-one.md"), "\n")
	heading := func(text string) int {
		for at, one := range lines {
			if one == text {
				return at + 1
			}
		}
		return 0
	}
	want := []drawnField{
		{Name: "approach", Form: "text", Says: "the approach here where it takes minutes", Items: []string{}, Line: heading("### approach"), Filled: true},
		{Name: "tests", Form: "list", Says: "every test the change adds, one a line", Items: []string{}, Line: heading("### tests"), Filled: false},
		{Name: "checked", Form: "checklist", Says: "", Items: []string{"every file the approach names stands opened", "the callers list names every caller"}, Line: heading("## draft"), Filled: false},
	}
	if !reflect.DeepEqual(leaf.Fields, want) {
		t.Fatalf("design/draft draws the fields %+v, and wants %+v", leaf.Fields, want)
	}
}

// The drawing reads a file and writes none, so its codec refuses a write. [[spec/tickets/the-lens-reads-v1]]
func TestDrawnRefusesAWrite(t *testing.T) {
	c := q.New()
	withTips(c)
	for _, one := range c.Projections() {
		if one.Name != drawnFamily {
			continue
		}
		if one.Kind != q.Loaded {
			t.Fatalf("%s projects as %s, and wants loaded", drawnFamily, one.Kind)
		}
		if out, err := one.RoundTrip([]byte(fixture(t, "drawn-one.md"))); err == nil {
			t.Fatalf("%s over %s writes %q, and wants a refusal", drawnFamily, one.Glob, out)
		}
		return
	}
	t.Fatalf("the catalog projects no %s", drawnFamily)
}
