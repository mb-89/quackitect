// The table op keeps each operation past the door, and the door's start
// fails every one it finds in flight.
// [[spec/design_output/operations#an-operation-outlives-callers]]
package main

import (
	"path/filepath"
	"strings"
	"testing"

	"quackitect/src/ops"
	"quackitect/src/q"
)

func TestTheOpRowsOutliveTheDoor(t *testing.T) {
	root := tree(t)
	at := filepath.Join(t.TempDir(), "index.db")
	db, err := Open(root, at)
	if err != nil {
		t.Fatal(err)
	}
	if err := (opKeep{db}).Save(ops.Op{ID: "1-a", Action: "t/pull", State: ops.Running}); err != nil {
		t.Fatal(err)
	}
	db.Close()

	stop, _, err := Serve(root, at, q.New())
	if err != nil {
		t.Fatal(err)
	}
	stop()

	db, err = Open(root, at)
	if err != nil {
		t.Fatal(err)
	}
	defer db.Close()
	all, err := (opKeep{db}).All()
	if err != nil {
		t.Fatal(err)
	}
	if len(all) != 1 || all[0].State != ops.Failed || !strings.Contains(all[0].Error, "restart") {
		t.Fatalf("the table op holds %+v", all)
	}
}
