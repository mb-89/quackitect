// The retro's collect, its first step. It moves everything the private folder
// holds, past the dot folders and the scripts, into the retro's own input
// folder, and copies the scripts, the transcripts, the memory and the
// scratchpads beside it.
// [[spec/guidance/retro/collect]]
package main

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"math"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"slices"
	"sort"
	"strconv"
	"strings"
	"syscall"
	"time"

	"quackitect/src/modules/hooks/command"
	"quackitect/src/note"
)

// The files a retro's home and input hold, the private folder, and the folders collect drains, keeps, and fills with the groups. [[spec/guidance/retro/collect]]
const (
	retroCollectManifest  = "manifest.jsonl"
	retroCollectCollected = "collected.json"
	retroCollectPrivate   = ".se"
	retroCollectDrained   = ".log"
	retroCollectDrainedTo = "log"
	retroCollectKept      = "scripts"
	retroCollectGroups    = "groups"
	retroCollectCloses    = "closed.json"
	retroCollectChapter   = "retro"
	retroCollectMark      = "@"
	retroCollectTickets   = "spec/tickets"
	retroCollectNoteEnd   = ".md"
	retroCollectClosed    = "closed"
	retroCollectGroup     = "group"
	retroCollectWidth     = 12
	retroCollectISO       = "2006-01-02T15:04:05.000Z"
)

// The stamp the last check writes, as STAMP in .claude/skills/level0/lib/runs.js names it under RUN in folders.js. [[spec/guidance/retro/collect]]
var retroCollectStamp = filepath.Join(".se", ".runtime", "check.json")

// The folder the holds stand in, as HOLDS in .claude/skills/level0/lib/folders.js names it. [[spec/design_output/pull#the-hand-and-the-hold]]
var retroCollectHolds = filepath.Join(".se", ".runtime", "hold")

// A comment row, an answered row and a fence row, which carry no text of a chapter. [[spec/tickets/the-retro-reads-cloud-retros]]
var (
	retroCollectComment  = regexp.MustCompile(`^\s*<!--.*-->\s*$`)
	retroCollectAnswered = regexp.MustCompile(`^\s*answered:`)
	retroCollectFence    = regexp.MustCompile("^\\s*(```|~~~)")
)

// The codes a move can meet, named the way node names them. [[spec/guidance/retro/collect]]
var retroCollectCodes = map[syscall.Errno]string{
	syscall.EBUSY:     "EBUSY",
	syscall.EPERM:     "EPERM",
	syscall.EXDEV:     "EXDEV",
	syscall.EACCES:    "EACCES",
	syscall.ENOENT:    "ENOENT",
	syscall.ENOTEMPTY: "ENOTEMPTY",
	syscall.EEXIST:    "EEXIST",
}

// A manifest row: a file with its size and source, or a path refused with its code. [[spec/guidance/retro/collect]]
type retroCollectRow struct {
	Path    string `json:"path"`
	Size    *int64 `json:"size,omitempty"`
	From    string `json:"from,omitempty"`
	Refused string `json:"refused,omitempty"`
}

// An object JSON.parse reads, its keys in the order the text writes them. [[spec/guidance/retro/collect]]
type retroCollectObject struct {
	keys []string
	vals map[string]any
}

// One git run as the doors answer it: whether it passes, its output and its error text. [[spec/tickets/the-retro-reads-cloud-retros]]
type retroRan struct {
	ok       bool
	out, err string
}

// What collect reaches: the root, the home and temp folders the harness keeps its sources under, the clock, git and the move. [[spec/guidance/retro/collect]]
type retroCollectDoors struct {
	root, home, temp string
	now              func() time.Time
	git              func(args ...string) retroRan
	move             func(from, to string) error
}

// A ticket trunk closes, and the trunk commit landing it. [[spec/tickets/the-retro-reads-the-backlog]]
type retroLanding struct {
	name, sha, at string
}

// Every ticket trunk closes inside a window, newest first, or the error the log answers. [[spec/tickets/the-retro-reads-the-backlog]]
type retroClosed struct {
	ok       bool
	err      string
	landings []retroLanding
}

func init() { register("retro collect", retroCollectVerb(retroCollectLive)) }

