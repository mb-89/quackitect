package main

import (
	"fmt"
	"strings"
	"testing"
)

// A NOTE IS BUILT HERE RATHER THAN READ OFF THE TREE. A test that scans whatever
// the work folder happens to hold answers that nobody has broken the rule yet,
// which is not the same answer as the rule holding. Every case below plants the
// note it judges.
func aPlantedCountingNote(status string, lines ...string) string {
	return "---\nid: a-token\ntitle: a note\ntype: work\nstatus: " + status + "\n---\n\n" +
		"## detail\n\n" + strings.Join(lines, "\n") + "\n"
}

// theFirstPlantedLine is the line number aPlantedCountingNote puts its first
// planted line on.
const theFirstPlantedLine = 10

func TestACountNamesTheCommandThatProducedIt(t *testing.T) {
	r := Roots{}
	note := TheTrackedFolder + "/a-counting-note.md"

	t.Run("a stated count with no command beside it is refused", func(t *testing.T) {
		for _, c := range []struct {
			name string
			said string
		}{
			{
				"the sentence this rule was written for, whose numbers come after the noun",
				"TempDir lines in engine test files fall from 201 to 126.",
			},
			{
				"a count the suite is said to answer",
				"The suite answers 206 tests today.",
			},
			{
				"a count the tree is said to hold",
				"The tree holds 42 open notes right now.",
			},
			{
				"a count a reader is said to have reported",
				"The reader reported 17 hits over the method.",
			},
		} {
			t.Run(c.name, func(t *testing.T) {
				err := aCountNamesTheCommandThatProducedIt(r, true, note, aPlantedCountingNote("open", c.said))
				if err == nil {
					t.Fatalf("the sentence %q states a count and names no command, and the write was let through", c.said)
				}
				said := err.Error()
				where := fmt.Sprintf("line %d", theFirstPlantedLine)
				if !strings.Contains(said, note) || !strings.Contains(said, where) {
					t.Errorf("the refusal does not say where the sentence is. said: %s", said)
				}
				if !strings.Contains(said, "201 to ") || !strings.Contains(said, "126") {
					t.Errorf("the refusal drops the measured incident. said: %s", said)
				}
				if !strings.Contains(said, "se find --regex") {
					t.Errorf("the refusal offers no legal move, which is a wall. said: %s", said)
				}
			})
		}
	})

	t.Run("a sentence that is not a bare count is let through", func(t *testing.T) {
		for _, c := range []struct {
			name string
			said string
		}{
			{
				"the same sentence with the search that answers it in backticks",
				"TempDir lines in engine test files fall from 201 to 126, by `git grep -h TempDir -- 'src/engine/*_test.go'`.",
			},
			{
				"a search of the index named in the open",
				"The suite answers 206 tests, by se find --regex 'func Test' --path 'src/engine/*_test.go'.",
			},
			{
				"a number that addresses a rule rather than counting anything",
				"Voice rule 13 holds for every note under the method.",
			},
			{
				"a number with no verb claiming a measurement",
				"There are 3 files under the folder to read first.",
			},
			{
				"a count spelled as a word, which is a list answering its own count",
				"The reader reported six hits and they are all listed below.",
			},
			{
				"a number against something this tree cannot be asked to count",
				"The run measured 12 seconds on this box.",
			},
		} {
			t.Run(c.name, func(t *testing.T) {
				if err := aCountNamesTheCommandThatProducedIt(r, true, note, aPlantedCountingNote("open", c.said)); err != nil {
					t.Fatalf("the sentence %q states no bare count, and the write was refused: %v", c.said, err)
				}
			})
		}
	})

	t.Run("what the rule is not about", func(t *testing.T) {
		const bare = "The suite answers 206 tests today."
		for _, c := range []struct {
			name string
			rel  string
			text string
		}{
			{
				"a closed note, whose numbers were written under the tree as it stood",
				note,
				aPlantedCountingNote("closed", bare),
			},
			{
				"a file that is not a work note",
				"src/engine/notes.go",
				aPlantedCountingNote("open", bare),
			},
			{
				"a fenced block, which shows a run rather than claiming one",
				note,
				aPlantedCountingNote("open", "```", bare, "```"),
			},
			{
				"a table row, which is the answer a command already gave",
				note,
				aPlantedCountingNote("open", "| the suite | answers 206 tests today |"),
			},
			{
				"a note that states no count at all",
				note,
				aPlantedCountingNote("open", "The reader reads every open note under the method."),
			},
		} {
			t.Run(c.name, func(t *testing.T) {
				if err := aCountNamesTheCommandThatProducedIt(r, false, c.rel, c.text); err != nil {
					t.Fatalf("this write is not the rule's business, and it was refused: %v", err)
				}
			})
		}
	})

	t.Run("the refusal names the line the sentence is on", func(t *testing.T) {
		text := aPlantedCountingNote("open",
			"The reader reads every open note under the method.",
			"The tree holds 42 open notes right now.",
		)
		err := aCountNamesTheCommandThatProducedIt(r, false, note, text)
		if err == nil {
			t.Fatal("the second line states a count and names no command, and the write was let through")
		}
		want := fmt.Sprintf("line %d", theFirstPlantedLine+1)
		if !strings.Contains(err.Error(), want) {
			t.Errorf("the refusal points at the wrong line. wanted %q, said: %s", want, err.Error())
		}
	})
}
