package main

import (
	"fmt"
	"sort"
	"strings"
)

// Generates the note a person starts from, out of the schema and the process.
//
// A hand-written template drifts from the schema it is supposed to match. This
// one cannot: every field it writes is a field the schema declares, and every
// section is one the process switched on.
//
// THE DESCRIPTIONS COME WITH IT, as comments. A field's description is the
// guidance for that field, and it belongs where the field is rather than in a
// manual nobody opens. The writer replaces the comment with the answer.

// Template answers the note a person starts from for one kind and process.
// The frontmatter half goes through writeFront, the same writer the saved
// token goes through, so the template and the mint cannot drift.
func Template(s Schema, p Process) string {
	narrowed := p.Narrow(s)
	f := Front{}
	describe := map[string]string{}
	for name, spec := range narrowed.Frontmatter.Properties {
		describe[name] = spec.Description
		if spec.Type == "array" {
			f[name] = []string{}
			continue
		}
		f[name] = templateValue(name, narrowed.Guidance, spec, p)
	}
	var b strings.Builder
	b.WriteString(writeFront(f, templateOrder(narrowed), describe, true))

	head := strings.Repeat("#", narrowed.Body.HeadingLevel) + " "
	for _, sec := range narrowed.Body.Sections {
		b.WriteString("\n" + head + sec.Header + "\n\n")
		if sec.Description != "" {
			b.WriteString("<!-- " + sec.Description + " -->\n")
		}
	}
	b.WriteString(checklists(p, head))
	return b.String()
}

// checklists renders one table per activity that has criteria.
//
// EVERY ACTIVITY IS RENDERED, NOT ONLY THE ONE IN HAND. A reader opening a
// token should be able to see what the whole process asks of it, which is the
// thing the process file says and nothing else showed.
//
// It goes last. The reader who was not there wants the problem first, and the
// worker who wants the checklist is looking at a tool rather than at the file.
func checklists(p Process, head string) string {
	tables := Checklists(p)
	var b strings.Builder
	for _, name := range sortedKeys(tables) {
		// THE STEP CARRIES ITS NUMBER AND SAYS THE WORD. Every step is written
		// at the start, before any of them is reached, so a reader sees the
		// whole process rather than the part that has happened. The number is
		// what the engine reads to refuse a step ticked before the token has
		// arrived at it.
		b.WriteString("\n" + head + "evidence: " + name + "\n\n" + tables[name] + "\n")
	}
	return b.String()
}

// templateOrder puts the fields a token must carry first, in the order the
// schema names them, and the rest after in an order that does not wander.
func templateOrder(s Schema) []string {
	var out []string
	seen := map[string]bool{}
	for _, name := range s.Frontmatter.Required {
		if _, declared := s.Frontmatter.Properties[name]; declared {
			out = append(out, name)
			seen[name] = true
		}
	}
	var rest []string
	for name := range s.Frontmatter.Properties {
		if !seen[name] {
			rest = append(rest, name)
		}
	}
	sort.Strings(rest)
	return append(out, rest...)
}

// templateValue fills what the schema already knows and leaves the rest blank.
func templateValue(name, guidance string, spec PropSpec, p Process) string {
	switch {
	case spec.Const != "":
		return asWritten(spec.Const, spec.Link)
	case name == "guidance":
		return asWritten(guidance, spec.Link)
	case name == "process":
		return asWritten(p.Name, spec.Link)
	case spec.EnumFrom == "process.states" && len(p.States) > 0:
		// A token starts in the state the first activity puts it in.
		return p.States[0].Name
	}
	return ""
}

func asWritten(value string, link bool) string {
	if link {
		return "[[" + value + "]]"
	}
	return value
}

// stripComments takes the template's own comments out before anything counts
// words in a section. A comment is not prose, and a writer who leaves one in
// should hear about the section being empty rather than about its length.
func stripComments(text string) string {
	for {
		open := strings.Index(text, "<!--")
		if open < 0 {
			return text
		}
		shut := strings.Index(text[open:], "-->")
		if shut < 0 {
			return text[:open]
		}
		text = text[:open] + text[open+shut+3:]
	}
}

// TemplateFor loads both halves and answers the template, or says why not.
func TemplateFor(methodRoot, kind, process string) (string, error) {
	s, err := LoadSchema(methodRoot, kind)
	if err != nil {
		return "", err
	}
	p, err := LoadProcess(methodRoot, process)
	if err != nil {
		return "", err
	}
	if len(p.Narrow(s).Body.Sections) == 0 {
		return "", fmt.Errorf("process %q switches on no section of %q, so the template would be empty",
			process, kind)
	}
	return Template(s, p), nil
}

// Checklists answers one activity's table per entry, keyed the way a note's
// evidence sections are keyed, so a token can be minted carrying them.
//
// A MINTED TOKEN CARRIES EVERY STEP FROM THE BEGINNING. The template printed
// them and mint did not, so a person who used the template got the process and
// a person who used the flags got a note with nothing to walk. One function
// answers both.
func Checklists(p Process) map[string]string {
	out := map[string]string{}
	for i, a := range p.Activities {
		if len(a.Criteria) == 0 {
			continue
		}
		var b strings.Builder
		if a.Does != "" {
			b.WriteString("<!-- " + a.Does + " -->\n\n")
		}
		b.WriteString("| done | criterion | evidence | receipt |\n")
		b.WriteString("|---|---|---|---|\n")
		for _, c := range a.Criteria {
			evidence := ""
			if !c.NeedsEvidence {
				evidence = "—"
			}
			fmt.Fprintf(&b, "| [ ] | %s | %s |  |\n", c.Says, evidence)
		}
		out[fmt.Sprintf("step %d. %s", i+1, a.Name)] = strings.TrimRight(b.String(), "\n")
	}
	return out
}
