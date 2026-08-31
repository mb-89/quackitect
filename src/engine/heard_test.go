package main

import (
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// One transcript line in the shape the harness writes for a message typed into
// a turn that is already running. Taken from a real session transcript.
func queued(text string) string {
	line := map[string]any{
		"type": "attachment",
		"attachment": map[string]any{
			"type":        "queued_command",
			"prompt":      []map[string]any{{"type": "text", "text": text}},
			"commandMode": "prompt",
			"origin":      map[string]any{"kind": "human"},
		},
	}
	b, _ := json.Marshal(line)
	return string(b) + "\n"
}

func promptsIn(t *testing.T, r Roots) []string {
	t.Helper()
	b, err := os.ReadFile(filepath.Join(r.Private("log"), Current))
	if err != nil {
		t.Fatal(err)
	}
	var out []string
	for _, l := range strings.Split(string(b), "\n") {
		var rec struct {
			Src  string `json:"src"`
			Kind string `json:"kind"`
			Msg  string `json:"msg"`
		}
		if json.Unmarshal([]byte(l), &rec) == nil && rec.Src == "user" && rec.Kind == "prompt" {
			out = append(out, rec.Msg)
		}
	}
	return out
}

// THE ENGINE COPIES WHAT THE PERSON SAID. The harness fires no event for a
// message written into a running turn, and it writes one to its own transcript.
func TestTheEngineCopiesWhatWasSaidMidTurn(t *testing.T) {
	r := guidanceTree(t)
	l, _ := OpenLog(r.Private("log"))
	l.Write("engine", "start", "engine", "started", Yes(), nil)

	path := filepath.Join(t.TempDir(), "session.jsonl")
	first := "the details in the log need to wrap"
	if err := os.WriteFile(path, nil, 0o644); err != nil {
		t.Fatal(err)
	}
	// The turn opens, which is where the engine starts reading.
	StartWhereItIs(r, path)
	if err := os.WriteFile(path, []byte(queued(first)), 0o644); err != nil {
		t.Fatal(err)
	}
	if n := CopyWhatWasHeard(r, path, l, "main"); n != 1 {
		t.Fatalf("it copied %d messages", n)
	}
	// IT IS THEIR SENTENCE, WHOLE.
	if got := promptsIn(t, r); len(got) != 1 || got[0] != first {
		t.Fatalf("the record carries %q", got)
	}
	// AN ANSWER IS NOW OWED, the same as for a prompt that starts a turn.
	if said, owed := AnswerOwed(r, "main"); !owed || said != first {
		t.Fatalf("nothing is owed after a message arrived: %q %v", said, owed)
	}

	// A SECOND PASS COPIES NOTHING, because it reads only what is new.
	if n := CopyWhatWasHeard(r, path, l, "main"); n != 0 {
		t.Fatalf("a second pass copied %d messages again", n)
	}

	// What arrives after it is copied, and only it.
	second := "and the reviewer submits one token at a time"
	f, _ := os.OpenFile(path, os.O_APPEND|os.O_WRONLY, 0o644)
	f.WriteString(queued(second))
	f.Close()
	if n := CopyWhatWasHeard(r, path, l, "main"); n != 1 {
		t.Fatalf("it copied %d of the one new message", n)
	}
	l.Close()
	got := promptsIn(t, r)
	if len(got) != 2 || got[1] != second {
		t.Fatalf("the record carries %q", got)
	}
}

// ONLY WHAT A PERSON TYPED. A transcript carries the agent's own lines, tool
// calls and queued work of other kinds, and none of those is somebody talking.
func TestOnlyWhatAPersonTypedIsCopied(t *testing.T) {
	r := guidanceTree(t)
	l, _ := OpenLog(r.Private("log"))
	l.Write("engine", "start", "engine", "started", Yes(), nil)

	notHuman := strings.Replace(queued("a hook wrote this"), `"kind":"human"`, `"kind":"hook"`, 1)
	notQueued := strings.Replace(queued("a different attachment"), `"type":"queued_command"`, `"type":"file"`, 1)
	body := `{"type":"user","message":{"role":"user","content":"a turn opener"}}` + "\n" +
		`{"type":"assistant","message":{"role":"assistant","content":[]}}` + "\n" +
		notHuman + notQueued + "not json at all\n" + queued("the one that counts")

	path := filepath.Join(t.TempDir(), "session.jsonl")
	os.WriteFile(path, nil, 0o644)
	StartWhereItIs(r, path)
	if err := os.WriteFile(path, []byte(body), 0o644); err != nil {
		t.Fatal(err)
	}
	n := CopyWhatWasHeard(r, path, l, "main")
	l.Close()
	if n != 1 {
		t.Fatalf("it copied %d of the six lines", n)
	}
	if got := promptsIn(t, r); len(got) != 1 || got[0] != "the one that counts" {
		t.Fatalf("the record carries %q", got)
	}
}

// A TRANSCRIPT THAT WILL NOT READ IS NOT AN ERROR. A person is waiting on the
// tool call the guard is deciding.
func TestAMissingTranscriptCopiesNothingAndSaysNothing(t *testing.T) {
	r := guidanceTree(t)
	l, _ := OpenLog(r.Private("log"))
	l.Write("engine", "start", "engine", "started", Yes(), nil)
	defer l.Close()

	if n := CopyWhatWasHeard(r, "", l, "main"); n != 0 {
		t.Fatalf("it copied %d from no transcript at all", n)
	}
	if n := CopyWhatWasHeard(r, filepath.Join(t.TempDir(), "nowhere.jsonl"), l, "main"); n != 0 {
		t.Fatalf("it copied %d from a transcript that is not there", n)
	}
}

// A TRANSCRIPT THIS ENGINE HAS NOT READ BEFORE STARTS AT ITS END. Everything
// already in it was said before the engine could copy anything, and starting at
// the beginning replayed a whole session.
func TestATranscriptNeverReadStartsAtItsEnd(t *testing.T) {
	r := guidanceTree(t)
	l, _ := OpenLog(r.Private("log"))
	l.Write("engine", "start", "engine", "started", Yes(), nil)

	dir := t.TempDir()
	one := filepath.Join(dir, "one.jsonl")
	os.WriteFile(one, []byte(queued("said before the engine looked")), 0o644)
	if n := CopyWhatWasHeard(r, one, l, "main"); n != 0 {
		t.Fatalf("a transcript never read gave %d rather than nothing", n)
	}
	// And it is now at the end, so what arrives next is copied.
	f, _ := os.OpenFile(one, os.O_APPEND|os.O_WRONLY, 0o644)
	f.WriteString(queued("said after"))
	f.Close()
	if n := CopyWhatWasHeard(r, one, l, "main"); n != 1 {
		t.Fatalf("it copied %d of the one that arrived after", n)
	}

	// A SECOND TRANSCRIPT IS ALSO ONE IT HAS NOT READ.
	two := filepath.Join(dir, "two.jsonl")
	os.WriteFile(two, []byte(queued("a new session")), 0o644)
	if n := CopyWhatWasHeard(r, two, l, "main"); n != 0 {
		t.Fatalf("a new transcript gave %d", n)
	}

	// A TRANSCRIPT THAT SHRANK was replaced under the same name, so its
	// contents are new and the offset it left behind means nothing.
	os.WriteFile(two, []byte(queued("replaced")), 0o644)
	saveHeard(r, heardAt{Path: two, At: 1 << 20})
	if n := CopyWhatWasHeard(r, two, l, "main"); n != 1 {
		t.Fatalf("a shorter transcript gave %d", n)
	}
	l.Close()
}

// A PROMPT THAT STARTS A TURN IS RECORDED BY THE HARNESS EVENT, so the
// transcript pass must not record it a second time.
func TestAPromptThatStartsATurnIsNotCopiedTwice(t *testing.T) {
	r := guidanceTree(t)
	l, _ := OpenLog(r.Private("log"))
	l.Write("engine", "start", "engine", "started", Yes(), nil)

	path := filepath.Join(t.TempDir(), "session.jsonl")
	os.WriteFile(path, []byte(queued("everything before this turn")), 0o644)
	StartWhereItIs(r, path)
	n := CopyWhatWasHeard(r, path, l, "main")
	l.Close()
	if n != 0 {
		t.Fatalf("it copied %d from before the turn started", n)
	}
}

// THE TWO WRITERS ARE RECONCILED, AND THE CHECK IS ON THE ONE THAT HAD NONE.
//
// Two writers copy what a person said: the engine, reading the transcript, and
// the agent, calling the said verb. The guard against writing the same message
// twice was put at both call sites and only one of them was checked, so the
// engine's copier could stop asking and every check in the tree stayed green.
func TestTheEngineDoesNotCopyWhatTheAgentAlreadyWrote(t *testing.T) {
	r := guidanceTree(t)
	l, _ := OpenLog(r.Private("log"))
	l.Write("engine", "start", "engine", "started", Yes(), nil)

	path := filepath.Join(t.TempDir(), "session.jsonl")
	said := "the reviewer backlog is too big"
	if err := os.WriteFile(path, nil, 0o644); err != nil {
		t.Fatal(err)
	}
	StartWhereItIs(r, path)

	// The agent got there first, which is what the said verb is for.
	l.Write("user", "prompt", "owner", said, nil, nil)
	if err := os.WriteFile(path, []byte(queued(said)), 0o644); err != nil {
		t.Fatal(err)
	}
	if n := CopyWhatWasHeard(r, path, l, "main"); n != 0 {
		t.Fatalf("the engine copied %d records the agent had already written", n)
	}
	l.Close()
	if got := promptsIn(t, r); len(got) != 1 {
		t.Fatalf("one message left %d records: %q", len(got), got)
	}
}

// AND THE COUNT OF RECORDS IS THE COUNT OF MESSAGES.
//
// Reconciling by presence swallowed a message the person really sent. Two
// identical messages with no answer between them, which is how a person
// actually interrupts a running turn, became one record. That is the same
// family as the double count it was written to fix, in the direction that
// loses what somebody said.
func TestTwoIdenticalMessagesAreTwoRecords(t *testing.T) {
	r := guidanceTree(t)
	l, _ := OpenLog(r.Private("log"))
	l.Write("engine", "start", "engine", "started", Yes(), nil)

	path := filepath.Join(t.TempDir(), "session.jsonl")
	said := "go on"
	if err := os.WriteFile(path, nil, 0o644); err != nil {
		t.Fatal(err)
	}
	StartWhereItIs(r, path)
	if err := os.WriteFile(path, []byte(queued(said)+queued(said)), 0o644); err != nil {
		t.Fatal(err)
	}
	if n := CopyWhatWasHeard(r, path, l, "main"); n != 2 {
		t.Fatalf("two messages made %d records", n)
	}
	l.Close()
	if got := promptsIn(t, r); len(got) != 2 {
		t.Fatalf("the record carries %q", got)
	}
}

// A MESSAGE BELONGS TO THE WALKER, NOT TO WHOEVER HAPPENED TO COPY IT.
//
// A person types into one window. Whichever agent's tool call reaches the
// transcript first is the one that copies the message, and it was the one told
// to answer. So a reviewer was refused every call until it answered a message
// about the walker's work, while the walker that could act on it answered
// unrefused. Three answers reached one question, twice in one afternoon, which
// is the exact failure the store was keyed by actor to prevent.
func TestAMidTurnMessageIsOwedByTheWalker(t *testing.T) {
	r := guidanceTree(t)
	l, _ := OpenLog(r.Private("log"))
	l.Write("engine", "start", "engine", "started", Yes(), nil)

	path := filepath.Join(t.TempDir(), "session.jsonl")
	if err := os.WriteFile(path, nil, 0o644); err != nil {
		t.Fatal(err)
	}
	StartWhereItIs(r, path)
	const said = "the reviewer backlog is too big"
	if err := os.WriteFile(path, []byte(queued(said)), 0o644); err != nil {
		t.Fatal(err)
	}

	// A reviewer's tool call is what reaches the transcript first.
	if n := CopyWhatWasHeard(r, path, l, "reviewer3"); n != 1 {
		t.Fatalf("it copied %d messages", n)
	}
	l.Close()

	if said, owed := AnswerOwed(r, "reviewer3"); owed {
		t.Fatalf("the agent that copied it was told to answer it: %q", said)
	}
	got, owed := AnswerOwed(r, Walker)
	if !owed || got != said {
		t.Fatalf("the walker owes %q, %v", got, owed)
	}
}
