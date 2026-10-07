// The tested delta, off lib/tested.js: the code files a staged delta changes
// with no test beside them, and the tests a held ticket's command lines carry.
// [[spec/tickets/cage-commit-guards-port]]
package command

import (
	"encoding/json"
	"regexp"
	"strings"

	"quackitect/src/yaml"
)

// The line a deleted file opens with, and the line a hunk opens with. [[spec/design_output/tree#the-rules-over-two-files]]
const (
	gone     = "deleted file mode"
	hunkOpen = "@@"
)

// The code the door reads, the copies taking no case, the tests, a command line and its words, and a comment line. [[spec/design_output/tree#the-rules-over-two-files]]
var (
	gitFile = regexp.MustCompile(`^diff --git a/.* b/(.+)$`)
	source  = []*regexp.Regexp{
		regexp.MustCompile(`^src/.*\.js$`),
		regexp.MustCompile(`^\.claude/skills/level0/(lib|hooks)/[^/]+\.js$`),
	}
	goSource    = regexp.MustCompile(`^src/(?:.*/)?[^/]+\.go$`)
	copied      = []*regexp.Regexp{regexp.MustCompile(`^src/doors/fake/`), regexp.MustCompile(`^src/stub/`), regexp.MustCompile(`^src/extension/editor`)}
	jsTest      = regexp.MustCompile(`^test/.*\.js$`)
	goTest      = regexp.MustCompile(`^src/.*_test\.go$`)
	commandLine = regexp.MustCompile(`^(?: {4}\S|\./RUNME\.sh\s)`)
	commandWord = regexp.MustCompile("[^\\s\"'`]+")
	comment     = regexp.MustCompile(`^\s*(//|/\*|\*|$)`)
	indented    = regexp.MustCompile(`^\s`)
)

// The lines one hunk adds and takes away. [[spec/design_output/tree#the-rules-over-two-files]]
type block struct {
	added   []string
	removed []string
}

// The lines one file's hunks add and take away, whole and block by block. [[spec/design_output/tree#the-rules-over-two-files]]
type hunks struct {
	added   []string
	removed []string
	blocks  []*block
}

// Each file's hunks, in the order the delta opens them. A deleted file opens none, and a line counts past an @@ alone. [[spec/tickets/cage-commit-guards-port]]
func hunksIn(delta string) ([]string, map[string]*hunks) {
	var order []string
	out := map[string]*hunks{}
	file, inHunk := "", false
	for _, line := range lineEnd.Split(delta, -1) {
		if opened := gitFile.FindStringSubmatch(line); opened != nil {
			file, inHunk = opened[1], false
			if out[file] == nil {
				out[file] = &hunks{}
				order = append(order, file)
			}
			continue
		}
		if file == "" {
			continue
		}
		if strings.HasPrefix(line, gone) {
			delete(out, file)
			order = without(order, file)
			file = ""
			continue
		}
		if strings.HasPrefix(line, hunkOpen) {
			inHunk = true
			out[file].blocks = append(out[file].blocks, &block{})
			continue
		}
		if !inHunk {
			continue
		}
		one := out[file]
		last := one.blocks[len(one.blocks)-1]
		if strings.HasPrefix(line, "+") {
			one.added = append(one.added, line[1:])
			last.added = append(last.added, line[1:])
		} else if strings.HasPrefix(line, "-") {
			one.removed = append(one.removed, line[1:])
			last.removed = append(last.removed, line[1:])
		}
	}
	return order, out
}

// The code files a delta changes with no test naming them, beside the staged tests and the ones a held ticket carries. A merge passes whole. [[spec/tickets/cage-commit-guards-port]]
func UntestedIn(delta string, read func(path string) string, merging bool, carried []string) []string {
	if merging {
		return nil
	}
	files, each := hunksIn(delta)
	var tests []string
	for _, one := range append(append([]string{}, files...), carried...) {
		if isTest(one) && !holds(tests, one) {
			tests = append(tests, one)
		}
	}
	var out []string
	for _, one := range files {
		if !isSource(one) || matchesAny(copied, one) || !codeIn(each[one]) {
			continue
		}
		named := false
		for _, test := range tests {
			var added []string
			if held := each[test]; held != nil {
				added = held.added
			}
			if names(test, one, added, read) {
				named = true
				break
			}
		}
		if !named {
			out = append(out, one)
		}
	}
	return out
}

// The test paths a ticket's command lines name: a path under test/, or a Go test. [[spec/tickets/cage-commit-guards-port]]
func CarriedIn(text string) []string {
	var out []string
	for _, line := range lineEnd.Split(text, -1) {
		if !commandLine.MatchString(line) {
			continue
		}
		for _, one := range commandWord.FindAllString(line, -1) {
			if isTest(one) && !holds(out, one) {
				out = append(out, one)
			}
		}
	}
	return out
}

// The tests every held ticket's command lines carry, off the holds whose ticket still stands, as heldTests in src/scripts/guidance-hand.js. [[spec/tickets/cage-commit-guards-port]]
func HeldTests(tree Tree) []string {
	var out []string
	for _, name := range tree.List(holdFolder) {
		if !strings.HasSuffix(name, heldEnd) {
			continue
		}
		var held struct {
			Path any `json:"path"`
		}
		text, _ := tree.Read(holdFolder + "/" + name)
		if json.Unmarshal([]byte(text), &held) != nil {
			continue
		}
		path := yaml.JSONText(held.Path)
		if path == "" || !stillHeld(tree, path) {
			continue
		}
		ticket, ok := tree.Read(path)
		if !ok {
			continue
		}
		for _, one := range CarriedIn(ticket) {
			if !holds(out, one) {
				out = append(out, one)
			}
		}
	}
	return out
}

