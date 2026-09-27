// The JSON codec: an order-keeping value, parsed off the bytes and written
// back in the layout the JavaScript writes.
// [[spec/design_output/model#everything-on-disk-mirrors]]
package q

import (
	"encoding/json"
	"errors"
	"fmt"
	"strings"
)

// The indent JSON.stringify(value, null, 2) writes, which every JSON file of the tree carries. [[spec/design_output/model#everything-on-disk-mirrors]]
const jsonIndent = "  "

// A JSON value that keeps its key order and each literal as the file writes it. [[spec/design_output/model#everything-on-disk-mirrors]]
type Ordered struct {
	Keys    []string
	Fields  []Ordered
	Items   []Ordered
	Literal string
	Object  bool
	Array   bool
}

// [[spec/design_output/model#everything-on-disk-mirrors]]
type JSONCodec struct{}

var JSON Codec[Ordered] = JSONCodec{}

// A scalar keeps its literal, so a number or an escape writes back as it reads. [[spec/design_output/model#everything-on-disk-mirrors]]
func (JSONCodec) Parse(body []byte) (Ordered, error) {
	if !json.Valid(body) {
		return Ordered{}, errors.New("the file holds no valid JSON")
	}
	read := &jsonReader{body: body}
	return read.value(), nil
}

// [[spec/design_output/model#everything-on-disk-mirrors]]
func (JSONCodec) Serialize(value Ordered) ([]byte, error) {
	var out strings.Builder
	if err := writeJSON(&out, value, ""); err != nil {
		return nil, err
	}
	out.WriteString("\n")
	return []byte(out.String()), nil
}

// Reads a body json.Valid passes, so it meets no fault of form. [[spec/design_output/model#everything-on-disk-mirrors]]
type jsonReader struct {
	body []byte
	at   int
}

func (r *jsonReader) space() {
	for r.at < len(r.body) && strings.IndexByte(" \t\r\n", r.body[r.at]) >= 0 {
		r.at++
	}
}

func (r *jsonReader) value() Ordered {
	r.space()
	switch r.body[r.at] {
	case '{':
		r.at++
		out := Ordered{Object: true}
		for r.space(); r.body[r.at] != '}'; r.space() {
			var key string
			_ = json.Unmarshal([]byte(r.literal()), &key)
			r.space()
			r.at++
			out.Keys, out.Fields = append(out.Keys, key), append(out.Fields, r.value())
			r.comma()
		}
		r.at++
		return out
	case '[':
		r.at++
		out := Ordered{Array: true}
		for r.space(); r.body[r.at] != ']'; r.space() {
			out.Items = append(out.Items, r.value())
			r.comma()
		}
		r.at++
		return out
	}
	return Ordered{Literal: r.literal()}
}

func (r *jsonReader) comma() {
	r.space()
	if r.body[r.at] == ',' {
		r.at++
	}
}

// A string runs to its closing quote past every escape, and any other literal to the next delimiter. [[spec/design_output/model#everything-on-disk-mirrors]]
func (r *jsonReader) literal() string {
	from := r.at
	if r.body[r.at] == '"' {
		for r.at++; r.body[r.at] != '"'; r.at++ {
			if r.body[r.at] == '\\' {
				r.at++
			}
		}
		r.at++
		return string(r.body[from:r.at])
	}
	for r.at < len(r.body) && strings.IndexByte(",]} \t\r\n", r.body[r.at]) < 0 {
		r.at++
	}
	return string(r.body[from:r.at])
}

// An empty object or array stands on one line, and every other opens a line a member. [[spec/design_output/model#everything-on-disk-mirrors]]
func writeJSON(out *strings.Builder, value Ordered, indent string) error {
	inner := indent + jsonIndent
	switch {
	case value.Object:
		if len(value.Keys) != len(value.Fields) {
			return fmt.Errorf("an object holds %d keys and %d fields", len(value.Keys), len(value.Fields))
		}
		if len(value.Keys) == 0 {
			out.WriteString("{}")
			return nil
		}
		out.WriteString("{")
		for i, key := range value.Keys {
			if i > 0 {
				out.WriteString(",")
			}
			out.WriteString("\n" + inner + quoted(key) + ": ")
			if err := writeJSON(out, value.Fields[i], inner); err != nil {
				return err
			}
		}
		out.WriteString("\n" + indent + "}")
	case value.Array:
		if len(value.Items) == 0 {
			out.WriteString("[]")
			return nil
		}
		out.WriteString("[")
		for i, item := range value.Items {
			if i > 0 {
				out.WriteString(",")
			}
			out.WriteString("\n" + inner)
			if err := writeJSON(out, item, inner); err != nil {
				return err
			}
		}
		out.WriteString("\n" + indent + "]")
	default:
		if !json.Valid([]byte(value.Literal)) {
			return fmt.Errorf("%q stands as no JSON literal", value.Literal)
		}
		out.WriteString(value.Literal)
	}
	return nil
}

// Quotes a key the way JSON.stringify does: the quote, the backslash and the control characters escaped, and the rest as it stands. [[spec/design_output/model#everything-on-disk-mirrors]]
func quoted(key string) string {
	var out strings.Builder
	out.WriteByte('"')
	for _, one := range key {
		switch one {
		case '"':
			out.WriteString(`\"`)
		case '\\':
			out.WriteString(`\\`)
		case '\b':
			out.WriteString(`\b`)
		case '\f':
			out.WriteString(`\f`)
		case '\n':
			out.WriteString(`\n`)
		case '\r':
			out.WriteString(`\r`)
		case '\t':
			out.WriteString(`\t`)
		default:
			if one < ' ' {
				fmt.Fprintf(&out, `\u%04x`, one)
			} else {
				out.WriteRune(one)
			}
		}
	}
	out.WriteByte('"')
	return out.String()
}
