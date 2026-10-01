// The prompt at the door: the row writer appends each row the holds fold names
// at the event's own place to the session log, in the shape Row in
// src/modules/log reads, and an owner's prompt answers its rewritten event.
// [[spec/tickets/prompt-answers-off-the-door]]
package hooks

import (
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"time"
)

// .claude/skills/level0/lib/folders.js owns the session log's folder, and the package spells it again. [[spec/tickets/prompt-answers-off-the-door]]
const sessionLog = ".se/.log/session.jsonl"

// The level and kinds a prompt's row carries, the stamp toISOString writes, and the flags an append opens the log with. [[spec/tickets/prompt-answers-off-the-door]]
const (
	infoLevel   = "info"
	promptRow   = "prompt"
	agentRow    = "agent"
	stampFormat = "2006-01-02T15:04:05.000Z"
	appendFlags = os.O_APPEND | os.O_CREATE | os.O_WRONLY
)

// One row of the session log, field for field as rowOf in .claude/skills/level0/lib/log.js writes it. [[spec/tickets/prompt-answers-off-the-door]]
type LogRow struct {
	At     string `json:"at"`
	Level  string `json:"level"`
	Kind   string `json:"kind"`
	Said   string `json:"said"`
	Detail string `json:"detail,omitempty"`
	Text   string `json:"text,omitempty"`
}

// [[spec/tickets/prompt-answers-off-the-door]]
func rowOf(at time.Time, kind, text, detail string) LogRow {
	return LogRow{At: at.UTC().Format(stampFormat), Level: infoLevel, Kind: kind, Said: head(strings.TrimSpace(text)), Detail: detail, Text: text}
}

// Appends the rows the holds fold names at the event's own place. A post standing in no tree writes nothing, and a failing write leaves the answer standing, as the marks do. [[spec/tickets/prompt-answers-off-the-door]]
func (d *Door) rows(session, root string) {
	if root == "" {
		return
	}
	state, ok := d.from.Store.Snapshot().Read(d.holdsOf(session)).(Holds)
	d.mu.Lock()
	seq := d.seqs[session]
	d.mu.Unlock()
	if !ok || state.Said.Seq != seq || len(state.Said.Rows) == 0 {
		return
	}
	_ = appendRows(disk{root}.at(sessionLog), state.Said.Rows)
}

// [[spec/tickets/prompt-answers-off-the-door]]
func appendRows(at string, rows []LogRow) error {
	var body []byte
	for _, row := range rows {
		line, err := json.Marshal(row)
		if err != nil {
			return err
		}
		body = append(append(body, line...), '\n')
	}
	if err := os.MkdirAll(filepath.Dir(at), folderMode); err != nil {
		return err
	}
	file, err := os.OpenFile(at, appendFlags, fileMode)
	if err != nil {
		return err
	}
	defer file.Close()
	_, err = file.Write(body)
	return err
}

// The owner's prompt the holds fold rewrites, answered as the event it arrived on, carrying the rewritten text and no before. [[spec/tickets/prompt-answers-off-the-door]]
func (d *Door) rewrites(session string, post Post) (Effect, bool) {
	if post.Event != promptEvent {
		return Effect{}, false
	}
	state, ok := d.from.Store.Snapshot().Read(d.holdsOf(session)).(Holds)
	d.mu.Lock()
	seq := d.seqs[session]
	d.mu.Unlock()
	if !ok || state.Said.Seq != seq || state.Said.Prompt == "" {
		return Effect{}, false
	}
	event := make(map[string]any, len(post.E))
	for key, value := range post.E {
		event[key] = value
	}
	delete(event, "before")
	event["text"] = state.Said.Prompt
	return Effect{Kind: eventKind, Result: event}, true
}
