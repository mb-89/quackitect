package main

import (
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// THE RETRO DRAINS WHAT GROWS, and both of these grew with nothing draining them.
//
// A kept command output is what an agent was reading, and an undo journal is
// what a change would be put back from. Neither survives the session that made
// it useful, and both were written one file per call, so a folder nobody opens
// filled with the output of every command ever run.
func TestARetroDrainsTheKeptOutputAndTheUndoJournal(t *testing.T) {
	t.Parallel()
	root := t.TempDir()
	r := Roots{Method: root, Work: root}
	writeProcess(t, root, "drained", false)

	// Something in each folder, written the way the engine writes it.
	for _, f := range []struct{ dir, name string }{
		{outDir(r), "20260101-000000.000000000.txt"},
		{outDir(r), "20260101-000001.000000000.txt"},
		{undoDir(r), "20260101-000002.000000000.json"},
	} {
		if err := writeAtomic(filepath.Join(f.dir, f.name), []byte("what was there"), 0o644); err != nil {
			t.Fatal(err)
		}
	}

	got, err := Retro(r, "main", nil)
	if err != nil {
		t.Fatalf("the retro would not run: %v", err)
	}
	if got.Outputs != 2 {
		t.Errorf("it drained %d kept output(s) where two were there", got.Outputs)
	}
	if got.Undos != 1 {
		t.Errorf("it drained %d undo journal(s) where one was there", got.Undos)
	}

	// AND THE FOLDERS ARE EMPTY AFTERWARDS, which is what draining means.
	for _, dir := range []string{outDir(r), undoDir(r)} {
		if left, err := os.ReadDir(dir); err == nil && len(left) > 0 {
			t.Errorf("%d file(s) left in %s", len(left), filepath.Base(dir))
		}
	}
	// AND THEY ARE IN THE FOLDER A PERSON OPENS, not deleted.
	for _, sub := range []string{"out", "undo"} {
		kept, err := os.ReadDir(filepath.Join(got.Folder, sub))
		if err != nil || len(kept) == 0 {
			t.Errorf("the retro folder holds nothing under %s", sub)
		}
	}

	// AND THE MANIFEST NAMES EVERY ONE OF THEM, with where it came from, so
	// the counts above are derivable rather than the only record.
	b, err := os.ReadFile(filepath.Join(got.Folder, "manifest.jsonl"))
	if err != nil {
		t.Fatal(err)
	}
	said := string(b)
	for _, want := range []string{
		`"origin":".se/out"`,
		`"origin":".se/undo"`,
		"20260101-000002.000000000.json",
	} {
		if !strings.Contains(said, want) {
			t.Errorf("the manifest does not carry %q:\n%s", want, said)
		}
	}
}

// WHAT THE NEXT RETRO READS IS THE ONE THING THE NEXT RETRO MUST NOT TAKE.
//
// Two of the retro's own rules read the last one: score its improvements, and
// compare this period's shape against earlier ones. Both were asking for a
// report that lived inside the drained tree, and the counts a period is judged
// on were written nowhere at all. The report the guidance named went to
// doc/retro, which git sees and which nothing carries between machines anyway.
//
// THE OWNER'S RULING: it is too early for a proper retro system. The reports
// stay on the machine and out of git, and the drain never reaches them. So they
// live in .se/reports, which .gitignore covers and no drain names.
func TestARetroKeepsWhatTheNextOneReads(t *testing.T) {
	t.Parallel()
	r := aWorkedTree(t)

	first, err := Retro(r, "main", nil)
	if err != nil {
		t.Fatalf("the first retro would not run: %v", err)
	}

	// IT SAYS WHERE ITS COUNTS WENT AND WHERE ITS REPORT GOES, because a place
	// nobody is told about is a place nobody writes to.
	if first.Counts == "" || first.Report == "" {
		t.Fatalf("the retro says nothing about its counts or its report: %+v", first)
	}
	for _, p := range []string{first.Counts, first.Report} {
		if !strings.HasPrefix(p, ReportsDir(r)+string(filepath.Separator)) {
			t.Fatalf("%s is not under the reports folder %s", p, ReportsDir(r))
		}
	}
	// AND THE FOLDER IS OUT OF GIT, which is a fact about this tree rather than
	// about the temporary one, so it is read off the real .gitignore.
	ignored, err := os.ReadFile(filepath.Join("..", "..", ".gitignore"))
	if err != nil || !strings.Contains(string(ignored), ".se/") {
		t.Fatalf("the reports live under .se and .gitignore does not cover it: %v", err)
	}

	// THE PERIOD'S COUNTS ARE PUBLISHED BY THE ENGINE, not remembered by whoever
	// ran it.
	b, err := os.ReadFile(first.Counts)
	if err != nil {
		t.Fatalf("the retro published no counts: %v", err)
	}
	var counts Counts
	if err := json.Unmarshal(b, &counts); err != nil {
		t.Fatalf("the counts will not read: %v: %s", err, b)
	}
	if counts.Logs == 0 || counts.Logs != first.Logs {
		t.Fatalf("the published counts say %d log(s) where the retro took %d",
			counts.Logs, first.Logs)
	}

	// The report is written by whoever ran the retro, where the engine said.
	if err := os.WriteFile(first.Report, []byte("# what this period taught"), 0o644); err != nil {
		t.Fatal(err)
	}

	// A SECOND PERIOD, with something in every folder a drain empties.
	for _, f := range []struct{ dir, name string }{
		{r.Private("log"), "session-20260201-000000.jsonl"},
		{r.Private("scratchpad"), "twice.py"},
		{outDir(r), "20260201-000000.000000000.txt"},
		{undoDir(r), "20260201-000001.000000000.json"},
	} {
		if err := writeAtomic(filepath.Join(f.dir, f.name), []byte("what was there"), 0o644); err != nil {
			t.Fatal(err)
		}
	}

	second, err := Retro(r, "main", nil)
	if err != nil {
		t.Fatalf("the second retro would not run: %v", err)
	}
	// IT DRAINED EVERYTHING ELSE, which is what makes the keep worth anything.
	if second.Logs == 0 || second.Scripts == 0 || second.Outputs != 1 || second.Undos != 1 {
		t.Fatalf("the second retro drained %d log(s), %d script(s), %d output(s) and %d undo(s)",
			second.Logs, second.Scripts, second.Outputs, second.Undos)
	}

	// AND IT WAS HANDED THE FIRST ONE'S REPORT AND COUNTS, read rather than taken.
	var read *Period
	for i, p := range second.Earlier {
		if p.Stamp == filepath.Base(first.Folder) {
			read = &second.Earlier[i]
		}
	}
	if read == nil {
		t.Fatalf("the second retro was handed no earlier period: %+v", second.Earlier)
	}
	if read.Counts.Logs != first.Logs {
		t.Errorf("it reads %d log(s) off the first period where it took %d",
			read.Counts.Logs, first.Logs)
	}
	if read.Report != first.Report {
		t.Errorf("it was handed %q where the first retro's report is %q", read.Report, first.Report)
	}
	for _, p := range []string{first.Report, first.Counts} {
		if _, err := os.Stat(p); err != nil {
			t.Errorf("the second retro lost %s: %v", p, err)
		}
	}
}
