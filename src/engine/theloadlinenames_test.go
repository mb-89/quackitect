package main

import (
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"quackitect/engine/internal/sessionlog"
)

// THE LOAD LINE SAYS WHICH HOOK WAS SLOW.
//
// The line carried the queue depth, the wait and the answer time, and named
// nothing. The owner read one saying 6236 ms, twelve times the bound the engine
// calls slow, and could not tell what had been slow.
//
// A READER CANNOT TELL A WRITE BEING CHECKED FROM A SEARCH BEING REFUSED. Both
// are hooks and both are numbers, and the numbers alone say which is which for
// nobody. The handler already holds the event, which carries both names.
func TestTheLoadLineNamesItsHook(t *testing.T) {
	t.Parallel()
	for _, one := range []struct {
		what, tool string
		event      HookEvent
		says       []string
	}{
		{"a tool being checked", "Bash", EventPreToolUse,
			[]string{"PreToolUse", "Bash", "answered in"}},
		{"an event with no tool", "", EventStop,
			[]string{"Stop", "answered in"}},
		{"nothing to name", "", "",
			[]string{"the guard was slow on one hook", "answered in"}},
	} {
		t.Run(one.what, func(t *testing.T) {
			t.Parallel()
			said := theLoadLine(t, one.tool, one.event)
			for _, want := range one.says {
				if !strings.Contains(said.Msg, want) {
					t.Errorf("the line does not say %q: %q", want, said.Msg)
				}
			}
			// AND THE RECORD CARRIES THEM AS FIELDS, so a query can group by
			// them rather than reading the sentence.
			if got, _ := said.Data["tool"].(string); got != one.tool {
				t.Errorf("the record says the tool is %q and it is %q", got, one.tool)
			}
			if got, _ := said.Data["event"].(string); got != string(one.event) {
				t.Errorf("the record says the event is %q and it is %q", got, one.event)
			}
			// AND THE NUMBERS STAND WHATEVER IS NAMED.
			if said.Data["took_ms"] == nil || said.Data["queued"] == nil {
				t.Errorf("the line lost its numbers: %+v", said.Data)
			}
		})
	}
}

// theLoadLine drives one slow hook and answers the load record it wrote.
func theLoadLine(t *testing.T, tool string, event HookEvent) sessionlog.Record {
	t.Helper()
	dir := t.TempDir()
	log, err := sessionlog.Open(dir)
	if err != nil {
		t.Fatal(err)
	}
	log.Write("engine", "start", "engine", "engine started", sessionlog.Yes(), nil)
	// A LOAD OF ITS OWN, because the counter throttles to one line a minute and
	// the engine's own is shared with whatever else is running.
	var l engineLoad
	l.noteHook(log, 0, 0, hookTookBound, tool, event)
	log.Close()

	b, err := os.ReadFile(filepath.Join(dir, sessionlog.Current))
	if err != nil {
		t.Fatal(err)
	}
	var out []sessionlog.Record
	for _, line := range strings.Split(strings.TrimSpace(string(b)), "\n") {
		var rec sessionlog.Record
		if json.Unmarshal([]byte(line), &rec) == nil && rec.Kind == "load" {
			out = append(out, rec)
		}
	}
	if len(out) != 1 {
		t.Fatalf("one slow hook wrote %d load lines", len(out))
	}
	return out[0]
}
