package keyword

import "testing"

func TestTheWordIsTheControlsOwnName(t *testing.T) {
	t.Parallel()
	if got := For("search_via_index"); got != "SEARCH_VIA_INDEX" {
		t.Fatalf("the word reads %q", got)
	}
	if got := For("hold"); got != "HOLD" {
		t.Fatalf("a one-word name was changed: %q", got)
	}
}

// A GESTURE HAS NO NODE, so its word comes off the command it runs.
func TestAGesturesWordIsItsCommandsLastSegment(t *testing.T) {
	t.Parallel()
	for command, want := range map[string]string{
		"quackitect.god":  "GOD",
		"quackitect.stop_everything": "STOP_EVERYTHING",
		"god":             "GOD",
	} {
		if got := FromCommand(command); got != want {
			t.Errorf("%s gave the word %q, not %q", command, got, want)
		}
	}
}

// ONE PLACE WRITES THE LINE, so the tooltip and the matcher cannot differ.
func TestTheLineIsWrittenOnce(t *testing.T) {
	t.Parallel()
	if got := Line("UNBIND", On); got != "KEYWORD:UNBIND=ON" {
		t.Fatalf("the line reads %q", got)
	}
	if got := Line("MINT", ""); got != "KEYWORD:MINT" {
		t.Fatalf("a line with no value reads %q", got)
	}
	// AND WHAT Line WRITES, Parse READS BACK. The round trip is the whole
	// contract between the two halves.
	said, ok := Parse(Line("PARALLEL_AGENTS", "3"))
	if !ok || said.Word != "PARALLEL_AGENTS" || said.Value != "3" || !said.Given {
		t.Fatalf("the line did not read back: %v %v", said, ok)
	}
}

func TestTheWholeMessageHasToBeTheWord(t *testing.T) {
	t.Parallel()
	said, ok := Parse("  keyword:unbind = on \n")
	if !ok || said.Word != "UNBIND" || said.Value != "on" {
		t.Fatalf("a message that is only the word matched %v %v", said, ok)
	}
	for _, m := range []string{
		"please send KEYWORD:UNBIND=ON to the box",
		"KEYWORD:UNBIND is the word for it",
		"unbind",
		"KEYWORD:",
		"KEYWORD:=ON",
		"",
		"   ",
	} {
		if said, ok := Parse(m); ok {
			t.Errorf("%q was taken as a keyword, naming %q", m, said.Word)
		}
	}
}

// THE VALUE HALF MAY CARRY SPACES, because a token minted from a chat is a
// title and a detail.
func TestTheValueHalfKeepsItsSpaces(t *testing.T) {
	t.Parallel()
	said, ok := Parse("KEYWORD:MINT=four words here / and the detail")
	if !ok || said.Word != "MINT" || said.Value != "four words here / and the detail" {
		t.Fatalf("the value half did not survive: %v %v", said, ok)
	}
}

func TestARungReadsOnAndOffAndNothingElse(t *testing.T) {
	t.Parallel()
	if on, ok := IsOn(" on "); !on || !ok {
		t.Error("on did not read as on")
	}
	if on, ok := IsOn("OFF"); on || !ok {
		t.Error("OFF did not read as off")
	}
	for _, v := range []string{"", "yes", "1", "bound"} {
		if _, ok := IsOn(v); ok {
			t.Errorf("%q was read as a rung value", v)
		}
	}
}
