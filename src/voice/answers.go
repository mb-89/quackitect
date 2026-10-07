// The answers the measure reads out of a transcript: the rows of a JSON lines
// text, the last text of each turn, and the numbered answer files.
// [[spec/design_output/projection#the-second-target]]
package voice

import (
	"quackitect/src/yaml"

	"encoding/json"
	"fmt"
	"strings"
)

// How many words a text holds: runs of letters and digits, joined by an apostrophe or a hyphen. [[spec/design_output/projection#the-second-target]]
func WordsIn(said string) int {
	return len(word.FindAllStringIndex(said, -1))
}

// Every JSON object line of the texts, past the blank lines and the lines nobody reads. [[spec/design_output/projection#the-second-target]]
func RowsIn(texts ...string) []Row {
	out := []Row{}
	for _, text := range texts {
		for _, line := range lines.Split(text, -1) {
			if jsTrim(line) == "" {
				continue
			}
			var row any
			if json.Unmarshal([]byte(line), &row) != nil {
				continue
			}
			if one, ok := row.(map[string]any); ok {
				out = append(out, one)
			}
		}
	}
	return out
}

// The answers of a transcript: the last text of each turn, where it runs to the shortest or more. An owner row opens the next turn. [[spec/tickets/answers-read-the-last-text]]
func AnswersIn(text string) []string {
	out := []string{}
	last := ""
	closes := func() {
		if last != "" && WordsIn(last) >= Shortest {
			out = append(out, last)
		}
		last = ""
	}
	for _, row := range RowsIn(text) {
		if opensTurn(row) {
			closes()
		}
		if said := answerOf(row); said != "" {
			last = said
		}
	}
	closes()
	return out
}

// An owner row in the transcript: a user row carrying no tool result, and neither a meta row nor a compaction summary. [[spec/tickets/answers-read-the-last-text]]
func opensTurn(row Row) bool {
	if row["type"] != "user" || yaml.Truthy(row["isMeta"]) || yaml.Truthy(row["isCompactSummary"]) {
		return false
	}
	if yaml.Truthy(row["isSidechain"]) || yaml.Truthy(row["agentId"]) {
		return false
	}
	message, _ := row["message"].(map[string]any)
	content, ok := message["content"].([]any)
	if !ok {
		return true
	}
	for _, one := range content {
		if block, _ := one.(map[string]any); block["type"] == "tool_result" {
			return false
		}
	}
	return true
}

// The text blocks of a main-line assistant row, joined by a blank line and trimmed. [[spec/design_output/projection#the-second-target]]
func answerOf(row Row) string {
	if row["type"] != "assistant" || yaml.Truthy(row["isSidechain"]) || yaml.Truthy(row["agentId"]) {
		return ""
	}
	message, _ := row["message"].(map[string]any)
	blocks, ok := message["content"].([]any)
	if !ok {
		return ""
	}
	var texts []string
	for _, one := range blocks {
		block, _ := one.(map[string]any)
		if text, ok := block["text"].(string); ok && block["type"] == "text" {
			texts = append(texts, text)
		}
	}
	return jsTrim(strings.Join(texts, "\n\n"))
}

// The answers as numbered files under the measured folder, each ending on one newline. [[spec/design_output/projection#the-second-target]]
func AnswerFiles(session string, answers []string) []File {
	out := make([]File, 0, len(answers))
	for i, said := range answers {
		out = append(out, File{
			Path: fmt.Sprintf("%s/%s/%0*d-%s", Measured, session, ordinal, i+1, Answer),
			Text: strings.TrimRightFunc(said, jsSpace) + "\n",
		})
	}
	return out
}
