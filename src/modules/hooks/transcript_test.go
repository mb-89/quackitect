// What the door picks off the transcript rows a post carries: the prompt's
// before, and a spoke post's last texts, its text and its rows.
// [[spec/tickets/level0-hooks-forward-to-go]]
package hooks

import (
	"reflect"
	"testing"

	"quackitect/src/q"
)

// The newest rows as the forwarder cuts them: role, id, text and the results flag, as JSON reads them. [[spec/tickets/level0-hooks-forward-to-go]]
func forwardedRows() []any {
	return []any{
		map[string]any{"role": "user", "id": "u1", "text": "go"},
		map[string]any{"role": "assistant", "id": "a1", "text": " the first "},
		map[string]any{"role": "user", "id": "u2", "results": true},
		map[string]any{"role": "assistant", "id": "a2", "text": "the second"},
	}
}

// The fields of the newest event of s1 after the post. [[spec/tickets/level0-hooks-forward-to-go]]
func landed(t *testing.T, post Post) map[string]any {
	t.Helper()
	one := doorOver(t, &calls{}, &book{})
	hooks(t, one.door, post)
	event, ok := one.ix.Read("events/s1").(q.Event)
	if !ok {
		t.Fatalf("events/s1 holds %+v, and wants the post's event", one.ix.Read("events/s1"))
	}
	return event.Fields
}

func TestAPromptTakesTheNewestRowAsItsBefore(t *testing.T) {
	fields := landed(t, Post{Event: promptEvent, E: map[string]any{"session_id": "s1", "text": "x", "rows": forwardedRows()}})
	if fields["before"] != "a2" {
		t.Fatalf("the prompt lands %v, and wants the newest row's id a2 as its before", fields)
	}
	bare := landed(t, Post{Event: promptEvent, E: map[string]any{"session_id": "s1", "text": "x", "rows": []any{}}})
	if _, ok := bare["before"]; ok {
		t.Fatalf("a prompt over no row lands %v, and wants no before", bare)
	}
}

func TestASpokePostTakesTheLastTextsAndTheStepText(t *testing.T) {
	fields := landed(t, Post{Event: spokeEvent, E: map[string]any{"session_id": "s1", "tool": "Read", "call": "s1:2", "text": "", "rows": forwardedRows()}})
	if want := []any{"the first", "the second"}; !reflect.DeepEqual(fields["texts"], want) {
		t.Fatalf("the spoke post lands texts %#v, and wants the agent's own texts in order, %v", fields["texts"], want)
	}
	if fields["text"] != "the second" {
		t.Fatalf("a spoke post with no step text lands %q, and wants the agent's last text", fields["text"])
	}
	rows, _ := fields["rows"].([]any)
	if len(rows) != 4 || !reflect.DeepEqual(rows[1], map[string]any{"role": "assistant", "id": "a1", "text": "the first"}) || !reflect.DeepEqual(rows[2], map[string]any{"role": "user", "id": "u2", "results": true}) {
		t.Fatalf("the spoke post lands rows %#v, and wants each row by its role and id, the agent's text trimmed", fields["rows"])
	}
	step := landed(t, Post{Event: spokeEvent, E: map[string]any{"session_id": "s1", "tool": "Read", "text": "the step's own", "rows": forwardedRows()}})
	if step["text"] != "the step's own" {
		t.Fatalf("a spoke post carrying the step's text lands %q, and wants that text", step["text"])
	}
}
