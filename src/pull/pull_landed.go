// A hand-back lands: the ticket goes to disk, the tree stages, and one commit
// names the ticket and what changes, then the push, off pull-landed.js,
// pull-push.js and the marker reads in lib/markers.js.
// [[spec/design_output/pull#the-refused-commit]]
package pull

import (
	"encoding/json"
	"fmt"
	"regexp"
	"sort"
	"strconv"
	"strings"
)

// The journal folder an undo reads. [[spec/design_output/apply#the-journal-holds-both-halves]]
const undoFolder = runtimeFolder + "/undo"

var (
	unmergedRow = regexp.MustCompile(`^\d+ [0-9a-f]+ ([123])\t(.+)$`)
	opensMark   = regexp.MustCompile(`^<{7}(?: |$)`)
	hunkAt      = regexp.MustCompile(`^@@+ .*\+(\d+)(?:,\d+)? @@`)
	movedPush   = regexp.MustCompile(`\((?:fetch first|non-fast-forward)\)`)
	pushNoise   = regexp.MustCompile(`^(?:error: failed to push|hint:|To )`)
	absolute    = regexp.MustCompile(`^([A-Za-z]:)?[\\/]`)
)

// The hand's own paths stage beside the ticket, and a hand writing through no journal hands back the tree the other hands' journals leave. [[spec/design_output/pull#the-refused-commit]]
func (it *It) landed(one *Held, changes, also []string) string {
	mine, theirs := it.journaled(one.Name)
	if len(mine) > 0 {
		return it.landing(one, changes, it.tracked(unique(append(append([]string{one.Path}, also...), mine...))), nil)
	}
	return it.landing(one, changes, nil, theirs)
}

// A landing the engine makes on the side stages the ticket files it writes. [[spec/design_output/pull#the-refused-commit]]
func (it *It) landedAlone(one *Held, changes []string, also ...string) string {
	return it.landing(one, changes, append([]string{one.Path}, also...), nil)
}

// A journal names files git ignores, and a move leaves its old path standing nowhere, and git refuses a commit naming either. [[spec/design_output/pull#the-refused-commit]]
func (it *It) tracked(paths []string) []string {
	ignored := map[string]bool{}
	for _, row := range strings.Split(it.Git.Run(append([]string{"check-ignore", "--"}, paths...)...).Out, "\n") {
		if row = strings.TrimSpace(row); row != "" {
			ignored[row] = true
		}
	}
	out := []string{}
	for _, one := range paths {
		if ignored[one] {
			continue
		}
		if it.Disk.Exists(one) || it.Git.Run("ls-files", "--error-unmatch", "--", one).OK {
			out = append(out, one)
		}
	}
	return out
}

// A merge standing unresolved refuses the landing before anything stages, and a marker the index carries refuses it before the commit. [[spec/design_output/work#no-commit-carries-a-marker]]
func (it *It) landing(one *Held, changes, paths, kept []string) string {
	if !one.Private {
		if merging := it.unmergedFault(); merging != "" {
			return merging
		}
	}
	stood, _ := it.Disk.Read(one.Path)
	_ = it.Disk.Write(one.Path, one.Text)
	if one.Private {
		return ""
	}
	if paths != nil {
		it.Git.Run(append([]string{"add", "--"}, paths...)...)
	} else {
		it.Git.Run("add", "-A")
		if len(kept) > 0 {
			it.Git.Run(append([]string{"reset", "-q", "--"}, kept...)...)
		}
	}
	only := []string{}
	if paths != nil {
		only = append([]string{"--"}, paths...)
	}
	ran := Ran{Err: it.stagedFault(only)}
	if ran.Err == "" {
		ran = it.Git.Run(append([]string{"commit", "-m", one.Name + ": " + strings.Join(changes, ", ")}, only...)...)
		if ran.OK {
			return ""
		}
	}
	it.Git.Run(append([]string{"reset", "-q"}, only...)...)
	_ = it.Disk.Write(one.Path, stood)
	switch {
	case ran.Err != "":
		return ran.Err
	case ran.Out != "":
		return ran.Out
	}
	return "the commit answers nothing"
}

// The files the undo journals name since the hold took the ticket, the ticket's own apart from every other ticket's. [[spec/design_output/pull#the-refused-commit]]
func (it *It) journaled(name string) (mine, theirs []string) {
	taken := ""
	for _, held := range it.EveryHold() {
		if held.Ticket == name {
			taken = held.Taken
			break
		}
	}
	for _, row := range it.Disk.Files(undoFolder) {
		if !strings.HasSuffix(row, ".json") {
			continue
		}
		text, _ := it.Disk.Read(undoFolder + "/" + row)
		var entry struct {
			Ticket string `json:"ticket"`
			At     string `json:"at"`
			Landed *bool  `json:"landed"`
			Files  []struct {
				File string `json:"file"`
			} `json:"files"`
		}
		if json.Unmarshal([]byte(text), &entry) != nil || entry.Ticket == "" || entry.At < taken {
			continue
		}
		if entry.Landed != nil && !*entry.Landed {
			continue
		}
		for _, one := range entry.Files {
			if entry.Ticket == name {
				mine = append(mine, one.File)
			} else {
				theirs = append(theirs, one.File)
			}
		}
	}
	mine = unique(mine)
	kept := []string{}
	for _, one := range unique(theirs) {
		if !contains(mine, one) {
			kept = append(kept, one)
		}
	}
	return mine, kept
}

