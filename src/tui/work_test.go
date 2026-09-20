// The work tab, over a door a case stands up. The items come off the rows the
// index answers, the base file this tree ships says the columns, and a tick
// past the one the tab holds hands it its tree again.
// [[spec/design_output/tui#the-work-tab]]

package main

import (
	"quackitect/tui/draw"

	"quackitect/tui/work"

	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"testing"
	"time"
)

const indexRowsSaid = `[
  {"name": "one-group", "path": "spec/tickets/one-group.md", "state": "open", "step": "children",
   "route": "group", "group": "", "urgent": false, "todo": false, "standing": "held",
   "says": "Two tickets that land as one."},
  {"name": "a-child", "path": "spec/tickets/a-child.md", "state": "open", "step": "do",
   "route": "trivial", "group": "one-group", "urgent": true, "todo": false, "standing": "held",
   "says": "One piece of it."},
  {"name": "a-loose-one", "path": "spec/tickets/a-loose-one.md", "state": "open", "step": "do",
   "route": "trivial", "group": "", "urgent": false, "todo": true, "standing": "",
   "says": "A ticket in no group."}
]`

// A door a case stands up: it answers tickets off the rows it holds, and changes off its tick. [[spec/design_output/tui#the-work-tab]]
type fakeDoor struct {
	guard sync.Mutex
	rows  string
	tick  int64
	asked []string
}

func (d *fakeDoor) says(rows string) {
	d.guard.Lock()
	defer d.guard.Unlock()
	d.rows = rows
	d.tick++
}

func (d *fakeDoor) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	var call struct {
		Method string `json:"method"`
		Params struct {
			Since int64 `json:"since"`
		} `json:"params"`
	}
	json.NewDecoder(r.Body).Decode(&call)
	d.guard.Lock()
	d.asked = append(d.asked, call.Method)
	d.guard.Unlock()
	w.Header().Set("Content-Type", "application/json")
	switch call.Method {
	case "tickets":
		d.guard.Lock()
		defer d.guard.Unlock()
		fmt.Fprintf(w, `{"result":%s,"id":1}`, d.rows)
	case "changes":
		for waited := 0; waited < 200; waited++ {
			d.guard.Lock()
			tick := d.tick
			d.guard.Unlock()
			if tick > call.Params.Since {
				break
			}
			time.Sleep(10 * time.Millisecond)
		}
		d.guard.Lock()
		defer d.guard.Unlock()
		fmt.Fprintf(w, `{"result":{"tick":%d},"id":1}`, d.tick)
	default:
		fmt.Fprintf(w, `{"error":"no method called %s","id":1}`, call.Method)
	}
}

// The tree a window reads: the base file this project ships, and a door standing where the standing file says. [[spec/design_output/tui#the-work-tab]]
func workTree(t *testing.T) string {
	t.Helper()
	root, _ := workTreeWith(t, indexRowsSaid)
	return root
}

func workTreeWith(t *testing.T, rows string) (string, *fakeDoor) {
	t.Helper()
	root := t.TempDir()
	base, err := os.ReadFile(filepath.Join("..", "..", work.BaseAt))
	if err != nil {
		t.Fatalf("this tree ships %s, and it read %v", work.BaseAt, err)
	}
	writeAt(t, root, work.BaseAt, string(base))
	writeAt(t, root, ".se/.log/session.jsonl", "")
	door := &fakeDoor{rows: rows, tick: 1}
	server := httptest.NewServer(door)
	t.Cleanup(server.Close)
	port := server.Listener.Addr().(interface{ String() string }).String()
	port = port[strings.LastIndex(port, ":")+1:]
	writeAt(t, root, work.IndexStandingAt, fmt.Sprintf(`{"port":%s,"pid":0,"root":%q}`, port, root))
	return root, door
}

