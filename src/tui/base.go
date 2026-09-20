// The declaration a view comes from, in the base format the vaults write. One
// file holds several views under `views`, and each names its columns, their
// room, what stands collapsed and whether it nests. So a new view is a file
// and no change to the code.
// [[spec/design_output/tree-view#a-base-file-says-it]]

package main

import (
	"fmt"
	"strings"

	"quackitect/yaml"
)

// [[spec/design_output/tree-view#a-base-file-says-it]]
const columnWide = 20

// [[spec/design_output/tree-view#a-base-file-says-it]]
type View struct {
	Name      string
	Cols      []Column
	Nests     bool
	Collapsed []string
	Filters   string
	Opens     string
	Sorts     []Sort
	Presets   []Preset
	Flags     []Flag
}

// A boolean key and the letter standing for it in the flags column, or a key whose value's first letter stands there. [[spec/design_output/tree-view#a-flag-draws-a-letter]]
type Flag struct {
	Letter string
	Key    string
	Value  bool
}

// [[spec/design_output/tree-view#a-base-file-says-it]]
func ReadBase(text string) ([]View, error) {
	said := yaml.AsDoc(yaml.Read(text))
	if said == nil {
		return nil, fmt.Errorf("a base file holds a map, and this one holds none")
	}
	views := yaml.AsList(said.Get("views"))
	if len(views) == 0 {
		return nil, fmt.Errorf("a base file holds its views under views, and this one holds none")
	}
	out := make([]View, 0, len(views))
	for at, each := range views {
		one, err := viewOf(at, yaml.AsDoc(each), said)
		if err != nil {
			return nil, err
		}
		out = append(out, one)
	}
	return out, nil
}

func viewOf(at int, said, whole *yaml.Doc) (View, error) {
	if said == nil {
		return View{}, fmt.Errorf("the view at place %d holds no map", at+1)
	}
	name := yaml.AsString(said.Get("name"))
	if name == "" {
		return View{}, fmt.Errorf("the view at place %d names itself nowhere", at+1)
	}
	order := yaml.StringsOf(said.Get("order"))
	if len(order) == 0 {
		order = yaml.StringsOf(whole.Get("order"))
	}
	if len(order) == 0 {
		return View{}, fmt.Errorf("the view %s names no column under order", name)
	}
	room := roomOf(said, whole)
	cols := make([]Column, 0, len(order))
	for _, key := range order {
		cols = append(cols, Column{Name: headOf(key), Key: key, Wide: room[key]})
	}
	return View{
		Name:      name,
		Cols:      cols,
		Nests:     nestsBy(said, whole) != "",
		Collapsed: yaml.StringsOf(said.Get("collapsed")),
		Filters:   filtersOf(said, whole),
		Opens:     opensOf(whole),
		Sorts:     sortsOf(said, whole),
		Presets:   presetsOf(said, whole),
		Flags:     flagsIn(said, whole),
	}, nil
}

// The letters the flags column draws, in the fixed places the file names. [[spec/design_output/tree-view#a-flag-draws-a-letter]]
func flagsIn(said, whole *yaml.Doc) []Flag {
	for _, held := range []*yaml.Doc{said, whole} {
		if held == nil {
			continue
		}
		rows := yaml.Flat(held.Get("flags"))
		out := make([]Flag, 0, len(rows))
		for _, each := range rows {
			one := yaml.AsDoc(each)
			if one == nil {
				continue
			}
			letter := yaml.AsString(one.Get("letter"))
			key := yaml.AsString(one.Get("key"))
			value := yaml.AsBool(one.Get("value"))
			if key == "" || (letter == "" && !value) {
				continue
			}
			out = append(out, Flag{Letter: letter, Key: key, Value: value})
		}
		// A view naming none falls through to the file, which names them once. [[spec/design_output/tree-view#a-flag-draws-a-letter]]
		if len(out) > 0 {
			return out
		}
	}
	return nil
}

