package main

import (
	"strings"
	"testing"
)

// A TOKEN'S PROSE NAMES NO HOLDER, AND THE LINT SAYS SO.
//
// A hold ends with the session. A note recorded who held a token, the session
// rolled, every hold changed hands, and the line was still read out as current.
// Evidence cells written the same day said a token was unheld and went stale
// within the hour.
//
// The schema already keeps the holder off the token and the engine answers for
// it. This is that rule reaching prose, which is where it was got round.
func TestATokensProseNamesNoHolder(t *testing.T) {
	t.Parallel()
	root := t.TempDir()
	r := Roots{Method: root, Work: root}
	writeProcess(t, root, "gated")

	// EVERY SPELLING A NOTE REACHES FOR, counted from the side that writes them.
	for _, said := range []string{
		"the work is held by worker-one, so ask there",
		"it is held while the sweep runs",
		"the holder is the reviewer who asked",
		"the token is unheld and anybody may take it",
	} {
		mintWithDetail(t, r, said)
	}
	// AND ONE NAMING AN ACTOR WITHOUT CLAIMING A HOLD, which stays clean.
	clean := mintWithDetail(t, r, "worker-one asked for this and reviewer-two agreed")

	said := map[string]string{}
	for _, f := range LintTokens(r) {
		said[f.ID] = f.Says
	}
	for _, tok := range Tokens(r) {
		says, named := said[tok.ID]
		if tok.ID == clean.ID {
			if named {
				t.Errorf("a note naming an actor and claiming no hold was refused: %s", says)
			}
			continue
		}
		if !named {
			t.Errorf("the lint says nothing about %s, so a holder in prose reaches the ledger", tok.ID)
			continue
		}
		if !strings.Contains(says, "a hold ends with the session, so the record goes stale") {
			t.Errorf("the finding does not say why a holder cannot be written down: %s", says)
		}
	}
}

// mintWithDetail writes the smallest token carrying prose the lint reads.
func mintWithDetail(t *testing.T, r Roots, detail string) Token {
	t.Helper()
	tok, err := Mint(r, Token{Tracked: local(), Process: "gated", Title: "a lint fixture",
		Status: "first", Detail: detail})
	if err != nil {
		t.Fatal(err)
	}
	return tok
}