// The doors collect runs on outside a test: the tree's root, home and temp as cli-doors.js reads them, the clock, git and the rename. [[spec/guidance/retro/collect]]
func retroCollectLive() retroCollectDoors {
	root := retroRoot()
	return retroCollectDoors{
		root: root,
		home: retroCollectFirst(os.Getenv("USERPROFILE"), os.Getenv("HOME")),
		temp: retroCollectFirst(os.Getenv("TEMP"), os.Getenv("TMP"), os.Getenv("TMPDIR")),
		now:  time.Now,
		git:  retroCollectGitIn(root),
		move: os.Rename,
	}
}

// The first value standing. [[spec/guidance/retro/collect]]
func retroCollectFirst(said ...string) string {
	for _, one := range said {
		if one != "" {
			return one
		}
	}
	return ""
}

// Git run in the root, its output and its error trimmed, as src/doors/git.js runs it. [[spec/tickets/the-retro-reads-cloud-retros]]
func retroCollectGitIn(root string) func(args ...string) retroRan {
	return func(args ...string) retroRan {
		var out, errs bytes.Buffer
		run := exec.Command("git", args...)
		run.Dir = root
		run.Stdout, run.Stderr = &out, &errs
		err := run.Run()
		return retroRan{ok: err == nil, out: strings.TrimSpace(out.String()), err: strings.TrimSpace(errs.String())}
	}
}

// retro collect <retro> [--again]: copies this box into the retro's folder, and writes its manifest. [[spec/guidance/retro/collect]]
func retroCollectVerb(doors func() retroCollectDoors) twin {
	return func(argv []string, _ bool, out, errs io.Writer) int {
		name := ""
		if len(argv) > 2 {
			name = argv[2]
		}
		return retroCollect(doors(), name, slices.Contains(argv, "--again"), out, errs)
	}
}

// The collect: a refusal while a hand holds or the battery stands red, the answer of a run already whole, or the move, the copies and the record. [[spec/guidance/retro/collect]]
func retroCollect(it retroCollectDoors, name string, again bool, out, errs io.Writer) int {
	if name == "" {
		fmt.Fprintln(errs, "retro collect names the retro it collects for:")
		fmt.Fprintln(errs, "  ./RUNME.sh retro collect <retro>")
		return exitUsage
	}
	if at, held, found := retroCollectHolding(it.root); found && retroCollectText(retroCollectGet(held, "ticket")) != name {
		fmt.Fprintf(errs, "%s stands, and a hand holds a ticket while it works.\n", at)
		fmt.Fprintln(errs, "Hand that step back, then run collect again.")
		return exitFailed
	}

	home := retroHome(it.root, name)
	into := filepath.Join(home, retroInput)
	if !again && retroCollectExists(filepath.Join(into, retroCollectManifest)) {
		return retroCollectAgain(home, into, name, out, errs)
	}

	if green, says := retroCollectBattery(it); !green {
		fmt.Fprintf(errs, "A retro opens on a green battery with no warning, and %s.\n", says)
		fmt.Fprintln(errs, "Fix what the check names, commit, run ./RUNME.sh check, then collect again.")
		return exitFailed
	}

	window := retroCollectSinceLast(it.root, name)
	since := window
	if again {
		if own := retroCollectWhenOf(retroCollectRead(filepath.Join(home, retroCollectCollected))); !own.IsZero() {
			since = own
		}
	}
	_ = os.MkdirAll(into, 0o777)
	refused := retroCollectMovedInto(it, into)
	keptSince := time.Time{}
	if again {
		keptSince = since
	}
	retroOutsideCopyTree(filepath.Join(it.root, retroCollectPrivate, retroCollectKept), filepath.Join(into, retroCollectKept), keptSince, nil, time.Time{}, &refused)
	folders := retroOutsideInto(it, into, since, window, &refused)
	bare := retroCollectCloudInto(it, into, since, &refused)

	rows := append(retroCollectLinesOf(into, ""), refused...)
	var manifest strings.Builder
	for _, one := range rows {
		manifest.WriteString(retroCollectCompact(one) + "\n")
	}
	_ = os.WriteFile(filepath.Join(into, retroCollectManifest), []byte(manifest.String()), 0o666)
	sinceSaid := ""
	if !since.IsZero() {
		sinceSaid = retroCollectISOOf(since)
	}
	record := struct {
		At      string   `json:"at"`
		Since   string   `json:"since"`
		Folders []string `json:"folders"`
	}{retroCollectISOOf(it.now()), sinceSaid, folders}
	_ = os.WriteFile(filepath.Join(home, retroCollectCollected), []byte(retroCollectPretty(record)), 0o666)
	if report := retroKeptReport(retroCollectRead(filepath.Join(it.root, retroCollectStamp))); report != "" {
		_ = os.WriteFile(filepath.Join(home, retroBattery), []byte(report), 0o666)
	}

	retroCollectSaid(out, name, rows, folders, since)
	for _, one := range bare {
		fmt.Fprintf(out, "  %s closes with no retro text, so it writes nothing.\n", one)
	}
	for _, one := range refused {
		fmt.Fprintf(errs, "  refused %s: %s\n", one.Path, one.Refused)
	}
	if retroCollectStands(it.root, errs) && len(refused) == 0 {
		return 0
	}
	return exitFailed
}

