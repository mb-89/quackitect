// The rules the lint reads over a file's text past Vale and Biome: an
// exemption naming no reason, the code ceilings, and the magic numbers. Each
// reads what its JavaScript twin reads, so the lint and the panel agree.
// [[spec/design_output/lsp#the-server-runs-the-tools]]
package main

import (
	"fmt"
	"regexp"
	"strings"
)

// The rule names and the words the JavaScript twins write, in unreasoned of .claude/skills/level0/lib/vale.js, size.js and magic.js beside it, spelled again here because a Go module imports no JavaScript. [[spec/design_output/lsp#the-server-runs-the-tools]]
const (
	Unreasoned      = "ExemptionCarriesAReason"
	FileCeiling     = "FileCeiling"
	FunctionCeiling = "FunctionCeiling"
	MagicNumber     = "MagicNumber"
	unreasonedSays  = "An exemption names why the rule is off. Write <!-- because: why --> above it."
	fileSays        = "A file holds %d lines, and the file holds %d. Split it by topic."
	functionSays    = "A function holds %d lines, and %s holds %d. Split it into what it does."
	magicSays       = "%s carries a meaning here. Name it in the constants block at the top of this file, or under spec/config/level0.json."
	someFunction    = "a function"
)

// The folders the lint's walk passes at any depth, owned by SKIP in src/bridge/findings.js and spelled again here because a Go module imports no JavaScript. [[spec/design_output/lsp#the-server-runs-the-tools]]
var walkPasses = map[string]bool{".git": true, "node_modules": true, ".se": true, ".claude": true, ".claude-plugin": true}

// The numbers a line carries with no meaning to name. [[spec/design_output/config#the-magic-numbers-take-names]]
var plainNumbers = map[string]bool{"0": true, "1": true, "2": true}

var (
	lineBreak  = regexp.MustCompile(`\r?\n`)
	proseFile  = regexp.MustCompile(`(?i)\.(md|markdown|txt)$`)
	sizedFile  = regexp.MustCompile(`(?i)\.(js|jsx|ts|tsx|go)$`)
	goFile     = regexp.MustCompile(`(?i)\.go$`)
	goTestFile = regexp.MustCompile(`(?i)_test\.go$`)
	markerAt   = regexp.MustCompile(`(?i)<!--\s*vale\s+([A-Za-z0-9_.-]+)\s*=\s*(NO|off)\s*-->`)
	reasonAt   = regexp.MustCompile(`(?i)<!--\s*because:\s*(.+?)\s*-->`)
	trailAt    = regexp.MustCompile(`//.*$`)
	quotedAt   = regexp.MustCompile(`"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|` + "`(?:[^`\\\\]|\\\\.)*`")
	quotedGoAt = regexp.MustCompile(`"(?:[^"\\]|\\.)*"|` + "`[^`]*`" + `|'(?:[^'\\]|\\.)*'`)
	keywordAt  = regexp.MustCompile(`^(?:if|for|while|switch|catch|return|do|else|with)\b`)
	opensAt    = []*regexp.Regexp{
		regexp.MustCompile(`^\s*(?:export\s+)?(?:default\s+)?(?:async\s+)?function\b\s*\*?\s*([A-Za-z_$][\w$]*)?`),
		regexp.MustCompile(`^\s*(?:export\s+)?(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?(?:\([^)]*\)|[A-Za-z_$][\w$]*)\s*=>\s*\{\s*$`),
		regexp.MustCompile(`^\s*(?:static\s+)?(?:async\s+)?([A-Za-z_$][\w$]*)\s*\([^)]*\)\s*\{\s*$`),
		regexp.MustCompile(`^\s*func\s+(?:\([^)]*\)\s*)?([A-Za-z_][\w]*)`),
	}
)

// Whether the lint's walk reaches a path: no folder it passes, and no draft. [[spec/design_output/lsp#the-server-runs-the-tools]]
func walked(path string) bool {
	for _, part := range strings.Split(slashed(path), "/") {
		if walkPasses[part] || strings.HasPrefix(part, "_") {
			return false
		}
	}
	return true
}

// The rules over one file's text, where the lint's walk reaches it. [[spec/design_output/lsp#the-server-runs-the-tools]]
func (one *Outside) textFaults(tree *Tree, path string) []Finding {
	prose, sized := proseFile.MatchString(path), sizedFile.MatchString(path)
	if (!prose && !sized) || !walked(path) {
		return nil
	}
	text := tree.Read(path)
	out := []Finding{}
	if prose {
		out = append(out, unreasoned(path, text)...)
	}
	if sized {
		out = append(out, sizeFaults(path, text, one.Function, one.File)...)
		out = append(out, magicIn(path, text)...)
	}
	for i := range out {
		out[i].Source = fromTree
	}
	return out
}

// An exemption marker naming no reason on its line or the line above. [[spec/design_output/level0#where-a-rule-lives]]
func unreasoned(path, text string) []Finding {
	lines := lineBreak.Split(text, -1)
	out := []Finding{}
	fenced := false
	for i, line := range lines {
		if fenceAt.MatchString(line) {
			fenced = !fenced
			continue
		}
		if fenced || !markerAt.MatchString(spanAt.ReplaceAllString(line, "")) {
			continue
		}
		if reasonAt.MatchString(line) || (i > 0 && reasonAt.MatchString(lines[i-1])) {
			continue
		}
		out = append(out, fault(Unreasoned, path, i+1, unreasonedSays))
	}
	return out
}

