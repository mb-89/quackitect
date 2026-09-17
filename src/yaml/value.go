// Reading a loose value the way the JavaScript reads one. A schema field takes
// one line or a list, so every caller asks these and reads the shape back.
// [[spec/design_output/schema#the-yaml-a-schema-reads]]
package yaml

import (
	"fmt"
	"strings"
)

func AsDoc(said any) *Doc {
	if one, held := said.(*Doc); held {
		return one
	}
	return nil
}

func AsList(said any) []any {
	if said == nil {
		return nil
	}
	if one, held := said.([]any); held {
		return one
	}
	return []any{said}
}

// [[spec/design_output/schema#the-yaml-a-schema-reads]]
func Flat(said any) []any {
	if said == nil {
		return []any{nil}
	}
	if one, held := said.([]any); held {
		return one
	}
	return []any{said}
}

func AsString(said any) string {
	switch one := said.(type) {
	case nil:
		return ""
	case string:
		return one
	case bool:
		if one {
			return "true"
		}
		return "false"
	case int:
		return fmt.Sprint(one)
	case []any:
		parts := make([]string, 0, len(one))
		for _, each := range one {
			parts = append(parts, AsString(each))
		}
		return strings.Join(parts, ",")
	case *Doc:
		return "[object Object]"
	}
	return fmt.Sprint(said)
}

func AsInt(said any) int {
	if one, held := said.(int); held {
		return one
	}
	return 0
}

func AsBool(said any) bool {
	one, held := said.(bool)
	return held && one
}

// [[spec/design_output/schema#the-yaml-a-schema-reads]]
func StringsOf(said any) []string {
	out := []string{}
	for _, one := range Flat(said) {
		if one == nil {
			continue
		}
		out = append(out, AsString(one))
	}
	return out
}

func Empty(said any) bool {
	if said == nil {
		return true
	}
	if one, held := said.([]any); held {
		return len(one) == 0
	}
	return strings.TrimSpace(AsString(said)) == ""
}
