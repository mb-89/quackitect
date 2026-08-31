package main

import (
	"encoding/json"
	"os/exec"
	"strings"
	"testing"
)

// A WHOLE MESSAGE THAT IS ONE WORD IS A BUTTON. A sentence that mentions
// stopping is a sentence, and the difference has to hold, because getting it
// wrong either way is bad. Missing the word leaves a person unable to stop an
// agent. Firing on prose puts everything down while they were talking.
func TestOnlyAWholeMessageIsAWord(t *testing.T) {
	for _, said := range []string{
		"stop", "Stop", "  STOP  ", "stop.", "stop!", "halt", "hold", "stop it", "stop now",
	} {
		if TheWord(said) != PutItDown {
			t.Fatalf("%q did not put everything down", said)
		}
	}
	for _, said := range []string{"go", "Go on", "resume", "continue", "carry on", "unhold"} {
		if TheWord(said) != PickItUp {
			t.Fatalf("%q did not pick it up again", said)
		}
	}
	// Prose, including prose about stopping. Every one of these is a thing a
	// person says while they want the work to carry on.
	for _, said := range []string{
		"",
		"stop the engine",
		"stop working on the cage and look at the viewer",
		"why did you not stop",
		"I am going to stop you now",
		"go and read the design",
		"continue with the other one",
		"the hold is what stops it",
	} {
		if w := TheWord(said); w != NoWord {
			t.Fatalf("%q was read as a command (%v)", said, w)
		}
	}
}

// END TO END: the person types the word, and the guard puts everything down.
// Then the next thing the agent asks for is refused, and its stop is granted
// without a claim.
func TestTheWordPutsEverythingDownAndPicksItUpAgain(t *testing.T) {
	exe := buildEngine(t)
	r := guidanceTree(t)
	Project(r)
	l, _ := OpenLog(r.Private("log"))
	l.Write("engine", "start", "engine", "engine started", Yes(), nil)
	l.Close()

	if LoadHold(r).On {
		t.Fatal("it started on hold")
	}

	hookSays(t, exe, r.Method, "UserPromptSubmit", map[string]any{
		"cwd": r.Work, "prompt": "stop the engine and tell me why",
	})
	if LoadHold(r).On {
		t.Fatal("a sentence about stopping put everything down")
	}

	hookSays(t, exe, r.Method, "UserPromptSubmit", map[string]any{"cwd": r.Work, "prompt": "stop"})
	if !LoadHold(r).On {
		t.Fatal("the word did not put everything down")
	}

	// Everything the agent asks for is now refused, and the refusal says why.
	out := hookSays(t, exe, r.Method, "PreToolUse", map[string]any{
		"cwd": r.Work, "tool_name": "Bash", "tool_use_id": "t1",
		"tool_input": map[string]any{"command": "echo hello"},
	})
	var says struct {
		Hook struct {
			Decision string `json:"permissionDecision"`
			Reason   string `json:"permissionDecisionReason"`
		} `json:"hookSpecificOutput"`
	}
	if json.Unmarshal([]byte(out), &says) != nil || says.Hook.Decision != "deny" {
		t.Fatalf("a call was not refused while everything is on hold: %s", out)
	}
	if !strings.Contains(says.Hook.Reason, "hold") {
		t.Fatalf("the refusal does not say what is holding: %s", says.Hook.Reason)
	}

	// AND THE STOP IS GRANTED WITH NO CLAIM. The person put it down, so
	// asking the agent to name a reason is asking it to explain their
	// decision.
	if out := hookSays(t, exe, r.Method, "Stop", map[string]any{"cwd": r.Work}); out != "" {
		t.Fatalf("the stop was refused while everything is on hold: %s", out)
	}

	// Their word lifts it, and the word is the only thing that can, because
	// every call the agent could make is refused.
	hookSays(t, exe, r.Method, "UserPromptSubmit", map[string]any{"cwd": r.Work, "prompt": "go"})
	if LoadHold(r).On {
		t.Fatal("the word did not lift the hold")
	}
}

// THE SAME MESSAGE ARRIVES TWO WAYS. One starts a turn and fires an event.
// One is written into a turn already running and fires nothing, so the agent
// carries it here by hand. A person heard on one path and not the other is
// worse off than one heard on neither, because they cannot tell which they got.
func TestTheWordActsWhateverPathTheMessageCameBy(t *testing.T) {
	exe := buildEngine(t)
	r := guidanceTree(t)
	Project(r)
	l, _ := OpenLog(r.Private("log"))
	l.Write("engine", "start", "engine", "engine started", Yes(), nil)
	l.Close()

	say := func(said string) string {
		t.Helper()
		out, err := exec.Command(exe, "--said", said, "--work", r.Work, "--method", r.Method).CombinedOutput()
		if err != nil {
			t.Fatalf("--said failed: %v: %s", err, out)
		}
		return strings.TrimSpace(string(out))
	}

	if out := say("stop the engine and tell me why"); out != "recorded" {
		t.Fatalf("prose did something: %q", out)
	}
	if LoadHold(r).On {
		t.Fatal("prose put everything down")
	}

	if out := say("stop"); !strings.Contains(out, "on hold") {
		t.Fatalf("the word did not put everything down: %q", out)
	}
	if !LoadHold(r).On {
		t.Fatal("the hold was not written")
	}

	if out := say("go"); !strings.Contains(out, "lifted") {
		t.Fatalf("the word did not lift it: %q", out)
	}
	if LoadHold(r).On {
		t.Fatal("the hold outlived the word that lifted it")
	}
}
