// A hand-back lands through the pull: the hand's own journaled paths stage
// beside the ticket, a path git refuses stays out, a merge standing open
// refuses the landing, a skip commits the ticket alone, a private note commits
// nothing, and a desk pushes nothing, off the cases test/level0/landed.test.js
// and test/level0/cloud-desk.test.js held.
// [[spec/tickets/pull-scripts-leave]]
package pull

import (
	"encoding/json"
	"fmt"
	"sort"
	"strings"
	"testing"

	"quackitect/src/modules/git"
)

// The stamps a journal carries: before the hold the pull takes, and after it. [[spec/tickets/pull-scripts-leave]]
const (
	beforeHold = "1969-12-31T23:59:59.000Z"
	afterHold  = "1970-01-01T00:00:01.000Z"
)

// One undo journal naming a ticket and the files its write touched. [[spec/tickets/pull-scripts-leave]]
type journal struct {
	Ticket string `json:"ticket"`
	At     string `json:"at"`
	Landed *bool  `json:"landed,omitempty"`
	Files  []struct {
		File string `json:"file"`
	} `json:"files"`
}

// Writes the journal under the undo folder. [[spec/tickets/pull-scripts-leave]]
func journals(t *testing.T, it *It, name string, one journal, files ...string) {
	t.Helper()
	for _, file := range files {
		one.Files = append(one.Files, struct {
			File string `json:"file"`
		}{file})
	}
	said, err := json.Marshal(one)
	must(t, err)
	must(t, it.Disk.Write(undoFolder+"/"+name+".json", string(said)))
}

// The paths the newest commit on the ref changes, sorted. [[spec/tickets/pull-scripts-leave]]
func landedPaths(t *testing.T, it *It, ref string) (string, []string) {
	t.Helper()
	log, err := it.Git.Log("", ref, false)
	if err != nil || len(log) == 0 {
		t.Fatalf("the log of %s reads %v, %v", ref, log, err)
	}
	changed, err := it.Git.Changed(log[0].Hash)
	must(t, err)
	paths := []string{}
	for _, one := range changed {
		paths = append(paths, one.Path)
	}
	sort.Strings(paths)
	return log[0].Subject, paths
}

// The clone with alpha in hand. [[spec/tickets/pull-scripts-leave]]
func alphaInHand(t *testing.T) *It {
	t.Helper()
	it, _, _ := cloudPull(t)
	if code, said := pulled(t, it); code != 0 || !strings.Contains(said, "alpha at do") {
		t.Fatalf("the first pull answers %d:\n%s", code, said)
	}
	return it
}

func TestAPassStagesTheHandsJournaledPathsAndLeavesASiblingsEditOut(t *testing.T) {
	t.Parallel()
	it := alphaInHand(t)
	for path, text := range map[string]string{"src/mine.go": "package mine\n", "src/old.go": "package old\n", "src/theirs.go": "package theirs\n"} {
		must(t, it.Disk.Write(path, text))
	}
	must(t, it.Disk.Write(Holds+"/a-sibling.json", `{"ticket":"beta","taken":"1970-01-01T00:00:05.000Z"}`))
	journals(t, it, "1", journal{Ticket: "alpha", At: beforeHold}, "src/old.go")
	journals(t, it, "2", journal{Ticket: "alpha", At: afterHold}, "src/mine.go")
	journals(t, it, "3", journal{Ticket: "beta", At: afterHold}, "src/theirs.go")
	if code, said := pulled(t, it, "alpha", "--pass", "--fields", alphaFields); code != 0 {
		t.Fatalf("the pass answers %d:\n%s", code, said)
	}
	if _, paths := landedPaths(t, it, "origin/work/g"); strings.Join(paths, " ") != "spec/tickets/alpha.md src/mine.go" {
		t.Fatalf("the commit changes %v, and wants the ticket and the hand's own path after its hold alone", paths)
	}
}

func TestAPassStagesNoPathGitIgnoresStandingNowhereOrMarkedUnlanded(t *testing.T) {
	t.Parallel()
	it := alphaInHand(t)
	for path, text := range map[string]string{"src/mine.go": "package mine\n", ".se/HANDOVER.md": "# Handover\n", "src/out.go": "package out\n"} {
		must(t, it.Disk.Write(path, text))
	}
	unlanded := false
	journals(t, it, "1", journal{Ticket: "alpha", At: afterHold}, "src/mine.go", ".se/HANDOVER.md", "src/moved.go")
	journals(t, it, "2", journal{Ticket: "alpha", At: afterHold, Landed: &unlanded}, "src/out.go")
	if code, said := pulled(t, it, "alpha", "--pass", "--fields", alphaFields); code != 0 {
		t.Fatalf("the pass answers %d, and wants the ignored, the moved and the unlanded paths left out:\n%s", code, said)
	}
	if _, paths := landedPaths(t, it, "origin/work/g"); strings.Join(paths, " ") != "spec/tickets/alpha.md src/mine.go" {
		t.Fatalf("the commit changes %v, and wants no ignored, moved or unlanded path", paths)
	}
}

// A repo whose index lists paths unmerged. [[spec/tickets/pull-scripts-leave]]
type unmergedRepo struct {
	git.Repo
	paths []string
}

