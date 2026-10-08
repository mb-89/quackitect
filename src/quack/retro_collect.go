// The retro's collect, its first step. It moves everything the private folder
// holds, past the dot folders and the scripts, into the retro's own input
// folder, and copies the scripts, the transcripts, the memory and the
// scratchpads beside it.
// [[spec/guidance/retro/collect]]
package main

import (
	"errors"
	"fmt"
	"io"
	"io/fs"
	"path/filepath"
	"slices"
	"strconv"
	"strings"
	"time"

	"quackitect/src/modules/hooks/command"
	"quackitect/src/proc"
	"quackitect/src/yaml"
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

// The stamp the last check writes, as stampFile in src/quack/check.go names it under Run in src/modules/check/folders.go. [[spec/guidance/retro/collect]]
var retroCollectStamp = filepath.Join(".se", ".runtime", "check.json")

// The folder the holds stand in, as Holds in src/modules/check/folders.go names it. [[spec/design_output/pull#the-hand-and-the-hold]]
var retroCollectHolds = filepath.Join(".se", ".runtime", "hold")

// A manifest row: a file with its size and source, or a path refused with its code. [[spec/guidance/retro/collect]]
type retroCollectRow struct {
	Path    string `json:"path"`
	Size    *int64 `json:"size,omitempty"`
	From    string `json:"from,omitempty"`
	Refused string `json:"refused,omitempty"`
}

// One git run as the doors answer it: whether it passes, its output and its error text. [[spec/tickets/the-retro-reads-cloud-retros]]
type retroRan struct {
	ok       bool
	out, err string
}

// What collect reaches: the root, the home and temp folders the harness keeps its sources under, the clock, git, the disk and the move. [[spec/guidance/retro/collect]]
type retroCollectDoors struct {
	root, home, temp string
	now              func() time.Time
	git              func(args ...string) retroRan
	disk             diskDoors
	move             func(from, to string) error
}

func init() { register("retro collect", retroCollectVerb(retroCollectLive)) }

// The doors collect runs on outside a test: the tree's root, home and temp, the clock, git and the rename. [[spec/guidance/retro/collect]]
func retroCollectLive() retroCollectDoors {
	d := quietBox()
	root := retroRootOf(d)
	return retroCollectDoors{
		root: root,
		home: homeOf(d.env),
		temp: retroCollectFirst(d.env("TEMP"), d.env("TMP"), d.env("TMPDIR")),
		now:  d.clock.Now,
		git:  retroCollectGitIn(root),
		disk: d.disk,
		move: d.disk.rename,
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

// Git run in the root, its output and its error trimmed, as src/modules/git/git.go runs it. [[spec/tickets/the-retro-reads-cloud-retros]]
func retroCollectGitIn(root string) func(args ...string) retroRan {
	return func(args ...string) retroRan {
		said := proc.Real(proc.Command{Argv: append([]string{"git"}, args...), Dir: root})
		return retroRan{ok: said.Code == 0, out: strings.TrimSpace(said.Out), err: strings.TrimSpace(said.Err)}
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
	disk := it.disk
	if at, held, found := retroCollectHolding(disk, it.root); found && retroCollectText(retroCollectGet(held, "ticket")) != name {
		fmt.Fprintf(errs, "%s stands, and a hand holds a ticket while it works.\n", at)
		fmt.Fprintln(errs, "Hand that step back, then run collect again.")
		return exitFailed
	}

	home := retroHome(it.root, name)
	into := filepath.Join(home, retroInput)
	if !again && disk.stands(filepath.Join(into, retroCollectManifest)) {
		return retroCollectAgain(disk, home, into, name, out, errs)
	}

	if green, says := retroCollectBattery(it); !green {
		fmt.Fprintf(errs, "A retro opens on a green battery with no warning, and %s.\n", says)
		fmt.Fprintln(errs, "Fix what the check names, commit, run ./RUNME.sh check, then collect again.")
		return exitFailed
	}

	window := retroCollectSinceLast(disk, it.root, name)
	since := window
	if again {
		if own := retroCollectWhenOf(disk.text(filepath.Join(home, retroCollectCollected))); !own.IsZero() {
			since = own
		}
	}
	if err := disk.makeAll(into, 0o777); err != nil {
		return retroCollectFailed(errs, into, err)
	}
	refused := retroCollectMovedInto(it, into)
	keptSince := time.Time{}
	if again {
		keptSince = since
	}
	retroOutsideCopyTree(disk, filepath.Join(it.root, retroCollectPrivate, retroCollectKept), filepath.Join(into, retroCollectKept), keptSince, nil, time.Time{}, &refused)
	folders := retroOutsideInto(it, into, since, window, &refused)
	bare, at, err := retroCollectCloudInto(it, into, since, &refused)
	if err != nil {
		return retroCollectFailed(errs, at, err)
	}

	rows := append(retroCollectLinesOf(disk, into, ""), refused...)
	var manifest strings.Builder
	for _, one := range rows {
		manifest.WriteString(retroCollectCompact(one) + "\n")
	}
	if at := filepath.Join(into, retroCollectManifest); retroCollectWrite(disk, at, manifest.String(), errs) {
		return exitFailed
	}
	sinceSaid := ""
	if !since.IsZero() {
		sinceSaid = retroCollectISOOf(since)
	}
	record := struct {
		At      string   `json:"at"`
		Since   string   `json:"since"`
		Folders []string `json:"folders"`
	}{retroCollectISOOf(it.now()), sinceSaid, folders}
	if at := filepath.Join(home, retroCollectCollected); retroCollectWrite(disk, at, retroCollectPretty(record), errs) {
		return exitFailed
	}
	if report := retroKeptReport(disk.text(filepath.Join(it.root, retroCollectStamp))); report != "" {
		if at := filepath.Join(home, retroBattery); retroCollectWrite(disk, at, report, errs) {
			return exitFailed
		}
	}

	retroCollectSaid(out, name, rows, folders, since)
	for _, one := range bare {
		fmt.Fprintf(out, "  %s closes with no retro text, so it writes nothing.\n", one)
	}
	for _, one := range refused {
		fmt.Fprintf(errs, "  refused %s: %s\n", one.Path, one.Refused)
	}
	if retroCollectStands(disk, it.root, errs) && len(refused) == 0 {
		return 0
	}
	return exitFailed
}

// A second run answers what the first recorded, because the live session writes its log again the moment collect ends. [[spec/guidance/retro/collect]]
func retroCollectAgain(disk diskDoors, home, into, name string, out, errs io.Writer) int {
	record, _ := retroCollectParsed(disk.text(filepath.Join(home, retroCollectCollected)))
	refusals := 0
	for _, row := range strings.Split(disk.text(filepath.Join(into, retroCollectManifest)), "\n") {
		if said, _ := retroCollectParsed(row); yaml.Truthy(retroCollectGet(said, "refused")) {
			refusals++
		}
	}
	fmt.Fprintf(out, "%s/%s/%s holds a whole run already, and this one changes nothing.\n", retroFolder, name, retroInput)
	if refusals > 0 {
		fmt.Fprintf(errs, "  that run records %d refused file(s).\n", refusals)
	}
	if yaml.Truthy(record) && refusals == 0 {
		return 0
	}
	return exitFailed
}

// The first hold on this box whose ticket stands, as EveryHold in src/pull/pull_holds.go reads it. [[spec/design_output/pull#the-hand-and-the-hold]]
func retroCollectHolding(disk diskDoors, root string) (string, any, bool) {
	folder := filepath.Join(root, retroCollectHolds)
	for _, one := range disk.listed(folder) {
		if one.IsDir() || !strings.HasSuffix(one.Name(), ".json") {
			continue
		}
		at := filepath.Join(folder, one.Name())
		text, err := disk.read(at)
		if err != nil {
			continue
		}
		held, ok := retroCollectParsed(string(text))
		if ok && retroCollectStillHeld(disk, root, held) {
			return at, held, true
		}
	}
	return "", nil, false
}

// A hold stands while its ticket stands nowhere or reads open, as stillHeld in src/modules/hooks/command/ticket.go reads it. [[spec/design_output/pull#the-hand-and-the-hold]]
func retroCollectStillHeld(disk diskDoors, root string, held any) bool {
	path := strings.TrimSpace(retroCollectText(retroCollectGet(held, "path")))
	if path == "" {
		return true
	}
	text, err := disk.read(filepath.Join(root, filepath.FromSlash(path)))
	return err != nil || retroCollectFieldOf(string(text), "state") != retroCollectClosed
}

// The stamp the last check wrote, read against the commit standing now, and red where a warning stands or no count stands. [[spec/guidance/retro/collect]]
func retroCollectBattery(it retroCollectDoors) (bool, string) {
	text := it.disk.text(filepath.Join(it.root, retroCollectStamp))
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
	disk := it.disk
	from := filepath.Join(it.root, retroCollectPrivate)
	out := []retroCollectRow{}
	for _, one := range disk.listed(from) {
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
		if one.IsDir() && disk.stands(now) {
			err = diskTaken(was, now)
		} else {
			err = it.move(was, retroCollectFreeName(disk, now))
		}
		if err == nil {
			continue
		}
		path := retroCollectPrivate + "/" + name
		if one.IsDir() && retroCollectFileByFile(it, was, now, path, &out) {
			_ = disk.removeAll(was)
			continue
		}
		out = append(out, retroCollectRow{Path: path, Refused: retroCollectReasonOf(err)})
	}
	return out
}

// Moves every file a folder holds, and answers whether none stays behind. [[spec/guidance/retro/collect]]
func retroCollectFileByFile(it retroCollectDoors, was, now, path string, out *[]retroCollectRow) bool {
	disk := it.disk
	whole := true
	for _, one := range disk.listed(was) {
		from := filepath.Join(was, one.Name())
		to := filepath.Join(now, one.Name())
		if one.IsDir() {
			whole = retroCollectFileByFile(it, from, to, path+"/"+one.Name(), out) && whole
			continue
		}
		err := disk.makeAll(now, 0o777)
		if err == nil {
			err = it.move(from, retroCollectFreeName(disk, to))
		}
		if err != nil {
			*out = append(*out, retroCollectRow{Path: path + "/" + one.Name(), Refused: retroCollectReasonOf(err)})
			whole = false
		}
	}
	return whole
}

// A name the input holds already takes a number before its extension, so a second pass overwrites nothing. [[spec/guidance/retro/collect]]
func retroCollectFreeName(disk diskDoors, at string) string {
	if !disk.stands(at) {
		return at
	}
	cut := len(at)
	if dot := strings.LastIndex(at, "."); dot > max(strings.LastIndex(at, "/"), strings.LastIndex(at, "\\")) {
		cut = dot
	}
	for n := 2; ; n++ {
		if next := at[:cut] + "." + strconv.Itoa(n) + at[cut:]; !disk.stands(next) {
			return next
		}
	}
}

// The code node names an error by, or its message. [[spec/guidance/retro/collect]]
func retroCollectReasonOf(err error) string {
	if name := diskCode(err); name != "" {
		return name
	}
	return err.Error()
}

// The last retro's collect opens this window, and a retro with none before it takes everything. [[spec/guidance/retro/collect]]
func retroCollectSinceLast(disk diskDoors, root, name string) time.Time {
	at := filepath.Join(root, filepath.FromSlash(retroFolder))
	var newest time.Time
	for _, one := range disk.listed(at) {
		if !one.IsDir() || one.Name() == name {
			continue
		}
		if when := retroCollectWhenOf(disk.text(filepath.Join(at, one.Name(), retroCollectCollected))); when.After(newest) {
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

// Writes a file collect keeps, and answers true where the write fails, after one line on errs naming the file and the error. [[spec/guidance/retro/collect]]
func retroCollectWrite(disk diskDoors, at, text string, errs io.Writer) bool {
	err := disk.write(at, []byte(text), 0o666)
	if err != nil {
		retroCollectFailed(errs, at, err)
	}
	return err != nil
}

// One line naming the file collect fails to write and the error, and the failed exit. [[spec/guidance/retro/collect]]
func retroCollectFailed(errs io.Writer, at string, err error) int {
	var path *fs.PathError
	if errors.As(err, &path) {
		err = path.Err
	}
	fmt.Fprintf(errs, "retro collect fails to write %s: %v\n", at, err)
	return exitFailed
}

// One row a file the input folder holds, naming the source it comes from. [[spec/guidance/retro/collect]]
func retroCollectLinesOf(disk diskDoors, into, rel string) []retroCollectRow {
	out := []retroCollectRow{}
	for _, one := range disk.listed(filepath.Join(into, filepath.FromSlash(rel))) {
		path := one.Name()
		if rel != "" {
			path = rel + "/" + one.Name()
		}
		if path == retroCollectManifest {
			continue
		}
		if one.IsDir() {
			out = append(out, retroCollectLinesOf(disk, into, path)...)
			continue
		}
		var size int64
		if said, err := disk.stat(filepath.Join(into, filepath.FromSlash(path))); err == nil {
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
func retroCollectStands(disk diskDoors, root string, errs io.Writer) bool {
	clean := true
	for _, one := range disk.listed(filepath.Join(root, retroCollectPrivate)) {
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
