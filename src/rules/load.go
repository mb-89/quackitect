// The rule files Load reads, one row a rule, and each file's YAML as the
// fields its kind takes: the message, the level, the link, the scope, and the
// tokens, swaps or count a token rule matches with.
// [[spec/design_output/rules#load-reads-the-rule-files]]
package rules

import (
	"fmt"
	"path"
	"strings"

	goyaml "gopkg.in/yaml.v3"
)

const (
	kindExistence    = "existence"
	kindSubstitution = "substitution"
	kindOccurrence   = "occurrence"
	kindSequence     = "sequence"
	kindScript       = "script"
	defaultLevel     = "suggestion"
	defaultScope     = "text"
)

// Every rule file of the styles, which TestTheRuleTableNamesEveryStyleFile holds to the folder. [[spec/design_output/rules#load-reads-the-rule-files]]
var ruleFiles = []string{
	"spec/config/styles/VoiceParagraph/Auxiliary.yml",
	"spec/config/styles/VoiceParagraph/Characters.yml",
	"spec/config/styles/VoiceParagraph/CodeSpans.yml",
	"spec/config/styles/VoiceParagraph/Contraction.yml",
	"spec/config/styles/VoiceParagraph/EtCetera.yml",
	"spec/config/styles/VoiceParagraph/Hedge.yml",
	"spec/config/styles/VoiceParagraph/Latin.yml",
	"spec/config/styles/VoiceParagraph/ListItem.yml",
	"spec/config/styles/VoiceParagraph/Markup.yml",
	"spec/config/styles/VoiceParagraph/Modal.yml",
	"spec/config/styles/VoiceParagraph/ModalRequirement.yml",
	"spec/config/styles/VoiceParagraph/Paragraph.yml",
	"spec/config/styles/VoiceParagraph/ParagraphAnswer.yml",
	"spec/config/styles/VoiceParagraph/PastTense.yml",
	"spec/config/styles/VoiceParagraph/Progressive.yml",
	"spec/config/styles/VoiceParagraph/RestatedTable.yml",
	"spec/config/styles/VoiceParagraph/Sentence.yml",
	"spec/config/styles/VoiceParagraph/Shape.yml",
	"spec/config/styles/VoiceParagraph/ShapeAnswer.yml",
	"spec/config/styles/VoiceParagraph/Vocabulary.yml",
	"spec/config/styles/VoiceScript/NoPathInScript.yml",
	"spec/config/styles/VoiceShape/GuidanceCap.yml",
	"spec/config/styles/VoiceShape/GuidanceChapter.yml",
	"spec/config/styles/VoiceShape/GuidanceEnv.yml",
	"spec/config/styles/VoiceShape/MarkedRuleNamesFailure.yml",
	"spec/config/styles/VoiceShape/StopRule.yml",
	"spec/config/styles/VoiceShape/VocabularyEntry.yml",
	"spec/config/styles/VoiceVale/Antithesis.yml",
	"spec/config/styles/VoiceVale/CodeComment.yml",
	"spec/config/styles/VoiceVale/CodeHeader.yml",
	"spec/config/styles/VoiceVale/CountedList.yml",
	"spec/config/styles/VoiceVale/DigitInProse.yml",
	"spec/config/styles/VoiceVale/FakeDoorsInTest.yml",
	"spec/config/styles/VoiceVale/History.yml",
	"spec/config/styles/VoiceVale/OutsideInDoors.yml",
	"spec/config/styles/VoiceVale/Passive.yml",
	"spec/config/styles/VoiceVale/Private.yml",
	"spec/config/styles/VoiceVale/ShoutedLead.yml",
}

// What every rule says around its match: its check id, message, level and link. [[spec/design_output/rules#load-reads-the-rule-files]]
type ruleHead struct {
	check, message, level, link string
}

