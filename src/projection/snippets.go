// The shape every projected rule wears, and the Tengo a script rule shares:
// the head of a rule file, the helpers its script opens with, and the small
// quoting a rule needs. A port of snippets.js and the frontless helper.
// [[spec/design_output/projection#a-layer-writes-two-files]] [[spec/tickets/config-verbs-port-to-go]]
package projection

import (
	"regexp"
	"strings"
)

const (
	// The note every rule links. [[spec/design_output/projection#a-layer-writes-two-files]]
	ruleLink = "spec/design_output/projection.md"
	// The widths a banner and a word list wrap at. [[spec/design_output/projection#the-second-target]]
	bannerWidth = 76
	rowWidth    = 72
	// The line a prose rule opens its scan with, the frontmatter blanked. [[spec/tickets/voice-rules-skip-the-record]]
	front = "said := frontless(scope)"
	// The indent a script line takes under `script: |`. [[spec/design_output/projection#a-layer-writes-two-files]]
	scriptIndent = "  "
)

// The head of a script rule. [[spec/design_output/projection#a-layer-writes-two-files]]
func head(message string) string {
	return strings.Join([]string{
		"extends: script",
		"message: " + quoted(message),
		"link: " + ruleLink,
		"level: error",
		"scope: raw",
		"script: |",
	}, "\n")
}

// A script rule: its head, and its lines indented under it. [[spec/design_output/projection#a-layer-writes-two-files]]
func scripted(message string, lines []string) string {
	shown := make([]string, len(lines))
	for i, one := range lines {
		shown[i] = jsTrimEnd(scriptIndent + one)
	}
	return head(message) + "\n" + strings.Join(shown, "\n") + "\n"
}

// The lines a script opens with: the import, the matches, and the helpers it names. [[spec/design_output/projection#what-stands-outside-a-layer]]
func prelude(wanted []string, prose any) []string {
	names := append([]string{"blanked", "frontless", "plain"}, wanted...)
	out := []string{`text := import("text")`, "", "matches := []", ""}
	for _, name := range names {
		if name == "frontless" {
			out = append(out, frontless(prose)...)
		} else {
			out = append(out, helpers[name]...)
		}
		out = append(out, "")
	}
	return out
}

// The helper that blanks a frontmatter but for the fields the schema calls prose. [[spec/tickets/voice-rules-skip-the-record]]
func frontless(prose any) []string {
	keys := []string{}
	for _, one := range listOf(prose) {
		keys = append(keys, `"`+jsString(one)+`"`)
	}
	return []string{
		"prose := [" + strings.Join(keys, ", ") + "]",
		"",
		"frontless := func(said) {",
		"  lines := text.split(said, \"\\n\")",
		"  if len(lines) < 2 || text.trim_space(lines[0]) != \"---\" { return said }",
		"  out := []",
		"  inside := true",
		"  keep := false",
		"  for at, line in lines {",
		"    if at == 0 {",
		"      out = append(out, line)",
		"      continue",
		"    }",
		"    if inside && text.trim_space(line) == \"---\" {",
		"      inside = false",
		"      out = append(out, line)",
		"      continue",
		"    }",
		"    if !inside {",
		"      out = append(out, line)",
		"      continue",
		"    }",
		"    found := text.re_find(`^[ \\t]*-?[ \\t]*([A-Za-z_][A-Za-z0-9_]*):`, line, 1)",
		"    if !is_undefined(found) {",
		"      keep = false",
		"      for one in prose {",
		"        if one == found[0][1].text { keep = true }",
		"      }",
		"    }",
		"    if keep {",
		"      out = append(out, line)",
		"    } else {",
		"      out = append(out, text.repeat(\" \", len(line)))",
		"    }",
		"  }",
		"  return text.join(out, \"\\n\")",
		"}",
	}
}

