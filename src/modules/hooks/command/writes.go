// The paths a command writes: a redirection, a tee, an edit in place, a copy,
// and a heredoc or an inline script.
// [[spec/tickets/cage-command-rules-port]]
package command

import (
	"regexp"
	"strings"
)

// The paths no rule reads, which is where a hand writes a script. [[spec/design_output/bash#a-shell-writes-nothing]]
var free = []*regexp.Regexp{
	regexp.MustCompile(`^\.se(/|$)`),
	regexp.MustCompile(`^\.git(/|$)`),
	regexp.MustCompile(`^/tmp/`),
	regexp.MustCompile(`^/var/tmp/`),
	regexp.MustCompile(`^/dev/`),
	regexp.MustCompile(`(^|/)node_modules(/|$)`),
	regexp.MustCompile(`(?i)^\$\{?(TMPDIR|TMP|TEMP)\b`),
	regexp.MustCompile(`(?i)^%(TMP|TEMP)%`),
	regexp.MustCompile(`^(?:[A-Za-z]:)?/(?:[^/]+/)*claude(?:-[^/]*)?/[^/]+/[^/]+/scratchpad(/|$)`),
}

// The operators writing a file, the programs editing in place or copying, and the flags xargs takes a value for. [[spec/design_output/bash#a-shell-writes-nothing]]
var (
	redirects = setOf(">", ">>", "&>")
	edits     = setOf("sed", "perl")
	copies    = setOf("cp", "mv")
	takes     = setOf("-I", "-n", "-P", "-L", "-d", "-s", "-a", "-E")
	inPlace   = regexp.MustCompile(`^(--in-place(=.*)?|-[A-Za-z]*i[A-Za-z]*(\.\S+)?)$`)
	shellFlag = regexp.MustCompile(`^-[A-Za-z]*c$`)
	evalFlag  = regexp.MustCompile(`^(-e|--eval|-c|--command)$`)
)

// The calls of a script that write a file, and the paths a line names. [[spec/design_output/bash#a-shell-writes-nothing]]
var (
	scriptWriters = []*regexp.Regexp{
		regexp.MustCompile(`\bopen\s*\([^)]*["'][wax]\+?[bt]?["']`),
		regexp.MustCompile(`\bwriteFile(Sync)?\s*\(`),
		regexp.MustCompile(`\bwrite_text\s*\(`),
		regexp.MustCompile(`\bwrite_bytes\s*\(`),
		regexp.MustCompile(`\.write\s*\(`),
		regexp.MustCompile(`\.writelines\s*\(`),
	}
	quotedPath = regexp.MustCompile(`["']([^"']+)["']`)
	barePath   = regexp.MustCompile(`(?:^|\s)([\w./\\-]+\.[A-Za-z0-9]+)`)
	lineBreak  = regexp.MustCompile(`\r?\n`)
)

// One path a command writes, and how. [[spec/design_output/bash#a-shell-writes-nothing]]
type written struct {
	path string
	how  string
}

// Whether a path stands where a rule reads it: prose or code, outside the free paths. [[spec/design_output/bash#a-shell-writes-nothing]]
func reaches(path string) bool {
	said := Clean(path)
	if said == "" || freeAt(said) {
		return false
	}
	return prose.MatchString(said) || code.MatchString(said)
}

// [[spec/design_output/bash#a-shell-writes-nothing]]
func freeAt(path string) bool {
	for _, one := range free {
		if one.MatchString(path) {
			return true
		}
	}
	return false
}

// Every path a command writes, the values it gives its names carried across segments. [[spec/design_output/bash#a-target-behind-a-variable]]
func writesAPath(command string) []written {
	segments, bodies := partsOf(command)
	values := map[string]string{}
	var out []written
	for _, one := range segments {
		out = append(out, writesIn(one, bodies, values)...)
		var words []string
		for _, word := range one {
			if !word.Op {
				words = append(words, word.Text)
			}
		}
		assigned(words, values)
	}
	return out
}

// A free path reads first, a target still holding a name refuses, and a resolved one meets the rules. [[spec/design_output/bash#a-target-behind-a-variable]]
func landing(text string, values map[string]string) string {
	said := Clean(text)
	if freeAt(said) {
		return ""
	}
	path := Clean(resolved(said, values))
	if holdsAName(path) || reaches(path) {
		return path
	}
	return ""
}

// [[spec/design_output/bash#a-shell-writes-nothing]]
func writesIn(segment []Token, bodies map[string]string, values map[string]string) []written {
	var out []written
	words := wordsIn(segment)
	name := BaseName(first(words))
	for i, one := range segment {
		if !one.Op || !redirects[one.Text] || i+1 >= len(segment) || segment[i+1].Op {
			continue
		}
		path := landing(segment[i+1].Text, values)
		if path == "" {
			continue
		}
		how := "a redirection"
		if one.Text == ">>" {
			how = "an append"
		}
		out = append(out, written{path, how})
	}
	for _, run := range runsIn(words) {
		out = append(out, landsFrom(run)...)
	}
	for _, body := range fedTo(segment, bodies) {
		for _, one := range insideOf(name, body) {
			out = append(out, written{one.path, "a heredoc into " + name})
		}
	}
	for _, body := range inlineIn(segment) {
		for _, one := range insideOf(name, body) {
			out = append(out, written{one.path, "an inline script in " + name})
		}
	}
	return out
}