// A second run answers what the first recorded, because the live session writes its log again the moment collect ends. [[spec/guidance/retro/collect]]
func retroCollectAgain(home, into, name string, out, errs io.Writer) int {
	record, _ := retroCollectParsed(retroCollectRead(filepath.Join(home, retroCollectCollected)))
	refusals := 0
	for _, row := range strings.Split(retroCollectRead(filepath.Join(into, retroCollectManifest)), "\n") {
		if said, _ := retroCollectParsed(row); retroCollectTruthy(retroCollectGet(said, "refused")) {
			refusals++
		}
	}
	fmt.Fprintf(out, "%s/%s/%s holds a whole run already, and this one changes nothing.\n", retroFolder, name, retroInput)
	if refusals > 0 {
		fmt.Fprintf(errs, "  that run records %d refused file(s).\n", refusals)
	}
	if retroCollectTruthy(record) && refusals == 0 {
		return 0
	}
	return exitFailed
}

// The first hold on this box whose ticket stands, as holdsAnywhere in src/scripts/guidance-hand.js reads it. [[spec/design_output/pull#the-hand-and-the-hold]]
func retroCollectHolding(root string) (string, any, bool) {
	folder := filepath.Join(root, retroCollectHolds)
	for _, one := range retroCollectListed(folder) {
		if one.IsDir() || !strings.HasSuffix(one.Name(), ".json") {
			continue
		}
		at := filepath.Join(folder, one.Name())
		text, err := os.ReadFile(at)
		if err != nil {
			continue
		}
		held, ok := retroCollectParsed(string(text))
		if ok && retroCollectStillHeld(root, held) {
			return at, held, true
		}
	}
	return "", nil, false
}

// A hold stands while its ticket stands nowhere or reads open, as stillHeld in src/engine/named.js reads it. [[spec/design_output/pull#the-hand-and-the-hold]]
func retroCollectStillHeld(root string, held any) bool {
	path := strings.TrimSpace(retroCollectText(retroCollectGet(held, "path")))
	if path == "" {
		return true
	}
	text, err := os.ReadFile(filepath.Join(root, filepath.FromSlash(path)))
	return err != nil || retroCollectFieldOf(string(text), "state") != retroCollectClosed
}

// The stamp the last check wrote, read against the commit standing now, and red where a warning stands or no count stands. [[spec/guidance/retro/collect]]
func retroCollectBattery(it retroCollectDoors) (bool, string) {
	text := retroCollectRead(filepath.Join(it.root, retroCollectStamp))
	sha := ""
	if it.git != nil {
		sha = strings.TrimSpace(it.git("rev-parse", "HEAD").out)
	}
	green, says := command.Battery(text, true, sha)
	if !green {
		return green, says
	}
	stamp, _ := retroCollectParsed(text)
	object, _ := stamp.(*retroCollectObject)
	if object == nil || !object.has("warnings") || retroCollectNumber(object.vals["warnings"]) > 0 {
		return false, "a warning stands in the check"
	}
	return green, says
}

