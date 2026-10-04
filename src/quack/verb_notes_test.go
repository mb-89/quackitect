// The notes verb asks the index's notes with the words it reads.
// [[spec/tickets/read-verbs-port-to-go]]
package main

import (
	"strings"
	"testing"
)

func TestNotesVerb(t *testing.T) {
	asked := [][]string{}
	if code, _, _ := runsTwin(notesVerb(askHolding([]any{}, nil, &asked)), "notes", "verb", "5"); code != 0 || strings.Join(asked[0], " ") != "notes verb 5" {
		t.Fatalf("notes answers %d and asks %v, and wants notes verb 5", code, asked)
	}
}
