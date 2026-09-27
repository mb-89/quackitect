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

// The wiring loads the tickets module, which reads files/ in and answers tickets/all out. [[spec/tickets/tickets-becomes-a-module]]
func TestTheWiredTreeAnswersItsTickets(t *testing.T) {
	w := q.Wiring{
		Instances: []q.Instance{{Name: "tickets", Module: "tickets"}},
		Wires:     map[string]string{"tickets.files/<path...>": "files/<path...>", "tickets.all": "tickets/all"},
	}
	c := q.New()
	files := q.GivenIn(c, "files/<path...>", q.Content{}, q.Doc("a file"))
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
