// The root loads the IO modules the wiring file names, and each start commits
// under the names the wiring binds.
// [[spec/design_output/model#the-wiring-file]]
package main

import (
	"os"
	"path/filepath"
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
