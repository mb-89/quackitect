// THE FRONTMATTER AND THE LINKS, READ WITHOUT A PARSER. A note carries a few
// flat keys between two rulers, and a link is a name in double brackets. Both
// are pure functions over a string, so a case drives them with no disk.
// [[spec/design_output/index#a-note-and-its-links]]
package main

import "strings"

type linkAt struct {
	key    string
	target string
	line   int
}

// frontOf splits a note into its frontmatter and its body. A note carrying no
// ruler is all body, which is what a plain markdown file is.
func frontOf(text string) (map[string]string, string) {
	said := strings.ReplaceAll(text, "\r\n", "\n")
	if !strings.HasPrefix(said, "---\n") {
		return map[string]string{}, said
	}
	end := strings.Index(said[4:], "\n---")
	if end < 0 {
		return map[string]string{}, said
	}

	head := said[4 : 4+end]
	body := said[4+end:]
	if cut := strings.Index(body, "\n"); cut >= 0 {
		if rest := strings.Index(body[cut+1:], "\n"); rest >= 0 {
			body = body[cut+1+rest+1:]
		} else {
			body = ""
		}
	}

	front := map[string]string{}
	for _, line := range strings.Split(head, "\n") {
		at := strings.Index(line, ":")
		if at <= 0 {
			continue
		}
		key := strings.TrimSpace(line[:at])
		value := strings.TrimSpace(line[at+1:])
		if key != "" {
			front[key] = value
		}
	}
	return front, body
}

// linksIn answers every link a note carries: the frontmatter ones under the
// field that names them, and the body ones under no key at all.
func linksIn(front map[string]string, body string) []linkAt {
	out := []linkAt{}
	for _, key := range sorted(front) {
		for _, target := range bracketed(front[key]) {
			out = append(out, linkAt{key: key, target: target, line: 0})
		}
	}
	for n, line := range strings.Split(body, "\n") {
		for _, target := range bracketed(line) {
			out = append(out, linkAt{key: "", target: target, line: n + 1})
		}
	}
	return out
}

// bracketed answers what stands inside every [[ ]] of a line. A link naming an
// anchor keeps the whole of it, because the file is what the anchor sits in.
func bracketed(said string) []string {
	out := []string{}
	rest := said
	for {
		open := strings.Index(rest, "[[")
		if open < 0 {
			return out
		}
		rest = rest[open+2:]
		shut := strings.Index(rest, "]]")
		if shut < 0 {
			return out
		}
		if target := strings.TrimSpace(rest[:shut]); target != "" {
			out = append(out, target)
		}
		rest = rest[shut+2:]
	}
}
