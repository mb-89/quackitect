package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// THE INSTRUMENT IS PROVED BEFORE IT RULES.
//
// The rule this replaces reddened over six comments that were provenance a
// reader wants. So every planted case here has a clean one beside it that
// differs in the one fact the rule turns on, and that fact is the tense. A
// past-tense sentence naming a token that has ended is the case the old rule
// got wrong, and it is planted here as a clean one.
//
// NOTHING HERE READS THE LIVE TREE. The record is two notes and one archive row
// in a folder this test made, so the answers do not move when the real record
// does.
func TestACommentPromisingWorkOnAnEndedToken(t *testing.T) {
	const ended, open = "wk-1111111111", "wk-2222222222"
	const swept, unknown = "wk-3333333333", "wk-4444444444"
	dir := t.TempDir()
	r := Roots{Work: dir, Method: dir}
	here := filepath.Join(dir, filepath.FromSlash(TheTrackedFolder))
	if err := os.MkdirAll(here, 0o755); err != nil {
		t.Fatal(err)
	}
	write := func(name, said string) {
		t.Helper()
		if err := os.WriteFile(filepath.Join(here, name), []byte(said), 0o644); err != nil {
			t.Fatal(err)
		}
	}
	// A DISPOSITION IS WHAT SAYS A TOKEN HAS ENDED. Both notes stand in a state
	// whose word is done, and only one of them says what became of the work, so
	// a reader of the state alone would call them the same.
	write(ended+".md", "---\nkind: [[work-token]]\nprocess: [[trivial]]\ntitle: a token that has ended\nstatus: done\ndisposition: done\n---\n\n## detail\n\nWork that is finished, whose note is still on the disk.\n")
	write(open+".md", "---\nkind: [[work-token]]\nprocess: [[trivial]]\ntitle: a token still open\nstatus: done\n---\n\n## detail\n\nWork still to come, standing in a state whose word is done.\n")
	write("archive.jsonl", `{"id":"`+swept+`","title":"a token that was swept","disposition":"became"}`+"\n")

	const at = "src/engine/door.go"
	source := func(body string) string { return "package main\n\n" + body + "\nfunc door() {}\n" }

	// PLANTED. The verb promises work still to come, and the note the pointer
	// opens says the work is over.
	err := aCommentPromisingWorkOnAnEndedToken(r, false, at,
		source("// "+ended+" carries making an absent record a refusal."))
	theCommentDoorRefused(t, "a present-tense promise on a token that has ended",
		err, ended, "carries", "done", "past tense")

	// CLEAN. The same token, the same file, one verb apart. This is provenance,
	// and reddening on it is the whole defect of the rule this replaces.
	err = aCommentPromisingWorkOnAnEndedToken(r, false, at,
		source("// "+ended+" carried an ask of 249 words."))
	theCommentDoorAllowed(t, "a past-tense sentence naming the same ended token", err)

	// CLEAN. A bare citation makes no promise at all, and this is the shape six
	// of the seven failures the git rule reported were in.
	err = aCommentPromisingWorkOnAnEndedToken(r, false, at, source("// See "+ended+"."))
	theCommentDoorAllowed(t, "a bare citation naming an ended token", err)

	// CLEAN. The promise can still be kept, because the token it names is open.
	err = aCommentPromisingWorkOnAnEndedToken(r, false, at,
		source("// "+open+" carries making an absent record a refusal."))
	theCommentDoorAllowed(t, "a promise on a token that is open", err)

	// CLEAN. Nothing here can tell an id lost from the archive from one that
	// never existed, so an unknown id is left alone.
	err = aCommentPromisingWorkOnAnEndedToken(r, false, at,
		source("// "+unknown+" carries the rest of this."))
	theCommentDoorAllowed(t, "a promise on an id the record does not know", err)

	// PLANTED, the archive side. The note is off the disk, and the row is what
	// says the work was swept.
	err = aCommentPromisingWorkOnAnEndedToken(r, false, at,
		source("// "+swept+" settles the rest of this."))
	theCommentDoorRefused(t, "a promise on a token the archive says was swept",
		err, swept, "settles", "became")

	// PLANTED, the sentence running on. The id ends one comment line and the
	// verb starts the next, which a rule reading one line would call silent.
	err = aCommentPromisingWorkOnAnEndedToken(r, false, at,
		source("// This is half of it, and "+ended+"\n// carries the other half."))
	theCommentDoorRefused(t, "a promise whose verb is on the next comment line", err, ended, "carries")

	// CLEAN. The reader stops where the comment stops, so the word below is code
	// rather than the rest of a sentence.
	err = aCommentPromisingWorkOnAnEndedToken(r, false, at,
		"package main\n\n// The record is at "+ended+"\nfunc carries() {}\n")
	theCommentDoorAllowed(t, "an id at the end of a comment that code follows", err)

	// CLEAN. An id in code is not a sentence a reader follows.
	err = aCommentPromisingWorkOnAnEndedToken(r, false, at,
		"package main\n\nvar said = \""+ended+" carries the rest\"\n")
	theCommentDoorAllowed(t, "an id in a string rather than in a comment", err)

	// CLEAN. A test names no token from the record, and another door refuses one
	// outright, so this rule reads the source a person opens.
	err = aCommentPromisingWorkOnAnEndedToken(r, false, "src/engine/door_test.go",
		source("// "+ended+" carries making an absent record a refusal."))
	theCommentDoorAllowed(t, "a test file, which this rule does not read", err)
}

// theCommentDoorRefused says the door refused, and that the refusal names why.
// A refusal a reader cannot act on is a wall, and the words are what make it a
// door.
func theCommentDoorRefused(t *testing.T, what string, err error, words ...string) {
	t.Helper()
	if err == nil {
		t.Fatalf("%s was allowed through, and the sentence it leaves is a promise nobody is keeping", what)
	}
	for _, want := range words {
		if !strings.Contains(err.Error(), want) {
			t.Errorf("the refusal of %s does not say %q, so a reader is not told what to do: %s", what, want, err)
		}
	}
}

// theCommentDoorAllowed says the door let a legal write through. It is the half
// that makes the refusals above evidence rather than a door reddening over
// every comment that names a token.
func theCommentDoorAllowed(t *testing.T, what string, err error) {
	t.Helper()
	if err != nil {
		t.Fatalf("%s was refused, and that is the defect the rule this replaces had: %s", what, err)
	}
}
