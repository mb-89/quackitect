// The write door over a harness write, off onToolWrite in src/bridge/write.js:
// a path outside the tree passes, the handover meets its schema and the voice,
// and every other path meets the no-ticket refusal.
// [[spec/tickets/cage-write-door-port]]
package hooks

import (
	"strings"

	"quackitect/src/modules/hooks/command"
	"quackitect/src/modules/hooks/write"
)

// The refusal of a harness write, or nothing where it lands. A door with no Schema or Prose reads neither. [[spec/design_output/level0#a-write-names-its-ticket]]
func (d *Door) writeDoor(e map[string]any, root string) string {
	where := write.RelativeTo(root, write.PathOf(e))
	if write.Outside(where) {
		return ""
	}
	if where != write.Handover {
		return write.ToolRefusal(textOf(e, "tool"))
	}
	if !write.Carries(e) {
		return ""
	}
	was, stands := disk{root}.Read(where)
	whole := write.WholeAfter(e, was, stands)
	if d.from.Schema != nil {
		if said := write.RefusedSchema(where, d.from.Schema(root, where, whole)); said != "" {
			return said
		}
	}
	if d.from.Prose == nil {
		return ""
	}
	var found []write.Finding
	for _, one := range d.from.Prose(root, where, whole) {
		if command.Refuses(one.Rule) {
			found = append(found, one)
		}
	}
	if len(found) == 0 {
		return ""
	}
	return refusedVoice(where, found)
}

// The refusal of a write the voice refuses, naming each finding and the rules to hold, off refusal in lib/refuse.js. [[spec/design_output/level0#the-write-door]]
func refusedVoice(where string, found []write.Finding) string {
	lines := []string{"The voice rules refuse this write to " + where + ".", ""}
	var names []string
	for _, one := range found {
		lines = append(lines, "  "+write.PlaceOf(where, one)+"  "+one.Rule)
		if one.Said != "" {
			lines = append(lines, "    wrote: "+command.Cut(one.Said, command.LineCut))
		}
		lines = append(lines, "    "+one.Message, "")
		if !holdsName(names, one.Rule) {
			names = append(names, one.Rule)
		}
	}
	named := names[len(names)-1]
	if len(names) > 1 {
		named = strings.Join(names[:len(names)-1], ", ") + " and " + named
	}
	return strings.Join(append(lines, "Hold "+named+" for the rest of this turn: apply the same rule to every line you write next, and fix the lines you already wrote if they break it."), "\n")
}

// [[spec/design_output/level0#the-write-door]]
func holdsName(names []string, name string) bool {
	for _, one := range names {
		if one == name {
			return true
		}
	}
	return false
}
