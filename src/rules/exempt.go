// The markers that quiet a rule over a stretch of a file, read off the raw
// text past code, as Vale 3.20.0 reads them under its MIT licence.
// [[spec/design_output/rules#a-marker-quiets-a-rule]]
package rules

import (
	"regexp"
	"strings"
	"unicode/utf8"
)

const (
	everyRule = "off"
	markerOff = "vale off"
	markerOn  = "vale on"
)

var (
	markerRE  = regexp.MustCompile(`<!--\s*(.*?)\s*-->`)
	controlRE = regexp.MustCompile(`^vale (.+\..+|[^.]+) = (YES|NO|on|off)$`)
	fenceRE   = regexp.MustCompile("^ {0,3}(```|~~~)")
)

// A line and a rune column, both counted from 1. [[spec/design_output/rules#a-marker-quiets-a-rule]]
type place [2]int

// The stretch from a NO marker to its YES, or to the end where none follows. [[spec/design_output/rules#a-marker-quiets-a-rule]]
type region struct {
	begin, end place
	open       bool
}

// The regions of a file, keyed by a check, a style, or every rule. [[spec/design_output/rules#a-marker-quiets-a-rule]]
type quiet map[string][]region

// Every marker of the text, past fenced blocks and code spans. [[spec/design_output/rules#a-marker-quiets-a-rule]]
func quietOf(text string) quiet {
	out := quiet{}
	fence := ""
	for index, line := range strings.Split(text, "\n") {
		if opened := fenceRE.FindStringSubmatch(line); opened != nil {
			if fence == "" {
				fence = opened[1]
			} else if fence == opened[1] {
				fence = ""
			}
			continue
		}
		if fence != "" {
			continue
		}
		for _, at := range markerRE.FindAllStringSubmatchIndex(line, -1) {
			if strings.Count(line[:at[0]], "`")%2 == 1 {
				continue
			}
			out.mark(line[at[2]:at[3]], place{index + 1, utf8.RuneCountInString(line[:at[0]]) + 1})
		}
	}
	return out
}

// Opens or closes the region one marker names. [[spec/design_output/rules#a-marker-quiets-a-rule]]
func (q quiet) mark(marker string, at place) {
	switch marker {
	case markerOff:
		q.set(everyRule, true, at)
	case markerOn:
		q.set(everyRule, false, at)
	default:
		if control := controlRE.FindStringSubmatch(marker); control != nil {
			q.set(control[1], control[2] == "NO" || control[2] == "off", at)
		}
	}
}

// Opens a region where none stands open, or closes the open one. [[spec/design_output/rules#a-marker-quiets-a-rule]]
func (q quiet) set(key string, quieted bool, at place) {
	last := len(q[key]) - 1
	isOpen := last >= 0 && q[key][last].open
	switch {
	case quieted && !isOpen:
		q[key] = append(q[key], region{begin: at, open: true})
	case !quieted && isOpen:
		q[key][last].end, q[key][last].open = at, false
	}
}

// Whether a region covers the check at the place, by its own name, its style, or every rule. [[spec/design_output/rules#a-marker-quiets-a-rule]]
func (q quiet) holds(check string, line, column int) bool {
	at := place{line, column}
	style, _, _ := strings.Cut(check, ".")
	for _, key := range []string{check, style, everyRule} {
		for _, one := range q[key] {
			if !before(at, one.begin) && (one.open || before(at, one.end)) {
				return true
			}
		}
	}
	return false
}

// Whether one place stands before another. [[spec/design_output/rules#a-marker-quiets-a-rule]]
func before(a, b place) bool {
	return a[0] < b[0] || (a[0] == b[0] && a[1] < b[1])
}