// A file past its ceiling, and each function past its own, in lines. A ceiling of nothing holds its rule off. [[spec/design_output/level0#the-size-ceiling]]
func sizeFaults(path, text string, function, file int) []Finding {
	lines := lineBreak.Split(text, -1)
	out := []Finding{}
	if file > 0 && len(lines) > file {
		out = append(out, warn(FileCeiling, path, 1, fmt.Sprintf(fileSays, file, len(lines))))
	}
	if function <= 0 {
		return out
	}
	for _, each := range functionsIn(lines) {
		if each.lines > function {
			out = append(out, warn(FunctionCeiling, path, each.line, fmt.Sprintf(functionSays, function, each.name, each.lines)))
		}
	}
	return out
}

type braced struct {
	name  string
	line  int
	depth int
	lines int
}

// Each function a brace language opens, its line and the lines it spans. [[spec/design_output/level0#the-size-ceiling]]
func functionsIn(lines []string) []braced {
	out := []braced{}
	open := []braced{}
	depth := 0
	for i, line := range lines {
		bare := plainCode(line)
		if name := functionNamed(line); name != "" && strings.Contains(bare, "{") {
			open = append(open, braced{name: name, line: i + 1, depth: depth})
		}
		for _, ch := range bare {
			if ch == '{' {
				depth++
			}
			if ch != '}' {
				continue
			}
			depth--
			for len(open) > 0 && open[len(open)-1].depth == depth {
				last := open[len(open)-1]
				open = open[:len(open)-1]
				last.lines = i + 2 - last.line
				out = append(out, last)
			}
		}
	}
	return out
}

// The name a line opens a function on, or nothing. A keyword opens no function. [[spec/design_output/level0#the-size-ceiling]]
func functionNamed(line string) string {
	for _, opens := range opensAt {
		found := opens.FindStringSubmatchIndex(line)
		if found == nil {
			continue
		}
		if found[2] < 0 {
			return someFunction
		}
		name := line[found[2]:found[3]]
		if keywordAt.MatchString(name) {
			continue
		}
		return name
	}
	return ""
}

// A line with its comment and its strings cut, so a brace there counts nothing. [[spec/design_output/level0#the-size-ceiling]]
func plainCode(line string) string {
	return quotedAt.ReplaceAllString(trailAt.ReplaceAllString(line, ""), `""`)
}

// A bare number carrying a meaning in a Go file, outside a constant, a string, a comment and a test. [[spec/design_output/config#the-magic-numbers-take-names]]
func magicIn(path, text string) []Finding {
	out := []Finding{}
	if !goFile.MatchString(path) || goTestFile.MatchString(path) {
		return out
	}
	inConst := false
	for i, line := range lineBreak.Split(text, -1) {
		bare := strings.TrimSpace(line)
		if inConst {
			inConst = bare != ")"
			continue
		}
		if bare == "const (" {
			inConst = true
			continue
		}
		if strings.HasPrefix(bare, "const ") || strings.HasPrefix(bare, "//") {
			continue
		}
		code := quotedGoAt.ReplaceAllStringFunc(line, func(said string) string { return strings.Repeat(" ", len(said)) })
		code = trailAt.ReplaceAllString(code, "")
		for _, hit := range numbersIn(code) {
			if plainNumbers[hit.said] {
				continue
			}
			said := warn(MagicNumber, path, i+1, fmt.Sprintf(magicSays, hit.said))
			said.Column = hit.at + 1
			out = append(out, said)
		}
	}
	return out
}

type numberAt struct {
	at   int
	said string
}

// Every number standing alone on a line: no word, dot or bracket before it, and no word after. [[spec/design_output/config#the-magic-numbers-take-names]]
func numbersIn(code string) []numberAt {
	out := []numberAt{}
	for i := 0; i < len(code); i++ {
		if !isDigit(code[i]) {
			continue
		}
		end := i
		for end < len(code) && isDigit(code[end]) {
			end++
		}
		if i > 0 && joinsNumber(code[i-1]) {
			i = end - 1
			continue
		}
		whole := end
		if end+1 < len(code) && code[end] == '.' && isDigit(code[end+1]) {
			tail := end + 1
			for tail < len(code) && isDigit(code[tail]) {
				tail++
			}
			if tail == len(code) || !wordByte(code[tail]) {
				whole = tail
			}
		}
		if whole == end && end < len(code) && wordByte(code[end]) {
			i = end - 1
			continue
		}
		out = append(out, numberAt{at: i, said: code[i:whole]})
		i = whole - 1
	}
	return out
}

func isDigit(said byte) bool { return said >= '0' && said <= '9' }

func wordByte(said byte) bool {
	return isDigit(said) || said == '_' || (said >= 'a' && said <= 'z') || (said >= 'A' && said <= 'Z')
}

func joinsNumber(said byte) bool { return wordByte(said) || said == '.' || said == '[' }
