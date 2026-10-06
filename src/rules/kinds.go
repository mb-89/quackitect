// The token kinds the styles hold, ported off Vale under its MIT licence:
// existence, substitution, occurrence and sequence, each compiled once off its
// rule file and run over one block's text, answering byte offsets into it.
// [[spec/design_output/rules#the-token-kinds]]
package rules

import (
	"fmt"
	"regexp"
	"sort"
	"strings"
	"unicode"

	"github.com/dlclark/regexp2/v2"
)

const (
	ignoreCase      = `(?i)`
	wordTemplate    = `(?m)\b(?:%s)\b`
	nonwordTemplate = `(?m)(?:%s)`
	tokenTemplate   = `^(?:%s)$`
	actionReplace   = "replace"
	choiceWord      = "or"
)

var (
	captureOpen = regexp2.MustCompile(`(?<!\\)\((?!\?)`, regexp2.RE2)
	unescPipe   = regexp2.MustCompile(`(?<!\\)\|`, regexp2.RE2)
	groupRef    = regexp.MustCompile(`\$\d`)
	firstWord   = regexp.MustCompile(`\S+`)
)

// One match a token rule answers inside a block: byte offsets into its text, the text, its message and its fix. [[spec/design_output/rules#the-token-kinds]]
type hit struct {
	begin, end int
	match      string
	message    string
	action     Action
}

// One token rule: what it says, which blocks it reads, and how it matches. [[spec/design_output/rules#the-token-kinds]]
type tokenRule struct {
	head  ruleHead
	scope ruleScope
	run   func(text string) []hit
}

// The finding a placed hit makes, its message on one line. [[spec/design_output/rules#the-token-kinds]]
func (rule *tokenRule) finding(text string, starts []int, begin, end int, found hit) Finding {
	line, span := placeOf(text, starts, begin, end)
	one := Finding{Check: rule.head.check, Line: line, Span: span, Match: found.match, Message: strings.ReplaceAll(found.message, "\n", " "), Severity: rule.head.level, Link: rule.head.link}
	if found.action.Name != "" {
		action := found.action
		one.Action = &action
	}
	return one
}

// Compiles one rule file into its kind. [[spec/design_output/rules#the-token-kinds]]
func compileRule(file ruleFile) (*tokenRule, error) {
	var run func(string) []hit
	var err error
	scope := file.scope
	switch file.extends {
	case kindExistence:
		run, err = existenceOf(file)
	case kindSubstitution:
		run, err = substitutionOf(file)
	case kindOccurrence:
		run, err = occurrenceOf(file)
	case kindSequence:
		run, err = sequenceOf(file)
		scope = sentenceScope(file.scope, file.head.check)
	default:
		return nil, fmt.Errorf("%s extends %q, which no kind here reads", file.head.check, file.extends)
	}
	if err != nil {
		return nil, fmt.Errorf("%s: %w", file.head.check, err)
	}
	return &tokenRule{head: file.head, scope: scopeOf(scope), run: run}, nil
}

// A pattern in the engine Vale runs, with lookbehind and RE2 classes. [[spec/design_output/rules#the-token-kinds]]
func compiled(expr string) (*regexp2.Regexp, error) {
	return regexp2.Compile(expr, regexp2.RE2)
}

// Every match of a pattern, as byte offsets. [[spec/design_output/rules#the-token-kinds]]
func allIndex(re *regexp2.Regexp, text string) [][]int {
	found, err := re.FindAllStringIndex(text, -1)
	if err != nil {
		return nil
	}
	return found
}

// Whether a pattern matches anywhere in the text. [[spec/design_output/rules#the-token-kinds]]
func matches(re *regexp2.Regexp, text string) bool {
	if re == nil {
		return false
	}
	ok, err := re.MatchString(text)
	return err == nil && ok
}

// The pattern a rule's tokens make: bounded by words unless the rule says nonword, case-blind where it says so. [[spec/design_output/rules#the-token-kinds]]
func template(noCase, word bool) string {
	out := nonwordTemplate
	if word {
		out = wordTemplate
	}
	if noCase {
		out = ignoreCase + out
	}
	return out
}

