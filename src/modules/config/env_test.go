// Layered names the layer answering a key: the variable over the local file
// over the default file, and the default file alone for a shared key.
// [[spec/tickets/cfg-topic-holds-one-resolver]]
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
		{kebab, map[string]string{"SE_STOP_MOSTINAROW": "5"}, "5", "SE_STOP_MOSTINAROW"},
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
