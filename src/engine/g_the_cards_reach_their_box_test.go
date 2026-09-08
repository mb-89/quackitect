package main

import (
	"strings"
	"testing"
)

// THE CARDS ARE PLANTED RATHER THAN LOOKED FOR. The reader this replaces walked
// the card folder and stepped over any card it could not make sense of, so a
// green run said nothing had been broken in a way it could see. These build a
// card, hand it in, and read the answer.

// cardsReachTheCard is the shape a card has: a list of numbered points under one
// heading, and a discussion opening a section on each number.
func cardsReachTheCard(points, sections []string) string {
	var b strings.Builder
	b.WriteString("# YOU ARE ON A CLOUD BOX\n\n## Actionables\n\n")
	for _, line := range points {
		b.WriteString(line + "\n")
	}
	b.WriteString("\n## Discussion\n")
	for _, head := range sections {
		b.WriteString("\n### " + head + "\n\nWhat went wrong when this was not followed.\n")
	}
	return b.String()
}

const cardsReachAPath = "src/cage/cloud-runner.md"

// A DISCUSSION THAT DOUBLES BACK IS THE SHAPE THAT LOST A READER: the tenth
// section went in above the ninth, so somebody looking for the ninth walked past
// the tenth to reach it.
func TestACardIsRefusedADiscussionThatDoublesBack(t *testing.T) {
	r := cardsReachRoots(t)
	points := []string{"1. Say the commit above.", "9. Answer in the chat.", "10. Track your notes."}

	planted := cardsReachTheCard(points, []string{
		"1. The commit", "10. A note dies here", "9. The chat is where they read you",
	})
	err := aCardDiscussesEveryPointItLists(r, false, cardsReachAPath, planted)
	if err == nil {
		t.Fatal("a card whose discussion runs 1, 10, 9 was allowed in")
	}
	for _, want := range []string{cardsReachAPath, "10", "9"} {
		if !strings.Contains(err.Error(), want) {
			t.Errorf("the refusal does not name %q: %s", want, err)
		}
	}

	clean := cardsReachTheCard(points, []string{
		"1. The commit", "9. The chat is where they read you", "10. A note dies here",
	})
	if err := aCardDiscussesEveryPointItLists(r, false, cardsReachAPath, clean); err != nil {
		t.Fatalf("a card whose discussion ascends was refused: %v", err)
	}
}

// AND A POINT NOTHING DISCUSSES IS A LINE WITH NONE OF THE CASE BEHIND IT.
func TestACardIsRefusedAPointNothingDiscusses(t *testing.T) {
	r := cardsReachRoots(t)
	points := []string{"1. Say the commit above.", "2. Start the engine first."}

	planted := cardsReachTheCard(points, []string{"1. The commit"})
	err := aCardDiscussesEveryPointItLists(r, false, cardsReachAPath, planted)
	if err == nil {
		t.Fatal("a card listing a point that nothing discusses was allowed in")
	}
	if !strings.Contains(err.Error(), "2") {
		t.Errorf("the refusal does not name the point left quiet: %s", err)
	}

	clean := cardsReachTheCard(points, []string{"1. The commit", "2. Start the engine"})
	if err := aCardDiscussesEveryPointItLists(r, false, cardsReachAPath, clean); err != nil {
		t.Fatalf("a card discussing every point it lists was refused: %v", err)
	}
}

// A CAPITAL LETTER IS NOT THE END OF THE LIST. The reader this replaces ended
// the actionables block on an escape its language does not have, so the block
// stopped at the first capital Z and every point listed after it was counted by
// nobody. This is that card.
func TestACardIsRefusedAQuietPointBelowACapitalZ(t *testing.T) {
	r := cardsReachRoots(t)
	points := []string{
		"1. Say the commit above.",
		"2. Sleep the box with Zzz before you push.",
		"3. Track your notes.",
	}

	planted := cardsReachTheCard(points, []string{"1. The commit", "2. Sleeping the box"})
	err := aCardDiscussesEveryPointItLists(r, false, cardsReachAPath, planted)
	if err == nil {
		t.Fatal("a point listed below a capital Z went uncounted, the way the old reader lost it")
	}
	if !strings.Contains(err.Error(), "3") {
		t.Errorf("the refusal does not name the point below the capital Z: %s", err)
	}

	clean := cardsReachTheCard(points, []string{
		"1. The commit", "2. Sleeping the box", "3. A note dies here",
	})
	if err := aCardDiscussesEveryPointItLists(r, false, cardsReachAPath, clean); err != nil {
		t.Fatalf("a card discussing the point below the capital Z was refused: %v", err)
	}
}

// AND A HEADING WITH NOTHING NUMBERED UNDER IT IS A CARD NOBODY CAN FOLLOW BY
// NUMBER, which is how the last reader came to count nothing and say so.
func TestACardIsRefusedAnActionablesHeadingWithNoNumbers(t *testing.T) {
	r := cardsReachRoots(t)

	planted := "# YOU ARE ON A CLOUD BOX\n\n## Actionables\n\n" +
		"- Say the commit above.\n- Start the engine first.\n\n## Discussion\n\n" +
		"### 1. The commit\n\nWhat went wrong.\n"
	if err := aCardDiscussesEveryPointItLists(r, false, cardsReachAPath, planted); err == nil {
		t.Fatal("a card whose actionables heading lists no numbered line was allowed in")
	}

	clean := cardsReachTheCard([]string{"1. Say the commit above."}, []string{"1. The commit"})
	if err := aCardDiscussesEveryPointItLists(r, false, cardsReachAPath, clean); err != nil {
		t.Fatalf("a card listing one numbered point and discussing it was refused: %v", err)
	}
}

// THE DOOR IS SHUT ON CARDS AND ON NOTHING ELSE. A card of plain prose carries
// no numbered point to hold in order, and a file outside the card folder is not
// this rule's to judge, so neither is refused for holding the broken shape.
func TestACardOfProseAndAFileElsewhereArePassed(t *testing.T) {
	r := cardsReachRoots(t)
	broken := cardsReachTheCard(
		[]string{"1. Say the commit above.", "2. Start the engine first."},
		[]string{"2. Start the engine", "1. The commit"},
	)

	prose := "# The three marks\n\n## Why a cell is not measured\n\nBecause nothing fires it.\n"
	if err := aCardDiscussesEveryPointItLists(r, false, "src/cage/first-turn.md", prose); err != nil {
		t.Fatalf("a card carrying no numbered point was refused: %v", err)
	}
	for _, rel := range []string{"doc/work/a-note.md", "src/engine/main.go", "README.md"} {
		if err := aCardDiscussesEveryPointItLists(r, true, rel, broken); err != nil {
			t.Fatalf("%s is not a card in the folder the wake hands out, and it was refused: %v", rel, err)
		}
	}
	if err := aCardDiscussesEveryPointItLists(r, true, cardsReachAPath, broken); err == nil {
		t.Fatal("the same broken shape was allowed in as a card, so the door refuses on the path alone")
	}
}
