// The handover marks the door writes, off marksDue, dropsDue and dropsClear in
// src/bridge/handover.js, and the retro hold it reads by its hand, off
// retroInHand there.
// [[spec/tickets/cage-stop-marks-port]]
package hooks

import (
	"encoding/json"
	"os"
	"path/filepath"
	"testing"
)

// The due mark the module names, the clear hold under the holds folder, and the hands a retro hold carries. [[spec/tickets/cage-stop-marks-port]]
const (
	dueMark   = dueFile
	clearHold = ".se/.runtime/hold/s1.json"
	myHand    = "box mine · claude-code-remote"
	otherHand = "box other · claude-code-remote"
)

func marksDoor(t *testing.T) *Door {
	t.Helper()
	return holdDoor(t, Settings{Binding: queueBinding, BindingLayer: builtInLayer, HandoverAt: caseMark})
}

func measured(t *testing.T, door *Door, root string) {
	t.Helper()
	post := Post{Event: measureEvent, Root: root, E: map[string]any{
		"session_id": "s1",
		"context":    map[string]any{"tokens": float64(caseFill)},
	}}
	if _, err := door.Hook(post); err != nil {
		t.Fatal(err)
	}
}

// A tree holding a retro hold of the hand named, with the box this session stands on. [[spec/tickets/cage-stop-marks-port]]
func retroTree(t *testing.T, hand string) string {
	t.Helper()
	hold, _ := json.Marshal(map[string]any{
		"ticket": "a-retro", "path": "spec/tickets/a-retro.md", "step": "retro/write", "hand": hand,
	})
	return treeOf(t, map[string]string{
		".se/.runtime/box.json":        `{"id":"mine"}`,
		".se/.runtime/hold/other.json": string(hold),
		"spec/tickets/a-retro.md":      "---\nstate: open\n---\n",
	}, "")
}

// [[spec/tickets/cage-stop-marks-port]]
func TestAMeasurePastTheFillWritesTheDueMarkAndADroppedClearDropsIt(t *testing.T) {
	root := treeOf(t, map[string]string{}, "")
	door := marksDoor(t)

	measured(t, door, root)

	body, ok := (disk{root}).Read(dueMark)
	if !ok {
		t.Fatal("a measure past the fill writes no due mark")
	}
	var said map[string]float64
	if err := json.Unmarshal([]byte(body), &said); err != nil || said["tokens"] != caseFill || said["at"] != caseMark {
		t.Fatalf("the due mark reads %q, and names the fill and the key as marksDue does", body)
	}

	clear, _ := json.Marshal(map[string]any{"ticket": clearTicket, "ephemeral": true})
	treeWrite(t, root, clearHold, string(clear))
	door.from.Config = func(string) Settings {
		return Settings{Binding: "god", BindingLayer: trackedLayer, HandoverAt: caseMark}
	}
	if _, err := door.Hook(Post{Event: stopEvent, Root: root, E: map[string]any{"session_id": "s1"}}); err != nil {
		t.Fatal(err)
	}

	if _, ok := (disk{root}).Read(clearHold); ok {
		t.Fatal("a clear held where the queue no longer clears stays held")
	}
	if _, ok := (disk{root}).Read(dueMark); ok {
		t.Fatal("the dropped clear leaves the due mark standing")
	}
}

// [[spec/tickets/cage-stop-marks-port]]
func TestARetroHoldOfAnotherHandLeavesTheSessionsHandoverDue(t *testing.T) {
	t.Setenv("CLAUDE_CODE_REMOTE", "true")
	root := retroTree(t, otherHand)

	measured(t, marksDoor(t), root)

	if _, ok := (disk{root}).Read(dueMark); !ok {
		t.Fatal("a helper's retro hold keeps the session from going due")
	}
}

// [[spec/tickets/cage-stop-marks-port]]
func TestARetroHoldOfTheSessionsOwnHandKeepsTheConversation(t *testing.T) {
	t.Setenv("CLAUDE_CODE_REMOTE", "true")
	root := retroTree(t, myHand)

	measured(t, marksDoor(t), root)

	if _, ok := (disk{root}).Read(dueMark); ok {
		t.Fatal("the session's own retro goes due, and a retro runs to its end in one conversation")
	}
}

func treeWrite(t *testing.T, root, path, text string) {
	t.Helper()
	at := filepath.Join(root, filepath.FromSlash(path))
	if err := os.MkdirAll(filepath.Dir(at), 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(at, []byte(text), 0o644); err != nil {
		t.Fatal(err)
	}
}
