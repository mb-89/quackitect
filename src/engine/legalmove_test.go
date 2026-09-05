package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// EVERY COMMAND A REFUSAL OFFERS IS ONE THE GATE ADMITS.
//
// A refusal is a menu, and a menu whose every line is refused by the same gate
// is a wall. TestEveryDoorARefusalNamesGetsPastTheGuard reads the RUNME doors
// and nothing else, so the piped se run and se apply lines the write refusal
// still leads with were never judged: a lane-less session typed the first line
// it was shown and met the gate again. So every indented command is read here,
// in the shape it prints, and the gate is the judge of it rather than a reader.
func TestEveryCommandARefusalOffersIsAdmitted(t *testing.T) {
	r := aTreeWithTheProcesses(t)
	log, err := OpenLog(r.Private("log"))
	if err != nil {
		t.Fatal(err)
	}
	defer log.Close()
	record(log, "engine", "start", "engine", "engine started", Yes(), nil)

	refusals := map[string]string{}
	for _, tool := range []string{"Bash", "PowerShell", "Write", "Edit", "NotebookEdit"} {
		refusals["theRefusal for "+tool] = theRefusal(r, "main", tool, "the/file.go")
	}
	if why, refused := WriteNeedsAToken(r, "main", "Bash", "", "./RUNME.sh pull --help | head -40"); !refused {
		t.Fatal("this proves nothing: a piped engine call was not refused")
	} else {
		refusals["a piped engine call"] = why
	}
	if why, refused := TodoIsASubToken(r, "main", "TodoWrite"); !refused {
		t.Fatal("this proves nothing: the todo list was not refused")
	} else {
		refusals["the todo list"] = why
	}
	tok := mintStandard(t, r, "held by a helper")
	ghost := aGhost(t, r, "general-purpose-9", "worker-legal", tok.ID)
	if why, refused := AHelperStopHoldingWork(r, ghost); !refused {
		t.Fatal("this proves nothing: a helper holding work was not refused its stop")
	} else {
		refusals["a helper stopping with work in hand"] = why
	}
	refusals["the stop challenge"] = TheChallenge(StopClaim{Because: "blocked", Why: "it waits"}, 1,
		[]Token{{ID: "wk-1111111111", Title: "held"}})

	found := 0
	for from, said := range refusals {
		commands := theCommandsOffered(said)
		if len(commands) == 0 {
			t.Errorf("%s offers no command at all, so a lane-less session has no move:\n%s", from, said)
		}
		for _, line := range commands {
			found++
			typed := asAnAgentWouldType(line)
			if !runsTheEngine(typed) {
				t.Errorf("%s offers a command the gate refuses:\n  %s\n%s", from, line, whatDisqualified(typed))
			}
		}
	}
	if found < 5 {
		t.Fatalf("only %d commands were read off %d refusals, so this judged almost nothing", found, len(refusals))
	}
}

// theCommandsOffered answers every command a refusal tells the agent to type: an
// indented line whose first word is the engine or that pipes into it, and the
// RUNME door where it stands in prose. A line ending in a pipe carries on to
// the next, because the apply example was printed over two.
func theCommandsOffered(said string) []string {
	var out []string
	lines := strings.Split(said, "\n")
	for i := 0; i < len(lines); i++ {
		raw := lines[i]
		line := strings.TrimSpace(raw)
		for strings.HasSuffix(line, "|") && i+1 < len(lines) {
			i++
			line += " " + strings.TrimSpace(lines[i])
		}
		if at := strings.Index(line, "./RUNME.sh"); at >= 0 {
			out = append(out, line[at:])
			continue
		}
		if !strings.HasPrefix(raw, "  ") || line == "" {
			continue
		}
		if isTheEngine(firstWord(line)) || strings.Contains(line, "| se ") {
			out = append(out, line)
		}
	}
	return out
}

