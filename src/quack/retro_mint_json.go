// The retro mint's JSON: the record read with its keys in the order the text
// holds them, and written back as JSON.stringify writes it.
// [[spec/guidance/retro/check]]
package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"math"
	"strconv"
	"strings"
)

// A JSON value with its keys in the order the text holds them, as JSON.parse keeps them. [[spec/guidance/retro/check]]
type retroMintNode struct {
	kind  byte
	keys  []string
	vals  map[string]*retroMintNode
	items []*retroMintNode
	text  string
}

// Reads one JSON text, and refuses anything past its value. [[spec/guidance/retro/check]]
func retroMintParse(text string) (*retroMintNode, error) {
	dec := json.NewDecoder(strings.NewReader(text))
	dec.UseNumber()
	node, err := retroMintValue(dec)
	if err != nil {
		return nil, err
	}
	if _, err := dec.Token(); !errors.Is(err, io.EOF) {
		return nil, errors.New("the text runs past its value")
	}
	return node, nil
}

// Reads the next JSON value off the decoder. [[spec/guidance/retro/check]]
func retroMintValue(dec *json.Decoder) (*retroMintNode, error) {
	token, err := dec.Token()
	if err != nil {
		return nil, err
	}
	switch held := token.(type) {
	case json.Delim:
		node := &retroMintNode{kind: 'a'}
		if held == '{' {
			node = &retroMintNode{kind: 'o', vals: map[string]*retroMintNode{}}
		}
		for dec.More() {
			key := ""
			if node.kind == 'o' {
				word, err := dec.Token()
				if err != nil {
					return nil, err
				}
				key, _ = word.(string)
			}
			value, err := retroMintValue(dec)
			if err != nil {
				return nil, err
			}
			if node.kind == 'o' {
				node.set(key, value)
			} else {
				node.items = append(node.items, value)
			}
		}
		_, err := dec.Token()
		return node, err
	case string:
		return &retroMintNode{kind: 's', text: held}, nil
	case json.Number:
		return &retroMintNode{kind: 'n', text: held.String()}, nil
	case bool:
		return &retroMintNode{kind: 'b', text: strconv.FormatBool(held)}, nil
	}
	return &retroMintNode{kind: 'z'}, nil
}

// The value under a key of an object, or none. [[spec/guidance/retro/check]]
func (n *retroMintNode) get(key string) *retroMintNode {
	if n == nil || n.kind != 'o' {
		return nil
	}
	return n.vals[key]
}

// Sets a key of an object: a key it holds keeps its place, and a new one goes last. [[spec/guidance/retro/check]]
func (n *retroMintNode) set(key string, value *retroMintNode) {
	if n == nil || n.kind != 'o' {
		return
	}
	if _, held := n.vals[key]; !held {
		n.keys = append(n.keys, key)
	}
	n.vals[key] = value
}

// Whether the value is this string, as === reads it. [[spec/guidance/retro/check]]
func (n *retroMintNode) isText(word string) bool {
	return n != nil && n.kind == 's' && n.text == word
}

// The value as String(value ?? "") reads it. [[spec/guidance/retro/check]]
func (n *retroMintNode) str() string {
	if n == nil {
		return ""
	}
	switch n.kind {
	case 's', 'b':
		return n.text
	case 'n':
		return retroMintNumber(n.text)
	case 'a':
		parts := make([]string, len(n.items))
		for place, one := range n.items {
			parts[place] = one.str()
		}
		return strings.Join(parts, ",")
	case 'o':
		return "[object Object]"
	}
	return ""
}

// The value as a template literal reads it, where a missing value reads undefined. [[spec/guidance/retro/check]]
func (n *retroMintNode) template() string {
	switch {
	case n == nil:
		return "undefined"
	case n.kind == 'z':
		return "null"
	}
	return n.str()
}

// The items of a list, each as String reads it; a string stands as its characters, as for...of walks it. [[spec/guidance/retro/check]]
func (n *retroMintNode) listed() []string {
	if n == nil {
		return nil
	}
	out := []string{}
	switch n.kind {
	case 'a':
		for _, one := range n.items {
			out = append(out, one.str())
		}
	case 's':
		for _, one := range n.text {
			out = append(out, string(one))
		}
	}
	return out
}

// Writes the value as JSON.stringify with two spaces writes it. [[spec/guidance/retro/check]]
func (n *retroMintNode) write(b *strings.Builder, indent string) {
	inner := indent + "  "
	switch n.kind {
	case 'o':
		if len(n.keys) == 0 {
			b.WriteString("{}")
			return
		}
		b.WriteString("{\n")
		for place, key := range n.keys {
			b.WriteString(inner + retroMintQuote(key) + ": ")
			n.vals[key].write(b, inner)
			if place < len(n.keys)-1 {
				b.WriteString(",")
			}
			b.WriteString("\n")
		}
		b.WriteString(indent + "}")
	case 'a':
		if len(n.items) == 0 {
			b.WriteString("[]")
			return
		}
		b.WriteString("[\n")
		for place, one := range n.items {
			b.WriteString(inner)
			one.write(b, inner)
			if place < len(n.items)-1 {
				b.WriteString(",")
			}
			b.WriteString("\n")
		}
		b.WriteString(indent + "]")
	case 's':
		b.WriteString(retroMintQuote(n.text))
	case 'n':
		if number, err := strconv.ParseFloat(n.text, numberBits); err != nil || math.IsInf(number, 0) {
			b.WriteString("null")
			return
		}
		b.WriteString(retroMintNumber(n.text))
	case 'b':
		b.WriteString(n.text)
	default:
		b.WriteString("null")
	}
}

// A string as JSON.stringify quotes it. [[spec/guidance/retro/check]]
func retroMintQuote(text string) string {
	var b strings.Builder
	b.WriteByte('"')
	for _, one := range text {
		switch one {
		case '"':
			b.WriteString(`\"`)
		case '\\':
			b.WriteString(`\\`)
		case '\b':
			b.WriteString(`\b`)
		case '\f':
			b.WriteString(`\f`)
		case '\n':
			b.WriteString(`\n`)
		case '\r':
			b.WriteString(`\r`)
		case '\t':
			b.WriteString(`\t`)
		default:
			if one < 0x20 {
				fmt.Fprintf(&b, `\u%04x`, one)
			} else {
				b.WriteRune(one)
			}
		}
	}
	b.WriteByte('"')
	return b.String()
}

// A JSON number as JavaScript prints it: no trailing zero, and an exponent past 1e21 or under 1e-6. [[spec/guidance/retro/check]]
func retroMintNumber(text string) string {
	number, err := strconv.ParseFloat(text, numberBits)
	switch {
	case err != nil && math.IsInf(number, 1):
		return "Infinity"
	case err != nil && math.IsInf(number, -1):
		return "-Infinity"
	case number == 0:
		return "0"
	}
	if size := math.Abs(number); size < retroJSLargest && size >= retroJSSmallest {
		return strconv.FormatFloat(number, 'f', -1, numberBits)
	}
	mantissa, exponent, _ := strings.Cut(strconv.FormatFloat(number, 'e', -1, numberBits), "e")
	sign, digits := exponent[:1], strings.TrimLeft(exponent[1:], "0")
	return mantissa + "e" + sign + digits
}