// The helpers a script names, by name. [[spec/design_output/projection#what-stands-outside-a-layer]]
var helpers = map[string][]string{
	"blanked": {
		"blanked := func(said, pattern) {",
		"  found := text.re_find(pattern, said, -1)",
		"  if is_undefined(found) { return said }",
		"  parts := []",
		"  at := 0",
		"  for one in found {",
		"    m := one[0]",
		"    parts = append(parts, said[at:m.begin])",
		"    parts = append(parts, text.repeat(\" \", m.end - m.begin))",
		"    at = m.end",
		"  }",
		"  parts = append(parts, said[at:])",
		"  return text.join(parts, \"\")",
		"}",
	},
	"plain": {
		"plain := func(said) {",
		"  out := frontless(said)",
		"  out = blanked(out, \"(?s)```.*?```\")",
		"  out = blanked(out, `(?s)~~~.*?~~~`)",
		"  out = blanked(out, `(?s)<!--.*?-->`)",
		"  out = blanked(out, `(?m)^(?:\\t| {4,}).*$`)",
		"  out = blanked(out, \"`[^`\\n]*`\")",
		"  out = blanked(out, \"`[^`\\n]*\\n[^`\\n]*`\")",
		"  out = blanked(out, `https?://[^\\s)]+`)",
		"  out = blanked(out, `\\[\\[[^\\]]*\\]\\]`)",
		"  out = blanked(out, `\\[[^\\]]*\\]\\([^)]*\\)`)",
		"  out = blanked(out, `[A-Za-z0-9_.-]+/[A-Za-z0-9_./-]+`)",
		"  return out",
		"}",
	},
	"rows": {
		"rows := func(said) {",
		"  out := []",
		"  at := 0",
		"  for line in text.split(frontless(said), \"\\n\") {",
		"    out = append(out, {said: line, begin: at, end: at + len(line)})",
		"    at += len(line) + 1",
		"  }",
		"  return out",
		"}",
	},
	"structure": {
		"structure := func(line) {",
		"  t := text.trim_space(line)",
		"  if text.has_prefix(t, \"#\") { return true }",
		"  if text.has_prefix(t, \"|\") { return true }",
		"  if text.has_prefix(t, \">\") { return true }",
		"  if text.has_prefix(t, \"- \") { return true }",
		"  if text.has_prefix(t, \"* \") { return true }",
		"  if text.has_prefix(t, \"+ \") { return true }",
		"  if text.has_prefix(t, \"---\") { return true }",
		"  if text.re_match(`^[0-9]+[.)] `, t) { return true }",
		"  if text.re_match(`^ {4,}[^ ]`, line) { return true }",
		"  return false",
		"}",
	},
	"words": {
		"words := func(said) {",
		"  n := 0",
		"  for one in text.split(said, \" \") {",
		"    if len(text.trim_space(one)) > 0 { n = n + 1 }",
		"  }",
		"  return n",
		"}",
	},
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

// A set of marks, each escaped for a character class. [[spec/design_output/projection#the-second-target]]
func escaped(set string) string {
	var out strings.Builder
	for _, one := range set {
		out.WriteString(`\` + string(one))
	}
	return out.String()
}

var special = regexp.MustCompile(`[\\^$.|?*+()[\]{}]`)

// A phrase escaped for a pattern. [[spec/design_output/projection#the-second-target]]
func pattern(said string) string { return special.ReplaceAllString(said, `\$0`) }

// The phrases a layer leaves, each its word or its text. [[spec/design_output/projection#the-grammar-rules]]
func leftOf(layer any) []string {
	out := []string{}
	for _, one := range listOf(dig(layer, "exceptions")) {
		word := dig(one, "word")
		if absent(word) {
			word = one
		}
		if said := jsString(word); said != "" {
			out = append(out, said)
		}
	}
	return out
}

// The lines blanking a layer's exceptions out of the scan. [[spec/design_output/projection#the-grammar-rules]]
func blankedLeft(layer any) []string {
	out := []string{}
	for _, one := range leftOf(layer) {
		out = append(out, "said = blanked(said, "+quoted(pattern(one))+")")
	}
	return out
}
