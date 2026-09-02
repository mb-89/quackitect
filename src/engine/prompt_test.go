package main

import (
	"encoding/json"
	"strings"
	"testing"
)

// THE PROMPT IS WHAT THEY WROTE, WHOLE. A person reading the log for what they
// said, and finding the beginning of it, has been given the one thing they were
// checking with the end taken off.
func TestAPromptIsRecordedWhole(t *testing.T) {
	t.Parallel()
	exe := buildEngine(t)
	r := guidanceTree(t)
	Project(r)
	l, _ := OpenLog(r.Private("log"))
	l.Close()

	// Two lines, and longer than any truncation that was in the way.
	long := "the first line of what they said\n" + strings.Repeat("and it went on. ", 30)
	hookSays(t, exe, r.Method, "UserPromptSubmit", map[string]any{"cwd": r.Work, "prompt": long})

	lines := logLines(t, r)
	var rec Record
	json.Unmarshal([]byte(lines[len(lines)-1]), &rec)
	if rec.Src != "user" || rec.Kind != "prompt" {
		t.Fatalf("it was recorded as %s/%s", rec.Src, rec.Kind)
	}
	if rec.Msg != long {
		t.Fatalf("the record holds %d characters of the %d they wrote", len(rec.Msg), len(long))
	}
}