// The refusal naming every code file with no test beside it. [[spec/tickets/cage-commit-guards-port]]
func RefusedTest(files []string) string {
	lines := []string{"This commit changes code, and it carries no test beside it.", ""}
	for _, one := range files {
		lines = append(lines, "  "+one)
	}
	lines = append(lines, "", "Stage the test proving the change, and commit again. "+
		"Rule five of spec/guidance/code/testing.md says why.")
	return strings.Join(lines, "\n")
}

// [[spec/design_output/tree#the-rules-over-two-files]]
func isTest(path string) bool { return jsTest.MatchString(path) || goTest.MatchString(path) }

// The server's JavaScript, its Go past the tests, and the level0 lib and hooks. [[spec/design_output/tree#the-rules-over-two-files]]
func isSource(path string) bool {
	return matchesAny(source, path) || goSource.MatchString(path) && !strings.HasSuffix(path, "_test.go")
}

// A hunk of comments alone, or a move, changes no code; a hunk taking lines away and adding none does. [[spec/design_output/tree#the-rules-over-two-files]]
func codeIn(one *hunks) bool {
	if movedWhole(one.blocks) || layoutAlone(one) {
		return false
	}
	if len(one.added) == 0 && len(one.removed) > 0 {
		return true
	}
	for _, line := range append(append([]string{}, one.added...), one.removed...) {
		if !comment.MatchString(line) {
			return true
		}
	}
	return false
}

// Whether in each hunk the lines added read as the lines taken away once each run of spacing reads as one space, as a formatter's alignment leaves them. [[spec/tickets/go-rules-exemption-marker]]
func layoutAlone(one *hunks) bool {
	if len(one.blocks) == 0 {
		return false
	}
	for _, hunk := range one.blocks {
		if len(hunk.added) == 0 || len(hunk.added) != len(hunk.removed) {
			return false
		}
		for index, line := range hunk.added {
			if strings.Join(strings.Fields(line), " ") != strings.Join(strings.Fields(hunk.removed[index]), " ") {
				return false
			}
		}
	}
	return true
}

// Whether every hunk takes away or adds one whole block, and each block taken away lands again in order. [[spec/tickets/a-reorder-asks-a-test]]
func movedWhole(blocks []*block) bool {
	var gone, come []string
	for _, one := range blocks {
		if len(one.added) > 0 && len(one.removed) > 0 {
			return false
		}
		if len(one.removed) > 0 {
			if !wholeBlock(one.removed) {
				return false
			}
			gone = append(gone, strings.Join(one.removed, "\n"))
		}
		if len(one.added) > 0 {
			come = append(come, strings.Join(one.added, "\n"))
		}
	}
	if len(gone) == 0 || len(gone) != len(come) {
		return false
	}
	for _, lines := range gone {
		at := -1
		for i, one := range come {
			if one == lines {
				at = i
				break
			}
		}
		if at < 0 {
			return false
		}
		come = append(come[:at], come[at+1:]...)
	}
	return true
}

// A block opening at the left margin whose brackets close. [[spec/tickets/a-reorder-asks-a-test]]
func wholeBlock(lines []string) bool {
	var code []string
	for _, line := range lines {
		if strings.TrimSpace(line) != "" {
			code = append(code, line)
		}
	}
	if len(code) == 0 || indented.MatchString(code[0]) {
		return false
	}
	depth := 0
	for _, ch := range strings.Join(code, "\n") {
		if strings.ContainsRune("([{", ch) {
			depth++
		} else if strings.ContainsRune(")]}", ch) {
			depth--
		}
		if depth < 0 {
			return false
		}
	}
	return depth == 0
}

// A test names a file by its package folder, its own name, or an import in its added lines or its text. [[spec/design_output/tree#the-rules-over-two-files]]
func names(test, path string, added []string, read func(string) string) bool {
	if goTest.MatchString(test) {
		return strings.HasSuffix(path, ".go") && folderOf(test) == folderOf(path)
	}
	one := strings.TrimSuffix(path[strings.LastIndex(path, "/")+1:], ".js")
	said := strings.TrimSuffix(test[strings.LastIndex(test, "/")+1:], ".test.js")
	if said == one || strings.HasPrefix(said, one+"-") {
		return true
	}
	if importsIt(strings.Join(added, "\n"), path) {
		return true
	}
	return read != nil && importsIt(read(test), path)
}

// The folder of a path, as the bridge's slice reads it where no slash stands. [[spec/design_output/tree#the-rules-over-two-files]]
func folderOf(path string) string {
	if at := strings.LastIndex(path, "/"); at >= 0 {
		return path[:at]
	}
	if path == "" {
		return ""
	}
	return path[:len(path)-1]
}

// Whether a text imports the path, since a path inside a string reads as prose. [[spec/design_output/tree#the-rules-over-two-files]]
func importsIt(said, path string) bool {
	return regexp.MustCompile(`(?:from|import)\s*\(?\s*["'][^"']*` + regexp.QuoteMeta(path) + `["']`).MatchString(said)
}

// [[spec/tickets/cage-commit-guards-port]]
func without(words []string, word string) []string {
	out := words[:0]
	for _, one := range words {
		if one != word {
			out = append(out, one)
		}
	}
	return out
}
