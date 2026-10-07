// The retro's own folder, its input and the sources whose lines carry a time:
// what every retro verb reads, owned once.
// [[spec/guidance/retro/chapter]]
package main

import (
	"path/filepath"
	"regexp"
	"strings"
)

// The folder the retros stand under, as RETRO in .claude/skills/level0/lib/folders.js names it. [[spec/guidance/retro/chapter]]
const retroFolder = ".se/.retro"

// The input folder of one retro, which collect fills. [[spec/guidance/retro/chapter]]
const retroInput = "input"

// The battery's record a retro keeps beside its input. [[spec/guidance/retro/effect]]
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

// The root a retro verb works under: the work root SE_WORK_ROOT names, then the root the box doors read. [[spec/design_output/vehicle#the-work-root-inherits]]
func retroRootOf(d boxDoors) string {
	if at := strings.TrimSpace(d.env(workRoot)); at != "" {
		return at
	}
	return d.root
}
