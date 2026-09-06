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
	f := aTree(t)
	r := f.Roots
	root := r.Work
	writeProcess(t, root, "gated")
	// THE CHECKS THIS TREE CARRIES ARE NAMES, NOT PEOPLE. The fixture declares
	// its own, the way it declares its own process, so the test reads the
	// mechanism rather than the product's list of checks.
	f.writeMethod("util/checks/render-check.mjs", "// a check the fixture carries\n")
	f.writeMethod("util/checks/drive-editor.mjs", "// a check the fixture carries\n")

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

		// AND FOUR THAT STOOD AFTER THE SECOND NARROWING, on notes written
		// since. Each is the line as its note carries it, whole, because what
		// makes it prose is the sentence around the words: a paraphrase of the
		// first of these passed while the note itself still drew a finding.
		"a check pinning a rule, not a person":      "Cause found and removed. .bar is one flex row of tabs, then .bd, then the split button, and every item could shrink. The engine's says is BD: minted/done/open, today BD: 119/191/69, and the owner read BD: 98/182/5 cut mid-number. .bd and .bar .second now take flex: 0 0 auto and .bar .tab takes min-width: 0, so the tabs give way and the number never does. Also burnDown now always draws the span, even empty, so a number arriving later has a node to land in. Held by render-check and drive-editor. NOT MET AS OBSERVATION: same limit as 4, the rule is asserted, the window is not measured.",
		"the holder named as the engine, not a who": "This is not a new rule. The schema already says the holder is the engine and not a field on the token, and work-token rule 14 already says an observation names the check rather than a thing that moves. Prose is the same defect through a back door.",
		"what the holder is doing, not who it is":   "TestARefusedTakeBackKeepsTheLookAndNamesTheGuard drives all six refusing paths as subtests. The first three: the token will not load, it has already ended, nobody is holding it. The last three: the walker holds it itself, it changed hands since the look, and the holder is pulling again. Each asserts the look is still recorded afterwards. Against the stub it failed on every one with the look now reads empty. After the change it is ok in 0.57s.",
		"any token, not this one":                   "A token is held under the name its holder pulls with, never under the harness name. gate.go:334 says so, and the holds file on this box files one under a worker name while the actors file maps main to it. So the one holder the sweep means to protect is the one holder it never recognises.",
		"where the holder ends up, not who it is":   "se_apply does not enforce the schema's size caps, and every other door does. So a write through apply can leave a token the engine will not load, and the holder is then locked out of the engine entirely.",

		// AND TWO THAT STOOD AFTER THE THIRD NARROWING, both of them the word
		// unheld used of tokens in general rather than of one. A plural, and a
		// singular under each, name no token and no session, so neither goes
		// stale when the session rolls. They are the lines of wk-24cdeae29b,
		// whole, because what makes a line prose is the sentence around it.
		"a plural, and it reaches a title": "title: unheld tokens want approaches",
		"one of many, named under each":    "Read each unheld token the check names, and write an approach onto it",
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

// THE WORK ROOT ANSWERS TOO, AND NOT ONLY A TABLE OF PARAPHRASES.
//
// A paraphrase is not the note. One of the lines above passed as a paraphrase
// while the note it came from still drew a finding, because what makes a line
// prose is the sentence around it. So the rule is decided a second time over
// the work root the product carries, with nothing rewritten.
//
// The two lines were written onto wk-24cdeae29b, which is archived now, and
// they are quoted since. Either way no hold finding may name them, and none
// may name that token.
func TestTheWorkRootReadsNoHoldInGenericProse(t *testing.T) {
	t.Parallel()
	const came = "wk-24cdeae29b"
	generic := []string{
		"unheld tokens want approaches",
		"Read each unheld token the check names, and write an approach onto it",
	}
	all := LintTokens(Roots{Method: "../..", Work: "../.."})
	// A LINT THAT READ NOTHING ANSWERS CLEAN, and this would pass on it. The
	// work root carries hundreds of tokens, so an empty answer is the reader
	// broken rather than the tree clean.
	if len(all) == 0 {
		t.Fatal("the lint read the work root and found nothing at all, so this decides nothing")
	}
	for _, f := range all {
		if !strings.Contains(f.Says, "a hold ends with the session") {
			continue
		}
		if f.ID == came {
			t.Errorf("%s is read as claiming a hold: %s", came, f.Says)
			continue
		}
		for _, line := range generic {
			if strings.Contains(f.Says, line) {
				t.Errorf("%s: a sentence about tokens in general is read as a claim on one: %s",
					f.ID, f.Says)
			}
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
