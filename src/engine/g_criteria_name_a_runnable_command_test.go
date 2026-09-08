package main

import (
	"strings"
	"testing"
)

// A NOTE IS BUILT HERE RATHER THAN READ OFF THE TREE. A test that scans whatever
// the work folder happens to hold answers that nobody has broken the rule yet,
// which is not the same answer as the rule holding. Every case below plants the
// note it judges.
//
// THE DETAIL OF EVERY NOTE NAMES A COMMAND THE GATE REFUSES. It is a report of a
// run made somewhere else, not an instruction to the hand deciding the note, so
// the clean cases below fail the moment the guard reads past the done-when
// heading.
func aPlantedRunnableNote(status string, lines ...string) string {
	return "---\nid: a-token\ntitle: a note\ntype: work\nstatus: " + status + "\n---\n\n" +
		"## detail\n\nMeasured on another box by go test -C src/engine ./... which answered ok.\n\n" +
		"## done when\n\n" + strings.Join(lines, "\n") + "\n"
}

// theFirstPlantedCriterion is the line number aPlantedRunnableNote puts its
// first criterion on.
const theFirstPlantedCriterion = 14

func TestADoneWhenLineNamesARunnableCommand(t *testing.T) {
	dir := t.TempDir()
	r := Roots{Work: dir, Method: dir}
	const note = "spec/work/a-token.md"

	t.Run("a criterion naming a command the gate refuses is refused", func(t *testing.T) {
		for _, c := range []struct {
			name      string
			criterion string
			reason    string
		}{
			{
				"a go test inside the tree",
				"- the gate holds, decided by: go test -C src/engine -run TestTheGate -count=1 ./",
				"THE ENGINE OWNS THE TESTS",
			},
			{
				"a check run by an interpreter",
				"- the reader is green, decided by: node util/checks/a-reader.mjs .",
				"THE ENGINE OWNS THE TESTS",
			},
			{
				"a build that names no place for its program",
				"- the engine still builds, decided by: go build -C src/engine ./... answers nothing",
				"A BUILD SAYS WHERE ITS PROGRAM GOES",
			},
			{
				"a build over the program that is running",
				"- the swap lands, decided by `go build -o .bin/se.exe .`",
				"THE ENGINE IS THE ONE DOOR TO ITS OWN REPLACEMENT",
			},
			{
				"a search over the tree",
				"- no call is left, decided by `rg -n theOldName src`",
				"THE TREE IS INDEXED",
			},
			{
				"a recursive search with the older tool",
				"- no call is left, decided by: grep -rn theOldName",
				"A RECURSIVE SEARCH OVER THE TREE",
			},
		} {
			t.Run(c.name, func(t *testing.T) {
				err := aDoneWhenLineNamesARunnableCommand(r, true, note, aPlantedRunnableNote("open", c.criterion))
				if err == nil {
					t.Fatalf("the criterion %q names a command the gate refuses, and the write was let through", c.criterion)
				}
				said := err.Error()
				if !strings.Contains(said, c.reason) {
					t.Errorf("the refusal does not name the rule that was met. wanted %q, said: %s", c.reason, said)
				}
				if !strings.Contains(said, note) || !strings.Contains(said, "line 14") {
					t.Errorf("the refusal does not say where the line is. said: %s", said)
				}
				if !strings.Contains(said, "se test --propose") || !strings.Contains(said, "go vet ./...") {
					t.Errorf("the refusal offers no legal move, which is a wall. said: %s", said)
				}
			})
		}
	})

	t.Run("a criterion naming a command the gate admits is let through", func(t *testing.T) {
		for _, c := range []struct {
			name      string
			criterion string
		}{
			{
				"the door the engine keeps for the tests",
				"- the branch is cut, decided by: se test --propose 'TestTheBranchIsCut' answers ok",
			},
			{
				"a compile check that leaves no program behind",
				"- the module compiles, decided by: go build -o /dev/null ./... answers nothing",
			},
			{
				"a vet",
				"- the module vets, decided by: go vet ./... answers nothing",
			},
			{
				"a program reading its own input behind a pipe",
				"- no line of the state carries the doubled phrase. Decided by: .bin/se state | grep -c 'ready when ready when', which answers 5 today and must answer 0",
			},
			{
				"a searcher handed to another program rather than run over the tree",
				"- the count is right. Decided by `find src/engine -name '*_test.go' -exec grep -L 't.Run(' {} + | wc -l`, which answers 206 at HEAD",
			},
			{
				"a search of the index",
				"- nothing names the old call, decided by: se find --regex theOldName --path 'src/**/*.go'",
			},
			{
				"a reading rather than a command",
				"- the panel draws the keyword line, decided by: read the panel",
			},
		} {
			t.Run(c.name, func(t *testing.T) {
				if err := aDoneWhenLineNamesARunnableCommand(r, true, note, aPlantedRunnableNote("open", c.criterion)); err != nil {
					t.Fatalf("the criterion %q names a command the gate admits, and the write was refused: %v", c.criterion, err)
				}
			})
		}
	})

	t.Run("what the rule is not about", func(t *testing.T) {
		refused := "- the gate holds, decided by: go test -C src/engine -run TestTheGate -count=1 ./"
		for _, c := range []struct {
			name string
			rel  string
			text string
		}{
			{
				"a closed note, whose criteria were decided under whatever the gate was then",
				note,
				aPlantedRunnableNote("closed", refused),
			},
			{
				"a file that is not a work note",
				"src/engine/notes.go",
				aPlantedRunnableNote("open", refused),
			},
			{
				"a command quoted in a fenced block, which is being shown rather than named",
				note,
				aPlantedRunnableNote("open", "```", refused, "```"),
			},
			{
				"a note whose done-when section names no command at all",
				note,
				aPlantedRunnableNote("open", "- the owner says it reads right"),
			},
		} {
			t.Run(c.name, func(t *testing.T) {
				if err := aDoneWhenLineNamesARunnableCommand(r, true, c.rel, c.text); err != nil {
					t.Fatalf("this write is not the rule's business, and it was refused: %v", err)
				}
			})
		}
	})

	t.Run("the refusal names the line the command is on", func(t *testing.T) {
		text := aPlantedRunnableNote("open",
			"- the panel draws the keyword line, decided by: read the panel",
			"- the gate holds, decided by: go test -C src/engine -run TestTheGate -count=1 ./",
		)
		err := aDoneWhenLineNamesARunnableCommand(r, false, note, text)
		if err == nil {
			t.Fatal("the second criterion names a go test inside the tree, and the write was let through")
		}
		want := "line " + theLineNumberAsText(theFirstPlantedCriterion+1)
		if !strings.Contains(err.Error(), want) {
			t.Errorf("the refusal points at the wrong line. wanted %q, said: %s", want, err.Error())
		}
	})
}

// theLineNumberAsText writes a small number, so this file needs no import
// beyond the two it has.
func theLineNumberAsText(n int) string {
	if n < 10 {
		return string(rune('0' + n))
	}
	return theLineNumberAsText(n/10) + string(rune('0'+n%10))
}
