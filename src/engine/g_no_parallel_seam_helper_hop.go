package main

// A PARALLEL TEST SWAPS NO SEAM THROUGH A HELPER EITHER.
//
// t.Parallel() says this test runs beside its siblings, so a package variable
// assigned while they run is assigned under all of them. The door beside this
// one refuses the swap written in the test body. The swap that got through was
// one hop away: the test called a helper in its own package and the helper did
// the assigning, so the file the door read held no assignment at all, and the
// failure landed in whichever sibling happened to be reading. It is the one
// defect a green run says nothing about.
//
// THIS ANSWERS ONE HOP AND NO MORE. A helper that calls a second helper is not
// followed, because the far end of a chain is a different question and a guess
// at it would refuse tests that swap nothing.

import (
	"fmt"
	"os"
	"path"
	"path/filepath"
	"regexp"
	"sort"
	"strings"
)

var theParallelCallMark = regexp.MustCompile(`\bt\.Parallel\(\)`)
var aBareAssignmentLine = regexp.MustCompile(`(?m)^\s+([A-Za-z_]\w*)\s*=[^=]`)
var aPackageLevelVarLine = regexp.MustCompile(`(?m)^var\s+([A-Za-z_]\w*)|^\t([A-Za-z_]\w*)\s+=[^=]`)
var aFunctionHeadlineLine = regexp.MustCompile(`^func\s+(?:\([^)]*\)\s*)?([A-Za-z_]\w*)\s*\(`)
var aCallLikeName = regexp.MustCompile(`[A-Za-z_]\w*\s*\(`)

func aParallelTestSwappingASeamThroughAHelper(r Roots, _ bool, rel, text string) error {
	if !strings.HasSuffix(rel, "_test.go") || !theParallelCallMark.MatchString(text) {
		return nil
	}
	// A SWAP UNDER A LOCK IS DELIBERATE. A seam taken and released around the
	// test is not a race, and refusing it would refuse the answer this refusal
	// asks the writer for.
	if strings.Contains(text, ".Lock()") {
		return nil
	}
	swapped := theSeamsAHelperHopSwaps(r, path.Dir(rel), text)
	names := make([]string, 0, len(swapped))
	for seam := range swapped {
		names = append(names, seam)
	}
	// THE FIRST NAME IN ORDER, so two seams do not name a different one every
	// run and read as a door that changed its mind.
	sort.Strings(names)
	if len(names) == 0 {
		return nil
	}
	seam := names[0]
	return fmt.Errorf("%s calls t.Parallel() and calls %s, which assigns %s, a variable the "+
		"package declares. The assignment is one hop out of the test body, so this file reads "+
		"clean while every sibling running beside it reads the swapped variable, and the failure "+
		"lands in whichever test was looking and somewhere else the next run. Drop t.Parallel(), "+
		"take a lock around the swap, or hand %s in to %s rather than swapping it.",
		rel, swapped[seam], seam, seam, swapped[seam])
}

// WHICH SEAMS A ONE HOP HELPER CALL SWAPS.
//
// Given the package folder and the body a test file will have, the answer maps
// each package variable that gets assigned to the helper that assigns it. A
// helper that takes a lock is left out, and so is a name the helper declares or
// receives as a parameter, because neither one is the package seam.
func theSeamsAHelperHopSwaps(r Roots, dir, text string) map[string]string {
	out := map[string]string{}
	// THE SEAMS ARE READ OUT OF THE FILES THAT ARE NOT TESTS. A var in a test
	// file is that test package's own, and calling it a seam would refuse a
	// test for touching what the tests declared themselves.
	seams := thePackageSeamsBesideTheTest(r, dir)
	if len(seams) == 0 {
		return out
	}
	helpers := theHelpersBesideTheTest(r, dir)
	for name, body := range theTopLevelFunctionsIn(text) {
		helpers[name] = body
	}
	for _, called := range theNamesCalledIn(text) {
		body, ok := helpers[called]
		if !ok || strings.Contains(body, ".Lock()") {
			continue
		}
		for _, m := range aBareAssignmentLine.FindAllStringSubmatch(body, -1) {
			if !seams[m[1]] || theBodyDeclaresTheName(body, m[1]) {
				continue
			}
			out[m[1]] = called
		}
	}
	return out
}

