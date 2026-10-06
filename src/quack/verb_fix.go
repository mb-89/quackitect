// The fix verb: the fixes a program can make, over the paths or the tree.
// Each round calms the shouted leads Vale names, then lets Vale fix the rest,
// until a round changes nothing; biome writes its fixes last.
// [[spec/tickets/the-small-faults-land]]
package main

import (
	"crypto/sha256"
	"encoding/json"
	"fmt"
	"io"
	"io/fs"
	"path/filepath"
	"regexp"
	"runtime"
	"slices"
	"sort"
	"strings"
	"unicode"

	"quackitect/src/index"
	"quackitect/src/modules/check"
)

// The glob Vale reads past, as OURS in src/bridge/findings.js names it. [[spec/design_output/lsp]]
const valeParked = "--glob=!{{.se,node_modules,.git,.claude/types,.claude/worktrees}/**,**/_*}"

// The usage, the rounds Vale fixes at most, Vale's config, biome's config folder, the rule the calm reads and the mode a calmed file keeps. [[spec/tickets/the-small-faults-land]]
const (
	fixUsage    = "Usage: ./RUNME.sh fix [path ...], over the paths or the tree."
	fixRounds   = 5
	valeIni     = ".vale.ini"
	biomeFolder = "spec/config"
	shoutedLead = "ShoutedLead"
	calmedMode  = 0o644
)

// The flags that ask for the usage. [[spec/tickets/the-small-faults-land]]
var fixHelp = []string{"--help", "-h"}

// The folders the stamp's walk passes, as SKIP in src/bridge/findings.js names them; proseFile in writedoor.go names the files it reads. [[spec/design_output/level0#the-fixer-calms-a-shout]]
var (
	walkSkips   = map[string]bool{".git": true, "node_modules": true, ".se": true, ".claude": true, ".claude-plugin": true}
	proseStyles = regexp.MustCompile(`^Voice(Vale|Paragraph)\.`)
)

// A tool run under a folder, writing to the streams, which answers its exit code. [[spec/tickets/config-verbs-port-to-go]]
type fixRunner func(dir string, out, errs io.Writer, argv ...string) int

func init() { register("fix", fixVerb(index.Root, toolRuns, realDisk())) }

// fix over the root: the flags it knows, then the rounds over the paths, then biome. [[spec/tickets/the-small-faults-land]]
func fixVerb(root func() (string, error), run fixRunner, disk diskDoors) twin {
	return func(argv []string, dry bool, out, errs io.Writer) int {
		var paths, unknown []string
		help := false
		for _, one := range argv[1:] {
			switch {
			case slices.Contains(fixHelp, one):
				help = true
			case strings.HasPrefix(one, "-"):
				unknown = append(unknown, one)
			default:
				paths = append(paths, one)
			}
		}
		if help {
			fmt.Fprintln(out, fixUsage)
			return 0
		}
		if len(unknown) > 0 {
			fmt.Fprintf(errs, "fix knows no flag %s. %s\n", strings.Join(unknown, ", "), fixUsage)
			return exitUsage
		}
		if len(paths) == 0 {
			paths = []string{"."}
		}
		at, err := root()
		if err != nil {
			fmt.Fprintln(errs, err)
			return exitFailed
		}
		vale := toolHere(disk, at, "vale")
		if vale == "" {
			fmt.Fprintln(errs, "Vale is missing. Run ./RUNME.sh once and it installs.")
			return exitUsage
		}
		if dry {
			return 0
		}
		for range fixRounds {
			was := stampOf(disk, at, paths)
			if err := calm(at, vale, paths, run, disk); err != nil {
				fmt.Fprintln(errs, err)
				return exitFailed
			}
			run(at, out, errs, append([]string{vale, "fix", "--apply", "--config=" + valeIni, valeParked}, paths...)...)
			if stampOf(disk, at, paths) == was {
				break
			}
		}
		if biome := toolHere(disk, at, "biome"); biome != "" {
			run(at, out, errs, append([]string{biome, "check", "--write", "--config-path=" + biomeFolder}, paths...)...)
		}
		fmt.Fprintln(out, "Run ./RUNME.sh lint to see what is left for a person.")
		return 0
	}
}

// The path the survey names for a tool where a file stands there, else the one in the runtime binary folder, else nothing. [[spec/design_output/tools#where-a-caller-looks]]
func toolHere(disk diskDoors, root, name string) string {
	var said map[string]struct {
		Path string `json:"path"`
	}
	if body, err := disk.read(filepath.Join(root, filepath.FromSlash(check.ToolsAt))); err == nil && json.Unmarshal(body, &said) == nil {
		if at := said[name].Path; at != "" && disk.stands(at) {
			return at
		}
	}
	guess := filepath.Join(root, filepath.FromSlash(check.Bin), name)
	if runtime.GOOS == "windows" {
		guess += ".exe"
	}
	if disk.stands(guess) {
		return guess
	}
	return ""
}

