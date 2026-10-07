// The script rules of the VoiceShape style: the shape of a guidance note, a
// stop rule and a vocabulary entry, each a port of its Tengo script.
// [[spec/design_output/rules#a-script-answers-offsets]]
package rules

import (
	"regexp"
	"strings"
)

var shapeActionables = regexp.MustCompile(`^#+\s+Actionables\s*$`)
var shapeHeading = regexp.MustCompile(`^#+\s`)
var shapeNumbered = regexp.MustCompile(`^[0-9]+\.\s+\S`)

// Walks the Actionables chapter of a note, handing each numbered rule and its line to see. [[spec/design_output/rules#a-script-answers-offsets]]
func shapeRules(text string, see func(line voiceLine, trimmed string)) {
	chapter := false
	for _, line := range voiceLines(text) {
		trimmed := strings.TrimSpace(line.text)
		if shapeActionables.MatchString(trimmed) {
			chapter = true
			continue
		}
		if !chapter {
			continue
		}
		if shapeHeading.MatchString(trimmed) {
			chapter = false
			continue
		}
		if shapeNumbered.MatchString(trimmed) {
			see(line, trimmed)
		}
	}
}

// VoiceShape.GuidanceCap: every rule past the cap of the Actionables chapter. [[spec/design_output/rules#a-script-answers-offsets]]
func guidanceCap(in scriptIn) []scriptMatch {
	out := []scriptMatch{}
	rules := 0
	shapeRules(in.Text, func(line voiceLine, _ string) {
		rules++
		if rules > voiceGuidanceCap {
			out = append(out, voiceWhole(line))
		}
	})
	return out
}

// VoiceShape.GuidanceChapter: a note with no numbered rule under Actionables, placed on its first line. [[spec/design_output/rules#a-script-answers-offsets]]
func guidanceChapter(in scriptIn) []scriptMatch {
	rules := 0
	shapeRules(in.Text, func(voiceLine, string) { rules++ })
	if rules > 0 {
		return []scriptMatch{}
	}
	first, _, _ := strings.Cut(in.Text, "\n")
	return []scriptMatch{{Begin: 0, End: len(strings.TrimSpace(first))}}
}

var shapeEnvName = regexp.MustCompile(`^[A-Z][A-Z0-9_]*$`)

// VoiceShape.GuidanceEnv: an env entry of the front matter written other than in capitals, digits and underscores. [[spec/design_output/rules#a-script-answers-offsets]]
func guidanceEnv(in scriptIn) []scriptMatch {
	out := []scriptMatch{}
	front, reading, seen := false, false, 0
	for _, line := range voiceLines(in.Text) {
		trimmed := strings.TrimSpace(line.text)
		if trimmed == "---" {
			seen++
			front = seen == 1
			if seen > 1 {
				break
			}
			continue
		}
		if !front {
			continue
		}
		if rest, ok := strings.CutPrefix(trimmed, "env:"); ok {
			reading = true
			rest = strings.TrimSpace(rest)
			if rest != "" && !shapeEnvName.MatchString(rest) {
				out = append(out, voiceWhole(line))
			}
			continue
		}
		if !reading {
			continue
		}
		if strings.HasPrefix(trimmed, "- ") {
			if !shapeEnvName.MatchString(strings.TrimSpace(trimmed[1:])) {
				out = append(out, voiceWhole(line))
			}
			continue
		}
		if trimmed != "" {
			reading = false
		}
	}
	return out
}

var shapeMarked = regexp.MustCompile(`\*\s*$`)
var shapeNumber = regexp.MustCompile(`^[0-9]+\.\s+`)
var shapeMark = regexp.MustCompile(`\s*\*\s*$`)
var shapeSpan = regexp.MustCompile("`[^`]*`")
var shapeLink = regexp.MustCompile(`\[\[[^\]]*\]\]`)
var shapeSentenceEnd = regexp.MustCompile(`[.!?]+(?:\s|$)`)

// The sentences of a rule's body, past its code spans and links. [[spec/design_output/rules#a-script-answers-offsets]]
func shapeSentences(said string) int {
	bare := shapeLink.ReplaceAllString(shapeSpan.ReplaceAllString(said, " "), " ")
	count := 0
	for _, part := range shapeSentenceEnd.Split(bare, -1) {
		if strings.TrimSpace(part) != "" {
			count++
		}
	}
	return count
}

// VoiceShape.MarkedRuleNamesFailure: a starred rule of one sentence alone. [[spec/design_output/rules#a-script-answers-offsets]]
func markedRuleNamesFailure(in scriptIn) []scriptMatch {
	out := []scriptMatch{}
	shapeRules(in.Text, func(line voiceLine, trimmed string) {
		if !shapeMarked.MatchString(trimmed) {
			return
		}
		body := shapeMark.ReplaceAllString(shapeNumber.ReplaceAllString(trimmed, ""), "")
		if shapeSentences(body) < 2 {
			out = append(out, voiceWhole(line))
		}
	})
	return out
}

