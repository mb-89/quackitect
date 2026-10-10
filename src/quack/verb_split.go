// The split verb: it cuts the ranges a caller names into targets, writes
// them through one undo journal entry, and leaves the rest, off
// split-verb.js and split-cut.js.
// [[spec/design_output/level0#a-verb-cuts-the-file]]
package main

import (
	"encoding/json"
	"fmt"
	"io"
	"path/filepath"
	"regexp"
	"slices"
	"strconv"
	"strings"
	"time"

	"quackitect/src/index"
	"quackitect/src/modules/edits"
)

func init() { register("split", splitVerb(index.Root, wall.Now, realDisk())) }

// The verb's word, which the journal names as the hand of the entry. [[spec/design_output/apply#the-journal-holds-both-halves]]
const splitBy = "split"

// The flags stand in the design output, and this line is the terminal's own copy. [[spec/design_output/level0#a-verb-cuts-the-file]]
const splitUsage = "Usage: ./RUNME.sh split <file> --to <path> --lines <from>-<to> [...] [--dry]"

// The form the clock stamps a journal entry in, as toISOString writes it. [[spec/design_output/apply#the-entry-names-its-time]]
const isoStamp = "2006-01-02T15:04:05.000Z"

var splitRange = regexp.MustCompile(`^(\d+)-(\d+)$`)

// One range a split takes into one target. [[spec/design_output/level0#the-size-ceiling]]
type splitCut struct {
	path     string
	from, to int
}

// [[spec/design_output/level0#a-verb-cuts-the-file]]
func splitVerb(rootOf func() (string, error), now func() time.Time, disk diskDoors) twin {
	return func(argv []string, _ bool, out, errs io.Writer) int {
		said := argv[1:]
		if slices.Contains(said, "--help") {
			fmt.Fprintln(out, splitUsage)
			return 0
		}
		from := splitSourceOf(said)
		if from == "" {
			fmt.Fprintln(errs, "A split names the file it cuts first, and this call names none.")
			fmt.Fprintln(out, splitUsage)
			return exitUsage
		}
		root, err := rootOf()
		if err != nil {
			fmt.Fprintln(errs, err)
			return exitFailed
		}
		at := filepath.Join(root, from)
		text, err := disk.read(at)
		if err != nil {
			fmt.Fprintf(errs, "%s stands nowhere, so there is nothing to cut.\n", from)
			return exitUsage
		}
		cuts, why := splitCutsIn(said)
		if why != "" {
			fmt.Fprintln(errs, why)
			return exitUsage
		}
		for _, one := range cuts {
			if one.path == from {
				fmt.Fprintf(errs, "%s is the source and a target, so the cut writes over what it reads.\n", from)
				return exitUsage
			}
		}
		// A second cut into one target writes over the first, and both ranges leave the source. [[spec/design_output/level0#a-verb-cuts-the-file]]
		if twice := splitRepeated(cuts); twice != "" {
			fmt.Fprintf(errs, "%s takes two cuts, and the second writes over the first. Name one --to a target.\n", twice)
			return exitUsage
		}
		targets, rest, why := splitTextOf(string(text), cuts)
		if why != "" {
			fmt.Fprintln(errs, why)
			return exitFailed
		}
		for _, one := range targets {
			fmt.Fprintf(out, "%s takes %d line(s).\n", one.File, strings.Count(one.Made, "\n"))
		}
		fmt.Fprintf(out, "%s keeps %d line(s).\n", from, strings.Count(rest, "\n"))
		if slices.Contains(said, "--dry") {
			return 0
		}
		return splitWrote(disk, root, from, string(text), rest, targets, now(), out, errs)
	}
}

// One entry holds every target and the rest, so one undo puts the whole cut back. [[spec/design_output/apply#the-journal-holds-both-halves]]
func splitWrote(disk diskDoors, root, from, was, rest string, targets []edits.Changed, at time.Time, out, errs io.Writer) int {
	files := make([]edits.Changed, 0, len(targets)+1)
	for _, one := range targets {
		stood, err := disk.read(filepath.Join(root, one.File))
		one.Was, one.Born = string(stood), err != nil
		files = append(files, one)
	}
	files = append(files, edits.Changed{File: from, Was: was, Made: rest})
	stamp := at.UTC().Format(isoStamp)
	// The entry names this run, so an undo takes this cut and no other. [[spec/design_output/apply#the-journal-holds-both-halves]]
	on := splitBy + ":" + stamp
	folder := filepath.Join(root, filepath.FromSlash(edits.Journal))
	where := filepath.Join(folder, edits.FreeName(stamp, func(name string) bool {
		_, err := disk.stat(filepath.Join(folder, name))
		return err == nil
	}))
	if err := writesFile(disk, where, journalText(edits.JournalOf(stamp, on, splitBy, files, ""))); err != nil {
		fmt.Fprintf(errs, "The journal would not write, so nothing did: %v\n", err)
		return exitFailed
	}
	for _, one := range files {
		if err := writesFile(disk, filepath.Join(root, one.File), one.Made); err != nil {
			fmt.Fprintf(errs, "%s would not write, and %s holds the way back.\n%v\n", one.File, where, err)
			return exitFailed
		}
	}
	fmt.Fprintf(out, "The cut stands, and mcp__level0__undo takes it back under %s.\n", on)
	return 0
}

