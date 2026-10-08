// A new route over a ticket: the front takes the steps and the hash, and each
// chapter keeps what a hand wrote under it.
// [[spec/design_input/the-agent-pulls-tickets#processes-are-routes]]
package check

import (
	"strings"
	"unicode"

	"quackitect/src/front"
	"quackitect/src/note"
	"quackitect/src/yaml"
)

// The ticket text with the route in its front, the hash where one is named, and the chapters the route asks, each keeping what it holds. [[spec/design_input/the-agent-pulls-tickets#processes-are-routes]]
func ReRouted(text string, schema *yaml.Doc, route []any, hash string) string {
	read := note.Read(text)
	held := yaml.New()
	for _, key := range read.Front.Said.Keys() {
		held.Set(key, read.Front.Said.Get(key))
	}
	held.Set("steps", route)
	if hash != "" {
		held.Set("process_hash", hash)
	}
	body := yaml.AsDoc(schema.Get("body"))
	level := 1
	if said, ok := body.Get("headingLevel").(int); ok {
		level = said
	}
	wanted := chaptersWanted(yaml.AsList(body.Get("sections")), held, level)
	for i, one := range wanted {
		if deep, ok := one.rule.Get("level").(int); ok && yaml.AsString(one.rule.Get("x-one-per")) == "" {
			wanted[i].level = deep
		}
	}
	owns := heldOwns(read.Sections, wanted, level)
	rows := []string{jsTrimEnd(front.Mint(frontHeld(held, schema))), ""}
	for i, one := range wanted {
		rows = append(rows, strings.Repeat("#", one.level)+" "+one.header, "")
		if own := trimmedRows(owns[i]); len(own) > 0 {
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
	return jsTrimEnd(strings.Join(rows, "\n")) + "\n"
}

// The rows each wanted chapter takes off the text: by its chain of headings, or by its depth and header where that stands alone. [[spec/design_output/schema#the-render-follows-the-tree]]
func heldOwns(sections []note.Section, wanted []mintChapter, level int) [][]string {
	var held []note.Section
	for _, one := range sections {
		if one.Level >= level {
			held = append(held, one)
		}
	}
	depths := make([]int, len(held))
	headers := make([]string, len(held))
	byChain, byName := map[string]int{}, map[string]int{}
	for i, one := range held {
		depths[i], headers[i] = one.Level, one.Header
		key := chapterName(one.Level, one.Header)
		if _, twice := byName[key]; twice {
			byName[key] = -1
		} else {
			byName[key] = i
		}
	}
	for i, key := range chainKeys(depths, headers) {
		byChain[key] = i
	}
	depths, headers = make([]int, len(wanted)), make([]string, len(wanted))
	for i, one := range wanted {
		depths[i], headers[i] = one.level, one.header
	}
	taken := map[int]bool{}
	found := make([]int, len(wanted))
	for i, key := range chainKeys(depths, headers) {
		at, ok := byChain[key]
		if !ok {
			at = -1
		} else {
			taken[at] = true
		}
		found[i] = at
	}
	out := make([][]string, len(wanted))
	for i, at := range found {
		if at < 0 {
			alone, ok := byName[chapterName(wanted[i].level, wanted[i].header)]
			if !ok || alone < 0 || taken[alone] {
				continue
			}
			taken[alone] = true
			at = alone
		}
		out[i] = held[at].Own
	}
	return out
}

// Each chapter's chain of headings, from the top down to it. [[spec/design_output/schema#the-render-follows-the-tree]]
func chainKeys(depths []int, headers []string) []string {
	type link struct {
		deep   int
		header string
	}
	var chain []link
	out := make([]string, len(depths))
	for i, deep := range depths {
		for len(chain) > 0 && chain[len(chain)-1].deep >= deep {
			chain = chain[:len(chain)-1]
		}
		chain = append(chain, link{deep, headers[i]})
		keys := make([]string, len(chain))
		for at, one := range chain {
			keys[at] = chapterName(one.deep, one.header)
		}
		out[i] = strings.Join(keys, "\n")
	}
	return out
}

func chapterName(deep int, header string) string {
	return strings.Repeat("#", deep) + " " + header
}

// The front in the schema's order, and every key it leaves out after, each value as the writer takes it. [[spec/design_output/schema#the-render-follows-the-tree]]
func frontHeld(held, schema *yaml.Doc) front.Ordered {
	props := yaml.AsDoc(yaml.AsDoc(schema.Get("frontmatter")).Get("properties"))
	out := front.Ordered{}
	for _, key := range props.Keys() {
		if held.Has(key) {
			out = append(out, front.Pair{Key: key, Value: frontOfValue(held.Get(key))})
		}
	}
	for _, key := range held.Keys() {
		if !props.Has(key) {
			out = append(out, front.Pair{Key: key, Value: frontOfValue(held.Get(key))})
		}
	}
	return out
}

// The rows with the blank ones at either end taken off. [[spec/design_output/schema#the-render-follows-the-tree]]
func trimmedRows(own []string) []string {
	for len(own) > 0 && jsTrimEnd(own[0]) == "" {
		own = own[1:]
	}
	for len(own) > 0 && jsTrimEnd(own[len(own)-1]) == "" {
		own = own[:len(own)-1]
	}
	return own
}

// The text with the end trimmed of what JavaScript's trimEnd reads as space. [[spec/design_output/schema#the-render-follows-the-tree]]
func jsTrimEnd(said string) string {
	return strings.TrimRightFunc(said, func(r rune) bool {
		return r == 0xfeff || (r != '\u0085' && unicode.IsSpace(r))
	})
}
