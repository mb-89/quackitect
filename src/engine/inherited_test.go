package main

import (
	"os"
	"path/filepath"
	"testing"
)

// WORK ADOPTED ON THE STRENGTH OF ITS TESTS, WITH NONE OF THEM RUN AGAINST THE
// DEFECT IT NAMES. The class, written where the check-comes-first rule already
// lives, because this is that rule at the moment the check arrives green.
//
// EACH CHECK READS THE SECTION AND ASKS ONE QUESTION OF IT. Where the thing
// being made is a paragraph, the string and its placement are the only two
// things there are, so a search over a whole file cannot say which section a
// rule is in.
const (
	inheritedFile = "doc/guidance/behaviour.md"
	inheritedHead = "### The check comes first"
)

func inheritedSection(t *testing.T) string {
	t.Helper()
	return sectionUnder(t, filepath.Join("..", ".."), inheritedFile, inheritedHead)
}

func TestTheInheritedCheckRuleIsWhereItSays(t *testing.T) {
	saysAll(t, inheritedFile, inheritedSection(t), []string{
		"arrives already green",
	})
}

// EVERY STEP THE DETAIL NAMES, ONE ASSERTION EACH, AND NO COUNT IN THE
// SENTENCE. A number beside a list is two things that can disagree, and this
// one did: it said four over a list of five, and the step most likely to go was
// the fifth, which is the only one that leaves anything behind.
func TestTheInheritedCheckRuleSaysWhatToDo(t *testing.T) {
	said := inheritedSection(t)
	for _, step := range []string{
		"break what the check guards",
		"watch it go red",
		"put it back",
		"watch it go green",
		"write the two lines",
	} {
		saysAll(t, inheritedFile, said, []string{step})
	}
}

// THE MEASUREMENT, AND THE CHECK ASKS FOR EACH OF THE THREE FACTS.
//
// THE TWO SPELLINGS ARE NAMED BY THE FUNCTIONS THAT PRODUCE THEM AND NOT
// WRITTEN OUT, because this file is projected and the cage guard refuses a
// projected file that names this machine. A function name is not a topic word:
// nothing else in the section carries it.
func TestTheInheritedCheckRuleCarriesItsMeasurement(t *testing.T) {
	said := inheritedSection(t)
	for _, fact := range []string{
		"filepath.Abs",
		"filepath.ToSlash",
		"one string on the platform it passed review on",
	} {
		saysAll(t, inheritedFile, said, []string{fact})
	}
}

// AND THE NARROWER LESSON, WHICH IS THE HALF THAT PREVENTS RATHER THAN CATCHES.
// The five steps say how to catch the mistake after somebody has leaned on it.
// This says to open the artefact before choosing what to compare, which is the
// thing that was not done upstream.
func TestTheInheritedCheckRuleSaysToOpenTheArtefact(t *testing.T) {
	saysAll(t, inheritedFile, inheritedSection(t), []string{
		"in the spelling the producer writes",
		"ask what the artefact contains",
	})
}

// IT IS SCOPED RATHER THAN UNIVERSAL, and the section says the cost of the
// other reading, because a rule nobody can afford is a rule nobody keeps.
func TestTheInheritedCheckRuleIsScoped(t *testing.T) {
	saysAll(t, inheritedFile, inheritedSection(t), []string{
		"the ones the verdict's reason turns on",
		"a rule nobody can afford",
	})
}

// AND IT REACHES EVERY AGENT, with the harnesses derived rather than typed,
// because a hand-drawn list is exactly the size of what you already looked at.
func TestTheInheritedCheckRuleReachesEveryProjection(t *testing.T) {
	root := filepath.Join("..", "..")
	const rule = "arrives already green"
	targets := projectionTargets(t, root, inheritedFile)
	if len(targets) == 0 {
		t.Fatalf("nothing is projected from %s, so this guards nothing", inheritedFile)
	}
	for _, target := range targets {
		b, err := os.ReadFile(filepath.Join(root, filepath.FromSlash(target)))
		if err != nil {
			t.Errorf("%s is projected from %s and cannot be read: %v", target, inheritedFile, err)
			continue
		}
		if !carriesLoosely(string(b), rule) {
			t.Errorf("%s is projected from %s and does not carry the rule", target, inheritedFile)
		}
	}
}
