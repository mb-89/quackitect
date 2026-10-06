// quack tui: the window this tree builds, on the tab the caller names. A
// window already standing takes the tab over its own port and the second
// launch ends, so one window stands at a time. A tree carrying no Go prints
// the rows plain instead. The viewer build stamps its source as viewerOf in
// src/scripts/tui-build.js does, so the check and the verb share one stamp.
// [[spec/design_output/tui#the-verb-builds-it]]
package main

import (
	"bytes"
	"cmp"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"math"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"runtime"
	"slices"
	"sort"
	"strconv"
	"strings"
	"time"
	"unicode/utf16"

	"quackitect/src/index"
	"quackitect/src/modules/hooks/brief"
	"quackitect/src/tui/frame"
)

// The tabs a caller names, the first one a handover opens where none is named. [[spec/design_output/tui#a-tab-the-caller-names]]
var tuiTabs = []string{"log", "work"}

// The log's folders, as FOLDER and OLD in .claude/skills/level0/lib/log.js name them, and the lines the plain road prints. [[spec/design_output/log#one-verb-reads-the-log]]
const (
	tuiLogFolder = ".se/.log"
	tuiNoLog     = "No log stands yet. A writer starts one the next time it says a line."
	tuiNeedsGo   = "Go builds the viewer these rows open in. Install Go, and run this again."
)

// The viewer's source folder, the binaries' folder, the stamp beside the binary, the module files every stamp reads, the mark a key joins on, and the names an old binary tries. [[spec/design_output/tui#the-verb-builds-it]]
const (
	tuiSource = "src/tui"
	tuiBin    = ".se/.runtime/bin" // the runtime folder .claude/skills/level0/lib/folders.js owns
	tuiStamp  = tuiBin + "/.logview-source"
	tuiJoin   = "\x1f"
	tuiAside  = 9
)

// The module files each stamp reads beside its folders. [[spec/tickets/go-code-shares-one-module]]
var tuiModuleFiles = []string{"go.mod", "go.sum"}

// A tree import names a package folder under the root, as IMPORT in src/scripts/cli-go.js reads it. [[spec/tickets/go-code-shares-one-module]]
var tuiImport = regexp.MustCompile(`"quackitect/(src/[^"]+)"`)