// THE PAYLOAD COMES FROM THE SCRATCHPAD, WHICH IS WHERE A LANE-LESS SESSION CAN PUT IT.
//
// --command and --edits carry a payload inline, and a command line holds
// quotes, newlines and dollar signs that every layer between the agent and the
// engine reads its own way. The harness's Write may put a file under
// .se/scratchpad with nothing in hand, so a file there is the one payload a
// session with no lane can write exactly. --from reads it whole.
func TestAPayloadComesFromTheScratchpad(t *testing.T) {
	t.Parallel()
	r := aTreeWithTheProcesses(t)
	tok := aLocalToken(t, r, "a payload file")
	pad := r.Private("scratchpad")
	if err := os.MkdirAll(pad, 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(filepath.Join(pad, "cmd.txt"), []byte("echo from the file\n"), 0o644); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(filepath.Join(pad, "manifest.json"),
		[]byte(`[{"file":"by-from.txt","op":"create","new":"from the scratchpad"}]`), 0o644); err != nil {
		t.Fatal(err)
	}

	// THE COMMAND IS READ FROM THE FILE AND NOT FROM THE PIPE.
	said := theVerbSaid(t, r, "run", "echo the pipe", "--on", tok.ID, "--by", "tester",
		"--from", ".se/scratchpad/cmd.txt")
	if !strings.Contains(said, "from the file") || strings.Contains(said, "the pipe") {
		t.Fatalf("--from did not run the file's command instead of standard input: %s", said)
	}

	// A DRY APPLY CHECKS THE MANIFEST AND WRITES NOTHING.
	said = theVerbSaid(t, r, "apply", "", "--on", tok.ID, "--by", "tester", "--dry",
		"--from", ".se/scratchpad/manifest.json")
	if !strings.Contains(said, `"dry"`) || strings.Contains(said, `"error"`) {
		t.Fatalf("a dry apply --from was not taken: %s", said)
	}
	if _, err := os.Stat(filepath.Join(r.Work, "by-from.txt")); err == nil {
		t.Fatal("a dry apply wrote the file")
	}
	said = theVerbSaid(t, r, "apply", "", "--on", tok.ID, "--by", "tester",
		"--from", ".se/scratchpad/manifest.json")
	if _, err := os.Stat(filepath.Join(r.Work, "by-from.txt")); err != nil {
		t.Fatalf("apply --from wrote nothing: %s", said)
	}

	// A PATH THAT CLIMBS OUT OF THE SCRATCHPAD IS REFUSED, AND THE REFUSAL SAYS WHY.
	if err := os.WriteFile(filepath.Join(r.Work, "outside.txt"), []byte("echo outside\n"), 0o644); err != nil {
		t.Fatal(err)
	}
	for _, verb := range []string{"run", "apply"} {
		said := theVerbSaid(t, r, verb, "", "--on", tok.ID, "--by", "tester",
			"--from", ".se/scratchpad/../../outside.txt")
		if !strings.Contains(said, `"error"`) || !strings.Contains(said, "scratchpad") {
			t.Errorf("%s --from a path outside the scratchpad was not refused naming the scratchpad: %s", verb, said)
		}
		if strings.Contains(said, "outside") && strings.Contains(said, `"exit"`) {
			t.Errorf("%s ran a command read from outside the scratchpad: %s", verb, said)
		}
	}

	// AND TWO PAYLOADS ARE ANSWERED, NEVER GUESSED BETWEEN.
	said = theVerbSaid(t, r, "run", "", "--on", tok.ID, "--by", "tester",
		"--from", ".se/scratchpad/cmd.txt", "--command", "echo inline")
	if !strings.Contains(said, "name one") {
		t.Errorf("run with --from and --command was not refused: %s", said)
	}

	// AND A PAGE STILL COUNTS FROM WHERE IT SAID. --from was a byte offset
	// beside --page before it was a path, and the paging callers still send one.
	said = theVerbSaid(t, r, "run", "", "--page", "nothing-kept", "--from", "-10")
	if strings.Contains(said, "scratchpad") {
		t.Errorf("a page offset was read as a scratchpad path: %s", said)
	}
}
