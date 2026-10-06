// The script guard: a tracked script standing outside the engine.
// [[spec/design_output/model#the-guards-hold-a-baseline]]
package imports

import (
	"slices"
	"strings"
)

// The endings a script carries, the engine's roots, and how many opening lines a marker stands in. [[spec/design_output/model#the-guards-hold-a-baseline]]
var (
	scriptEndings = []string{".sh", ".py", ".bash"}
	engineRoots   = []string{"src/", ".claude/skills/"}
	engineFile    = "RUNME.sh"
	markerLines   = 5
)

// The marker sparing a script outside the engine, with its reason. [[spec/design_output/model#the-guards-hold-a-baseline]]
const scriptMarker = "level0: HandScript - "

// Each tracked script outside the engine carrying no marker, sorted. [[spec/design_output/model#the-guards-hold-a-baseline]]
func HandScripts(tracked []string, read func(path string) string) []string {
	named := []string{}
	for _, one := range tracked {
		if one == engineFile || slices.ContainsFunc(engineRoots, func(root string) bool { return strings.HasPrefix(one, root) }) {
			continue
		}
		text := read(one)
		if !isScript(one, text) || markedScript(text) {
			continue
		}
		named = append(named, one)
	}
	slices.Sort(named)
	return named
}

// Whether a file is a script: a script ending, or a first line opening on #!. [[spec/design_output/model#the-guards-hold-a-baseline]]
func isScript(name, text string) bool {
	return strings.HasPrefix(text, "#!") || slices.ContainsFunc(scriptEndings, func(end string) bool { return strings.HasSuffix(name, end) })
}

// Whether the script's opening lines carry the marker. [[spec/design_output/model#the-guards-hold-a-baseline]]
func markedScript(text string) bool {
	lines := strings.SplitN(text, "\n", markerLines+1)
	return slices.ContainsFunc(lines[:min(len(lines), markerLines)], func(line string) bool { return strings.Contains(line, scriptMarker) })
}
