// The hook verb maps a Copilot hook onto the protocol, posts it to the hooks
// door, and prints nothing where no door stands.
// [[spec/tickets/copilot-meets-the-hooks-door]]
package main

import (
	"bytes"
	"os"
	"path/filepath"
	"reflect"
	"strings"
	"testing"

	"quackitect/src/modules/hooks"
	"quackitect/src/q"
)

func TestAHookPostMapsCopilotOntoTheProtocol(t *testing.T) {
	old := map[string]any{"result": map[string]any{"deny": "no"}}
	post := copilotPost("PreToolUse", map[string]any{"session_id": "s1", "tool_name": "github.Bash", "tool_input": map[string]any{"command": "ls"}, "old": old})
	if post.Event != "tool.call" || post.Harness != "copilot" || post.Session != "s1" {
		t.Fatalf("the post reads %+v, and wants tool.call off copilot for s1", post)
	}
	if post.E["tool"] != "Bash" || post.E["session_id"] != "s1" || !reflect.DeepEqual(post.E["input"], map[string]any{"command": "ls"}) {
		t.Fatalf("the event reads %+v, and wants the tool Bash, the session and the input", post.E)
	}
	if !reflect.DeepEqual(post.Old, old) {
		t.Fatalf("the post carries old %+v, and wants the runtime's answer", post.Old)
	}
	for from, want := range map[string]string{"Stop": "classic.Stop", "PostToolUse": "classic.PostToolUse", "SessionStart": "classic.SessionStart"} {
		if got := copilotPost(from, map[string]any{}).Event; got != want {
			t.Fatalf("%s maps onto %q, and wants %q", from, got, want)
		}
	}
}

func TestAHookPostReachesTheDoor(t *testing.T) {
	text, err := os.ReadFile(filepath.Join("..", "..", filepath.FromSlash(q.WiringFile)))
	if err != nil {
		t.Fatal(err)
	}
	w, err := q.ReadWiring(string(text))
	if err != nil {
		t.Fatal(err)
	}
	c := q.New()
	_, hands, err := loaded(w, c)
	if err != nil {
		t.Fatal(err)
	}
	hook := hookedOf(w, hands, hooksModule)
	s := q.NewStore(c)
	door := hooks.New(hooks.Outside{Store: s, As: hook.as, Bound: hook.bound})
	root := t.TempDir()
	stop, err := hooks.Listen(root, door)
	if err != nil {
		t.Fatal(err)
	}
	defer stop()
	var out bytes.Buffer
	if code := hookVerb(root, "PreToolUse", strings.NewReader(`{"session_id":"s1","tool_name":"Read","old":{"result":{}}}`), &out); code != 0 {
		t.Fatalf("the verb exits %d, and wants 0", code)
	}
	if !strings.Contains(out.String(), `"effects"`) {
		t.Fatalf("the verb prints %q, and wants the door's answer", out.String())
	}
	if event, ok := s.Snapshot().Read("session/s1/events").(q.Event); !ok || event.Harness != "copilot" || event.Kind != "tool.call" {
		t.Fatalf("session/s1/events holds %+v, and wants a tool.call off copilot", s.Snapshot().Read("session/s1/events"))
	}
}

func TestAHookWithNoDoorPrintsNothing(t *testing.T) {
	var out bytes.Buffer
	if code := hookVerb(t.TempDir(), "Stop", strings.NewReader("{}"), &out); code != 0 || out.Len() != 0 {
		t.Fatalf("the verb exits %d and prints %q, and wants 0 and nothing", code, out.String())
	}
}
