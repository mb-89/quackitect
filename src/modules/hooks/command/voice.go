// The voice over a commit message, off refusesIn and formIn in
// lib/warnings.js and withoutTrailers in lib/commit-reads.js: a finding naming
// a refusing rule refuses, and every other one is a break of form.
// [[spec/tickets/cage-commit-guards-port]]
package command

import (
	"regexp"
	"strings"
)

// The rules that refuse at a door, by the name past the last dot: a lint that ran nowhere, and a private name leaving the box. [[spec/design_output/level0#the-panel-holds-a-warning]]
var refusing = setOf("VoiceRulesRan", "Private")

// A paragraph break, and a trailer line. [[spec/design_output/bash#a-commit-message-meets-voice]]
var (
	paragraphBreak = regexp.MustCompile(`\r?\n\s*\r?\n`)
	trailer        = regexp.MustCompile(`^[A-Za-z][A-Za-z-]*: \S`)
)

// The findings that refuse. [[spec/tickets/cage-commit-guards-port]]
func RefusesIn(found []Row) []Row {
	var out []Row
	for _, one := range found {
		if Refuses(one.Rule) {
			out = append(out, one)
		}
	}
	return out
}

// A message with its closing paragraph of trailers off, where every line of it reads as one. [[spec/tickets/cage-commit-guards-port]]
func WithoutTrailers(text string) string {
	paragraphs := paragraphBreak.Split(strings.TrimRightFunc(text, isSpace), -1)
	if len(paragraphs) < 2 {
		return text
	}
	for _, line := range lineEnd.Split(paragraphs[len(paragraphs)-1], -1) {
		if !trailer.MatchString(strings.TrimSpace(line)) {
			return text
		}
	}
	return strings.Join(paragraphs[:len(paragraphs)-1], "\n\n")
}

// Whether a rule refuses at a door, by the name past its last dot. [[spec/design_output/level0#the-panel-holds-a-warning]]
func Refuses(rule string) bool {
	return refusing[rule[strings.LastIndex(rule, ".")+1:]]
}

// [[spec/tickets/cage-commit-guards-port]]
func isSpace(r rune) bool { return strings.ContainsRune(" \t\n\r\f\v", r) }
