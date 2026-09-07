package main

import (
	"os"
	"path/filepath"
	"testing"

	"quackitect/engine/internal/sessionlog"
)

// A SLASH COMMAND MOVES THE CONTROL IT NAMES, and until now none of them did.
//
// THE TESTS BESIDE THIS ONE DECIDE THE FILE AND NOT THE BUTTON.
// commandsmirrorthekeywords_test.go asserts that the file holds the keyword
// line, and util/checks/commands-mirror-the-keywords.mjs asserts it again. Both
// were green for as long as the feature has existed. Neither ever typed a
// command and asked whether anything moved. Nothing did.
//
// The gain the work was for was that a cloud box, which has no panel, reaches
// every control by typing one. That gain is what these rows decide, so a
// generator that writes perfect files and a matcher that ignores them cannot
// both pass.

// commandsHere writes the command files this tree offers, the way the
// projection does, and answers the folder they landed in.
func commandsHere(t *testing.T, r Roots) string {
	t.Helper()
	if _, err := WriteCommands(r); err != nil {
		t.Fatal(err)
	}
	return filepath.Join(r.Work, filepath.FromSlash(commandsFolder))
}

// TYPING THE COMMAND MOVES THE CONTROL. This is the whole feature, through the
// route the harness really uses, and it is what nothing asserted before.
func TestTypingASlashCommandMovesTheControl(t *testing.T) {
	t.Parallel()
	r := aConsoleTree(t)
	l, _ := sessionlog.Open(r.Private("log"))
	defer l.Close()

	dir := commandsHere(t, r)
	if _, err := os.Stat(filepath.Join(dir, "se-ctrl-guards-search-via-index-off.md")); err != nil {
		t.Fatalf("the command was not written, so nothing this test sees is about typing it: %v", err)
	}
	if valueOf(t, r, "guards.search_via_index") != true {
		t.Fatal("the guard did not start on, so nothing this test sees is about the command")
	}

	heardHere(t, r, l, "/se-ctrl-guards-search-via-index-off")

	if got := valueOf(t, r, "guards.search_via_index"); got != false {
		t.Errorf("the guard is %v, and typing the command asked for it to be off", got)
	}
}

// THE BODY IS WHAT THE COMMAND MEANS, and the name is only how it is reached.
func TestACommandAnswersTheLineItSends(t *testing.T) {
	t.Parallel()
	r := aConsoleTree(t)
	commandsHere(t, r)

	if got := TheCommandTyped(r, "/se-ctrl-guards-search-via-index-off"); got != "KEYWORD:SEARCH_VIA_INDEX=OFF" {
		t.Errorf("the command sends %q, and its file holds KEYWORD:SEARCH_VIA_INDEX=OFF", got)
	}
	// The harness trims nothing, and a person types trailing space.
	if got := TheCommandTyped(r, "  /se-ctrl-guards-search-via-index-off  "); got != "KEYWORD:SEARCH_VIA_INDEX=OFF" {
		t.Errorf("spacing changed the answer: %q", got)
	}
}

// WHAT IS NOT ONE OF THESE COMMANDS IS LEFT ALONE, so a person writing about a
// command, or using somebody else's, moves nothing.
func TestOnlyThisEnginesCommandsAreRead(t *testing.T) {
	t.Parallel()
	r := aConsoleTree(t)
	commandsHere(t, r)

	for _, said := range []string{
		"KEYWORD:SEARCH_VIA_INDEX=OFF", // already a keyword, and not a command
		"/commit",                      // somebody else's command in a shared menu
		"/se-ctrl-guards-there-is-no-such-control",        // this engine's prefix, and no such file
		"please run /se-ctrl-guards-search-via-index-off", // a sentence about one
		"/se-ctrl-../../etc/passwd",                       // a name is one file in one folder
		"/se-ctrl-",                                       // the prefix and nothing else
	} {
		if got := TheCommandTyped(r, said); got != "" {
			t.Errorf("%q was read as a command sending %q", said, got)
		}
	}

	// AND THE WORDS BEHIND ANYTHING ELSE ARE THAT THING, unchanged, because the
	// matcher still has to see a keyword a person typed by hand.
	if got := TheWordsBehind(r, "KEYWORD:SEARCH_VIA_INDEX=OFF"); got != "KEYWORD:SEARCH_VIA_INDEX=OFF" {
		t.Errorf("a keyword typed by hand came through as %q", got)
	}
}
