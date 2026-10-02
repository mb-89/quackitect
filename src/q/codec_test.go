// The JSON codec writes back every file the way it reads it, byte for byte,
// and a value it writes parses back to the same value.
// [[spec/design_output/model#everything-on-disk-mirrors]]
package q

import (
	"reflect"
	"testing"
)

var jsonFiles = []string{
	"{}\n",
	"[]\n",
	"{\n  \"z\": 1,\n  \"a\": 1.50\n}\n",
	"{\n  \"said\": \"a \\\"quote\\\" <&> and é\",\n  \"none\": null,\n  \"on\": true,\n  \"big\": 1e3\n}\n",
	"{\n  \"todos\": [],\n  \"places\": {},\n  \"rows\": [\n    {\n      \"n\": -2\n    },\n    \"\"\n  ]\n}\n",
}

func TestJSONRoundTripsItsEdgeCases(t *testing.T) {
	for _, text := range jsonFiles {
		value, err := JSON.Parse([]byte(text))
		if err != nil {
			t.Fatalf("%q parses to %v", text, err)
		}
		out, err := JSON.Serialize(value)
		if err != nil || string(out) != text {
			t.Fatalf("%q writes back as %q, %v", text, out, err)
		}
		again, err := JSON.Parse(out)
		if err != nil || !reflect.DeepEqual(again, value) {
			t.Fatalf("%q parses back as %+v, %v", text, again, err)
		}
	}
}

func TestJSONRefusesABrokenFile(t *testing.T) {
	if _, err := JSON.Parse([]byte("{\"a\": ")); err == nil {
		t.Fatal("a broken file parses")
	}
}
