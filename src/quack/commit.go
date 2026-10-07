// The commit verb: reads the message, lands the commit, runs the check, and
// pushes on green from a cloud box. A commit touching the cold path lands,
// meets the cold probe on its clone, and leaves again where the probe fails.
// [[spec/tickets/landing-verbs-port-to-go]]
package main

import (
	"encoding/json"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"slices"
	"strings"
	"time"

	"quackitect/src/failure"
	"quackitect/src/index"
	"quackitect/src/modules/check"
	"quackitect/src/modules/git"
	"quackitect/src/modules/hooks/command"
	"quackitect/src/proc"
)

// The usage, the flag keeping a commit home, the name a finding of the message stands under, and the road the message names its ticket by. [[spec/design_output/work#the-battery-answers-first]] [[spec/design_output/level0#a-write-names-its-ticket]]
const (
	commitUsage  = `Usage: ./RUNME.sh commit "<message>" [<path>...] [--no-push]`
	noPushFlag   = "--no-push"
	messageWhere = "the message"
	messageHow   = "Open the message with <ticket>:, where <ticket> names the open ticket this commit serves: its file name under spec/tickets or .se/tickets, without .md."
)

// The status git spells a staged move with, and the path a reset over no named path unstages. [[spec/design_output/doors#the-git-door-carries-writes]]
const (
	movedStatus = "R"
	every       = "."
)

// The cold path: a commit touching one runs the cold probe. src/scripts/probe-cold.js owns COLD_PATH, and the verb spells it again until the probe leaves Node. [[spec/design_output/level0#the-cold-probe]]
var coldPath = []string{
	".claude/skills/level0/hooks/",
	".claude/skills/level0/lib/guidance.js",
	"src/modules/hooks/",
	"src/quack/",
	"src/scripts/go-stamp.sh",
	"src/scripts/install.sh",
	"src/scripts/probe-cold.js",
}

func init() {
	register("commit", func(argv []string, dry bool, out, errs io.Writer) int {
		return commitVerb(landingHere())(argv, dry, out, errs)
	})
}

// What the landing verbs reach: the root, the repository under it, the cloud flag, a verb run through the road, where claude stands, Vale over a message, the session log and the clock. [[spec/tickets/landing-verbs-port-to-go]] [[spec/design_output/doors#the-git-door-carries-writes]]
type landingDoors struct {
	root   string
	git    git.Repo
	cloud  bool
	verb   func(words ...string) (int, string)
	claude string
	voice  func(message string) []heard
	log    func(row map[string]any) error
	now    func() time.Time
}

// The doors over this box: the root the index names, the cloud the harness variables say, each verb through quack's own road, and claude where the survey or the PATH names it. [[spec/tickets/landing-verbs-port-to-go]]
func landingHere() landingDoors {
	root, err := index.Root()
	if err != nil {
		root = "."
	}
	return landingDoors{
		root:   root,
		git:    git.NewRepo(root, proc.Real),
		cloud:  commandSettings(root).Cloud,
		verb:   roadVerb(root),
		claude: claudeAt(root),
		voice:  func(message string) []heard { return heardOver(root, commitName, message).rows },
		log:    appendsRow(root, time.Now),
		now:    time.Now,
	}
}

// The commit verb over the doors. A dry run reads the message and writes nothing. [[spec/design_output/work#the-battery-answers-first]]
func commitVerb(d landingDoors) twin {
	return func(argv []string, dry bool, out, errs io.Writer) int {
		words := argv[min(1, len(argv)):]
		var plain []string
		for _, one := range words {
			if !strings.HasPrefix(one, "--") {
				plain = append(plain, one)
			}
		}
		if len(plain) == 0 || plain[0] == "" {
			fmt.Fprintln(out, commitUsage)
			return exitUsage
		}
		message, paths := plain[0], plain[1:]
		// [[spec/design_output/level0#a-write-names-its-ticket]]
		if fault := command.TicketFault(command.TicketOf(message), rootDisk{d.root}, messageHow); fault != "" {
			fmt.Fprintln(errs, fault)
			return exitUsage
		}
		refused, form := messageFindings(d, message)
		if len(refused) > 0 {
			fmt.Fprintln(errs, "The voice rules refuse this message. Write it again.")
			for _, one := range refused {
				fmt.Fprintf(errs, "%s:%d:%d: %s: %s\n", messageWhere, one.found.Line, one.found.Column, one.found.Rule, one.message)
			}
			return exitUsage
		}
		// A break of form lands with the commit, and the rows reach the output and the log. [[spec/design_output/work#the-battery-answers-first]]
		if len(form) > 0 {
			fmt.Fprintln(errs, messageNote(form))
			row := map[string]any{"level": "warn", "kind": "commit", "said": fmt.Sprintf("%d line(s) of a commit message stand at warning", len(form)), "rule": form[0].found.Rule, "detail": message}
			if err := d.log(row); err != nil {
				fmt.Fprintln(errs, err)
			}
		}
		if dry {
			return 0
		}
		return d.lands(message, paths, slices.Contains(words, noPushFlag), out, errs)
	}
}

