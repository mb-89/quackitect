// The table op keeps each operation's body past the door, and drops the row
// the manager names.
// [[spec/design_output/model#an-operation-outlives-callers]]
package index

import (
	"path/filepath"
	"testing"

	"quackitect/src/q"
)

func TestTheOpRowsOutliveTheDoor(t *testing.T) {
	root := tree(t)
	at := filepath.Join(t.TempDir(), "index.db")
	db, err := Open(root, at)
	if err != nil {
		t.Fatal(err)
	}
	body := `{"id":"1-a","action":"t/pull","state":"running"}`
	if err := (opKeep{db}).Save("1-a", []byte(body)); err != nil {
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
	if len(all) != 1 || all[0].ID != "1-a" || string(all[0].Body) != body {
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
		if err := keep.Save(id, []byte(`{"state":"done"}`)); err != nil {
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

// The reads the door hands the manager find the same rows the index ranks. [[spec/tickets/find-and-wait-in-go]]
func TestTheReadsFindTheRowsTheDoorFinds(t *testing.T) {
	db := opened(t, tree(t))
	want, err := Find(db, "search", 0)
	if err != nil {
		t.Fatal(err)
	}
	if len(want) == 0 {
		t.Fatalf("the index finds no row for search, and the case wants one")
	}
	got, err := ReadsOf(db).Find("search", 0)
	if err != nil {
		t.Fatalf("the reads find with %v", err)
	}
	if len(got) != len(want) || got[0] != want[0] {
		t.Errorf("the reads find %+v, and want the rows the index ranks: %+v", got, want)
	}
}
