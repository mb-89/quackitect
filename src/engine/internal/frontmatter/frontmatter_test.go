package frontmatter

import (
	"testing"
)

// A person edits these by hand, so what a person is likely to write has to
// read back as what they meant.
func TestTheFrontmatterReadsWhatAPersonWrites(t *testing.T) {
	t.Parallel()
	front, body := Split("---\nid: wk-1\ntitle: \"a title: with a colon\"\nsubs:\n  - wk-2\n  - wk-3\ntracked: true\n---\n\nthe body.\n")
	if body != "the body.\n" {
		t.Fatalf("the body came back as %q", body)
	}
	f, err := Parse(front)
	if err != nil {
		t.Fatal(err)
	}
	if Str(f, "title") != "a title: with a colon" {
		t.Errorf("a quoted colon read as %q", Str(f, "title"))
	}
	if got := List(f, "subs"); len(got) != 2 || got[1] != "wk-3" {
		t.Errorf("the list read as %v", got)
	}
	if !Bool(f, "tracked") {
		t.Error("tracked read as false")
	}
}

// A note the parser cannot read is said out loud rather than skipped, because
// a token dropped from the queue silently is work that vanished.
func TestFrontmatterThatCannotBeReadIsRefused(t *testing.T) {
	t.Parallel()
	if _, err := Parse("id: wk-1\n  nested:\n    deeper: 1\n"); err == nil {
		t.Fatal("a nested mapping was accepted")
	}
	if _, err := Parse("just some words\n"); err == nil {
		t.Fatal("a line with no key was accepted")
	}
}