// The ranges the flags name, each with its target, or why they read as none. [[spec/design_output/level0#the-size-ceiling]]
func splitCutsIn(said []string) ([]splitCut, string) {
	var cuts []splitCut
	path := ""
	for at := 0; at < len(said); at++ {
		switch said[at] {
		case "--to":
			if path != "" {
				return nil, path + " names no range. Add --lines from-to."
			}
			path = wordAt(said, at+1)
			at++
		case "--lines":
			if path == "" {
				return nil, "A range names no target. Add --to path."
			}
			found := splitRange.FindStringSubmatch(wordAt(said, at+1))
			if found == nil {
				return nil, wordAt(said, at+1) + " reads as no range. Write from-to."
			}
			from, _ := strconv.Atoi(found[1])
			to, _ := strconv.Atoi(found[2])
			if from < 1 {
				return nil, "A file's first line is 1, so a range starts there."
			}
			if to < from {
				return nil, fmt.Sprintf("%d-%d reads backwards. Write the smaller first.", from, to)
			}
			cuts = append(cuts, splitCut{path: path, from: from, to: to})
			path = ""
			at++
		}
	}
	if path != "" {
		return nil, path + " names no range. Add --lines from-to."
	}
	if len(cuts) == 0 {
		return nil, "A split names a target: --to path --lines from-to."
	}
	return cuts, ""
}

// The text each target takes and the rest the source keeps, or why the ranges cut nothing. [[spec/design_output/level0#the-size-ceiling]]
func splitTextOf(text string, cuts []splitCut) ([]edits.Changed, string, string) {
	lines := strings.Split(text, "\n")
	if lines[len(lines)-1] == "" {
		lines = lines[:len(lines)-1]
	}
	taken := map[int]string{}
	for _, one := range cuts {
		if one.to > len(lines) {
			return nil, text, fmt.Sprintf("%s reaches line %d, and the file holds %d line(s).", one.path, one.to, len(lines))
		}
		for line := one.from; line <= one.to; line++ {
			if held, ok := taken[line]; ok {
				return nil, text, fmt.Sprintf("%s and %s both reach line %d.", one.path, held, line)
			}
			taken[line] = one.path
		}
	}
	targets := make([]edits.Changed, 0, len(cuts))
	for _, one := range cuts {
		targets = append(targets, edits.Changed{File: one.path, Made: strings.Join(lines[one.from-1:one.to], "\n") + "\n"})
	}
	var rest []string
	for at, line := range lines {
		if _, ok := taken[at+1]; !ok {
			rest = append(rest, line)
		}
	}
	if len(rest) == 0 {
		return targets, "", ""
	}
	return targets, strings.Join(rest, "\n") + "\n", ""
}

// The first word standing outside a flag and outside a flag's value. [[spec/design_output/level0#a-verb-cuts-the-file]]
func splitSourceOf(said []string) string {
	for at := 0; at < len(said); at++ {
		if said[at] == "--to" || said[at] == "--lines" {
			at++
			continue
		}
		if !strings.HasPrefix(said[at], "--") {
			return said[at]
		}
	}
	return ""
}

// The first target two cuts name, read past a leading ./ and a backslash. [[spec/design_output/level0#a-verb-cuts-the-file]]
func splitRepeated(cuts []splitCut) string {
	seen := map[string]bool{}
	for _, one := range cuts {
		key := strings.TrimPrefix(strings.ReplaceAll(one.path, `\`, "/"), "./")
		if seen[key] {
			return one.path
		}
		seen[key] = true
	}
	return ""
}

// The word at the place, or nothing past the end. [[spec/tickets/ticket-verbs-port-to-go]]
func wordAt(said []string, at int) string {
	if at < len(said) {
		return said[at]
	}
	return ""
}

// Writes the text at the path, and makes the folder it stands in. [[spec/tickets/ticket-verbs-port-to-go]]
func writesFile(disk diskDoors, at, text string) error {
	if err := disk.makeAll(filepath.Dir(at), 0o755); err != nil {
		return err
	}
	return disk.write(at, []byte(text), 0o644)
}

// An entry as JSON.stringify writes it indented by two, with its line end. [[spec/design_output/apply#the-journal-holds-both-halves]]
func journalText(entry edits.Entry) string {
	var said strings.Builder
	writes := json.NewEncoder(&said)
	writes.SetEscapeHTML(false)
	writes.SetIndent("", "  ")
	_ = writes.Encode(entry)
	return said.String()
}
