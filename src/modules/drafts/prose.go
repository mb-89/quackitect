// The prose check, off readsDraft in src/bridge/prose.js and proseFaults in
// src/bridge/write.js, and the wording both checks answer in, off
// answerFindings in lib/refuse.js.
// [[spec/tickets/prose-tools-answer-in-go]]
package drafts

import (
	"regexp"
	"strconv"
	"strings"

	"quackitect/src/prose"
)

// What a check says where it reads no draft, where it reads one clean, and the head of a refusal and of a reading under the ceiling. [[spec/tickets/prose-tools-answer-in-go]]
const (
	noPath    = "This call names no path, and the rules read the kind a path names."
	noText    = "This call carries no text, so there is no draft to read."
	clean     = "No finding stands in this answer, so it meets the gate clean."
	rewriteIt = "The voice rules refuse this answer. Write it again."
	underIt   = "The voice rules read this answer, and it stands under the ceiling."
)

// The rule a lint that ran nowhere names, the reason where Vale gives none, and the vocabulary rule's ending. [[spec/design_output/level0#a-broken-rule-says-so]]
const (
	unranRule  = "VoiceRulesRan"
	unranWhy   = "vale answered nothing"
	vocabulary = "Vocabulary"
	termsFile  = "spec/vocabulary/terms.yml"
	wordsShown = 5
	saidCut    = 72
	ellipsis   = "..."
)

// A code path, which no voice rule reads, and a prose path, which a lint that ran nowhere refuses. [[spec/design_output/level0#a-broken-rule-says-so]]
var (
	codePath  = regexp.MustCompile(`(?i)\.(js|jsx|ts|tsx|json|jsonc)$`)
	prosePath = regexp.MustCompile(`(?i)\.(md|markdown|txt)$`)
)

// [[spec/design_output/level0#a-note-reads-clean-first]]
func (from Outside) readsDraft(in Prose) string {
	if in.Path == "" {
		return noPath
	}
	if in.Text == "" {
		return noText
	}
	found := from.proseFaults(in.Text, in.Path)
	return answerFindings(in.Path, found, len(found) > 0)
}

// The findings a note meets: none on a code path or a box with no Vale, the fault where Vale ran nowhere over prose, else the kept rows with their lines. [[spec/design_output/level0#a-broken-rule-says-so]]
func (from Outside) proseFaults(text, where string) []prose.Refused {
	if codePath.MatchString(where) {
		return nil
	}
	linted := from.Lint(text, where)
	if !linted.Stands {
		return nil
	}
	if !linted.Ran {
		if !prosePath.MatchString(where) {
			return nil
		}
		why := linted.Why
		if why == "" {
			why = unranWhy
		}
		return []prose.Refused{{Line: 1, Column: 1, Rule: unranRule, Message: "The voice rules did not run over this file: " + why + ". Mend the rule or the setup it names, and write again."}}
	}
	return withContext(text, linted.Found)
}

// Each row Vale keeps, with its trimmed line as context, off withContext in src/bridge/prose.js. [[spec/tickets/prose-tools-answer-in-go]]
func withContext(text string, found []Finding) []prose.Refused {
	lines := strings.Split(text, "\n")
	out := make([]prose.Refused, 0, len(found))
	for _, one := range found {
		context := ""
		if one.Line >= 1 && one.Line <= len(lines) {
			context = strings.TrimSpace(lines[one.Line-1])
		}
		out = append(out, prose.Refused{Line: one.Line, Column: one.Column, Rule: one.Rule, Message: one.Message, Said: one.Said, Context: context})
	}
	return out
}

// The wording a check answers in, the road for a word off the list after the body. The score reaches no answer, since a number names nothing to fix. [[spec/design_output/level0#what-the-gate-says]]
func answerFindings(where string, found []prose.Refused, rewrite bool) string {
	if len(found) == 0 {
		return clean
	}
	head := underIt
	if rewrite {
		head = rewriteIt
	}
	cut := make([]prose.Refused, len(found))
	for at, one := range found {
		one.Said = cutOf(one.Said)
		cut[at] = one
	}
	said := head + "\n\n" + prose.Body(where, cut)
	if road := grown(found); road != "" {
		said += "\n\n" + road
	}
	return said
}

// The two roads a word off the list has, off grown in lib/refuse.js. [[spec/design_output/vocabulary#the-vocabulary-is-three-lists]]
func grown(found []prose.Refused) string {
	var words []string
	seen := map[string]bool{}
	for _, one := range found {
		word := strings.ToLower(strings.TrimSpace(one.Said))
		if strings.HasSuffix(one.Rule, vocabulary) && word != "" && !seen[word] {
			seen[word] = true
			words = append(words, "`"+word+"`")
		}
	}
	if len(words) == 0 {
		return ""
	}
	named := strings.Join(words[:min(len(words), wordsShown)], ", ")
	if len(words) > wordsShown {
		named += ", and " + strconv.Itoa(len(words)-wordsShown) + " more"
	}
	return strings.Join([]string{
		"A word outside the core is jargon until a term says what it means. Write a core word, or",
		"add " + named + " to " + termsFile + " with one line that says what it means, as",
		"`- {word: <the word>, means: \"<one line>\"}` in core words and other terms,",
		"and write the line again. The next write reads the new rule.",
	}, "\n")
}

// A text flattened to one line, cut at a count of letters, off cut in lib/refuse.js. [[spec/tickets/prose-tools-answer-in-go]]
func cutOf(said string) string {
	letters := []rune(strings.Join(strings.Fields(said), " "))
	if len(letters) > saidCut {
		return string(letters[:saidCut-len(ellipsis)]) + ellipsis
	}
	return string(letters)
}
