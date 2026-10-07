// The session file the door writes on a session's start, off wrote in
// the old pull hook: the id and the harness, and nothing
// where the start names no id.
// [[spec/tickets/level0-hooks-forward-to-go]]
package hooks

import (
	"encoding/json"
	"os"
	"path/filepath"
	"testing"
)

// The session file under the root, as the hand reads it, or nil where none stands. [[spec/tickets/level0-hooks-forward-to-go]]
func sessionHeld(t *testing.T, root string) map[string]any {
	t.Helper()
	text, err := os.ReadFile(filepath.Join(root, filepath.FromSlash(sessionFile)))
	if err != nil {
		return nil
	}
	var held map[string]any
	if err := json.Unmarshal(text, &held); err != nil {
		t.Fatalf("the session file reads %q, which reads as no JSON", text)
	}
	return held
}

func started(t *testing.T, door *Door, root string, e map[string]any) {
	t.Helper()
	hooks(t, door, Post{Event: "session.start", Root: root, E: e})
}

func TestTheSessionStartWritesTheSessionFile(t *testing.T) {
	root := treeOf(t, nil, "")
	started(t, holdDoor(t, Settings{Words: nameWords}), root, map[string]any{"session_id": "s1", "harness": "claude-code-remote"})
	if held := sessionHeld(t, root); held["id"] != "s1" || held["harness"] != "claude-code-remote" {
		t.Fatalf("the session file holds %v, and wants the id s1 and the harness claude-code-remote", held)
	}
	other := treeOf(t, nil, "")
	started(t, holdDoor(t, Settings{Words: nameWords}), other, map[string]any{"session": map[string]any{"id": "s2"}})
	if held := sessionHeld(t, other); held["id"] != "s2" {
		t.Fatalf("the session file holds %v, and wants the id the nested session names", held)
	}
}

func TestASessionStartNamingNoIdWritesNoSessionFile(t *testing.T) {
	root := treeOf(t, nil, "")
	door := holdDoor(t, Settings{Words: nameWords})
	started(t, door, root, map[string]any{})
	if held := sessionHeld(t, root); held != nil {
		t.Fatalf("a start naming no id writes %v, and wants no session file", held)
	}
	started(t, door, root, map[string]any{"session_id": "s1"})
	started(t, door, root, map[string]any{"harness": "claude-code"})
	if held := sessionHeld(t, root); held["id"] != "s1" {
		t.Fatalf("the session file holds %v, and wants the id s1 kept past a start naming none", held)
	}
}