// Every entry straight under the private folder moves whole, a folder with all it holds. A dot folder stays, and the log is the one dot folder that moves. [[spec/guidance/retro/collect]]
func retroCollectMovedInto(it retroCollectDoors, into string) []retroCollectRow {
	from := filepath.Join(it.root, retroCollectPrivate)
	out := []retroCollectRow{}
	for _, one := range retroCollectListed(from) {
		name := one.Name()
		if (strings.HasPrefix(name, ".") && name != retroCollectDrained) || name == retroCollectKept {
			continue
		}
		was := filepath.Join(from, name)
		now := filepath.Join(into, name)
		if name == retroCollectDrained {
			now = filepath.Join(into, retroCollectDrainedTo)
		}
		var err error
		if one.IsDir() && retroCollectExists(now) {
			err = &os.LinkError{Op: "rename", Old: was, New: now, Err: syscall.EEXIST}
		} else {
			err = it.move(was, retroCollectFreeName(now))
		}
		if err == nil {
			continue
		}
		path := retroCollectPrivate + "/" + name
		if one.IsDir() && retroCollectFileByFile(it, was, now, path, &out) {
			_ = os.RemoveAll(was)
			continue
		}
		out = append(out, retroCollectRow{Path: path, Refused: retroCollectReasonOf(err)})
	}
	return out
}

// Moves every file a folder holds, and answers whether none stays behind. [[spec/guidance/retro/collect]]
func retroCollectFileByFile(it retroCollectDoors, was, now, path string, out *[]retroCollectRow) bool {
	whole := true
	for _, one := range retroCollectListed(was) {
		from := filepath.Join(was, one.Name())
		to := filepath.Join(now, one.Name())
		if one.IsDir() {
			whole = retroCollectFileByFile(it, from, to, path+"/"+one.Name(), out) && whole
			continue
		}
		err := os.MkdirAll(now, 0o777)
		if err == nil {
			err = it.move(from, retroCollectFreeName(to))
		}
		if err != nil {
			*out = append(*out, retroCollectRow{Path: path + "/" + one.Name(), Refused: retroCollectReasonOf(err)})
			whole = false
		}
	}
	return whole
}

// A name the input holds already takes a number before its extension, so a second pass overwrites nothing. [[spec/guidance/retro/collect]]
func retroCollectFreeName(at string) string {
	if !retroCollectExists(at) {
		return at
	}
	cut := len(at)
	if dot := strings.LastIndex(at, "."); dot > max(strings.LastIndex(at, "/"), strings.LastIndex(at, "\\")) {
		cut = dot
	}
	for n := 2; ; n++ {
		if next := at[:cut] + "." + strconv.Itoa(n) + at[cut:]; !retroCollectExists(next) {
			return next
		}
	}
}

// The code node names an error by, or its message. [[spec/guidance/retro/collect]]
func retroCollectReasonOf(err error) string {
	var code syscall.Errno
	if errors.As(err, &code) {
		if name, found := retroCollectCodes[code]; found {
			return name
		}
	}
	return err.Error()
}

// The last retro's collect opens this window, and a retro with none before it takes everything. [[spec/guidance/retro/collect]]
func retroCollectSinceLast(root, name string) time.Time {
	at := filepath.Join(root, filepath.FromSlash(retroFolder))
	var newest time.Time
	for _, one := range retroCollectListed(at) {
		if !one.IsDir() || one.Name() == name {
			continue
		}
		if when := retroCollectWhenOf(retroCollectRead(filepath.Join(at, one.Name(), retroCollectCollected))); when.After(newest) {
			newest = when
		}
	}
	return newest
}

// The time a collect record names under at, or the zero time. [[spec/guidance/retro/collect]]
func retroCollectWhenOf(record string) time.Time {
	said, _ := retroCollectParsed(record)
	when, _ := retroCollectDate(retroCollectText(retroCollectGet(said, "at")))
	return when
}

// A time an ISO text names, as Date.parse reads one. [[spec/guidance/retro/collect]]
func retroCollectDate(said string) (time.Time, bool) {
	for _, layout := range []string{time.RFC3339Nano, "2006-01-02"} {
		if when, err := time.Parse(layout, said); err == nil {
			return when, true
		}
	}
	return time.Time{}, false
}

