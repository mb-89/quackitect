// The readers of a post's fields: its session, its harness, its payload and
// the text a field holds.
// [[spec/design_output/model#a-post-and-its-answer]]
package hooks

import (
	"encoding/json"
	"fmt"
)

// The session id where the post or its event names one, in every spelling the harnesses send. [[spec/design_output/pull#the-hand-and-the-hold]]
func sessionOf(post Post) string {
	if post.Session != "" {
		return post.Session
	}
	if nested, ok := post.E["session"].(map[string]any); ok {
		if id := textOf(nested, "id"); id != "" {
			return id
		}
	}
	if id := textOf(post.E, "sessionId", "session_id"); id != "" {
		return id
	}
	return noSession
}

func harnessOf(post Post) string {
	if post.Harness != "" {
		return post.Harness
	}
	return builtInHarness
}

// The event's payload, with the root and the fill the post carries beside it. [[spec/design_output/model#a-post-and-its-answer]]
func fieldsOf(post Post) map[string]any {
	fields := make(map[string]any, len(post.E))
	for key, value := range post.E {
		fields[key] = value
	}
	if post.Root != "" {
		fields["root"] = post.Root
	}
	if post.Fill != nil {
		fields["fill"] = post.Fill
	}
	return fields
}

func textOf(from map[string]any, keys ...string) string {
	for _, key := range keys {
		if text, ok := from[key].(string); ok && text != "" {
			return text
		}
	}
	return ""
}

func textOfValue(value any) string {
	if text, ok := value.(string); ok {
		return text
	}
	body, err := json.Marshal(value)
	if err != nil {
		return fmt.Sprint(value)
	}
	return string(body)
}

// The key a tool's result rides under, which the harness reads. [[spec/tickets/io-answers-take-result-shape]]
const resultKey = "result"

// A string an action answers reaches the harness under a result key, the shape it reads as a tool's result, and any other value goes on as it stands. [[spec/tickets/io-answers-take-result-shape]]
func harnessResult(value any) any {
	if text, ok := value.(string); ok {
		return map[string]any{resultKey: text}
	}
	return value
}
