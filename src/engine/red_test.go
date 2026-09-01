package main

import (
	"strings"
	"testing"
)

// A CRITERION NOBODY HAS SEEN FAIL IS A CRITERION NOBODY HAS TESTED.
//
// The owner's rule: before a worker submits, it has to have seen the check red.
// Not red by some random thing. Red by the assertion it built, with the fix
// absent.
//
// RED BY ABSENCE IS NOT RED. go test -run on a name that does not exist answers
// ok, no tests to run, and exits zero. A draft went to review with eight
// command criteria and every one of them passed with nothing built and no test
// written. Each one reported success for a run in which it asserted nothing.

// A COMMAND CRITERION THAT ALREADY PASSES CANNOT REPORT ON THE WORK, and the
// spec gate is the cheapest place to catch it because nothing is built yet.
func TestASpecWhoseCriteriaAlreadyPassIsRefused(t *testing.T) {
	r := guidanceTree(t)
	tok := mint(t, r, Token{Title: "a thing to build", Status: SpecOpen,
		Detail: "what the problem is", MintedBy: "person",
		Criteria: []Criterion{{Says: "the thing is built", Runs: "exit 0"}}})
	Pull(r, "main", RoleWorker, Payload{})

	a := Pull(r, "main", RoleWorker, Payload{ID: tok.ID})
	if a.Pull != AnswerRefused {
		t.Fatalf("a draft whose criterion already passes went to review: %q", a.Pull)
	}
	if !hasClause(a.Findings, "the criteria") {
		t.Fatalf("the refusal does not name the criteria: %v", a.Findings)
	}
	// AND ONE THAT IS RED IS LET THROUGH, so the gate is about the criterion
	// rather than about having criteria at all.
	other := mint(t, r, Token{Title: "another thing", Status: SpecOpen,
		Detail: "what the problem is", MintedBy: "person",
		Criteria: []Criterion{{Says: "the thing is built", Runs: "exit 1"}}})
	Pull(r, "main", RoleWorker, Payload{})
	if a := Pull(r, "main", RoleWorker, Payload{ID: other.ID}); a.Pull == AnswerRefused {
		t.Fatalf("a draft whose criterion is red was refused: %v", a.Findings)
	}
}

// THE CHECK THE SPEC GATE MAKES IS ABOUT COMMANDS, so a spec of prose criteria
// passes it rather than being refused for having nothing to run.
func TestASpecOfProseCriteriaIsNotRefusedForHavingNoCommand(t *testing.T) {
	r := guidanceTree(t)
	tok := mint(t, r, Token{Title: "a thing to judge", Status: SpecOpen,
		Detail: "what the problem is", MintedBy: "person",
		Criteria: []Criterion{{Says: "a reader can follow it"}}})
	Pull(r, "main", RoleWorker, Payload{})
	if a := Pull(r, "main", RoleWorker, Payload{ID: tok.ID}); a.Pull == AnswerRefused {
		t.Fatalf("a spec of prose criteria was refused: %v", a.Findings)
	}
}

// A SUBMISSION RESTING ON A CRITERION NOBODY WATCHED FAIL IS REFUSED.
//
// The observation is two things and it needs both: what was taken away to make
// it fail, and what it said when it did.
func TestASubmissionOnAnUnwatchedCriterionIsRefused(t *testing.T) {
	r := lane(t)
	tok := mint(t, r, Token{Title: "do the thing", Status: ImpOpen,
		Criteria: []Criterion{{Says: "the thing is built", Runs: "exit 0"}}})
	Pull(r, "main", RoleWorker, Payload{})

	a := Pull(r, "main", RoleWorker, Payload{ID: tok.ID, Disposition: string(Done)})
	if a.Pull != AnswerRefused {
		t.Fatalf("a submission on an unwatched criterion was taken: %q", a.Pull)
	}
	if !hasClause(a.Findings, "the criteria") {
		t.Fatalf("the refusal does not name the criteria: %v", a.Findings)
	}
	if !strings.Contains(whatIsWrong(a.Findings), "nobody has watched") {
		t.Fatalf("the refusal does not say what is missing: %v", a.Findings)
	}
}

// HALF AN OBSERVATION IS NOT AN OBSERVATION. Each half is refused on its own,
// so a criterion carrying one of them cannot pass by carrying the other.
func TestHalfAnObservationIsRefused(t *testing.T) {
	for _, one := range []struct {
		name string
		c    Criterion
	}{
		{"what was taken away, and nothing about what was seen",
			Criterion{Says: "the thing is built", Runs: "exit 0", Without: "the fix"}},
		{"what was seen, and nothing about what was taken away",
			Criterion{Says: "the thing is built", Runs: "exit 0", Red: "it said no such thing"}},
	} {
		r := lane(t)
		tok := mint(t, r, Token{Title: "do the thing", Status: ImpOpen,
			Criteria: []Criterion{one.c}})
		Pull(r, "main", RoleWorker, Payload{})
		a := Pull(r, "main", RoleWorker, Payload{ID: tok.ID, Disposition: string(Done)})
		if a.Pull != AnswerRefused {
			t.Fatalf("a criterion carrying %s was taken", one.name)
		}
	}
}

