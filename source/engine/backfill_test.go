package main

import (
	"encoding/json"
	"os"
	"path/filepath"
	"testing"
)

func transcript(t *testing.T, lines ...string) string {
	t.Helper()
	p := filepath.Join(t.TempDir(), "t.jsonl")
	var out string
	for _, l := range lines {
		out += l + "\n"
	}
	if err := os.WriteFile(p, []byte(out), 0o644); err != nil {
		t.Fatal(err)
	}
	return p
}

// A tool result is a user message to a harness, and it is not something a
// person said. Only text counts.
func TestOnlyWhatThePersonSaidIsReadOutOfATranscript(t *testing.T) {
	p := transcript(t,
		`{"type":"user","message":{"role":"user","content":[{"type":"text","text":"the first thing"}]}}`,
		`{"type":"assistant","message":{"role":"assistant","content":[{"type":"text","text":"an answer"}]}}`,
		`{"type":"user","message":{"role":"user","content":[{"type":"tool_result","content":"some output"}]}}`,
		`{"type":"user","message":{"role":"user","content":"a plain string message"}}`,
		`{"type":"file-history-snapshot","timestamp":"now"}`,
		`not json at all`,
		`{"type":"user","message":{"role":"user","content":[{"type":"text","text":"  "}]}}`,
	)
	got := PromptsIn(p)
	if len(got) != 2 || got[0] != "the first thing" || got[1] != "a plain string message" {
		t.Fatalf("it read %q", got)
	}
}

// THE HOLE THIS EXISTS FOR. The harness sends no event for a message written
// into a turn that is already running, so the record loses the person's words.
func TestPromptsTheHarnessSentNoEventForAreRecovered(t *testing.T) {
	r := Roots{Method: t.TempDir(), Work: t.TempDir()}
	dir := r.Private("log")
	l, err := OpenLog(dir)
	if err != nil {
		t.Fatal(err)
	}
	l.Write("engine", "start", "engine", "engine started", Yes(), nil)
	// One prompt did arrive as an event.
	l.Write("user", "prompt", "main", "the first thing", nil, nil)
	l.Close()

	p := transcript(t,
		`{"type":"user","message":{"role":"user","content":[{"type":"text","text":"the first thing"}]}}`,
		`{"type":"user","message":{"role":"user","content":[{"type":"text","text":"the one that went missing"}]}}`,
		`{"type":"user","message":{"role":"user","content":[{"type":"text","text":"and another"}]}}`,
	)
	if n := BackfillPrompts(dir, p, "main"); n != 2 {
		t.Fatalf("it recovered %d, and two were missing", n)
	}

	// Running again recovers nothing, because nothing is missing now.
	if n := BackfillPrompts(dir, p, "main"); n != 0 {
		t.Fatalf("it wrote %d prompts a second time", n)
	}

	var said []string
	b, _ := os.ReadFile(filepath.Join(dir, Current))
	for _, line := range splitLines(string(b)) {
		var rec Record
		if json.Unmarshal([]byte(line), &rec) == nil && rec.Kind == "prompt" {
			said = append(said, rec.Msg)
		}
	}
	if len(said) != 3 {
		t.Fatalf("the record holds %d prompts: %q", len(said), said)
	}
}

// A transcript that is not there, or is a shape this does not know, leaves the
// record as it was. That is what it would have been anyway.
func TestATranscriptThatCannotBeReadChangesNothing(t *testing.T) {
	r := Roots{Method: t.TempDir(), Work: t.TempDir()}
	dir := r.Private("log")
	l, _ := OpenLog(dir)
	l.Write("engine", "start", "engine", "engine started", Yes(), nil)
	l.Close()

	if n := BackfillPrompts(dir, filepath.Join(t.TempDir(), "nothing.jsonl"), "main"); n != 0 {
		t.Fatalf("it invented %d prompts from a file that is not there", n)
	}
	p := transcript(t, `{"type":"user","message":{"role":"user","content":{"unexpected":"shape"}}}`)
	if n := BackfillPrompts(dir, p, "main"); n != 0 {
		t.Fatalf("it read %d prompts out of a shape it does not know", n)
	}
}

func splitLines(s string) []string {
	var out []string
	start := 0
	for i := 0; i < len(s); i++ {
		if s[i] == '\n' {
			if i > start {
				out = append(out, s[start:i])
			}
			start = i + 1
		}
	}
	return out
}

// A HARNESS PUTS ITS OWN WORDS WHERE THE PERSON'S GO. What a hook printed
// comes back as a user message, and writing it into the record fills the
// record with the engine talking to itself.
func TestTheEnginesOwnWordsAreNotReadBackAsProm(t *testing.T) {
	p := transcript(t,
		`{"type":"user","message":{"role":"user","content":[{"type":"text","text":"something the person wrote"}]}}`,
		`{"type":"user","message":{"role":"user","content":[{"type":"text","text":"Stop hook feedback:\nTHESE STOPS ARE SANCTIONED AND NOTHING ELSE IS."}]}}`,
		`{"type":"user","message":{"role":"user","content":[{"type":"text","text":"<system-reminder>\nsomething the harness said\n</system-reminder>"}]}}`,
		`{"type":"user","message":{"role":"user","content":[{"type":"text","text":"and another thing the person wrote"}]}}`,
	)
	got := PromptsIn(p)
	if len(got) != 2 {
		t.Fatalf("it read %d prompts, and two were the person's: %q", len(got), got)
	}
	if got[0] != "something the person wrote" || got[1] != "and another thing the person wrote" {
		t.Fatalf("it read %q", got)
	}
}
