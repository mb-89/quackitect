package main

import (
	"errors"
	"fmt"
	"os/exec"
	"regexp"
	"strings"
)

// A TOKEN CARRIES WHAT DONE MEANS BEFORE ANYBODY WORKS ON IT.
//
// The reviewer kept telling the worker it had not done the work. That is a
// fault in the token: nothing said what done meant, so nothing could be checked
// before the submission and the review became the first place anybody looked.
//
// THE SHAPE: the problem in the words it was asked in, and a list of criteria.
// Each criterion is one line saying what has to be true, and where that can be
// a command it is one, passing when it exits zero.
//
// WHO DRAFTS: everything a person mints, and everything an agent mints that is
// not a sub-token. A sub-token breaks down work whose criteria are already
// agreed, so it goes straight to open.

// NeedsSpec answers whether this token drafts before it is worked on.
func NeedsSpec(t Token) bool { return t.Parent == "" }

// StartsAt answers the state a newly minted token begins in.
//
// A SUB-TOKEN DOES NOT DRAFT. It breaks down work whose criteria are already
// agreed, so drafting it would agree the same thing twice.
//
// A BACKLOGGED TOKEN DOES NOT DRAFT YET. It is not work anybody is doing, and
// it drafts when somebody opens it.
func StartsAt(t Token) Status {
	if t.Status == Backlogged {
		return Backlogged
	}
	if NeedsSpec(t) {
		return SpecOpen
	}
	return ImpOpen
}

// CriteriaThatAlreadyPass answers the command criteria that exit zero before
// anybody has done the work.
//
// A CRITERION THAT PASSES BEFORE THE WORK CANNOT REPORT ON THE WORK. The spec
// is the cheapest place to catch one, because nothing is built yet to argue
// about.
//
// RED BY ABSENCE IS WHAT THIS FINDS. go test -run on a name that does not exist
// answers ok, no tests to run, and exits zero. A linter given a path it ignores
// does the same. So does a search over a folder that is not there. Each one
// reports success for a run in which it asserted nothing, and each one goes on
// doing so after the work lands. One draft reached review with eight command
// criteria and every one of them passed with nothing built.
func CriteriaThatAlreadyPass(r Roots, t Token) []string {
	var out []string
	for i, c := range t.Criteria {
		if c.Runs == "" {
			continue
		}
		// A CRITERION CARRYING ITS RED HAS ALREADY BEEN WATCHED FAIL, which is
		// the whole thing this gate establishes by seeing it red itself. A
		// draft that comes back after a round of implementation has green
		// criteria and nothing wrong with them, and without this it could never
		// be submitted at all. A gate with no way through is a wall.
		if c.Watched() {
			continue
		}
		said, err := runEvidence(r, c.Runs)
		if err != nil {
			continue
		}
		out = append(out, fmt.Sprintf("%d. %s\n     %s\n     it exits zero and nothing says anybody "+
			"has watched it fail, so it cannot report on the work: %s",
			i+1, c.Says, c.Runs, firstLines(said, 2)))
	}
	return out
}

