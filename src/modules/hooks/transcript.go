// The transcript trim: the raw rows a bridgehead sends, cut to the fields the
// holds fold reads off a prompt and a spoke post.
// [[spec/tickets/a-reply-follows-its-prompt]] [[spec/tickets/level0-hooks-hold-no-rule]]
package hooks

import "strings"

// The agent's texts the answer door reads, and the transcript rows it reads past the prompt's own row. [[spec/tickets/a-reply-follows-its-prompt]]
const (
	transcriptTexts = 4
	transcriptRows  = 64
)

// The post with its raw transcript trimmed into the fields the folds read: a prompt carries the id of the newest row under before, and any other post the newest rows and the agent's last texts. A post carrying no transcript stands as it came. [[spec/tickets/a-reply-follows-its-prompt]] [[spec/tickets/level0-hooks-hold-no-rule]]
func transcribed(post Post) Post {
	if post.Messages == nil {
		return post
	}
	list := post.Messages
	e := make(map[string]any, len(post.E)+2)
	for key, value := range post.E {
		e[key] = value
	}
	if post.Event == promptEvent {
		if len(list) > 0 {
			last, _ := list[len(list)-1].(map[string]any)
			if id := textOf(last, "id", "uuid"); id != "" {
				e["before"] = id
			}
		}
	} else {
		var texts []any
		for at := len(list) - 1; at >= 0 && len(texts) < transcriptTexts; at-- {
			row, _ := list[at].(map[string]any)
			if said := strings.TrimSpace(textOf(row, "text")); textOf(row, "role") == "assistant" && said != "" {
				texts = append([]any{said}, texts...)
			}
		}
		from := max(len(list)-transcriptRows, 0)
		rows := make([]any, 0, len(list)-from)
		for _, one := range list[from:] {
			row, _ := one.(map[string]any)
			rows = append(rows, transcriptRow(row))
		}
		e["texts"], e["rows"] = texts, rows
	}
	post.E, post.Messages = e, nil
	return post
}

// A row as the answer door reads it: its role, its id where it carries one, whether it carries tool results, and its text where the agent wrote it. [[spec/tickets/a-reply-follows-its-prompt]]
func transcriptRow(row map[string]any) map[string]any {
	role := textOf(row, "role")
	out := map[string]any{"role": role}
	if id := textOf(row, "id", "uuid"); id != "" {
		out["id"] = id
	}
	if carriesResults(row["toolResults"]) {
		out["results"] = true
	}
	if role == "assistant" {
		out["text"] = strings.TrimSpace(textOf(row, "text"))
	}
	return out
}

// Whether a row's tool results hold any: a list, or the count a bridgehead cuts a list to. [[spec/tickets/level0-hooks-hold-no-rule]]
func carriesResults(said any) bool {
	switch one := said.(type) {
	case []any:
		return len(one) > 0
	case float64:
		return one > 0
	}
	return false
}
