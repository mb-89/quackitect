package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// The note process, driven over the file the product ships, copied into a tree
// of its own by aTreeWithTheProcesses.

// The smallest note is one sentence about something wrong. The panel mints one
// from the typed line, so a note born of a title and a detail alone is the
// shape a person actually produces, and the schema has to accept it. What
// happens about it is written at the decide step, by whoever decides, so the
// section being optional loses nothing.
func TestANoteNeedsNoProposedAction(t *testing.T) {
	t.Parallel()
	r := aTreeWithTheProcesses(t)

	p, err := LoadProcess(r.Method, "note")
	if err != nil {
		t.Fatalf("the note process did not load: %v", err)
	}
	catalogue, err := LoadSchema(r.Method, "work-token")
	if err != nil {
		t.Fatalf("the shipped schema did not load, so nothing below guards anything: %v", err)
	}

	// Minted the way the panel mints one: the typed line becomes the title and
	// the detail, and the engine fills the rest from the process and the schema.
	tok, err := Mint(r, Token{Process: "note", Title: "a typed note",
		Status: Status(p.StartsAt()), Guidance: catalogue.Guidance,
		Detail: "one sentence", Submission: Checklists(p)})
	if err != nil {
		t.Fatalf("a note of a title and a detail was refused at the mint: %v", err)
	}

	path := filepath.Join(dirFor(r, tok), tok.ID+".md")
	b, err := os.ReadFile(path)
	if err != nil {
		t.Fatalf("the minted note could not be read back, so nothing below is checked: %v", err)
	}
	text := string(b)

	s, err := LoadSchema(r.Method, kindOf(text))
	if err != nil {
		t.Fatalf("the schema the note names did not load: %v", err)
	}
	// This is what the problems panel reads, so a departure here is the red mark
	// a person sees on a note they have just typed.
	if got := ValidateNote(s, text, r.Method); len(got) != 0 {
		var says []string
		for _, d := range got {
			says = append(says, d.Says)
		}
		t.Fatalf("a note of a title and a detail was marked as a problem: %s",
			strings.Join(says, "; "))
	}

	// And nothing is lost by the section being optional, because the decide step
	// still asks what happens about the note, with evidence rather than a tick.
	if holdsName(p.RequiredSection, "proposed action") {
		t.Fatal("the note process still requires a proposed action section")
	}
	if !holdsName(p.OptionalSection, "proposed action") {
		t.Fatal("the note process no longer offers a proposed action section at all, " +
			"so what the writer already knows has nowhere to go")
	}
	decide, found := activityNamed(p, "decide")
	if !found {
		t.Fatal("the note process has no decide step, so nobody is asked what happens about a note")
	}
	asked := false
	for _, c := range decide.Criteria {
		if strings.Contains(c.Says, "disposition says what happened") && c.NeedsEvidence {
			asked = true
		}
	}
	if !asked {
		t.Fatal("the decide step no longer asks, with evidence, what happened to the note, " +
			"so making the section optional does lose something")
	}
}

func activityNamed(p Process, name string) (Activity, bool) {
	for _, a := range p.Activities {
		if a.Name == name {
			return a, true
		}
	}
	return Activity{}, false
}
