// The todo tag a push carries, off the bridge's lib/todo.js.
// [[spec/tickets/cage-commit-guards-port]]
package command

import (
	"reflect"
	"strings"
	"testing"
)

func TestTaggedInReadsTheTodoTag(t *testing.T) {
	note := func(front string) string { return "---\nkind: [[ticket]]\n" + front + "---\n\n# Ask\n" }
	files := []Note{
		{Name: "spec/tickets/tagged.md", Text: note("todo: true\n")},
		{Name: "spec/tickets/before.md", Text: note("todo: some-row\n")},
		{Name: "spec/tickets/off.md", Text: note("todo: false\n")},
		{Name: "spec/tickets/bare.md", Text: note("")},
		{Name: "spec/tickets/point.md", Text: note("todo: true\npoint: gate\n")},
		{Name: "src/a.js", Text: note("todo: true\n")},
	}
	if got, want := TaggedIn(files), []string{"spec/tickets/tagged.md", "spec/tickets/before.md"}; !reflect.DeepEqual(got, want) {
		t.Fatalf("TaggedIn reads %q, want %q", got, want)
	}
}

func TestNotesInReadsEachNoteOnce(t *testing.T) {
	if got, want := NotesIn("spec/a.md\n src/a.js\nspec/a.md\n spec/b.md "), []string{"spec/a.md", "spec/b.md"}; !reflect.DeepEqual(got, want) {
		t.Fatalf("NotesIn reads %q, want %q", got, want)
	}
}

func TestRefusedTodoCountsTheNotes(t *testing.T) {
	said := RefusedTodo([]string{"spec/a.md"})
	if !strings.HasPrefix(said, "A tagged note parks work on this box, and this push carries 1.\n\n  spec/a.md\n") {
		t.Fatalf("the refusal reads\n%s", said)
	}
}
