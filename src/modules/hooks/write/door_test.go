// The write door's pure reads, against the bridge's own text and edits.
// [[spec/tickets/cage-write-door-port]]
package write

import "testing"

const fieldHow = "Name the open ticket this write serves in the ticket field: its file name under spec/tickets or .se/tickets, without .md."

// The edit tools name the ticket with the words the harness refusal names. [[spec/tickets/edit-tools-answer-in-go]]
func TestTicketHowReadsTheBridgesText(t *testing.T) {
	if TicketHow != fieldHow {
		t.Errorf("TicketHow reads %q, want %q", TicketHow, fieldHow)
	}
}

func TestToolRefusalReadsTheBridgesText(t *testing.T) {
	for _, tool := range []string{"Write", "Edit", "MultiEdit", "NotebookEdit"} {
		want := tool + " carries no ticket field, so the door takes no write through it. Call mcp__level0__patch, with an exact op for one spot. " + fieldHow
		if got := ToolRefusal(tool); got != want {
			t.Errorf("ToolRefusal(%s) reads %q, want %q", tool, got, want)
		}
	}
}

func TestWholeAfterAppliesEachEdit(t *testing.T) {
	was := "one two one\n"
	for _, one := range []struct {
		name   string
		e      map[string]any
		stands bool
		want   string
	}{
		{"a Write reads its content", map[string]any{"tool": "Write", "content": "new\n"}, true, "new\n"},
		{"an Edit replaces the first match", map[string]any{"tool": "Edit", "old_string": "one", "new_string": "three"}, true, "three two one\n"},
		{"an Edit under replace_all replaces every match", map[string]any{"tool": "Edit", "old_string": "one", "new_string": "three", "replace_all": true}, true, "three two three\n"},
		{"an Edit with no old text leaves the file", map[string]any{"tool": "Edit", "old_string": "", "new_string": "three"}, true, was},
		{"an Edit of no file reads its new text", map[string]any{"tool": "Edit", "old_string": "one", "new_string": "three"}, false, "three"},
		{"a MultiEdit applies each edit in turn", map[string]any{"tool": "MultiEdit", "edits": []any{
			map[string]any{"old_string": "one", "new_string": "two"},
			map[string]any{"old_string": "two two", "new_string": "four"},
		}}, true, "four one\n"},
		{"a MultiEdit of no file joins its new texts", map[string]any{"tool": "MultiEdit", "edits": []any{
			map[string]any{"old_string": "a", "new_string": "b"},
			map[string]any{"old_string": "c", "new_string": "d"},
		}}, false, "b\nd"},
	} {
		if got := WholeAfter(one.e, was, one.stands); got != one.want {
			t.Errorf("%s: WholeAfter reads %q, want %q", one.name, got, one.want)
		}
	}
}