// The findings Vale keeps over the message past its trailers, split into the ones that refuse and the breaks of form. [[spec/design_output/bash#a-commit-message-meets-voice]]
func messageFindings(d landingDoors, message string) ([]heard, []heard) {
	text := command.WithoutTrailers(message)
	if strings.TrimSpace(text) == "" {
		return nil, nil
	}
	var refused, form []heard
	for _, one := range d.voice(text) {
		if command.Refuses(one.found.Rule) {
			refused = append(refused, one)
		} else {
			form = append(form, one)
		}
	}
	return refused, form
}

// [[spec/design_output/bash#a-commit-message-meets-voice]]
func messageNote(rows []heard) string {
	said := []string{fmt.Sprintf("%d line(s) of the commit message break a rule of form, and the commit lands. Leave it as it stands, carry on with the ask, and hold these rules in the next message.", len(rows))}
	for _, one := range rows {
		said = append(said, fmt.Sprintf("  %s:%d %s: %s", messageWhere, one.found.Line, one.found.Rule, one.message))
	}
	return strings.Join(said, "\n")
}

// Nothing stages before the message reads clean, so a refused message leaves the tree standing. [[spec/design_output/work#the-battery-answers-first]]
func (d landingDoors) lands(message string, paths []string, noPush bool, out, errs io.Writer) int {
	branch, _ := d.git.Head()
	// A desk lands nothing on a work branch, so the refusal comes before the tests run. [[spec/design_output/work#a-desk-works-on-trunk]]
	if !d.cloud && strings.HasPrefix(branch, command.WorkBranch) {
		raised := failure.Raise(failure.Load(failure.Dir{Root: d.root}), "desk-works-on-trunk", command.DeskSaid("this commit lands nowhere on "+branch))
		if err := raisedOnto(failureDoors{root: d.root, now: d.now}, raised, errs); err != nil {
			fmt.Fprintln(errs, err)
		}
		return exitUsage
	}
	// A merge lands through this verb once its files carry no marker, so a marker refuses before anything stages. [[spec/design_output/work#no-commit-carries-a-marker]]
	if said := d.markedUnmerged(); said != "" {
		fmt.Fprintln(errs, said)
		return exitFailed
	}
	// The tests gate the commit, and the check after it stamps the commit that lands. [[spec/design_output/work#the-battery-answers-first]]
	if code, said := d.verb("test"); code != 0 {
		fmt.Fprintln(errs, "The tests answer red, so nothing stages and nothing lands:")
		fmt.Fprintln(errs, orNothing(said, "the test run answers nothing"))
		return exitFailed
	}
	// The paths a call names land alone, so one hand's landing leaves another's files standing. [[spec/design_output/work#one-verb-feeds-that-stamp]]
	moved := d.movedFrom(paths)
	only := append(slices.Clone(paths), moved...)
	// git add refuses a path standing neither on disk nor in the index, and the commit still reaches it through HEAD. [[spec/tickets/commit-stages-a-moved-path]]
	adds := slices.Clone(paths)
	for _, from := range moved {
		if d.stagable(from) {
			adds = append(adds, from)
		}
	}
	stage := d.git.AddAll
	if len(adds) > 0 {
		stage = func() error { return d.git.Add(adds) }
	}
	if err := stage(); err != nil {
		fmt.Fprintln(errs, "The staging comes back refused, so the commit stands undone:")
		fmt.Fprintln(errs, err)
		return exitFailed
	}
	if said := d.stagedMarkers(only); said != "" {
		d.unstages(only)
		fmt.Fprintln(errs, said)
		return exitFailed
	}
	cold := coldIn(d.stagedPaths(only))
	if len(cold) > 0 && (d.claude == "" || !standsUnder("", d.claude)) {
		d.unstages(only)
		fmt.Fprintf(errs, "claude stands nowhere on this box, so %s lands only where the cold probe runs: run ./RUNME.sh tools, or land it from a box holding claude.\n", strings.Join(cold, ", "))
		return exitFailed
	}
	if _, err := d.git.Commit(message, only); err != nil {
		d.unstages(only)
		fmt.Fprintln(errs, "The commit comes back refused, so nothing lands:")
		fmt.Fprintln(errs, err)
		return exitFailed
	}
	// The probe clones HEAD, so the commit lands first and leaves again on a FAIL, before any push. [[spec/design_output/level0#the-cold-probe]]
	if len(cold) > 0 {
		if code, said := d.verb("probe", "cold"); code != 0 {
			d.takesBack()
			d.unstages(only)
			fmt.Fprintln(errs, "The cold probe answers FAIL on the staged change, so nothing lands:")
			fmt.Fprintln(errs, orNothing(said, "the probe answers nothing"))
			return exitFailed
		}
		fmt.Fprintf(out, "The cold probe passes on the staged change to %s.\n", strings.Join(cold, ", "))
	}
	if code, said := d.verb("check"); code != 0 {
		fmt.Fprintln(errs, "The check answers red on this commit, so no push reaches origin.")
		// The check writes its faults to the error stream, so one stream names the wrong line. [[spec/design_output/work#one-verb-feeds-that-stamp]]
		fmt.Fprintln(errs, orNothing(said, "the check answers nothing"))
		d.rescues(branch, errs)
		return exitFailed
	}
	fmt.Fprintln(out, "The commit lands, and the check answers green on it.")
	// A desk's verb pushes nothing, and a cloud box pushes, because it dies with its tree. [[spec/guidance/working]] [[spec/guidance/cloud/cloud]]
	if noPush || !d.cloud {
		return 0
	}
	if !d.git.Push(branch, false).OK {
		fmt.Fprintf(errs, "The push of %s came back refused. The commit stands here.\n", branch)
		return exitFailed
	}
	fmt.Fprintf(out, "%s stands pushed.\n", branch)
	d.dropsRescue(branch)
	return 0
}

