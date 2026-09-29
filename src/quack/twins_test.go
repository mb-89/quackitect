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
	"quackitect/src/ticket"
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

// A door holding tickets/all as the case seeds it, and the V1 answering its base. [[spec/tickets/retro-verbs-become-actions]]
func notesTree(t *testing.T, rows []ticket.Ticket) func() (string, error) {
	t.Helper()
	root := t.TempDir()
	if err := os.MkdirAll(filepath.Join(root, index.Runtime), 0o755); err != nil {
		t.Fatal(err)
	}
	c := q.New()
	hand := q.OutIn(c, "tickets/all", []ticket.Ticket{}, q.Doc("the tickets as the case seeds them"))
	seeds := func(_ string, commit index.Commit) (func(), error) {
		return func() {}, commit(hand, map[string]any{"tickets/all": rows})
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

var notesRows = []ticket.Ticket{
	{Name: "a-doubt", Path: ".se/tickets/a-doubt.md", State: "open"},
	{Name: "b-bug", Path: ".se/tickets/b-bug.md", State: "draft"},
	{Name: "c-done", Path: ".se/tickets/c-done.md", State: "closed"},
	{Name: "d-public", Path: "spec/tickets/d-public.md", State: "open"},
}

// retro notes names each note under .se/tickets standing open, as notes in retro.js prints them, and exits 1. [[spec/tickets/retro-verbs-become-actions]]
func TestRetroNotesPrintsTheOpenNotesAsCliJsDoes(t *testing.T) {
	var out, errs strings.Builder
	code := retroNotes(notesTree(t, notesRows))([]string{"retro", "notes"}, true, &out, &errs)
	want := "2 note(s) stand open under .se/tickets. Decide each one, then run this again:\n  a-doubt\n  b-bug\n"
	if code != 1 || out.String() != want {
		t.Fatalf("retro notes answers %d and prints %q, %q", code, out.String(), errs.String())
	}
}

// retro notes passes where every note under .se/tickets stands closed. [[spec/tickets/retro-verbs-become-actions]]
func TestRetroNotesPassesWhereNoNoteStandsOpen(t *testing.T) {
	var out, errs strings.Builder
	code := retroNotes(notesTree(t, notesRows[2:]))([]string{"retro", "notes"}, true, &out, &errs)
	want := ".se/tickets holds no open note, so the box leaves nothing behind.\n"
	if code != 0 || out.String() != want {
		t.Fatalf("retro notes answers %d and prints %q, %q", code, out.String(), errs.String())
	}
}

// The wiring loads the retro topic, so an agent calls retro/collect through the index. [[spec/tickets/retro-verbs-become-actions]]
func TestTheWiringLoadsTheRetroTopic(t *testing.T) {
	text, err := os.ReadFile(filepath.Join("..", "..", filepath.FromSlash(q.WiringFile)))
	if err != nil {
		t.Fatal(err)
	}
	w, err := q.ReadWiring(string(text))
	if err != nil {
		t.Fatal(err)
	}
	c := q.New()
	if _, err := load(w, c); err != nil {
		t.Fatal(err)
	}
	if _, ok := q.NewStore(c).Declared("retro/collect"); !ok {
		t.Fatal("the wiring declares no retro/collect")
	}
}

// The wiring loads the vehicle and stub topics, so an agent calls each through the index. [[spec/tickets/vehicle-verbs-become-actions]]
func TestTheWiringLoadsTheVehicleAndStubTopics(t *testing.T) {
	text, err := os.ReadFile(filepath.Join("..", "..", filepath.FromSlash(q.WiringFile)))
	if err != nil {
		t.Fatal(err)
	}
	w, err := q.ReadWiring(string(text))
	if err != nil {
		t.Fatal(err)
	}
	c := q.New()
	if _, err := load(w, c); err != nil {
		t.Fatal(err)
	}
	for _, name := range []string{"vehicle/produce", "stub/into"} {
		if _, ok := q.NewStore(c).Declared(name); !ok {
			t.Fatalf("the wiring declares no %s", name)
		}
	}
}

// branch list --queue prints each placed row as queueOnly in work-list.js prints it. [[spec/tickets/work-verbs-become-actions]]
func TestBranchQueuePrintsThePlacesAsCliJsDoes(t *testing.T) {
	var out, errs strings.Builder
	code := branchQueue(yoursTree(t, yoursRows))([]string{"branch", "list", "--queue"}, true, &out, &errs)
	want := fmt.Sprintf("%6s  %-34s %s\n%6s  %-34s %s\n", "-2", "a-draft", "design/owner-read", "-1", "a-trial", "do")
	if code != 0 || out.String() != want {
		t.Fatalf("branch list --queue answers %d and prints %q, %q", code, out.String(), errs.String())
	}
}

// branch list --queue says so where no row stands placed. [[spec/tickets/work-verbs-become-actions]]
func TestBranchQueueSaysSoWhereNoRowStands(t *testing.T) {
	var out, errs strings.Builder
	code := branchQueue(yoursTree(t, nil))([]string{"branch", "list", "--queue"}, true, &out, &errs)
	if want := "No ticket stands in the queue.\n"; code != 0 || out.String() != want {
		t.Fatalf("branch list --queue answers %d and prints %q, %q", code, out.String(), errs.String())
	}
}

// The wiring loads the branch topic, so an agent calls branch/take through the index. [[spec/tickets/work-verbs-become-actions]]
func TestTheWiringLoadsTheBranchTopic(t *testing.T) {
	text, err := os.ReadFile(filepath.Join("..", "..", filepath.FromSlash(q.WiringFile)))
	if err != nil {
		t.Fatal(err)
	}
	w, err := q.ReadWiring(string(text))
	if err != nil {
		t.Fatal(err)
	}
	c := q.New()
	if _, err := load(w, c); err != nil {
		t.Fatal(err)
	}
	if _, ok := q.NewStore(c).Declared("branch/take"); !ok {
		t.Fatal("the wiring declares no branch/take")
	}
}

// A twin keyed on three words runs beside cli.js for that spelling, and the two-word verb runs cli.js alone. [[spec/tickets/work-verbs-become-actions]]
func TestATwinKeysOnThreeWords(t *testing.T) {
	dry := []bool{}
	doors, _, rows := roadOver("shadow", "old\n", map[string]twin{"branch list --queue": twinSaying("new\n", &dry)})
	verbs(doors, []string{"branch", "list", "--queue"})
	verbs(doors, []string{"branch", "list"})
	if len(dry) != 1 || len(*rows) != 1 || (*rows)[0]["verb"] != "branch list --queue" {
		t.Fatalf("the twin runs %v, and the log holds %v", dry, *rows)
	}
}
