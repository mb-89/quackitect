// quack tui: the window this tree builds, on the tab the caller names. A
// window already standing takes the tab over its own port and the second
// launch ends, so one window stands at a time. A tree carrying no Go prints
// the rows plain instead. tuiViewerOf owns the stamp of the viewer build, so
// the check and the verb share one stamp.
// [[spec/design_output/tui#the-verb-builds-it]]
package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"io/fs"
	"path/filepath"
	"regexp"
	"slices"
	"sort"
	"strings"
	"time"

	"quackitect/src/index"
	"quackitect/src/modules/hooks/brief"
	"quackitect/src/proc"
	"quackitect/src/tui/frame"
)

// The tabs a caller names, the first one a handover opens where none is named. [[spec/design_output/tui#a-tab-the-caller-names]]
var tuiTabs = []string{"log", "work", "tutorial"}

// The log's folders, as Log in src/modules/check/folders.go and logOld in src/quack/verb_log.go name them, and the lines the plain road prints. [[spec/design_output/log#one-verb-reads-the-log]]
const (
	tuiLogFolder = ".se/.log"
	tuiNoLog     = "No log stands yet. A writer starts one the next time it says a line."
	tuiNeedsGo   = "Go builds the viewer these rows open in. Install Go, and run this again."
)

// The viewer's source folder, the binaries' folder, the stamp beside the binary, the module files every stamp reads, the mark a key joins on, and the names an old binary tries. [[spec/design_output/tui#the-verb-builds-it]]
const (
	tuiSource = "src/tui"
	tuiBin    = ".se/.runtime/bin" // the runtime folder src/modules/check/folders.go owns
	tuiStamp  = tuiBin + "/.logview-source"
	tuiJoin   = "\x1f"
	tuiAside  = 9
)

// The module files each stamp reads beside its folders. [[spec/tickets/go-code-shares-one-module]]
var tuiModuleFiles = []string{"go.mod", "go.sum"}

// A tree import names a package folder under the root. [[spec/tickets/go-code-shares-one-module]]
var tuiImport = regexp.MustCompile(`"quackitect/(src/[^"]+)"`)

// What the tui verb reaches: the root, the box's kind, the go program, a captured run, a launch holding the terminal, and the tell to a standing window. [[spec/design_output/tui#the-verb-builds-it]]
type tuiDoors struct {
	root    string
	windows bool
	goTool  string
	run     func(argv []string, cwd string) (int, string, error)
	launch  func(argv []string, cwd string, out, errs io.Writer) (int, error)
	tell    func(tab string) bool
	disk    diskDoors
}

// The modes a made folder and the stamp take. [[spec/design_output/tui#the-verb-builds-it]]
const (
	tuiFolderMode = 0o755
	tuiStampMode  = 0o644
)

func init() { register("tui", tuiVerb(tuiReal)) }

// The tui verb over its doors. Dry builds, tells and launches nothing, and prints the rows. [[spec/design_output/tui#the-verb-builds-it]]
func tuiVerb(doors func() tuiDoors) twin {
	return func(argv []string, dry bool, out, errs io.Writer) int {
		d := doors()
		plain := slices.Contains(argv, "--plain")
		exe, why := "", ""
		if !plain && !dry {
			var fault error
			if exe, why, fault = tuiViewerOf(d); fault != nil {
				fmt.Fprintln(errs, fault)
				return exitFailed
			}
		}
		if why != "" {
			fmt.Fprintln(errs, why)
		}
		session := filepath.Join(filepath.FromSlash(d.root), filepath.FromSlash(sessionLog))
		if exe != "" {
			return tuiOpens(d, exe, session, tuiTabWanted(argv), out, errs)
		}
		return tuiPlainRows(d, argv, session, plain, out, errs)
	}
}

// The tab the words past the verb name, after --tab or alone, and none where they name no tab. [[spec/design_output/tui#a-tab-the-caller-names]]
func tuiTabWanted(argv []string) string {
	words := argv[min(1, len(argv)):]
	said := ""
	if at := slices.Index(words, "--tab"); at >= 0 {
		if at+1 < len(words) {
			said = words[at+1]
		}
	} else if found := slices.IndexFunc(words, func(one string) bool { return slices.Contains(tuiTabs, one) }); found >= 0 {
		said = words[found]
	}
	if slices.Contains(tuiTabs, said) {
		return said
	}
	return ""
}