// The branch a red commit on work/<group> reaches. src/branches spells it again, since the two packages share no module. [[spec/design_output/work#a-red-commit-reaches-a-rescue-branch]]
const rescueBranch = "rescue/"

// A cloud box dies with its tree, so a red commit on a work branch reaches origin on the box's own rescue branch, by force, and the work branch stays green. [[spec/design_output/work#a-red-commit-reaches-a-rescue-branch]]
func (d landingDoors) rescues(branch string, errs io.Writer) {
	group, onWork := strings.CutPrefix(branch, command.WorkBranch)
	if !d.cloud || !onWork {
		return
	}
	rescue := rescueBranch + group
	head, _ := d.git.Resolve("HEAD")
	if !d.git.ForcePushTo(head, rescue).OK {
		fmt.Fprintf(errs, "The push of %s came back refused too, so the commit stands on this box alone.\n", rescue)
		return
	}
	fmt.Fprintf(errs, "The commit stands on origin under %s, and nowhere on %s, so a takeover takes it in.\n", rescue, branch)
}

// A green push carrying the rescue drops it from origin. [[spec/design_output/work#a-red-commit-reaches-a-rescue-branch]]
func (d landingDoors) dropsRescue(branch string) {
	group, onWork := strings.CutPrefix(branch, command.WorkBranch)
	if !onWork {
		return
	}
	rescue := rescueBranch + group
	refs, _ := d.git.RemoteRefs(rescueRef + rescue)
	for _, one := range refs {
		if one.Name == rescueRef+rescue && d.git.IsAncestor(one.Hash, "HEAD") {
			_ = d.git.DeleteRemote(rescue)
		}
	}
}

// Where origin keeps a branch, the rescue among them. [[spec/design_output/work#a-red-commit-reaches-a-rescue-branch]]
const rescueRef = "refs/heads/"

func orNothing(said, nothing string) string {
	if said == "" {
		return nothing
	}
	return said
}

// The commit leaves HEAD and its change stays staged. A merge it concluded stands open again, so the hand lands it once more. [[spec/design_output/level0#the-cold-probe]]
func (d landingDoors) takesBack() {
	theirs, merged := d.git.Resolve("HEAD^2")
	_ = d.git.SoftReset("HEAD~1")
	if merged {
		_ = d.git.UpdateRef("MERGE_HEAD", theirs)
	}
}

// A reset naming a pathspec unstages and leaves MERGE_HEAD standing, so a refused merge commit stays a merge. [[spec/design_output/work#one-verb-feeds-that-stamp]]
func (d landingDoors) unstages(only []string) {
	if len(only) == 0 {
		only = []string{every}
	}
	_ = d.git.Reset(only)
}

// The paths the index stages against HEAD under the paths named, a move by both its sides. [[spec/design_output/level0#the-cold-probe]]
func (d landingDoors) stagedPaths(only []string) []string {
	staged, _ := d.git.Staged(only)
	var out []string
	for _, one := range staged {
		if one.From != "" {
			out = append(out, one.From)
		}
		out = append(out, one.Path)
	}
	return out
}

