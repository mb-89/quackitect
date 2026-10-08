// The score verb: it counts the improvement tickets earlier retros mint, and
// says how many of them still stand open in the tree.
// [[spec/design_input/the-agent-pulls-tickets]]
package main

import (
	"fmt"
	"io"
	"path/filepath"
	"slices"
	"strings"

	"quackitect/src/note"
	"quackitect/src/yaml"
)

// The name a retro's ticket and the group of its improvements open on. [[spec/design_input/the-agent-pulls-tickets]]
const retroScoreRetro = "retro-"

// A ticket under the tickets folder: its name and its text. [[spec/design_input/the-agent-pulls-tickets]]
type retroScoreNote struct {
	name, text string
}

func init() { register("retro score", retroScoreVerb(quietBox)) }

// The verb: every improvement a retro mints, and how many stay open. [[spec/design_input/the-agent-pulls-tickets]]
func retroScoreVerb(box func() boxDoors) twin {
	return func(argv []string, _ bool, out, errs io.Writer) int {
		type row struct{ name, group, state string }
		rows := []row{}
		d := box()
		for _, one := range retroScoreNotes(d.disk, retroRootOf(d)) {
			group := retroScoreField(one.text, "group")
			if strings.HasPrefix(one.name, retroScoreRetro) || !strings.HasPrefix(group, retroScoreRetro) {
				continue
			}
			state := retroScoreField(one.text, "state")
			if state == "" {
				state = openRow
			}
			rows = append(rows, row{one.name, group, state})
		}
		if len(rows) == 0 {
			fmt.Fprintln(out, "No retro mints an improvement yet, so this one scores nothing.")
			return 0
		}
		slices.SortStableFunc(rows, func(a, b row) int { return strings.Compare(a.name, b.name) })
		open := 0
		for _, one := range rows {
			if one.state != closedRow {
				open++
			}
		}
		fmt.Fprintf(out, "%d improvement(s) stand in the tree, and %d stay open.\n", len(rows), open)
		for _, one := range rows {
			fmt.Fprintf(out, "  %s %s, off %s\n", one.name, one.state, one.group)
		}
		return 0
	}
}

// Every ticket file under spec/tickets, in the order the folder lists them; a file that reads not reads as empty. [[spec/design_input/the-agent-pulls-tickets]]
func retroScoreNotes(disk diskDoors, root string) []retroScoreNote {
	at := filepath.Join(root, filepath.FromSlash(retroMintTickets))
	entries, err := disk.list(at)
	if err != nil {
		return nil
	}
	out := []retroScoreNote{}
	for _, one := range entries {
		if !one.Type().IsRegular() || !strings.HasSuffix(one.Name(), ".md") {
			continue
		}
		text := disk.text(filepath.Join(at, one.Name()))
		out = append(out, retroScoreNote{name: strings.TrimSuffix(one.Name(), ".md"), text: text})
	}
	return out
}

// A frontmatter field as fieldOf in src/branches/group.go reads it: trimmed, its link brackets off, and empty where it stands nowhere. [[spec/design_output/work#a-group-is-a-ticket]]
func retroScoreField(text, key string) string {
	said := note.FrontOf(yaml.SplitLines(text)).Said.Get(key)
	if said == nil {
		return ""
	}
	bare := strings.TrimSpace(fmt.Sprint(said))
	bare = strings.TrimSuffix(strings.TrimPrefix(bare, "[["), "]]")
	return strings.TrimSpace(bare)
}
