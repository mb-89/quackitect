// The ratio guard: a module whose test lines pass its code lines.
// [[spec/design_output/model#the-guards-hold-a-baseline]]
package imports

import (
	"fmt"
	"path"
	"regexp"
	"slices"
	"strings"
)

// A relative import a JavaScript file names, which places its test in a module. [[spec/design_output/model#the-guards-hold-a-baseline]]
var relativeImport = regexp.MustCompile(`(?m)^\s*import\s[^"']*["'](\.{1,2}/[^"']+)["']`)

// One module's counts. [[spec/design_output/model#the-guards-hold-a-baseline]]
type ratioCounts struct{ tests, code int }

// Each module past one to one, as its language and folder, a tab, and both counts, sorted. [[spec/design_output/model#the-guards-hold-a-baseline]]
func RatioOffenders(tracked []string, read func(path string) string) []string {
	modules := map[string]*ratioCounts{}
	count := func(key string) *ratioCounts {
		if modules[key] == nil {
			modules[key] = &ratioCounts{}
		}
		return modules[key]
	}
	for _, one := range tracked {
		switch {
		case strings.HasSuffix(one, "_test.go"):
			count("go " + path.Dir(one)).tests += TextLines(read(one))
		case strings.HasSuffix(one, ".go"):
			count("go " + path.Dir(one)).code += TextLines(read(one))
		case strings.HasSuffix(one, ".test.js"):
			text := read(one)
			count("js " + jsModuleOf(one, text)).tests += TextLines(text)
		case strings.HasSuffix(one, ".js"):
			count("js " + path.Dir(one)).code += TextLines(read(one))
		}
	}
	named := []string{}
	for key, counts := range modules {
		if counts.tests > counts.code {
			named = append(named, fmt.Sprintf("%s\t%d test lines, %d code lines", key, counts.tests, counts.code))
		}
	}
	slices.Sort(named)
	return named
}

// The lines holding text. [[spec/design_output/model#the-guards-hold-a-baseline]]
func TextLines(text string) int {
	lines := 0
	for _, line := range strings.Split(text, "\n") {
		if strings.TrimSpace(line) != "" {
			lines++
		}
	}
	return lines
}

// The lines of every file the entries reach through relative imports, each file counted once. [[spec/tickets/level0-tests-to-plugin-test]]
func ReachedLines(entries []string, read func(path string) string) int {
	seen := map[string]bool{}
	lines := 0
	for queue := slices.Clone(entries); len(queue) > 0; queue = queue[1:] {
		one := path.Clean(queue[0])
		if seen[one] {
			continue
		}
		seen[one] = true
		text := read(one)
		lines += TextLines(text)
		for _, match := range relativeImport.FindAllStringSubmatch(text, -1) {
			queue = append(queue, path.Join(path.Dir(one), match[1]))
		}
	}
	return lines
}

// The folder of the first source file a JavaScript test imports, or the test's own folder where it imports none. [[spec/design_output/model#the-guards-hold-a-baseline]]
func jsModuleOf(test, text string) string {
	for _, match := range relativeImport.FindAllStringSubmatch(text, -1) {
		source := path.Join(path.Dir(test), match[1])
		if !strings.HasPrefix(source, "../") && !strings.HasSuffix(source, ".test.js") {
			return path.Dir(source)
		}
	}
	return path.Dir(test)
}
