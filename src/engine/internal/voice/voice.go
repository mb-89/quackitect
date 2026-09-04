package main

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"strings"
)

// THE MECHANICAL VOICE CHECK, AT THE WRITE PATH.
//
// Voice rules that a program can check are checked before the text reaches
// disk. Only the mechanical ones: pattern and vocabulary. Judgement is not
// here, because a refusal that cannot be reproduced is an obstacle and not a
// rule.
//
// THE RULES ARE DATA, in util/voice-rules.json, and they are meant to be
// swapped. A standard that restricts who may use its word list can be dropped
// in as a rules file without touching this program, and the default that
// ships is written here rather than copied from anywhere.
//
// This refuses a FORM and never a place. The same file, written properly,
// goes through.

// VoiceBreach is one place prose breaks one voice rule.
//
// IT IS NOT A Finding, WHICH IS WHAT THE LINTER REPORTS. Both were called
// Finding, so one carried a 3 and the number was the only thing telling a
// reader which was which. A breach is about a sentence; a finding is about a
// note, and it carries the file and line an editor puts a mark on.
type VoiceBreach struct {
	Rule  string
	Where string
	Says  string
}

func (f VoiceBreach) String() string { return fmt.Sprintf("%s (%s): %s", f.Rule, f.Where, f.Says) }

// Rules are read from the method root. A file that cannot be read means the
// check cannot run, which is said loudly and never refuses a write: a broken
// checker must not stop a person from working.
type VoiceRules struct {
	Source string `json:"source"`
	Limits struct {
		SentenceWords int `json:"sentence_words"`
	} `json:"limits"`
	Rules []struct {
		Name    string `json:"name"`
		Pattern string `json:"pattern"`
		Says    string `json:"says"`
	} `json:"rules"`

	compiled []*regexp.Regexp
}

func LoadVoiceRules(methodRoot string) (VoiceRules, error) {
	var v VoiceRules
	b, err := os.ReadFile(filepath.Join(methodRoot, "util", "voice-rules.json"))
	if err != nil {
		return v, err
	}
	if err := json.Unmarshal(b, &v); err != nil {
		return v, fmt.Errorf("util/voice-rules.json is not readable: %w", err)
	}
	for _, r := range v.Rules {
		re, err := regexp.Compile(r.Pattern)
		if err != nil {
			return v, fmt.Errorf("the rule %q has a pattern that will not compile: %w", r.Name, err)
		}
		v.compiled = append(v.compiled, re)
	}
	// ZERO RULES IS A CHECKER THAT CHECKS NOTHING, and it passed every write
	// without a word. The unreadable case is loud already, so the empty one
	// refuses the same way rather than passing quietly.
	if len(v.compiled) == 0 {
		return v, fmt.Errorf("util/voice-rules.json names no rules, so the check would pass everything. " +
			"Name at least one rule, or remove the file to turn the check off loudly")
	}
	if v.Limits.SentenceWords <= 0 {
		v.Limits.SentenceWords = 25
	}
	return v, nil
}

var fence = regexp.MustCompile("^\\s*```")

// CheckVoice returns what a program can see. It is deliberately short: every
// rule here is one a person can predict before they write the line.
func (v VoiceRules) Check(text string) []VoiceBreach {
	var out []VoiceBreach
	inCode := false
	for n, line := range strings.Split(text, "\n") {
		if fence.MatchString(line) {
			inCode = !inCode
			continue
		}
		if inCode {
			continue // code is not prose, and it is not this rule's business
		}
		at := fmt.Sprintf("line %d", n+1)
		for i, r := range v.Rules {
			if m := v.compiled[i].FindString(line); m != "" {
				says := r.Says
				if m != "" && len(m) < 30 {
					says = m + " — " + r.Says
				}
				out = append(out, VoiceBreach{r.Name, at, says})
			}
		}
		for _, s := range sentencesIn(line) {
			if n := len(strings.Fields(stripMarkup(s))); n > v.Limits.SentenceWords {
				out = append(out, VoiceBreach{
					fmt.Sprintf("%d words to a sentence", v.Limits.SentenceWords),
					at, fmt.Sprintf("%d words: %s", n, short60(s))})
			}
		}
	}
	return out
}

func sentencesIn(line string) []string {
	line = strings.TrimSpace(line)
	if line == "" || strings.HasPrefix(line, "|") {
		return nil // a table cell is not a paragraph
	}
	// Go's regular expressions have no lookbehind, so the terminator is kept
	// by splitting after it rather than before the space.
	var out []string
	cur := strings.Builder{}
	for _, r := range line {
		cur.WriteRune(r)
		if r == '.' || r == '!' || r == '?' {
			out = append(out, cur.String())
			cur.Reset()
		}
	}
	if strings.TrimSpace(cur.String()) != "" {
		out = append(out, cur.String())
	}
	return out
}

func stripMarkup(s string) string {
	s = regexp.MustCompile("`[^`]*`").ReplaceAllString(s, "x")
	return regexp.MustCompile(`\([^)]*\)`).ReplaceAllString(s, "x")
}

func short60(s string) string {
	if len(s) > 60 {
		return s[:60] + "…"
	}
	return s
}