// Hands the tab to a window already standing, or launches the viewer holding the terminal. [[spec/design_output/tui#a-second-launch-hands-over]]
func tuiOpens(d tuiDoors, exe, session, tab string, out, errs io.Writer) int {
	if err := d.disk.makeAll(filepath.Join(filepath.FromSlash(d.root), filepath.FromSlash(tuiLogFolder)), tuiFolderMode); err != nil {
		fmt.Fprintln(errs, err)
		return exitFailed
	}
	asked := tab
	if asked == "" {
		asked = tuiTabs[0]
	}
	if d.tell(asked) {
		fmt.Fprintf(out, "A window already stands, and it opens the %s tab.\n", asked)
		return 0
	}
	call := []string{exe}
	if tab != "" {
		call = append(call, "--tab", tab)
	}
	code, err := d.launch(append(call, session), d.root, out, errs)
	if err != nil {
		fmt.Fprintln(errs, err)
		return exitFailed
	}
	return code
}

// Prints each log file's name and its rows, and asks for Go where the plain flag stands not. [[spec/design_output/tui#the-verb-builds-it]]
func tuiPlainRows(d tuiDoors, argv []string, session string, plain bool, out, errs io.Writer) int {
	var read []string
	if slices.Contains(argv, "--all") {
		read = logFiles(d.disk, filepath.FromSlash(d.root), "", time.Time{})
	} else if d.disk.stands(session) {
		read = []string{session}
	}
	if len(read) == 0 {
		fmt.Fprintln(out, tuiNoLog)
		return 0
	}
	for _, path := range read {
		body, err := d.disk.read(path)
		if err != nil {
			fmt.Fprintln(errs, err)
			return exitFailed
		}
		fmt.Fprintln(out, tuiShow(d.root, path))
		for _, row := range tuiRowsIn(string(body)) {
			fmt.Fprintln(out, row)
		}
	}
	if !plain {
		fmt.Fprintln(out)
		fmt.Fprintln(out, tuiNeedsGo)
	}
	return 0
}

// A path as the reader names it, under the root. [[spec/design_output/log#one-verb-reads-the-log]]
func tuiShow(root, path string) string {
	said := strings.ReplaceAll(path, "\\", "/")
	base := strings.TrimRight(strings.ReplaceAll(root, "\\", "/"), "/")
	if said == base {
		return ""
	}
	return strings.TrimPrefix(said, base+"/")
}

// The viewer's binary, built whenever the source its stamp hashes moves, and why where none runs. A build that lands and swaps not in answers a fault, since the box holds Go. [[spec/tickets/tui-swap-fails-loud]]
func tuiViewerOf(d tuiDoors) (string, string, error) {
	exe := d.root + "/" + tuiBin + "/logview"
	if d.windows {
		exe += ".exe"
	}
	stamp := d.root + "/" + tuiStamp
	hash := index.HashText(tuiSourceText(d.disk, d.root))
	if held, err := d.disk.read(stamp); err == nil && d.disk.stands(exe) && strings.TrimSpace(string(held)) == hash {
		return exe, "", nil
	}
	// A running binary holds its file on Windows and renames alone, so the build lands beside it and swaps in. [[spec/design_output/tui#the-verb-builds-it]]
	fresh := exe + ".new"
	code, stderr, err := d.run([]string{d.goTool, "build", "-o", fresh, "./" + tuiSource}, d.root)
	if err != nil {
		code, stderr = 1, err.Error()
	}
	if code == 0 && d.disk.stands(fresh) {
		if err := tuiSwapsIn(d.disk, fresh, exe); err != nil {
			return "", "", err
		}
		if err := d.disk.makeAll(d.root+"/"+tuiBin, tuiFolderMode); err != nil {
			return exe, err.Error(), nil
		}
		if err := d.disk.write(stamp, []byte(hash+"\n"), tuiStampMode); err != nil {
			return exe, err.Error(), nil
		}
		return exe, "", nil
	}
	why := strings.TrimSpace(stderr)
	if why == "" {
		why = "go builds no viewer here"
	}
	if d.disk.stands(exe) {
		return exe, "the build fails, so the last one runs: " + why, nil
	}
	return "", why, nil
}

