package main

import (
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"testing"

	saidbefore "quackitect/engine/internal/said"
)

// ONE PROMPT, ONE RECORD, WHOEVER WRITES IT. The engine copies the transcript
// and the agent calls the said verb, and the log carried six records for four
// messages.
func TestOnePromptOneRecord(t *testing.T) {
	t.Parallel()
	r := guidanceTree(t)
	dir := r.Private("log")
	l, _ := OpenLog(dir)
	l.Write("engine", "start", "engine", "started", Yes(), nil)
	l.Close()

	said := "the editor is still not right"
	if saidbefore.Already(SessionLog(r), said) {
		t.Fatal("it was already said before anybody said it")
	}
	noteInLog(dir, "user", "prompt", said, nil, nil)
	if !saidbefore.Already(SessionLog(r), said) {
		t.Fatal("a message written once does not read back as said")
	}
	// Whitespace is not a second message.
	if !saidbefore.Already(SessionLog(r), "  "+said+"\n") {
		t.Fatal("the same words with different spacing read as a new message")
	}
	// A different message is a different message.
	if saidbefore.Already(SessionLog(r), "something else") {
		t.Fatal("a message nobody said reads as said")
	}
}

// A REPEAT IS THE SAME WORDS SINCE THE LAST ANSWER. The same sentence twice,
// with an answer between, is two things a person said and both belong in the
// record.
func TestTheSameWordsAfterAnAnswerAreANewMessage(t *testing.T) {
	t.Parallel()
	r := guidanceTree(t)
	dir := r.Private("log")
	l, _ := OpenLog(dir)
	l.Write("engine", "start", "engine", "started", Yes(), nil)
	l.Close()

	noteInLog(dir, "user", "prompt", "keep going", nil, nil)
	if !saidbefore.Already(SessionLog(r), "keep going") {
		t.Fatal("it does not read back")
	}
	noteInLog(dir, "agent", "answer", "on it", nil, nil)
	if saidbefore.Already(SessionLog(r), "keep going") {
		t.Fatal("a message said again after an answer was refused as a repeat")
	}
}

// The verb refuses a repeat rather than asking the caller to check, so a rule
// that says always record is safe.
func TestTheSaidVerbRefusesARepeat(t *testing.T) {
	t.Parallel()
	exe := buildEngine(t)
	r := guidanceTree(t)
	l, _ := OpenLog(r.Private("log"))
	l.Write("engine", "start", "engine", "started", Yes(), nil)
	l.Close()

	say := func() string {
		out, err := exec.Command(exe, "--said", "the editor is still not right",
			"--work", r.Work, "--method", r.Method).CombinedOutput()
		if err != nil {
			t.Fatalf("%v: %s", err, out)
		}
		return string(out)
	}
	if out := say(); !strings.Contains(out, "recorded") {
		t.Fatalf("the first say answered %q", out)
	}
	if out := say(); !strings.Contains(out, "already recorded") {
		t.Fatalf("the second say answered %q", out)
	}
	b, err := os.ReadFile(filepath.Join(r.Private("log"), Current))
	if err != nil {
		t.Fatal(err)
	}
	if n := strings.Count(string(b), `"kind":"prompt"`); n != 1 {
		t.Fatalf("the log holds %d prompt records for one message", n)
	}
}