// A time as toISOString writes it. [[spec/guidance/retro/collect]]
func retroCollectISOOf(when time.Time) string {
	return when.UTC().Format(retroCollectISO)
}

// Every group trunk takes closed since the window: its box's retro chapter, and the time of the trunk commit landing it. [[spec/tickets/the-retro-reads-cloud-retros]]
func retroCollectCloudInto(it retroCollectDoors, into string, since time.Time, refused *[]retroCollectRow) []string {
	bare := []string{}
	closed := retroClosedIn(it.git, since)
	if !closed.ok {
		*refused = append(*refused, retroCollectRow{Path: retroCollectGroups, Refused: closed.err})
		return bare
	}
	at := filepath.Join(into, retroCollectGroups)
	closesAt := filepath.Join(at, retroCollectCloses)
	parsed, _ := retroCollectParsed(retroCollectRead(closesAt))
	closes, isObject := parsed.(*retroCollectObject)
	if !isObject {
		closes = retroCollectNewObject()
	}
	wrote := false
	for _, landing := range closed.landings {
		if retroCollectExists(filepath.Join(at, landing.name+retroCollectNoteEnd)) {
			continue
		}
		path := retroCollectTickets + "/" + landing.name + retroCollectNoteEnd
		shown := it.git("show", landing.sha+":"+path)
		if !shown.ok {
			*refused = append(*refused, retroCollectRow{Path: path, Refused: retroCollectFirst(shown.err, "git show")})
			continue
		}
		if !retroCollectIsGroup(shown.out) || retroCollectFieldOf(shown.out, "state") != retroCollectClosed {
			continue
		}
		chapter := retroCollectChapterOf(shown.out)
		if chapter == "" {
			bare = append(bare, landing.name)
			continue
		}
		_ = os.MkdirAll(at, 0o777)
		_ = os.WriteFile(filepath.Join(at, landing.name+retroCollectNoteEnd), []byte(chapter), 0o666)
		when, _ := retroCollectDate(landing.at)
		closes.set(landing.name, retroCollectISOOf(when))
		wrote = true
	}
	if wrote {
		_ = os.WriteFile(closesAt, []byte(retroCollectPretty(closes)), 0o666)
	}
	return bare
}

// Every ticket trunk takes closed since the window, and the trunk commit landing each. The first-parent line reads the merge, so a ticket a box closes before the window and trunk takes after it still counts. [[spec/tickets/the-retro-reads-the-backlog]]
func retroClosedIn(git func(args ...string) retroRan, since time.Time) retroClosed {
	args := []string{"log", command.Trunk, "--first-parent", "--diff-merges=first-parent", "-G", "^state: " + retroCollectClosed, "--format=" + retroCollectMark + "%H %cI", "--name-only"}
	if !since.IsZero() {
		args = append(args, "--since="+retroCollectISOOf(since))
	}
	log := git(append(args, "--", retroCollectTickets)...)
	if !log.ok {
		return retroClosed{err: retroCollectFirst(log.err, "git log")}
	}
	landings := []retroLanding{}
	for _, landing := range retroCollectLandingsOf(log.out) {
		when, ok := retroCollectDate(landing.at)
		if since.IsZero() || (ok && !when.Before(since)) {
			landings = append(landings, landing)
		}
	}
	return retroClosed{ok: true, landings: landings}
}

// The newest trunk commit naming each ticket, off a log of marked commit rows and the paths under each. [[spec/tickets/the-retro-reads-cloud-retros]]
func retroCollectLandingsOf(said string) []retroLanding {
	out := []retroLanding{}
	seen := map[string]bool{}
	var sha, at string
	landed := false
	for _, row := range strings.Split(said, "\n") {
		one := strings.TrimSpace(row)
		if rest, found := strings.CutPrefix(one, retroCollectMark); found {
			parts := strings.Split(rest, " ")
			sha, at, landed = parts[0], "", true
			if len(parts) > 1 {
				at = parts[1]
			}
			continue
		}
		if !landed || !strings.HasPrefix(one, retroCollectTickets+"/") || !strings.HasSuffix(one, retroCollectNoteEnd) {
			continue
		}
		name := strings.TrimSuffix(one, retroCollectNoteEnd)
		name = name[strings.LastIndex(name, "/")+1:]
		if !seen[name] {
			seen[name] = true
			out = append(out, retroLanding{name: name, sha: sha, at: at})
		}
	}
	return out
}

