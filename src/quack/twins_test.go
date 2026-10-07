// The branch twins and wiring, and the work/yours door their cases share
// with the ticket cases in ticket_twins_test.go.
// [[spec/tickets/work-verbs-become-actions]]
package main

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"quackitect/src/index"
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
	stop, _, err := index.Serve(wall, root, filepath.Join(t.TempDir(), "index.db"), c, seeds)
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

// branch list --queue prints each placed row as queueOnly in work-list.js prints it. [[spec/tickets/work-verbs-become-actions]]
func TestBranchQueuePrintsThePlacesAsCliJsDoes(t *testing.T) {
	t.Parallel()
	var out, errs strings.Builder
	code := branchQueue(yoursTree(t, yoursRows))([]string{"branch", "list", "--queue"}, true, &out, &errs)
	want := fmt.Sprintf("%6s  %-34s %s\n%6s  %-34s %s\n", "-2", "a-draft", "design/owner-read", "-1", "a-trial", "do")
	if code != 0 || out.String() != want {
		t.Fatalf("branch list --queue answers %d and prints %q, %q", code, out.String(), errs.String())
	}
}

// branch list --queue says so where no row stands placed. [[spec/tickets/work-verbs-become-actions]]
func TestBranchQueueSaysSoWhereNoRowStands(t *testing.T) {
	t.Parallel()
	var out, errs strings.Builder
	code := branchQueue(yoursTree(t, nil))([]string{"branch", "list", "--queue"}, true, &out, &errs)
	if want := "No ticket stands in the queue.\n"; code != 0 || out.String() != want {
		t.Fatalf("branch list --queue answers %d and prints %q, %q", code, out.String(), errs.String())
	}
}

// A twin keyed on three words runs beside the verb's program for that spelling, and the two-word verb runs the verb's program alone. [[spec/tickets/work-verbs-become-actions]]
func TestATwinKeysOnThreeWords(t *testing.T) {
	t.Parallel()
	dry := []bool{}
	doors, _, rows := roadOver("shadow", "old\n", map[string]twin{"branch list --queue": twinSaying("new\n", &dry)})
	verbs(doors, []string{"branch", "list", "--queue"})
	verbs(doors, []string{"branch", "list"})
	if len(dry) != 1 || len(*rows) != 1 || (*rows)[0]["verb"] != "branch list --queue" {
		t.Fatalf("the twin runs %v, and the log holds %v", dry, *rows)
	}
}