// A tool run writing to the caller's streams, answering its exit code. [[spec/tickets/the-small-faults-land]]
func toolRuns(dir string, out, errs io.Writer, argv ...string) int {
	ran := realRun(out, errs)(argv, runOpts{cwd: dir, inherit: true})
	if ran.fault != "" {
		fmt.Fprintln(errs, ran.fault)
	}
	return ran.code
}

// One row of Vale's JSON the calm reads. [[spec/design_output/level0#the-fixer-calms-a-shout]]
type valeRow struct {
	Check string
	Line  int
	Span  []int
	Match string
}

// Sentence-cases every shouted lead Vale names over the paths, since Vale reports that fix and applies none. [[spec/design_output/level0#the-fixer-calms-a-shout]]
func calm(root, vale string, paths []string, run fixRunner, disk diskDoors) error {
	var said strings.Builder
	run(root, &said, io.Discard, append([]string{vale, "--config=" + valeIni, "--output=JSON", "--no-exit", valeParked}, paths...)...)
	var read map[string][]valeRow
	if json.Unmarshal([]byte(said.String()), &read) != nil {
		return nil
	}
	for file, rows := range read {
		var shouts []valeRow
		for _, one := range rows {
			if proseStyles.ReplaceAllString(one.Check, "") == shoutedLead && one.Match != "" {
				shouts = append(shouts, one)
			}
		}
		if len(shouts) == 0 {
			continue
		}
		path := file
		if !filepath.IsAbs(path) {
			path = filepath.Join(root, filepath.FromSlash(file))
		}
		was, err := disk.read(path)
		if err != nil {
			continue
		}
		if now := calmed(string(was), shouts); now != string(was) {
			if err := disk.write(path, []byte(now), calmedMode); err != nil {
				return fmt.Errorf("the calm writes no %s: %w", file, err)
			}
		}
	}
	return nil
}

// The text with each shout sentence-cased where it stands at its line and column, the last first, so an earlier span keeps its column. [[spec/design_output/level0#the-fixer-calms-a-shout]]
func calmed(text string, shouts []valeRow) string {
	sort.SliceStable(shouts, func(i, j int) bool {
		if shouts[i].Line != shouts[j].Line {
			return shouts[i].Line > shouts[j].Line
		}
		return columnOf(shouts[i]) > columnOf(shouts[j])
	})
	lines := strings.SplitAfter(text, "\n")
	for _, one := range shouts {
		if one.Line < 1 || one.Line > len(lines) {
			continue
		}
		line := []rune(lines[one.Line-1])
		from, match := columnOf(one)-1, []rune(one.Match)
		if from < 0 || from+len(match) > len(line) || string(line[from:from+len(match)]) != one.Match {
			continue
		}
		lines[one.Line-1] = string(line[:from]) + sentenceCase(one.Match) + string(line[from+len(match):])
	}
	return strings.Join(lines, "")
}

func columnOf(one valeRow) int {
	if len(one.Span) == 0 {
		return 1
	}
	return one.Span[0]
}

// The first letter upper and every character after it lower. [[spec/design_output/level0#the-fixer-calms-a-shout]]
func sentenceCase(said string) string {
	first := strings.IndexFunc(said, unicode.IsLetter)
	if first < 0 {
		return said
	}
	letter := []rune(said[first:])[0]
	rest := said[first+len(string(letter)):]
	return said[:first] + string(unicode.ToUpper(letter)) + strings.ToLower(rest)
}

// What every prose file under the paths holds, so a round that changes nothing reads the same stamp. [[spec/tickets/the-small-faults-land]]
func stampOf(disk diskDoors, root string, paths []string) string {
	sum := sha256.New()
	for _, one := range paths {
		base := filepath.Join(root, filepath.FromSlash(one))
		if said, err := disk.stat(base); err == nil {
			stampInto(sum, disk, base, fs.FileInfoToDirEntry(said), true)
		}
	}
	return fmt.Sprintf("%x", sum.Sum(nil))
}

// Writes each prose file under the entry into the stamp, past the folders the walk skips, in the order the disk lists them. [[spec/tickets/the-small-faults-land]]
func stampInto(sum io.Writer, disk diskDoors, at string, entry fs.DirEntry, base bool) {
	if !base && (walkSkips[entry.Name()] || strings.HasPrefix(entry.Name(), "_")) {
		return
	}
	if !entry.IsDir() {
		if proseFile.MatchString(entry.Name()) {
			fmt.Fprintf(sum, "%s\x00%s\x00", at, disk.text(at))
		}
		return
	}
	for _, one := range disk.listed(at) {
		stampInto(sum, disk, filepath.Join(at, one.Name()), one, false)
	}
}
