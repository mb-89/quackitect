package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// HALF A MECHANISM SHIPS, AND THE HALF LEFT OUT IS THE ONE THAT AUDITS THE
// OTHER. The class, written where a drafter reads and where every agent reads.
//
// TWO FILES AND NOT ONE. specifying.md is where a drafter reads what a criterion
// has to be, and it is the source of no projection, so a class written only
// there reaches nobody outside this repository. behaviour.md is projected.
//
// EACH CHECK READS A SECTION AND NOT A FILE. A search over a whole file cannot
// see which section a rule is in, and where the deliverable is prose the string
// and its placement are the only two things there are.
const (
	halfMechSpecifying = "doc/guidance/specifying.md"
	halfMechBehaviour  = "doc/guidance/behaviour.md"
	halfMechSpecHead   = "## The command decides the sentence above it"
	halfMechBehaveHead = "## Evidence"
)

// sectionUnder answers the text a heading opens, to the next heading of the
// same level.
//
// A SUBSECTION IS INSIDE ITS SECTION. Evidence is a level-two heading with
// level-three headings under it, and a rule under one of those is still under
// Evidence, so the section runs to the next heading of the same depth rather
// than to the next heading of any depth.
func sectionUnder(t *testing.T, root, file, heading string) string {
	t.Helper()
	b, err := os.ReadFile(filepath.Join(root, filepath.FromSlash(file)))
	if err != nil {
		t.Fatalf("%s cannot be read, so this guards nothing: %v", file, err)
	}
	depth := len(heading) - len(strings.TrimLeft(heading, "#"))
	lines := strings.Split(string(b), nl)
	from := -1
	for i, line := range lines {
		if strings.TrimSpace(line) == heading {
			from = i + 1
			continue
		}
		if from < 0 || !strings.HasPrefix(line, "#") {
			continue
		}
		if len(line)-len(strings.TrimLeft(line, "#")) <= depth {
			return strings.Join(lines[from:i], nl)
		}
	}
	if from < 0 {
		t.Fatalf("%s has no heading %q, so this guards nothing", file, heading)
	}
	return strings.Join(lines[from:], nl)
}

// bothPlaces answers the two sections this class is written into.
func bothPlaces(t *testing.T) map[string]string {
	t.Helper()
	root := filepath.Join("..", "..")
	return map[string]string{
		halfMechSpecifying: sectionUnder(t, root, halfMechSpecifying, halfMechSpecHead),
		halfMechBehaviour:  sectionUnder(t, root, halfMechBehaviour, halfMechBehaveHead),
	}
}

// saysAll fails naming the file that is short, and the phrase it is short of.
//
// NAMING THE FILE IS THE POINT. A check that confirmed one place and was silent
// about the other is how a rule ends up in the file nobody's harness reads.
func saysAll(t *testing.T, where string, said string, wants []string) {
	t.Helper()
	for _, want := range wants {
		if !strings.Contains(strings.ToLower(said), strings.ToLower(want)) {
			t.Errorf("%s does not say %q", where, want)
		}
	}
}

// THE PHRASE IS ONE THE BODY CARRIES AND A HEADING DOES NOT. behaviour.md
// gives this class a heading of its own, and a check looking for the heading's
// own words was green over a section whose body had been cut out entirely,
// which is a description of the rule standing in for the rule.
const halfMechSays = "the half left out is the one that audits the other"

func TestTheHalfMechanismRuleIsWhereItSays(t *testing.T) {
	said := sectionUnder(t, filepath.Join("..", ".."), halfMechSpecifying, halfMechSpecHead)
	saysAll(t, halfMechSpecifying, said, []string{halfMechSays})
}

func TestTheHalfMechanismRuleIsAlsoWhereItProjects(t *testing.T) {
	said := sectionUnder(t, filepath.Join("..", ".."), halfMechBehaviour, halfMechBehaveHead)
	saysAll(t, halfMechBehaviour, said, []string{halfMechSays})
}

// BOTH INSTRUCTIONS, IN BOTH PLACES. A rule that says what went wrong and not
// what to do is a description rather than a method.
func TestTheHalfMechanismRuleSaysWhatToDoInBothFiles(t *testing.T) {
	for where, said := range bothPlaces(t) {
		saysAll(t, where, said, []string{
			"put both halves in the evidence",
			"which half has no output",
		})
	}
}

// THE ANSWER THAT FAILS IS SILENCE, and it has to be said, because a reader who
// has nothing to report needs telling that nothing is not an answer.
func TestTheHalfMechanismRuleNamesTheAnswerThatFailsInBothFiles(t *testing.T) {
	for where, said := range bothPlaces(t) {
		saysAll(t, where, said, []string{
			"nothing yet",
			"silence",
		})
	}
}

// AND THE MEASUREMENT IT CAME FROM, rather than the claim alone.
func TestTheHalfMechanismRuleCarriesItsMeasurementInBothFiles(t *testing.T) {
	for where, said := range bothPlaces(t) {
		saysAll(t, where, said, []string{
			"wk-7f0b46d99f",
			"built nowhere",
		})
	}
}

// THE RULE REACHES EVERY AGENT, and the harnesses are derived rather than
// typed, because a hand-drawn list is exactly the size of what you already
// looked at.
func TestTheHalfMechanismRuleReachesEveryProjection(t *testing.T) {
	root := filepath.Join("..", "..")
	const rule = halfMechSays
	targets := projectionTargets(t, root, halfMechBehaviour)
	if len(targets) == 0 {
		t.Fatalf("nothing is projected from %s, so this guards nothing", halfMechBehaviour)
	}
	for _, target := range targets {
		b, err := os.ReadFile(filepath.Join(root, filepath.FromSlash(target)))
		if err != nil {
			t.Errorf("%s is projected from %s and cannot be read: %v", target, halfMechBehaviour, err)
			continue
		}
		if !strings.Contains(strings.ToLower(string(b)), rule) {
			t.Errorf("%s is projected from %s and does not carry the rule", target, halfMechBehaviour)
		}
	}
}
