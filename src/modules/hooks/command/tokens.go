// The command line, cut into words and operators, and the values a command
// gives its names. Every rule over
// a shell command reads this one parse.
// [[spec/tickets/cage-command-rules-port]]
package command

import (
	"regexp"
	"strings"
	"unicode"
)

// The shells, the script readers, and the operators that break a command into segments. [[spec/design_output/bash#what-the-door-reads]]
var (
	shells  = setOf("sh", "bash", "zsh", "dash")
	readers = setOf("python", "python3", "node", "ruby", "perl", "php", "deno")
	breaks  = setOf("&&", "||", "|", ";", "&", "(", ")")
)

// The operators the parse reads, longest first where two share a head. [[spec/design_output/bash#what-the-door-reads]]
var operators = []string{"<<<", "&&", "||", ">>", "&>", ">&", "<<", ">", "<", "|", ";", "&", "(", ")"}

// A name given its value, a name read inside a word, braced or bare, and an executable's suffix. [[spec/design_output/bash#a-target-behind-a-variable]]
var (
	assignment = regexp.MustCompile(`(?s)^([A-Za-z_][A-Za-z0-9_]*)=(.*)$`)
	variable   = regexp.MustCompile(`\$(?:\{([A-Za-z_][A-Za-z0-9_]*)\}|([A-Za-z_][A-Za-z0-9_]*))`)
	exeSuffix  = regexp.MustCompile(`(?i)\.exe$`)
)

// One word or one operator of a command line. [[spec/design_output/bash#what-the-door-reads]]
type Token struct {
	Text string
	Op   bool
}

// The last part of a path, without the executable's suffix. [[spec/design_output/bash#what-the-door-reads]]
func BaseName(word string) string {
	last := word[strings.LastIndexAny(word, `/\`)+1:]
	return exeSuffix.ReplaceAllString(last, "")
}

// A path with forward slashes, and no leading ./ once. [[spec/design_output/bash#what-the-door-reads]]
func Clean(path string) string {
	return strings.TrimPrefix(strings.ReplaceAll(path, "\\", "/"), "./")
}

// The words and operators of a command line: a quote holds its text whole, a backslash escapes the next letter, and a newline reads as a semicolon. [[spec/design_output/bash#what-the-door-reads]]
func TokensOf(text string) []Token {
	letters := []rune(text)
	var out []Token
	var cur strings.Builder
	quoted := false
	flush := func() {
		if cur.Len() > 0 || quoted {
			out = append(out, Token{Text: cur.String()})
		}
		cur.Reset()
		quoted = false
	}
	for i := 0; i < len(letters); i++ {
		c := letters[i]
		if c == '\'' || c == '"' {
			at := i + 1
			for at < len(letters) && letters[at] != c {
				if c == '"' && letters[at] == '\\' && at+1 < len(letters) {
					cur.WriteRune(letters[at+1])
					at += 2
					continue
				}
				cur.WriteRune(letters[at])
				at++
			}
			quoted = true
			i = at
			continue
		}
		if c == '\\' && i+1 < len(letters) {
			if letters[i+1] != '\n' {
				cur.WriteRune(letters[i+1])
			}
			i++
			continue
		}
		if c == '\n' {
			flush()
			out = append(out, Token{Text: ";", Op: true})
			continue
		}
		if unicode.IsSpace(c) {
			flush()
			continue
		}
		if op := operatorAt(letters, i); op != "" {
			flush()
			out = append(out, Token{Text: op, Op: true})
			i += len([]rune(op)) - 1
			continue
		}
		cur.WriteRune(c)
	}
	flush()
	return out
}

// The operator standing at a letter, or nothing. [[spec/design_output/bash#what-the-door-reads]]
func operatorAt(letters []rune, at int) string {
	rest := string(letters[at:])
	for _, one := range operators {
		if strings.HasPrefix(rest, one) {
			return one
		}
	}
	return ""
}

// A segment of assignments alone gives each name its value, read through the values before it. [[spec/design_output/bash#a-target-behind-a-variable]]
func assigned(words []string, values map[string]string) {
	said := words
	if len(said) > 0 && said[0] == "export" {
		said = said[1:]
	}
	if len(said) == 0 {
		return
	}
	for _, one := range said {
		if !assignment.MatchString(one) {
			return
		}
	}
	for _, one := range said {
		found := assignment.FindStringSubmatch(one)
		values[found[1]] = resolved(found[2], values)
	}
}

// A word read through the values the command gives, a name with no value kept as written. [[spec/design_output/bash#a-target-behind-a-variable]]
func resolved(text string, values map[string]string) string {
	return variable.ReplaceAllStringFunc(text, func(whole string) string {
		found := variable.FindStringSubmatch(whole)
		name := found[1]
		if name == "" {
			name = found[2]
		}
		if value, ok := values[name]; ok {
			return value
		}
		return whole
	})
}

// [[spec/design_output/bash#a-target-behind-a-variable]]
func holdsAName(text string) bool { return variable.MatchString(text) }

// [[spec/tickets/cage-command-rules-port]]
func setOf(words ...string) map[string]bool {
	out := make(map[string]bool, len(words))
	for _, one := range words {
		out[one] = true
	}
	return out
}
