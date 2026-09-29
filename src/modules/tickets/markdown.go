// The markdown codec: a note as its front and its body, which writes a file
// back byte for byte, the line endings among them.
// [[spec/design_output/model#everything-on-disk-mirrors]]
package tickets

import (
	"strings"

	"quackitect/src/q"
	"quackitect/src/yaml"
)

// A note: Head runs from the opening fence through the closing one, and stands empty where the file opens on no front. [[spec/tickets/tickets-becomes-a-module]]
type Note struct {
	Head string `json:"head"`
	Body string `json:"body"`
}

// [[spec/tickets/tickets-becomes-a-module]]
type MarkdownCodec struct{}

var Markdown q.Codec[Note] = MarkdownCodec{}

// A file whose front stays open to the end reads as body alone, the way split reads it. [[spec/tickets/tickets-becomes-a-module]]
func (MarkdownCodec) Parse(body []byte) (Note, error) {
	text := string(body)
	rows := strings.SplitAfter(text, "\n")
	if strings.TrimSpace(rows[0]) != frontFence {
		return Note{Body: text}, nil
	}
	at := len(rows[0])
	for _, row := range rows[1:] {
		at += len(row)
		if strings.TrimSpace(row) == frontFence {
			return Note{Head: text[:at], Body: text[at:]}, nil
		}
	}
	return Note{Body: text}, nil
}

// [[spec/tickets/tickets-becomes-a-module]]
func (MarkdownCodec) Serialize(note Note) ([]byte, error) {
	return []byte(note.Head + note.Body), nil
}

// The front parsed, and an empty one where the note carries none. [[spec/tickets/tickets-becomes-a-module]]
func (note Note) Front() *yaml.Doc {
	front, _ := split(note.Head)
	return front
}
