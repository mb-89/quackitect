package main

import (
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"testing"
)

// theTree answers the repository root, found by walking up until util/checks is
// there. A test that hardcodes ../.. breaks the day anybody moves the package.
func theTree(t *testing.T) string {
	t.Helper()
	at, err := os.Getwd()
	if err != nil {
		t.Fatal(err)
	}
	for i := 0; i < 6; i++ {
		if _, err := os.Stat(filepath.Join(at, "util", "checks")); err == nil {
			return at
		}
		at = filepath.Dir(at)
	}
	t.Fatal("no tree with util/checks above this package, so nothing here can read the record")
	return ""
}

// A RECORDED OBSERVATION NAMES THE TEST AND WHAT IT SAID.
//
// THE MATCH IS COMPUTED FROM THE SOURCE AND NOT FROM THE RECORDED MESSAGE. The
// runner has already substituted the values by the time an observation is
// written, so nothing in the line says where a value began. The prefixes are cut
// from the format strings instead, which is a syntactic fact.
func TestAnObservationNamesItsTest(t *testing.T) {
	root := theTree(t)
	tests := TestsDeclared(root)
	if len(tests) < 50 {
		t.Fatalf("only %d test functions were found under src, so this guards nothing", len(tests))
	}
	if !tests["TestAnObservationNamesItsTest"] {
		t.Error("the walk does not find this test, which is declared three lines above")
	}
	prefixes := ThePrefixes(root)
	if len(prefixes) < 50 {
		t.Fatalf("only %d assertion prefixes were cut, so nothing can match", len(prefixes))
	}
	// A FORMAT STRING OPENING WITH A VERB YIELDS THE EMPTY PREFIX AND IS
	// DROPPED, because a prefix everything begins with is a rule nothing fails.
	for _, p := range prefixes {
		if p == "" {
			t.Fatal("an empty prefix is in the set, so every message matches")
		}
	}
	if theLead("%d of the %d criteria") != "" {
		t.Errorf("a format opening with a verb yields %q rather than nothing",
			theLead("%d of the %d criteria"))
	}
	if theLead("the check said nothing") != "the check said nothing" {
		t.Error("a format with no verb is not its own lead, so an exact match cannot be made")
	}
	if theLead("the group %q counts %d") != "the group" {
		t.Errorf("the cut is %q rather than the run before the first verb",
			theLead("the group %q counts %d"))
	}

	// AND AN OBSERVATION THAT NAMES A DECLARED TEST IS SOUND.
	said := "TestAnObservationNamesItsTest: the group counts 4 and holds 5"
	if why := TheObservationIsSound(said, tests, []string{"the group"}); why != "" {
		t.Errorf("an observation naming a declared test was refused: %s", why)
	}
}

// THE CHECKER REFUSES AN OBSERVATION NAMING A TEST THE TREE DOES NOT DECLARE.
// That is the failure a line number could never catch: a message copied from a
// run that no longer exists.
func TestARedSaidNamingNoTestIsCaught(t *testing.T) {
	tests := map[string]bool{"TestThatIsHere": true}
	prefixes := []string{"the group"}

	gone := "TestThatIsGone: the group counts 4 and holds 5"
	why := TheObservationIsSound(gone, tests, prefixes)
	if why == "" {
		t.Fatal("an observation naming a test the tree does not declare was taken")
	}
	if !strings.Contains(why, "TestThatIsGone") {
		t.Errorf("the refusal does not name the test it could not find: %s", why)
	}

	// AND ONE THAT NAMES NO TEST AT ALL IS REFUSED TOO, which is the old form:
	// a file and a line where a name belongs.
	address := "ladder_test.go:47: the group counts 4 and holds 5"
	if TheObservationIsSound(address, tests, prefixes) == "" {
		t.Error("an observation naming a line rather than a test was taken")
	}

	// AND A MESSAGE NO ASSERTION UNDER src PRODUCES IS LEFT AS IT STANDS,
	// because inventing a name for a run nobody can find is worse than a stale
	// address.
	unknown := "something no assertion in this tree ever printed"
	if why := TheObservationIsSound(unknown, tests, prefixes); why != "" {
		t.Errorf("an observation matching nothing was refused rather than left: %s", why)
	}
}

// EVERY OBSERVATION IN THE RECORD NAMES A TEST THE TREE DECLARES.
//
// It prints both counts, converted and unconvertible, so the second is a number
// a reader can watch fall.
func TestNoObservationNamesALine(t *testing.T) {
	root := theTree(t)
	r := Roots{Method: root, Work: root}
	all := EveryObservation(r)
	if len(all) == 0 {
		t.Fatal("the record holds no observation, so this check guards nothing")
	}
	tests := TestsDeclared(root)
	prefixes := ThePrefixes(root)

	var wrong []string
	exempt := 0
	for _, o := range all {
		if !TheMessageMatches(TheMessageOf(o.Said), prefixes) {
			exempt++
			continue
		}
		if why := TheObservationIsSound(o.Said, tests, prefixes); why != "" {
			wrong = append(wrong, o.Token+": "+why)
		}
	}
	t.Logf("%d observations, %d matched an assertion, %d matched none and were left",
		len(all), len(all)-exempt, exempt)
	if len(wrong) > 0 {
		t.Errorf("%d observation(s) name a test the tree does not declare:\n  %s",
			len(wrong), strings.Join(wrong, "\n  "))
	}
}

// EVERY COMMAND A LIVE CRITERION NAMES IS A FILE GIT TRACKS.
//
// A check written into util/checks and never staged is one a worktree does not
// get, so a criterion that names it is red for everybody but its author.
func TestEveryCommandACriterionNamesIsTracked(t *testing.T) {
	root := theTree(t)
	r := Roots{Method: root, Work: root}
	var named []string
	seen := map[string]bool{}
	for _, tok := range Tokens(r) {
		if tok.Status.Ended() {
			continue
		}
		for _, c := range tok.Criteria {
			for _, word := range strings.Fields(c.Runs) {
				word = strings.Trim(word, `"'`)
				if !strings.HasPrefix(word, "util/") || seen[word] {
					continue
				}
				seen[word] = true
				named = append(named, word)
			}
		}
	}
	if len(named) == 0 {
		t.Fatal("no live criterion names a path under util, so this check guards nothing")
	}
	var loose []string
	for _, path := range named {
		// A FILE THAT IS NOT THERE YET IS NOT THE DEFECT. A criterion for work
		// nobody has done names a check nobody has written, and that criterion
		// is red for its own reason. What this catches is a check that EXISTS
		// and was never staged, so a worktree does not get it.
		if _, err := os.Stat(filepath.Join(root, path)); err != nil {
			continue
		}
		out, err := exec.Command("git", "-C", root, "ls-files", "--error-unmatch", path).CombinedOutput()
		if err != nil {
			loose = append(loose, path+": "+strings.TrimSpace(string(out)))
		}
	}
	if len(loose) > 0 {
		t.Errorf("%d of %d path(s) a live criterion names are not tracked:\n  %s",
			len(loose), len(named), strings.Join(loose, "\n  "))
	}
}