// What the tui verb reaches: the root, the box's kind, the go program, a captured run, a launch holding the terminal, and the tell to a standing window. [[spec/design_output/tui#the-verb-builds-it]]
type tuiDoors struct {
	root    string
	windows bool
	goTool  string
	run     func(argv []string, cwd string) (int, string, error)
	launch  func(argv []string, cwd string, out, errs io.Writer) (int, error)
	tell    func(tab string) bool
}

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
	if err := os.MkdirAll(filepath.Join(filepath.FromSlash(d.root), filepath.FromSlash(tuiLogFolder)), 0o755); err != nil {
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
		read = logFiles(filepath.FromSlash(d.root), "", time.Time{})
	} else if tuiExists(session) {
		read = []string{session}
	}
	if len(read) == 0 {
		fmt.Fprintln(out, tuiNoLog)
		return 0
	}
	for _, path := range read {
		body, err := os.ReadFile(path)
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

// A path as the reader names it, under the root, as showOf in src/bridge/findings.js answers. [[spec/design_output/log#one-verb-reads-the-log]]
func tuiShow(root, path string) string {
	said := strings.ReplaceAll(path, "\\", "/")
	base := strings.TrimRight(strings.ReplaceAll(root, "\\", "/"), "/")
	if said == base {
		return ""
	}
	return strings.TrimPrefix(said, base+"/")
}

func tuiExists(path string) bool {
	_, err := os.Stat(path)
	return err == nil
}

// The viewer's binary, built whenever the source its stamp hashes moves, and why where none runs. A build that lands and swaps not in answers a fault, since the box holds Go. [[spec/tickets/tui-swap-fails-loud]]
func tuiViewerOf(d tuiDoors) (string, string, error) {
	exe := d.root + "/" + tuiBin + "/logview"
	if d.windows {
		exe += ".exe"
	}
	stamp := d.root + "/" + tuiStamp
	hash := index.HashText(tuiSourceText(d.root))
	if held, err := os.ReadFile(stamp); err == nil && tuiExists(exe) && strings.TrimSpace(string(held)) == hash {
		return exe, "", nil
	}
	// A running binary holds its file on Windows and renames alone, so the build lands beside it and swaps in. [[spec/design_output/tui#the-verb-builds-it]]
	fresh := exe + ".new"
	code, stderr, err := d.run([]string{d.goTool, "build", "-o", fresh, "./" + tuiSource}, d.root)
	if err != nil {
		code, stderr = 1, err.Error()
	}
	if code == 0 && tuiExists(fresh) {
		if err := tuiSwapsIn(fresh, exe); err != nil {
			return "", "", err
		}
		if err := os.MkdirAll(d.root+"/"+tuiBin, 0o755); err != nil {
			return exe, err.Error(), nil
		}
		if err := os.WriteFile(stamp, []byte(hash+"\n"), 0o644); err != nil {
			return exe, err.Error(), nil
		}
		return exe, "", nil
	}
	why := strings.TrimSpace(stderr)
	if why == "" {
		why = "go builds no viewer here"
	}
	if tuiExists(exe) {
		return exe, "the build fails, so the last one runs: " + why, nil
	}
	return "", why, nil
}

// The old binary steps aside by rename, and the fresh one takes its name. [[spec/design_output/tui#the-verb-builds-it]]
func tuiSwapsIn(fresh, exe string) error {
	if tuiExists(exe) {
		if err := os.Rename(exe, tuiAsideOf(exe+".old")); err != nil {
			return err
		}
	}
	return os.Rename(fresh, exe)
}

// The first name beside the binary that stands free or clears, because a window still running one stepped aside earlier holds that file on Windows. [[spec/design_output/tui#the-verb-builds-it]]
func tuiAsideOf(old string) string {
	for n := range tuiAside {
		at := old
		if n > 0 {
			at = fmt.Sprintf("%s%d", old, n)
		}
		if !tuiExists(at) || os.Remove(at) == nil {
			return at
		}
	}
	return old
}

// The text the stamp hashes: every source file's path and text under the viewer's packages and the module files, joined on the unit separator. [[spec/design_output/tui#the-packages-the-window-holds]]
func tuiSourceText(root string) string {
	var folders []string
	for _, one := range tuiGoFoldersOf(root, tuiSource) {
		folders = append(folders, root+"/"+one)
	}
	for _, one := range tuiModuleFiles {
		folders = append(folders, root+"/"+one)
	}
	var parts []string
	for _, folder := range folders {
		for _, path := range tuiSourcesUnder(folder) {
			body, _ := os.ReadFile(path)
			parts = append(parts, path+tuiJoin+string(body))
		}
	}
	return strings.Join(parts, tuiJoin)
}

// A package folder and every tree package it imports, to the end of the chain, a folder below another left out, as goFoldersOf in src/scripts/cli-go.js answers. [[spec/tickets/go-code-shares-one-module]]
func tuiGoFoldersOf(root, folder string) []string {
	seen := []string{folder}
	for queue := []string{folder}; len(queue) > 0; queue = queue[1:] {
		for _, next := range tuiImportsOf(root + "/" + queue[0]) {
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
func tuiImportsOf(at string) []string {
	entries, err := os.ReadDir(at)
	if err != nil {
		return nil
	}
	var out []string
	for _, one := range entries {
		path := at + "/" + one.Name()
		if one.IsDir() {
			out = append(out, tuiImportsOf(path)...)
		} else if strings.HasSuffix(one.Name(), ".go") && !strings.HasSuffix(one.Name(), "_test.go") {
			body, _ := os.ReadFile(path)
			for _, found := range tuiImport.FindAllStringSubmatch(string(body), -1) {
				out = append(out, found[1])
			}
		}
	}
	return out
}

// Every source file under a folder and its packages, in the order localeCompare walks them, so a move under a tab's folder rebuilds the viewer. [[spec/design_output/tui#the-packages-the-window-holds]]
func tuiSourcesUnder(folder string) []string {
	if !tuiExists(folder) {
		return nil
	}
	if strings.HasSuffix(folder, "/go.mod") || strings.HasSuffix(folder, "/go.sum") {
		return []string{folder}
	}
	entries, _ := os.ReadDir(folder)
	slices.SortFunc(entries, func(one, other os.DirEntry) int { return tuiCollate(one.Name(), other.Name()) })
	var out []string
	for _, one := range entries {
		name := one.Name()
		switch {
		case one.IsDir():
			out = append(out, tuiSourcesUnder(folder+"/"+name)...)
		case one.Type().IsRegular() && !strings.HasSuffix(name, "_test.go") &&
			(strings.HasSuffix(name, ".go") || strings.HasSuffix(name, ".mod") || strings.HasSuffix(name, ".sum")):
			out = append(out, folder+"/"+name)
		}
	}
	return out
}

// The punctuation in the order the root collation sorts it, before the digits and the letters. [[spec/design_output/tui#the-verb-builds-it]]
const tuiPunctuation = "_-,;:!?.'\"()[]{}@*/\\&#%`^+<=>|~$"

// Orders two names as localeCompare in Node does for the names a source folder holds: punctuation, then digits, then letters in any case, and lower case first on a tie. [[spec/design_output/tui#the-verb-builds-it]]
func tuiCollate(one, other string) int {
	weight := func(r rune) int {
		switch {
		case strings.ContainsRune(tuiPunctuation, r):
			return 1 + strings.IndexRune(tuiPunctuation, r)
		case r >= '0' && r <= '9':
			return 100 + int(r-'0')
		case r >= 'a' && r <= 'z':
			return 200 + int(r-'a')
		case r >= 'A' && r <= 'Z':
			return 200 + int(r-'A')
		}
		return 1000 + int(r)
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

// The fields asRow in .claude/skills/level0/lib/log.js prints first, its column widths, and the indent of the rest. [[spec/design_output/log#what-one-line-looks-like]]
const (
	tuiStampFrom  = 11
	tuiStampTo    = 23
	tuiLevelWidth = 5
	tuiKindWidth  = 6
	tuiIndent     = tuiStampTo - tuiStampFrom + 1
)

var tuiOwnFields = []string{"at", "level", "kind", "said"}

// A JSON object with its keys in the order JavaScript enumerates them. [[spec/design_output/log#what-one-line-looks-like]]
type tuiObject struct {
	keys []string
	vals map[string]any
}

// The value a missing field reads as. [[spec/design_output/log#what-one-line-looks-like]]
type tuiUndefined struct{}

// Each row a log text holds, printed as asRow prints it. A torn line drops alone, and the rows around it stand. [[spec/design_output/log#every-writer-appends]]
func tuiRowsIn(text string) []string {
	var out []string
	for _, line := range strings.Split(text, "\n") {
		if strings.TrimSpace(line) == "" || !json.Valid([]byte(line)) {
			continue
		}
		dec := json.NewDecoder(bytes.NewReader([]byte(line)))
		dec.UseNumber()
		row, err := tuiParse(dec)
		if err != nil || row == nil {
			continue
		}
		out = append(out, tuiAsRow(row))
	}
	return out
}

// One JSON value, an object keeping its key order. [[spec/design_output/log#what-one-line-looks-like]]
func tuiParse(dec *json.Decoder) (any, error) {
	tok, err := dec.Token()
	if err != nil {
		return nil, err
	}
	switch tok {
	case json.Delim('{'):
		obj := &tuiObject{vals: map[string]any{}}
		for dec.More() {
			key, err := dec.Token()
			if err != nil {
				return nil, err
			}
			value, err := tuiParse(dec)
			if err != nil {
				return nil, err
			}
			name := key.(string)
			if _, held := obj.vals[name]; !held {
				obj.keys = append(obj.keys, name)
			}
			obj.vals[name] = value
		}
		_, err := dec.Token()
		return obj, err
	case json.Delim('['):
		list := []any{}
		for dec.More() {
			value, err := tuiParse(dec)
			if err != nil {
				return nil, err
			}
			list = append(list, value)
		}
		_, err := dec.Token()
		return list, err
	}
	return tok, nil
}

// One row as asRow prints it: the time, the level, the kind and the line, and every other field below. [[spec/design_output/log#what-one-line-looks-like]]
func tuiAsRow(row any) string {
	keys, field := tuiEntries(row)
	said := fmt.Sprintf("%s %s %s %s",
		tuiSlice(tuiString(field("at")), tuiStampFrom, tuiStampTo),
		tuiPad(tuiString(field("level")), tuiLevelWidth),
		tuiPad(tuiString(field("kind")), tuiKindWidth),
		tuiString(field("said")))
	var rest []string
	for _, key := range keys {
		if !slices.Contains(tuiOwnFields, key) {
			rest = append(rest, key+"="+tuiString(field(key)))
		}
	}
	if len(rest) == 0 {
		return said
	}
	return said + "\n" + strings.Repeat(" ", tuiIndent) + strings.Join(rest, " ")
}

// The keys Object.entries walks, integer keys first, and a field's value, undefined where none stands. [[spec/design_output/log#what-one-line-looks-like]]
func tuiEntries(row any) ([]string, func(string) any) {
	switch one := row.(type) {
	case *tuiObject:
		var numbered, named []string
		for _, key := range one.keys {
			if tuiIndexKey(key) {
				numbered = append(numbered, key)
			} else {
				named = append(named, key)
			}
		}
		slices.SortFunc(numbered, func(a, b string) int {
			left, _ := strconv.ParseUint(a, 10, 64)
			right, _ := strconv.ParseUint(b, 10, 64)
			return cmp.Compare(left, right)
		})
		return append(numbered, named...), func(key string) any {
			if value, held := one.vals[key]; held {
				return value
			}
			return tuiUndefined{}
		}
	case []any:
		keys := make([]string, len(one))
		for at := range one {
			keys[at] = strconv.Itoa(at)
		}
		return keys, func(key string) any {
			if at, err := strconv.Atoi(key); err == nil && at >= 0 && at < len(one) && tuiIndexKey(key) {
				return one[at]
			}
			return tuiUndefined{}
		}
	}
	return nil, func(string) any { return tuiUndefined{} }
}

// Whether a key is an array index, which JavaScript enumerates first and in number order. [[spec/design_output/log#what-one-line-looks-like]]
func tuiIndexKey(key string) bool {
	at, err := strconv.ParseUint(key, 10, 64)
	return err == nil && at < math.MaxUint32 && strconv.FormatUint(at, 10) == key
}

// A value as String in JavaScript prints it. [[spec/design_output/log#what-one-line-looks-like]]
func tuiString(value any) string {
	switch one := value.(type) {
	case tuiUndefined:
		return "undefined"
	case nil:
		return "null"
	case string:
		return one
	case bool:
		return strconv.FormatBool(one)
	case json.Number:
		number, _ := strconv.ParseFloat(one.String(), 64)
		return tuiJSNumber(number)
	case []any:
		parts := make([]string, len(one))
		for at, item := range one {
			if item != nil {
				parts[at] = tuiString(item)
			}
		}
		return strings.Join(parts, ",")
	}
	return "[object Object]"
}

// A number as JavaScript prints it: plain between a millionth and 1e21, and in exponent form past them. [[spec/design_output/log#what-one-line-looks-like]]
func tuiJSNumber(number float64) string {
	switch {
	case math.IsNaN(number):
		return "NaN"
	case math.IsInf(number, 1):
		return "Infinity"
	case math.IsInf(number, -1):
		return "-Infinity"
	case number == 0:
		return "0"
	}
	if size := math.Abs(number); size >= 1e-6 && size < 1e21 {
		return strconv.FormatFloat(number, 'f', -1, 64)
	}
	mantissa, power, _ := strings.Cut(strconv.FormatFloat(number, 'e', -1, 64), "e")
	sign, digits := power[:1], strings.TrimLeft(power[1:], "0")
	return mantissa + "e" + sign + digits
}

// A text's UTF-16 units from one place to another, as slice in JavaScript cuts it. [[spec/design_output/log#what-one-line-looks-like]]
func tuiSlice(text string, from, to int) string {
	units := utf16.Encode([]rune(text))
	from, to = min(from, len(units)), min(to, len(units))
	return string(utf16.Decode(units[from:to]))
}

// A text padded with spaces to a width counted in UTF-16 units, as padEnd pads it. [[spec/design_output/log#what-one-line-looks-like]]
func tuiPad(text string, width int) string {
	if short := width - len(utf16.Encode([]rune(text))); short > 0 {
		return text + strings.Repeat(" ", short)
	}
	return text
}

// The real doors: the tree's root, the go program the tools file names, a captured run, a launch holding the caller's terminal, and the tell to the window's port. [[spec/design_output/tui#the-verb-builds-it]]
func tuiReal() tuiDoors {
	root, err := index.Root()
	if err != nil {
		root = "."
	}
	root = filepath.ToSlash(root)
	return tuiDoors{
		root:    root,
		windows: runtime.GOOS == "windows",
		goTool:  tuiGoOf(root),
		run:     serveRuns,
		launch:  tuiLaunch,
		tell:    tuiTellAt(frame.WindowPort),
	}
}

// The go program the tools file names, else one under the binaries' folder, else go off the path, as whereIs in src/engine/tools.js answers. [[spec/design_output/tui#the-verb-builds-it]]
func tuiGoOf(root string) string {
	var known map[string]struct {
		Path string `json:"path"`
	}
	if body, err := os.ReadFile(filepath.Join(root, filepath.FromSlash(brief.ToolsFile))); err == nil && json.Unmarshal(body, &known) == nil {
		if said := known["go"].Path; said != "" && tuiExists(said) {
			return said
		}
	}
	for _, guess := range []string{tuiBin + "/go.exe", tuiBin + "/go"} {
		if at := root + "/" + guess; tuiExists(at) {
			return at
		}
	}
	return "go"
}

// Runs the viewer on the caller's terminal: its input, and its output and error streams, which pass straight through where they are files. [[spec/design_output/tui#the-verb-builds-it]]
func tuiLaunch(argv []string, cwd string, out, errs io.Writer) (int, error) {
	cmd := exec.Command(argv[0], argv[1:]...)
	cmd.Dir = cwd
	cmd.Stdin, cmd.Stdout, cmd.Stderr = os.Stdin, out, errs
	err := cmd.Run()
	var exit *exec.ExitError
	if errors.As(err, &exit) {
		if code := exit.ExitCode(); code >= 0 {
			return code, nil
		}
		return 1, nil
	}
	return 0, err
}

// The tell to whatever window stands on a port, which answers whether it took the tab. [[spec/design_output/tui#a-second-launch-hands-over]]
func tuiTellAt(port int) func(tab string) bool {
	return func(tab string) bool { return frame.TellPort(wall, port, tab) }
}
