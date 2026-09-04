package main

import (
	"strings"
	"testing"
)

// ONE SECTION, ONE BOUND, AND BOTH DOORS READ IT THE SAME WAY.
//
// MEASURED. The size of a section was declared twice: maxWords, which the
// editor and the lint enforced, and maxBytes, which only the save and the
// write door enforced. Six bytes to a word was assumed and this corpus runs at
// five, so the two numbers were not the same bound. A writer was marked by one
// door for prose the other took, and refused by the other for prose the editor
// called clean. There is one number now, in words, and this holds the doors to
// it.
func TestTheEditorAndTheSaveGiveOneAnswer(t *testing.T) {
	t.Parallel()
	r := aTreeDescribingFields(t) // its schema bounds the detail at 20 words

	over := Token{Process: "small", Title: "a small change", Status: "open",
		Detail:   strings.TrimSpace(strings.Repeat("argument ", 30)),
		Criteria: []Criterion{{Says: "go test ./... is green"}}}

	// The save's answer.
	schema := narrowedSchema(r, over)
	err := proseThatFits(schema, over)
	if err == nil {
		t.Fatal("the save took a detail past the bound the schema declares")
	}
	if !strings.Contains(err.Error(), "30 words") || !strings.Contains(err.Error(), "allows 20") {
		t.Errorf("the save does not name the count and the bound in words: %v", err)
	}

	// The editor's answer, over the same token written out as a note.
	var marks []string
	for _, d := range ValidateNote(schema, noteOf(over), r.Method) {
		if strings.Contains(d.Says, "words") {
			marks = append(marks, d.Says)
		}
	}
	if len(marks) != 1 {
		t.Fatalf("the editor said %d things about the length, and the save said one: %v", len(marks), marks)
	}
	if !strings.Contains(marks[0], "30 words") || !strings.Contains(marks[0], "allows 20") {
		t.Errorf("the editor counts differently from the save: %q against %q", marks[0], err)
	}
}

// A COMMENT IS NOT PROSE THE READER WAS HANDED. The template writes guidance
// into a section as an html comment, and counting it would charge the writer
// for words the engine put there.
func TestACommentIsNotPartOfTheLength(t *testing.T) {
	t.Parallel()
	body := "<!-- " + strings.Repeat("guidance ", 40) + "-->\n\nshort enough"
	if n, over := overWords(20, body); over {
		t.Errorf("the comment was counted: %d words against a bound of 20", n)
	}
}

// noteOf writes a token out the way the engine stores it, so a test can hand
// the same token to the save and to the reader.
func noteOf(t Token) string {
	return "---\nkind: work-token\nprocess: small\ntitle: " + t.Title +
		"\nstatus: " + string(t.Status) + "\n---\n\n" + t.body()
}
