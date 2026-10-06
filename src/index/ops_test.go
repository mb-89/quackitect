// The table op keeps each operation's body past the door, and drops the row
// the manager names.
// [[spec/design_output/model#an-operation-outlives-callers]]
package index

import (
	"path/filepath"
	"reflect"
	"testing"

	"quackitect/src/q"
	"quackitect/src/q/qtest"
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

	stop, _, err := Serve(qtest.Wall(), root, at, q.New())
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

// The reads the door hands the manager grep and glob the same lines and paths the door's own methods answer. [[spec/tickets/grep-glob-answer-off-index]]
func TestTheReadsGrepAndGlobTheRowsTheDoorFinds(t *testing.T) {
	db := opened(t, tree(t))
	grepAsk := GrepAsk{Pattern: "search finds", Limit: 250}
	wantGrep, err := Grep(db, grepAsk)
	if err != nil {
		t.Fatal(err)
	}
	if len(wantGrep.Files) == 0 {
		t.Fatalf("the index greps no line for the search finds, and the case wants one")
	}
	gotGrep, err := ReadsOf(db).Grep(grepAsk)
	if err != nil {
		t.Fatalf("the reads grep with %v", err)
	}
	if !reflect.DeepEqual(gotGrep, wantGrep) {
		t.Errorf("the reads grep %+v, and want the lines the index answers: %+v", gotGrep, wantGrep)
	}
	globAsk := GlobAsk{Pattern: "**/*.md"}
	wantGlob, err := Glob(db, globAsk)
	if err != nil {
		t.Fatal(err)
	}
	if len(wantGlob.Paths) == 0 {
		t.Fatalf("the index globs no path for **/*.md, and the case wants one")
	}
	gotGlob, err := ReadsOf(db).Glob(globAsk)
	if err != nil {
		t.Fatalf("the reads glob with %v", err)
	}
	if !reflect.DeepEqual(gotGlob, wantGlob) {
		t.Errorf("the reads glob %+v, and want the paths the index answers: %+v", gotGlob, wantGlob)
	}
}