func unique(paths []string) []string {
	out := []string{}
	for _, one := range paths {
		if !contains(out, one) {
			out = append(out, one)
		}
	}
	return out
}

func contains(list []string, one string) bool {
	for _, each := range list {
		if each == one {
			return true
		}
	}
	return false
}

// What a step verb meets before it stages: any unmerged path refuses it. [[spec/design_output/work#no-commit-carries-a-marker]]
func (it *It) unmergedFault() string {
	paths := map[string]bool{}
	for _, row := range strings.Split(it.Git.Run("ls-files", "-u").Out, "\n") {
		if found := unmergedRow.FindStringSubmatch(strings.TrimSpace(row)); found != nil {
			paths[found[2]] = true
		}
	}
	unmerged := sortedKeys(paths)
	return mergeRefusal(unmerged, nil)
}

// One conflict marker a staged delta adds. [[spec/design_output/work#no-commit-carries-a-marker]]
type marked struct {
	file string
	line int
}

// What a verb meets once it stages: a marker the index carries refuses it. [[spec/design_output/work#no-commit-carries-a-marker]]
func (it *It) stagedFault(only []string) string {
	delta := it.Git.Run(append([]string{"diff", "--cached", "--unified=0"}, only...)...).Out
	out := []marked{}
	file, at, binary := "", 0, false
	for _, line := range rowsOf(delta) {
		switch {
		case strings.HasPrefix(line, "diff --git "):
			file, binary = "", false
			continue
		case strings.HasPrefix(line, "Binary files") || strings.HasPrefix(line, "GIT binary patch"):
			binary = true
			continue
		case strings.HasPrefix(line, "+++ "):
			file = strings.TrimPrefix(strings.TrimPrefix(line[len("+++ "):], "b/"), `"`)
			file = strings.TrimSuffix(file, `"`)
			continue
		}
		if found := hunkAt.FindStringSubmatch(line); found != nil {
			at, _ = strconv.Atoi(found[1])
			continue
		}
		if !strings.HasPrefix(line, "+") || strings.HasPrefix(line, "+++") {
			continue
		}
		if file != "" && file != "/dev/null" && !binary && opensMark.MatchString(line[1:]) {
			out = append(out, marked{file: file, line: at})
		}
		at++
	}
	return mergeRefusal(nil, out)
}

// The refusal every commit road answers, naming each file. [[spec/design_output/work#no-commit-carries-a-marker]]
func mergeRefusal(unmerged []string, marks []marked) string {
	if len(unmerged) == 0 && len(marks) == 0 {
		return ""
	}
	rows := []string{"A merge stands unresolved, so no commit lands:"}
	sort.Strings(unmerged)
	for _, path := range unmerged {
		rows = append(rows, "  "+path+"  git lists it unmerged")
	}
	for _, one := range marks {
		rows = append(rows, fmt.Sprintf("  %s:%d  a conflict marker", one.file, one.line))
	}
	rows = append(rows, "Resolve the merge first: write each file without its markers, then land the merge with ./RUNME.sh commit.")
	return strings.Join(rows, "\n")
}

// The push a hand-back ends with: a desk lands it on this box, and a cloud box pushes its work branch, rebasing once where origin moved. [[spec/design_output/pull#the-rejected-push]]
func (it *It) pushed(branch string) (bool, []string) {
	if !it.Cloud {
		return true, []string{fmt.Sprintf("The hand-back stands on this box, and %s goes out with the next push.", branch)}
	}
	ok, moved, why := it.tried(branch)
	if ok || !moved {
		return ok, why
	}
	it.Git.Run("fetch", "origin", branch)
	if !it.Git.Run("rebase", "origin/"+branch).OK {
		it.Git.Run("rebase", "--abort")
		return false, []string{fmt.Sprintf("%s moves on origin, and one rebase falls short. Push %s, then pull again.", branch, branch)}
	}
	ok, _, why = it.tried(branch)
	return ok, why
}

// A private note pushes nothing. [[spec/design_output/pull#the-rejected-push]]
func (it *It) sentOut(one *Held, branch string) (bool, []string) {
	if one.Private {
		return true, nil
	}
	return it.pushed(branch)
}

func (it *It) tried(branch string) (ok, moved bool, why []string) {
	ran := it.Git.Run("push", "origin", branch)
	if ran.OK {
		return true, false, nil
	}
	lines := []string{}
	for _, row := range strings.Split(ran.Err, "\n") {
		if row = strings.TrimSpace(row); row != "" && !pushNoise.MatchString(row) {
			lines = append(lines, row)
		}
	}
	if len(lines) == 0 {
		lines = []string{"it names no cause"}
	}
	return false, movedPush.MatchString(ran.Err), append([]string{"The push door refuses " + branch + ":"}, lines...)
}
