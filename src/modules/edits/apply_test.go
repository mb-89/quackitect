// A manifest reads each file as the ops before it leave it, and refuses whole.
// [[spec/tickets/edit-tools-answer-in-go]]
package edits

import "testing"

// [[spec/tickets/edit-tools-answer-in-go]]
func TestEachOpReadsTheFileTheOpsBeforeItLeave(t *testing.T) {
	held := map[string]Held{"a.txt": {Exists: true, Text: "one\n"}}
	took := Applied(held, []Op{
		{File: "a.txt", Old: "one", New: "two"},
		{File: "a.txt", Op: "append", New: "three\n"},
		{File: "a.txt", Op: "regex", Pattern: "t(\\w+)", Replacement: "T$1"},
		{File: "b.txt", Op: "create", New: "new\n"},
	})
	if took.Why != "" || len(took.Files) != 2 {
		t.Fatalf("the manifest answers %+v", took)
	}
	if one := took.Files[0]; one.Was != "one\n" || one.Made != "Two\nThree\n" || one.Born {
		t.Errorf("a.txt reads %+v", one)
	}
	if one := took.Files[1]; !one.Born || one.Made != "new\n" {
		t.Errorf("b.txt reads %+v", one)
	}
	refused := Applied(held, []Op{{File: "a.txt", Old: "one", New: "x"}, {File: "a.txt", Old: "one", New: "y"}})
	if refused.Why != "edit 2 (a.txt): the text stands nowhere in the file. Read it and copy the bytes exactly" || refused.Files != nil {
		t.Errorf("a second op over the text the first moved answers %+v", refused)
	}
}