// A preset a file writes down stands under `groups`, with its filter and its sort. [[spec/design_output/tree-view#a-preset-carries-its-sort]]
func presetsOf(said, whole *yaml.Doc) []Preset {
	out := []Preset{}
	for _, held := range []*yaml.Doc{whole, said} {
		if held == nil {
			continue
		}
		for _, each := range yaml.Flat(held.Get("groups")) {
			one := yaml.AsDoc(each)
			if one == nil {
				continue
			}
			name := yaml.AsString(one.Get("name"))
			if name == "" {
				continue
			}
			out = append(out, Preset{
				Name:    name,
				Filters: filtersOf(one, nil),
				Sorts:   sortsOf(one, nil),
				Pressed: yaml.AsBool(one.Get("pressed")),
			})
		}
	}
	return out
}

// The order a view opens in, as a list of keys or of maps naming a direction. [[spec/design_output/tree-view#a-sort-holds-several-keys]]
func sortsOf(said, whole *yaml.Doc) []Sort {
	for _, held := range []*yaml.Doc{said, whole} {
		if held == nil {
			continue
		}
		rows := yaml.Flat(held.Get("sort"))
		out := make([]Sort, 0, len(rows))
		for _, each := range rows {
			if one := yaml.AsDoc(each); one != nil {
				out = append(out, Sort{
					Key:  yaml.AsString(one.Get("key")),
					Down: yaml.AsBool(one.Get("down")),
				})
				continue
			}
			if key := strings.TrimSpace(yaml.AsString(each)); key != "" {
				out = append(out, Sort{Key: key})
			}
		}
		// A view naming no order falls through to the file. [[spec/design_output/tree-view#a-sort-holds-several-keys]]
		if len(out) > 0 {
			return out
		}
	}
	return nil
}

// [[spec/design_output/tree-view#a-base-file-says-it]]
func roomOf(said, whole *yaml.Doc) map[string]int {
	out := map[string]int{}
	for _, held := range []*yaml.Doc{yaml.AsDoc(whole.Get("columnSize")), yaml.AsDoc(said.Get("columnSize"))} {
		if held == nil {
			continue
		}
		for _, key := range held.Keys() {
			out[key] = yaml.AsInt(held.Get(key))
		}
	}
	for key, wide := range out {
		if wide <= 0 {
			out[key] = columnWide
		}
	}
	return out
}

func headOf(key string) string {
	name := key
	if _, rest, found := strings.Cut(key, "."); found {
		name = rest
	}
	return strings.ReplaceAll(name, "_", " ")
}

// [[spec/design_output/tree-view#a-base-file-says-it]]
func nestsBy(said, whole *yaml.Doc) string {
	for _, held := range []*yaml.Doc{said, whole} {
		if held == nil {
			continue
		}
		if key := yaml.AsString(held.Get("nest")); key != "" {
			return key
		}
	}
	return ""
}

// [[spec/design_output/tree-view#a-base-file-says-it]]
func filtersOf(said, whole *yaml.Doc) string {
	var held []string
	for _, one := range []*yaml.Doc{whole, said} {
		if one == nil {
			continue
		}
		tests := one.Get("filters")
		if joined := yaml.AsDoc(tests); joined != nil {
			tests = joined.Get("and")
		}
		for _, each := range yaml.Flat(tests) {
			if said := testOf(each); said != "" {
				held = append(held, said)
			}
		}
	}
	return strings.Join(held, " and ")
}

// [[spec/design_output/tree-view#a-base-file-says-it]]
func testOf(said any) string {
	if one := yaml.AsDoc(said); one != nil {
		lines := make([]string, 0, len(one.Keys()))
		for _, key := range one.Keys() {
			lines = append(lines, key+": "+yaml.AsString(one.Get(key)))
		}
		return strings.Join(lines, " and ")
	}
	return strings.TrimSpace(yaml.AsString(said))
}

// [[spec/design_output/tree-view#a-base-file-says-it]]
func opensOf(whole *yaml.Doc) string {
	props := yaml.AsDoc(whole.Get("properties"))
	if props == nil {
		return ""
	}
	for _, key := range props.Keys() {
		if one := yaml.AsDoc(props.Get(key)); one != nil && yaml.AsBool(one.Get("opensNote")) {
			return key
		}
	}
	return ""
}
