// The re-route: a note with its route swapped, its front reminted in the
// schema's order and its chapters laid again, each held chapter kept, off
// reRouted in lib/schema-mint.js.
// [[spec/design_output/schema#the-render-follows-the-tree]]
package check

import (
	"encoding/json"
	"slices"
	"strconv"
	"strings"

	"quackitect/src/front"
	"quackitect/src/yaml"
)

// The note with steps as its route, its held chapters kept where the new route still names them. [[spec/design_output/schema#the-render-follows-the-tree]]
func ReRouted(text string, schema *yaml.Doc, steps any) string {
	read := readNote(text)
	doc := yaml.New()
	for _, key := range read.Front.Said.Keys() {
		doc.Set(key, read.Front.Said.Get(key))
	}
	doc.Set("steps", steps)
	body := yaml.AsDoc(schema.Get("body"))
	level := 1
	if body != nil && yaml.AsInt(body.Get("headingLevel")) > 0 {
		level = yaml.AsInt(body.Get("headingLevel"))
	}
	var sections []any
	if body != nil {
		sections = yaml.AsList(body.Get("sections"))
	}
	wanted := mintChapters(sections, doc, level)
	owns := heldOwns(read.Sections, wanted, level)
	rows := []string{strings.TrimRight(front.Mint(frontHeld(doc, schema)), " \n"), ""}
	for at, one := range wanted {
		rows = append(rows, strings.Repeat("#", one.level)+" "+one.header, "")
		if own := trimmedRows(owns[at]); len(own) > 0 {
			rows = append(append(rows, own...), "")
			continue
		}
		if one.description != "" {
			rows = append(rows, "<!-- "+one.description+" -->", "")
		}
		if one.form != "" {
			rows = append(rows, "<!-- the form is "+one.form+" -->", "")
		}
	}
	return strings.TrimRight(strings.Join(rows, "\n"), " \n\t") + "\n"
}

// The rows each wanted chapter holds already: by its chain of headings, else by its depth and header where that stands alone. [[spec/design_output/schema#the-render-follows-the-tree]]
func heldOwns(sections []Section, wanted []mintChapter, level int) [][]string {
	var held []Section
	for _, one := range sections {
		if one.Level >= level {
			held = append(held, one)
		}
	}
	heldLevels := make([]int, len(held))
	heldHeaders := make([]string, len(held))
	for at, one := range held {
		heldLevels[at], heldHeaders[at] = one.Level, one.Header
	}
	byChain := map[string]int{}
	for at, key := range chainKeys(heldLevels, heldHeaders) {
		byChain[key] = at
	}
	byName := map[string]int{}
	for at, one := range held {
		key := strconv.Itoa(one.Level) + " " + one.Header
		if _, twice := byName[key]; twice {
			byName[key] = -1
		} else {
			byName[key] = at
		}
	}
	wantedLevels := make([]int, len(wanted))
	wantedHeaders := make([]string, len(wanted))
	for at, one := range wanted {
		wantedLevels[at], wantedHeaders[at] = one.level, one.header
	}
	taken := map[int]bool{}
	found := make([]int, len(wanted))
	for at, key := range chainKeys(wantedLevels, wantedHeaders) {
		found[at] = -1
		if held, ok := byChain[key]; ok {
			found[at] = held
			taken[held] = true
		}
	}
	out := make([][]string, len(wanted))
	for at, one := range wanted {
		if found[at] >= 0 {
			out[at] = held[found[at]].Own
			continue
		}
		alone, ok := byName[strconv.Itoa(one.level)+" "+one.header]
		if !ok || alone < 0 || taken[alone] {
			continue
		}
		taken[alone] = true
		out[at] = held[alone].Own
	}
	return out
}

// Each heading keyed by its chain of headings above it. [[spec/design_output/schema#the-render-follows-the-tree]]
func chainKeys(levels []int, headers []string) []string {
	type link struct {
		deep   int
		header string
	}
	var chain []link
	out := make([]string, len(levels))
	for at, deep := range levels {
		for len(chain) > 0 && chain[len(chain)-1].deep >= deep {
			chain = chain[:len(chain)-1]
		}
		chain = append(chain, link{deep, headers[at]})
		parts := make([]string, len(chain))
		for i, one := range chain {
			parts[i] = strconv.Itoa(one.deep) + " " + one.header
		}
		out[at] = strings.Join(parts, "\n")
	}
	return out
}

// The front in the schema's order, and every key it leaves out after. [[spec/design_output/schema#the-render-follows-the-tree]]
func frontHeld(doc, schema *yaml.Doc) front.Ordered {
	var props []string
	if spec := yaml.AsDoc(schema.Get("frontmatter")); spec != nil {
		if held := yaml.AsDoc(spec.Get("properties")); held != nil {
			props = held.Keys()
		}
	}
	var out front.Ordered
	for _, key := range props {
		if doc.Has(key) {
			out = append(out, front.Pair{Key: key, Value: reroutedValue(doc.Get(key))})
		}
	}
	for _, key := range doc.Keys() {
		if !slices.Contains(props, key) {
			out = append(out, front.Pair{Key: key, Value: reroutedValue(doc.Get(key))})
		}
	}
	return out
}

// A parsed value as the front writer takes it: a map in its order, a whole number as written. [[spec/tickets/go-writes-the-frontmatter]]
func reroutedValue(said any) any {
	switch one := said.(type) {
	case *yaml.Doc:
		var out front.Ordered
		for _, key := range one.Keys() {
			out = append(out, front.Pair{Key: key, Value: reroutedValue(one.Get(key))})
		}
		return out
	case []any:
		out := make([]any, 0, len(one))
		for _, each := range one {
			out = append(out, reroutedValue(each))
		}
		return out
	case int:
		return json.Number(strconv.Itoa(one))
	}
	return said
}

// Rows with the blank ones off each end. [[spec/design_output/schema#the-render-follows-the-tree]]
func trimmedRows(own []string) []string {
	from, to := 0, len(own)
	for from < to && strings.TrimSpace(own[from]) == "" {
		from++
	}
	for to > from && strings.TrimSpace(own[to-1]) == "" {
		to--
	}
	return own[from:to]
}
