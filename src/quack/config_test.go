// quack config resolves every key off the config module, each key with the
// layer it comes from.
// [[spec/tickets/cfg-topic-holds-one-resolver]]
package main // level0: InPackageTest - a main package admits no outside test package

import (
	"encoding/json"
	"reflect"
	"testing"

	oldconfig "quackitect/src/config"
	"quackitect/src/q"
)

func TestConfigRowsReadEveryLayer(t *testing.T) {
	t.Parallel()
	tracked := []byte(`{"comment": "c", "a": {"comment": "c", "x": 1, "y": {"z": true}}, "m": {"s": "old"}}`)
	local := []byte(`{"a": {"x": 2}, "m": {"s": "new"}}`)
	env := map[string]string{"SE_A_X": "3"}
	declared := sharedOf("m.s")
	declared["d.most-in-a-row"] = q.Key{Name: "d/config/most-in-a-row", Instance: "d", Local: "most-in-a-row", Default: `5`}
	rows, err := configRows(tracked, local, env, declared)
	if err != nil {
		t.Fatal(err)
	}
	want := map[string]configRow{
		"a.x":             {Value: json.RawMessage(`3`), Layer: "SE_A_X"},
		"a.y.z":           {Value: json.RawMessage(`true`), Layer: oldconfig.Tracked},
		"m.s":             {Value: json.RawMessage(`"old"`), Layer: oldconfig.Tracked},
		"d.most-in-a-row": {Value: json.RawMessage(`5`), Layer: oldconfig.BuiltIn},
	}
	if !reflect.DeepEqual(rows, want) {
		t.Fatalf("the rows read %v, and want %v", rows, want)
	}
}

func TestConfigRowsReadALocalFileHoldingNoJSONAsEmpty(t *testing.T) {
	t.Parallel()
	tracked := []byte(`{"stop": {"enabled": true}, "log": {"level": "info"}}`)
	rows, err := configRows(tracked, []byte("{ this is no json"), map[string]string{"SE_LOG_LEVEL": "warn"}, map[string]q.Key{})
	if err != nil {
		t.Fatalf("the rows answer %v, and want the local file read as empty", err)
	}
	want := map[string]configRow{
		"stop.enabled": {Value: json.RawMessage(`true`), Layer: oldconfig.Tracked},
		"log.level":    {Value: json.RawMessage(`"warn"`), Layer: "SE_LOG_LEVEL"},
	}
	if !reflect.DeepEqual(rows, want) {
		t.Fatalf("the rows read %v, and want %v", rows, want)
	}
}

func TestConfigTextHoldsOneKeyALine(t *testing.T) {
	t.Parallel()
	text, err := configText(map[string]configRow{
		"b.y": {Value: json.RawMessage(`"t"`), Layer: "L"},
		"a.x": {Value: json.RawMessage(`1`), Layer: "T"},
	})
	if err != nil {
		t.Fatal(err)
	}
	want := "{\n  \"a.x\": {\"value\":1,\"layer\":\"T\"},\n  \"b.y\": {\"value\":\"t\",\"layer\":\"L\"}\n}\n"
	if string(text) != want {
		t.Fatalf("the text reads %q, and wants %q", text, want)
	}
	var back map[string]configRow
	if err := json.Unmarshal(text, &back); err != nil || len(back) != 2 {
		t.Fatalf("the text reads back as %v, %v", back, err)
	}
}

// Shared keys by their dotted names, with no built-in, as a case declares them. [[spec/tickets/the-config-schema-gets-generated]]
func sharedOf(dotted ...string) map[string]q.Key {
	out := map[string]q.Key{}
	for _, one := range dotted {
		key := keyOfDotted(one)
		key.Shared = true
		out[one] = key
	}
	return out
}
