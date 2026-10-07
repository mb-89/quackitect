// The fix verb: the fixes a program can make, over the paths or the tree.
// Each round applies the Go rules' swaps and calms the shouted leads they
// name, until a round changes nothing; biome writes its fixes last.
// [[spec/tickets/the-small-faults-land]] [[spec/tickets/vale-leaves-the-tree]]
package main

import (
	"encoding/json"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"runtime"
	"slices"
	"strings"
	"unicode"

	"quackitect/src/index"
	"quackitect/src/modules/check"
	"quackitect/src/proc"
	"quackitect/src/rules"
)

// The usage, the rounds the rules fix at most, biome's config folder, the rule the calm reads, the action its rows carry and the mode a fixed file keeps. [[spec/tickets/the-small-faults-land]]
const (
	fixUsage    = "Usage: ./RUNME.sh fix [path ...], over the paths or the tree."
	fixRounds   = 5
	biomeFolder = "spec/config"
	shoutedLead = "ShoutedLead"
	calmedMode  = 0o644
)

// The flags that ask for the usage. [[spec/tickets/the-small-faults-land]]
var fixHelp = []string{"--help", "-h"}

// The folders the fix's walk passes, as SKIP in src/bridge/findings.js names them; proseFile in writedoor.go names the files it reads. [[spec/design_output/level0#the-fixer-calms-a-shout]]
var walkSkips = map[string]bool{".git": true, "node_modules": true, ".se": true, ".claude": true, ".claude-plugin": true}

// A tool run under a folder, writing to the streams, which answers its exit code. [[spec/tickets/config-verbs-port-to-go]]
type fixRunner func(dir string, out, errs io.Writer, argv ...string) int

func init() { register("fix", fixVerb(index.Root, toolRuns)) }

// fix over the root: the flags it knows, then the rounds of the rules over the paths, then biome. [[spec/tickets/the-small-faults-land]] [[spec/tickets/vale-leaves-the-tree]]
func fixVerb(root func() (string, error), run fixRunner) twin {
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
		set, err := rulesAt(at)
		if err != nil {
			fmt.Fprintln(errs, "The rules load nothing:", err)
			return exitFailed
		}
		if dry {
			return 0
		}
		for range fixRounds {
			changed, err := fixRound(at, set, paths, writeCalmed)
			if err != nil {
				fmt.Fprintln(errs, err)
				return exitFailed
			}
			if changed == 0 {
				break
			}
		}
		if biome := toolHere(at, "biome"); biome != "" {
			run(at, out, errs, append([]string{biome, "check", "--write", "--config-path=" + biomeFolder}, paths...)...)
		}
		fmt.Fprintln(out, "Run ./RUNME.sh lint to see what is left for a person.")
		return 0
	}
}

// The path the survey names for a tool where a file stands there, else the one in the runtime binary folder, else nothing. [[spec/design_output/tools#where-a-caller-looks]]
func toolHere(root, name string) string {
	var said map[string]struct {
		Path string `json:"path"`
	}
	if body, err := os.ReadFile(filepath.Join(root, filepath.FromSlash(check.ToolsAt))); err == nil && json.Unmarshal(body, &said) == nil {
		if at := said[name].Path; at != "" && standsHere(at) {
			return at
		}
	}
	guess := filepath.Join(root, filepath.FromSlash(check.Bin), name)
	if runtime.GOOS == "windows" {
		guess += ".exe"
	}
	if standsHere(guess) {
		return guess
	}
	return ""
}

func standsHere(path string) bool {
	_, err := os.Stat(path)
	return err == nil
}

// A tool run over the real process door, on the terminal's input. [[spec/tickets/the-small-faults-land]]
func toolRuns(dir string, out, errs io.Writer, argv ...string) int {
	return toolRunsOver(proc.Real, os.Stdin)(dir, out, errs, argv...)
}

// A tool run through the process door with the caller's streams and the input it hands through, answering its exit code, and exitFailed with the fault where it fails to start or a signal ends it. [[spec/tickets/quack-spawns-all-take-the-runner]]
func toolRunsOver(run proc.Runner, in io.Reader) fixRunner {
	return func(dir string, out, errs io.Writer, argv ...string) int {
		said := run(proc.Command{Argv: argv, Dir: dir, Streams: &proc.Streams{In: in, Out: out, Err: errs}})
		if said.Code < 0 {
			fmt.Fprintln(errs, said.Err)
			return exitFailed
		}
		return said.Code
	}
}

// One round of the rules over every prose file under the paths: each file's swaps and calms applied, and written where it changes. It answers how many files changed. [[spec/tickets/vale-leaves-the-tree]]
func fixRound(root string, set *rules.Set, paths []string, write func(string, []byte) error) (int, error) {
	changed := 0
	for _, path := range proseFilesUnder(root, paths) {
		was, err := os.ReadFile(path)
		if err != nil {
			continue
		}
		name := filepath.ToSlash(path)
		if rel, err := filepath.Rel(root, path); err == nil && !strings.HasPrefix(rel, "..") {
			name = filepath.ToSlash(rel)
		}
		found := set.Lint(name, string(was))
		now := rules.Apply(string(was), append(found, calm(found)...))
		if now == string(was) {
			continue
		}
		if err := write(path, []byte(now)); err != nil {
			return changed, fmt.Errorf("the fix writes no %s: %w", name, err)
		}
		changed++
	}
	return changed, nil
}

// The rules' shouted lead rows as swaps to sentence case, since the rule names that fix and carries none. [[spec/design_output/level0#the-fixer-calms-a-shout]]
func calm(found []rules.Finding) []rules.Finding {
	var out []rules.Finding
	for _, one := range found {
		if proseStyle.ReplaceAllString(one.Check, "") != shoutedLead || one.Match == "" {
			continue
		}
		one.Action = &rules.Action{Name: rules.ActionReplace, Params: []string{sentenceCase(one.Match)}}
		out = append(out, one)
	}
	return out
}

// Writes a fixed file over itself. [[spec/design_output/level0#the-fixer-calms-a-shout]]
func writeCalmed(path string, text []byte) error { return os.WriteFile(path, text, calmedMode) }

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

// Every prose file under the paths, past the skipped folders and every name opening on an underscore. [[spec/tickets/the-small-faults-land]]
func proseFilesUnder(root string, paths []string) []string {
	var out []string
	for _, one := range paths {
		base := one
		if !filepath.IsAbs(base) {
			base = filepath.Join(root, filepath.FromSlash(one))
		}
		_ = filepath.WalkDir(base, func(at string, entry os.DirEntry, err error) error {
			if err != nil {
				return nil
			}
			if at != base && (walkSkips[entry.Name()] || strings.HasPrefix(entry.Name(), "_")) {
				if entry.IsDir() {
					return filepath.SkipDir
				}
				return nil
			}
			if !entry.IsDir() && proseFile.MatchString(entry.Name()) {
				out = append(out, at)
			}
			return nil
		})
	}
	return out
}
