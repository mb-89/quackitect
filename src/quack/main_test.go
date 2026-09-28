// The root loads the IO modules the wiring file names, and each start commits
// under the names the wiring binds.
// [[spec/design_output/model#the-wiring-file]]
package main

import (
	"encoding/json"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"quackitect/src/index"
	"quackitect/src/q"
)

func TestTheWiringFileStartsEachIOModuleUnderItsBoundNames(t *testing.T) {
	text, err := os.ReadFile(filepath.Join("..", "..", filepath.FromSlash(q.WiringFile)))
	if err != nil {
		t.Fatal(err)
	}
	w, err := q.ReadWiring(string(text))
	if err != nil {
		t.Fatal(err)
	}
	t.Setenv("SE_QUACK", "held")
	c := q.New()
	starts, err := load(w, c)
	if err != nil {
		t.Fatal(err)
	}
	if faults := c.Check(); len(faults) > 0 {
		t.Fatal(faults)
	}
	s := q.NewStore(c)
	commit := func(as q.Writer, values map[string]any) error {
		_, err := s.Commit(s.Snapshot().Revision, as, values)
		return err
	}
	root := t.TempDir()
	for _, start := range starts {
		stop, err := start(root, commit)
		if err != nil {
			t.Fatal(err)
		}
		defer stop()
	}
	read := s.Snapshot()
	if got := read.Read("env/SE_QUACK"); got != "held" {
		t.Fatalf("env/SE_QUACK reads %v", got)
	}
	if got, _ := read.Read("clock/minute").(int64); got == 0 {
		t.Fatalf("clock/minute reads %v", read.Read("clock/minute"))
	}
	if got := read.Read("files/a.md"); got != (q.Content{}) {
		t.Fatalf("files/a.md reads %v before any write", got)
	}
	var _ index.Start = starts[0]
}

// The wiring loads the migration module, and its slice key reads the value the config resolves. [[spec/tickets/open-tasks-run-in-shadow]]
func TestTheWiredTreeAnswersItsSlice(t *testing.T) {
	text, err := os.ReadFile(filepath.Join("..", "..", filepath.FromSlash(q.WiringFile)))
	if err != nil {
		t.Fatal(err)
	}
	all, err := q.ReadWiring(string(text))
	if err != nil {
		t.Fatal(err)
	}
	w := q.Wiring{Wires: all.Wires}
	for _, one := range all.Instances {
		if one.Module == "migration" {
			w.Instances = append(w.Instances, one)
		}
	}
	c := q.New()
	values := q.OutIn(c, q.ResolvedName, q.Resolved{}, q.Doc("the config values"))
	if _, err := load(w, c); err != nil {
		t.Fatal(err)
	}
	keys := c.Keys()
	if len(keys) == 0 {
		t.Fatal("the wiring loads no slice key")
	}
	resolved := q.Resolved{}
	for _, one := range keys {
		if one.Instance != "migration" || !one.Shared {
			t.Fatalf("the wiring loads %+v, and wants a shared slice key of migration", one)
		}
		resolved[one.Name] = `"shadow"`
	}
	s := q.NewStore(c)
	if _, err := s.Commit(0, values, map[string]any{q.ResolvedName: resolved}); err != nil {
		t.Fatal(err)
	}
	for _, one := range keys {
		if err := s.Run(one.Name); err != nil {
			t.Fatal(err)
		}
		if said := s.Snapshot().Read(one.Name); said != "shadow" {
			t.Fatalf("%s reads %v, and wants shadow", one.Name, said)
		}
	}
}

// The index holds no module's logic, so it imports nothing under src/modules and no src/tickets. [[spec/tickets/tickets-becomes-a-module]]
func TestTheIndexImportsNoModule(t *testing.T) {
	cmd := exec.Command("go", "list", "-deps", "./src/index")
	cmd.Dir = filepath.Join("..", "..")
	listed, err := cmd.Output()
	if err != nil {
		t.Fatal(err)
	}
	for _, one := range strings.Fields(string(listed)) {
		if strings.HasPrefix(one, "quackitect/src/modules/") || one == "quackitect/src/tickets" {
			t.Fatalf("the index imports %s", one)
		}
	}
}

