// The write door over a harness write, off onToolWrite in src/bridge/write.js:
// a path outside the tree passes, the handover meets its schema and the voice,
// and every other path meets the no-ticket refusal.
// [[spec/tickets/cage-write-door-port]]
package hooks

import (
	"quackitect/src/modules/hooks/command"
	"quackitect/src/modules/hooks/write"
	"quackitect/src/prose"
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
	var schema func() write.Judged
	if d.from.Schema != nil {
		schema = func() write.Judged { return d.from.Schema(root, where, whole) }
	}
	var voice func() []write.Finding
	if d.from.Prose != nil {
		voice = func() []write.Finding { return d.from.Prose(root, where, whole) }
	}
	return Judge(where, schema, voice)
}

// The refusal of a written text: the schema's first, then the voice's, or nothing where both pass. A nil read reads nothing. [[spec/tickets/edit-tools-answer-in-go]]
func Judge(where string, schema func() write.Judged, voice func() []write.Finding) string {
	if schema != nil {
		if said := write.RefusedSchema(where, schema()); said != "" {
			return said
		}
	}
	if voice == nil {
		return ""
	}
	var found []write.Finding
	for _, one := range voice() {
		if command.Refuses(one.Rule) {
			found = append(found, one)
		}
	}
	if len(found) == 0 {
		return ""
	}
	return RefusedVoice(where, found)
}

// The refusal of a write the voice refuses, naming each finding and the rules to hold, off refusal in lib/refuse.js. [[spec/design_output/level0#the-write-door]]
func RefusedVoice(where string, found []write.Finding) string {
	refused := make([]prose.Refused, 0, len(found))
	for _, one := range found {
		refused = append(refused, prose.Refused{Line: one.Line, Column: one.Column, Rule: one.Rule, Message: one.Message, Said: command.Cut(one.Said, command.LineCut)})
	}
	return "The voice rules refuse this write to " + where + ".\n\n" + prose.Body(where, refused)
}
