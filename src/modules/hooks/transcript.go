// The transcript rows a post carries, and what the door picks off them: the
// prompt's before, and a spoke post's last texts and rows.
// [[spec/tickets/level0-hooks-forward-to-go]]
package hooks

import "strings"

// The field the forwarder hands the newest rows under, the agent's texts the answer door reads, and the rows it reads past the prompt's own row. [[spec/tickets/a-reply-follows-its-prompt]]
const (
	rowsField    = "rows"
	lastTexts    = 4
	lastRows     = 64
	agentRole    = "assistant"
	resultsField = "results"
)

// The post with the fields the door picks off its rows: a prompt takes the newest row's id as its before, and a spoke post its last texts, its text and its rows. [[spec/tickets/a-reply-follows-its-prompt]]
func picks(post Post) Post {
	listed, ok := post.E[rowsField].([]any)
	if !ok || post.Event != promptEvent && post.Event != spokeEvent {
		return post
	}
	e := make(map[string]any, len(post.E))
	for key, value := range post.E {
		e[key] = value
	}
	post.E = e
	if post.Event == promptEvent {
		delete(e, rowsField)
		if len(listed) > 0 {
			newest, _ := listed[len(listed)-1].(map[string]any)
			if id := textOf(newest, "id", "uuid"); id != "" {
				e["before"] = id
			}
		}
		return post
	}
	texts := []any{}
	for at := len(listed) - 1; at >= 0 && len(texts) < lastTexts; at-- {
		row, _ := listed[at].(map[string]any)
		if said := strings.TrimSpace(textOf(row, "text")); textOf(row, "role") == agentRole && said != "" {
			texts = append([]any{said}, texts...)
		}
	}
	if len(listed) > lastRows {
		listed = listed[len(listed)-lastRows:]
	}
	rows := make([]any, 0, len(listed))
	for _, one := range listed {
		row, _ := one.(map[string]any)
		rows = append(rows, transcriptRow(row))
	}
	e["texts"], e[rowsField] = texts, rows
	if strings.TrimSpace(textOf(e, "text")) == "" && len(texts) > 0 {
		e["text"] = texts[len(texts)-1]
	}
	return post
}

// A row as the answer door reads it: its role, its id where it carries one, the results flag, and its text where the agent wrote it. [[spec/tickets/a-reply-follows-its-prompt]]
func transcriptRow(row map[string]any) map[string]any {
	out := map[string]any{"role": textOf(row, "role")}
	if id := textOf(row, "id", "uuid"); id != "" {
		out["id"] = id
	}
	if row[resultsField] == true {
		out[resultsField] = true
	}
	if out["role"] == agentRole {
		out["text"] = strings.TrimSpace(textOf(row, "text"))
	}
	return out
}
