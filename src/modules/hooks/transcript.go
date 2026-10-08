// The transcript a post carries, and what the door picks off it: the raw rows
// a bridgehead sends, cut to the fields the holds fold reads, and the rows a
// forwarder hands, read the same way: the prompt's before, and a spoke post's
// last texts and rows.
// [[spec/tickets/a-reply-follows-its-prompt]] [[spec/tickets/level0-hooks-hold-no-rule]] [[spec/tickets/level0-hooks-forward-to-go]]
package hooks

import "strings"

// The field the forwarder hands the newest rows under, the agent's texts the answer door reads, the transcript rows it reads past the prompt's own row, and the words a row carries. [[spec/tickets/a-reply-follows-its-prompt]]
const (
	rowsField       = "rows"
	transcriptTexts = 4
	transcriptRows  = 64
	agentRole       = "assistant"
	resultsField    = "results"
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
		if id := newestID(list); id != "" {
			e["before"] = id
		}
	} else {
		e["texts"], e[rowsField] = lastTextsOf(list), trimmedRows(list)
	}
	post.E, post.Messages = e, nil
	return post
}

// The post with the fields the door picks off the rows a forwarder hands: a prompt takes the newest row's id as its before, and a spoke post its last texts, its text and its rows. [[spec/tickets/a-reply-follows-its-prompt]] [[spec/tickets/level0-hooks-forward-to-go]]
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
		if id := newestID(listed); id != "" {
			e["before"] = id
		}
		return post
	}
	texts := lastTextsOf(listed)
	e["texts"], e[rowsField] = texts, trimmedRows(listed)
	if strings.TrimSpace(textOf(e, "text")) == "" && len(texts) > 0 {
		e["text"] = texts[len(texts)-1]
	}
	return post
}

// The id of the newest row, or none where no row stands. [[spec/tickets/a-reply-follows-its-prompt]]
func newestID(list []any) string {
	if len(list) == 0 {
		return ""
	}
	newest, _ := list[len(list)-1].(map[string]any)
	return textOf(newest, "id", "uuid")
}

// The agent's last texts, oldest first. [[spec/tickets/a-reply-follows-its-prompt]]
func lastTextsOf(list []any) []any {
	texts := []any{}
	for at := len(list) - 1; at >= 0 && len(texts) < transcriptTexts; at-- {
		row, _ := list[at].(map[string]any)
		if said := strings.TrimSpace(textOf(row, "text")); textOf(row, "role") == agentRole && said != "" {
			texts = append([]any{said}, texts...)
		}
	}
	return texts
}

// The newest rows, each as the answer door reads it. [[spec/tickets/a-reply-follows-its-prompt]]
func trimmedRows(list []any) []any {
	from := max(len(list)-transcriptRows, 0)
	rows := make([]any, 0, len(list)-from)
	for _, one := range list[from:] {
		row, _ := one.(map[string]any)
		rows = append(rows, transcriptRow(row))
	}
	return rows
}

// A row as the answer door reads it: its role, its id where it carries one, whether it carries tool results, and its text where the agent wrote it. [[spec/tickets/a-reply-follows-its-prompt]]
func transcriptRow(row map[string]any) map[string]any {
	role := textOf(row, "role")
	out := map[string]any{"role": role}
	if id := textOf(row, "id", "uuid"); id != "" {
		out["id"] = id
	}
	if row[resultsField] == true || carriesResults(row["toolResults"]) {
		out[resultsField] = true
	}
	if role == agentRole {
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
