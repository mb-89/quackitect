// JSON read into the values node holds, and written again the way
// JSON.stringify writes it. A source reads through here, so an object keeps
// its key order and a number reads as a double.
// [[spec/tickets/config-verbs-port-to-go]]
package projection

import (
	"encoding/json"
	"errors"
	"io"
	"math"
	"strconv"
	"strings"
)

// The indent JSON.stringify(said, null, 2) writes. [[spec/tickets/config-verbs-port-to-go]]
const indentWidth = 2

// A text read as JSON.parse reads it, and an empty object where it stands empty or broken, as projection.js parsed does. [[spec/tickets/config-verbs-port-to-go]]
func parsed(text string) any {
	if jsTrim(text) == "" {
		return newObject()
	}
	said, err := parseJSON(text)
	if err != nil {
		return newObject()
	}
	return said
}

// A text read as JSON.parse reads it, or the error it throws. [[spec/tickets/config-verbs-port-to-go]]
func parseJSON(text string) (any, error) {
	reads := json.NewDecoder(strings.NewReader(text))
	reads.UseNumber()
	said, err := valueOf(reads)
	if err != nil {
		return nil, err
	}
	if _, err := reads.Token(); !errors.Is(err, io.EOF) {
		return nil, errors.New("JSON carries text past its value")
	}
	return said, nil
}

// One value off the decoder. [[spec/tickets/config-verbs-port-to-go]]
func valueOf(reads *json.Decoder) (any, error) {
	token, err := reads.Token()
	if err != nil {
		return nil, err
	}
	switch one := token.(type) {
	case json.Delim:
		if one == '{' {
			return objectOf(reads)
		}
		return arrayOf(reads)
	case json.Number:
		n, _ := strconv.ParseFloat(one.String(), 64)
		return n, nil
	case nil:
		return Null{}, nil
	}
	return token, nil
}

// The members of an object, up to its closing brace. [[spec/tickets/config-verbs-port-to-go]]
func objectOf(reads *json.Decoder) (any, error) {
	out := newObject()
	for reads.More() {
		key, err := reads.Token()
		if err != nil {
			return nil, err
		}
		said, err := valueOf(reads)
		if err != nil {
			return nil, err
		}
		out.Set(key.(string), said)
	}
	_, err := reads.Token()
	return out, err
}

// The items of an array, up to its closing bracket. [[spec/tickets/config-verbs-port-to-go]]
func arrayOf(reads *json.Decoder) (any, error) {
	out := []any{}
	for reads.More() {
		said, err := valueOf(reads)
		if err != nil {
			return nil, err
		}
		out = append(out, said)
	}
	_, err := reads.Token()
	return out, err
}

// A value as JSON.stringify(said, null, 2) writes it. [[spec/tickets/config-verbs-port-to-go]]
func stringify(said any) string {
	var out strings.Builder
	writeJSON(&out, said, "", strings.Repeat(" ", indentWidth))
	return out.String()
}

// One value at an indent, as JSON.stringify writes it: one line where the step stands empty. [[spec/tickets/config-verbs-port-to-go]]
func writeJSON(out *strings.Builder, said any, at, step string) {
	inner := at + step
	breakAt := func(indent string) string {
		if step == "" {
			return ""
		}
		return "\n" + indent
	}
	colon := ": "
	if step == "" {
		colon = ":"
	}
	switch one := said.(type) {
	case nil, Null:
		out.WriteString("null")
	case bool:
		out.WriteString(strconv.FormatBool(one))
	case float64:
		if math.IsNaN(one) || math.IsInf(one, 0) {
			out.WriteString("null")
			return
		}
		out.WriteString(numberString(one))
	case string:
		out.WriteString(quoted(one))
	case []any:
		if len(one) == 0 {
			out.WriteString("[]")
			return
		}
		out.WriteString("[")
		for i, each := range one {
			if i > 0 {
				out.WriteString(",")
			}
			out.WriteString(breakAt(inner))
			writeJSON(out, each, inner, step)
		}
		out.WriteString(breakAt(at) + "]")
	case *Object:
		keys := one.Keys()
		if len(keys) == 0 {
			out.WriteString("{}")
			return
		}
		out.WriteString("{")
		for i, key := range keys {
			if i > 0 {
				out.WriteString(",")
			}
			out.WriteString(breakAt(inner) + quoted(key) + colon)
			writeJSON(out, one.Get(key), inner, step)
		}
		out.WriteString(breakAt(at) + "}")
	}
}
