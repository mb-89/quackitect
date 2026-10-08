// The sequence kind, ported off Vale under its MIT licence: a run of words,
// each by its pattern and its part of speech, anchored on its first pattern
// and walked out both ways over the tagged sentence.
// [[spec/design_output/rules#the-token-kinds]]
package rules

import (
	"fmt"
	"strings"

	"github.com/dlclark/regexp2/v2"
	"github.com/jdkato/prose/v3/tag"
)

const (
	sentenceScopeName  = "sentence"
	paragraphScopeName = "paragraph"
)

// One expanded token of a sequence, with its compiled tests. [[spec/design_output/rules#the-token-kinds]]
type seqToken struct {
	seqField
	re, tagRe, tokenRe *regexp2.Regexp
	optional, start    bool
	end                bool
	group              int
}

// One sequence hit: the words' text, the anchor word, and the word range it covers. [[spec/design_output/rules#the-token-kinds]]
type seqMatch struct {
	text   []string
	index  int
	lo, hi int
}

// Whether a sequence hit names words. [[spec/design_output/rules#the-token-kinds]]
func (m seqMatch) ok() bool { return len(m.text) > 0 && m.lo >= 0 && m.hi >= m.lo }

// A sequence rule over the tagged words of a sentence. [[spec/design_output/rules#the-token-kinds]]
func sequenceOf(file ruleFile) (func(string) []hit, error) {
	toks := []seqToken{}
	group := 0
	for _, field := range file.sequence {
		reps := max(field.Min, 1)
		for range reps {
			group++
			one := seqToken{seqField: field, group: group, optional: true}
			for at := field.Skip; at > 0; at-- {
				one.start = at == field.Skip
				toks = append(toks, one)
			}
			if field.Pattern != "" || field.Tag != "" {
				one.optional, one.start, one.end = false, false, true
				toks = append(toks, one)
			}
		}
	}
	for at := range toks {
		var err error
		if toks[at].Tag != "" {
			if toks[at].tagRe, err = compiled(toks[at].Tag); err != nil {
				return nil, err
			}
		}
		if toks[at].Pattern != "" {
			if toks[at].re, err = compiled(fmt.Sprintf(template(file.ignorecase, false), toks[at].Pattern)); err != nil {
				return nil, err
			}
			anchored := fmt.Sprintf(tokenTemplate, toks[at].Pattern)
			if file.ignorecase {
				anchored = ignoreCase + anchored
			}
			if toks[at].tokenRe, err = compiled(anchored); err != nil {
				return nil, err
			}
		}
	}
	excepts := []*regexp2.Regexp{}
	for _, pattern := range file.exceptions {
		re, err := compiled(pattern)
		if err != nil {
			return nil, err
		}
		excepts = append(excepts, re)
	}
	idx, anchor, ok := seqAnchor(toks)
	return func(text string) []hit {
		if !ok {
			return nil
		}
		words := taggedWords(text)
		var excluded [][]int
		for _, re := range excepts {
			excluded = append(excluded, allIndex(re, text)...)
		}
		count := len(words)
		if anchor.re != nil {
			count = len(allIndex(anchor.re, text))
		}
		out := []hit{}
		history := []int{}
		for range count {
			m := seqMatches(idx, toks, anchor, words, history)
			history = append(history, m.index)
			if !m.ok() || m.hi >= len(words) {
				continue
			}
			begin := words[m.lo].Start
			end := words[m.hi].Start + len(words[m.hi].Text)
			if begin < 0 || end > len(text) || begin >= end || beginsInside(excluded, begin) {
				continue
			}
			values := make([]any, len(m.text))
			for at, word := range m.text {
				values[at] = word
			}
			out = append(out, hit{begin: begin, end: end, match: text[begin:end], message: formatMessage(file.head.message, values...), action: file.action})
		}
		return out
	}, nil
}

// Whether a place falls inside any exception region. [[spec/design_output/rules#the-token-kinds]]
func beginsInside(spans [][]int, at int) bool {
	for _, span := range spans {
		if at >= span[0] && at < span[1] {
			return true
		}
	}
	return false
}

// The token the search starts from: the first pattern, else the first tag. [[spec/design_output/rules#the-token-kinds]]
func seqAnchor(toks []seqToken) (int, seqToken, bool) {
	for at, one := range toks {
		if !one.Negate && one.Pattern != "" {
			return at, one, true
		}
	}
	for at, one := range toks {
		if !one.Negate && one.Tag != "" {
			return at, one, true
		}
	}
	return 0, seqToken{}, false
}

// Whether every token left asserts an absence, which the sentence's edge holds. [[spec/design_output/rules#the-token-kinds]]
func negatedToBoundary(toks []seqToken) bool {
	for _, one := range toks {
		if !one.Negate {
			return false
		}
	}
	return true
}

// Whether one word meets one token, by its tag and its text. [[spec/design_output/rules#the-token-kinds]]
func tokensMatch(one seqToken, word tag.Token) bool {
	failedTag := (one.tagRe == nil || matches(one.tagRe, word.Tag)) == one.Negate
	failedTok := one.tokenRe != nil && matches(one.tokenRe, word.Text) == one.Negate
	return !((one.Pattern == "" && failedTag) || (one.Tag == "" && failedTok) || (one.Tag != "" && one.Pattern != "") && (failedTag || failedTok))
}

