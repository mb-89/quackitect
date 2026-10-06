// The reply probe at the door, off the cases test/level0/reply-hook.test.js
// held: the main agent's first call after a marked prompt lands in the session
// log as the probe's row, and no other call does.
// [[spec/tickets/level0-hooks-forward-to-go]]
package hooks

import (
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// The line the probe's prompt asks the agent to write, as REPLY_PROBE.says in .claude/skills/level0/lib/guidance.js names it. [[spec/tickets/level0-hooks-forward-to-go]]
const replySays = ReplyMarker + " writes this line"

// The posts of session s1 under a fresh tree, and the probe rows its session log holds after them. [[spec/tickets/level0-hooks-forward-to-go]]
func probeRows(t *testing.T, posts ...Post) []LogRow {
	t.Helper()
	root := treeOf(t, nil, "")
	door := holdDoor(t, Settings{Words: nameWords})
	for _, post := range posts {
		post.Root = root
		post.E["session_id"] = "s1"
		hooks(t, door, post)
	}
	text, _ := os.ReadFile(filepath.Join(root, filepath.FromSlash(sessionLog)))
	var out []LogRow
	for _, line := range strings.Split(string(text), "\n") {
		var row LogRow
		if json.Unmarshal([]byte(line), &row) == nil && row.Said == ReplyEvent {
			out = append(out, row)
		}
	}
	return out
}

func submitted(text string) Post {
	return Post{Event: promptEvent, E: map[string]any{"text": text}}
}

func called(e map[string]any) Post {
	return Post{Event: toolEvent, E: e}
}

func TestTheFirstCallAfterAMarkedPromptWritesTheReplyProbeRow(t *testing.T) {
	rows := probeRows(t,
		submitted(ReplyMarker+". In one message, write the line as text, then call Read on README.md."),
		called(map[string]any{"tool": "Read", "file_path": "README.md", "text": replySays}),
		called(map[string]any{"tool": "Glob", "pattern": "*.md"}),
	)
	if len(rows) != 1 {
		t.Fatalf("the log holds %d probe rows, %+v, and wants the first call's alone", len(rows), rows)
	}
	var detail map[string]any
	if err := json.Unmarshal([]byte(rows[0].Detail), &detail); err != nil || detail["text"] != replySays || detail["tool"] != "Read" {
		t.Fatalf("the probe row's detail reads %q, and wants the call's fields with the text it carries", rows[0].Detail)
	}
}

func TestAPromptWithNoMarkerAndAHelpersCallWriteNoProbeRow(t *testing.T) {
	if rows := probeRows(t, submitted("Say hello."), called(map[string]any{"tool": "Read", "file_path": "README.md"})); len(rows) != 0 {
		t.Fatalf("a call after a plain prompt writes %+v, and wants no probe row", rows)
	}
	rows := probeRows(t,
		submitted(ReplyMarker+". Write the line."),
		called(map[string]any{"tool": "Read", "file_path": "a.md", "agentId": "h1"}),
		called(map[string]any{"tool": "Read", "file_path": "README.md", "text": replySays}),
	)
	if len(rows) != 1 || !strings.Contains(rows[0].Detail, "README.md") {
		t.Fatalf("a helper's call and then the main agent's write %+v, and want one row, off the main agent's call", rows)
	}
}
