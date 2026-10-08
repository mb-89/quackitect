// The body of a note against its schema: which chapters a schema wants, the
// order it names them in, and the sections standing under a numbered one. The
// frontmatter's own checker stands in schema.go beside this file.
// [[spec/design_output/schema#a-finding-names-the-section]]
package check

import (
	"quackitect/src/yaml"

	"fmt"
	"slices"
	"strconv"
)

type standingAt struct {
	Section
	at int
}

// [[spec/design_output/schema#keywords-that-name-a-step]]
func bodyFaults(note Note, spec *yaml.Doc, kind, where string) []Finding {
	level := 1
	if spec.Has("headingLevel") {
		level = yaml.AsInt(spec.Get("headingLevel"))
	}
	wanted := chaptersWanted(yaml.AsList(spec.Get("sections")), note.Front.Said, level)
	levels, nested := map[int]bool{level: true}, false
	named := map[string]mintChapter{}
	once := []mintChapter{}
	for _, one := range wanted {
		levels[one.level] = true
		nested = nested || one.level > level
		named[chapterKey(one.level, one.header)] = one
		if one.level == level {
			once = append(once, one)
		}
	}

	standing, top := []standingAt{}, []standingAt{}
	for i, one := range note.Sections {
		if (nested && one.Level >= level) || (!nested && levels[one.Level]) {
			standing = append(standing, standingAt{Section: one, at: i})
		}
		if one.Level == level {
			top = append(top, standingAt{Section: one, at: i})
		}
	}

	out := []Finding{}
	for _, one := range wanted {
		if !one.required || slices.ContainsFunc(standing, func(held standingAt) bool { return held.Header == one.header && held.Level == one.level }) {
			continue
		}
		out = append(out, schemaFault(one.header, where, 1,
			fmt.Sprintf("A %s carries a %s chapter.", kind, one.header)))
	}

	for _, held := range standing {
		if _, ours := named[chapterKey(held.Level, held.Header)]; ours {
			continue
		}
		if spec.Get("extraSections") == false {
			out = append(out, schemaFault(held.Header, where, held.Line,
				fmt.Sprintf("The %s schema names no %s chapter.", kind, held.Header)))
		}
	}

	if yaml.AsString(spec.Get("order")) == "strict" {
		out = append(out, orderFaults(top, once, kind, where)...)
	}
	out = append(out, lastFaults(top, once, where)...)

	for _, held := range standing {
		if one, ours := named[chapterKey(held.Level, held.Header)]; ours {
			out = append(out, sectionFaults(held, one.rule, note, where)...)
		}
	}
	return out
}

func chapterKey(level int, header string) string {
	return strconv.Itoa(level) + " " + header
}

func orderFaults(standing []standingAt, wanted []mintChapter, kind, where string) []Finding {
	order := []string{}
	for _, one := range wanted {
		order = append(order, one.header)
	}

	held := []standingAt{}
	for _, one := range standing {
		if at(order, one.Header) >= 0 {
			held = append(held, one)
		}
	}

	out := []Finding{}
	for i := 1; i < len(held); i++ {
		if at(order, held[i].Header) > at(order, held[i-1].Header) {
			continue
		}
		out = append(out, schemaFault(held[i].Header, where, held[i].Line,
			fmt.Sprintf("%s stands after %s, and a %s note puts it first.", held[i].Header, held[i-1].Header, kind)))
	}
	return out
}

func lastFaults(standing []standingAt, wanted []mintChapter, where string) []Finding {
	out := []Finding{}
	for _, one := range wanted {
		if yaml.AsString(one.rule.Get("position")) != "last" || one.rule.Has("x-one-per") {
			continue
		}
		header := one.header
		found := headed(standing, header)
		if found < 0 || found == len(standing)-1 {
			continue
		}
		out = append(out, schemaFault(header, where, standing[found].Line,
			fmt.Sprintf("%s closes this note, and %s stands after it.", header, standing[found+1].Header)))
	}
	return out
}

func sectionFaults(held standingAt, rule *yaml.Doc, note Note, where string) []Finding {
	out := []Finding{}
	items := itemsIn(held.Own)

	if yaml.AsBool(rule.Get("list")) && len(items) == 0 {
		out = append(out, schemaFault(held.Header, where, held.Line,
			fmt.Sprintf("%s holds a list of items.", held.Header)))
	}
	if yaml.AsBool(rule.Get("ordered")) && someUnnumbered(items) {
		out = append(out, schemaFault(held.Header, where, held.Line,
			fmt.Sprintf("%s numbers every item.", held.Header)))
	}
	if most := yaml.AsInt(rule.Get("maxItems")); most > 0 && len(items) > most {
		out = append(out, schemaFault(held.Header, where, held.Line+items[most].line,
			fmt.Sprintf("A note holds %d items.", most)))
	}
	if spec := yaml.AsDoc(rule.Get("subsections")); spec != nil {
		out = append(out, underFaults(held, spec, note, where)...)
	}
	if spec := yaml.AsDoc(rule.Get("table")); spec != nil {
		out = append(out, tableFaults(held, spec, note, where)...)
	}
	return out
}

type numberedSection struct {
	said   int
	line   int
	header string
}

func underFaults(held standingAt, spec *yaml.Doc, note Note, where string) []Finding {
	level := held.Level + 1
	if spec.Has("headingLevel") {
		level = yaml.AsInt(spec.Get("headingLevel"))
	}

	out := []Finding{}
	numbers := []numberedSection{}
	for _, one := range note.Sections[held.at+1:] {
		if one.Level <= held.Level {
			break
		}
		if one.Level != level {
			continue
		}
		found := numberedAt.FindStringSubmatch(one.Header)
		if yaml.AsBool(spec.Get("numbered")) && found == nil {
			out = append(out, schemaFault(held.Header, where, one.Line,
				fmt.Sprintf("A chapter under %s opens with the number of the item it argues.", held.Header)))
			continue
		}
		if found != nil {
			said, _ := strconv.Atoi(found[1])
			numbers = append(numbers, numberedSection{said: said, line: one.Line, header: one.Header})
		}
	}

	if yaml.AsString(spec.Get("order")) != "strict" {
		return out
	}
	for i := 1; i < len(numbers); i++ {
		if numbers[i].said > numbers[i-1].said {
			continue
		}
		out = append(out, schemaFault(held.Header, where, numbers[i].line,
			fmt.Sprintf("%s stands after %s, and the numbers run up.", numbers[i].header, numbers[i-1].header)))
	}
	return out
}
