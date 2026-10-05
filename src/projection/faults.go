// The faults a paragraph source carries against the JSON shape beside it: a
// kind the shape refuses, a field it requires, a value outside its enum.
// The check verb reads these, and the project verb writes past them.
// [[spec/design_output/projection#a-missing-layer-fails]] [[spec/tickets/config-verbs-port-to-go]]
package projection

import (
	"math"
	"strconv"
	"strings"
)

// Every fault a source carries against its shape. [[spec/design_output/projection#a-missing-layer-fails]]
func faultsOf(said, shape any) []string {
	one := asObject(shape)
	if one == nil {
		return []string{}
	}
	if absent(said) {
		said = newObject()
	}
	return faultsUnder(said, one, "")
}

// The faults under one value, at the path it stands at. [[spec/design_output/projection#a-missing-layer-fails]]
func faultsUnder(said any, shape *Object, at string) []string {
	out := []string{}
	kind := kindOf(said)
	typed := shape.Get("type")
	if truthy(typed) && kind != typed {
		where := at
		if where == "" {
			where = "the schema"
		}
		return append(out, where+" carries a "+kind+", and the shape says "+jsString(typed))
	}
	if typed == "object" {
		for _, name := range listOf(shape.Get("required")) {
			if dig(said, jsString(name)) == nil {
				out = append(out, underPath(at, jsString(name))+" is missing")
			}
		}
		properties := objectAt(shape, "properties")
		for _, name := range properties.Keys() {
			value := dig(said, name)
			if value == nil {
				continue
			}
			if inner := asObject(properties.Get(name)); inner != nil {
				out = append(out, faultsUnder(value, inner, underPath(at, name))...)
			}
		}
	}
	if items := asObject(shape.Get("items")); typed == "array" && items != nil {
		for i, one := range listOf(said) {
			out = append(out, faultsUnder(one, items, at+"["+strconv.Itoa(i)+"]")...)
		}
	}
	if enum, listed := shape.Get("enum").([]any); listed && !includes(enum, said) {
		admits := make([]string, len(enum))
		for i, one := range enum {
			admits[i] = joinString(one)
		}
		out = append(out, at+" reads "+compact(said)+", and the shape admits "+strings.Join(admits, ", "))
	}
	return out
}

// A value's kind, as paragraph.js kindOf names it. [[spec/design_output/projection#a-missing-layer-fails]]
func kindOf(said any) string {
	switch said.(type) {
	case []any:
		return "array"
	case Null:
		return "null"
	}
	return typeOf(said)
}

// A path one name deeper. [[spec/design_output/projection#a-missing-layer-fails]]
func underPath(at, name string) string {
	if at == "" {
		return name
	}
	return at + "." + name
}

// Whether a list holds a value, as includes compares: a primitive by value, an object by itself. [[spec/design_output/projection#a-missing-layer-fails]]
func includes(list []any, said any) bool {
	for _, one := range list {
		switch a := one.(type) {
		case float64:
			if b, held := said.(float64); held && (a == b || (math.IsNaN(a) && math.IsNaN(b))) {
				return true
			}
		case string, bool, Null, nil:
			if one == said {
				return true
			}
		}
	}
	return false
}

// A value as JSON.stringify writes it with no indent, and undefined where it writes nothing. [[spec/design_output/projection#a-missing-layer-fails]]
func compact(said any) string {
	if said == nil {
		return "undefined"
	}
	var out strings.Builder
	writeJSON(&out, said, "", "")
	return out.String()
}
