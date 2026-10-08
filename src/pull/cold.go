// The cold path: the files a running box loads its hooks and level zero off,
// which a box takes in before it works on.
// [[spec/tickets/running-work-takes-main-fixes]]
package pull

import "strings"

// The cold path: a commit touching one runs the cold probe, and a pull on a work branch asks a sync where main moves one. The list matches coldPath in src/quack/probe_cold.go, the Go cold probe. [[spec/design_output/level0#the-cold-probe]] [[spec/tickets/running-work-takes-main-fixes]] [[spec/tickets/probes-leave-node]]
var ColdPath = []string{
	".claude/skills/level0/hooks/",
	"src/modules/hooks/",
	"src/quack/",
	"install.sh",
}

// The paths of a list the cold path holds, by a folder entry or a file entry. A folder entry ends on a slash and takes every path under it. [[spec/tickets/running-work-takes-main-fixes]]
func ColdIn(paths []string) []string {
	var out []string
	for _, path := range paths {
		for _, cold := range ColdPath {
			if (strings.HasSuffix(cold, "/") && strings.HasPrefix(path, cold)) || path == cold {
				out = append(out, path)
				break
			}
		}
	}
	return out
}