func writeAt(t *testing.T, root, rel, text string) {
	t.Helper()
	at := filepath.Join(root, filepath.FromSlash(rel))
	if err := os.MkdirAll(filepath.Dir(at), 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(at, []byte(text), 0o644); err != nil {
		t.Fatal(err)
	}
}

func logOf(root string) string {
	return filepath.Join(root, ".se", ".log", "session.jsonl")
}

// [[spec/design_output/tui#the-work-tab]]
func TestAGroupCarriesItsTicketsAndALooseOneStandsAtTheLeft(t *testing.T) {
	t.Parallel()
	items, err := work.ReadWorkItems(indexRowsSaid)
	if err != nil {
		t.Fatalf("the rows read, and answered %v", err)
	}
	if len(items) != 2 {
		t.Fatalf("the rows name a group and a loose ticket, and read %d", len(items))
	}
	if items[0].Name != "one-group" || len(items[0].Kids) != 1 {
		t.Fatalf("the group carries its one ticket, and read %d", len(items[0].Kids))
	}
	if items[0].Keys["held"] != "true" || items[0].Keys["standing"] != "held" {
		t.Fatal("a held group carries the mark, and its standing")
	}
	if items[0].Kids[0].Keys["urgent"] != "true" {
		t.Fatal("a marked ticket carries the mark")
	}
	if items[1].Name != "a-loose-one" || items[1].Keys["group"] != "" {
		t.Fatal("a ticket naming no group stands at the left, with no mark")
	}
	if items[1].Keys["urgent"] != "false" || items[1].Keys["held"] != "false" {
		t.Fatal("an unmarked ticket carries no mark")
	}
	orphan, _ := work.ReadWorkItems(strings.ReplaceAll(indexRowsSaid, `"group": "one-group"`, `"group": "nobody"`))
	if len(orphan) != 3 {
		t.Fatalf("a ticket naming a group the rows hold nowhere stands at the left, and %d rows do", len(orphan))
	}
}

// [[spec/design_output/tui#the-work-tab]]
func TestTheTabReadsTheBaseFileAndTheIndexOffTheLogsOwnPath(t *testing.T) {
	t.Parallel()
	root, door := workTreeWith(t, indexRowsSaid)
	tree, err := work.Load(logOf(root))
	if err != nil {
		t.Fatalf("the tab reads its base file and asks the door, and answered %v", err)
	}
	if tree.Len() != 3 {
		t.Fatalf("the group, its ticket and the loose one stand, and %d rows do", tree.Len())
	}
	head := tree.Header(120)
	for _, one := range []string{"name", "flags", "queue"} {
		if !strings.Contains(head, one) {
			t.Fatalf("the column %s stands in the names, and they read %q", one, head)
		}
	}
	if strings.Join(door.asked, " ") != "tickets" {
		t.Fatalf("the tab asks the door for the tickets and nothing else, and asked %v", door.asked)
	}
	// The table draws the name, the flags and the queue alone: the nesting says the group, and the details draw the rest. [[spec/design_output/tui#the-work-tab]]
	for _, gone := range []string{"says", "state", "kind", "standing", "step", "group"} {
		if strings.Contains(head, gone) {
			t.Fatalf("the column %s stands off the table, and the names read %q", gone, head)
		}
	}
}

// A ticket naming another row nests under it, at any depth, and one naming a row nobody holds stands at the left. [[spec/design_output/tree-view#the-name-column-nests]]
func TestATicketNestsUnderTheRowItNamesAtAnyDepth(t *testing.T) {
	t.Parallel()
	items, err := work.ReadWorkItems(`[
		{"name": "its-child", "route": "trivial", "state": "open", "group": "a-group", "says": "One piece."},
		{"name": "a-group", "route": "group", "state": "open", "group": "", "says": "Two as one."},
		{"name": "grandchild", "route": "trivial", "state": "open", "group": "its-child", "says": ""},
		{"name": "alone", "route": "trivial", "state": "open", "group": "nobody", "says": ""}
	]`)
	if err != nil {
		t.Fatal(err)
	}
	if len(items) != 2 || items[0].Name != "a-group" || items[1].Name != "alone" {
		t.Fatalf("the group and the ticket naming no standing row stand at the left, and the roots read %v", items)
	}
	if items[0].Keys["kind"] != work.KindGroup || items[1].Keys["kind"] != work.KindTicket {
		t.Fatalf("the kind reads off the route, and it reads %v", items)
	}
	if len(items[0].Kids) != 1 || items[0].Kids[0].Name != "its-child" {
		t.Fatalf("the child nests under its group, and the kids read %v", items[0].Kids)
	}
	if len(items[0].Kids[0].Kids) != 1 || items[0].Kids[0].Kids[0].Name != "grandchild" {
		t.Fatalf("a child's own child nests under it, and the kids read %v", items[0].Kids[0].Kids)
	}
}

// [[spec/design_output/tree-view#the-filter-reads-an-item]]
func TestTheFilterReadsATicketsKeysInTheLogsOwnLanguage(t *testing.T) {
	t.Parallel()
	root := workTree(t)
	tree, err := work.Load(logOf(root))
	if err != nil {
		t.Fatal(err)
	}
	f, err := draw.ParseFilter("group:one-group")
	if err != nil {
		t.Fatalf("the filter reads, and answered %v", err)
	}
	tree.Narrow(f)
	if !tree.Narrowed() {
		t.Fatal("a filter standing says so")
	}
	if tree.Len() != 2 {
		t.Fatalf("the group stands for its child, and %d rows do", tree.Len())
	}
	tree.Narrow(draw.Filter{})
	if tree.Len() != 3 {
		t.Fatalf("an empty filter keeps every row, and %d stand", tree.Len())
	}
}

// [[spec/design_output/tui#the-work-tab]]
func TestTheWindowDrawsEveryTicketNestedUnderItsGroup(t *testing.T) {
	t.Parallel()
	root := workTree(t)
	path := logOf(root)
	tree, err := work.Load(path)
	if err != nil {
		t.Fatal(err)
	}
	m := newModel(path, time.UTC)
	m.W, m.H = 120, 24
	theWork(m).Tree = tree
	m.OpenTab(m.TabNamed("work"))
	said := m.View()
	for _, one := range []string{"one-group", "a-child", "a-loose-one"} {
		if !strings.Contains(said, one) {
			t.Fatalf("the tab draws %s, and the window reads %q", one, said)
		}
	}
}

// A tick past the one the tab holds hands it a tree again, with no key pressed and no file read. [[spec/design_output/index#the-index-fires-on-change]]
func TestAChangeTheIndexFiresHandsTheTabItsTreeAgain(t *testing.T) {
	t.Parallel()
	root, door := workTreeWith(t, indexRowsSaid)
	path := logOf(root)

	first, ok := work.Cmd(path, 0)().(work.Msg)
	if !ok || first.Same || first.Tree == nil || first.Tick != 1 {
		t.Fatalf("the first ask reads the rows and hands a tree over, and answered %+v", first)
	}

	door.says(strings.ReplaceAll(indexRowsSaid, "a-child", "a-second"))
	next, ok := work.Cmd(path, first.Tick)().(work.Msg)
	if !ok || next.Same || next.Tree == nil || next.Tick != 2 {
		t.Fatalf("a change hands the tab a tree again, and answered %+v", next)
	}
	if !strings.Contains(next.Tree.Rows(120, 8), "a-second") {
		t.Fatal("the tree the change hands over draws what the index now says")
	}
	if strings.Join(door.asked, " ") != "changes tickets changes tickets" {
		t.Fatalf("each change costs one read of the rows, and the door heard %v", door.asked)
	}
}

// [[spec/design_output/tui#the-work-tab]]
func TestATabMeetingNoDoorAndNoBinarySaysSo(t *testing.T) {
	t.Parallel()
	root := t.TempDir()
	writeAt(t, root, ".se/.log/session.jsonl", "")
	if _, err := work.Load(logOf(root)); err == nil {
		t.Fatal("a tree carrying no base file answers why")
	}
	base, _ := os.ReadFile(filepath.Join("..", "..", work.BaseAt))
	writeAt(t, root, work.BaseAt, string(base))
	_, err := work.Load(logOf(root))
	if err == nil || !strings.Contains(err.Error(), "unbuilt") {
		t.Fatalf("a box with no door and no binary says the index is unbuilt, and answered %v", err)
	}
	said, ok := work.Cmd(logOf(root), 0)().(work.Msg)
	if !ok || said.Tree != nil || said.Why == "" {
		t.Fatalf("the ask hands the tab the reason, and answered %+v", said)
	}
}
