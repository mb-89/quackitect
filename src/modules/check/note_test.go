package check

import "testing"

// The check reads a note through the reader in src/note, so a heading's line and the front's key line match what the tickets module reads. [[spec/tickets/the-lens-reads-v1]]
func TestTheCheckReadsANoteThroughTheSharedReader(t *testing.T) {
	said := readNote("---\nkind: [[ticket]]\n---\n\n# Ask\n\ntext\n")
	if !said.Front.Stands || said.Front.Lines["kind"] != 2 {
		t.Fatalf("the front reads %+v, and wants kind at line 2", said.Front)
	}
	for _, one := range said.Sections {
		if one.Header == "Ask" {
			return
		}
	}
	t.Fatalf("the sections read %+v, and want the Ask heading", said.Sections)
}
