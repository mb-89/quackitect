// ticket yours reads work/yours off the index and prints what cli.js prints,
// and the node module runs a verb through cli.js under the root.
// [[spec/tickets/ticket-verbs-become-actions]]
package main

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"quackitect/src/index"
	verbsmodule "quackitect/src/modules/verbs"
	"quackitect/src/modules/work"
	"quackitect/src/q"
)

// A door holding work/yours as the case seeds it, and the V1 answering its base. [[spec/tickets/ticket-verbs-become-actions]]
func yoursTree(t *testing.T, rows []work.YoursRow) func() (string, error) {
	t.Helper()
	root := t.TempDir()
	if err := os.MkdirAll(filepath.Join(root, index.Runtime), 0o755); err != nil {
		t.Fatal(err)
	}
	c := q.New()
	hand := q.OutIn(c, "work/yours", []work.YoursRow{}, q.Doc("the rows as the case seeds them"))
	seeds := func(_ string, commit index.Commit) (func(), error) {
		return func() {}, commit(hand, map[string]any{"work/yours": rows})
	}
	stop, _, err := index.Serve(root, filepath.Join(t.TempDir(), "index.db"), c, seeds)
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(stop)
	body, err := os.ReadFile(filepath.Join(root, index.Runtime, "index.json"))
	if err != nil {
		t.Fatal(err)
	}
	var standing index.Standing
	if err := json.Unmarshal(body, &standing); err != nil {
		t.Fatal(err)
	}
	base := fmt.Sprintf("http://127.0.0.1:%d/v1", standing.V1)
	return func() (string, error) { return base, nil }
}

var yoursRows = []work.YoursRow{
	{Ticket: "a-draft", Path: "spec/tickets/a-draft.md", Step: "design/owner-read", Queue: "-2", State: "draft", Person: true},
	{Ticket: "a-trial", Path: "spec/tickets/a-trial.md", Step: "do", Queue: "-1", State: "open", Person: true},
}

func TestTicketYoursPrintsTheRowsAsCliJsDoes(t *testing.T) {
	var out, errs strings.Builder
	code := ticketYours(yoursTree(t, yoursRows))([]string{"ticket", "yours"}, true, &out, &errs)
	want := `{"tickets":[{"ticket":"a-draft","path":"spec/tickets/a-draft.md","step":"design/owner-read","queue":"-2","state":"draft","person":true},{"ticket":"a-trial","path":"spec/tickets/a-trial.md","step":"do","queue":"-1","state":"open","person":true}]}` + "\n"
	if code != 0 || out.String() != want {
		t.Fatalf("ticket yours answers %d: %q%s", code, out.String(), errs.String())
	}
}

func TestTicketYoursNextNamesTheFirstOpenPersonRow(t *testing.T) {
	var out, errs strings.Builder
	code := ticketYours(yoursTree(t, yoursRows))([]string{"ticket", "yours", "--next"}, true, &out, &errs)
	if want := `{"ticket":"a-trial","path":"spec/tickets/a-trial.md","step":"do"}` + "\n"; code != 0 || out.String() != want {
		t.Fatalf("ticket yours --next answers %d: %q%s", code, out.String(), errs.String())
	}
	out.Reset()
	code = ticketYours(yoursTree(t, yoursRows[:1]))([]string{"ticket", "yours", "--next"}, true, &out, &errs)
	if want := `{"ticket":null}` + "\n"; code != 0 || out.String() != want {
		t.Fatalf("ticket yours --next with no open person row answers %d: %q", code, out.String())
	}
}

// The node module runs cli.js under the root with the words, and fails with the output where the exit reads past 0. [[spec/tickets/ticket-verbs-become-actions]]
func TestTheRootRunsANodeVerbThroughCliJs(t *testing.T) {
	root := t.TempDir()
	scripts := filepath.Join(root, "src", "scripts")
	if err := os.MkdirAll(scripts, 0o755); err != nil {
		t.Fatal(err)
	}
	cli := "const a = process.argv.slice(2); console.log(JSON.stringify(a)); process.exit(a.includes('fail') ? 3 : 0);\n"
	if err := os.WriteFile(filepath.Join(scripts, "cli.js"), []byte(cli), 0o644); err != nil {
		t.Fatal(err)
	}
	accept := accepts(root)
	said, err := accept(q.Request{Module: verbsmodule.NodeModule, Verb: verbsmodule.NodeRun, Args: []string{"ticket", "yours"}})
	if err != nil || said != `["ticket","yours"]` {
		t.Fatalf("the node module answers %#v, %v", said, err)
	}
	if _, err := accept(q.Request{Module: verbsmodule.NodeModule, Verb: verbsmodule.NodeRun, Args: []string{"ticket", "fail"}}); err == nil || !strings.Contains(err.Error(), "fail") {
		t.Fatalf("a failing verb answers %v", err)
	}
}
