// The prose checks: the past, length and outside vetoes over Vale's
// findings, and the one copy every reader asks through quack prose.
// [[spec/tickets/go-prose-checks-stand-alone]]
package prose

import (
	"regexp"
	"strings"
	"unicode"
)

// The modes a request reads: every veto, or the past veto alone, which the check and the push door take. [[spec/tickets/prose-checks-run-in-go]]
const (
	All  = "all"
	Past = "past"
)

// The rule endings each veto reads, as Vale names them. [[spec/tickets/prose-checks-run-in-go]]
const (
	pastEnd     = "PastTense"
	sentenceEnd = "Sentence"
	itemEnd     = "ListItem"
	outsideEnd  = "Vocabulary"
)

// One Vale finding, in the shape the bridge hands it. [[spec/tickets/prose-checks-run-in-go]]
type Finding struct {
	Rule   string `json:"rule"`
	Line   int    `json:"line"`
	Column int    `json:"column"`
	Said   string `json:"said"`
}

// The word caps the paragraph schema sets on a sentence and a list item. [[spec/tickets/prose-checks-run-in-go]]
type Caps struct {
	Sentence int `json:"sentence"`
	ListItem int `json:"listItem"`
}

var (
	codeSpan = regexp.MustCompile("`[^`\n]*`")
	linkSpan = regexp.MustCompile(`\[\[[^\]]*\]\]|\[[^\]]*\]\([^)]*\)`)
	marker   = regexp.MustCompile(`^[ \t]*(?:[-*+]|[0-9]+[.)])\s+`)
	// A token carries a letter or a digit, so punctuation, symbols and space count as no word; an apostrophe opens a token of its own, so door's splits in two. [[spec/tickets/prose-checks-run-in-go]]
	tokenAt   = regexp.MustCompile(`['’]?[\p{L}\p{N}]+(?:[.\-_/][\p{L}\p{N}]+)*`)
	sentences = regexp.MustCompile(`[.!?]+(?:\s+|$)`)
	closesAt  = regexp.MustCompile(`[.!?](?:\s|$)`)
	blockOpen = regexp.MustCompile(`^[-*+#|]`)
)

// The tokens of a line, lower case. [[spec/tickets/prose-checks-run-in-go]]
func tokensOf(line string) []string {
	found := tokenAt.FindAllString(line, -1)
	for i, one := range found {
		found[i] = strings.ToLower(one)
	}
	return found
}

// Whether the word reads past in the line: a form that is its own lemma, or its -s or -ing form, reads present. [[spec/design_output/level0#the-tense-reader]]
func ReadsAsPast(line, word string) bool {
	wanted := strings.ToLower(strings.TrimSpace(word))
	if wanted == "" {
		return true
	}
	// A match holding no letter, such as a table bar the tagger reads as a verb, holds no tense. [[spec/design_output/level0#the-tense-reader]]
	if !strings.ContainsFunc(wanted, unicode.IsLetter) {
		return false
	}
	past := true
	for _, one := range tokensOf(line) {
		if one == wanted {
			past = isPast(one, Lemma(one))
		}
	}
	return past
}

// A form other than its lemma, its -s and its -ing reads past. [[spec/design_output/level0#the-tense-reader]]
func isPast(word, lemma string) bool {
	if lemma == "" || word == lemma || strings.HasSuffix(word, "ing") {
		return false
	}
	third := lemma
	if strings.HasSuffix(lemma, "y") {
		third = strings.TrimSuffix(lemma, "y") + "ies"
	}
	return word != lemma+"s" && word != lemma+"es" && word != third
}

// The word count of the longest sentence in the text, a code span and a link counted as one word each. [[spec/design_output/level0#the-tense-reader]]
func Longest(text string) int {
	blank := linkSpan.ReplaceAllString(codeSpan.ReplaceAllString(text, "code"), "note")
	most := 0
	for _, sentence := range sentences.Split(blank, -1) {
		most = max(most, len(tokensOf(sentence)))
	}
	return most
}

// The sentence a finding opens: its line from the column on, and the lines under it up to a blank line or a block, cut at the first stop. [[spec/design_output/level0#the-tense-reader]]
func sentenceAt(lines []string, one Finding) string {
	from := one.Line - 1
	if from < 0 || from >= len(lines) {
		return ""
	}
	first := []rune(lines[from])
	rest := []string{string(first[min(max(0, one.Column-1), len(first)):])}
	for at := from + 1; at < len(lines) && strings.TrimSpace(lines[at]) != "" && !blockOpen.MatchString(lines[at]); at++ {
		rest = append(rest, lines[at])
	}
	said := strings.Join(rest, " ")
	if end := closesAt.FindStringIndex(said); end != nil {
		return said[:end[0]+1]
	}
	return said
}

// The list item a finding stands in, past its marker. [[spec/design_output/level0#the-tense-reader]]
func itemAt(lines []string, one Finding) string {
	if one.Line < 1 || one.Line > len(lines) {
		return ""
	}
	return marker.ReplaceAllString(lines[one.Line-1], "")
}

// The lemma of the word where the line holds it, or nothing where it holds no such token. [[spec/tickets/prose-checks-run-in-go]]
func lemmaIn(line, word string) string {
	wanted := strings.ToLower(strings.TrimSpace(word))
	for _, one := range tokensOf(line) {
		if one == wanted {
			return Lemma(one)
		}
	}
	return ""
}

// The findings the vetoes leave standing, in the order they arrive. [[spec/tickets/prose-checks-run-in-go]]
func Kept(text string, found []Finding, caps Caps, words map[string]bool, mode string) []Finding {
	lines := strings.Split(text, "\n")
	out := []Finding{}
	for _, one := range found {
		if keeps(lines, one, caps, words, mode) {
			out = append(out, one)
		}
	}
	return out
}

// Whether one finding stands past the veto its rule meets. [[spec/tickets/prose-checks-run-in-go]]
func keeps(lines []string, one Finding, caps Caps, words map[string]bool, mode string) bool {
	line := ""
	if one.Line >= 1 && one.Line <= len(lines) {
		line = lines[one.Line-1]
	}
	switch {
	case strings.HasSuffix(one.Rule, pastEnd):
		return ReadsAsPast(line, one.Said)
	case mode == Past:
		return true
	case strings.HasSuffix(one.Rule, sentenceEnd):
		return Longest(sentenceAt(lines, one)) > caps.Sentence
	case strings.HasSuffix(one.Rule, itemEnd):
		return Longest(itemAt(lines, one)) > caps.ListItem
	case strings.HasSuffix(one.Rule, outsideEnd):
		lemma := lemmaIn(line, one.Said)
		return lemma == "" || !words[lemma]
	}
	return true
}