// The ticket's retro chapter with its headings, past its comments, or nothing where it holds no text. [[spec/tickets/the-retro-reads-cloud-retros]]
func retroCollectChapterOf(text string) string {
	sections := note.Read(text).Sections
	found := slices.IndexFunc(sections, func(one note.Section) bool { return one.Level == 1 && one.Header == retroCollectChapter })
	if found < 0 {
		return ""
	}
	rows := strings.Split(strings.ReplaceAll(text, "\r\n", "\n"), "\n")
	end, next := len(rows), len(sections)
	for at := found + 1; at < len(sections); at++ {
		if sections[at].Level <= 1 {
			end, next = sections[at].Line-1, at
			break
		}
	}
	if !slices.ContainsFunc(sections[found:next], func(one note.Section) bool { return retroCollectHoldsText(one.Own) }) {
		return ""
	}
	kept := []string{}
	for _, row := range rows[sections[found].Line-1 : end] {
		if !retroCollectComment.MatchString(row) {
			kept = append(kept, row)
		}
	}
	return strings.TrimSpace(strings.Join(kept, "\n")) + "\n"
}

// Whether a section's own rows carry a line of text, past the comments, the answered rows and the fences, as lines in src/scripts/pull-chapter.js reads them. [[spec/design_output/pull#the-fields-hold-their-forms]]
func retroCollectHoldsText(own []string) bool {
	return slices.ContainsFunc(own, func(row string) bool {
		return strings.TrimSpace(row) != "" && !retroCollectComment.MatchString(row) && !retroCollectAnswered.MatchString(row) && !retroCollectFence.MatchString(row)
	})
}

// A field of a note's front, bare of its link marks, as fieldOf in src/engine/group.js reads it. [[spec/design_output/work#a-group-is-a-ticket]]
func retroCollectFieldOf(text, key string) string {
	said := note.Read(text).Front.Said.Get(key)
	if said == nil {
		return ""
	}
	bare := strings.TrimSpace(retroCollectText(said))
	bare = strings.TrimSuffix(strings.TrimPrefix(bare, "[["), "]]")
	return strings.TrimSpace(bare)
}

// A group ticket links the group process. [[spec/design_output/work#a-group-is-a-ticket]]
func retroCollectIsGroup(text string) bool {
	process := retroCollectFieldOf(text, "process")
	return text != "" && process[strings.LastIndex(process, "/")+1:] == retroCollectGroup
}

// One row a file the input folder holds, naming the source it comes from. [[spec/guidance/retro/collect]]
func retroCollectLinesOf(into, rel string) []retroCollectRow {
	out := []retroCollectRow{}
	for _, one := range retroCollectListed(filepath.Join(into, filepath.FromSlash(rel))) {
		path := one.Name()
		if rel != "" {
			path = rel + "/" + one.Name()
		}
		if path == retroCollectManifest {
			continue
		}
		if one.IsDir() {
			out = append(out, retroCollectLinesOf(into, path)...)
			continue
		}
		var size int64
		if said, err := os.Stat(filepath.Join(into, filepath.FromSlash(path))); err == nil {
			size = said.Size()
		}
		out = append(out, retroCollectRow{Path: path, Size: &size, From: retroCollectSourceOf(path)})
	}
	return out
}

// The source a path of the input comes from, named by its top folder. [[spec/guidance/retro/collect]]
func retroCollectSourceOf(path string) string {
	top, _, _ := strings.Cut(path, "/")
	if slices.Contains([]string{"transcripts", "memory", "scratch", retroCollectGroups}, top) {
		return top
	}
	return retroCollectPrivate
}

// What stands straight under the private folder past the dot folders and the scripts, which a clean collect leaves empty. [[spec/guidance/retro/collect]]
func retroCollectStands(root string, errs io.Writer) bool {
	clean := true
	for _, one := range retroCollectListed(filepath.Join(root, retroCollectPrivate)) {
		if strings.HasPrefix(one.Name(), ".") || one.Name() == retroCollectKept {
			continue
		}
		fmt.Fprintf(errs, "  %s/%s still stands beside the dot folders.\n", retroCollectPrivate, one.Name())
		clean = false
	}
	return clean
}

