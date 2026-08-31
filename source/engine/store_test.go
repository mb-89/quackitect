package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// A token is a note a person can read and edit, so everything it carries has
// to survive the round trip through markdown.
func TestATokenSurvivesBeingWrittenAndReadBack(t *testing.T) {
	r := lane(t)
	want := Token{
		Title: "the level-1 row", Detail: "The whole instruction, in the\nwords it was asked in.",
		Guidance: "Say what is. Leave out what is not.",
		Evidence: EvidenceSpec{Sections: []string{"what", "how"}, Script: "go test ./..."},
		Assignee: "main", Scope: MultiStep, Traced: true,
	}
	got := mint(t, r, want)
	got.Submission = map[string]string{"what": "the row is there", "how": "a test names it"}
	got.Findings = []Rejection{
		{Round: 1, By: "rev", Clause: "voice", Wrong: "a semicolon", Satisfies: "two sentences", At: "2026-08-31T00:00:00Z"},
		{Round: 2, By: "rev2", Clause: "evidence", Wrong: "no measurement", Satisfies: "a number", At: "2026-08-31T00:01:00Z"},
	}
	got.Rounds = 2
	if err := SaveToken(r, got); err != nil {
		t.Fatal(err)
	}

	back, err := LoadToken(r, got.ID)
	if err != nil {
		t.Fatal(err)
	}
	for _, c := range []struct{ name, want, got string }{
		{"title", got.Title, back.Title},
		{"detail", got.Detail, back.Detail},
		{"guidance", got.Guidance, back.Guidance},
		{"assignee", got.Assignee, back.Assignee},
		{"scope", string(got.Scope), string(back.Scope)},
		{"script", got.Evidence.Script, back.Evidence.Script},
		{"what", got.Submission["what"], back.Submission["what"]},
		{"how", got.Submission["how"], back.Submission["how"]},
	} {
		if c.want != c.got {
			t.Errorf("%s: wrote %q, read %q", c.name, c.want, c.got)
		}
	}
	if len(back.Evidence.Sections) != 2 || back.Evidence.Sections[0] != "what" {
		t.Errorf("the evidence sections came back as %v", back.Evidence.Sections)
	}
	if !back.Traced || back.Rounds != 2 {
		t.Errorf("traced=%v rounds=%d", back.Traced, back.Rounds)
	}
	if len(back.Findings) != 2 {
		t.Fatalf("%d findings came back", len(back.Findings))
	}
	if f := back.Findings[1]; f.Round != 2 || f.By != "rev2" || f.Clause != "evidence" ||
		f.Wrong != "no measurement" || f.Satisfies != "a number" {
		t.Errorf("the second finding came back as %+v", f)
	}
}

// The note is markdown, and it reads as markdown. That is the whole reason it
// is not JSON.
func TestTheNoteIsReadableMarkdown(t *testing.T) {
	r := lane(t)
	tok := mint(t, r, Token{Title: "write the thing", Detail: "and say why", Traced: true})
	b, err := os.ReadFile(filepath.Join(r.Work, "doc", "work", tok.ID+".md"))
	if err != nil {
		t.Fatal(err)
	}
	text := string(b)
	for _, want := range []string{"---\n", "id: " + tok.ID, "type: work", "title: write the thing",
		"status: open", "## detail", "and say why"} {
		if !strings.Contains(text, want) {
			t.Errorf("the note does not carry %q\n%s", want, text)
		}
	}
}

// A folder holds other notes too, so a note is a token only when it says so.
func TestANoteThatIsNotATokenIsNotInTheLedger(t *testing.T) {
	r := lane(t)
	mint(t, r, Token{Title: "a real one", Traced: true})
	dir := filepath.Join(r.Work, "doc", "work")
	os.WriteFile(filepath.Join(dir, "notes.md"),
		[]byte("---\nid: not-a-token\ntype: reading\n---\n\nsome thinking.\n"), 0o644)
	os.WriteFile(filepath.Join(dir, "plain.md"), []byte("no frontmatter at all\n"), 0o644)

	if n := len(Tokens(r)); n != 1 {
		t.Fatalf("the ledger holds %d notes, and only one of them is a token", n)
	}
}

// A person edits these by hand, so what a person is likely to write has to
// read back as what they meant.
func TestTheFrontmatterReadsWhatAPersonWrites(t *testing.T) {
	front, body := SplitNote("---\nid: wk-1\ntitle: \"a title: with a colon\"\nsubs:\n  - wk-2\n  - wk-3\ntraced: true\n---\n\nthe body.\n")
	if body != "the body.\n" {
		t.Fatalf("the body came back as %q", body)
	}
	f, err := ParseFront(front)
	if err != nil {
		t.Fatal(err)
	}
	if fs(f, "title") != "a title: with a colon" {
		t.Errorf("a quoted colon read as %q", fs(f, "title"))
	}
	if got := fl(f, "subs"); len(got) != 2 || got[1] != "wk-3" {
		t.Errorf("the list read as %v", got)
	}
	if !fb(f, "traced") {
		t.Error("traced read as false")
	}
}

// A note the parser cannot read is said out loud rather than skipped, because
// a token dropped from the queue silently is work that vanished.
func TestFrontmatterThatCannotBeReadIsRefused(t *testing.T) {
	if _, err := ParseFront("id: wk-1\n  nested:\n    deeper: 1\n"); err == nil {
		t.Fatal("a nested mapping was accepted")
	}
	if _, err := ParseFront("just some words\n"); err == nil {
		t.Fatal("a line with no key was accepted")
	}
}
