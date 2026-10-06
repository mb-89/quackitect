// A block of prose a rule reads, where it stands in the source, and the
// paragraphs and sentences inside it, ported off Vale's nlp under its MIT
// licence over the prose segmenter and tagger.
// [[spec/design_output/rules#the-text-model]]
package rules

import (
	"strings"
	"sync"
	"unicode"
	"unicode/utf8"

	"github.com/jdkato/prose/v3/segment"
	"github.com/jdkato/prose/v3/tag"
	"github.com/jdkato/prose/v3/tokenize"
)

const (
	maxOffsetScan  = 8 << 10
	paragraphBreak = "\n\n"
)

var (
	segmenter = sync.OnceValues(segment.New)
	tagger    = sync.OnceValues(func() (tag.Interface, error) { return tag.Open("") })
)

// One run of a block's text that came verbatim from the source. [[spec/design_output/rules#the-text-model]]
type run struct {
	at, src, n int
}

// One block a rule reads: its text and scope, and where it stands in the source, by its offset or its runs, with the floor a search starts from where neither places a match. [[spec/design_output/rules#the-text-model]]
type block struct {
	text, scope string
	offset      int
	runs        []run
	floor       int
}

// Where a byte of the block's text stands in the source, or -1. [[spec/design_output/rules#the-text-model]]
func (b block) source(at int) int {
	if b.offset >= 0 {
		return b.offset + at
	}
	for _, one := range b.runs {
		if at >= one.at && at < one.at+one.n {
			return one.src + (at - one.at)
		}
	}
	return -1
}

// The runs covering a stretch of the parent, rebased onto a block starting there. [[spec/design_output/rules#the-text-model]]
func runsWithin(parent []run, start, size int) []run {
	var out []run
	for _, one := range parent {
		lo, hi := max(one.at, start), min(one.at+one.n, start+size)
		if lo < hi {
			out = append(out, run{at: lo - start, src: one.src + (lo - one.at), n: hi - lo})
		}
	}
	return out
}

// The source offsets of a hit: off the block's offset or runs, else the match searched past the floor, skipping the copies before it in the block. [[spec/design_output/rules#the-text-model]]
func (b block) place(text string, found hit) (int, int, bool) {
	if b.offset >= 0 {
		begin, end := b.offset+found.begin, b.offset+found.end
		return begin, end, end <= len(text)
	}
	from, to := b.source(found.begin), b.source(found.end-1)
	if from >= 0 && to >= from {
		return from, to + 1, true
	}
	skip := countBounded(b.text[:found.begin], found.match)
	for at := max(b.floor, 0); at <= len(text); {
		next := strings.Index(text[at:], found.match)
		if next < 0 {
			return 0, 0, false
		}
		begin := at + next
		if bounded(text, begin, found.match) {
			if skip == 0 {
				return begin, begin + len(found.match), true
			}
			skip--
		}
		_, size := utf8.DecodeRuneInString(text[begin:])
		at = begin + max(size, 1)
	}
	return 0, 0, false
}

// The copies of a match in a text a search would take. [[spec/design_output/rules#the-text-model]]
func countBounded(text, match string) int {
	count := 0
	for at := 0; match != "" && at <= len(text); {
		next := strings.Index(text[at:], match)
		if next < 0 {
			break
		}
		if bounded(text, at+next, match) {
			count++
		}
		at += next + 1
	}
	return count
}

// Whether a copy of a match stands on word boundaries and clear of inline markup. [[spec/design_output/rules#the-text-model]]
func bounded(text string, at int, match string) bool {
	first, _ := utf8.DecodeRuneInString(match)
	last, _ := utf8.DecodeLastRuneInString(match)
	end := at + len(match)
	if at > 0 {
		prev, _ := utf8.DecodeLastRuneInString(text[:at])
		if prev != '_' && joinsWord(prev) == joinsWord(first) {
			return false
		}
	}
	if end < len(text) {
		next, _ := utf8.DecodeRuneInString(text[end:])
		if next != '_' && joinsWord(next) == joinsWord(last) {
			return false
		}
	}
	return !againstMarkup(text, at, end)
}

// Whether a match presses against a backtick, a dash or a dollar, as a match inside inline code or math does. [[spec/design_output/rules#the-text-model]]
func againstMarkup(text string, begin, end int) bool {
	if begin > 1 && (text[begin-1] == '`' || text[begin-1] == '-') {
		return true
	}
	if end+1 < len(text) && (text[end+1] == '`' || text[end+1] == '-') && !unicode.IsSpace(rune(text[end])) {
		return true
	}
	if end < len(text) && (text[end] == '`' || text[end] == '$') {
		return true
	}
	return begin > 0 && text[begin-1] == '$'
}

// Whether a rune sits inside a word. [[spec/design_output/rules#the-text-model]]
func joinsWord(one rune) bool {
	return unicode.IsLetter(one) || unicode.IsDigit(one)
}

// The sentences of a text, as the segmenter splits them. [[spec/design_output/rules#the-text-model]]
func sentencesOf(text string) []string {
	splitter, err := segmenter()
	if err != nil {
		return []string{text}
	}
	return splitter.SegmentText(text)
}

// The words of a text, each tagged with its part of speech, at its byte offset. [[spec/design_output/rules#the-token-kinds]]
func taggedWords(text string) []tag.Token {
	splitter, err := segmenter()
	if err != nil {
		return nil
	}
	model, err := tagger()
	if err != nil {
		return nil
	}
	var out []tag.Token
	for _, sentence := range splitter.Segment(text) {
		found := tokenize.New().Tokenize(sentence.Text)
		model.TagTokens(found)
		for at := range found {
			found[at].Start += sentence.Start
		}
		out = append(out, found...)
	}
	return out
}

// The block's offset where its text stands once in a context small enough to search. [[spec/design_output/rules#the-text-model]]
func resolved(b block, context []byte) int {
	if b.offset >= 0 {
		return b.offset
	}
	if b.text == string(context) {
		return 0
	}
	if len(context) > maxOffsetScan {
		return -1
	}
	first := strings.Index(string(context), b.text)
	if first < 0 || strings.Contains(string(context[first+len(b.text):]), b.text) {
		return -1
	}
	return first
}

// A block as prose: its paragraphs where it holds them, its sentences, and itself. [[spec/design_output/rules#the-text-model]]
func proseBlocks(parent block, context []byte, split bool) []block {
	base := resolved(parent, context)
	out := []block{}
	piece := func(text, scope string, cursor *int) {
		at := strings.Index(parent.text[*cursor:], text)
		if at < 0 {
			return
		}
		start := *cursor + at
		*cursor = start + len(text)
		one := block{text: text, scope: scope + "." + parent.scope, offset: -1, floor: parent.floor}
		if base >= 0 {
			one.offset = base + start
		} else {
			one.runs = runsWithin(parent.runs, start, len(text))
		}
		out = append(out, one)
	}
	if split {
		cursor := 0
		for _, paragraph := range strings.SplitAfter(parent.text, paragraphBreak) {
			piece(paragraph, paragraphScopeName, &cursor)
		}
	}
	cursor := 0
	for _, sentence := range sentencesOf(parent.text) {
		if sentence = strings.TrimSpace(sentence); sentence != "" {
			piece(sentence, sentenceScopeName, &cursor)
		}
	}
	whole := parent
	whole.offset = base
	return append(out, whole)
}
