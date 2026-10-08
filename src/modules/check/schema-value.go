// The small readers the schema checker weighs a value with: where a chapter or
// a name stands in a list, whether a value matches one allowed or a type, and
// how a finding shows it.
// [[spec/tickets/schema-libs-leave]]
package check

import (
	"fmt"
	"strings"

	"quackitect/src/yaml"
)

// Where the chapter of that header stands among those standing, or -1. [[spec/tickets/schema-libs-leave]]
func headed(standing []standingAt, header string) int {
	for i, one := range standing {
		if one.Header == header {
			return i
		}
	}
	return -1
}

// Where the name stands in the order, or -1. [[spec/tickets/schema-libs-leave]]
func at(order []string, said string) int {
	for i, one := range order {
		if one == said {
			return i
		}
	}
	return -1
}

// Whether any item of a list carries no number. [[spec/tickets/schema-libs-leave]]
func someUnnumbered(items []item) bool {
	for _, one := range items {
		if !numberedAt.MatchString(one.said) {
			return true
		}
	}
	return false
}

// Whether the value matches one the schema allows. [[spec/tickets/schema-libs-leave]]
func holds(allowed []any, said any) bool {
	for _, one := range allowed {
		if same(one, said) {
			return true
		}
	}
	return false
}

// Whether two values match: two lists item by item, two scalars by type and value, and a map reads as false. [[spec/design_output/schema#a-finding-names-the-section]]
func same(a, b any) bool {
	one, ours := a.([]any)
	two, theirs := b.([]any)
	if ours || theirs {
		if !ours || !theirs || len(one) != len(two) {
			return false
		}
		for i := range one {
			if !same(one[i], two[i]) {
				return false
			}
		}
		return true
	}
	if yaml.AsDoc(a) != nil || yaml.AsDoc(b) != nil {
		return false
	}
	return fmt.Sprintf("%T:%v", a, a) == fmt.Sprintf("%T:%v", b, b)
}

// Whether the value carries one of the types the schema names. [[spec/tickets/schema-libs-leave]]
func typed(value any, said any) bool {
	for _, one := range yaml.Flat(said) {
		switch yaml.AsString(one) {
		case "array":
			if _, held := value.([]any); held {
				return true
			}
		case "object":
			if yaml.AsDoc(value) != nil {
				return true
			}
		case "string":
			if _, held := value.(string); held {
				return true
			}
		case "integer", "number":
			if _, held := value.(int); held {
				return true
			}
		case "boolean":
			if _, held := value.(bool); held {
				return true
			}
		default:
			return true
		}
	}
	return false
}

// The shape of a value in words a finding writes. [[spec/tickets/schema-libs-leave]]
func typeOf(value any) string {
	if _, held := value.([]any); held {
		return "a list"
	}
	if yaml.AsDoc(value) != nil {
		return "a map"
	}
	return "one line"
}

// A value as a finding shows it, cut short past the width it takes. [[spec/tickets/schema-libs-leave]]
func show(said any) string {
	flatSaid := yaml.AsString(said)
	if one, held := said.([]any); held {
		flatSaid = joined(one, ", ")
	}
	if len(flatSaid) > shown {
		return flatSaid[:shown-len(ellipsis)] + ellipsis
	}
	return flatSaid
}

// The items of a list as one line, joined by the separator. [[spec/tickets/schema-libs-leave]]
func joined(said []any, with string) string {
	parts := make([]string, 0, len(said))
	for _, one := range said {
		parts = append(parts, yaml.AsString(one))
	}
	return strings.Join(parts, with)
}

// Whether a key waits for the field that fills it, which stands empty yet. [[spec/design_output/schema#a-finding-names-the-section]]
func waitsForFill(said, rule *yaml.Doc) bool {
	if rule == nil {
		return false
	}
	from := yaml.AsString(rule.Get("x-filled-by"))
	return from != "" && said.Has(from) && yaml.Empty(said.Get(from))
}
