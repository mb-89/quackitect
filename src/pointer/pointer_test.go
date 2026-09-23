// The list both resolvers read: the path as written, a note, then a process file.
// [[spec/design_output/index#a-note-and-its-links]]
package pointer

import "testing"

func TestAPointerTriesThePathANoteAndAProcessFileInOrder(t *testing.T) {
	want := []string{"", ".md", ".yaml", ".yml"}
	if len(Endings) != len(want) {
		t.Fatalf("the endings read %q", Endings)
	}
	for at, one := range want {
		if Endings[at] != one {
			t.Fatalf("the endings read %q", Endings)
		}
	}
}
