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
	r := aTree(t).Roots
	root := r.Work
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
	// AND THE SENTENCES THAT ONLY LOOK LIKE ONE.
	//
	// A token's detail is where an engineer writes about the engine, and this
	// rule read every one of those as a stale claim: seven findings stood
	// against this tree and not one was a hold. A lint answering mostly noise is
	// one a reader learns to run past, which costs the findings that were real.
	// Each line here is one that stood, with what makes it prose rather than a
	// claim about this token.
	clean := map[string]string{
		"an actor named, and no hold claimed":    "worker-one asked for this and reviewer-two agreed",
		"a rule an agent is measured against":    "the voice rules the harness editor is held to",
		"a criterion over who may hold anything": "no token in this tree is held by an agent the register says is gone",
		"where the hold is kept, not who has it": "the holder is engine state, not token content",
		"the engine's own word about a holder":   "a ruling that the holder is alive, with the actor and the time",
		"a test asserting what the engine does":  "the test asserts the holder is not called stale",
		"an identifier that happens to read":     "the unheld loop in next() filters on ended and blocked",

		// AND FOUR MORE THAT STOOD AGAINST THE TREE AFTER THE FIRST NARROWING,
		// which is five findings and no hold among them. Each is a sentence
		// about something that is not a token, or about where a thing lives.
		"a class held rather than an instance":        "the shell door is covered by three commands, so the class is held rather than the instance",
		"a fixture in somebody's test":                "a test with two tokens held by other actors and one held by the caller",
		"a policy, quoted from a commit title":        "a cloud box is held until its notes are in git",
		"where a ruling lives, not who has it":        "name displayrefusal_test.go as where it is held, so the two cannot drift",
		"two halves of a rule, and no hold in either": "So the ordering half is held and this half is held by nothing.",
	}
	cleanIDs := map[string]string{}
	for what, detail := range clean {
		cleanIDs[mintWithDetail(t, r, detail).ID] = what
	}

	said := map[string]string{}
	for _, f := range LintTokens(r) {
		said[f.ID] = f.Says
	}
	for _, tok := range Tokens(r) {
		says, named := said[tok.ID]
		if what, isClean := cleanIDs[tok.ID]; isClean {
			if named {
				t.Errorf("%s was read as a holder claim: %s", what, says)
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
