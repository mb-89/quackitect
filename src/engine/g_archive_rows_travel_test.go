package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// THE ROW IS PLANTED RATHER THAN LOOKED FOR. A reader that scanned whatever the
// tree happened to hold answered green while the tree held nothing, so what it
// measured was that nobody had broken the rule yet. These build the list, add
// one row to it, and read the answer.

// A ROW NAMING ONLY A TAG IS REFUSED, AND THE SAME ROW NAMING THE BLOB THE
// BRANCH COMMITTED IS NOT. The tag is the shape that lost a note: the push was
// refused by the proxy, and the local ref went down with the box.
func TestArchiveRowsTravelRefusesARowThatNamesNoTravellingObject(t *testing.T) {
	r, rel, held := archiveRowsTravelFixture(t)

	planted := held + `{"id":"tok-two","title":"another","process":"trivial","disposition":"done",` +
		`"tag":"refs/tags/archive/tok-two"}` + "\n"
	err := everyNewArchiveRowTravels(r, false, rel, planted)
	if err == nil {
		t.Fatal("a row naming only a tag was allowed into the archive")
	}
	for _, want := range []string{"tok-two", "tag", "on_branch"} {
		if !strings.Contains(err.Error(), want) {
			t.Errorf("the refusal does not name %q: %s", want, err)
		}
	}

	clean := held + `{"id":"tok-two","title":"another","process":"trivial","disposition":"done",` +
		`"tag":"refs/tags/archive/tok-two","on_branch":"` + strings.Repeat("b", 40) + `"}` + "\n"
	if err := everyNewArchiveRowTravels(r, false, rel, clean); err != nil {
		t.Fatalf("a row naming the blob the branch committed was refused: %v", err)
	}
}

// A BLOB WRITTEN AT THE CLOSE IS NOT A COPY THAT TRAVELS EITHER. It is in the
// store of the box that wrote it, reachable from no tree and no branch, so a
// clone is never sent it.
func TestArchiveRowsTravelRefusesARowThatNamesTheLocalBlobAlone(t *testing.T) {
	r, rel, held := archiveRowsTravelFixture(t)

	planted := held + `{"id":"tok-three","title":"a third","process":"standard","disposition":"done",` +
		`"blob":"` + strings.Repeat("c", 40) + `"}` + "\n"
	err := everyNewArchiveRowTravels(r, false, rel, planted)
	if err == nil {
		t.Fatal("a row naming only the blob the close wrote was allowed into the archive")
	}
	if !strings.Contains(err.Error(), "tok-three") || !strings.Contains(err.Error(), "on_branch") {
		t.Errorf("the refusal says neither which row nor what to write: %s", err)
	}

	clean := held + `{"id":"tok-three","title":"a third","process":"standard","disposition":"done",` +
		`"blob":"` + strings.Repeat("c", 40) + `","on_branch":"` + strings.Repeat("d", 40) + `"}` + "\n"
	if err := everyNewArchiveRowTravels(r, false, rel, clean); err != nil {
		t.Fatalf("a row naming both copies was refused: %v", err)
	}
}

// AN ON_BRANCH THAT NAMES NO OBJECT IS THE SAME LOSS WITH A FIELD FILLED IN. A
// clone resolves the row by that name and reads back nothing.
func TestArchiveRowsTravelRefusesAnOnBranchThatNamesNoObject(t *testing.T) {
	r, rel, held := archiveRowsTravelFixture(t)

	planted := held + `{"id":"tok-four","title":"a fourth","process":"trivial","disposition":"done",` +
		`"on_branch":"yes"}` + "\n"
	err := everyNewArchiveRowTravels(r, false, rel, planted)
	if err == nil {
		t.Fatal("a row whose on_branch names no git object was allowed into the archive")
	}
	if !strings.Contains(err.Error(), "tok-four") {
		t.Errorf("the refusal does not say which row: %s", err)
	}

	clean := held + `{"id":"tok-four","title":"a fourth","process":"trivial","disposition":"done",` +
		`"on_branch":"` + strings.Repeat("e", 64) + `"}` + "\n"
	if err := everyNewArchiveRowTravels(r, false, rel, clean); err != nil {
		t.Fatalf("a row naming an object under the newer hash was refused: %v", err)
	}
}

// A LINE THAT WILL NOT READ IS REFUSED, because the list is the archive and a
// line nothing can parse takes a closed token out of the record in silence.
func TestArchiveRowsTravelRefusesALineThatWillNotRead(t *testing.T) {
	r, rel, held := archiveRowsTravelFixture(t)

	planted := held + "{this was written by hand and never closed\n"
	err := everyNewArchiveRowTravels(r, false, rel, planted)
	if err == nil {
		t.Fatal("a line that will not parse was allowed into the archive")
	}
	if !strings.Contains(err.Error(), "line 2") {
		t.Errorf("the refusal does not say which line: %s", err)
	}

	if err := everyNewArchiveRowTravels(r, false, rel, held); err != nil {
		t.Fatalf("the list as it already stands was refused: %v", err)
	}
}

// A ROW THE LIST ALREADY CARRIES IS HISTORY SOMEBODY ELSE WROTE. Refusing it
// here would leave a person holding a row they may not touch and may not
// remove, which is a wall rather than a rule.
func TestArchiveRowsTravelLeavesTheRowsAlreadyThereAlone(t *testing.T) {
	dir := t.TempDir()
	r := Roots{Work: dir, Method: dir}
	rel := TheTrackedFolder + "/archive.jsonl"
	if err := os.MkdirAll(filepath.Join(dir, filepath.FromSlash(TheTrackedFolder)), 0o755); err != nil {
		t.Fatal(err)
	}
	stale := `{"id":"tok-old","title":"closed long ago","process":"trivial","disposition":"done",` +
		`"tag":"refs/tags/archive/tok-old"}` + "\n"
	if err := os.WriteFile(filepath.Join(dir, filepath.FromSlash(rel)), []byte(stale), 0o644); err != nil {
		t.Fatal(err)
	}

	added := stale + `{"id":"tok-new","title":"closed today","process":"trivial","disposition":"done",` +
		`"on_branch":"` + strings.Repeat("f", 40) + `"}` + "\n"
	if err := everyNewArchiveRowTravels(r, false, rel, added); err != nil {
		t.Fatalf("a good row was refused for the sake of a row already in the list: %v", err)
	}

	// AND THE SAME LIST WRITTEN AS A NEW FILE IS ANSWERED FOR IN FULL, because
	// nothing on the disk carried that row before this write.
	if err := everyNewArchiveRowTravels(r, true, rel, added); err == nil {
		t.Fatal("a first list carrying a row that travels nowhere was allowed")
	}
}

// THE RULE IS ABOUT THE ARCHIVE AND NOT ABOUT JSON LINES. A file that is not the
// list is not judged, however little of it reads as a row.
func TestArchiveRowsTravelJudgesOnlyTheArchive(t *testing.T) {
	r, _, _ := archiveRowsTravelFixture(t)
	for _, rel := range []string{"spec/work/notes.jsonl", ".se/work/archive.jsonl", "README.md"} {
		if err := everyNewArchiveRowTravels(r, true, rel, "{not a row at all\n"); err != nil {
			t.Errorf("%s was judged as the archive: %v", rel, err)
		}
	}
}