// The exceptions as one word-bounded pattern, longest first, each holding its own case. [[spec/design_output/rules#the-token-kinds]]
func exceptionsOf(terms []string) (*regexp2.Regexp, error) {
	if len(terms) == 0 {
		return nil, nil
	}
	sorted := append([]string{}, terms...)
	sort.SliceStable(sorted, func(a, b int) bool { return len(sorted[a]) > len(sorted[b]) })
	for at, term := range sorted {
		if !strings.HasPrefix(term, ignoreCase) {
			sorted[at] = "(?-i)" + term
		}
	}
	return compiled(fmt.Sprintf(wordTemplate, strings.Join(sorted, "|")))
}

// An existence rule: every match of its tokens past its exceptions. [[spec/design_output/rules#the-token-kinds]]
func existenceOf(file ruleFile) (func(string) []hit, error) {
	parsed := []string{}
	for _, token := range file.tokens {
		if strings.TrimSpace(token) != "" {
			parsed = append(parsed, token)
		}
	}
	re, err := compiled(fmt.Sprintf(template(file.ignorecase, !file.nonword && len(file.tokens) > 0), strings.Join(parsed, "|")))
	if err != nil {
		return nil, err
	}
	except, err := exceptionsOf(file.exceptions)
	if err != nil {
		return nil, err
	}
	return func(text string) []hit {
		out := []hit{}
		for _, loc := range allIndex(re, text) {
			match := text[loc[0]:loc[1]]
			if match == "" || matches(except, strings.TrimSpace(match)) {
				continue
			}
			out = append(out, hit{begin: loc[0], end: loc[1], match: match, message: formatMessage(file.head.message, match), action: file.action})
		}
		return out
	}, nil
}

// A substitution rule: each swap's pattern, its offer filled from the match, and a replace action carrying the offers. [[spec/design_output/rules#a-finding-carries-its-fix]]
func substitutionOf(file ruleFile) (func(string) []hit, error) {
	swaps := append([]swapRow{}, file.swaps...)
	sort.SliceStable(swaps, func(a, b int) bool { return len(swaps[a].find) > len(swaps[b].find) })
	terms := []string{}
	finders := []*regexp2.Regexp{}
	for _, swap := range swaps {
		term := swap.find
		if strings.Count(term, "(") != strings.Count(term, "(?")+strings.Count(term, `\(`) {
			opened, err := captureOpen.Replace(term, "(?:", -1, -1)
			if err != nil {
				return nil, err
			}
			term = opened
		}
		terms = append(terms, "("+term+")")
		finder := swap.find
		if file.ignorecase {
			finder = ignoreCase + finder
		}
		re, err := compiled(finder)
		if err != nil {
			return nil, err
		}
		finders = append(finders, re)
	}
	re, err := compiled(fmt.Sprintf(template(file.ignorecase, !file.nonword), strings.Join(terms, "|")))
	if err != nil {
		return nil, err
	}
	except, err := exceptionsOf(file.exceptions)
	if err != nil {
		return nil, err
	}
	message := file.head.message
	return func(text string) []hit {
		out := []hit{}
		m, _ := re.FindStringMatch(text)
		for ; m != nil; m, _ = re.FindNextMatch(m) {
			groups := m.Groups()
			for index := 1; index < len(groups); index++ {
				if len(groups[index].Captures) == 0 {
					continue
				}
				begin, size := groups[index].ByteRange()
				observed := text[begin : begin+size]
				expected := swaps[index-1].offer
				if groupRef.MatchString(expected) {
					if filled, err := finders[index-1].Replace(observed, expected, -1, -1); err == nil {
						expected = filled
					}
				}
				action := file.action
				said := message
				var same bool
				if action.Name == actionReplace {
					same = contains(optionsOf(expected), observed)
				} else {
					same = matchToken(expected, observed)
				}
				if !same && !matches(except, observed) {
					if action.Name == actionReplace && len(action.Params) == 0 {
						action.Params = optionsOf(expected)
						expected = toSentence(action.Params)
						said = unquoteFirst(said)
					}
					out = append(out, hit{begin: begin, end: begin + size, match: observed, message: formatMessage(said, expected, observed), action: action})
				}
				break
			}
		}
		return out
	}, nil
}