// THE ENGINE JUDGES WHY A RED IS RED, at the same gate that refuses a green.
//
// A criterion that is red before the work can still be red for a reason that
// asserts nothing: the command crashed, or the absence half of a must-be-gone
// search never found its subject. Both walked through the same door as an
// honest assertion red, because the gate only asked whether the run errored.
//
// THREE CAUSES OF RED, TOLD APART WHERE THE GREEN CHECK RUNS. Red by
// assertion passes: a failing test, a clean not-found, a check the work will
// create answering Cannot find module, a check that throws the way checks
// fail. Red by crash refuses: rg handed a bad pattern exits two, go answers
// build failed, go answers a panic. Red by dead pattern refuses: the
// canonical must-be-gone form whose finding half matches nothing today.
//
// A CRITERION CARRYING ITS WATCHED RED IS SKIPPED, the same exception the
// green check makes, because a draft coming back after a round of
// implementation may legitimately hold a pattern whose subject the work
// removed.
func RedForTheWrongReason(r Roots, t Token) []string {
	var out []string
	for i, c := range t.Criteria {
		if c.Runs == "" || c.Watched() {
			continue
		}
		said, err := runEvidence(r, c.Runs)
		if err == nil {
			continue // green is the other gate's business
		}
		if cause := crashCause(said, err); cause != "" {
			out = append(out, fmt.Sprintf("%d. %s\n     %s\n     red by crash, %s. "+
				"A crash asserts nothing about the work, so this red cannot report on it",
				i+1, c.Says, c.Runs, cause))
			continue
		}
		if pat, dead := deadPattern(r, c.Runs); dead {
			out = append(out, fmt.Sprintf("%d. %s\n     %s\n     red by a dead pattern: "+
				"%q finds nothing today with its subject still in the tree, so the absence "+
				"half can never fail. Quote a fragment the file holds on one line",
				i+1, c.Says, c.Runs, pat))
		}
	}
	return out
}

// crashCause reads the output rather than only the status, because go test
// reports a build failure, a panic and a failing assertion with the same
// exit. An exit of two is rg refusing its own arguments -- and a search over
// a file that is not there is NOT a crash, because the commonest red before
// work in this tree is a check the token itself will create.
func crashCause(said string, err error) string {
	if strings.Contains(said, "build failed") {
		return "go answers build failed"
	}
	if strings.Contains(said, "panic:") {
		return "the run panics"
	}
	var ex *exec.ExitError
	if errors.As(err, &ex) && ex.ExitCode() == 2 &&
		!strings.Contains(said, "No such file") && !strings.Contains(said, "os error") {
		return "the command exits two before asserting anything"
	}
	return ""
}

// THE RECOGNISED SPELLING IS EXACTLY ONE, the canonical must-be-gone form
// these drafts carry, because a shell parser that guesses at every quoting is
// a second engine to get wrong. A presence guard, an unquoted pattern, or the
// halves in the other order is not judged by this probe and stays subject to
// the other judgements.
var mustBeGone = regexp.MustCompile(`^rg -q "([^"]+)" (\S+) && exit 1 \|\| rg -q "[^"]+" \S+$`)

// deadPattern runs the finding half of the canonical form on its own. A
// pattern that must find nothing once the work is done has to find something
// now, because its subject is still in the tree.
func deadPattern(r Roots, runs string) (string, bool) {
	m := mustBeGone.FindStringSubmatch(strings.TrimSpace(runs))
	if m == nil {
		return "", false
	}
	if _, err := runEvidence(r, fmt.Sprintf("rg -q %q %s", m[1], m[2])); err != nil {
		return m[1], true
	}
	return "", false
}

// DraftReady answers what stops a draft going to review, or nothing.
func DraftReady(r Roots, t Token) error {
	if strings.TrimSpace(t.Detail) == "" {
		return fmt.Errorf("a spec says what the problem is, and this one has no detail")
	}
	if len(t.Criteria) == 0 {
		return fmt.Errorf("a spec says what done means. Give at least one criterion, " +
			"and a command for every one that can have one")
	}
	for i, c := range t.Criteria {
		if strings.TrimSpace(c.Says) == "" {
			return fmt.Errorf("criterion %d says nothing", i+1)
		}
	}
	// TOO BIG TO CONVERGE IS A PROPERTY THE GATE CAN COUNT.
	//
	// A draft carrying more criteria than the ceiling is not reviewed criterion
	// by criterion: its one finding is the size, and the remedy is a split. The
	// record holds wk-24be1c06ae, which ate ten rejection rounds, because a
	// token that big always has some criterion left for the next reviewer to
	// reject.
	//
	// THE CEILING IS READ FROM THE CONFIG AND NEVER WRITTEN HERE. That is what
	// makes it a value a person moves rather than a literal in a build, and it
	// is why this function takes the roots it used to do without.
	if ceiling := LoadConfig(r).CriteriaCeiling; ceiling > 0 && len(t.Criteria) > ceiling {
		return fmt.Errorf("this draft carries %d criteria and the ceiling is %d. "+
			"A draft that big is too big to converge, and the remedy is to split it: "+
			"mint sub-tokens and give each one the criteria it owns",
			len(t.Criteria), ceiling)
	}
	return nil
}

