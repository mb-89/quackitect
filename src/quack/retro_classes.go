// The retro's class fixes: the classes a hand writes, checked, counted and
// held against every finding, note and memory, which each carry a disposition.
// [[spec/guidance/retro/classify]]
package main

import (
	"fmt"
	"io"
	"os"
	"path/filepath"
	"regexp"
	"strings"
)

// The hand's record, and the rates the verb writes beside it. [[spec/guidance/retro/classify]]
const (
	retroClassesFile = "classes.json"
	retroRatesFile   = "rates.json"
)

// The sources a class measures. [[spec/guidance/retro/classify]]
var retroSources = []string{"log", "transcripts", "all"}

// A disposition that joins no class opens on one of these, and a reason or a place follows. [[spec/guidance/retro/classify]]
var retroKinds = []string{"dropped:", "done:", "ticket:"}

// The input folders whose every file carries a disposition too: the collected notes, the memory and the scripts, where a script keeps its ending in its id. [[spec/guidance/retro/classify]] [[spec/design_output/model#the-guards-hold-a-baseline]]
var retroDrainedFolders = []struct {
	folder, prefix string
	whole          bool
}{{"tickets", "note", false}, {"memory", "memory", false}, {"scripts", "script", true}}

// The memory's index, which carries no disposition. [[spec/guidance/retro/classify]]
const retroMemoryIndex = "MEMORY.md"

// The hand's record: the classes, the dispositions, the promotions, the limits and the checklist. [[spec/guidance/retro/classify]]
type retroRecord struct {
	classes      []any
	dispositions *retroJSDict
	promotions   []any
	limits       []any
	checklist    []any
}

// One class's matches, and its matches per active hour. [[spec/guidance/retro/classify]]
type retroRate struct {
	Count int     `json:"count"`
	Rate  float64 `json:"rate"`
}

// Each class's rate over the active hours of the input, in the order the classes stand. [[spec/guidance/retro/classify]]
type retroRates struct {
	Hours   int                  `json:"hours"`
	Classes map[string]retroRate `json:"classes"`
	order   []string
}

func init() { register("retro classes", retroClassesVerb(retroRoot)) }

// The hand's record, read, or nil where it reads as no JSON. [[spec/guidance/retro/classify]]
func retroRecordOf(text string) *retroRecord {
	read, ok := retroJSParse(text)
	if !ok {
		return nil
	}
	list := func(key string) []any {
		if items := retroJSList(retroJSField(read, key)); items != nil {
			return items
		}
		return []any{}
	}
	dispositions, _ := retroJSField(read, "dispositions").(*retroJSDict)
	if dispositions == nil {
		dispositions = retroJSObject()
	}
	return &retroRecord{
		classes:      list("classes"),
		dispositions: dispositions,
		promotions:   list("promotions"),
		limits:       list("limits"),
		checklist:    list("checklist"),
	}
}

// Every collected note and memory, by id, so each one answers where it goes. Collect nests the memory under the project's folder name, so the walk reaches every level. [[spec/guidance/retro/classify]]
func retroDrainedOf(home string) []retroItem {
	out := []retroItem{}
	var walk func(at, prefix string, whole bool)
	walk = func(at, prefix string, whole bool) {
		entries, err := os.ReadDir(at)
		if err != nil {
			return
		}
		for _, entry := range entries {
			if entry.IsDir() {
				walk(filepath.Join(at, entry.Name()), prefix, whole)
			} else if whole {
				out = append(out, retroItem{id: prefix + ":" + entry.Name()})
			} else if strings.HasSuffix(entry.Name(), ".md") && entry.Name() != retroMemoryIndex {
				out = append(out, retroItem{id: prefix + ":" + strings.TrimSuffix(entry.Name(), ".md")})
			}
		}
	}
	for _, one := range retroDrainedFolders {
		walk(filepath.Join(home, retroInput, one.folder), one.prefix, one.whole)
	}
	return out
}

// Every fault of a record held against the items: a class short a field, an item with no disposition, a disposition naming nothing. [[spec/guidance/retro/classify]]
func retroFaultsOf(record *retroRecord, items []retroItem) []string {
	faults := retroClassFaults(record.classes)
	ids := map[string]bool{}
	for _, one := range record.classes {
		ids[retroJSOr(retroJSField(one, "id"))] = true
	}
	known := map[string]bool{}
	for _, one := range items {
		known[one.id] = true
	}
	for _, one := range items {
		if !record.dispositions.has(one.id) {
			faults = append(faults, one.id+" carries no disposition")
		}
	}
	for _, id := range record.dispositions.order() {
		if !known[id] {
			faults = append(faults, fmt.Sprintf("a disposition names %s, and no item carries that id", id))
		}
		text := retroJSOr(record.dispositions.get(id))
		reasoned := false
		for _, kind := range retroKinds {
			if strings.HasPrefix(text, kind) {
				reasoned = retroJSTrim(text[len(kind):]) != ""
				break
			}
		}
		if !reasoned && !ids[text] {
			shown := text
			if shown == "" {
				shown = "nothing"
			}
			faults = append(faults, fmt.Sprintf("%s names %s, which is no class and no %s with its reason", id, shown, strings.Join(retroKinds, " or ")))
		}
	}
	faults = append(faults, retroListFaults("promotion", record.promotions, []string{"what", "from", "to"})...)
	faults = append(faults, retroListFaults("limit", record.limits, []string{"what", "why"})...)
	faults = append(faults, retroListFaults("checklist item", record.checklist, []string{"item", "why"})...)
	return faults
}

