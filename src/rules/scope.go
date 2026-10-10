// Which rule reads which path: the scope sections, in their order,
// each matching path turning its styles and rules on or off, the last word
// winning. [[spec/design_output/rules#a-rule-reads-its-paths]]
package rules

import (
	"regexp"
	"strings"
	"sync"
)

// One section: the glob it matches, the styles it bases a path on where it names any, and the rules it turns. [[spec/design_output/rules#a-rule-reads-its-paths]]
type section struct {
	glob  string
	based []string
	turns []turn
}

// One rule a section turns on or off, by its style and name. [[spec/design_output/rules#a-rule-reads-its-paths]]
type turn struct {
	check string
	on    bool
}

// The sections in the order a path meets them. [[spec/design_output/rules#a-rule-reads-its-paths]]
var sections = []section{
	{glob: "*.{md,markdown,txt}", based: []string{"VoiceVale", "VoiceParagraph"}, turns: []turn{{"VoiceParagraph.ShapeAnswer", false}, {"VoiceParagraph.ParagraphAnswer", false}, {"VoiceParagraph.ModalRequirement", false}, {"VoiceVale.CodeComment", false}, {"VoiceVale.CodeHeader", false}, {"VoiceVale.OutsideInDoors", false}, {"VoiceVale.FakeDoorsInTest", false}, {"VoiceVale.DigitInProse", false}}},
	{glob: "*.{js,ts,tsx,go}", based: []string{"VoiceVale", "VoiceParagraph"}, turns: []turn{{"VoiceVale.Private", false}, {"VoiceVale.CodeComment", true}, {"VoiceVale.CodeHeader", true}, {"VoiceVale.CountedList", false}, {"VoiceVale.FakeDoorsInTest", false}, {"VoiceVale.DigitInProse", false}, {"VoiceParagraph.Characters", false}, {"VoiceParagraph.ListItem", false}, {"VoiceParagraph.CodeSpans", false}, {"VoiceParagraph.Markup", false}, {"VoiceParagraph.Shape", false}, {"VoiceParagraph.ShapeAnswer", false}, {"VoiceParagraph.ParagraphAnswer", false}, {"VoiceParagraph.ModalRequirement", false}, {"VoiceParagraph.Vocabulary", false}}},
	{glob: "**/src/doors/*.js", turns: []turn{{"VoiceVale.OutsideInDoors", false}}},
	{glob: "**/src/doors/fake/*.js", turns: []turn{{"VoiceVale.OutsideInDoors", false}}},
	{glob: "**/src/{modules,q,quack}/**/*.go", turns: []turn{{"VoiceVale.FakeDoorsInTest", false}, {"VoiceVale.OutsideInDoors", false}}},
	{glob: "**/src/extension/*.js", turns: []turn{{"VoiceVale.OutsideInDoors", false}}},
	{glob: "**/.claude/skills/inset-probe/*.js", turns: []turn{{"VoiceVale.OutsideInDoors", false}}},
	{glob: "**/.claude/skills/level0/hooks/*.ts", turns: []turn{{"VoiceVale.OutsideInDoors", false}}},
	{glob: "**/src/stub/.claude/skills/level0/hooks/*.ts", turns: []turn{{"VoiceVale.OutsideInDoors", false}}},
	{glob: "**/test/level0/*.js", turns: []turn{{"VoiceVale.FakeDoorsInTest", true}, {"VoiceVale.OutsideInDoors", false}}},
	{glob: "**/test/contract/*.js", turns: []turn{{"VoiceVale.OutsideInDoors", false}}},
	{glob: "**/src/scripts/cli*.js", turns: []turn{{"VoiceVale.OutsideInDoors", false}}},
	{glob: "**/src/**/door.go", turns: []turn{{"VoiceVale.OutsideInDoors", false}}},
	{glob: "**/src/**/*_test.go", turns: []turn{{"VoiceVale.OutsideInDoors", false}}},
	{glob: "{level0-answer.md,**/level0-answer.md}", based: []string{"VoiceVale", "VoiceParagraph"}, turns: []turn{{"VoiceParagraph.ShapeAnswer", true}, {"VoiceParagraph.ParagraphAnswer", true}, {"VoiceParagraph.ModalRequirement", false}, {"VoiceParagraph.Shape", false}, {"VoiceParagraph.Paragraph", false}, {"VoiceParagraph.PastTense", false}}},
	{glob: "**/spec/design_output/*.md", turns: []turn{{"VoiceVale.DigitInProse", true}}},
	{glob: "**/spec/rationales/*.md", turns: []turn{{"VoiceVale.History", false}, {"VoiceVale.CountedList", false}, {"VoiceParagraph.Hedge", false}, {"VoiceParagraph.PastTense", false}, {"VoiceParagraph.Auxiliary", false}, {"VoiceParagraph.Progressive", false}, {"VoiceParagraph.Modal", false}}},
	{glob: "**/spec/design_input/*.md", turns: []turn{{"VoiceParagraph.Hedge", false}, {"VoiceParagraph.Modal", false}, {"VoiceVale.CountedList", false}, {"VoiceParagraph.ListItem", false}, {"VoiceParagraph.CodeSpans", false}, {"VoiceParagraph.Characters", false}, {"VoiceParagraph.ModalRequirement", true}}},
	{glob: "**/spec/tickets/*.md", turns: []turn{{"VoiceVale.History", false}, {"VoiceParagraph.PastTense", false}, {"VoiceParagraph.Auxiliary", false}, {"VoiceParagraph.Progressive", false}, {"VoiceParagraph.Modal", false}, {"VoiceParagraph.RestatedTable", false}, {"VoiceVale.CountedList", false}}},
	{glob: "**/.se/tickets/*.md", turns: []turn{{"VoiceVale.History", false}, {"VoiceParagraph.PastTense", false}, {"VoiceParagraph.Auxiliary", false}, {"VoiceParagraph.Progressive", false}, {"VoiceParagraph.Modal", false}, {"VoiceParagraph.RestatedTable", false}, {"VoiceVale.CountedList", false}}},
	{glob: "**/spec/guidance/*.md", based: []string{"VoiceVale", "VoiceParagraph", "VoiceShape"}, turns: []turn{{"VoiceParagraph.ShapeAnswer", false}, {"VoiceParagraph.ParagraphAnswer", false}, {"VoiceParagraph.ModalRequirement", false}, {"VoiceShape.StopRule", false}, {"VoiceShape.VocabularyEntry", false}}},
	{glob: "**/spec/guidance/*/*.md", based: []string{"VoiceVale", "VoiceParagraph", "VoiceShape"}, turns: []turn{{"VoiceParagraph.ShapeAnswer", false}, {"VoiceParagraph.ParagraphAnswer", false}, {"VoiceParagraph.ModalRequirement", false}, {"VoiceShape.StopRule", false}, {"VoiceShape.VocabularyEntry", false}}},
	{glob: "**/spec/vocabulary/*.yml", based: []string{"VoiceShape"}, turns: []turn{{"VoiceShape.GuidanceEnv", false}, {"VoiceShape.GuidanceChapter", false}, {"VoiceShape.GuidanceCap", false}, {"VoiceShape.StopRule", false}}},
	{glob: "*.{sh,ps1}", based: []string{"VoiceScript"}},
	{glob: "**/spec/config/stop/*.yml", based: []string{"VoiceShape"}, turns: []turn{{"VoiceShape.GuidanceEnv", false}, {"VoiceShape.GuidanceChapter", false}, {"VoiceShape.GuidanceCap", false}, {"VoiceShape.VocabularyEntry", false}}},
	{glob: "**/prototype/**/*.js", based: []string{}, turns: []turn{{"VoiceVale.CodeComment", false}, {"VoiceVale.CodeHeader", false}}},
	{glob: "{_*,**/_*}", based: []string{}},
	{glob: "**/src/imports/baseline/*.txt", based: []string{}},
}