// The old binary steps aside by rename, and the fresh one takes its name. [[spec/design_output/tui#the-verb-builds-it]]
func tuiSwapsIn(disk diskDoors, fresh, exe string) error {
	if disk.stands(exe) {
		if err := disk.rename(exe, tuiAsideOf(disk, exe+".old")); err != nil {
			return err
		}
	}
	return disk.rename(fresh, exe)
}

// The first name beside the binary that stands free or clears, because a window still running one stepped aside earlier holds that file on Windows. [[spec/design_output/tui#the-verb-builds-it]]
func tuiAsideOf(disk diskDoors, old string) string {
	for n := range tuiAside {
		at := old
		if n > 0 {
			at = fmt.Sprintf("%s%d", old, n)
		}
		if !disk.stands(at) || disk.remove(at) == nil {
			return at
		}
	}
	return old
}

// The text the stamp hashes: every source file's path and text under the viewer's packages and the module files, joined on the unit separator. [[spec/design_output/tui#the-packages-the-window-holds]]
func tuiSourceText(disk diskDoors, root string) string {
	var folders []string
	for _, one := range tuiGoFoldersOf(disk, root, tuiSource) {
		folders = append(folders, root+"/"+one)
	}
	for _, one := range tuiModuleFiles {
		folders = append(folders, root+"/"+one)
	}
	var parts []string
	for _, folder := range folders {
		for _, path := range tuiSourcesUnder(disk, folder) {
			parts = append(parts, path+tuiJoin+disk.text(path))
		}
	}
	return strings.Join(parts, tuiJoin)
}

// A package folder and every tree package it imports, to the end of the chain, a folder below another left out. [[spec/tickets/go-code-shares-one-module]]
func tuiGoFoldersOf(disk diskDoors, root, folder string) []string {
	seen := []string{folder}
	for queue := []string{folder}; len(queue) > 0; queue = queue[1:] {
		for _, next := range tuiImportsOf(disk, root+"/"+queue[0]) {
			if !slices.Contains(seen, next) {
				seen = append(seen, next)
				queue = append(queue, next)
			}
		}
	}
	var kept []string
	for _, one := range seen {
		if !slices.ContainsFunc(seen, func(other string) bool { return strings.HasPrefix(one, other+"/") }) {
			kept = append(kept, one)
		}
	}
	if len(kept) == 0 {
		return kept
	}
	rest := slices.Clone(kept[1:])
	sort.Strings(rest)
	return append(kept[:1], rest...)
}

// The tree packages a folder's own Go files import, the folders below it read too. [[spec/tickets/go-code-shares-one-module]]
func tuiImportsOf(disk diskDoors, at string) []string {
	entries, err := disk.list(at)
	if err != nil {
		return nil
	}
	var out []string
	for _, one := range entries {
		path := at + "/" + one.Name()
		if one.IsDir() {
			out = append(out, tuiImportsOf(disk, path)...)
		} else if strings.HasSuffix(one.Name(), ".go") && !strings.HasSuffix(one.Name(), "_test.go") {
			for _, found := range tuiImport.FindAllStringSubmatch(disk.text(path), -1) {
				out = append(out, found[1])
			}
		}
	}
	return out
}

// Every source file under a folder and its packages, in the order localeCompare walks them, so a move under a tab's folder rebuilds the viewer. [[spec/design_output/tui#the-packages-the-window-holds]]
func tuiSourcesUnder(disk diskDoors, folder string) []string {
	if !disk.stands(folder) {
		return nil
	}
	if strings.HasSuffix(folder, "/go.mod") || strings.HasSuffix(folder, "/go.sum") {
		return []string{folder}
	}
	entries := disk.listed(folder)
	slices.SortFunc(entries, func(one, other fs.DirEntry) int { return tuiCollate(one.Name(), other.Name()) })
	var out []string
	for _, one := range entries {
		name := one.Name()
		switch {
		case one.IsDir():
			out = append(out, tuiSourcesUnder(disk, folder+"/"+name)...)
		case one.Type().IsRegular() && !strings.HasSuffix(name, "_test.go") &&
			(strings.HasSuffix(name, ".go") || strings.HasSuffix(name, ".mod") || strings.HasSuffix(name, ".sum")):
			out = append(out, folder+"/"+name)
		}
	}
	return out
}

// The punctuation in the order the root collation sorts it, before the digits and the letters. [[spec/design_output/tui#the-verb-builds-it]]
const tuiPunctuation = "_-,;:!?.'\"()[]{}@*/\\&#%`^+<=>|~$"

