package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// THE CASE IS PLANTED, AND A CLEAN ONE STANDS BESIDE IT.
//
// The tree here holds one open note on the disk and one row in the archive, so
// both places a token can be real are represented. The planted note offers a
// receipt that is in neither.
//
// A door refusing every write would pass the planted case for the wrong reason.
// The clean cases are what make the planted one evidence, and the narrowest of
// them is the same missing id written in the prose, where a note is allowed to
// name work this box has never seen.
func TestAReceiptNamingATokenNobodyHas(t *testing.T) {
	t.Parallel()
	const onDisk = "wk-2222222222"
	const archived = "wk-3333333333"
	const writing = "wk-4444444444"
	const nowhere = "wk-9999999999"

	dir := t.TempDir()
	r := Roots{Work: dir, Method: dir}
	if err := os.MkdirAll(TrackedDir(r), 0o755); err != nil {
		t.Fatal(err)
	}
	standing := "---\nkind: [[work-token]]\nstatus: open\n---\n\n## detail\n\nthe one on the disk\n"
	if err := os.WriteFile(filepath.Join(TrackedDir(r), onDisk+".md"), []byte(standing), 0o644); err != nil {
		t.Fatal(err)
	}
	row := `{"id":"` + archived + `","title":"the one that closed and went"}` + "\n"
	if err := os.WriteFile(ArchiveList(r), []byte(row), 0o644); err != nil {
		t.Fatal(err)
	}

	// note builds a token whose step two table carries one ticked row. The prose
	// and the receipt are handed in, because those are the two places an id can
	// be written and the rule treats them differently.
	note := func(status, prose, evidence, receipt string) string {
		return "---\nkind: [[work-token]]\nstatus: " + status + "\n---\n\n" +
			"## detail\n\n" + prose + "\n\n" +
			"## evidence: step 2. do\n\n" +
			"| done | criterion | evidence | receipt |\n" +
			"|---|---|---|---|\n" +
			"| [x] | the cleanup the change revealed is a token of its own | " +
			evidence + " | " + receipt + " |\n"
	}
	at := TheTrackedFolder + "/" + writing + ".md"
	plain := "the change and what it revealed"

	// PLANTED. The receipt names an id that is in neither place, which is the
	// ticked line that put a real cleanup into nobody's queue.
	err := aReceiptNamingATokenNobodyHas(r, true, at, note("open", plain, "the change", nowhere))
	theReceiptDoorRefused(t, "a receipt naming a token nobody has", err,
		nowhere, "promise", TheTrackedFolder, "cannot be followed")

	// CLEAN. The receipt names the note on the disk, which is a reader's page.
	err = aReceiptNamingATokenNobodyHas(r, true, at, note("open", plain, "the change", onDisk))
	theReceiptDoorAllowed(t, "a receipt naming a note in the tracked folder", err)

	// CLEAN. The receipt names work that closed and went, which the archive holds.
	err = aReceiptNamingATokenNobodyHas(r, true, at, note("open", plain, "the change", archived))
	theReceiptDoorAllowed(t, "a receipt naming a row in the archive", err)

	// CLEAN, and this is the narrowing. The same missing id is in the prose, where
	// a note may name a branch this box has never seen and be right to.
	err = aReceiptNamingATokenNobodyHas(r, true, at,
		note("open", "found while reading "+nowhere+" on another branch", "the change", "src/engine/store.go"))
	theReceiptDoorAllowed(t, "a missing id written in the prose", err)

	// CLEAN. The same missing id sits in the evidence column and the receipt is
	// empty, so the last column offers nobody anywhere to go.
	err = aReceiptNamingATokenNobodyHas(r, true, at, note("open", plain, nowhere, ""))
	theReceiptDoorAllowed(t, "a missing id written in a column that is not the receipt", err)

	// CLEAN. A closed note is history, and rewriting its receipts rewrites the
	// record of the queue as it stood.
	err = aReceiptNamingATokenNobodyHas(r, false, at, note("closed", plain, "the change", nowhere))
	theReceiptDoorAllowed(t, "a closed note carrying an old receipt", err)

	// CLEAN. A local note never travels, and the record is what a receipt promises.
	err = aReceiptNamingATokenNobodyHas(r, true, ".se/work/"+writing+".md",
		note("open", plain, "the change", nowhere))
	theReceiptDoorAllowed(t, "a note outside the tracked folder", err)

	// CLEAN. A note offering itself, which is on nobody's disk until this write.
	err = aReceiptNamingATokenNobodyHas(r, true, at, note("open", plain, "the change", writing))
	theReceiptDoorAllowed(t, "a note offering its own id", err)

	// CLEAN. The archive list itself, which carries no checklist and no receipt.
	err = aReceiptNamingATokenNobodyHas(r, false, TheTrackedFolder+"/archive.jsonl", row)
	theReceiptDoorAllowed(t, "the archive list", err)
}

// theReceiptDoorRefused says the door refused, and that the refusal names why.
// A refusal a reader cannot act on is a wall, and the words make it a door.
func theReceiptDoorRefused(t *testing.T, what string, err error, words ...string) {
	t.Helper()
	if err == nil {
		t.Fatalf("%s was allowed through, and a reader sent there finds nothing", what)
	}
	for _, want := range words {
		if !strings.Contains(err.Error(), want) {
			t.Errorf("the refusal of %s does not say %q, so a reader is not told what to do: %s",
				what, want, err)
		}
	}
}

// theReceiptDoorAllowed says the door let a legal write through. It is the half
// that makes the refusal above evidence rather than a door refusing everything.
func theReceiptDoorAllowed(t *testing.T, what string, err error) {
	t.Helper()
	if err != nil {
		t.Fatalf("%s was refused, and a door that refuses a legal write leaves nowhere to go: %s",
			what, err)
	}
}
