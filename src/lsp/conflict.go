// The sweep's rule over conflict markers: a merge's marks in a tracked file
// draw an error, so no marker reaches a push unheard.
// [[spec/design_output/work#no-commit-carries-a-marker]]
package main

import (
	"regexp"
	"strconv"
	"strings"

	"quackitect/src/yaml"
)

const conflictMarkers = "NoConflictMarkers"

var (
	conflictOpens = regexp.MustCompile(`^<{7}(?: |$)`)
	conflictParts = regexp.MustCompile(`^(?:={7}|\|{7}(?: .*)?)$`)
	conflictShuts = regexp.MustCompile(`^>{7}(?: |$)`)
	markedRoots   = []string{"spec/", "src/", ".claude/", "test/"}
)

// [[spec/design_output/work#no-commit-carries-a-marker]]
func noConflictMarkers(tree *Tree) []Finding {
	out := []Finding{}
	for _, path := range tree.Paths() {
		if !textFile(path) || !underMarkedRoot(path) {
			continue
		}
		lines := markerLines(tree.Read(path))
		if len(lines) == 0 {
			continue
		}
		out = append(out, fault(conflictMarkers, path, lines[0],
			"This file carries "+strconv.Itoa(len(lines))+" conflict marker line(s) a merge leaves. "+
				"Resolve the merge: keep the lines the file needs, and drop every marker line."))
	}
	return out
}

func underMarkedRoot(path string) bool {
	for _, root := range markedRoots {
		if strings.HasPrefix(slashed(path), root) {
			return true
		}
	}
	return false
}

// An opener marks alone, and a split or a closer marks past an opener, so a setext underline stays prose. [[spec/design_output/work#no-commit-carries-a-marker]]
func markerLines(text string) []int {
	out := []int{}
	open := false
	for at, line := range yaml.SplitLines(text) {
		line = strings.TrimSuffix(line, "\r")
		switch {
		case conflictOpens.MatchString(line):
			open = true
		case open && conflictShuts.MatchString(line):
			open = false
		case open && conflictParts.MatchString(line):
		default:
			continue
		}
		out = append(out, at+1)
	}
	return out
}
