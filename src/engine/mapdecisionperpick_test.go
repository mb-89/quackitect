package main

import (
	"database/sql"
	"os"
	"path/filepath"
	"testing"
)

// THE MAP DECISION BELONGS TO THE PICK, NOT TO THE RUN.
//
// A run is made plain when nothing in it asks the map. Every pick named
// outright was selected by whoever asked, so no profile is written and no map
// row is rewritten.
//
// runChosen took that decision once for the whole run. It walked every pick,
// folded them into one flag, and handed that flag to every test in the run. So
// one delta pick put the instrumented binary and the index write back on every
// named test beside it.
//
// p.Why is in hand at the call, inside the loop over picks, so the per-pick
// decision costs one expression.

// aTinyPackageOfTwo writes a Go package that compiles, with two tests in it,
// and answers its folder relative to the tree.
func aTinyPackageOfTwo(t *testing.T, r Roots) string {
	t.Helper()
	dir := "two"
	abs := filepath.Join(r.Work, dir)
	if err := os.MkdirAll(abs, 0o755); err != nil {
		t.Fatal(err)
	}
	write := func(name, body string) {
		if err := os.WriteFile(filepath.Join(abs, name), []byte(body), 0o644); err != nil {
			t.Fatal(err)
		}
	}
	write("go.mod", "module two\n\ngo 1.24\n")
	write("two.go", "package two\n\nfunc Two() int { return 2 }\n")
	write("two_test.go", "package two\n\nimport \"testing\"\n\n"+
		"func TestTwoIsTwo(t *testing.T) {\n\tif Two() != 2 {\n\t\tt.Fatal(\"no\")\n\t}\n}\n\n"+
		"func TestTwoIsStillTwo(t *testing.T) {\n\tif Two() != 2 {\n\t\tt.Fatal(\"no\")\n\t}\n}\n")
	return dir
}

// aGoTestNamed answers the discovered Go test with this name.
func aGoTestNamed(t *testing.T, found []aTest, name string) aTest {
	t.Helper()
	for _, x := range found {
		if x.Kind == "go" && x.Name == name {
			return x
		}
	}
	t.Fatalf("the fixture's %s was not discovered, and %d test(s) were", name, len(found))
	return aTest{}
}

// theMapRowOf answers how many regions this test has, and the seconds its row
// carries. Both are zero for a test the mapper has never run.
func theMapRowOf(t *testing.T, db *sql.DB, id string) (int, float64) {
	t.Helper()
	var regions int
	if err := db.QueryRow("SELECT COUNT(*) FROM test_region WHERE test = ?", id).Scan(&regions); err != nil {
		t.Fatal(err)
	}
	var seconds float64
	if err := db.QueryRow("SELECT seconds FROM test WHERE id = ?", id).Scan(&seconds); err != nil {
		t.Fatal(err)
	}
	return regions, seconds
}

// A DELTA PICK BESIDE A NAMED ONE MAPS ITSELF AND LEAVES THE NAMED ONE ALONE.
func TestOneNamedPickBesideADeltaPickMapsOnlyTheDelta(t *testing.T) {
	r, db, found, named, delta := aFixtureOfTwoTests(t)

	runs, _ := runChosen(r, db, found, []chosen{
		{ID: named.ID, Kind: "go", Why: whyNamed},
		{ID: delta.ID, Kind: "go", Why: "reads two/two.go, and two/two.go changed"},
	})
	if len(runs) != 2 {
		t.Fatalf("two picks ran %d test(s): %+v", len(runs), runs)
	}
	for _, x := range runs {
		if !x.OK {
			t.Fatalf("a test in the fixture did not run clean: %+v", x)
		}
	}

	if regions, seconds := theMapRowOf(t, db, delta.ID); regions == 0 || seconds == 0 {
		t.Fatalf("the delta pick asked the map and got no row: %d region(s), %v seconds", regions, seconds)
	}
	if regions, seconds := theMapRowOf(t, db, named.ID); regions != 0 || seconds != 0 {
		t.Fatalf("the named pick asks the map nothing, and its row was written beside the delta pick's: %d region(s), %v seconds", regions, seconds)
	}
}

// AND A RUN WHOSE EVERY PICK IS NAMED WRITES NOTHING, which is the saving the
// per-pick decision must not undo.
func TestARunOfNamedPicksWritesNoMap(t *testing.T) {
	r, db, found, named, _ := aFixtureOfTwoTests(t)

	runs, _ := runChosen(r, db, found, []chosen{{ID: named.ID, Kind: "go", Why: whyNamed}})
	if len(runs) != 1 || !runs[0].OK {
		t.Fatalf("the named pick did not run clean: %+v", runs)
	}
	if regions, seconds := theMapRowOf(t, db, named.ID); regions != 0 || seconds != 0 {
		t.Fatalf("a run of named picks wrote a map: %d region(s), %v seconds", regions, seconds)
	}
}
