// Layered names the layer answering a key: the variable over the local file
// over the default file, and the default file alone for a shared key. A key
// names one variable however its leaf is spelled, as src/config names it.
// [[spec/tickets/cfg-topic-holds-one-resolver]] [[spec/design_output/config#a-variable-names-a-key]]
package config

import (
	"testing"

	"quackitect/src/q"
)

func TestLayeredNamesTheLayer(t *testing.T) {
	tracked, _ := q.JSON.Parse([]byte(`{"queue": {"weight": 1}, "migration": {"s": "old"}, "stop": {"mostInARow": 4}}`))
	local, _ := q.JSON.Parse([]byte(`{"queue": {"weight": 2}, "migration": {"s": "new"}}`))
	weight := q.Key{Name: "queue/config/weight", Instance: "queue", Local: "weight"}
	shared := q.Key{Name: "migration/config/s", Instance: "migration", Local: "s", Shared: true}
	// A kebab-case local name reads its camel-case member. [[spec/tickets/the-config-schema-gets-generated]]
	kebab := q.Key{Name: "stop/config/most-in-a-row", Instance: "stop", Local: "most-in-a-row"}
	cases := []struct {
		key          q.Key
		env          map[string]string
		value, layer string
	}{
		{weight, nil, "2", Local},
		{weight, map[string]string{"SE_QUEUE_WEIGHT": "3"}, "3", "SE_QUEUE_WEIGHT"},
		{weight, map[string]string{"SE_QUEUE_WEIGHT": " "}, "2", Local},
		{shared, map[string]string{"SE_MIGRATION_S": "new"}, `"old"`, Tracked},
		{kebab, nil, "4", Tracked},
		{kebab, map[string]string{"SE_STOP_MOST_IN_A_ROW": "5"}, "5", "SE_STOP_MOST_IN_A_ROW"},
	}
	for _, one := range cases {
		value, layer, ok := Layered(one.key, tracked, local, one.env)
		if !ok || value != one.value || layer != one.layer {
			t.Fatalf("%s reads %s in %s, and wants %s in %s", one.key.Name, value, layer, one.value, one.layer)
		}
	}
	if _, _, ok := Layered(q.Key{Name: "queue/config/none", Instance: "queue", Local: "none"}, tracked, local, nil); ok {
		t.Fatal("a key no layer sets reads as set")
	}
}

func TestAKeyNamesOneVariableHoweverItsLeafIsSpelled(t *testing.T) {
	for key, want := range map[string]string{
		"stop.mostInARow":    "SE_STOP_MOST_IN_A_ROW",
		"stop.most-in-a-row": "SE_STOP_MOST_IN_A_ROW",
	} {
		if said := EnvOf(key); said != want {
			t.Errorf("EnvOf(%q) answers %q, and wants %q", key, said, want)
		}
	}
	declared := map[string]q.Key{"stop.mostInARow": KeyOfDotted("stop.mostInARow")}
	rows := Rows(declared, q.Ordered{Object: true}, q.Ordered{Object: true}, map[string]string{"SE_STOP_MOST_IN_A_ROW": "7"})
	if len(rows) != 1 || string(rows[0].Value) != "7" || rows[0].Layer != "SE_STOP_MOST_IN_A_ROW" {
		t.Errorf("SE_STOP_MOST_IN_A_ROW=7 reads %+v, and wants stop.mostInARow at 7 off SE_STOP_MOST_IN_A_ROW", rows)
	}
}
