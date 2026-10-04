// The retro's report, bottom line first: the class fixes per category, the
// effect of the last retro, the promotions, then the matrix and every finding.
// [[spec/guidance/retro/classify]]
package main

import (
	"fmt"
	"regexp"
	"sort"
	"strings"
)

// The mark of an empty cell. [[spec/guidance/retro/read]]
const retroEmptyCell = "·"

// The ids of a collected note and a memory. [[spec/guidance/retro/classify]]
var retroDrainedID = regexp.MustCompile(`^(note|memory):`)

// What the later steps wrote, each nil where its step stands open. [[spec/guidance/retro/classify]]
type retroLater struct {
	record *retroRecord
	rates  *retroRates
	effect *retroEffectRecord
}

// The whole report over the columns, and over whatever the later steps wrote. [[spec/guidance/retro/classify]]
func retroReportOf(name string, columns []retroColumn, later retroLater) string {
	var promotions, checklist, limits []any
	if later.record != nil {
		promotions, checklist, limits = later.record.promotions, later.record.checklist, later.record.limits
	}
	lines := []string{"# Retro " + name, ""}
	lines = append(lines, retroBottomLine(later.record, later.rates)...)
	lines = append(lines, retroEffectLines(later.effect)...)
	lines = append(lines, retroListOf("Promotions", promotions, []string{"what", "from", "to"}, "No promotion stands.")...)
	lines = append(lines, retroListOf("New checklist items", checklist, []string{"item", "why"}, "The checklist takes no new item.")...)
	lines = append(lines, retroListOf("Limits", limits, []string{"what", "why"}, "The retro names no limit.")...)
	lines = append(lines, retroDrainedLines(later.record)...)
	lines = append(lines, retroMatrixLines(columns)...)
	lines = append(lines, retroDetailsLines(columns, later.record)...)
	lines = append(lines, "")
	return strings.Join(lines, "\n")
}

// A section holding one table, or its line for none. [[spec/guidance/retro/classify]]
func retroListOf(title string, list []any, fields []string, none string) []string {
	out := []string{"## " + title, ""}
	if len(list) == 0 {
		return append(out, none, "")
	}
	dashes := []string{}
	for range fields {
		dashes = append(dashes, "---")
	}
	out = append(out, "| "+strings.Join(fields, " | ")+" |", "|"+strings.Join(dashes, "|")+"|")
	for _, one := range list {
		cells := []string{}
		for _, field := range fields {
			cells = append(cells, retroJSOr(retroJSField(one, field)))
		}
		out = append(out, "| "+strings.Join(cells, " | ")+" |")
	}
	return append(out, "")
}

// Where every collected note and memory goes. [[spec/guidance/retro/classify]]
func retroDrainedLines(record *retroRecord) []string {
	out := []string{"## Notes and memory", ""}
	type drained struct {
		id   string
		said any
	}
	list := []drained{}
	if record != nil {
		for _, id := range record.dispositions.order() {
			if retroDrainedID.MatchString(id) {
				list = append(list, drained{id: id, said: record.dispositions.get(id)})
			}
		}
	}
	if len(list) == 0 {
		return append(out, "No note or memory carries a disposition yet.", "")
	}
	sort.SliceStable(list, func(i, j int) bool {
		return retroJSLess(list[i].id+","+retroJSOr(list[i].said), list[j].id+","+retroJSOr(list[j].said))
	})
	out = append(out, "| item | goes |", "|---|---|")
	for _, one := range list {
		out = append(out, fmt.Sprintf("| %s | %s |", one.id, retroJSText(one.said)))
	}
	return append(out, "")
}