// One sequence token: the word it matches, the tag it wants, and how it repeats. [[spec/design_output/rules#the-token-kinds]]
type seqField struct {
	Pattern string `yaml:"pattern"`
	Tag     string `yaml:"tag"`
	Skip    int    `yaml:"skip"`
	Min     int    `yaml:"min"`
	Negate  bool   `yaml:"negate"`
}

// One swap of a substitution: the pattern it finds and the text it offers, in file order. [[spec/design_output/rules#the-token-kinds]]
type swapRow struct {
	find, offer string
}

// One rule file as its kind reads it. [[spec/design_output/rules#load-reads-the-rule-files]]
type ruleFile struct {
	head       ruleHead
	extends    string
	scope      []string
	ignorecase bool
	nonword    bool
	tokens     []string
	sequence   []seqField
	swaps      []swapRow
	exceptions []string
	action     Action
	max, min   int
	token      string
}

// The YAML of a rule file, as its fields arrive. [[spec/design_output/rules#load-reads-the-rule-files]]
type ruleYAML struct {
	Extends    string       `yaml:"extends"`
	Message    string       `yaml:"message"`
	Link       string       `yaml:"link"`
	Level      string       `yaml:"level"`
	Scope      goyaml.Node  `yaml:"scope"`
	Ignorecase bool         `yaml:"ignorecase"`
	Nonword    bool         `yaml:"nonword"`
	Tokens     goyaml.Node  `yaml:"tokens"`
	Swap       goyaml.Node  `yaml:"swap"`
	Exceptions []string     `yaml:"exceptions"`
	Action     actionFields `yaml:"action"`
	Max        int          `yaml:"max"`
	Min        int          `yaml:"min"`
	Token      string       `yaml:"token"`
}

// The action a rule file names. [[spec/design_output/rules#a-finding-carries-its-fix]]
type actionFields struct {
	Name   string   `yaml:"name"`
	Params []string `yaml:"params"`
}

// Reads one rule file: its check id off the path, and the fields its kind takes. [[spec/design_output/rules#load-reads-the-rule-files]]
func parseRule(file, text string) (ruleFile, error) {
	check := path.Base(path.Dir(file)) + "." + strings.TrimSuffix(path.Base(file), path.Ext(file))
	var raw ruleYAML
	if err := goyaml.Unmarshal([]byte(text), &raw); err != nil {
		return ruleFile{}, fmt.Errorf("%s: %w", file, err)
	}
	if raw.Extends == "" {
		return ruleFile{}, fmt.Errorf("%s names no kind under extends", file)
	}
	level := raw.Level
	if level == "" {
		level = defaultLevel
	}
	out := ruleFile{
		head:       ruleHead{check: check, message: raw.Message, level: level, link: raw.Link},
		extends:    raw.Extends,
		ignorecase: raw.Ignorecase,
		nonword:    raw.Nonword,
		exceptions: raw.Exceptions,
		action:     Action{Name: raw.Action.Name, Params: raw.Action.Params},
		max:        raw.Max,
		min:        raw.Min,
		token:      raw.Token,
	}
	switch raw.Scope.Kind {
	case goyaml.ScalarNode:
		out.scope = []string{raw.Scope.Value}
	case goyaml.SequenceNode:
		if err := raw.Scope.Decode(&out.scope); err != nil {
			return ruleFile{}, fmt.Errorf("%s scope: %w", file, err)
		}
	}
	if len(out.scope) == 0 {
		out.scope = []string{defaultScope}
	}
	for _, item := range raw.Tokens.Content {
		if item.Kind == goyaml.MappingNode {
			var field seqField
			if err := item.Decode(&field); err != nil {
				return ruleFile{}, fmt.Errorf("%s tokens: %w", file, err)
			}
			out.sequence = append(out.sequence, field)
			continue
		}
		out.tokens = append(out.tokens, item.Value)
	}
	for at := 0; at+1 < len(raw.Swap.Content); at += 2 {
		out.swaps = append(out.swaps, swapRow{find: raw.Swap.Content[at].Value, offer: raw.Swap.Content[at+1].Value})
	}
	return out, nil
}
