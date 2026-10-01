// ticket yours reads work/yours off the index and prints what the verb's program prints,
// and the node module runs a verb through the verb's program under the root.
// [[spec/tickets/ticket-verbs-become-actions]]
package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"

	verbsmodule "quackitect/src/modules/verbs"
	"quackitect/src/q"
)

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

// The node module runs the verb's program under the root with the words, and fails with the output where the exit reads past 0. [[spec/tickets/cli-js-leaves]]
func TestTheRootRunsANodeVerbThroughItsProgram(t *testing.T) {
	root := t.TempDir()
	programs := filepath.Join(root, "src", "scripts", "verbs")
	if err := os.MkdirAll(programs, 0o755); err != nil {
		t.Fatal(err)
	}
	program := "const a = process.argv.slice(2); console.log(JSON.stringify(a)); process.exit(a.includes('fail') ? 3 : 0);\n"
	if err := os.WriteFile(filepath.Join(programs, "ticket.js"), []byte(program), 0o644); err != nil {
		t.Fatal(err)
	}
	accept := accepts(root, nil, nil)
	said, err := accept(q.Request{Module: verbsmodule.NodeModule, Verb: verbsmodule.NodeRun, Args: []string{"ticket", "yours"}})
	if err != nil || said != `["yours"]` {
		t.Fatalf("the node module answers %#v, %v", said, err)
	}
	if _, err := accept(q.Request{Module: verbsmodule.NodeModule, Verb: verbsmodule.NodeRun, Args: []string{"ticket", "fail"}}); err == nil || !strings.Contains(err.Error(), "fail") {
		t.Fatalf("a failing verb answers %v", err)
	}
}