// The served index answers the tickets the wiring's module reads off the watch, the private ones and one written after the start among them. [[spec/tickets/tickets-becomes-a-module]]
func TestTheServedIndexAnswersItsTickets(t *testing.T) {
	text, err := os.ReadFile(filepath.Join("..", "..", filepath.FromSlash(q.WiringFile)))
	if err != nil {
		t.Fatal(err)
	}
	w, err := q.ReadWiring(string(text))
	if err != nil {
		t.Fatal(err)
	}
	root := t.TempDir()
	ticket := func(path, ask string) {
		at := filepath.Join(root, filepath.FromSlash(path))
		if err := os.MkdirAll(filepath.Dir(at), 0o755); err != nil {
			t.Fatal(err)
		}
		if err := os.WriteFile(at, []byte("---\nkind: [[ticket]]\nstate: open\n---\n\n# Ask\n\n"+ask+"\n"), 0o644); err != nil {
			t.Fatal(err)
		}
	}
	ticket("spec/tickets/grows.md", "It grows.")
	ticket(".se/tickets/parked.md", "Later.")
	c := q.New()
	starts, err := load(w, c)
	if err != nil {
		t.Fatal(err)
	}
	stop, _, err := index.Serve(root, filepath.Join(t.TempDir(), "index.db"), c, starts...)
	if err != nil {
		t.Fatal(err)
	}
	defer stop()
	t.Setenv("QUACKITECT_ROOT", root)
	awaits(t, map[string]string{"grows": "It grows.", "parked": "Later."})
	ticket("spec/tickets/late.md", "Written after the start.")
	awaits(t, map[string]string{"grows": "It grows.", "parked": "Later.", "late": "Written after the start."})
}

// The polls a case waits through for the scheduler to commit the tickets. [[spec/tickets/tickets-becomes-a-module]]
const ticketPolls = 100

// Asks the served index for the tickets until each name reads its Ask. [[spec/tickets/tickets-becomes-a-module]]
func awaits(t *testing.T, want map[string]string) {
	t.Helper()
	var said any
	for range ticketPolls {
		read, err := index.Ask("tickets")
		if err != nil {
			t.Fatal(err)
		}
		said = read
		rows, _ := read.([]any)
		names := map[string]string{}
		for _, one := range rows {
			row, _ := one.(map[string]any)
			name, _ := row["name"].(string)
			says, _ := row["says"].(string)
			names[name] = says
		}
		met := true
		for name, ask := range want {
			met = met && names[name] == ask
		}
		if met {
			return
		}
		time.Sleep(100 * time.Millisecond)
	}
	t.Fatalf("the tickets read %#v", said)
}

// The wiring loads the tickets module, which reads files/ in and answers tickets/all out. [[spec/tickets/tickets-becomes-a-module]]
func TestTheWiredTreeAnswersItsTickets(t *testing.T) {
	w := q.Wiring{
		Instances: []q.Instance{{Name: "tickets", Module: "tickets"}},
		Wires:     map[string]string{"tickets.files/<path...>": "files/<path...>", "tickets.all": "tickets/all"},
	}
	c := q.New()
	files := q.OutIn(c, "files/<path...>", q.Content{}, q.Doc("a file"))
	if _, err := load(w, c); err != nil {
		t.Fatal(err)
	}
	s := q.NewStore(c)
	text := "---\nkind: [[ticket]]\nstate: open\n---\n\n# Ask\n\nOne thing.\n"
	if _, err := s.Commit(0, files, map[string]any{"files/spec/tickets/one.md": q.Content{Hash: "h", Text: text}}); err != nil {
		t.Fatal(err)
	}
	if err := s.Run("tickets/all"); err != nil {
		t.Fatalf("the run of tickets/all answers %v", err)
	}
	said, _ := json.Marshal(s.Snapshot().Read("tickets/all"))
	if !strings.Contains(string(said), `"name":"one"`) || !strings.Contains(string(said), "One thing.") {
		t.Fatalf("tickets/all reads %s", said)
	}
}

