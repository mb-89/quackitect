// The table op keeps each operation past the door, and the door's start
// fails every one it finds in flight.
// [[spec/design_output/model#an-operation-outlives-callers]]
package index

import (
	"path/filepath"
	"strings"
	"testing"
	"time"

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

func TestADroppedOpLeavesTheTable(t *testing.T) {
	db, err := Open(tree(t), filepath.Join(t.TempDir(), "index.db"))
	if err != nil {
		t.Fatal(err)
	}
	defer db.Close()
	keep := opKeep{db}
	for _, id := range []string{"1-a", "2-b"} {
		if err := keep.Save(ops.Op{ID: id, State: ops.Done}); err != nil {
			t.Fatal(err)
		}
	}
	if err := keep.Drop("1-a"); err != nil {
		t.Fatal(err)
	}
	all, err := keep.All()
	if err != nil {
		t.Fatal(err)
	}
	if len(all) != 1 || all[0].ID != "2-b" {
		t.Fatalf("the table op holds %+v", all)
	}
}

type heldOps map[string]ops.Op

func (h heldOps) Save(one ops.Op) error { h[one.ID] = one; return nil }
func (h heldOps) Drop(id string) error  { delete(h, id); return nil }
func (h heldOps) All() ([]ops.Op, error) {
	out := []ops.Op{}
	for _, one := range h {
		out = append(out, one)
	}
	return out, nil
}

func TestAnOperationPastItsWindowLeavesTheStore(t *testing.T) {
	c := q.New()
	one := &door{writers: registersTopics(c)}
	one.store = q.NewStore(c)
	now := time.Unix(0, 0)
	book, err := ops.New(func() time.Time { return now }, heldOps{}, ops.Settings{Done: time.Minute, Failed: time.Minute})
	if err != nil {
		t.Fatal(err)
	}
	one.hears(book)
	id, err := book.Start("t/read", nil, "s1", q.Declared{})
	if err != nil {
		t.Fatal(err)
	}
	if err := book.Finish(id, "ok"); err != nil {
		t.Fatal(err)
	}
	if _, held := one.store.Snapshot().Read(ops.Name(id)).(ops.Op); !held {
		t.Fatalf("%s stands nowhere before the window passes", ops.Name(id))
	}
	now = now.Add(time.Hour)
	one.sweepsOps()
	if _, held := book.Get(id); held {
		t.Fatalf("the book holds %s past its window", id)
	}
	if got := one.store.Snapshot().Read(ops.Name(id)); got != nil && got.(ops.Op).ID == id {
		t.Fatalf("the store holds %s past its window: %+v", ops.Name(id), got)
	}
}

// [[spec/design_output/model#what-stays-how-long]]
func TestASweepWithNoBookDropsNothing(t *testing.T) {
	c := q.New()
	one := &door{writers: registersTopics(c)}
	one.store = q.NewStore(c)
	before := one.store.Snapshot().Revision
	one.sweepsOps()
	if after := one.store.Snapshot().Revision; after != before {
		t.Fatalf("the sweep with no book moves the store from %d to %d", before, after)
	}
}