// The weight each class of rune starts at in that collation: the digits, the letters in either case, and any other rune past them. [[spec/design_output/tui#the-verb-builds-it]]
const (
	tuiDigitWeight  = 100
	tuiLetterWeight = 200
	tuiOtherWeight  = 1000
)

// Orders two names as localeCompare in Node does for the names a source folder holds: punctuation, then digits, then letters in any case, and lower case first on a tie. [[spec/design_output/tui#the-verb-builds-it]]
func tuiCollate(one, other string) int {
	weight := func(r rune) int {
		switch {
		case strings.ContainsRune(tuiPunctuation, r):
			return 1 + strings.IndexRune(tuiPunctuation, r)
		case r >= '0' && r <= '9':
			return tuiDigitWeight + int(r-'0')
		case r >= 'a' && r <= 'z':
			return tuiLetterWeight + int(r-'a')
		case r >= 'A' && r <= 'Z':
			return tuiLetterWeight + int(r-'A')
		}
		return tuiOtherWeight + int(r)
	}
	left, right := []rune(one), []rune(other)
	for at := 0; at < min(len(left), len(right)); at++ {
		if said := weight(left[at]) - weight(right[at]); said != 0 {
			return said
		}
	}
	if said := len(left) - len(right); said != 0 {
		return said
	}
	for at := range left {
		lower, upper := left[at] >= 'a' && left[at] <= 'z', left[at] >= 'A' && left[at] <= 'Z'
		if left[at] != right[at] && (lower || upper) {
			if lower {
				return -1
			}
			return 1
		}
	}
	return strings.Compare(one, other)
}

// The real doors: the tree's root, the go program the tools file names, a captured run, a launch holding the caller's terminal, and the tell to the window's port. [[spec/design_output/tui#the-verb-builds-it]]
func tuiReal() tuiDoors {
	root, err := index.Root()
	if err != nil {
		root = "."
	}
	root = filepath.ToSlash(root)
	box := quietBox()
	return tuiDoors{
		root:    root,
		windows: box.windows(),
		goTool:  tuiGoOf(box.disk, root),
		run:     serveRuns,
		launch:  tuiLaunch,
		tell:    tuiTellAt(frame.WindowPort),
		disk:    box.disk,
	}
}

// The go program the tools file names, else one under the binaries' folder, else go off the path. [[spec/design_output/tui#the-verb-builds-it]]
func tuiGoOf(disk diskDoors, root string) string {
	var known map[string]struct {
		Path string `json:"path"`
	}
	if body, err := disk.read(filepath.Join(root, filepath.FromSlash(brief.ToolsFile))); err == nil && json.Unmarshal(body, &known) == nil {
		if said := known["go"].Path; said != "" && disk.stands(said) {
			return said
		}
	}
	for _, guess := range []string{tuiBin + "/go.exe", tuiBin + "/go"} {
		if at := root + "/" + guess; disk.stands(at) {
			return at
		}
	}
	return "go"
}

// Runs the viewer on the caller's terminal over the real process door. [[spec/design_output/tui#the-verb-builds-it]]
func tuiLaunch(argv []string, cwd string, out, errs io.Writer) (int, error) {
	return tuiLaunchOver(proc.Real, realBoxDoors(out, errs).input)(argv, cwd, out, errs)
}

// Runs the viewer through the process door on the input it hands through and the caller's output and error streams, which pass straight through where they are files. A signal's end reads as 1. [[spec/tickets/quack-spawns-all-take-the-runner]]
func tuiLaunchOver(run proc.Runner, in io.Reader) func(argv []string, cwd string, out, errs io.Writer) (int, error) {
	return func(argv []string, cwd string, out, errs io.Writer) (int, error) {
		said := run(proc.Command{Argv: argv, Dir: cwd, Streams: &proc.Streams{In: in, Out: out, Err: errs}})
		switch said.Code {
		case proc.Signalled:
			return 1, nil
		case proc.NotStarted:
			return 0, errors.New(said.Err)
		}
		return said.Code, nil
	}
}

// The tell to whatever window stands on a port, which answers whether it took the tab. [[spec/design_output/tui#a-second-launch-hands-over]]
func tuiTellAt(port int) func(tab string) bool {
	return func(tab string) bool { return frame.TellPort(wall, port, tab) }
}
