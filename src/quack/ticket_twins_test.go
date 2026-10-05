// ticket yours reads work/yours off the index and prints what the verb's program prints,
// and the node module answers a registered verb through the accepts.
// [[spec/tickets/ticket-verbs-become-actions]]
package main

import (
	"fmt"
	"io"
	"strings"
	"testing"

	verbsmodule "quackitect/src/modules/verbs"
	"quackitect/src/q"
)

func TestTicketYoursPrintsTheRowsAsCliJsDoes(t *testing.T) {
	t.Parallel()
	var out, errs strings.Builder
	code := ticketYours(yoursTree(t, yoursRows))([]string{"ticket", "yours"}, true, &out, &errs)
	want := `{"tickets":[{"ticket":"a-draft","path":"spec/tickets/a-draft.md","step":"design/owner-read","queue":"-2","state":"draft","person":true},{"ticket":"a-trial","path":"spec/tickets/a-trial.md","step":"do","queue":"-1","state":"open","person":true}]}` + "\n"
	if code != 0 || out.String() != want {
		t.Fatalf("ticket yours answers %d: %q%s", code, out.String(), errs.String())
	}
}

func TestTicketYoursNextNamesTheFirstOpenPersonRow(t *testing.T) {
	t.Parallel()
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

// The node module answers a registered verb through the accepts with its output, and fails with the output where the exit reads past 0. [[spec/tickets/program-of-drops-node]]
func TestTheAcceptsAnswerARegisteredVerb(t *testing.T) {
	t.Parallel()
	registersFor(t, "registry accepts", func(argv []string, _ bool, out, _ io.Writer) int {
		fmt.Fprintln(out, strings.Join(argv[2:], " "))
		if len(argv) > 2 && argv[2] == "fail" {
			return exitFailed
		}
		return 0
	})
	accept := accepts(t.TempDir(), nil, nil)
	said, err := accept(q.Request{Module: verbsmodule.NodeModule, Verb: verbsmodule.NodeRun, Args: []string{"registry", "accepts", "open"}})
	if err != nil || said != "open" {
		t.Fatalf("the node module answers %#v, %v", said, err)
	}
	if _, err := accept(q.Request{Module: verbsmodule.NodeModule, Verb: verbsmodule.NodeRun, Args: []string{"registry", "accepts", "fail"}}); err == nil || !strings.Contains(err.Error(), "fail") {
		t.Fatalf("a failing verb answers %v", err)
	}
}