// [[spec/design_output/bash#a-shell-writes-nothing]]
func landsFrom(words []string) []written {
	var out []written
	name := BaseName(first(words))
	args := words[1:]
	var bare []string
	edited := false
	for _, one := range args {
		if !strings.HasPrefix(one, "-") {
			bare = append(bare, one)
		}
		if inPlace.MatchString(one) {
			edited = true
		}
	}
	if name == "tee" || (edits[name] && edited) {
		how := name + " -i"
		if name == "tee" {
			how = "tee"
		}
		for _, arg := range bare {
			if reaches(arg) {
				out = append(out, written{Clean(arg), how})
			}
		}
	}
	if copies[name] && len(bare) > 1 {
		dest := bare[len(bare)-1]
		all := true
		for _, one := range bare[:len(bare)-1] {
			all = all && reaches(one)
		}
		if reaches(dest) && !all {
			how := "a copy"
			if name == "mv" {
				how = "a move"
			}
			out = append(out, written{Clean(dest), how})
		}
	}
	return out
}

// The command itself, the one find runs, and the one xargs runs. [[spec/design_output/bash#a-shell-writes-nothing]]
func runsIn(words []string) [][]string {
	out := [][]string{words}
	for at, one := range words {
		if one != "-exec" && one != "-execdir" {
			continue
		}
		var run []string
		for _, word := range words[at+1:] {
			if word != ";" && word != "+" {
				run = append(run, word)
			}
		}
		out = append(out, run)
		break
	}
	if BaseName(first(words)) == "xargs" {
		i := 1
		for i < len(words) && strings.HasPrefix(words[i], "-") {
			if takes[words[i]] {
				i++
			}
			i++
		}
		if i < len(words) {
			out = append(out, words[i:])
		}
	}
	var kept [][]string
	for _, one := range out {
		if len(one) > 0 {
			kept = append(kept, one)
		}
	}
	return kept
}

// What a body writes: a shell's body reads as a command, and any other as a script. [[spec/design_output/bash#a-shell-writes-nothing]]
func insideOf(name, body string) []written {
	if shells[name] {
		return writesAPath(body)
	}
	return writesInScript(body)
}

// The inline scripts a shell's -c or a reader's -e carries. [[spec/design_output/bash#a-shell-writes-nothing]]
func inlineIn(segment []Token) []string {
	words := wordsIn(segment)
	name := BaseName(first(words))
	if !shells[name] && !readers[name] {
		return nil
	}
	wanted := evalFlag
	if shells[name] {
		wanted = shellFlag
	}
	var out []string
	for i := 1; i+1 < len(words); i++ {
		if wanted.MatchString(words[i]) {
			out = append(out, words[i+1])
		}
	}
	return out
}

// [[spec/design_output/bash#a-shell-writes-nothing]]
func fedTo(segment []Token, bodies map[string]string) []string {
	name := BaseName(first(wordsIn(segment)))
	if !shells[name] && !readers[name] {
		return nil
	}
	return bodiesIn(segment, bodies)
}

// The heredoc bodies a segment feeds, by the word after each <<. [[spec/design_output/bash#what-the-door-reads]]
func bodiesIn(segment []Token, bodies map[string]string) []string {
	var out []string
	for i, one := range segment {
		if !one.Op || one.Text != "<<" || i+1 >= len(segment) || segment[i+1].Op {
			continue
		}
		if body, ok := bodies[segment[i+1].Text]; ok {
			out = append(out, body)
		}
	}
	return out
}

// The paths a script writes: those its writing lines name, or every path it names where a writing line names none. [[spec/design_output/bash#a-shell-writes-nothing]]
func writesInScript(body string) []written {
	lines := lineBreak.Split(body, -1)
	var all []string
	for _, line := range lines {
		all = append(all, reachedIn(line)...)
	}
	var out []written
	seen := map[string]bool{}
	for _, line := range lines {
		if !writesALine(line) {
			continue
		}
		here := reachedIn(line)
		if len(here) == 0 {
			here = all
		}
		for _, path := range here {
			if !seen[path] {
				seen[path] = true
				out = append(out, written{path, "a heredoc"})
			}
		}
	}
	return out
}

// [[spec/design_output/bash#a-shell-writes-nothing]]
func writesALine(line string) bool {
	for _, one := range scriptWriters {
		if one.MatchString(line) {
			return true
		}
	}
	return false
}

// The paths a line names that a rule reaches, cleaned. [[spec/design_output/bash#a-shell-writes-nothing]]
func reachedIn(line string) []string {
	var out []string
	for _, form := range []*regexp.Regexp{quotedPath, barePath} {
		for _, found := range form.FindAllStringSubmatch(line, -1) {
			if reaches(found[1]) {
				out = append(out, Clean(found[1]))
			}
		}
	}
	return out
}
