package main

import (
	"bytes"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"testing"
)

// A SESSION WITH NO TOOL LANE CAN STILL CHANGE THE TREE.
//
// MEASURED ON A CLOUD BOX, AND IT COST THE WHOLE SESSION. The tool lane never
// came up, so every call went to Bash, where the guard passes the engine alone
// and refuses a pipe, because a pipe can write and the guard cannot read one and
// know what it writes. run and apply took their payload on standard input and
// nowhere else, so the only form of them was the one form that session could not
// type. It read the tree, it searched it, and it could not test, change or
// commit one byte. The engine was reachable and useless.
func TestTheEngineTakesItsPayloadWithNoPipe(t *testing.T) {
	t.Parallel()
	r := aTreeWithTheProcesses(t)
	tok := aLocalToken(t, r, "a payload no pipe")

	// STANDARD INPUT SAYS SOMETHING ELSE, on purpose. A flag that is read
	// beside the pipe rather than instead of it would write this file, and a
	// caller at a shell with no pipe would be reading a terminal for ever.
	wrong := `[{"file":"wrong.txt","op":"create","new":"read from the pipe"}]`

	said := theVerbSaid(t, r, "apply", wrong, "--on", tok.ID, "--by", "tester",
		"--edits", `[{"file":"by-edits.txt","op":"create","new":"inline"}]`)
	if _, err := os.Stat(filepath.Join(r.Work, "by-edits.txt")); err != nil {
		t.Fatalf("--edits wrote nothing: %s", said)
	}
	if _, err := os.Stat(filepath.Join(r.Work, "wrong.txt")); err == nil {
		t.Fatal("standard input was read as well as --edits, so a shell with no pipe would hang")
	}

	manifest := filepath.Join(t.TempDir(), "edits.json")
	if err := os.WriteFile(manifest,
		[]byte(`[{"file":"by-manifest.txt","op":"create","new":"from a file"}]`), 0o644); err != nil {
		t.Fatal(err)
	}
	said = theVerbSaid(t, r, "apply", wrong, "--on", tok.ID, "--by", "tester", "--manifest", manifest)
	if _, err := os.Stat(filepath.Join(r.Work, "by-manifest.txt")); err != nil {
		t.Fatalf("--manifest wrote nothing: %s", said)
	}

	said = theVerbSaid(t, r, "run", "echo the pipe", "--on", tok.ID, "--by", "tester",
		"--command", "echo the flag")
	if !strings.Contains(said, "the flag") || strings.Contains(said, "the pipe") {
		t.Fatalf("--command did not run instead of standard input: %s", said)
	}
}

// NAMING TWO MANIFESTS IS ANSWERED AND NEVER GUESSED. Writing one of them
// silently is how the other is lost.
func TestTwoManifestsAreRefused(t *testing.T) {
	t.Parallel()
	r := aTreeWithTheProcesses(t)
	tok := aLocalToken(t, r, "two manifests")
	said := theVerbSaid(t, r, "apply", "", "--on", tok.ID, "--by", "tester",
		"--edits", `[]`, "--manifest", "edits.json")
	if !strings.Contains(said, "so name one") {
		t.Fatalf("naming both doors was not refused: %s", said)
	}
}

// EVERY DOOR A REFUSAL NAMES IS A CALL THE GUARD LETS THROUGH.
//
// This is the property the whole shell fallback rests on, and it was false for
// the two verbs that matter most. The refusal for a write printed a piped call,
// and the guard that printed it refuses a pipe, so the session was handed its
// own wall as its way out.
func TestEveryDoorARefusalNamesGetsPastTheGuard(t *testing.T) {
	t.Parallel()
	r := aTreeWithTheProcesses(t)
	for _, tool := range []string{"Bash", "Write", "Edit", "NotebookEdit"} {
		said := theRefusal(r, "main", tool, "the/file.go")
		doors := theDoorsNamedIn(said)
		// NAMING NO DOOR IS THE DEFECT ITSELF, and it is the shape this check
		// has to fail on. The refusal for a write named the piped call and
		// nothing else, so a lane-less session read a wall where its way out
		// belonged, and a check that only reads the doors it finds finds none
		// and passes.
		if len(doors) == 0 {
			t.Errorf("the refusal for %s names no call a lane-less session can make:\n%s", tool, said)
		}
		for _, line := range doors {
			line = asAnAgentWouldType(line)
			if !runsTheEngine(line) {
				t.Errorf("the refusal for %s names a call the guard refuses: %s\n%s",
					tool, line, whatDisqualified(line))
			}
		}
	}
}

// asAnAgentWouldType fills the placeholders in, because <id> is a word to
// replace and not a redirection. The guard reads an angle bracket either way, so
// the check is about the shape of the call and not about the stationery.
func asAnAgentWouldType(line string) string {
	// AN INVENTED ID IS ONE CHARACTER REPEATED, which is how
	// tests-name-no-token tells a fixture from a token in the record.
	return placeholder.ReplaceAllString(line, "wk-1111111111")
}

var placeholder = regexp.MustCompile(`<[^>]*>`)

// theDoorsNamedIn answers every command a piece of guidance told the agent to
// type, which is every line naming RUNME.
func theDoorsNamedIn(said string) []string {
	var out []string
	for _, line := range strings.Split(said, "\n") {
		line = strings.TrimSpace(line)
		if i := strings.Index(line, "./RUNME.sh"); i >= 0 {
			out = append(out, line[i:])
		}
	}
	return out
}

// aLocalToken is a note, which no other box can see and which therefore needs
// no claim before it is taken up.
func aLocalToken(t *testing.T, r Roots, title string) Token {
	t.Helper()
	tok, err := Mint(r, Token{Process: "note", Title: title,
		Status: "noted", Detail: "something seen, and nobody has decided what it is yet"})
	if err != nil {
		t.Fatal(err)
	}
	return tok
}

// theVerbSaid runs one verb the way the command line does, with the given standard
// input, and answers everything it said.
func theVerbSaid(t *testing.T, r Roots, name, in string, args ...string) string {
	t.Helper()
	var out, errs bytes.Buffer
	run[name](&call{roots: r, args: args, in: strings.NewReader(in), out: &out, err: &errs})
	return out.String() + errs.String()
}
