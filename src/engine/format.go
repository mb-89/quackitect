package main

import (
	"context"
	"flag"
	"fmt"
	"io/fs"
	"os/exec"
	"path/filepath"
	"quackitect/engine/internal/quiet"
	"sort"
	"strconv"
	"strings"
	"time"
)

// se format: put the tree in the shape the tools agree on.
//
// AN AGENT NAMES NO PROGRAM TO CHECK ITS WORK. The Go guidance listed four of
// them and told the agent to run them, while the engine's own rule is that you
// use the door the engine gives you. The two rules disagreed, and the tools
// only ever ran when the whole battery did, which an agent may not run by hand.
//
// SO WHAT EACH VERB REACHES IS THE ENGINE'S BUSINESS AND NEVER THE AGENT'S.
// Format runs first, because a formatter settles what a linter would otherwise
// report. A program that is not on the box is the engine's answer to give: an
// agent that named the program itself got the operating system's error, which
// says a path and a syscall and no next move.

// theToolCeiling is how long one program gets over one folder. A tool that
// hangs must not take the verb with it, and a refusal that says so is an
// answer where a wait is not.
const theToolCeiling = 2 * time.Minute

// Formatted is what one program did over one folder.
type Formatted struct {
	Program string   `json:"program"`
	Over    string   `json:"over"`
	Changed []string `json:"changed,omitempty"`
	Refused string   `json:"refused,omitempty"`
}

// TheGoModules answers every folder under the method root carrying a go.mod,
// which is what a Go program is run over.
//
// THE FOLDERS ARE READ OFF THE DISK AND NOT LISTED HERE. A list in this file
// and the battery's own list are one fact in two places, and they go out of
// step the day a module is added. What another tree installed is not this
// tree's to format or judge, so those folders are passed over.
func TheGoModules(method string) []string {
	var out []string
	_ = filepath.WalkDir(method, func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			return nil
		}
		if d.IsDir() {
			switch d.Name() {
			case ".git", ".se", ".bin", "node_modules", "vendor":
				return filepath.SkipDir
			}
			return nil
		}
		if d.Name() == "go.mod" {
			out = append(out, filepath.Dir(path))
		}
		return nil
	})
	sort.Strings(out)
	return out
}

// theProgramIsMissing is what the engine says instead of a tool error.
func theProgramIsMissing(program, where string) string {
	return program + " is not on this box, so nothing ran it. " + where +
		" Until it is here this tree is judged by the rest, and this line is " +
		"how you tell that box from one that ran everything."
}

// theProgramSaid runs one program over one folder and answers what it wrote,
// both streams together, and whether it ended well.
func theProgramSaid(ctx context.Context, dir, program string, args ...string) (string, bool) {
	if ctx == nil {
		ctx = context.Background()
	}
	ctx, stop := context.WithTimeout(ctx, theToolCeiling)
	defer stop()
	cmd := quiet.Quietly(exec.CommandContext(ctx, program, args...))
	cmd.Dir = dir
	// THE SAME ENVIRONMENT A BUILD RUNS IN. The engine may have been started
	// by a window that knows nothing of cgo, and a vet that cannot build the
	// package reports the compiler rather than the code.
	cmd.Env = buildEnv()
	said, err := cmd.CombinedOutput()
	return string(said), err == nil
}

// FormatGo formats every Go module under the method root, and answers what
// each run changed or why it could not.
func FormatGo(ctx context.Context, method string) []Formatted {
	modules := TheGoModules(method)
	if len(modules) == 0 {
		return nil
	}
	if _, err := exec.LookPath("gofmt"); err != nil {
		return []Formatted{{Program: "gofmt", Refused: theProgramIsMissing("gofmt",
			"It comes with the Go toolchain, so a box that can build this tree has it: install Go.")}}
	}
	var out []Formatted
	for _, dir := range modules {
		// -l NAMES WHAT IT TOUCHED AND -w WRITES IT. Without -l the verb
		// changes files and says nothing, and a reader cannot tell a tree that
		// was already straight from one it just straightened.
		said, ok := theProgramSaid(ctx, dir, "gofmt", "-l", "-w", ".")
		one := Formatted{Program: "gofmt", Over: shortened(method, dir)}
		for _, line := range strings.Split(strings.TrimSpace(said), "\n") {
			if line = strings.TrimSpace(line); line != "" {
				one.Changed = append(one.Changed, filepath.ToSlash(filepath.Join(one.Over, line)))
			}
		}
		if !ok {
			one.Changed, one.Refused = nil, "gofmt could not read "+one.Over+": "+theFirstLine(said)
		}
		out = append(out, one)
	}
	return out
}