// The count by source, because a short answer reads like a whole one. [[spec/guidance/retro/collect]]
func retroCollectSaid(out io.Writer, name string, rows []retroCollectRow, folders []string, since time.Time) {
	window := "with no retro before it, so everything"
	if !since.IsZero() {
		window = "since " + retroCollectISOOf(since)
	}
	fmt.Fprintf(out, "%s/%s/%s collects %s.\n", retroFolder, name, retroInput, window)
	keys := []string{}
	counts := map[string]int{}
	for _, one := range rows {
		key := one.From
		if one.Refused != "" {
			key = "refused"
		}
		if _, seen := counts[key]; !seen {
			keys = append(keys, key)
		}
		counts[key]++
	}
	for _, key := range keys {
		fmt.Fprintf(out, "  %-*s %d file(s)\n", retroCollectWidth, key, counts[key])
	}
	for _, one := range folders {
		fmt.Fprintf(out, "  from %s\n", one)
	}
}

// The parts read as their median over the runs the stamp keeps, and the slowest cases and the files stay off the last run. [[spec/guidance/retro/effect]]
func retroKeptReport(stamp string) string {
	parsed, _ := retroCollectParsed(stamp)
	report := retroCollectGet(parsed, "battery")
	if !retroCollectTruthy(report) {
		return ""
	}
	runs, _ := retroCollectGet(parsed, "runs").([]any)
	if len(runs) == 0 {
		parts := retroCollectGet(report, "parts")
		if parts == nil {
			parts = retroCollectNewObject()
		}
		runs = []any{parts}
	}
	parts := retroCollectMedianParts(runs)
	total := 0.0
	for _, key := range parts.keys {
		total += parts.vals[key].(float64)
	}
	out := retroCollectNewObject()
	if whole, isObject := report.(*retroCollectObject); isObject {
		for _, key := range whole.keys {
			out.set(key, whole.vals[key])
		}
	}
	out.set("parts", parts)
	out.set("total", total)
	out.set("runs", float64(len(runs)))
	return retroCollectPretty(out)
}

// Each part's median over the runs, as medianParts in src/scripts/battery.js reads it. [[spec/guidance/retro/effect]]
func retroCollectMedianParts(runs []any) *retroCollectObject {
	held := retroCollectNewObject()
	for _, run := range runs {
		one, isObject := run.(*retroCollectObject)
		if !isObject {
			continue
		}
		for _, name := range one.keys {
			all, _ := held.vals[name].([]float64)
			held.set(name, append(all, retroCollectNumber(one.vals[name])))
		}
	}
	out := retroCollectNewObject()
	for _, name := range held.keys {
		all := slices.Clone(held.vals[name].([]float64))
		sort.Float64s(all)
		mid := len(all) / 2
		if len(all)%2 == 1 {
			out.set(name, all[mid])
		} else {
			out.set(name, math.Floor((all[mid-1]+all[mid])/2+0.5))
		}
	}
	return out
}

// An empty object. [[spec/guidance/retro/collect]]
func retroCollectNewObject() *retroCollectObject {
	return &retroCollectObject{vals: map[string]any{}}
}

// Whether the object carries a key. [[spec/guidance/retro/collect]]
func (o *retroCollectObject) has(key string) bool {
	_, found := o.vals[key]
	return found
}

// Sets a key, keeping the place a key it carries already stands at. [[spec/guidance/retro/collect]]
func (o *retroCollectObject) set(key string, said any) {
	if !o.has(key) {
		o.keys = append(o.keys, key)
	}
	o.vals[key] = said
}

// The object as JSON.stringify writes it, its keys in their order. [[spec/guidance/retro/collect]]
func (o *retroCollectObject) MarshalJSON() ([]byte, error) {
	var out bytes.Buffer
	out.WriteByte('{')
	for at, key := range o.keys {
		if at > 0 {
			out.WriteByte(',')
		}
		out.WriteString(retroCollectCompact(key) + ":" + retroCollectCompact(o.vals[key]))
	}
	out.WriteByte('}')
	return out.Bytes(), nil
}

