package main

import (
	"os"
	"path/filepath"
	"testing"
)

// A DESCRIPTION OF THE SET STANDING IN FOR THE SET. The class, written where a
// harness reads it.
//
// ONE PLACE, NAMED IN FULL BY EVERY CRITERION. specifying.md already carries
// this class, at 694def52, so nothing here asserts it: a criterion that named
// no file would have been satisfied by the finished one while the projected
// file stayed empty.
const (
	enumerateFile = "doc/guidance/behaviour.md"
	enumerateHead = "### When a claim says every, count from the side that produces them"
)

func enumerateSection(t *testing.T) string {
	t.Helper()
	return sectionUnder(t, filepath.Join("..", ".."), enumerateFile, enumerateHead)
}

func TestTheEnumerationRuleIsUnderItsHeading(t *testing.T) {
	saysAll(t, enumerateFile, enumerateSection(t), []string{
		"describes the members instead of asking for them",
	})
}

// BOTH SHAPES, AND THE TELL THEY SHARE. A hand list types the members out. A
// pattern says what they look like. Both are complete on the day they are
// written and neither knows when it stops being.
func TestTheEnumerationRuleNamesBothShapes(t *testing.T) {
	said := enumerateSection(t)
	for _, want := range []string{
		"a hand list types them out",
		"a pattern says what they look like",
		"describes the members instead of asking for them",
	} {
		saysAll(t, enumerateFile, said, []string{want})
	}
}

// AND THE MEASUREMENT IT CAME FROM, rather than the claim alone.
func TestTheEnumerationRuleCarriesItsMeasurement(t *testing.T) {
	said := enumerateSection(t)
	for _, want := range []string{
		"eight of nine",
		"kept its literals",
		"nine struct fields would have missed the tenth",
	} {
		saysAll(t, enumerateFile, said, []string{want})
	}
}

// AND THE TWO ANSWERS, WHICH DIFFER. Where the language can enumerate, ask it.
// Where it cannot, hold the count against something the check did not produce.
func TestTheEnumerationRuleSaysWhatToDo(t *testing.T) {
	said := enumerateSection(t)
	for _, want := range []string{
		"where the language can enumerate, ask it",
		"against something the check did not produce",
	} {
		saysAll(t, enumerateFile, said, []string{want})
	}
}

// AND IT REACHES EVERY AGENT, with the targets derived rather than typed,
// because a hand-drawn list is exactly the size of what you already looked at.
func TestTheEnumerationRuleReachesEveryProjection(t *testing.T) {
	root := filepath.Join("..", "..")
	const rule = "describes the members instead of asking for them"
	targets := projectionTargets(t, root, enumerateFile)
	if len(targets) == 0 {
		t.Fatalf("nothing is projected from %s, so this guards nothing", enumerateFile)
	}
	for _, target := range targets {
		b, err := os.ReadFile(filepath.Join(root, filepath.FromSlash(target)))
		if err != nil {
			t.Errorf("%s is projected from %s and cannot be read: %v", target, enumerateFile, err)
			continue
		}
		if !carriesLoosely(string(b), rule) {
			t.Errorf("%s is projected from %s and does not carry the rule", target, enumerateFile)
		}
	}
}
