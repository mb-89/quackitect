// JSON read and written with its keys in the order they stand, as
// JSON.stringify writes an object it parsed, so a stamp moves no key.
// [[spec/design_output/vehicle#the-brand-a-vehicle-stamps]]
package main

import (
	"encoding/json"
	"errors"
	"io"
	"strings"
)

// An object whose keys keep their order. [[spec/design_output/vehicle#the-brand-a-vehicle-stamps]]
type ordered struct {
	keys   []string
	values map[string]any
}

// Sets a key, where it stands already, or last. [[spec/design_output/vehicle#the-brand-a-vehicle-stamps]]
func (o *ordered) set(key string, value any) {
	if _, ok := o.values[key]; !ok {
		o.keys = append(o.keys, key)
	}
	o.values[key] = value
}

// The text as ordered JSON, or an error where it reads as none. [[spec/design_output/vehicle#the-brand-a-vehicle-stamps]]
func orderedOf(text string) (any, error) {
	reads := json.NewDecoder(strings.NewReader(text))
	reads.UseNumber()
	value, err := orderedValue(reads)
	if err != nil {
		return nil, err
	}
	if _, err := reads.Token(); !errors.Is(err, io.EOF) {
		return nil, errors.New("text past the value")
	}
	return value, nil
}

func orderedValue(reads *json.Decoder) (any, error) {
	token, err := reads.Token()
	if err != nil {
		return nil, err
	}
	switch token {
	case json.Delim('{'):
		out := &ordered{values: map[string]any{}}
		for reads.More() {
			key, err := reads.Token()
			if err != nil {
				return nil, err
			}
			value, err := orderedValue(reads)
			if err != nil {
				return nil, err
			}
			out.set(key.(string), value)
		}
		_, err = reads.Token()
		return out, err
	case json.Delim('['):
		out := []any{}
		for reads.More() {
			value, err := orderedValue(reads)
			if err != nil {
				return nil, err
			}
			out = append(out, value)
		}
		_, err = reads.Token()
		return out, err
	}
	return token, nil
}

// The value as JSON.stringify writes it under an indent of two spaces. [[spec/design_output/vehicle#the-brand-a-vehicle-stamps]]
func orderedText(value any) string {
	var said strings.Builder
	writeOrdered(&said, value, "")
	return said.String()
}

func writeOrdered(said *strings.Builder, value any, indent string) {
	inner := indent + "  "
	switch one := value.(type) {
	case *ordered:
		if len(one.keys) == 0 {
			said.WriteString("{}")
			return
		}
		said.WriteString("{")
		for at, key := range one.keys {
			if at > 0 {
				said.WriteString(",")
			}
			said.WriteString("\n" + inner + jsonString(key) + ": ")
			writeOrdered(said, one.values[key], inner)
		}
		said.WriteString("\n" + indent + "}")
	case []any:
		if len(one) == 0 {
			said.WriteString("[]")
			return
		}
		said.WriteString("[")
		for at, item := range one {
			if at > 0 {
				said.WriteString(",")
			}
			said.WriteString("\n" + inner)
			writeOrdered(said, item, inner)
		}
		said.WriteString("\n" + indent + "]")
	case string:
		said.WriteString(jsonString(one))
	case json.Number:
		said.WriteString(one.String())
	case bool:
		if one {
			said.WriteString("true")
		} else {
			said.WriteString("false")
		}
	default:
		said.WriteString("null")
	}
}