// A JSON text read as JSON.parse reads it, an object keeping its key order, or false where it reads as no JSON. [[spec/guidance/retro/collect]]
func retroCollectParsed(text string) (any, bool) {
	reads := json.NewDecoder(strings.NewReader(text))
	said, err := retroCollectDecode(reads)
	if err != nil {
		return nil, false
	}
	if _, err := reads.Token(); err != io.EOF {
		return nil, false
	}
	return said, true
}

// One JSON value off the decoder. [[spec/guidance/retro/collect]]
func retroCollectDecode(reads *json.Decoder) (any, error) {
	token, err := reads.Token()
	if err != nil {
		return nil, err
	}
	mark, isDelim := token.(json.Delim)
	if !isDelim {
		return token, nil
	}
	if mark == '[' {
		list := []any{}
		for reads.More() {
			one, err := retroCollectDecode(reads)
			if err != nil {
				return nil, err
			}
			list = append(list, one)
		}
		_, err = reads.Token()
		return list, err
	}
	object := retroCollectNewObject()
	for reads.More() {
		key, err := reads.Token()
		if err != nil {
			return nil, err
		}
		one, err := retroCollectDecode(reads)
		if err != nil {
			return nil, err
		}
		object.set(key.(string), one)
	}
	_, err = reads.Token()
	return object, err
}

// A value's key, where the value is an object. [[spec/guidance/retro/collect]]
func retroCollectGet(said any, key string) any {
	if object, isObject := said.(*retroCollectObject); isObject {
		return object.vals[key]
	}
	return nil
}

// Whether a value reads true, as JavaScript reads one. [[spec/guidance/retro/collect]]
func retroCollectTruthy(said any) bool {
	switch one := said.(type) {
	case nil:
		return false
	case bool:
		return one
	case float64:
		return one != 0 && !math.IsNaN(one)
	case string:
		return one != ""
	}
	return true
}

// A value as String writes it, and nothing for null. [[spec/guidance/retro/collect]]
func retroCollectText(said any) string {
	switch one := said.(type) {
	case nil:
		return ""
	case string:
		return one
	case bool:
		return strconv.FormatBool(one)
	case float64:
		return strconv.FormatFloat(one, 'f', -1, 64)
	case int:
		return strconv.Itoa(one)
	case []any:
		parts := make([]string, len(one))
		for at, each := range one {
			parts[at] = retroCollectText(each)
		}
		return strings.Join(parts, ",")
	}
	return "[object Object]"
}

// A value as Number reads it, and 0 where it reads as none. [[spec/guidance/retro/effect]]
func retroCollectNumber(said any) float64 {
	switch one := said.(type) {
	case float64:
		if !math.IsNaN(one) {
			return one
		}
	case bool:
		if one {
			return 1
		}
	case string:
		if number, err := strconv.ParseFloat(strings.TrimSpace(one), 64); err == nil {
			return number
		}
	}
	return 0
}

// A value as JSON.stringify writes it on one line. [[spec/guidance/retro/collect]]
func retroCollectCompact(said any) string {
	var out bytes.Buffer
	writes := json.NewEncoder(&out)
	writes.SetEscapeHTML(false)
	_ = writes.Encode(said)
	return strings.TrimSuffix(out.String(), "\n")
}

// A value as JSON.stringify writes it at two spaces, and a newline after. [[spec/guidance/retro/collect]]
func retroCollectPretty(said any) string {
	var out bytes.Buffer
	writes := json.NewEncoder(&out)
	writes.SetEscapeHTML(false)
	writes.SetIndent("", "  ")
	_ = writes.Encode(said)
	return out.String()
}

// The entries of a folder by name, or none where it stands nowhere. [[spec/guidance/retro/collect]]
func retroCollectListed(at string) []os.DirEntry {
	entries, err := os.ReadDir(at)
	if err != nil {
		return nil
	}
	return entries
}

// A file's text, or nothing. [[spec/guidance/retro/collect]]
func retroCollectRead(at string) string {
	text, err := os.ReadFile(at)
	if err != nil {
		return ""
	}
	return string(text)
}

// Whether a path stands. [[spec/guidance/retro/collect]]
func retroCollectExists(at string) bool {
	_, err := os.Stat(at)
	return err == nil
}
