// The cage's replay: a session log recorded at debug drives the door, one
// hook row a post, and each decision the door reads apart from the bridge's
// becomes one shadow row.
// [[spec/tickets/cage-rules-replay-session-logs]]
package hooks

import (
	"bufio"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

// The decision words both sides read as. [[spec/tickets/cage-rules-replay-session-logs]]
const (
	PassWord   = "pass"
	RefuseWord = "refuse"
	BlockWord  = "block"
	HoldWord   = "hold"
)

// The row kinds the replay reads and writes, the slice it names, the level a shadow row takes, and the stamp the JS clock writes. src/doors/log.js owns the hook row, and src/scripts/log-shadow.js the shadow row. [[spec/tickets/cage-rules-replay-session-logs]]
const (
	hookKind    = "hook"
	shadowKind  = "shadow"
	blockKind   = "block"
	rowsKind    = "rows"
	cageSlice   = "cage"
	shadowLevel = "info"
	stampLayout = "2006-01-02T15:04:05.000Z07:00"
)

// One hook row that a box writes at debug, as src/doors/log.js event writes it. [[spec/tickets/cage-rules-replay-session-logs]]
type loggedRow struct {
	At     string `json:"at"`
	Kind   string `json:"kind"`
	Event  string `json:"event"`
	Answer string `json:"answer"`
	Text   string `json:"text"`
}

// One hook row the door and the bridge decide apart. [[spec/tickets/cage-rules-replay-session-logs]]
type Apart struct {
	Line  int    `json:"line"`
	Stamp string `json:"stamp"`
	Event string `json:"event"`
	Tool  string `json:"tool,omitempty"`
	Old   string `json:"old"`
	New   string `json:"new"`
}

// One recorded post, and the line of the log it stands on. [[spec/tickets/cage-rules-replay-session-logs]]
type Recorded struct {
	Line  int
	Stamp string
	Post  Post
}

// Every hook row of a debug session log, as the post the bridge read and its answer under Old. A row of another kind, or no row at all, reads as no post. [[spec/tickets/cage-rules-replay-session-logs]]
func PostsOf(text string) ([]Recorded, error) {
	var out []Recorded
	lines := bufio.NewScanner(strings.NewReader(text))
	lines.Buffer(nil, bodyCap)
	for at := 1; lines.Scan(); at++ {
		var row loggedRow
		if json.Unmarshal(lines.Bytes(), &row) != nil || row.Kind != hookKind {
			continue
		}
		var said struct {
			E map[string]any `json:"e"`
		}
		if err := json.Unmarshal([]byte(row.Text), &said); err != nil {
			return nil, fmt.Errorf("line %d of the log carries no event: %w", at, err)
		}
		var old any
		if err := json.Unmarshal([]byte(row.Answer), &old); err != nil {
			return nil, fmt.Errorf("line %d of the log carries no answer: %w", at, err)
		}
		out = append(out, Recorded{Line: at, Stamp: row.At, Post: Post{Event: row.Event, E: said.E, Old: old}})
	}
	return out, lines.Err()
}

// The bridge's answer as one decision word, the way letsThrough in src/bridge/server.js reads it. [[spec/tickets/cage-rules-replay-session-logs]]
func OldDecisionOf(answer any) string {
	fields, _ := answer.(map[string]any)
	if truthy(fields["needs"]) {
		return HoldWord
	}
	result, _ := fields["result"].(map[string]any)
	if _, ok := result["deny"]; ok {
		return RefuseWord
	}
	if _, ok := result["block"]; ok {
		return BlockWord
	}
	return PassWord
}

// The door's answer to a post as one decision word: a result answering a tool that names no action refuses it, and the rows effect holds, since the answer gate reads the rows it asks back for. [[spec/design_output/model#an-effect-asks-back]]
func NewDecisionOf(post Post, said Answer) string {
	for _, one := range said.Effects {
		if one.Kind == blockKind {
			return BlockWord
		}
		if one.Kind == rowsKind {
			return HoldWord
		}
		if one.Kind == resultKind && !strings.HasPrefix(textOf(post.E, "tool"), toolPrefix) {
			return RefuseWord
		}
	}
	return PassWord
}

// Drives every hook row through the door in log order, and hands each decision read apart to say as a shadow row. [[spec/tickets/cage-rules-replay-session-logs]]
func (d *Door) ReplayLog(text string, say func(row map[string]any) error) ([]Apart, error) {
	posts, err := PostsOf(text)
	if err != nil {
		return nil, err
	}
	var out []Apart
	for _, one := range posts {
		said, err := d.Hook(one.Post)
		if err != nil {
			return nil, fmt.Errorf("line %d of the log: %w", one.Line, err)
		}
		old, now := OldDecisionOf(one.Post.Old), NewDecisionOf(one.Post, said)
		if old == now {
			continue
		}
		apart := Apart{Line: one.Line, Stamp: one.Stamp, Event: one.Post.Event, Tool: textOf(one.Post.E, "tool"), Old: old, New: now}
		if err := say(d.ShadowRowOf(apart)); err != nil {
			return nil, err
		}
		out = append(out, apart)
	}
	return out, nil
}

// The shadow row an Apart writes, on the fields src/scripts/log-shadow.js writes, so ./RUNME.sh log --kind shadow names it. [[spec/tickets/cage-rules-replay-session-logs]]
func (d *Door) ShadowRowOf(one Apart) map[string]any {
	aim := strings.TrimSpace(one.Event + " " + one.Tool)
	row := map[string]any{
		"at":    d.now().UTC().Format(stampLayout),
		"level": shadowLevel,
		"kind":  shadowKind,
		"said":  fmt.Sprintf("%s in shadow: %s on line %d reads %s on the bridge, and %s off the door", cageSlice, aim, one.Line, one.Old, one.New),
		"slice": cageSlice,
		"line":  one.Line,
		"stamp": one.Stamp,
		"event": one.Event,
		"old":   one.Old,
		"new":   one.New,
	}
	if one.Tool != "" {
		row["tool"] = one.Tool
	}
	return row
}

// A say appending each row as one line of the session log at path. [[spec/tickets/cage-rules-replay-session-logs]]
func ShadowTo(path string) func(row map[string]any) error {
	return func(row map[string]any) error {
		line, err := json.Marshal(row)
		if err != nil {
			return err
		}
		if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
			return err
		}
		file, err := os.OpenFile(path, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0o600)
		if err != nil {
			return err
		}
		defer file.Close()
		_, err = file.Write(append(line, '\n'))
		return err
	}
}

func truthy(value any) bool {
	switch one := value.(type) {
	case nil:
		return false
	case bool:
		return one
	case string:
		return one != ""
	}
	return true
}
