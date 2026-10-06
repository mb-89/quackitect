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
var refusing = setOf("VoiceRulesRan", "Private", modelRule)

// The rule a trailer naming a model breaks, and the pattern that reads a model family in a trailer's value. A name followed by a dot reads as a host, so a claude.ai link passes. [[spec/tickets/commit-door-refuses-model-trailers]]
const modelRule = "ModelTrailer"

var modelName = regexp.MustCompile(`(?i)(?:^|[^a-z])(?:opus|sonnet|haiku|fable|gpt|gemini|claude)(?:[^a-z.]|$)`)

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

// The findings that break form alone, which the commit lands over. [[spec/tickets/cage-commit-guards-port]]
func FormIn(found []Row) []Row {
	var out []Row
	for _, one := range found {
		if !Refuses(one.Rule) {
			out = append(out, one)
		}
	}
	return out
}

// A message with its closing paragraph of trailers off, where every line of it reads as one. [[spec/tickets/cage-commit-guards-port]]
func WithoutTrailers(text string) string {
	paragraphs := paragraphBreak.Split(strings.TrimRightFunc(text, isSpace), -1)
	if TrailersOf(text) == nil {
		return text
	}
	return strings.Join(paragraphs[:len(paragraphs)-1], "\n\n")
}

// The lines of a message's closing paragraph, where it holds trailers alone, or none. [[spec/tickets/commit-door-refuses-model-trailers]]
func TrailersOf(text string) []string {
	paragraphs := paragraphBreak.Split(strings.TrimRightFunc(text, isSpace), -1)
	if len(paragraphs) < 2 {
		return nil
	}
	var out []string
	for _, line := range lineEnd.Split(paragraphs[len(paragraphs)-1], -1) {
		line = strings.TrimSpace(line)
		if !trailer.MatchString(line) {
			return nil
		}
		out = append(out, line)
	}
	return out
}

// The trailers of a message that name a model, each as a refusing row. [[spec/tickets/commit-door-refuses-model-trailers]]
func ModelTrailers(message string) []Row {
	var out []Row
	for _, line := range TrailersOf(message) {
		_, value, _ := strings.Cut(line, ": ")
		if modelName.MatchString(value) {
			out = append(out, Row{Rule: modelRule, Said: line, Message: "A commit trailer names no model, by the owner's rule. Take this line out, and keep the Claude-Session line alone."})
		}
	}
	return out
}

// Whether a rule refuses at a door, by the name past its last dot. [[spec/design_output/level0#the-panel-holds-a-warning]]
func Refuses(rule string) bool {
	return refusing[rule[strings.LastIndex(rule, ".")+1:]]
}

// [[spec/tickets/cage-commit-guards-port]]
func isSpace(r rune) bool { return strings.ContainsRune(" \t\n\r\f\v", r) }
