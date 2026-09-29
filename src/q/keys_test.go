// A key carries what the schema says of it: its doc, its unit, its options,
// its JSON type and its built-in value as a literal.
// [[spec/tickets/the-config-schema-gets-generated]]
package q

import (
	"reflect"
	"testing"
)

func TestKeysCarryDocUnitEnumAndDefault(t *testing.T) {
	c := New()
	CfgIn(c, "hold", "off", Doc("what the session does"), Unit("calls"), Enum("off", "finish"))
	CfgIn(c, "most", 3, Doc("how many in a row"))
	CfgIn(c, "on", true, Doc("whether it runs"))
	CfgIn(c, "names", []string{"a"}, Doc("the names it takes"))

	want := []Key{
		{Name: "config/hold", Local: "hold", Doc: "what the session does", Unit: "calls", Enum: []string{"off", "finish"}, Type: "string", Default: `"off"`},
		{Name: "config/most", Local: "most", Doc: "how many in a row", Type: "number", Default: `3`},
		{Name: "config/on", Local: "on", Doc: "whether it runs", Type: "boolean", Default: `true`},
		{Name: "config/names", Local: "names", Doc: "the names it takes", Type: "array", Default: `["a"]`},
	}
	if got := c.Keys(); !reflect.DeepEqual(got, want) {
		t.Fatalf("the keys read %+v, and want %+v", got, want)
	}
}