func thePackageSeamsBesideTheTest(r Roots, dir string) map[string]bool {
	out := map[string]bool{}
	for name, src := range theGoSourcesBesideTheTest(r, dir) {
		if strings.HasSuffix(name, "_test.go") {
			continue
		}
		for _, m := range aPackageLevelVarLine.FindAllStringSubmatch(src, -1) {
			for _, got := range m[1:] {
				if got != "" {
					out[got] = true
				}
			}
		}
	}
	return out
}

// THE HELPERS ARE EVERY TOP LEVEL FUNCTION IN THE FOLDER, test files included,
// because a helper that swaps a seam for a test usually lives beside the tests.
func theHelpersBesideTheTest(r Roots, dir string) map[string]string {
	out := map[string]string{}
	for _, src := range theGoSourcesBesideTheTest(r, dir) {
		for name, body := range theTopLevelFunctionsIn(src) {
			out[name] = body
		}
	}
	return out
}

func theGoSourcesBesideTheTest(r Roots, dir string) map[string]string {
	out := map[string]string{}
	at := filepath.Join(r.Work, filepath.FromSlash(dir))
	entries, err := os.ReadDir(at)
	if err != nil {
		return out
	}
	for _, e := range entries {
		name := e.Name()
		if e.IsDir() || !strings.HasSuffix(name, ".go") {
			continue
		}
		b, err := os.ReadFile(filepath.Join(at, name))
		if err != nil {
			continue
		}
		out[name] = string(b)
	}
	return out
}

// A FUNCTION RUNS FROM ITS HEADLINE TO THE BRACE IN COLUMN ONE. Every file the
// tree keeps is formatted, so that brace is the end of the body and nothing
// inside the body sits at column one. The headline is kept as the first line of
// what is returned, because the parameter names are part of the answer.
func theTopLevelFunctionsIn(src string) map[string]string {
	out := map[string]string{}
	name := ""
	var body []string
	for _, line := range strings.Split(src, "\n") {
		line = strings.TrimSuffix(line, "\r")
		if name == "" {
			m := aFunctionHeadlineLine.FindStringSubmatch(line)
			if m != nil && strings.HasSuffix(line, "{") {
				name = m[1]
				body = []string{line}
			}
			continue
		}
		if line == "}" {
			out[name] = strings.Join(body, "\n")
			name = ""
			continue
		}
		body = append(body, line)
	}
	return out
}

// THE NAMES A BODY CALLS, with the declarations left out. A name after a dot is
// a method on something else, and a name on a func line is being declared
// rather than called.
func theNamesCalledIn(text string) []string {
	var out []string
	for _, line := range strings.Split(text, "\n") {
		line = strings.TrimSuffix(line, "\r")
		if strings.HasPrefix(strings.TrimSpace(line), "func ") {
			continue
		}
		for _, at := range aCallLikeName.FindAllStringIndex(line, -1) {
			if at[0] > 0 && theCharacterJoinsAName(line[at[0]-1]) {
				continue
			}
			out = append(out, strings.TrimRight(line[at[0]:at[1]-1], " \t"))
		}
	}
	return out
}

func theCharacterJoinsAName(c byte) bool {
	if c == '.' || c == '_' {
		return true
	}
	return (c >= '0' && c <= '9') || (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z')
}

// A NAME THE HELPER DECLARES OR RECEIVES IS ITS OWN. A local or a parameter
// shadowing a package variable is not a swap, and reading one as a swap is how
// a door starts naming tests that swap nothing.
func theBodyDeclaresTheName(body, name string) bool {
	lines := strings.Split(body, "\n")
	if len(lines) > 0 && theHeadlineNamesTheSeam(lines[0], name) {
		return true
	}
	quoted := regexp.QuoteMeta(name)
	declared := regexp.MustCompile(`(?m)\bvar\s+` + quoted + `\b|^\s*` + quoted + `\s*(?:,[^=\n]*)?:=`)
	return declared.MatchString(body)
}

// THE PARAMETER LIST IS READ LOOSELY, and a type whose name matches counts as a
// parameter. Reading it loosely only ever makes this door quieter, and a door
// that is quiet about one odd helper is better than one that names a test which
// swapped nothing.
func theHeadlineNamesTheSeam(headline, name string) bool {
	open := strings.Index(headline, "(")
	shut := strings.LastIndex(headline, ")")
	if open < 0 || shut <= open {
		return false
	}
	apart := func(r rune) bool {
		return r == ',' || r == ' ' || r == '\t' || r == '*' || r == '(' || r == ')'
	}
	for _, field := range strings.FieldsFunc(headline[open+1:shut], apart) {
		if field == name {
			return true
		}
	}
	return false
}