var stopOpen = regexp.MustCompile(`^-\s+id:\s*\S`)
var stopIDLead = regexp.MustCompile(`^-\s+id:\s*`)
var stopField = regexp.MustCompile(`^([a-z]+):\s*(\S.*)$`)
var stopNeeds = []string{"id", "side", "priority", "decides", "says"}

// VoiceShape.StopRule: a stop rule missing a field or naming a side past stop and continue, placed on its first byte. [[spec/design_output/rules#a-script-answers-offsets]]
func stopRule(in scriptIn) []scriptMatch {
	out := []scriptMatch{}
	var held map[string]string
	at, open := 0, false
	closed := func() {
		if !open {
			return
		}
		whole := true
		for _, field := range stopNeeds {
			if _, ok := held[field]; !ok {
				whole = false
			}
		}
		side := held["side"]
		if !whole || (side != "stop" && side != "continue") {
			out = append(out, scriptMatch{Begin: at, End: at + 1})
		}
	}
	for _, line := range voiceLines(in.Text) {
		trimmed := strings.TrimSpace(line.text)
		if strings.HasPrefix(trimmed, "#") {
			continue
		}
		if stopOpen.MatchString(trimmed) {
			closed()
			held = map[string]string{"id": strings.TrimSpace(stopIDLead.ReplaceAllString(trimmed, ""))}
			open, at = true, line.at
			continue
		}
		if !open {
			continue
		}
		if found := stopField.FindStringSubmatch(trimmed); found != nil {
			held[found[1]] = strings.TrimSpace(found[2])
		}
	}
	closed()
	return out
}

var entryWord = regexp.MustCompile(`^[a-z][a-z-]*( [a-z][a-z-]*)*$`)
var entryFrom = regexp.MustCompile(`^(ste|openste|common|pronoun)$`)
var entryMeans = regexp.MustCompile(`, means: "[^",:\[\]{}]+"(,|\}$)`)
var entrySourceHeld = regexp.MustCompile(`, source: `)
var entrySource = regexp.MustCompile(`, source: "https?://[^\s",]+"(,|\}$)`)
var entryKinds = map[string]string{"words:": "core", "terms:": "term", "swaps:": "swap"}

// The fields of one entry, split on the comma and then the first colon. [[spec/design_output/rules#a-script-answers-offsets]]
func entryFields(body string) map[string]string {
	held := map[string]string{}
	for _, part := range strings.Split(body, ",") {
		key, value, ok := strings.Cut(part, ":")
		if ok {
			held[strings.TrimSpace(key)] = strings.TrimSpace(value)
		}
	}
	return held
}

// What one entry answers under its list, each message a match over its whole line. [[spec/design_output/rules#a-script-answers-offsets]]
func entrySays(kind, trimmed string) []string {
	if !strings.HasSuffix(trimmed, "}") {
		return []string{"An entry stands on one line, and this one leaves its brace open."}
	}
	held := entryFields(trimmed[voiceEntryOpen : len(trimmed)-1])
	word := held["word"]
	if word == "" {
		return []string{"An entry names its word. Write word: <the word> first."}
	}
	if !entryWord.MatchString(word) {
		return []string{word + " stands outside the shape of a word: lower case letters, a hyphen, and a space between two words."}
	}
	says := []string{}
	switch kind {
	case "core":
		if !entryFrom.MatchString(held["from"]) {
			says = append(says, "A core entry says where it comes from. Write from: ste, openste, common or pronoun.")
		}
	case "term":
		if _, ok := held["defines"]; ok || strings.Contains(trimmed, "[[") {
			says = append(says, word+" points at a note in the tree. Say what it means under means, and cite an outside source under source.")
		}
		if !entryMeans.MatchString(trimmed) {
			says = append(says, word+" says nothing of what it means. Write means: \"<one line>\" in core words and other terms, with no comma, colon or bracket.")
		}
		if entrySourceHeld.MatchString(trimmed) && !entrySource.MatchString(trimmed) {
			says = append(says, word+" cites a source that is no web address. Write source: \"https://<the address>\".")
		}
	case "swap":
		if held["write"] == "" {
			says = append(says, "A swap names the core word to write. Write write: <the word>.")
		}
	default:
		says = append(says, "An entry stands under words:, terms: or swaps:, and this one stands under none.")
	}
	return says
}

// VoiceShape.VocabularyEntry: an entry of a vocabulary list missing what its list asks. [[spec/design_output/rules#a-script-answers-offsets]]
func vocabularyEntry(in scriptIn) []scriptMatch {
	out := []scriptMatch{}
	kind := ""
	for _, line := range voiceLines(in.Text) {
		trimmed := strings.TrimSpace(line.text)
		if named, ok := entryKinds[trimmed]; ok {
			kind = named
			continue
		}
		if !strings.HasPrefix(trimmed, "- {") {
			continue
		}
		for _, said := range entrySays(kind, trimmed) {
			match := voiceWhole(line)
			match.Message = said
			out = append(out, match)
		}
	}
	return out
}
