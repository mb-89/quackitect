package main

import (
	"bytes"
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"quackitect/engine/internal/voice"
)

// UNBINDING TAKES THE PROCESS OFF AND LEAVES THE SAFETY ON.
//
// THE OWNER'S ASK: sometimes I want to work on one specific thing, and the
// queue rules have to be switched off for that.
//
// The line this holds is which rules go. A mode that took the voice check and
// the schema caps off with the queue would be the thing a person reaches for
// whenever the engine is merely inconvenient, and then it is always on.
func TestUnboundTakesTheQueueOffAndLeavesTheTreeGuarded(t *testing.T) {
	r := aTreeWithTheProcesses(t)
	if at := LoadBinding(r).At; at != Bound {
		t.Fatalf("a fresh tree is %q, and bound is the resting state", at)
	}
	if Unleashed(r) || NoGuardsAtAll(r) {
		t.Fatal("a fresh tree reads as unleashed")
	}

	if _, err := SetBinding(r, Unbound, "the owner"); err != nil {
		t.Fatal(err)
	}
	if !Unleashed(r) {
		t.Fatal("the queue is still on after unbinding")
	}
	if NoGuardsAtAll(r) {
		t.Fatal("unbinding took every guard off, and it takes the process off")
	}

	// THE QUEUE IS OFF AND THE TOKEN IS NOT. Unbound means this agent is out of
	// the queue, and it still names its work on every write.
	// TestEveryRungButGodNamesItsToken drives all three rungs against one write.
	if _, refuse := WriteNeedsAToken(r, "main", "Write", "doc/x.md", ""); !refuse {
		t.Fatal("this test proves nothing: the gate does not refuse a write naming no token")
	}
	log, err := OpenLog(r.Private("log"))
	if err != nil {
		t.Fatal(err)
	}
	defer log.Close()
	record(log, "engine", "start", "engine", "engine started", Yes(), nil)
	write := func(text string) string {
		t.Helper()
		body, _ := json.Marshal(map[string]any{"hook_event_name": "PreToolUse", "cwd": r.Work,
			"session_id": "s-1", "tool_name": "Write",
			"tool_input": map[string]any{"file_path": "doc/x.md", "content": text}})
		var out bytes.Buffer
		answerHook(t.Context(), body, []string{"--method", r.Method}, &out, log)
		return out.String()
	}
	if said := write("The engine reads the tree.\n"); !strings.Contains(said, theWriteDoor) {
		t.Fatalf("unbinding took the token off the write along with the queue: %s", said)
	}

	// AND THE TREE IS STILL GUARDED. The voice rules are the clearest of them,
	// because they refuse the CONTENT rather than the procedure, and a mode
	// that took them off with the queue would be the one a person reaches for
	// whenever the engine is merely inconvenient.
	raw, err := os.ReadFile(filepath.Join("..", "..", "util", "voice-rules.json"))
	if err != nil {
		t.Fatalf("the tree's voice rules will not read: %v", err)
	}
	if err := writeAtomic(filepath.Join(r.Method, "util", "voice-rules.json"), raw, 0o644); err != nil {
		t.Fatal(err)
	}
	rules, err := voice.Load(r.Method)
	if err != nil {
		t.Fatal(err)
	}
	bad := ""
	for _, try := range []string{
		"It doesn't matter; the engine e.g. reads it.\n",
		"This is utilized in order to leverage the tree.\n",
	} {
		if len(rules.Check(try)) > 0 {
			bad = try
			break
		}
	}
	if bad == "" {
		t.Fatal("no sentence this test knows breaks a voice rule, so it cannot show the guard standing")
	}
	// IT IS THE VOICE GUARD THAT REFUSES IT, AND NOT THE TOKEN RULE ABOVE. Both
	// refuse this call now, so a test reading only deny would pass on the wrong
	// one and say nothing about the voice rules at all.
	said := write(bad)
	if !strings.Contains(said, "deny") {
		t.Fatalf("unbinding took the voice check off with the queue: %s", said)
	}
	if strings.Contains(said, theWriteDoor) {
		t.Fatalf("the token rule answered first, so this proves nothing about the voice check: %s", said)
	}
}

// GOD MODE TAKES EVERY REFUSAL OFF, AND SAYS NOTHING PER CALL.
func TestGodModeRefusesNothingAndIsNotSpoken(t *testing.T) {
	r := aTreeWithTheProcesses(t)
	log, err := OpenLog(r.Private("log"))
	if err != nil {
		t.Fatal(err)
	}
	defer log.Close()
	record(log, "engine", "start", "engine", "engine started", Yes(), nil)

	// A CALL THE ENGINE WOULD REFUSE while bound: a shell command naming no
	// token, by the main agent, with work waiting.
	for i := 0; i < 3; i++ {
		mintStandard(t, r, "open work")
	}
	decide := func() string {
		t.Helper()
		body, _ := json.Marshal(map[string]any{"hook_event_name": "PreToolUse", "cwd": r.Work,
			"session_id": "s-1", "tool_name": "Bash", "tool_input": map[string]any{"command": "rm -rf src"}})
		var out bytes.Buffer
		answerHook(t.Context(), body, []string{"--method", r.Method}, &out, log)
		return out.String()
	}
	if said := decide(); !strings.Contains(said, "deny") {
		t.Fatalf("this test proves nothing: a bound tree let it through: %s", said)
	}

	if _, err := SetBinding(r, God, "the owner"); err != nil {
		t.Fatal(err)
	}
	if !NoGuardsAtAll(r) || !Unleashed(r) {
		t.Fatal("god mode is not god mode, or does not imply unbound")
	}
	if said := decide(); strings.Contains(said, "deny") {
		t.Fatalf("god mode refused a call: %s", said)
	}
}

