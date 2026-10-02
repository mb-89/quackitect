// The shape of a full update, off src/engine/status.js: the chapters
// spec/config/status.yaml names, which the door stamps on each event while the
// owner asks for a full update, and what a reply lacks of them.
// [[spec/tickets/cage-stop-rules-port]]
package hooks

import (
	"regexp"
	"strings"
)

// The file the chapters stand in, the ask that wants them, and the field the door stamps them under. [[spec/design_output/extension#the-ask-is-a-line]]
const (
	statusShape  = "spec/config/status.yaml"
	fullUpdate   = "full"
	heldChapters = "status.chapters"
)

// A chapter's line in the shape. [[spec/design_output/extension#the-ask-is-a-line]]
var chapterLine = regexp.MustCompile(`^\s*-\s*name:\s*(.+)$`)

// The chapters a full update carries, off the shape under the root, or none where the owner asks for no full update or no shape stands. [[spec/design_output/extension#the-ask-is-a-line]]
func chaptersAt(root, wanted string) []string {
	if wanted != fullUpdate || root == "" {
		return nil
	}
	text, ok := disk{root}.Read(statusShape)
	if !ok {
		return nil
	}
	var out []string
	for _, line := range strings.Split(text, "\n") {
		if found := chapterLine.FindStringSubmatch(line); found != nil {
			out = append(out, strings.TrimSpace(found[1]))
		}
	}
	return out
}

// The chapters the door stamped on an event, as it stamped them or read back off JSON. [[spec/tickets/cage-stop-rules-port]]
func chaptersIn(held map[string]any) []string {
	switch said := held[heldChapters].(type) {
	case []string:
		return said
	case []any:
		out := make([]string, 0, len(said))
		for _, one := range said {
			if name, ok := one.(string); ok {
				out = append(out, name)
			}
		}
		return out
	}
	return nil
}

// What a reply lacks of the chapters, or nothing where it carries each as a heading with text under it. [[spec/design_output/extension#the-ask-is-a-line]]
func statusLacks(text string, chapters []string) string {
	var lacking []string
	for _, name := range chapters {
		heading := regexp.MustCompile(`(?im)^#+\s*` + regexp.QuoteMeta(name) + `\b[^\n]*\n+([^#\n][^\n]*)`)
		if !heading.MatchString(text) {
			lacking = append(lacking, name)
		}
	}
	if len(lacking) == 0 {
		return ""
	}
	return "The status update lacks " + strings.Join(lacking, ", ") + ". Write every chapter as a heading with text under it."
}

// What a reply lacks of the shape the demand asks for, or nothing where the demand asks for none. [[spec/design_output/level0#the-owners-prompt-comes-first]]
func (demand *Demand) lacks(text string) string {
	if demand == nil || len(demand.Chapters) == 0 {
		return ""
	}
	return statusLacks(text, demand.Chapters)
}

// The block a full update lacking its chapters holds the turn's end with, off holdsTurn in src/bridge/answer.js, or nothing. [[spec/design_output/extension#the-ask-is-a-line]]
func holdsTurn(state Holds, text string) string {
	lacks := state.Demand.lacks(strings.TrimSpace(text))
	if lacks == "" {
		return ""
	}
	return lacks + " " + state.Demand.Why + ", and the turn ends when it stands."
}
