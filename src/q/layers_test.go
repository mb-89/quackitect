// A key at rest reads the variable over the local file, the local file over
// the tracked one, and a shared key the tracked file alone.
// [[spec/design_output/model#a-keys-layers]]
package q_test

import (
	"testing"

	"quackitect/src/q"
)

func parsed(t *testing.T, text string) q.Ordered {
	t.Helper()
	out, err := q.JSON.Parse([]byte(text))
	if err != nil {
		t.Fatal(err)
	}
	return out
}

const layersSchema = `{"properties": {
  "answer": {"properties": {"words": {"type": "number", "default": 150}}},
  "migration": {"properties": {"opentasks": {"type": "string", "default": "new", "shared": true}}}
}}`

func TestAnswerWordsReadsTheVariableOverTheLocalFileOverTheTrackedOne(t *testing.T) {
	schema := parsed(t, layersSchema)
	tracked := parsed(t, `{"answer": {"words": 100}}`)
	local := parsed(t, `{"answer": {"words": 120}}`)
	env := map[string]string{"SE_ANSWER_WORDS": "90"}
	cases := []struct {
		name           string
		tracked, local q.Ordered
		env            map[string]string
		value, layer   string
	}{
		{"every layer set", tracked, local, env, "90", "SE_ANSWER_WORDS"},
		{"a blank variable", tracked, local, map[string]string{"SE_ANSWER_WORDS": " "}, "120", q.LocalConfig},
		{"no variable", tracked, local, nil, "120", q.LocalConfig},
		{"the tracked file alone", tracked, q.Ordered{}, nil, "100", q.TrackedConfig},
		{"no layer", q.Ordered{}, q.Ordered{}, nil, "150", q.BuiltInLayer},
	}
	for _, one := range cases {
		value, layer, ok := q.Settled("answer.words", schema, one.tracked, one.local, one.env)
		if !ok || value != one.value || layer != one.layer {
			t.Fatalf("%s: answer.words reads %q off %q, not %q off %q", one.name, value, layer, one.value, one.layer)
		}
	}
}

func TestMigrationOpentasksReadsTheTrackedFileAlone(t *testing.T) {
	schema := parsed(t, layersSchema)
	tracked := parsed(t, `{"migration": {"opentasks": "shadow"}}`)
	local := parsed(t, `{"migration": {"opentasks": "old"}}`)
	env := map[string]string{"SE_MIGRATION_OPENTASKS": "old"}
	if value, layer, ok := q.Settled("migration.opentasks", schema, tracked, local, env); !ok || value != `"shadow"` || layer != q.TrackedConfig {
		t.Fatalf("migration.opentasks reads %s off %q, not the tracked file's value", value, layer)
	}
	if value, layer, ok := q.Settled("migration.opentasks", schema, q.Ordered{}, local, env); !ok || value != `"new"` || layer != q.BuiltInLayer {
		t.Fatalf("migration.opentasks with no tracked value reads %s off %q, not its built-in", value, layer)
	}
}

func TestAVariableReadsAsAStringWhereItHoldsNoJSON(t *testing.T) {
	value, _, _ := q.AtRest(q.KeyOfDotted("log.level"), q.Ordered{}, q.Ordered{}, map[string]string{"SE_LOG_LEVEL": "warn"})
	if value != `"warn"` {
		t.Fatalf("SE_LOG_LEVEL=warn reads %s, not a JSON string", value)
	}
}

func TestADottedKeyRoundTrips(t *testing.T) {
	key := q.KeyOfDotted("watchdog.backoffFirst")
	if key.Name != "watchdog/config/backoff-first" || key.Dotted() != "watchdog.backoffFirst" {
		t.Fatalf("watchdog.backoffFirst names %q and reads back %q", key.Name, key.Dotted())
	}
}

func TestASharedKeyTakesNothingOffTheLocalFile(t *testing.T) {
	key := q.KeyOfDotted("migration.opentasks")
	key.Shared = true
	local := parsed(t, `{"migration": {"opentasks": "old"}}`)
	if value, layer, ok := q.AtRest(key, q.Ordered{}, local, nil); ok {
		t.Fatalf("a shared key no tracked file sets reads %s off %s", value, layer)
	}
}