// A WATCHED CRITERION GOES THROUGH, so the gate is about the observation and
// not about refusing every submission.
func TestAWatchedCriterionGoesThrough(t *testing.T) {
	r := lane(t)
	tok := mint(t, r, Token{Title: "do the thing", Status: ImpOpen,
		Criteria: []Criterion{{Says: "the thing is built", Runs: "exit 0",
			Without: "the whole of thing.go", Red: "it said thing: no such file"}}})
	Pull(r, "main", RoleWorker, Payload{})
	a := Pull(r, "main", RoleWorker, Payload{ID: tok.ID, Disposition: string(Done)})
	if a.Pull == AnswerRefused {
		t.Fatalf("a watched criterion was refused: %v", a.Findings)
	}
	back, _ := LoadToken(r, tok.ID)
	if back.Status != ImpSubmitted {
		t.Fatalf("after a good submission it is %s", back.Status)
	}
}

// THE OBSERVATION IS A FIELD AND NOT A PARAGRAPH NEAR ONE.
//
// The note is re-rendered from the parsed token every time it is saved, so
// prose written into the done when section is dropped on the next save. Three
// drafts said in that section that every command had been run and seen red,
// and all three lost the sentence between being written and being read.
func TestTheObservationSurvivesTheNote(t *testing.T) {
	r := lane(t)
	tok := mint(t, r, Token{Title: "do the thing", Status: ImpOpen,
		Criteria: []Criterion{
			{Says: "the thing is built", Runs: "exit 0",
				Without: "the whole of thing.go", Red: "it said thing: no such file"},
			{Says: "a reader can follow it"},
		}})
	back, err := LoadToken(r, tok.ID)
	if err != nil {
		t.Fatal(err)
	}
	if len(back.Criteria) != 2 {
		t.Fatalf("%d criteria read back", len(back.Criteria))
	}
	if back.Criteria[0].Without != "the whole of thing.go" {
		t.Fatalf("what was taken away read back as %q", back.Criteria[0].Without)
	}
	if back.Criteria[0].Red != "it said thing: no such file" {
		t.Fatalf("what was seen read back as %q", back.Criteria[0].Red)
	}
	// AND IT SURVIVES A SECOND SAVE, which is where the prose went.
	if err := SaveToken(r, back); err != nil {
		t.Fatal(err)
	}
	again, _ := LoadToken(r, tok.ID)
	if again.Criteria[0].Without == "" || again.Criteria[0].Red == "" {
		t.Fatalf("the observation was lost on the second save: %+v", again.Criteria[0])
	}
	// A prose criterion carries no observation and keeps carrying none.
	if again.Criteria[1].Without != "" || again.Criteria[1].Red != "" {
		t.Fatalf("a prose criterion grew an observation: %+v", again.Criteria[1])
	}
}

func hasClause(fs []Rejection, clause string) bool {
	for _, f := range fs {
		if f.Clause == clause {
			return true
		}
	}
	return false
}

func whatIsWrong(fs []Rejection) string {
	var b strings.Builder
	for _, f := range fs {
		b.WriteString(f.Wrong + nl)
	}
	return b.String()
}

// A LINE HOLDS ONE LINE, AND THE RECORD REFUSES WHAT IT CANNOT READ BACK.
//
// THE GATE SWITCHES ITSELF OFF WITHOUT THIS, which is why it is here rather
// than on the token about the parser. A criterion is written as one lead and
// one line, and the reader stops at the first newline. So a two-line Runs is
// read back as no command at all, the criterion becomes prose, and Watched
// answers true for prose because prose is answered by name in the evidence.
// Writing a command on two lines therefore turns the gate off silently.
//
// FOUR FIELDS, and they are the ones the note writes on one line. A block field
// is a different shape and belongs to the token about the parser.
func TestALineHoldsOneLine(t *testing.T) {
	r := lane(t)
	tried := 0
	for _, one := range []struct {
		field string
		c     Criterion
	}{
		{"says", Criterion{Says: "it works" + nl + "and also this", Runs: "exit 0",
			Without: "the fix", Red: "it said no"}},
		{"runs", Criterion{Says: "it works", Runs: "cd src" + nl + "go test .",
			Without: "the fix", Red: "it said no"}},
		{"red without", Criterion{Says: "it works", Runs: "exit 0",
			Without: "the fix" + nl + "and the test", Red: "it said no"}},
		{"red said", Criterion{Says: "it works", Runs: "exit 0",
			Without: "the fix", Red: "it said no" + nl + "twice"}},
	} {
		tried++
		tok := mint(t, r, Token{Title: "one to write"})
		tok.Criteria = []Criterion{one.c}
		err := SaveToken(r, tok)
		if err == nil {
			t.Errorf("a criterion whose %s is two lines was written", one.field)
			continue
		}
		if !strings.Contains(err.Error(), one.field) {
			t.Errorf("the refusal does not name %s: %v", one.field, err)
		}
		if !strings.Contains(err.Error(), "it works") {
			t.Errorf("the refusal does not say which criterion: %v", err)
		}
	}
	if tried == 0 {
		t.Fatal("no field was tried, so this guards nothing")
	}
	// AND ONE LINE IS WRITTEN, so the refusal is about the second line rather
	// than about having a criterion at all.
	tok := mint(t, r, Token{Title: "one that fits"})
	tok.Criteria = []Criterion{{Says: "it works", Runs: "exit 0",
		Without: "the fix", Red: "it said no"}}
	if err := SaveToken(r, tok); err != nil {
		t.Fatalf("a criterion that fits on its lines was refused: %v", err)
	}
}