// The class fixes, a table per category, each ranked by its rate. [[spec/guidance/retro/classify]]
func retroBottomLine(record *retroRecord, rates *retroRates) []string {
	out := []string{"## Bottom line", ""}
	if record == nil || rates == nil {
		return append(out, "The classify step stands open.", "")
	}
	held := func(id any) int {
		count := 0
		for _, key := range record.dispositions.order() {
			if retroJSSame(record.dispositions.get(key), id) {
				count++
			}
		}
		return count
	}
	rate := func(one any) float64 { return rates.Classes[retroJSText(retroJSField(one, "id"))].Rate }
	for _, category := range retroCategories {
		mine := []any{}
		for _, one := range record.classes {
			if retroJSSame(retroJSField(one, "category"), category) {
				mine = append(mine, one)
			}
		}
		if len(mine) == 0 {
			continue
		}
		sort.SliceStable(mine, func(i, j int) bool { return rate(mine[i]) > rate(mine[j]) })
		out = append(out,
			"### "+category,
			"",
			"| class | defect | fix | rate an hour | stands | tickets | findings |",
			"|---|---|---|---|---|---|---|",
		)
		for _, one := range mine {
			tickets := retroEmptyCell
			if said := retroJSField(one, "tickets"); !retroJSNullish(said) && retroJSJoin(said, ", ") != "" {
				tickets = retroJSJoin(said, ", ")
			}
			status := retroJSTrim(retroJSOr(retroJSField(one, "status")))
			if status == "" {
				status = "the check step stands open"
			}
			id := retroJSField(one, "id")
			out = append(out, fmt.Sprintf("| %s · %s | %s | %s | %s | %s | %s | %d |",
				retroJSText(id), retroJSText(retroJSField(one, "class")), retroJSText(retroJSField(one, "defect")),
				retroJSText(retroJSField(one, "fix")), retroJSNumber(rate(one)), status, tickets, held(id)))
		}
		out = append(out, "")
	}
	return append(out, fmt.Sprintf("Rates count pattern matches per active hour, over %d active hour(s).", rates.Hours), "")
}

// The last retro's classes, counted again here. [[spec/guidance/retro/effect]]
func retroEffectLines(effect *retroEffectRecord) []string {
	out := []string{"## Effect of the last retro", ""}
	if effect == nil || len(effect.Classes) == 0 {
		var battery *retroBatteryRecord
		if effect != nil {
			battery = effect.Battery
		}
		out = append(out, "No earlier retro holds class fixes.", "")
		return append(out, retroBatteryLines(battery)...)
	}
	out = append(out, "Measured against "+effect.Last+".", "", "| class | fix | before | now | verdict |", "|---|---|---|---|---|")
	for _, one := range effect.Classes {
		out = append(out, fmt.Sprintf("| %s · %s | %s | %s | %s | %s |",
			one.ID, one.Class, one.Fix, retroJSNumber(one.Before.Rate), retroJSNumber(one.Now.Rate), one.Verdict))
	}
	out = append(out, "")
	return append(out, retroBatteryLines(effect.Battery)...)
}

// A case as the report names it: its file and its name, or its name alone. [[spec/guidance/retro/effect]]
func retroCaseNamed(file, name string) string {
	if file != "" {
		return file + " · " + name
	}
	return name
}

// A titled list of items, or nothing where it holds none. [[spec/guidance/retro/effect]]
func retroBatteryRows(title string, items []string) []string {
	if len(items) == 0 {
		return nil
	}
	out := []string{"", title + ":", ""}
	for _, one := range items {
		out = append(out, "- "+one)
	}
	return out
}

