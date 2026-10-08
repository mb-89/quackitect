// The write door's pure reads: the refusal a harness write naming no ticket
// meets, the road a write takes, and the file an edit leaves.
// [[spec/tickets/cage-write-door-port]]
package write

import (
	"regexp"
	"strings"
)

// The handover, the one path inside the tree a harness write reaches past the no-ticket refusal. src/modules/check/folders.go owns it. [[spec/design_output/level0#a-write-names-its-ticket]]
const Handover = ".se/HANDOVER.md"

// The tools the harness writes a file through, none carrying a ticket field, and the one of them no rule past the no-ticket refusal reads. [[spec/design_output/level0#a-write-names-its-ticket]]
const (
	WriteTool    = "Write"
	EditTool     = "Edit"
	MultiTool    = "MultiEdit"
	NotebookTool = "NotebookEdit"
	patchCall    = "mcp__level0__patch"
	TicketHow    = "Name the open ticket this write serves in the ticket field: its file name under spec/tickets or .se/tickets, without .md."
)

// A path the tree reads as its own, and one standing outside it. [[spec/design_output/level0#the-write-door]]
var outsidePath = regexp.MustCompile(`^([A-Za-z]:)?[\\/]`)

// One finding the voice keeps over a written file, as Vale answers it. [[spec/tickets/cage-write-door-port]]
type Finding struct {
	Rule     string `json:"rule"`
	Line     int    `json:"line"`
	Column   int    `json:"column"`
	Said     string `json:"said"`
	Message  string `json:"message"`
	Severity string `json:"severity"`
}

// What the schemas answer over a written note: the kind that reads it, whether the note reads as a stranger to the schema governing its path, and the findings. [[spec/design_output/schema#the-door-refuses-a-departure]]
type Judged struct {
	Kind     string    `json:"kind"`
	Stranger bool      `json:"stranger"`
	Found    []Finding `json:"found"`
}

// Whether a tool writes a file past every ticket field. [[spec/design_output/level0#a-write-names-its-ticket]]
func Writes(tool string) bool {
	return tool == WriteTool || tool == EditTool || tool == MultiTool || tool == NotebookTool
}

// The refusal a harness write tool meets, since it carries no ticket field. [[spec/design_output/level0#a-write-names-its-ticket]]
func ToolRefusal(tool string) string {
	return tool + " carries no ticket field, so the door takes no write through it. Call " + patchCall + ", with an exact op for one spot. " + TicketHow
}

// The path a write names, a file's or a notebook's. [[spec/design_output/level0#a-write-names-its-ticket]]
func PathOf(e map[string]any) string {
	if said, ok := e["file_path"]; ok && said != nil {
		return textIn(said)
	}
	return textIn(e["notebook_path"])
}

// A path under the root, relative to it, and any other path as it stands, as relativeTo in src/modules/check/paths.go reads it. [[spec/design_output/level0#the-write-door]]
func RelativeTo(root, path string) string {
	said := strings.ReplaceAll(path, "\\", "/")
	at := strings.TrimRight(strings.ReplaceAll(root, "\\", "/"), "/")
	if at == "" {
		return said
	}
	if under := at + "/"; strings.HasPrefix(strings.ToLower(said), strings.ToLower(under)) {
		return said[len(under):]
	}
	return said
}

// Whether a path relative to the root stands outside the tree. [[spec/design_output/level0#the-write-door]]
func Outside(where string) bool {
	return outsidePath.MatchString(where)
}

// Whether the write door reads the text a write carries: a Write, an Edit and a MultiEdit naming a file. [[spec/design_output/level0#the-write-door]]
func Carries(e map[string]any) bool {
	if textIn(e["file_path"]) == "" {
		return false
	}
	switch textIn(e["tool"]) {
	case WriteTool, EditTool:
		return true
	case MultiTool:
		_, ok := e["edits"].([]any)
		return ok
	}
	return false
}

// The file as it stands after the write: a Write's content, or each edit applied over the text on disk. [[spec/design_output/level0#the-write-door]]
func WholeAfter(e map[string]any, was string, stands bool) string {
	tool := textIn(e["tool"])
	if tool == WriteTool {
		return textIn(e["content"])
	}
	edits := []any{e}
	if list, ok := e["edits"].([]any); ok && tool == MultiTool {
		edits = list
	}
	if !stands {
		var texts []string
		for _, one := range edits {
			texts = append(texts, textIn(fieldOf(one, "new_string")))
		}
		return strings.Join(texts, "\n")
	}
	text := was
	for _, one := range edits {
		from, to := textIn(fieldOf(one, "old_string")), textIn(fieldOf(one, "new_string"))
		if from == "" {
			continue
		}
		if all, _ := fieldOf(one, "replace_all").(bool); all {
			text = strings.ReplaceAll(text, from, to)
		} else {
			text = strings.Replace(text, from, to, 1)
		}
	}
	return text
}

// [[spec/design_output/level0#the-write-door]]
func fieldOf(one any, key string) any {
	if said, ok := one.(map[string]any); ok {
		return said[key]
	}
	return nil
}

// [[spec/design_output/level0#the-write-door]]
func textIn(said any) string {
	if text, ok := said.(string); ok {
		return text
	}
	return ""
}