// shortened says a folder the way a reader of this tree names it.
func shortened(method, dir string) string {
	if rel, err := filepath.Rel(method, dir); err == nil {
		return filepath.ToSlash(rel)
	}
	return filepath.ToSlash(dir)
}

// theFirstLine is what a program said, cut to the sentence a reader needs.
func theFirstLine(said string) string {
	said = strings.TrimSpace(said)
	if said == "" {
		return "it said nothing"
	}
	line, _, _ := strings.Cut(said, "\n")
	return strings.TrimSpace(line)
}

// aToolFinding reads one line a Go tool wrote into a finding, and answers
// false for a line that names no place: a package heading, a blank, a summary.
//
// THE SHAPE IS THE ONE EVERY GO TOOL WRITES: file, line, column, sentence. vet
// puts vet: in front of the line it could not even load, so that comes off
// first and what is left reads the same as the rest.
func aToolFinding(dir, line string) (Finding, bool) {
	line = strings.TrimSpace(strings.TrimPrefix(strings.TrimSpace(line), "vet:"))
	if line == "" || strings.HasPrefix(line, "#") {
		return Finding{}, false
	}
	file, rest, cut := strings.Cut(line, ":")
	if !cut || !strings.HasSuffix(file, ".go") {
		return Finding{}, false
	}
	at, says, cut := strings.Cut(rest, ":")
	if !cut {
		return Finding{}, false
	}
	n, err := strconv.Atoi(at)
	if err != nil {
		return Finding{}, false
	}
	// The column is next where there is one, and it is not what an editor
	// needs to put the mark on the row.
	if column, after, cut := strings.Cut(says, ":"); cut {
		if _, err := strconv.Atoi(strings.TrimSpace(column)); err == nil {
			says = after
		}
	}
	at = filepath.ToSlash(filepath.Join(dir, strings.TrimPrefix(file, "./")))
	return Finding{ID: at, Title: dir, Says: strings.TrimSpace(says), File: at, Line: n}, true
}

// LintGo names what the Go tools find, and says which of them did not run.
//
// A TOOL THAT ENDED BADLY AND NAMED NOTHING IS A REFUSAL. golangci-lint built
// against an older toolchain than the module targets will not start at all, and
// its complaint is about the box rather than about the code. Reported as a
// finding it reads as a defect in the tree, which is the one thing it is not.
func LintGo(ctx context.Context, r Roots) ([]Finding, []string) {
	var found []Finding
	var refused []string
	modules := TheGoModules(r.Method)
	if len(modules) == 0 {
		return nil, nil
	}
	for _, program := range []struct{ name, args, where string }{
		{"go", "vet ./...", "It comes with the Go toolchain: install Go."},
		{"golangci-lint", "run ./...",
			"Install it from golangci-lint.run, or read this tree on a box that has it."},
	} {
		if _, err := exec.LookPath(program.name); err != nil {
			refused = append(refused, theProgramIsMissing(program.name, program.where))
			continue
		}
		for _, dir := range modules {
			over := shortened(r.Method, dir)
			said, ok := theProgramSaid(ctx, dir, program.name, strings.Fields(program.args)...)
			was := len(found)
			for _, line := range strings.Split(said, "\n") {
				if f, is := aToolFinding(over, line); is {
					found = append(found, f)
				}
			}
			if !ok && len(found) == was {
				refused = append(refused, program.name+" would not run over "+over+
					", so nothing it checks was checked there: "+theFirstLine(said))
			}
		}
	}
	return found, refused
}

func runFormat(c *call) int {
	fs := flag.NewFlagSet("format", flag.ContinueOnError)
	fs.SetOutput(c.err)
	fs.Usage = func() {
		fmt.Fprintln(c.err, "se format - put the tree in the shape the tools agree on.")
		fmt.Fprintln(c.err, "")
		fmt.Fprintln(c.err, "  se format        format what this tree carries, and say what changed")
		fmt.Fprintln(c.err, "")
		fs.PrintDefaults()
	}
	fs.String("work", "", "the folder being worked on (default: this one)")
	if code, stop := c.parse(fs, "format"); stop {
		return code
	}

	ran := FormatGo(c.ctx, c.roots.Method)
	changed, refused := []string{}, []string{}
	for _, one := range ran {
		changed = append(changed, one.Changed...)
		if one.Refused != "" {
			refused = append(refused, one.Refused)
		}
	}
	c.answerJSON(map[string]any{"ran": ran, "changed": changed, "refused": refused})
	// A VERB THAT FORMATTED NOTHING BECAUSE IT COULD NOT SAYS SO IN ITS CODE.
	// A tree that was already straight is a zero, because that is the verb
	// having done its job.
	if len(refused) > 0 {
		return 1
	}
	return 0
}
