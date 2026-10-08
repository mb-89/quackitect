// The script rules of the VoiceVale, VoiceShape and VoiceScript styles, each a
// port of its Tengo script over the raw text.
// [[spec/design_output/rules#a-script-answers-offsets]]
package rules

import (
	"regexp"
	"strings"
)

const (
	voiceFence       = "``" + "`"
	voiceHeaderLines = 5
	voiceGuidanceCap = 15
	voiceEntryOpen   = len("- {")
)

// The VoiceVale, VoiceShape and VoiceScript scripts by check id. [[spec/design_output/rules#a-script-answers-offsets]]
var voiceScripts = map[string]scriptMaker{
	"VoiceScript.NoPathInScript":        voicePlain(noPathInScript),
	"VoiceShape.GuidanceCap":            voicePlain(guidanceCap),
	"VoiceShape.GuidanceChapter":        voicePlain(guidanceChapter),
	"VoiceShape.GuidanceEnv":            voicePlain(guidanceEnv),
	"VoiceShape.MarkedRuleNamesFailure": voicePlain(markedRuleNamesFailure),
	"VoiceShape.StopRule":               voicePlain(stopRule),
	"VoiceShape.VocabularyEntry":        voicePlain(vocabularyEntry),
	"VoiceVale.CodeComment":             voicePlain(codeComment),
	"VoiceVale.CodeHeader":              voicePlain(codeHeader),
	"VoiceVale.CountedList":             voicePlain(countedList),
	"VoiceVale.DigitInProse":            voicePlain(digitInProse),
	"VoiceVale.FakeDoorsInTest":         voicePlain(fakeDoorsInTest),
	"VoiceVale.OutsideInDoors":          voicePlain(outsideInDoors),
	"VoiceVale.Private":                 voicePlain(private),
}

// A voice script reads no file past its own, so its maker answers it as it stands. [[spec/design_output/rules#a-script-answers-offsets]]
func voicePlain(run script) scriptMaker {
	return func(Read) (script, error) { return run, nil }
}

// One line of the raw text and the byte offset it starts at, as the Tengo split counts them. [[spec/design_output/rules#a-script-answers-offsets]]
type voiceLine struct {
	at   int
	text string
}

// The raw text split on the newline, each line with its offset. [[spec/design_output/rules#a-script-answers-offsets]]
func voiceLines(text string) []voiceLine {
	out := []voiceLine{}
	offset := 0
	for _, line := range strings.Split(text, "\n") {
		out = append(out, voiceLine{at: offset, text: line})
		offset += len(line) + 1
	}
	return out
}

// A match over the whole of one line. [[spec/design_output/rules#a-script-answers-offsets]]
func voiceWhole(line voiceLine) scriptMatch {
	return scriptMatch{Begin: line.at, End: line.at + len(line.text)}
}

// The first group of every hit of a pattern on one line, placed in the whole text. [[spec/design_output/rules#a-script-answers-offsets]]
func voiceGroups(pattern *regexp.Regexp, line string, at int) []scriptMatch {
	out := []scriptMatch{}
	for _, hit := range pattern.FindAllStringSubmatchIndex(line, -1) {
		out = append(out, scriptMatch{Begin: at + hit[2], End: at + hit[3]})
	}
	return out
}

var noPathShell = regexp.MustCompile(`(^|\s)(-e|--input-type|-Command|-c)\s`)
var noPathShape = regexp.MustCompile(`\$\{?[A-Za-z_][A-Za-z0-9_:]*\}?[/\\]|file:///\$|['"]\$\(`)

// VoiceScript.NoPathInScript: a shell line handing code to an interpreter names no interpolated path. [[spec/design_output/rules#a-script-answers-offsets]]
func noPathInScript(in scriptIn) []scriptMatch {
	out := []scriptMatch{}
	for _, line := range voiceLines(in.Text) {
		if strings.HasPrefix(strings.TrimSpace(line.text), "#") {
			continue
		}
		if noPathShell.MatchString(line.text) && noPathShape.MatchString(line.text) {
			out = append(out, voiceWhole(line))
		}
	}
	return out
}