// Every class short a field, a category, a source or a pattern that compiles. [[spec/guidance/retro/classify]]
func retroClassFaults(classes []any) []string {
	faults := []string{}
	for _, one := range classes {
		id := retroJSField(one, "id")
		for _, field := range []string{"id", "category", "class", "defect", "fix"} {
			if retroJSTrim(retroJSOr(retroJSField(one, field))) == "" {
				shown := "?"
				if !retroJSNullish(id) {
					shown = retroJSText(id)
				}
				faults = append(faults, fmt.Sprintf("a class carries no %s: %s", field, shown))
			}
		}
		if !retroJSIn(retroCategories, retroJSField(one, "category")) {
			faults = append(faults, fmt.Sprintf("%s names no category of %s", retroJSText(id), strings.Join(retroCategories, ", ")))
		}
		measure := retroJSField(one, "measure")
		if !retroJSIn(retroSources, retroJSField(measure, "source")) {
			faults = append(faults, fmt.Sprintf("%s measures no source of %s", retroJSText(id), strings.Join(retroSources, ", ")))
		}
		if retroPatternOf(retroJSField(measure, "pattern")) == nil {
			faults = append(faults, fmt.Sprintf("%s carries no pattern that compiles", retroJSText(id)))
		}
	}
	return faults
}

// Every item of a list short a field. [[spec/guidance/retro/classify]]
func retroListFaults(name string, list []any, fields []string) []string {
	faults := []string{}
	for at, one := range list {
		for _, field := range fields {
			if retroJSTrim(retroJSOr(retroJSField(one, field))) == "" {
				faults = append(faults, fmt.Sprintf("%s %d carries no %s", name, at+1, field))
			}
		}
	}
	return faults
}

// A class's pattern, compiled, or nil where it names none or none compiles. [[spec/guidance/retro/classify]]
func retroPatternOf(said any) *regexp.Regexp {
	if !retroJSTruthy(said) {
		return nil
	}
	pattern, err := regexp.Compile(retroJSText(said))
	if err != nil {
		return nil
	}
	return pattern
}

// Each class's rate: its matches per active hour of the input, to two places. [[spec/guidance/retro/classify]]
func retroRatesOf(root, name string, classes []any) *retroRates {
	measures := []retroMeasure{}
	for _, one := range classes {
		measure := retroJSField(one, "measure")
		measures = append(measures, retroMeasure{
			id:      retroJSText(retroJSField(one, "id")),
			source:  retroJSField(measure, "source"),
			pattern: retroPatternOf(retroJSField(measure, "pattern")),
		})
	}
	counts, hours := retroCountsOver(root, name, measures)
	rates := &retroRates{Hours: hours, Classes: map[string]retroRate{}}
	for _, one := range measures {
		if _, seen := rates.Classes[one.id]; !seen {
			rates.order = append(rates.order, one.id)
		}
		var rate float64
		if hours > 0 {
			rate = retroJSFixed(float64(counts[one.id])/float64(hours), 2)
		}
		rates.Classes[one.id] = retroRate{Count: counts[one.id], Rate: rate}
	}
	return rates
}

// The rates as the JSON the verb writes, the classes in the order they stand. [[spec/guidance/retro/classify]]
func (r *retroRates) value() *retroJSDict {
	classes := retroJSObject()
	for _, id := range r.order {
		classes.set(id, retroJSObject("count", r.Classes[id].Count, "rate", r.Classes[id].Rate))
	}
	return retroJSObject("hours", r.Hours, "classes", classes)
}

// The verb: refuses a record short of anything, and writes each class's rate. [[spec/guidance/retro/classify]]
func retroClassesVerb(root func() string) twin {
	return func(argv []string, _ bool, out, errs io.Writer) int {
		base, name := root(), retroWordAt(argv, 2)
		home, at := "", ""
		if name != "" {
			home = retroHome(base, name)
			at = filepath.Join(home, retroClassesFile)
		}
		if at == "" || !retroIsThere(at) || !retroIsThere(filepath.Join(home, retroCutsFile)) {
			fmt.Fprintf(errs, "retro classes reads %s beside the chapters of a retro, and none stands.\n", retroClassesFile)
			return 2
		}
		record := retroRecordOf(retroFileText(at))
		if record == nil {
			fmt.Fprintf(errs, "%s reads as no JSON\n", retroClassesFile)
			return 1
		}
		columns, faults := retroColumnsOf(home)
		items := append(retroItemsOf(columns), retroDrainedOf(home)...)
		faults = append(faults, retroFaultsOf(record, items)...)
		if len(faults) > 0 {
			for _, one := range faults {
				fmt.Fprintln(errs, one)
			}
			return 1
		}
		rates := retroRatesOf(base, name, record.classes)
		if err := retroJSWrite(filepath.Join(home, retroRatesFile), rates.value()); err != nil {
			fmt.Fprintln(errs, err)
			return 1
		}
		for _, one := range record.classes {
			id := retroJSText(retroJSField(one, "id"))
			said := rates.Classes[id]
			fmt.Fprintf(out, "%s  %s  %d match(es), %s an hour  %s\n",
				id, retroJSText(retroJSField(one, "category")), said.Count, retroJSNumber(said.Rate), retroJSText(retroJSField(one, "class")))
		}
		fmt.Fprintf(out, "%d active hour(s), and every finding, note and memory carries a disposition.\n", rates.Hours)
		return 0
	}
}
