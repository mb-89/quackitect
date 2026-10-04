package command

import "testing"

// The state a note's front names reads past the package, its link brackets off, and a text with no front names none. [[spec/tickets/landing-verbs-port-to-go]]
func TestStateOfReadsTheFront(t *testing.T) {
	for text, want := range map[string]string{
		"---\nstate: closed\n---\n\n# Ask\n": "closed",
		"---\nstate: \"[[open]]\"\n---\n":    "open",
		"# Ask\n\nstate: closed\n":           "",
	} {
		if got := StateOf(text); got != want {
			t.Errorf("StateOf(%q) answers %q, and wants %q", text, got, want)
		}
	}
}
