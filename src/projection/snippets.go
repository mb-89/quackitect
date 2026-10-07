// The shape every projected rule wears: the head of a rule file, and the
// small quoting a rule needs. A script rule carries its head alone, because
// src/rules runs each script by its check id. A port of snippets.js.
// [[spec/design_output/projection#a-layer-writes-two-files]] [[spec/tickets/config-verbs-port-to-go]]
package projection

import "strings"

const (
	// The note every rule links. [[spec/design_output/projection#a-layer-writes-two-files]]
	ruleLink = "spec/design_output/projection.md"
	// The width a banner wraps at. [[spec/design_output/projection#the-second-target]]
	bannerWidth = 76
)

// The head of a script rule. [[spec/design_output/projection#a-layer-writes-two-files]]
func head(message string) string {
	return strings.Join([]string{
		"extends: script",
		"message: " + quoted(message),
		"link: " + ruleLink,
		"level: error",
		"scope: raw",
	}, "\n")
}

// A script rule: its head alone. [[spec/design_output/projection#a-layer-writes-two-files]]
func scripted(message string) string {
	return head(message) + "\n"
}

// An occurrence rule: a cap on a token over a scope. [[spec/design_output/projection#a-layer-writes-two-files]]
func counted(message, scope, token, most string) string {
	return strings.Join([]string{
		"extends: occurrence",
		"message: " + quoted(message),
		"link: " + ruleLink,
		"level: error",
		"scope: " + scope,
		"max: " + most,
		"token: '" + token + "'",
		"",
	}, "\n")
}

// A sequence rule: a head word, then a tag, with the phrases it leaves. [[spec/design_output/projection#the-grammar-rules]]
func sequenced(message string, heads []string, tag string, left []string) string {
	said := []string{}
	for _, one := range heads {
		for _, each := range left {
			said = append(said, one+" "+each)
		}
	}
	lines := []string{"extends: sequence", "message: " + quoted(message), "link: " + ruleLink, "level: error", "ignorecase: true"}
	lines = append(lines, exceptionLines(sorted(said))...)
	return strings.Join(append(lines,
		"tokens:",
		"  - pattern: '(?:"+strings.Join(heads, "|")+")'",
		"    tag: VB*",
		"  - tag: "+tag,
		"",
	), "\n")
}

// The exceptions block a rule carries, or none where it leaves nothing. [[spec/design_output/projection#the-grammar-rules]]
func exceptionLines(said []string) []string {
	if len(said) == 0 {
		return nil
	}
	out := []string{"exceptions:"}
	for _, one := range said {
		out = append(out, "  - "+one)
	}
	return out
}

// How a substitution rule reads its swaps. [[spec/design_output/projection#the-grammar-rules]]
type swapHow struct{ ignorecase, nonword, replace bool }

// A substitution rule: each phrase and what to write in its place. [[spec/design_output/projection#the-grammar-rules]]
func swapped(message string, pairs [][2]string, how swapHow) string {
	lines := []string{"extends: substitution", "message: " + quoted(message), "link: " + ruleLink, "level: error"}
	if how.ignorecase {
		lines = append(lines, "ignorecase: true")
	}
	if how.nonword {
		lines = append(lines, "nonword: true")
	}
	if how.replace {
		lines = append(lines, "action:", "  name: replace")
	}
	lines = append(lines, "swap:")
	for _, pair := range pairs {
		lines = append(lines, "  "+single(pair[0])+": "+quoted(pair[1]))
	}
	return strings.Join(append(lines, ""), "\n")
}

// A text in YAML single quotes. [[spec/design_output/projection#the-grammar-rules]]
func single(said string) string { return "'" + strings.ReplaceAll(said, "'", "''") + "'" }