// Whether a list holds a number. [[spec/design_output/rules#the-token-kinds]]
func holdsIndex(list []int, at int) bool {
	for _, one := range list {
		if one == at {
			return true
		}
	}
	return false
}

// The next sequence hit past the anchors already tried, walked left then right from the anchor word. [[spec/design_output/rules#the-token-kinds]]
func seqMatches(idx int, toks []seqToken, target seqToken, words []tag.Token, history []int) seqMatch {
	var text []string
	sizeT, sizeW := len(toks), len(words)
	index, lo, hi := 0, -1, -1
	miss := func() seqMatch { return seqMatch{index: index, lo: -1, hi: -1} }
	for jdx, word := range words {
		if !tokensMatch(target, word) || holdsIndex(history, jdx) {
			continue
		}
		index = jdx
		if idx > 0 {
			ti, wi := idx-1, jdx-1
			for ti >= 0 {
				if wi < 0 {
					if negatedToBoundary(toks[:ti+1]) {
						break
					}
					return miss()
				}
				one := toks[ti]
				text = append([]string{words[wi].Text}, text...)
				lo = wi
				if one.Skip > 0 {
					one.optional = (one.optional || one.end) && !one.start
				}
				mat := tokensMatch(one, words[wi])
				switch {
				case !mat && !one.optional:
					return miss()
				case mat && one.optional:
					for ti >= 0 && toks[ti].group == one.group {
						ti--
					}
					wi--
				default:
					ti--
					wi--
				}
			}
		}
		if idx < sizeT {
			ti, wi := idx, jdx
			for ti < sizeT {
				if wi >= sizeW {
					if negatedToBoundary(toks[ti:]) {
						break
					}
					return miss()
				}
				one := toks[ti]
				text = append(text, words[wi].Text)
				if lo < 0 || wi < lo {
					lo = wi
				}
				hi = wi
				mat := tokensMatch(one, words[wi])
				switch {
				case !mat && !one.optional:
					return miss()
				case mat && one.optional:
					for ti < sizeT && toks[ti].group == one.group {
						ti++
					}
					wi++
				default:
					ti++
					wi++
				}
			}
		}
		break
	}
	return seqMatch{text: text, index: index, lo: lo, hi: hi}
}

// The scopes a sequence reads, narrowed to the sentences inside them, since it tags a sentence at a time. [[spec/design_output/rules#the-token-kinds]]
func sentenceScope(declared []string, check string) []string {
	if len(declared) == 0 || (len(declared) == 1 && declared[0] == defaultScope) {
		return []string{sentenceScopeName}
	}
	out := []string{}
	for _, one := range declared {
		rest, isParagraph := strings.CutPrefix(one, paragraphScopeName)
		switch {
		case one == sentenceScopeName || strings.HasPrefix(one, sentenceScopeName+"."):
			out = append(out, one)
		case strings.HasPrefix(one, "~"):
			out = append(out, one)
		case isParagraph && (rest == "" || strings.HasPrefix(rest, ".")):
			out = append(out, sentenceScopeName+rest)
		default:
			out = append(out, sentenceScopeName+"."+one)
		}
	}
	return out
}

// One part of a scope: the sections it names, and whether it names what to leave. [[spec/design_output/rules#the-text-model]]
type selector struct {
	sections []string
	negated  bool
}

// A rule's scope: any of its options, each the parts joined by an ampersand. [[spec/design_output/rules#the-text-model]]
type ruleScope [][]selector

// Reads a rule's scope list. [[spec/design_output/rules#the-text-model]]
func scopeOf(values []string) ruleScope {
	out := ruleScope{}
	for _, value := range values {
		option := []selector{}
		for _, part := range strings.Split(value, "&") {
			part = strings.TrimSpace(part)
			negated := strings.HasPrefix(part, "~")
			option = append(option, selector{sections: strings.Split(strings.TrimPrefix(part, "~"), "."), negated: negated})
		}
		out = append(out, option)
	}
	return out
}

// Whether a block of the scope reads under the rule: a sentence block only where the rule asks for sentences. [[spec/design_output/rules#the-text-model]]
func (scope ruleScope) matches(blockScope string) bool {
	target := strings.Split(blockScope, ".")
	fragment := strings.HasPrefix(blockScope, sentenceScopeName+".")
	for _, option := range scope {
		if fragment && !asksForSentence(option) {
			continue
		}
		if partsMatch(target, option) {
			return true
		}
	}
	return false
}

// Whether an option names the sentence. [[spec/design_output/rules#the-text-model]]
func asksForSentence(option []selector) bool {
	for _, part := range option {
		if !part.negated && contains(part.sections, sentenceScopeName) {
			return true
		}
	}
	return false
}

// Whether the block's sections hold each part, and none of a negated one. [[spec/design_output/rules#the-text-model]]
func partsMatch(target []string, option []selector) bool {
	for _, part := range option {
		holds := true
		for _, section := range part.sections {
			if !contains(target, section) {
				holds = false
			}
		}
		if holds == part.negated {
			return false
		}
	}
	return true
}
