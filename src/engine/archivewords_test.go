package main

import (
	"database/sql"
	"testing"
)

// THE ARCHIVE ANSWERS WORDS THE WAY THE TREE DOES.
//
// se find --words is FTS5 over the index, and the flag's help says so: a AND
// b, a NOT b, "one phrase", pre*. se find --archive --words quoted the words
// into a regular expression and matched them as one literal string, operators
// and all, so a query the tree answered with two hits answered zero over the
// archive, and zero hits over closed work reads as work that never was.
func TestTheArchiveAnswersWordsTheWayTheTreeDoes(t *testing.T) {
	t.Parallel()
	r := aTreeWithHistory(t)
	openTheIndex(t, r)
	tok, err := Mint(r, Token{Process: "standard", Title: "undo pops anothers apply",
		Status: "first", Tracked: tracked(), Detail: "an undo pops what another actor applied"})
	if err != nil {
		t.Fatal(err)
	}

	// THE TREE DOOR, for a term carrying an FTS operator.
	const term = "undo AND pops"
	db, err := sql.Open("sqlite3", indexDSN(indexPath(r), true))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { db.Close() })
	inTree, err := findDB(db, FindParams{Words: term})
	if err != nil {
		t.Fatal(err)
	}
	if inTree.Count == 0 {
		t.Fatalf("the tree door answered nothing for %q, so this test is not about the shape it means to be about", term)
	}

	// THE TOKEN CLOSES AND GOES TO THE ARCHIVE.
	tok.Disposition = Done
	tok.Status = "closed"
	if err := SaveToken(r, tok); err != nil {
		t.Fatal(err)
	}
	if at := noteAt(r, tok.ID); at != "" {
		t.Fatalf("the token is still on the disk at %s, so the archive door is not being asked", at)
	}

	// THE ARCHIVE DOOR ANSWERS THE SAME QUESTION: the same lines, by their text.
	archived, err := FindArchived(r, FindParams{Words: term})
	if err != nil {
		t.Fatal(err)
	}
	if archived.Count != inTree.Count {
		t.Fatalf("the tree answered %d hits for %q and the archive %d", inTree.Count, term, archived.Count)
	}
	for i := range inTree.Hits {
		if archived.Hits[i].Text != inTree.Hits[i].Text {
			t.Errorf("hit %d differs: tree %q, archive %q", i, inTree.Hits[i].Text, archived.Hits[i].Text)
		}
	}

	// AND A TERM FTS5 CANNOT READ IS REFUSED THE SAME WAY, rather than matched
	// as characters.
	if _, err := FindArchived(r, FindParams{Words: "undo AND"}); err == nil {
		t.Error("a term FTS5 refuses was matched literally over the archive")
	}
}