// The wiring loads the queue beside the tickets, and the queue answers a place for the open ticket they read. [[spec/tickets/the-queue-becomes-a-module]]
func TestTheWiredTreeAnswersItsPlaces(t *testing.T) {
	w := q.Wiring{
		Instances: []q.Instance{{Name: "tickets", Module: "tickets"}, {Name: "queue", Module: "queue"}},
		Wires: map[string]string{
			"tickets.files/<path...>": "files/<path...>", "tickets.all": "tickets/all", "tickets.cloud": "tickets/cloud",
			"queue.rows": "tickets/all", "queue.plan": "files/.se/.runtime/plan.json", "queue.cloud": "tickets/cloud",
			"queue.stood": q.BuiltIn, "queue.minute": "clock/minute",
		},
	}
	c := q.New()
	files := q.OutIn(c, "files/<path...>", q.Content{}, q.Doc("a file"))
	q.OutIn(c, "clock/minute", int64(0), q.Doc("the minute"))
	q.OutIn(c, q.ResolvedName, q.Resolved{}, q.Doc("the config values"))
	if _, err := load(w, c); err != nil {
		t.Fatal(err)
	}
	s := q.NewStore(c)
	text := "---\nkind: [[ticket]]\nstate: open\n---\n\n# Ask\n\nOne thing.\n"
	if _, err := s.Commit(0, files, map[string]any{"files/spec/tickets/one.md": q.Content{Hash: "h", Text: text}}); err != nil {
		t.Fatal(err)
	}
	for _, name := range []string{"tickets/all", "tickets/cloud", "queue/places"} {
		if err := s.Run(name); err != nil {
			t.Fatalf("the run of %s answers %v", name, err)
		}
	}
	if said, _ := s.Snapshot().Read("queue/places").(map[string]string); said["one"] != "1" {
		t.Fatalf("queue/places reads %v", said)
	}
}

// The wiring loads tickets, the queue and the work module, and work/open-tasks counts a fake tree of tickets: a marked group and its child stand on the cloud, a closed ticket takes no place, and the free one counts. [[spec/tickets/open-tasks-come-from-work]]
func TestTheWiredTreeAnswersItsOpenTasks(t *testing.T) {
	text, err := os.ReadFile(filepath.Join("..", "..", filepath.FromSlash(q.WiringFile)))
	if err != nil {
		t.Fatal(err)
	}
	all, err := q.ReadWiring(string(text))
	if err != nil {
		t.Fatal(err)
	}
	w := q.Wiring{Wires: all.Wires}
	for _, one := range all.Instances {
		if one.Module == "tickets" || one.Module == "queue" || one.Module == "work" {
			w.Instances = append(w.Instances, one)
		}
	}
	c := q.New()
	files := q.OutIn(c, "files/<path...>", q.Content{}, q.Doc("a file"))
	q.OutIn(c, "clock/minute", int64(0), q.Doc("the minute"))
	q.OutIn(c, q.ResolvedName, q.Resolved{}, q.Doc("the config values"))
	if _, err := load(w, c); err != nil {
		t.Fatal(err)
	}
	s := q.NewStore(c)
	ticket := func(front string) q.Content {
		return q.Content{Hash: front, Text: "---\nkind: [[ticket]]\n" + front + "---\n\n# Ask\n\nA thing.\n"}
	}
	tree := map[string]any{
		"files/spec/tickets/a-group.md":   ticket("state: open\ncloud: true\nprocess: [[spec/processes/group]]\n"),
		"files/spec/tickets/its-child.md": ticket("state: open\ngroup: a-group\n"),
		"files/spec/tickets/free.md":      ticket("state: open\n"),
		"files/spec/tickets/done.md":      ticket("state: closed\n"),
	}
	if _, err := s.Commit(0, files, tree); err != nil {
		t.Fatal(err)
	}
	for _, name := range []string{"tickets/all", "tickets/cloud", "queue/places", "work/open-tasks"} {
		if err := s.Run(name); err != nil {
			t.Fatalf("the run of %s answers %v", name, err)
		}
	}
	if said := s.Snapshot().Read("work/open-tasks"); said != 1 {
		t.Fatalf("work/open-tasks reads %v over the fake tree, and wants 1", said)
	}
}