func (one unmergedRepo) Unmerged() ([]string, error) { return one.paths, nil }

func TestAPassWhileGitListsAnUnmergedPathWritesNothingAndNamesIt(t *testing.T) {
	t.Parallel()
	it := alphaInHand(t)
	stood, _ := it.Disk.Read("spec/tickets/alpha.md")
	head, _ := it.Git.Head()
	it.Git = unmergedRepo{Repo: it.Git, paths: []string{"spec/tickets/g.md"}}
	code, said := pulled(t, it, "alpha", "--pass", "--fields", alphaFields)
	if code != 1 || !strings.Contains(said, "spec/tickets/g.md  git lists it unmerged") || !strings.Contains(said, "Resolve the merge first") {
		t.Fatalf("the pass answers %d, and wants the unmerged path named:\n%s", code, said)
	}
	if now, _ := it.Disk.Read("spec/tickets/alpha.md"); now != stood {
		t.Fatalf("the ticket reads\n%s\nand wants it as it stood", now)
	}
	if now, _ := it.Git.Head(); now != head {
		t.Fatalf("the head moves to %s, and wants no commit", now)
	}
}

func TestAPassWhoseStagedDeltaAddsAMarkerPutsTheTicketBackAndSaysWhereItStays(t *testing.T) {
	t.Parallel()
	it := alphaInHand(t)
	stood, _ := it.Disk.Read("spec/tickets/alpha.md")
	head, _ := it.Git.Head()
	must(t, it.Disk.Write("src/a.go", "<<<<<<< ours\npackage a\n"))
	journals(t, it, "1", journal{Ticket: "alpha", At: afterHold}, "src/a.go")
	code, said := pulled(t, it, "alpha", "--pass", "--fields", alphaFields)
	for _, want := range []string{"the hook refuses the commit, so nothing lands:", "src/a.go:1  a conflict marker", "Fix it, and alpha stays in hand at do."} {
		if code != 1 || !strings.Contains(said, want) {
			t.Fatalf("the pass answers %d, and wants %q:\n%s", code, want, said)
		}
	}
	if now, _ := it.Disk.Read("spec/tickets/alpha.md"); now != stood {
		t.Fatalf("the ticket reads\n%s\nand wants it put back", now)
	}
	if now, _ := it.Git.Head(); now != head {
		t.Fatalf("the head moves to %s, and wants no commit", now)
	}
	if staged, _ := it.Git.Staged(nil); len(staged) != 0 {
		t.Fatalf("the index holds %v, and wants it empty", staged)
	}
}

// alpha with a desk leaf ahead of do, which a cloud box skips. [[spec/tickets/pull-scripts-leave]]
var skippingTicket = strings.Replace(childTicket, "steps:\n", "steps:\n  - name: first\n    when: desk\n    does: a desk's step\n", 1)

func TestAStepTheEngineSkipsCommitsTheTicketAloneAndLeavesTheTreeOut(t *testing.T) {
	t.Parallel()
	it, _, _ := cloudPull(t)
	must(t, it.Disk.Write("spec/tickets/alpha.md", skippingTicket))
	must(t, it.Disk.Write("src/stray.go", "package stray\n"))
	if code, said := pulled(t, it); code != 0 || !strings.Contains(said, "alpha at do") {
		t.Fatalf("the pull answers %d, and wants the skip to hand do:\n%s", code, said)
	}
	subject, paths := landedPaths(t, it, "work/g")
	if subject != "alpha: skips first" || strings.Join(paths, " ") != "spec/tickets/alpha.md" {
		t.Fatalf("the commit %q changes %v, and wants the skip to commit the ticket alone", subject, paths)
	}
}

func TestAPrivateNotesPassLandsOnDiskAndCommitsNothing(t *testing.T) {
	t.Parallel()
	it, _, _ := cloudPull(t)
	head, _ := it.Git.Head()
	one := &Held{Name: "aside", Path: Notes + "/aside.md", Text: "---\nstate: closed\n---\n", Private: true}
	if finding := it.landed(one, []string{"decides"}, nil); finding != "" {
		t.Fatalf("the landing answers %q, and wants nothing", finding)
	}
	if said, _ := it.Disk.Read(one.Path); said != one.Text {
		t.Fatalf("the note reads %q, and wants the landed text on disk", said)
	}
	if now, _ := it.Git.Head(); now != head {
		t.Fatalf("the head moves to %s, and wants no commit for a private note", now)
	}
	if ok, why := it.sentOut(one, "work/g"); !ok || len(why) != 0 {
		t.Fatalf("the push answers %v %v, and wants a private note to push nothing", ok, why)
	}
}

func TestADeskPassStandsOnThisBoxWhateverTheEnvironmentSays(t *testing.T) {
	t.Parallel()
	it := &It{Cloud: false, Env: map[string]string{"SE_CLOUD": "1"}}
	ok, why := it.pushed("work/one-group")
	want := fmt.Sprintf("The hand-back stands on this box, and %s goes out with the next push.", "work/one-group")
	if !ok || len(why) != 1 || why[0] != want {
		t.Fatalf("the push answers %v %q, and wants the doors' own flag to say a desk", ok, why)
	}
}