// UnmetCriteria answers the criteria a submission has not satisfied.
//
// THE WORKER RUNS THEM BEFORE SUBMITTING. Asking the reviewer to find out is
// what this replaces, so a criterion with a command is run here and one without
// is answered by name in the evidence.
func UnmetCriteria(r Roots, t Token, p Payload) []string {
	var out []string
	for i, c := range t.Criteria {
		// A CRITERION NOBODY HAS WATCHED FAIL IS A CRITERION NOBODY HAS TESTED.
		// Running it once and seeing green says the command exits zero. It says
		// nothing about whether the command could ever exit anything else.
		if !c.Watched() {
			out = append(out, fmt.Sprintf("%d. %s\n     %s\n     nobody has watched this fail. "+
				"Take the work away, run it, and record what was absent and what it said",
				i+1, c.Says, c.Runs))
			continue
		}
		if c.Runs != "" {
			said, err := runEvidence(r, c.Runs)
			if err != nil {
				out = append(out, fmt.Sprintf("%d. %s\n     %s\n     %s",
					i+1, c.Says, c.Runs, firstLines(said, 4)))
			}
			continue
		}
		// A CRITERION WITHOUT A COMMAND IS ANSWERED BY NAME. The evidence is a
		// form, so the answer goes in a section called after the criterion.
		if strings.TrimSpace(p.Evidence[c.Says]) == "" {
			out = append(out, fmt.Sprintf("%d. %s\n     no command decides this, so answer it "+
				"in the evidence under exactly that name", i+1, c.Says))
		}
	}
	return out
}

// EVERY REJECTION CARRIES A LESSON, NOT ONLY A FINDING.
//
// A finding teaches one token. A lesson names the class and teaches everything
// after it. One token took five rounds because each round fixed the instance
// the reviewer named and left the class standing.
//
// WHERE THE LESSON GOES. Small enough to do inside the work being rejected, it
// goes into that token and the reviewer says so. Bigger than that, it is minted
// as its own backlogged token and the rejection names the id.
type Lesson struct {
	Class string `json:"class"` // the class of mistake, not this instance of it
	Avoid string `json:"avoid"` // what to do instead, next time and in general

	// WHAT WOULD HAVE STOPPED IT BEING MADE, which is a different sentence
	// from what would have caught it.
	//
	// THE OWNER ASKED FOR IT BY NAME: I do not only want the reviewer to tell
	// us how we can find the mistakes in the future, I want guidance on how to
	// avoid them in the first place.
	//
	// avoid IS NEARLY ALWAYS DETECTION. Run the sweep, follow the citation,
	// put the defect back. That is read by somebody already suspicious. This
	// is read by somebody who has not started, and it has to be short enough
	// to remember at the moment of writing.
	Prevents string `json:"prevents"`
	Token    string `json:"token,omitempty"`
	Round    int    `json:"round,omitempty"`
	By       string `json:"by,omitempty"`

	// THE TOKEN THE REVIEWER MINTED FOR IT. A lesson that is only a sentence on
	// a note is a sentence somebody has to remember to act on, and every rule an
	// agent has to remember is a rule an agent forgets.
	//
	// THE REVIEWER MINTS IT AND THE ENGINE REFUSES WITHOUT IT. Which class a
	// finding belongs to, whether a second round is a new class or the one
	// already written down, and whether it goes to the backlog or straight into
	// what is open, are judgments. The engine cannot make them, and matching on
	// the words would be a word list fitted to the cases already seen.
	Learned string `json:"learned,omitempty"`
}

func (l Lesson) Empty() bool {
	return strings.TrimSpace(l.Class) == "" || strings.TrimSpace(l.Avoid) == ""
}