// A COMMAND WRITTEN ON TWO LINES CANNOT TURN THE GATE OFF.
//
// This is the consequence, driven end to end rather than reasoned about: the
// submission gate asks Watched, Watched answers true for a criterion with no
// command, and the parser turns a two-line command into no command.
func TestATwoLineCommandCannotSwitchTheGateOff(t *testing.T) {
	r := lane(t)
	tok := mint(t, r, Token{Title: "do the thing", Status: ImpOpen})
	// The shape a drafter would write, with the command on two lines and no
	// observation at all.
	tok.Criteria = []Criterion{{Says: "the thing is built", Runs: "cd src" + nl + "go test ."}}
	if err := SaveToken(r, tok); err == nil {
		t.Fatal("a two-line command was written, so the criterion reads back as prose " +
			"and the gate stops asking for an observation")
	}
	// AND THE GATE IS STILL ASKING. Written on one line, the same criterion is
	// refused at the submission for having no observation.
	tok.Criteria = []Criterion{{Says: "the thing is built", Runs: "exit 0"}}
	if err := SaveToken(r, tok); err != nil {
		t.Fatal(err)
	}
	Pull(r, "main", RoleWorker, Payload{})
	a := Pull(r, "main", RoleWorker, Payload{ID: tok.ID, Disposition: string(Done)})
	if a.Pull != AnswerRefused {
		t.Fatalf("the gate took a submission on an unwatched criterion: %q", a.Pull)
	}
}

// A CRITERION THAT ALREADY PASSES AND CARRIES ITS RED IS AGREED.
//
// THE HOLE THIS CLOSES. The spec gate refuses a command criterion that exits
// zero, because one that passes before the work cannot report on the work. That
// is right while the work is ahead of it. It is wrong for a draft that comes
// back after a round of implementation: the work is done, the criteria are
// green, and the redraft can never be submitted at all. A gate with no way
// through is not a gate, it is a wall.
//
// THE OBSERVATION IS THE EVIDENCE, and the engine already asks for it at the
// other gate. A criterion carrying what was taken away and what it said when it
// failed has been watched red by somebody, which is the whole thing the spec
// gate was trying to establish by seeing it red itself.
//
// SO THE TWO GATES ASK ONE QUESTION between them: has anybody watched this fail.
// Red now answers it. A recorded observation answers it. Nothing else does.
func TestADraftWhoseCriteriaCarryTheirRedIsAgreed(t *testing.T) {
	r := guidanceTree(t)
	// The shape a redraft has: the work is done, so the command passes.
	tok := mint(t, r, Token{Title: "a thing rebuilt", Status: SpecOpen,
		Detail: "what the problem is", MintedBy: "person",
		Criteria: []Criterion{{Says: "the thing is built", Runs: "exit 0",
			Without: "the whole of thing.go", Red: "it said thing: no such file"}}})
	Pull(r, "main", RoleWorker, Payload{})
	if a := Pull(r, "main", RoleWorker, Payload{ID: tok.ID}); a.Pull == AnswerRefused {
		t.Fatalf("a redraft whose criteria carry their red was refused: %v", a.Findings)
	}

	// AND ONE THAT PASSES WITH NO OBSERVATION IS STILL REFUSED, because nothing
	// says anybody has ever seen it fail.
	other := mint(t, r, Token{Title: "a thing not watched", Status: SpecOpen,
		Detail: "what the problem is", MintedBy: "person",
		Criteria: []Criterion{{Says: "the thing is built", Runs: "exit 0"}}})
	Pull(r, "main", RoleWorker, Payload{})
	a := Pull(r, "main", RoleWorker, Payload{ID: other.ID})
	if a.Pull != AnswerRefused {
		t.Fatalf("a draft whose criterion passes unwatched went to review: %q", a.Pull)
	}
	if !hasClause(a.Findings, "the criteria") {
		t.Fatalf("the refusal does not name the criteria: %v", a.Findings)
	}
}