// An occurrence rule: past its max or short of its min, a finding on its first match that is no masked code. [[spec/design_output/rules#the-token-kinds]]
func occurrenceOf(file ruleFile) (func(string) []hit, error) {
	expr := `(?:` + file.token + `)`
	if file.ignorecase {
		expr = ignoreCase + expr
	}
	re, err := compiled(expr)
	if err != nil {
		return nil, err
	}
	return func(text string) []hit {
		locs := allIndex(re, text)
		count := len(locs)
		if !((file.max > 0 && count > file.max) || (file.min > 0 && count < file.min)) {
			return nil
		}
		message := formatMessage(file.head.message, count)
		if count == 0 {
			word := firstWord.FindStringIndex(text)
			if word == nil {
				return nil
			}
			return []hit{{begin: word[0], end: word[1], match: text[word[0]:word[1]], message: message, action: file.action}}
		}
		for _, loc := range locs {
			match := text[loc[0]:loc[1]]
			if strings.TrimSpace(match) == "" || maskedCode(match) {
				continue
			}
			return []hit{{begin: loc[0], end: loc[1], match: match, message: message, action: file.action}}
		}
		return nil
	}, nil
}

// Whether a match is all mask, the code the text model hid. [[spec/design_output/rules#the-text-model]]
func maskedCode(said string) bool {
	for _, one := range said {
		if one != maskCode && one != maskDone {
			return false
		}
	}
	return true
}

// Whether the observed text already stands as the offer reads it. [[spec/design_output/rules#the-token-kinds]]
func matchToken(expected, observed string) bool {
	re, err := compiled(fmt.Sprintf(tokenTemplate, expected))
	if phrase(expected) || err != nil {
		return expected == observed
	}
	return matches(re, observed)
}

// Whether a text holds letters, digits, spaces and hyphens alone. [[spec/design_output/rules#the-token-kinds]]
func phrase(said string) bool {
	for _, one := range said {
		if !unicode.IsLetter(one) && one != ' ' && !unicode.IsDigit(one) && one != '-' {
			return false
		}
	}
	return true
}

// The offers of a swap, split at each unescaped bar. [[spec/design_output/rules#a-finding-carries-its-fix]]
func optionsOf(said string) []string {
	out := []string{}
	parts, err := unescPipe.Split(said, -1)
	if err != nil {
		return []string{said}
	}
	for _, part := range parts {
		if part != "" {
			out = append(out, strings.ReplaceAll(part, `\|`, `|`))
		}
	}
	return out
}

// The offers as one quoted phrase joined by or. [[spec/design_output/rules#a-finding-carries-its-fix]]
func toSentence(words []string) string {
	quoted := make([]string, len(words))
	for at, word := range words {
		quoted[at] = "'" + word + "'"
	}
	switch len(quoted) {
	case 0:
		return ""
	case 1:
		return quoted[0]
	case 2:
		return quoted[0] + " " + choiceWord + " " + quoted[1]
	}
	quoted[len(quoted)-1] = choiceWord + " " + quoted[len(quoted)-1]
	return strings.Join(quoted, ", ")
}

// The message with its first quoted slot unquoted, since the offers arrive quoted. [[spec/design_output/rules#a-finding-carries-its-fix]]
func unquoteFirst(said string) string {
	for _, slot := range []string{"'%s'", `"%s"`} {
		if strings.Count(said, slot) == 2 {
			said = strings.Replace(said, slot, "%s", 1)
		}
	}
	return said
}

// Whether a list holds a text. [[spec/design_output/rules#the-token-kinds]]
func contains(list []string, said string) bool {
	for _, one := range list {
		if one == said {
			return true
		}
	}
	return false
}

// The message with each slot filled in order, and a slot past the values left empty. [[spec/design_output/rules#the-token-kinds]]
func formatMessage(message string, values ...any) string {
	values = append(values, "")
	return fmt.Sprintf(message+fmt.Sprint("%[", len(values), "]s"), values...)
}