// The battery's report against the last retro's: each part's time, and the cases new, grown and gone. [[spec/guidance/retro/effect]]
func retroBatteryLines(battery *retroBatteryRecord) []string {
	if battery == nil {
		return nil
	}
	number := retroJSNumber
	out := []string{
		"### The battery",
		"",
		fmt.Sprintf("%s ms at the last retro, %s ms at this one.", number(battery.Total.Before), number(battery.Total.Now)),
		"",
		"| part | before | now | delta |",
		"|---|---|---|---|",
	}
	for _, one := range battery.Parts {
		out = append(out, fmt.Sprintf("| %s | %s | %s | %s |", one.Part, number(one.Before), number(one.Now), number(one.Delta)))
	}
	fresh, grown, gone, red := []string{}, []string{}, []string{}, []string{}
	for _, one := range battery.Fresh {
		fresh = append(fresh, fmt.Sprintf("%s (%s ms)", retroCaseNamed(one.File, one.Name), number(one.Ms)))
	}
	for _, one := range battery.Grown {
		before := "undefined"
		if one.Before != nil {
			before = number(*one.Before)
		}
		grown = append(grown, fmt.Sprintf("%s (%s to %s ms)", retroCaseNamed(one.File, one.Name), before, number(one.Ms)))
	}
	for _, one := range battery.Gone {
		gone = append(gone, fmt.Sprintf("%s (%s ms)", retroCaseNamed(one.File, one.Name), number(one.Ms)))
	}
	for _, one := range battery.Red {
		red = append(red, fmt.Sprintf("%s: %s", retroCaseNamed(one.File, one.Name), one.Said))
	}
	out = append(out, retroBatteryRows("New among the slowest", fresh)...)
	out = append(out, retroBatteryRows("Grown", grown)...)
	out = append(out, retroBatteryRows("Gone from the slowest", gone)...)
	out = append(out, retroSpawnsLines(battery.Spawns)...)
	out = append(out, retroFilesLines(battery.Files)...)
	out = append(out, retroBatteryRows("Parts left unrun", battery.Unrun)...)
	out = append(out, retroBatteryRows("Red, in the case's own words", red)...)
	return append(out, "")
}

// The spawns a run made, and how many of them are Vale, beside the last retro's. [[spec/guidance/retro/effect]]
func retroSpawnsLines(spawns *retroSpawns) []string {
	if spawns == nil {
		return nil
	}
	said := func(one *retroTally) string {
		if one == nil {
			return "no tally"
		}
		return fmt.Sprintf("%s spawns, %s of them Vale", retroJSNumber(one.All), retroJSNumber(one.Vale))
	}
	return []string{"", fmt.Sprintf("Spawns: %s, against %s at the last retro.", said(spawns.Now), said(spawns.Before))}
}

// A time a test file, the slowest first, beside the last retro's. [[spec/guidance/retro/effect]]
func retroFilesLines(files []retroBatteryFile) []string {
	if len(files) == 0 {
		return nil
	}
	out := []string{"", "| file | before | now |", "|---|---|---|"}
	for _, one := range files {
		out = append(out, fmt.Sprintf("| %s | %s | %s |", one.Name, retroJSNumber(one.Before), retroJSNumber(one.Now)))
	}
	return out
}

// The table of references: a row per question and improvement, a column per chapter. [[spec/guidance/retro/read]]
func retroMatrixLines(columns []retroColumn) []string {
	heads, dashes := []string{}, []string{}
	for _, one := range columns {
		heads = append(heads, one.id+" · "+one.title)
		dashes = append(dashes, "---")
	}
	out := []string{"## The matrix", "", "| | " + strings.Join(heads, " | ") + " |", "|---|" + strings.Join(dashes, "|") + "|"}
	for _, row := range retroRows {
		cells := []string{}
		for _, column := range columns {
			items := column.findings[row]
			if len(items) == 0 {
				cells = append(cells, retroEmptyCell)
				continue
			}
			ids := []string{}
			for at := range items {
				ids = append(ids, retroIdOf(column.id, row, at))
			}
			cells = append(cells, strings.Join(ids, ", "))
		}
		out = append(out, "| "+row+" | "+strings.Join(cells, " | ")+" |")
	}
	return append(out, "")
}

// Every finding in full, each with where it goes. [[spec/guidance/retro/classify]]
func retroDetailsLines(columns []retroColumn, record *retroRecord) []string {
	out := []string{"## Details"}
	for _, column := range columns {
		out = append(out, "", "### "+column.id+" · "+column.title)
		for _, row := range retroRows {
			for at, item := range column.findings[row] {
				id := retroIdOf(column.id, row, at)
				goes := ""
				if record != nil {
					if said := record.dispositions.get(id); retroJSTruthy(said) {
						goes = " → " + retroJSText(said)
					}
				}
				out = append(out, "- `"+id+"` "+item+goes)
			}
		}
	}
	return out
}
