// The cage's shadow: a live post carrying the old path's answer, which the
// door decides apart, becomes one shadow row.
// [[spec/tickets/cage-rules-replay-session-logs]]
package hooks

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"quackitect/src/q/tool"
	"quackitect/src/yaml"
)

// The decision words both sides read as. [[spec/tickets/cage-rules-replay-session-logs]]
const (
	PassWord   = "pass"
	RefuseWord = "refuse"
	BlockWord  = "block"
	HoldWord   = "hold"
)

// The row kinds the replay and the lease read write, the slice the replay names, the level a shadow row takes, and the stamp the JS clock writes. src/doors/log.js owns the hook row, and the shadow row stands in [[spec/design_input/the-migration-runs-in-slices#how-a-slice-moves]].
const (
	shadowKind   = "shadow"
	blockKind    = "block"
	rowsKind     = "rows"
	cageSlice    = "cage"
	watchdogKind = "watchdog"
	indexPart    = "index"
	shadowLevel  = "info"
	stampLayout  = "2006-01-02T15:04:05.000Z07:00"
)

// One post the door and the old path decide apart. [[spec/tickets/cage-rules-replay-session-logs]]
type Apart struct {
	Line  int    `json:"line"`
	Stamp string `json:"stamp"`
	Event string `json:"event"`
	Tool  string `json:"tool,omitempty"`
	Old   string `json:"old"`
	New   string `json:"new"`
}

// The bridge's answer to an event as one decision word, the way the bridge's letsThrough read it. A block outside the Stop reaches the harness as the call's result, and so refuses it. [[spec/tickets/cage-tool-block-reads-refuse]]
func OldDecisionOf(event string, answer any) string {
	fields, _ := answer.(map[string]any)
	if yaml.Truthy(fields["needs"]) {
		return HoldWord
	}
	result, _ := fields["result"].(map[string]any)
	if _, ok := result["deny"]; ok {
		return RefuseWord
	}
	if _, ok := result["block"]; ok && event == stopEvent {
		return BlockWord
	}
	if _, ok := result["block"]; ok {
		return RefuseWord
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
		// A result carrying no text answers the tool off the index, and passes. [[spec/tickets/grep-glob-answer-off-index]]
		if one.Kind == resultKind && one.Text != "" && !strings.HasPrefix(textOf(post.E, "tool"), tool.Prefix) {
			return RefuseWord
		}
	}
	return PassWord
}

// A live post carrying the old path's answer, which the door decides apart, hands its shadow row to Shadow. A failing write leaves the answer standing, since the shadow disturbs no hook. [[spec/tickets/copilot-meets-the-hooks-door]]
func (d *Door) shadows(post Post, said Answer) {
	if post.Old == nil || d.from.Shadow == nil {
		return
	}
	old, now := OldDecisionOf(post.Event, post.Old), NewDecisionOf(post, said)
	if old == now {
		return
	}
	row := d.ShadowRowOf(Apart{Event: post.Event, Tool: textOf(post.E, "tool"), Old: old, New: now})
	row["harness"] = harnessOf(post)
	_ = d.from.Shadow(row)
}

// A guarded call reads the index's lease, and one past its term writes a watchdog row, since the port answers while the loop hangs. The call passes on, since this door runs in the index and a busy sweep runs the lease past its term too. [[spec/tickets/watchdogs-span-the-processes]] [[spec/tickets/the-split-deployment-takes-over]]
func (d *Door) readsHealth(post Post) {
	if post.Event != toolEvent || d.from.Health == nil || d.from.Shadow == nil {
		return
	}
	renewed, term, held := d.from.Health()
	now, ends := d.now(), renewed.Add(term)
	if !held || !now.After(ends) {
		return
	}
	d.mu.Lock()
	told := d.downSince.Equal(ends)
	d.downSince = ends
	d.mu.Unlock()
	if told {
		return
	}
	_ = d.from.Shadow(map[string]any{
		"at":    now.UTC().Format(stampLayout),
		"level": warnLevel,
		"kind":  watchdogKind,
		"said":  fmt.Sprintf("the index's lease stands past its term since %s, and the call passes", ends.UTC().Format(stampLayout)),
		"part":  indexPart,
	})
}

// The shadow row an Apart writes, so ./RUNME.sh log --kind shadow names it. [[spec/design_input/the-migration-runs-in-slices#how-a-slice-moves]]
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
	// A live post stands on no line of a log. [[spec/tickets/copilot-meets-the-hooks-door]]
	if one.Line == 0 {
		row["said"] = fmt.Sprintf("%s in shadow: %s reads %s on the old path, and %s off the door", cageSlice, aim, one.Old, one.New)
		delete(row, "line")
		delete(row, "stamp")
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
