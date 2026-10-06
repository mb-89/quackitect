// The prose rules in Go: every rule the voice holds, over a parsed markdown
// tree or the raw text, scoped by path, answering in the shape Vale answered.
// [[spec/tickets/go-rules-replace-vale]]
package rules

import (
	"fmt"
	"path/filepath"
	"sort"
	"strconv"
	"strings"
	"unicode/utf8"
)

// One finding: the rule, its place, the text it matched, what it says, and the fix it offers. [[spec/tickets/go-rules-replace-vale]]
type Finding struct {
	Check    string  `json:"Check"`
	Line     int     `json:"Line"`
	Span     [2]int  `json:"Span"`
	Match    string  `json:"Match"`
	Message  string  `json:"Message"`
	Severity string  `json:"Severity"`
	Link     string  `json:"Link"`
	Action   *Action `json:"Action,omitempty"`
}

// The fix a finding offers, in Vale's shape: replace names the swap, and Params holds each choice. [[spec/design_output/rules#a-finding-carries-its-fix]]
type Action struct {
	Name   string   `json:"Name"`
	Params []string `json:"Params"`
}

// The texts the rules read past the file: the rule files, the paragraph schema and the vocabulary lists, each by its path. [[spec/tickets/go-rules-replace-vale]]
type Read func(path string) string

// The rules loaded once over the texts they read: the token rules, the scripts, and every check id. [[spec/design_output/rules#load-reads-the-rule-files]]
type Set struct {
	tokens  []*tokenRule
	scripts []scriptRule
	checks  []string
}

// One script rule with what its rule file says around it. [[spec/design_output/rules#a-script-answers-offsets]]
type scriptRule struct {
	def ruleHead
	run script
}

// Loads the rules over the texts the reader hands: each rule file, and each script's own texts. [[spec/design_output/rules#load-reads-the-rule-files]]
func Load(read Read) (*Set, error) {
	set := &Set{}
	makers := scriptMakers()
	for _, path := range ruleFiles {
		text := read(path)
		if strings.TrimSpace(text) == "" {
			return nil, fmt.Errorf("no rule stands at %s", path)
		}
		file, err := parseRule(path, text)
		if err != nil {
			return nil, err
		}
		set.checks = append(set.checks, file.head.check)
		if file.extends == kindScript {
			maker := makers[file.head.check]
			if maker == nil {
				continue
			}
			run, err := maker(read)
			if err != nil {
				return nil, err
			}
			set.scripts = append(set.scripts, scriptRule{def: file.head, run: run})
			continue
		}
		rule, err := compileRule(file)
		if err != nil {
			return nil, err
		}
		set.tokens = append(set.tokens, rule)
	}
	return set, nil
}

// Every finding over the text, read as the file at the path, past every marker, by line then column. [[spec/tickets/go-rules-replace-vale]]
func (set *Set) Lint(path, text string) []Finding {
	text = strings.ReplaceAll(text, "\r\n", "\n")
	on := turnedOn(path, set.checks)
	out := []Finding{}
	seen := map[string]bool{}
	keep := func(one Finding) {
		key := one.Check + "\x00" + strconv.Itoa(one.Line) + "\x00" + strconv.Itoa(one.Span[0])
		if !seen[key] {
			seen[key] = true
			out = append(out, one)
		}
	}
	var rules []*tokenRule
	for _, rule := range set.tokens {
		if on[rule.head.check] {
			rules = append(rules, rule)
		}
	}
	if len(rules) > 0 {
		lines := lineStarts(text)
		for _, one := range blocksOf(filepath.Ext(path), text) {
			for _, rule := range rules {
				if !rule.scope.matches(one.scope) {
					continue
				}
				for _, found := range rule.run(one.text) {
					begin, end, placed := one.place(text, found)
					if placed {
						keep(rule.finding(text, lines, begin, end, found))
					}
				}
			}
		}
	}
	for _, rule := range set.scripts {
		if !on[rule.def.check] {
			continue
		}
		for _, found := range rule.run(scriptIn{Path: path, Text: text}) {
			keep(rule.def.scriptFinding(text, found))
		}
	}
	quiet := quietOf(text)
	kept := out[:0]
	for _, one := range out {
		if !quiet.holds(one.Check, one.Line, one.Span[0]) {
			kept = append(kept, one)
		}
	}
	sort.SliceStable(kept, func(a, b int) bool {
		if kept[a].Line != kept[b].Line {
			return kept[a].Line < kept[b].Line
		}
		return kept[a].Span[0] < kept[b].Span[0]
	})
	return kept
}

// A script match as a finding: its line, its span in runes, and the rule's message where the match names none. [[spec/design_output/rules#a-script-answers-offsets]]
func (head ruleHead) scriptFinding(text string, found scriptMatch) Finding {
	match := text[found.Begin:found.End]
	message := found.Message
	if message == "" {
		message = head.message
	}
	line, span := placeOf(text, lineStarts(text), found.Begin, found.End)
	return Finding{Check: head.check, Line: line, Span: span, Match: match, Message: formatMessage(message, match), Severity: head.level, Link: head.link}
}

// The start of every line of the text, by byte. [[spec/design_output/rules#the-text-model]]
func lineStarts(text string) []int {
	starts := []int{0}
	for at := 0; at < len(text); at++ {
		if text[at] == '\n' {
			starts = append(starts, at+1)
		}
	}
	return starts
}

// The line of a byte offset, and the span from it in runes counted from 1, holding both ends. [[spec/design_output/rules#the-text-model]]
func placeOf(text string, starts []int, begin, end int) (int, [2]int) {
	line := sort.Search(len(starts), func(at int) bool { return starts[at] > begin })
	column := utf8.RuneCountInString(text[starts[line-1]:begin]) + 1
	last := column + utf8.RuneCountInString(text[begin:end]) - 1
	if last <= 0 {
		last = 1
	}
	return line, [2]int{column, last}
}
