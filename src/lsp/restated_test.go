package main

import "testing"

// A heading retelling the chapter its pointer names drifts from it. [[spec/design_output/tree#the-rules-over-two-files]]
func TestRestatedPointerDrawsARetelling(t *testing.T) {
	tree := fixture(t, map[string]string{
		"spec/design_output/one.md": "# The stop hook holds a turn\n\nA line stands here.\n",
		"spec/guidance/two.md": "# The stop hook holds a turn\n\n" +
			"For details, see [[spec/design_output/one#the-stop-hook-holds-a-turn]].\n",
	})

	found := rules(restatedFaults(tree, 4, 6))
	if len(found) != 1 || found[0] != RestatedPointer {
		t.Fatalf("the rule draws once over a retelling, and it answers %v", found)
	}
}

// A heading of its own says what the chapter under the pointer leaves unsaid. [[spec/design_output/tree#the-rules-over-two-files]]
func TestRestatedPointerStandsQuiet(t *testing.T) {
	tree := fixture(t, map[string]string{
		"spec/design_output/one.md": "# The stop hook holds a turn\n\nA line stands here.\n",
		"spec/guidance/two.md": "# What a session reads first\n\n" +
			"For details, see [[spec/design_output/one#the-stop-hook-holds-a-turn]].\n",
	})

	if found := rules(restatedFaults(tree, 4, 6)); len(found) != 0 {
		t.Fatalf("a heading of its own draws nothing, and this answers %v", found)
	}
}

// One rule in two guidance notes drifts, so the rule draws on the second. [[spec/design_output/tree#the-rules-over-two-files]]
func TestRestatedRuleDrawsAcrossNotes(t *testing.T) {
	tree := fixture(t, map[string]string{
		"spec/guidance/one.md": "# Actionables\n\n" +
			"1. Reach the outside through a door under src/doors, and nowhere else.\n",
		"spec/guidance/two.md": "# Actionables\n\n" +
			"1. Reach the outside through a door under src/doors, and never otherwise.\n",
	})

	found := rules(restatedFaults(tree, 4, 6))
	if len(found) != 1 || found[0] != RestatedRule {
		t.Fatalf("the rule draws once over a rule in two notes, and it answers %v", found)
	}
}

// Two rules of two notes say two things, so the rule stands quiet. [[spec/design_output/tree#the-rules-over-two-files]]
func TestRestatedRuleStandsQuiet(t *testing.T) {
	tree := fixture(t, map[string]string{
		"spec/guidance/one.md": "# Actionables\n\n1. Reach the outside through a door.\n",
		"spec/guidance/two.md": "# Actionables\n\n1. Write the present tense, and name the reader.\n",
	})

	if found := rules(restatedFaults(tree, 4, 6)); len(found) != 0 {
		t.Fatalf("two rules apart draw nothing, and this answers %v", found)
	}
}

// The lint hands the checker a folder, so each note under it reads as its own. [[spec/design_output/lsp#one-checker-every-front-asks]]
func TestPathsUnderWalksAFolder(t *testing.T) {
	tree := fixture(t, map[string]string{
		"spec/guidance/one.md":      "# Actionables\n\n1. Reach a door.\n",
		"spec/design_output/two.md": "# A chapter\n\nA line.\n",
	})

	said := pathsUnder(tree, []string{"spec/guidance"})
	if len(said) != 1 || said[0] != "spec/guidance/one.md" {
		t.Fatalf("a folder reads as the notes under it, and this answers %v", said)
	}

	if one := pathsUnder(tree, []string{"spec/guidance/one.md"}); len(one) != 1 {
		t.Fatalf("a named file stands as it reads, and this answers %v", one)
	}
}

// The measure answers the run, and a code span or a link counts for nothing. [[spec/design_output/tree#the-rules-over-two-files]]
func TestSharedRunAnswersTheLongestRun(t *testing.T) {
	if said := sharedRun("the door reads the whole file", "a door reads the whole file now"); said != 5 {
		t.Fatalf("the run holds five words, and the measure answers %d", said)
	}
	if said := sharedRun("`the door` reads [[a/note]]", "the door reads a note"); said != 1 {
		t.Fatalf("a span and a link blank out, leaving one word, and this answers %d", said)
	}
}
