// examples/rows reads each example with its chapter and its last verdict, and
// examples/run asks the node module for the run verb.
// [[spec/design_output/examples#the-tutorial-tab]]
package examples

import (
	"encoding/json"
	"reflect"
	"testing"

	"quackitect/src/q"
	"quackitect/src/q/qtest"
)

const (
	pullText = "---\nkind: [[example]]\ntitle: A pull hands out a leaf\nkeywords: [pull]\ninterface: [ticket pull]\n---\n\nA box pulls.\n\n```sh\n./RUNME.sh ticket pull\n# expect: exit 0\n```\n"
	edgeText = "---\nkind: [[example]]\ntitle: A pull past the queue waits\nkeywords: [pull]\ninterface: [ticket pull]\nedge: the queue stands empty\n---\n\nA box pulls past the queue.\n\n```sh\n./RUNME.sh ticket pull\n# expect: says \"wait\"\n```\n"
)

func TestTheRowsReadEachExampleWithItsChapterAndVerdict(t *testing.T) {
	index := qtest.New(t, func(c *q.Catalog) { Registers(c) })
	index.Seed(map[string]any{
		"files/spec/examples/910_dev_pull/edge.md": q.Content{Hash: "e", Text: edgeText},
		"files/spec/examples/110_tickets/pull.md":  q.Content{Hash: "p", Text: pullText},
		"files/spec/tickets/one.md":                q.Content{Hash: "o", Text: "---\nkind: [[ticket]]\n---\n"},
		"files/.se/.runtime/examples.json": q.Content{Hash: "v", Text: `{"spec/examples/110_tickets/pull.md":{"verdict":"fail","miss":"a miss"}}`}, // .claude/skills/level0/lib/folders.js owns the runtime folder, and the harness writes the verdicts there.
	})
	if err := index.Store().Run(RowsName); err != nil {
		t.Fatalf("%s runs nowhere: %v", RowsName, err)
	}
	form, _ := json.Marshal(index.Read(RowsName))
	var rows []Row
	_ = json.Unmarshal(form, &rows)
	if len(rows) != 2 {
		t.Fatalf("%s reads %s, and wants the two examples alone", RowsName, form)
	}
	pull, edge := rows[0], rows[1]
	if pull.Path != "spec/examples/110_tickets/pull.md" || pull.Chapter != "110_tickets" || pull.Dev || pull.Title != "A pull hands out a leaf" || pull.Verdict != "fail" || pull.Miss != "a miss" || pull.Body != pullText {
		t.Fatalf("the user example reads %+v", pull)
	}
	if edge.Chapter != "910_dev_pull" || !edge.Dev || edge.Verdict != "" || !reflect.DeepEqual(edge.Interface, []string{"ticket pull"}) {
		t.Fatalf("the developer case reads %+v, and wants no verdict before its first run", edge)
	}
}

func TestRunAsksTheNodeModuleForTheExampleRun(t *testing.T) {
	index := qtest.New(t, func(c *q.Catalog) { Registers(c) })
	body, _ := json.Marshal(RunIn{Path: "spec/examples/110_tickets/pull.md"})
	input, err := index.Store().Input(RunName, body)
	if err != nil {
		t.Fatalf("%s takes %s to %v", RunName, body, err)
	}
	asked, err := index.Store().Act(RunName, input)
	if err != nil || len(asked) != 1 {
		t.Fatalf("%s lists %+v, %v, and wants one run", RunName, asked, err)
	}
	args, _ := json.Marshal(asked[0].Args)
	if asked[0].Module != "node" || asked[0].Verb != "run" || string(args) != `["example","run","spec/examples/110_tickets/pull.md"]` || asked[0].NoUndo == "" {
		t.Fatalf("%s lists %s %s %s, and wants node run of the example run verb", RunName, asked[0].Module, asked[0].Verb, args)
	}
}
