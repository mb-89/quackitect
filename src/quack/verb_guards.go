// The guards verb: each guard over the tracked tree, against its baseline.
// [[spec/design_output/model#the-guards-hold-a-baseline]]
package main

import (
	"fmt"
	"io"
	"os"
	"path/filepath"
	"slices"
	"strings"

	"quackitect/src/imports"
	"quackitect/src/index"
)

// The word that writes each baseline again. [[spec/design_output/model#the-guards-hold-a-baseline]]
const updateFlag = "--update"

func init() { register("guards", guardsVerb(index.Root)) }

// guards over the root: every guard over the tracked tree against its baseline, or each baseline written again on --update. [[spec/design_output/model#the-guards-hold-a-baseline]]
func guardsVerb(root func() (string, error)) twin {
	// Impure: it reads the tracked tree and writes the baselines on the disk.
	return func(argv []string, _ bool, out, errs io.Writer) int {
		at, err := root()
		if err != nil {
			fmt.Fprintln(errs, err)
			return exitFailed
		}
		tracked := strings.Split(gitRead(at, "ls-files", "--cached"), "\n")
		disk := rootDisk{at}
		read := func(path string) string {
			text, _ := disk.Read(path)
			return text
		}
		if slices.Contains(argv, updateFlag) {
			for path, text := range baselinesOf(imports.Guards, tracked, read) {
				if err := os.MkdirAll(filepath.Dir(disk.at(path)), 0o755); err != nil {
					fmt.Fprintln(errs, err)
					return exitFailed
				}
				if err := os.WriteFile(disk.at(path), []byte(text), 0o644); err != nil {
					fmt.Fprintln(errs, err)
					return exitFailed
				}
				fmt.Fprintf(out, "%s stands written.\n", path)
			}
			return 0
		}
		lines, code := guardsSaid(imports.Guards, tracked, read)
		for _, line := range lines {
			fmt.Fprintln(out, line)
		}
		return code
	}
}

// The lines the guards print, and the code they answer, over the tracked files and a reader of the tree. [[spec/design_output/model#the-guards-hold-a-baseline]]
func guardsSaid(guards []imports.Guard, tracked []string, read func(path string) string) ([]string, int) {
	lines := []string{}
	code := 0
	for _, guard := range guards {
		named := guard.Names(tracked, read)
		verdict := imports.Compare(linesOf(read(imports.BaselineOf(guard.Name))), named)
		if !guard.Refuses {
			lines = append(lines, reported(guard, named)...)
		}
		for _, one := range verdict.New {
			lines = append(lines, fmt.Sprintf("%s: new %s", guard.Name, one))
		}
		for _, one := range verdict.Stale {
			lines = append(lines, fmt.Sprintf("%s: stale %s", guard.Name, one))
		}
		if guard.Refuses && len(verdict.New)+len(verdict.Stale) > 0 {
			code = exitFailed
		}
		lines = append(lines, fmt.Sprintf("%s: %d new, %d stale, in %s mode.", guard.Name, len(verdict.New), len(verdict.Stale), guardModeOf(guard)))
	}
	return lines, code
}

// Each baseline written again: what the guard names in report mode, and the old lines short of the stale ones in refuse mode. [[spec/design_output/model#the-guards-hold-a-baseline]]
func baselinesOf(guards []imports.Guard, tracked []string, read func(path string) string) map[string]string {
	out := map[string]string{}
	for _, guard := range guards {
		baseline := linesOf(read(imports.BaselineOf(guard.Name)))
		named := guard.Names(tracked, read)
		kept := slices.Clone(named)
		if guard.Refuses {
			stale := imports.Compare(baseline, named).Stale
			kept = slices.DeleteFunc(slices.Clone(baseline), func(line string) bool { return slices.Contains(stale, line) })
		}
		slices.Sort(kept)
		text := strings.Join(kept, "\n")
		if text != "" {
			text += "\n"
		}
		out[imports.BaselineOf(guard.Name)] = text
	}
	return out
}

// The lines a baseline holds, short of the empty ones. [[spec/design_output/model#the-guards-hold-a-baseline]]
func linesOf(text string) []string {
	return slices.DeleteFunc(strings.Split(text, "\n"), func(line string) bool { return strings.TrimSpace(line) == "" })
}

// What a report prints of a guard's offenders: each one whole where the guard names no package, or the count per package. [[spec/design_output/model#the-guards-hold-a-baseline]]
func reported(guard imports.Guard, named []string) []string {
	if guard.PackageOf == nil {
		lines := []string{}
		for _, one := range named {
			lines = append(lines, fmt.Sprintf("%s: %s", guard.Name, one))
		}
		return lines
	}
	counts := map[string]int{}
	for _, one := range named {
		counts[guard.PackageOf(one)]++
	}
	lines := []string{}
	for pkg, count := range counts {
		lines = append(lines, fmt.Sprintf("%s: %s holds %d", guard.Name, pkg, count))
	}
	slices.Sort(lines)
	return lines
}

func guardModeOf(guard imports.Guard) string {
	if guard.Refuses {
		return "refuse"
	}
	return "report"
}