// The paths of the cold path list among the paths. A folder entry ends on a slash and takes every path under it. [[spec/design_output/level0#the-cold-probe]]
func coldIn(paths []string) []string {
	var out []string
	for _, path := range paths {
		for _, cold := range coldPath {
			if (strings.HasSuffix(cold, "/") && strings.HasPrefix(path, cold)) || path == cold {
				out = append(out, path)
				break
			}
		}
	}
	return out
}

// A marked file, by the line its first marker stands on. [[spec/design_output/work#no-commit-carries-a-marker]]
type markedLine struct {
	file string
	line int
}

// The refusal every commit road answers, naming each file. [[spec/design_output/work#no-commit-carries-a-marker]]
func mergeRefusal(unmerged []string, marked []markedLine) string {
	if len(unmerged) == 0 && len(marked) == 0 {
		return ""
	}
	said := []string{"A merge stands unresolved, so no commit lands:"}
	for _, path := range unmerged {
		said = append(said, "  "+path+"  git lists it unmerged")
	}
	for _, one := range marked {
		said = append(said, fmt.Sprintf("  %s:%d  a conflict marker", one.file, one.line))
	}
	return strings.Join(append(said, "Resolve the merge first: write each file without its markers, then land the merge with ./RUNME.sh commit."), "\n")
}

// Each unmerged file still carrying a marker on disk, by the line it stands on. [[spec/design_output/work#no-commit-carries-a-marker]]
func (d landingDoors) markedUnmerged() string {
	var marked []markedLine
	unmerged, _ := d.git.Unmerged()
	for _, file := range unmerged {
		text, err := os.ReadFile(filepath.Join(d.root, filepath.FromSlash(file)))
		if err != nil {
			continue
		}
		if lines := check.MarkerLines(string(text)); len(lines) > 0 {
			marked = append(marked, markedLine{file, lines[0]})
		}
	}
	return mergeRefusal(nil, marked)
}

// What a verb meets once it stages: an opener the staged delta adds refuses it. [[spec/design_output/work#no-commit-carries-a-marker]]
func (d landingDoors) stagedMarkers(only []string) string {
	var marked []markedLine
	added, _ := d.git.StagedAdds(only)
	for _, one := range added {
		if len(check.MarkerLines(one.Text)) > 0 {
			marked = append(marked, markedLine{one.File, one.Line})
		}
	}
	return mergeRefusal(nil, marked)
}

// A named path a staged rename lands takes its old path with it, so the deletion rides the same commit. [[spec/design_output/work#one-verb-feeds-that-stamp]]
func (d landingDoors) movedFrom(paths []string) []string {
	if len(paths) == 0 {
		return nil
	}
	var out []string
	touched := map[string]bool{}
	staged, _ := d.git.Staged(nil)
	for _, one := range staged {
		if one.Status != movedStatus {
			touched[one.Path] = true
			continue
		}
		touched[one.From] = true
		if slices.Contains(paths, one.Path) && !slices.Contains(paths, one.From) {
			out = append(out, one.From)
		}
	}
	// A journaled old path joins where the staged delta names it or git still holds it, so a move that landed long ago adds no pathspec git refuses. [[spec/tickets/commit-skips-landed-moves]]
	for _, one := range journaledMoves(d.root) {
		for _, path := range paths {
			var under string
			switch {
			case path == one.To:
			case strings.HasPrefix(path, one.To+"/"):
				under = path[len(one.To):]
			default:
				continue
			}
			from := one.From + under
			if !slices.Contains(paths, from) && !slices.Contains(out, from) && (touched[from] || d.stagable(from)) {
				out = append(out, from)
			}
		}
	}
	return out
}

// A path git add matches stands on disk or in the index. [[spec/tickets/commit-stages-a-moved-path]]
func (d landingDoors) stagable(path string) bool {
	return standsUnder(d.root, path) || d.git.Tracked(path)
}

// A move the rename verb journals: its old path and its new one. [[spec/tickets/rename-detection-misses-rewrites]]
type journaledMove struct {
	From string `json:"from"`
	To   string `json:"to"`
}

// The rename verb journals each move, so a rewrite past git's similarity cut still names its old path. [[spec/tickets/rename-detection-misses-rewrites]]
func journaledMoves(root string) []journaledMove {
	folder := filepath.Join(root, filepath.FromSlash(undoFolder))
	found, _ := os.ReadDir(folder)
	var out []journaledMove
	for _, one := range found {
		if one.IsDir() || !strings.HasSuffix(one.Name(), ".json") {
			continue
		}
		text, err := os.ReadFile(filepath.Join(folder, one.Name()))
		if err != nil {
			continue
		}
		var entry struct {
			By    string         `json:"by"`
			Moved *journaledMove `json:"moved"`
		}
		if json.Unmarshal(text, &entry) == nil && entry.By == renameBy && entry.Moved != nil && entry.Moved.To != "" {
			out = append(out, *entry.Moved)
		}
	}
	return out
}
