// config/keys names each key's value and layer, and the config actions set a
// key, hold an override for a window, and drop the overrides other windows set.
// [[spec/tickets/config-answers-keys-and-overrides]]
package config

import (
	"encoding/json"
	"fmt"
	"strings"
	"testing"

	"quackitect/src/q"
	"quackitect/src/q/qtest"
)

// The schema the generator writes, over the four keys the case declares. [[spec/tickets/config-answers-keys-and-overrides]]
const schemaFile = "spec/config/level0.schema.json"

const fourKeys = `{"type": "object", "properties": {"queue": {"type": "object", "properties": {
  "weight": {"type": "integer", "default": 1},
  "depth": {"type": "integer", "default": 2},
  "fail": {"type": "integer", "default": 3},
  "day": {"type": "integer", "default": 4}
}}}}`

func fourDeclared(c *q.Catalog) {
	q.CfgIn(c, "weight", 1, q.Doc("how much a ticket weighs"))
	q.CfgIn(c, "depth", 2, q.Doc("how deep a group nests"))
	q.CfgIn(c, "fail", 3, q.Doc("how many fails a step takes"))
	q.CfgIn(c, "day", 4, q.Doc("the day a week starts on"))
}

// Each row of config/keys, by its dotted key. [[spec/tickets/config-answers-keys-and-overrides]]
func keyRows(t *testing.T, ix *qtest.Index) map[string]map[string]any {
	t.Helper()
	ix.Seed(map[string]any{"files/" + schemaFile: q.Content{Hash: "s", Text: fourKeys}})
	settles(t, ix, "config/"+schemaFile, "config/keys")
	body, err := json.Marshal(ix.Read("config/keys"))
	if err != nil {
		t.Fatal(err)
	}
	var rows []map[string]any
	if err := json.Unmarshal(body, &rows); err != nil {
		t.Fatalf("config/keys reads %s, and no list of rows", body)
	}
	out := map[string]map[string]any{}
	for _, row := range rows {
		out[fmt.Sprint(row["key"])] = row
	}
	return out
}

func TestConfigKeysNameEachLayer(t *testing.T) {
	ix := layered(t, "queue", fourDeclared)
	ix.Seed(files(`{"queue": {"weight": 5}}`, `{"queue": {"depth": 6}}`))
	lands(t, ix, Change{Kind: Overrides, Holder: "w1", Values: map[string]string{"queue/config/fail": "7"}})
	rows := keyRows(t, ix)
	for key, want := range map[string][2]string{
		"queue.weight": {"5", Tracked},
		"queue.depth":  {"6", Local},
		"queue.fail":   {"7", OverrideLayer},
	} {
		row := rows[key]
		if fmt.Sprint(row["value"]) != want[0] || row["layer"] != want[1] {
			t.Fatalf("%s reads %v, and wants %s off %s", key, row, want[0], want[1])
		}
	}
}

func TestConfigKeysCarryTheBuiltInWhereNoLayerSets(t *testing.T) {
	ix := layered(t, "queue", fourDeclared)
	ix.Seed(files(`{}`, `{}`))
	row := keyRows(t, ix)["queue.day"]
	if fmt.Sprint(row["value"]) != "4" || row["layer"] != "" {
		t.Fatalf("queue.day reads %v, and wants its built-in 4 off no layer", row)
	}
}

// The requests an action answers for the JSON body a surface posts. [[spec/tickets/config-answers-keys-and-overrides]]
func posted(t *testing.T, ix *qtest.Index, name, body string) []q.Request {
	t.Helper()
	input, err := ix.Store().Input(name, []byte(body))
	if err != nil {
		t.Fatalf("%s takes no post: %v", name, err)
	}
	return ix.Act(name, input)
}

func TestConfigSetRunsTheConfigVerb(t *testing.T) {
	ix := layered(t, "queue", fourDeclared)
	ran := posted(t, ix, "config/set", `{"key": "queue.weight", "value": "8"}`)
	if len(ran) != 1 || ran[0].Module != "node" || fmt.Sprint(ran[0].Args) != "[config queue.weight 8]" {
		t.Fatalf("config/set answers %+v, and wants one node run of config queue.weight 8", ran)
	}
}

// Lands every store request the action answers, as the root's router does. [[spec/tickets/config-answers-keys-and-overrides]]
func landsAll(t *testing.T, ix *qtest.Index, ran []q.Request) {
	t.Helper()
	for _, one := range ran {
		body, _ := json.Marshal(one.Args)
		if one.Module != "store" || one.Verb != "land" || !strings.Contains(string(body), HeldName) {
			t.Fatalf("the action answers %s.%s %s, and wants a store land on %s", one.Module, one.Verb, body, HeldName)
		}
		var said struct {
			Event Change `json:"event"`
		}
		if err := json.Unmarshal(body, &said); err != nil {
			t.Fatal(err)
		}
		lands(t, ix, said.Event)
	}
}

func TestOpenedDropsTheOverridesOfOtherWindows(t *testing.T) {
	ix := layered(t, "queue", fourDeclared)
	ix.Seed(files(`{}`, `{}`))
	landsAll(t, ix, posted(t, ix, "config/override", `{"key": "queue/config/weight", "value": "9", "window": "w1"}`))
	landsAll(t, ix, posted(t, ix, "config/override", `{"key": "queue/config/depth", "value": "9", "window": "w2"}`))
	if held, _ := ix.Read(HeldName).(Held); len(held.Overrides) != 2 {
		t.Fatalf("%s holds %+v after two windows override", HeldName, held)
	}
	landsAll(t, ix, posted(t, ix, "config/opened", `{"window": "w3"}`))
	if held, _ := ix.Read(HeldName).(Held); len(held.Overrides) != 0 {
		t.Fatalf("%s holds %+v after a third window opens", HeldName, held)
	}
}
