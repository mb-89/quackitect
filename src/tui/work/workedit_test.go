// The window's field write, through the one writer: a value quotes where YAML
// needs it, a link stands bare, and a CRLF front keeps its line ends.
// [[spec/tickets/go-writes-the-frontmatter]]
package work

import "testing"

func TestTheWindowWritesAFieldInTheWritersForm(t *testing.T) {
	cases := []struct{ key, value, want string }{
		{"reason", "a: why", "---\nstate: open\nreason: \"a: why\"\n---\nbody\n"},
		{"process", "[[spec/processes/trivial]]", "---\nstate: open\nprocess: [[spec/processes/trivial]]\n---\nbody\n"},
		{"state", "", "---\n---\nbody\n"},
	}
	for _, one := range cases {
		said, ok := WithField("---\nstate: open\n---\nbody\n", one.key, one.value)
		if !ok || said != one.want {
			t.Errorf("%s=%q writes %q", one.key, one.value, said)
		}
	}
	if said, ok := WithField("---\r\nstate: open\r\n---\r\n", "state", "done"); !ok || said != "---\r\nstate: done\r\n---\r\n" {
		t.Errorf("a CRLF front writes %q", said)
	}
	if _, ok := WithField("no front\n", "state", "done"); ok {
		t.Error("a note with no front takes a field")
	}
}