// THE PERSON'S OWN CONTROLS ARE ABOVE THE OVERRIDE, NEVER BELOW IT.
//
// An override that could also silence whoever is holding it is not an
// override, it is a runaway. So the hold and the ask are enforced before the
// binding is read at all, and god mode does not reach them.
func TestGodModeDoesNotSilenceThePerson(t *testing.T) {
	r := aTreeWithTheProcesses(t)
	log, err := OpenLog(r.Private("log"))
	if err != nil {
		t.Fatal(err)
	}
	defer log.Close()
	record(log, "engine", "start", "engine", "engine started", Yes(), nil)
	if _, err := SetBinding(r, God, "the owner"); err != nil {
		t.Fatal(err)
	}
	decide := func(tool string) string {
		t.Helper()
		body, _ := json.Marshal(map[string]any{"hook_event_name": "PreToolUse", "cwd": r.Work,
			"session_id": "s-1", "tool_name": tool, "tool_input": map[string]any{"command": "ls"}})
		var out bytes.Buffer
		answerHook(t.Context(), body, []string{"--method", r.Method}, &out, log)
		return out.String()
	}

	// THE HOLD STILL STOPS IT.
	if _, err := SetHold(r, HoldHeld, "the owner"); err != nil {
		t.Fatal(err)
	}
	if said := decide("Bash"); !strings.Contains(said, "deny") {
		t.Fatalf("the hold did not stop an agent in god mode: %s", said)
	}
	if _, err := SetHold(r, HoldOff, "the owner"); err != nil {
		t.Fatal(err)
	}

	// AND THE ASK STILL STOPS IT, until it answers.
	if _, err := SetAsked(r, true, "the owner"); err != nil {
		t.Fatal(err)
	}
	if said := decide("Bash"); !strings.Contains(said, "deny") {
		t.Fatalf("the ask did not stop an agent in god mode: %s", said)
	}
	// ANSWERING IS THE ONE CALL THAT GOES THROUGH, which is what makes the
	// refusal one somebody can satisfy.
	if said := decide("mcp__quackitect__se_answer"); strings.Contains(said, "deny") {
		t.Fatalf("answering was refused, so the refusal cannot be satisfied: %s", said)
	}
}

// ONE PRESS GOES BACK TO BOUND FROM EITHER RUNG.
//
// Climbing is deliberate and releasing is easy, which is v3's ruling and what
// makes a stray press safe: it always falls down, never up.
func TestOnePressReleasesFromEitherRung(t *testing.T) {
	t.Parallel()
	if got := TheRungBelow(Bound); got != Unbound {
		t.Fatalf("a press while bound went to %q", got)
	}
	if got := TheRungBelow(Unbound); got != Bound {
		t.Fatalf("a press while unbound went to %q, and one press releases", got)
	}
	if got := TheRungBelow(God); got != Bound {
		t.Fatalf("a press while in god mode went to %q, and one press releases all the way", got)
	}
}

// A HANDOVER IS NOT A START. A swap is one session with two processes in it, so
// the log the successor opens says it is continuing and the rung is left alone.
func TestAHandoverContinuesTheSessionRatherThanStartingOne(t *testing.T) {
	dir := t.TempDir()
	// THE BATON IS TAKEN OUT OF THE ENVIRONMENT FIRST. This suite runs under an
	// engine that may itself have been handed a session, and the variable is
	// process-wide, so a first log opened without clearing it reads as a
	// successor's.
	t.Setenv(sessionVar, "")
	fresh, err := OpenLog(dir)
	if err != nil {
		t.Fatal(err)
	}
	defer fresh.Close()
	if fresh.Continued() {
		t.Error("a log opened with no session to continue says it is continuing one")
	}
	t.Setenv(sessionVar, fresh.Session())
	next, err := OpenLog(dir)
	if err != nil {
		t.Fatal(err)
	}
	defer next.Close()
	if !next.Continued() {
		t.Error("a successor handed a session says it began one, so a swap would bind the person again")
	}
}

// A BINDING NOTHING CAN READ IS BOUND, because the safe answer to not knowing
// is every rule on.
func TestAnUnreadableBindingIsBound(t *testing.T) {
	t.Parallel()
	r := aTreeToWriteIn(t)
	if err := writeAtomic(bindingPath(r), []byte("{not json"), 0o644); err != nil {
		t.Fatal(err)
	}
	if at := LoadBinding(r).At; at != Bound {
		t.Fatalf("a binding that will not read answered %q", at)
	}
	if err := writeAtomic(bindingPath(r), []byte(`{"at":"whatever"}`), 0o644); err != nil {
		t.Fatal(err)
	}
	if at := LoadBinding(r).At; at != Bound {
		t.Fatalf("a rung this engine does not know answered %q", at)
	}
}
