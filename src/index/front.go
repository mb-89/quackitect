// The frontmatter and the links, read with no parser. Both are pure functions
// over a string, so a case drives them with no disk.
// [[spec/design_output/index#a-note-and-its-links]]
package main

import "strings"

type linkAt struct {
	key    string
	target string
	line   int
}

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

func linksIn(front map[string]string, body string) []linkAt {
	out := []linkAt{}
	for _, key := range sorted(front) {
		if key == "kind" {
			continue
		}
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
		target := strings.TrimSpace(rest[:shut])
		if target != "" && !strings.ContainsAny(target, "<>") {
			out = append(out, target)
		}
		rest = rest[shut+2:]
	}
}
