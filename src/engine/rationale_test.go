package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// A RATIONALE IS NAMED, NOT REPEATED.
//
// The argument moved out of the instruction so a reader stops paying for it on
// every pass. That only holds while the two halves stay joined. A rationale
// nothing links to is a file nobody reaches, and an argument left in both
// places is the cost the move was made to stop, now paid twice.
//
// SO THE RULE IS DRIVEN THROUGH BOTH HALVES: the note names what it explains,
// and the thing explained names the note back and carries none of its
// sentences. It runs over the corpus the product ships rather than a tree
// written here, because the shipped corpus is the one that goes stale.
func TestARationaleIsNamedNotRepeated(t *testing.T) {
	root := filepath.Join("..", "..")

	// A CHECK THAT FINDS NOTHING TO CHECK REFUSES, rather than passing on an
	// empty folder and reporting on a corpus it never read.
	s, err := LoadSchema(root, "rationale")
	if err != nil {
		t.Fatalf("the rationale schema will not load, so this guards nothing: %v", err)
	}
	notes := rationaleNotes(t, root)
	if len(notes) == 0 {
		t.Fatal("no rationale is shipped, so this guards nothing")
	}

	for _, path := range notes {
		name := strings.TrimSuffix(filepath.Base(path), ".md")
		t.Run(name, func(t *testing.T) {
			b, err := os.ReadFile(path)
			if err != nil {
				t.Fatal(err)
			}
			text := string(b)
			for _, d := range ValidateNote(s, text, root) {
				t.Errorf("it departs from its schema: %s", d.Says)
			}

			// IT CARRIES WHAT WAS DECIDED, WHY, AND WHAT IT COSTS. The schema
			// says these chapters are required and a required chapter left
			// empty still satisfies it, so their content is asked for here.
			front, body, _ := splitNoteLines(text)
			at := map[string]string{}
			for _, c := range chaptersOf(body, s.Body.HeadingLevel) {
				at[c.Header] = c.Body
			}
			for _, want := range []string{"decided", "why", "costs"} {
				if strings.TrimSpace(at[want]) == "" {
					t.Errorf("its %s chapter says nothing, so the note answers only part of what a rationale is for", want)
				}
			}

			f, err := ParseFront(front)
			if err != nil {
				t.Fatalf("the frontmatter does not parse: %v", err)
			}
			explains, _ := listValue(f["explains"])
			if len(explains) == 0 {
				t.Fatal("it explains nothing, so nothing will ever link to it")
			}
			for _, rel := range explains {
				target := filepath.Join(root, filepath.FromSlash(rel))
				tb, err := os.ReadFile(target)
				if err != nil {
					t.Errorf("it explains %s, which cannot be read: %v", rel, err)
					continue
				}
				got := oneLine(string(tb))

				// NAMED. The link is the whole of what joins the instruction
				// to its argument, and it is written in the file that carries
				// the instruction, where a reader of that file will meet it.
				if !strings.Contains(got, oneLine("[["+name+"]]")) {
					t.Errorf("%s does not name [[%s]], so a reader of the instruction has no way to reach its argument", rel, name)
				}

				// NOT REPEATED. A sentence of the argument still standing in
				// the file it was moved out of means the move did not happen.
				// A short sentence is skipped: it is as likely to be an
				// ordinary phrase as a quotation of this note.
				for _, one := range sentencesOf(at["why"]) {
					if len(strings.Fields(one)) < 8 {
						continue
					}
					if strings.Contains(got, oneLine(one)) {
						t.Errorf("%s still carries a sentence of the argument, so it is repeated rather than named: %s",
							rel, firstWords(one, 8))
					}
				}
			}
		})
	}
}

// rationaleNotes answers every note the shipped corpus holds, parked ones
// aside, because parking is how a file is taken out of the engine's way.
func rationaleNotes(t *testing.T, root string) []string {
	t.Helper()
	dir := RationaleDir(root)
	entries, err := os.ReadDir(dir)
	if err != nil {
		t.Fatalf("%s cannot be read, so this guards nothing: %v", dir, err)
	}
	var out []string
	for _, e := range entries {
		if e.IsDir() || !strings.HasSuffix(e.Name(), ".md") || Parked(e.Name()) {
			continue
		}
		out = append(out, filepath.Join(dir, e.Name()))
	}
	return out
}

// oneLine is text with its comment markers, line breaks and shouting taken
// out, so a sentence wrapped over three commented lines is one string to look
// for. An argument is written in capitals in code and in prose in a note, and
// it is the same argument either way.
func oneLine(s string) string {
	var flat []string
	for _, line := range strings.Split(strings.ReplaceAll(s, "\r\n", "\n"), "\n") {
		line = strings.TrimSpace(line)
		line = strings.TrimPrefix(line, "//")
		line = strings.TrimPrefix(line, "#")
		flat = append(flat, line)
	}
	return strings.ToLower(strings.Join(strings.Fields(strings.Join(flat, " ")), " "))
}
