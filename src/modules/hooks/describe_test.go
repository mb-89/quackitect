// The door's answer to a tool describe: the verb line on Bash, off the tools
// the store lists, and one case table the JavaScript verb line writes.
// [[spec/tickets/describe-answers-off-the-door]]
package hooks

import (
	"encoding/json"
	"os"
	"strings"
	"testing"

	"quackitect/src/q"
	"quackitect/src/q/qtest"
	"quackitect/src/q/tool"
)

// The case table the JavaScript verb line writes, and the event a describe posts. [[spec/tickets/describe-answers-off-the-door]]
const (
	verbLineCases = cageLogs + "/verb-line-cases.json"
	describePost  = "tool.describe"
	describeName  = "description"
)

type verbLineRow struct {
	Name  string   `json:"name"`
	Tools []string `json:"tools"`
	Line  string   `json:"line"`
}

// [[spec/tickets/describe-answers-off-the-door]]
func verbLineRowsOf(t *testing.T) []verbLineRow {
	t.Helper()
	body, err := os.ReadFile(verbLineCases)
	if err != nil {
		t.Fatal(err)
	}
	var table struct {
		Cases []verbLineRow `json:"cases"`
	}
	if err := json.Unmarshal(body, &table); err != nil {
		t.Fatal(err)
	}
	if len(table.Cases) == 0 {
		t.Fatalf("no case stands in %s", verbLineCases)
	}
	return table.Cases
}

// A door over a store holding one action a tool name the row lists. [[spec/tickets/describe-answers-off-the-door]]
func describeDoor(t *testing.T, tools []string) *Door {
	t.Helper()
	var events q.Writer
	ix := qtest.New(t, func(cat *q.Catalog) {
		events = Registers(cat)
		q.OutIn(cat, q.ResolvedName, q.Resolved{}, q.Doc("the config values, as the case seeds them"))
		for _, name := range tools {
			action := strings.Replace(strings.TrimPrefix(name, tool.Prefix), "_", "/", 1)
			q.ActionIn(cat, action, func(struct{}) []q.Request { return nil }, q.Doc("stands for "+name))
		}
	})
	return New(Outside{
		Store: ix.Store(), As: events, Bound: func(local string) string { return local },
		Clock: qtest.NewFake(fixed), Root: treeOf(t, nil, ""),
		Config: func(string) Settings { return Settings{Words: nameWords} },
	})
}

// The after effect the describe answers under the description's name. [[spec/tickets/describe-answers-off-the-door]]
func describedBy(said Answer) (string, bool) {
	for _, one := range said.Effects {
		if one.Kind == afterKind && one.Name == describeName {
			return one.Text, true
		}
	}
	return "", false
}

// A describe of Bash answers the line the JavaScript writes over the same tools. [[spec/tickets/describe-answers-off-the-door]]
func TestADescribeOfBashAnswersTheVerbLine(t *testing.T) {
	for _, one := range verbLineRowsOf(t) {
		t.Run(one.Name, func(t *testing.T) {
			said := hooks(t, describeDoor(t, one.Tools), Post{Event: describePost, E: map[string]any{"tool": "Bash", "session_id": "s1"}})
			if line, ok := describedBy(said); !ok || line != one.Line {
				t.Fatalf("a describe of Bash answers %+v, and wants the description\n%s", said.Effects, one.Line)
			}
		})
	}
}

// A describe of any tool past Bash answers no description. [[spec/tickets/describe-answers-off-the-door]]
func TestADescribeOfAnotherToolPasses(t *testing.T) {
	said := hooks(t, describeDoor(t, verbLineRowsOf(t)[0].Tools), Post{Event: describePost, E: map[string]any{"tool": "Read", "session_id": "s1"}})
	if _, ok := describedBy(said); ok {
		t.Fatalf("a describe of Read answers %+v, and wants no description", said.Effects)
	}
}
