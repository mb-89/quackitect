// The retro's own folder, its input and the sources whose lines carry a time:
// what every retro verb reads, owned once.
// [[spec/guidance/retro/chapter]]
package main

import (
	"path/filepath"
	"regexp"

	"quackitect/src/index"
)

// The folder the retros stand under, as RETRO in .claude/skills/level0/lib/folders.js names it, and the input folder of one retro. [[spec/guidance/retro/chapter]]
const (
	retroFolder = ".se/.retro"
	retroInput  = "input"
)

// The battery's record a retro keeps, as BATTERY in src/engine/retro/effect.js named it. [[spec/guidance/retro/effect]]
const retroBattery = "battery.json"

// A source of the input whose lines carry a time, and the field naming it. [[spec/guidance/retro/chapter]]
type retroSource struct {
	top   string
	field *regexp.Regexp
}

// The sources a line carries a time in. [[spec/guidance/retro/chapter]]
var retroTimed = []retroSource{
	{top: "transcripts", field: regexp.MustCompile(`"timestamp":"([^"]+)"`)},
	{top: "log", field: regexp.MustCompile(`"at":"([^"]+)"`)},
}

// The retro's own folder under the root. [[spec/guidance/retro/chapter]]
func retroHome(root, name string) string {
	return filepath.Join(root, filepath.FromSlash(retroFolder), name)
}

// The root a retro verb works under: the tree's root, or the folder quack stands in where none answers. [[spec/tickets/retro-verbs-port-to-go]]
func retroRoot() string {
	root, err := index.Root()
	if err != nil {
		return "."
	}
	return root
}