var (
	globsOnce sync.Once
	globs     []*regexp.Regexp
)

// The glob as a pattern: a star crosses a folder, as Vale's glob reads it, a leading **/ matches the root or any folder, and a brace holds choices. [[spec/design_output/rules#a-rule-reads-its-paths]]
func globPattern(glob string) *regexp.Regexp {
	var out strings.Builder
	out.WriteString("^")
	for at := 0; at < len(glob); at++ {
		switch one := glob[at]; {
		case strings.HasPrefix(glob[at:], "**/"):
			out.WriteString("(?:.*/)?")
			at += 2
		case one == '*':
			out.WriteString(".*")
		case one == '?':
			out.WriteString(".")
		case one == '{':
			out.WriteString("(?:")
		case one == '}':
			out.WriteString(")")
		case one == ',':
			out.WriteString("|")
		default:
			out.WriteString(regexp.QuoteMeta(string(one)))
		}
	}
	out.WriteString("$")
	return regexp.MustCompile(out.String())
}

// Each rule the path turns on: every rule of the styles the last basing section names, turned by each matching section in order. [[spec/design_output/rules#a-rule-reads-its-paths]]
func turnedOn(path string, checks []string) map[string]bool {
	globsOnce.Do(func() {
		for _, one := range sections {
			globs = append(globs, globPattern(one.glob))
		}
	})
	path = strings.TrimPrefix(strings.ReplaceAll(path, "\\", "/"), "./")
	var based []string
	turned := map[string]bool{}
	for at, one := range sections {
		if !globs[at].MatchString(path) {
			continue
		}
		if one.based != nil {
			based = one.based
		}
		// An empty base reads no rule, so the turns before it fall with it. [[spec/design_output/rules#a-rule-reads-its-paths]]
		if one.based != nil && len(one.based) == 0 {
			turned = map[string]bool{}
		}
		for _, rule := range one.turns {
			turned[rule.check] = rule.on
		}
	}
	on := map[string]bool{}
	for _, check := range checks {
		if said, ok := turned[check]; ok {
			on[check] = said
			continue
		}
		style, _, _ := strings.Cut(check, ".")
		for _, one := range based {
			if one == style {
				on[check] = true
			}
		}
	}
	return on
}
