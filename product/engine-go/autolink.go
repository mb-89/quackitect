package main

// design: go-auto-link  implements: req-auto-link
// The deterministic auto-link emit pass: plain-text occurrences of a content-note name or
// alias (go-spec-content) link to their note. Rules, in order: authored links and inline
// code stay untouched (protected spans); code fences, headings, and comment lines are
// exempt whole; the LONGEST name wins at a given position (names are applied
// longest-first and an inserted link becomes a protected span); matching is
// case-insensitive on word boundaries. Glossary names link through the existing term
// machinery ([text](term:slug) - usage tracking and first-use expansion ride along);
// other kinds link their anchor. An alias claimed by two notes is a HARD error at index
// build (AliasIndex) - the book surfaces it as a finding, never guesses.

import (
	"regexp"
	"sort"
	"strings"
)

type nameTarget struct {
	name string // display form to match (case-insensitive)
	kind string // glossary | references | fundamentals | methods
	slug string
}

// autoLinkNames turns the alias index into a longest-first match list.
func autoLinkNames(idx map[string]string) []nameTarget {
	var out []nameTarget
	for name, target := range idx {
		kv := strings.SplitN(target, ":", 2)
		if len(kv) != 2 {
			continue
		}
		out = append(out, nameTarget{name: name, kind: kv[0], slug: kv[1]})
	}
	sort.Slice(out, func(a, b int) bool {
		if len(out[a].name) != len(out[b].name) {
			return len(out[a].name) > len(out[b].name) // longest first
		}
		return out[a].name < out[b].name
	})
	return out
}

// protectedSpanRe: inline code, authored markdown links, wiki links - never rewritten.
var protectedSpanRe = regexp.MustCompile("`[^`]*`|\\[\\[[^\\]]*\\]\\]|!?\\[[^\\]]*\\]\\([^)]*\\)")

func autoLinkTarget(t nameTarget) string {
	if t.kind == "glossary" {
		return "term:" + t.slug
	}
	return t.slug // mdInline prepends the # (in-book anchors are id-only in markdown)
}

// autoLinkLine rewrites one prose line for one name, respecting protected spans.
func autoLinkLine(line string, t nameTarget) string {
	re := regexp.MustCompile(`(?i)\b` + regexp.QuoteMeta(t.name) + `\b`)
	prot := protectedSpanRe.FindAllStringIndex(line, -1)
	inProt := func(a, b int) bool {
		for _, p := range prot {
			if a < p[1] && b > p[0] {
				return true
			}
		}
		return false
	}
	var b strings.Builder
	last := 0
	for _, m := range re.FindAllStringIndex(line, -1) {
		if inProt(m[0], m[1]) {
			continue
		}
		b.WriteString(line[last:m[0]])
		b.WriteString("[" + line[m[0]:m[1]] + "](" + autoLinkTarget(t) + ")")
		last = m[1]
	}
	b.WriteString(line[last:])
	return b.String()
}

// AutoLink applies the pass to a markdown body. Deterministic; exempt zones hold.
func AutoLink(md string, idx map[string]string) string {
	if len(idx) == 0 {
		return md
	}
	names := autoLinkNames(idx)
	lines := strings.Split(md, "\n")
	inFence := false
	for i, line := range lines {
		t := strings.TrimSpace(line)
		if strings.HasPrefix(t, "```") {
			inFence = !inFence
			continue
		}
		if inFence || strings.HasPrefix(t, "#") || strings.HasPrefix(t, "<!--") {
			continue // code, headings, and comments stay untouched
		}
		for _, nt := range names {
			line = autoLinkLine(line, nt)
		}
		lines[i] = line
	}
	return strings.Join(lines, "\n")
}

// enddesign
