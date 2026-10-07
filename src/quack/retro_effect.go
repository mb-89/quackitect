// The effect of the last retro: its class patterns counted again over this
// retro's input, beside the rates it measured, and the battery against its own.
// [[spec/guidance/retro/effect]]
package main

import (
	"fmt"
	"io"
	"math"
	"path/filepath"
	"sort"
)

// The effect a retro writes, and the file collect stamps its time in. [[spec/guidance/retro/effect]]
const (
	retroEffectFile      = "effect.json"
	retroEffectCollected = "collected.json"
)

// The tracked folder the mint keeps a retro's classes, rates and collect time in, so a fresh box finds them. [[spec/tickets/retro-read-reads-every-record]]
const retroKept = "spec/retros"

// A case grown past this share of its last time reads as grown, and the files the effect keeps, the slowest first. [[spec/guidance/retro/effect]]
const (
	retroBatteryGrown   = 0.5
	retroBatterySlowest = 10
)

// One of the slowest cases: its file, its name, its time, and its time at the last retro where it grew. [[spec/guidance/retro/effect]]
type retroCase struct {
	File   string   `json:"file,omitempty"`
	Name   string   `json:"name"`
	Ms     float64  `json:"ms"`
	Before *float64 `json:"before,omitempty"`
}

// The battery's span at the last retro and at this one. [[spec/guidance/retro/effect]]
type retroBatteryTotal struct {
	Before float64 `json:"before"`
	Now    float64 `json:"now"`
}

// One part's time at the last retro and at this one. [[spec/guidance/retro/effect]]
type retroBatteryPart struct {
	Part   string  `json:"part"`
	Before float64 `json:"before"`
	Now    float64 `json:"now"`
	Delta  float64 `json:"delta"`
}

// One test file's time at the last retro and at this one. [[spec/guidance/retro/effect]]
type retroBatteryFile struct {
	Name   string  `json:"name"`
	Before float64 `json:"before"`
	Now    float64 `json:"now"`
}

// A red case in its own words. [[spec/guidance/retro/effect]]
type retroRed struct {
	File string `json:"file"`
	Name string `json:"name"`
	Said string `json:"said"`
}

// The spawns a run made, and how many of them are Vale. [[spec/guidance/retro/effect]]
type retroTally struct {
	All  float64 `json:"all"`
	Vale float64 `json:"vale"`
}

// The spawns at the last retro and at this one. [[spec/guidance/retro/effect]]
type retroSpawns struct {
	Before *retroTally `json:"before"`
	Now    *retroTally `json:"now"`
}

// This retro's battery against the last retro's. [[spec/guidance/retro/effect]]
type retroBatteryRecord struct {
	Last     string             `json:"last"`
	Baseline bool               `json:"baseline,omitempty"`
	Total    retroBatteryTotal  `json:"total"`
	Parts    []retroBatteryPart `json:"parts"`
	Fresh    []retroCase        `json:"fresh"`
	Grown    []retroCase        `json:"grown"`
	Gone     []retroCase        `json:"gone"`
	Files    []retroBatteryFile `json:"files"`
	Unrun    []string           `json:"unrun"`
	Red      []retroRed         `json:"red"`
	Spawns   *retroSpawns       `json:"spawns"`
	Slowest  []retroCase        `json:"slowest"`
}

// One class of the last retro, counted again here. [[spec/guidance/retro/effect]]
type retroEffectRow struct {
	ID      string    `json:"id"`
	Class   string    `json:"class"`
	Fix     string    `json:"fix"`
	Tickets []string  `json:"tickets"`
	Before  retroRate `json:"before"`
	Now     retroRate `json:"now"`
	Verdict string    `json:"verdict"`
}

// The effect a retro writes: the last retro, its classes counted again, and the battery. [[spec/guidance/retro/effect]]
type retroEffectRecord struct {
	Last    string              `json:"last"`
	Classes []retroEffectRow    `json:"classes"`
	Battery *retroBatteryRecord `json:"battery"`
}

// An ordered map of cases by key, as a JavaScript Map holds them. [[spec/guidance/retro/effect]]
type retroCases struct {
	keys   []string
	values map[string]any
}

func init() { register("retro effect", retroEffectVerb(quietBox)) }

// A case keys on its file and its name, because two files share a name. [[spec/guidance/retro/effect]]
func retroBatteryKey(one any) string {
	if file := retroJSField(one, "file"); retroJSTruthy(file) {
		return retroJSText(file) + " " + retroJSText(retroJSField(one, "name"))
	}
	return retroJSOr(retroJSField(one, "name"))
}

// The cases of a list by key, the first place of a key kept and its last case. [[spec/guidance/retro/effect]]
func retroCasesOf(list any) retroCases {
	out := retroCases{values: map[string]any{}}
	for _, one := range retroJSList(list) {
		key := retroBatteryKey(one)
		if _, held := out.values[key]; !held {
			out.keys = append(out.keys, key)
		}
		out.values[key] = one
	}
	return out
}

// A copy of an object, as the spread {...one} makes it. [[spec/guidance/retro/effect]]
func retroJSCopy(one any) *retroJSDict {
	out := retroJSObject()
	switch value := one.(type) {
	case *retroJSDict:
		for _, key := range value.order() {
			out.set(key, value.get(key))
		}
	case []any:
		for at, item := range value {
			out.set(fmt.Sprint(at), item)
		}
	}
	return out
}

// A value, or 0 where it is null or undefined. [[spec/guidance/retro/effect]]
func retroJSOrZero(value any) any {
	if retroJSNullish(value) {
		return float64(0)
	}
	return value
}

// A value, or null where it is undefined. [[spec/guidance/retro/effect]]
func retroJSOrNull(value any) any {
	if retroJSNullish(value) {
		return nil
	}
	return value
}

// This report against the last: each part's change, the cases new, grown or gone, the files against before, and the spawns side by side. [[spec/guidance/retro/effect]]
func retroBatteryDelta(before, now any) *retroJSDict {
	partsBefore, _ := retroJSField(before, "parts").(*retroJSDict)
	partsNow, _ := retroJSField(now, "parts").(*retroJSDict)
	names, seen := []string{}, map[string]bool{}
	for _, dict := range []*retroJSDict{partsBefore, partsNow} {
		for _, key := range dict.order() {
			if !seen[key] {
				seen[key] = true
				names = append(names, key)
			}
		}
	}
	parts := []any{}
	for _, part := range names {
		was, is := retroJSOrZero(partsBefore.get(part)), retroJSOrZero(partsNow.get(part))
		parts = append(parts, retroJSObject("part", part, "before", was, "now", is, "delta", retroJSToNumber(is)-retroJSToNumber(was)))
	}
	earlier, later := retroCasesOf(retroJSField(before, "slowest")), retroCasesOf(retroJSField(now, "slowest"))
	fresh, grown, gone := []any{}, []any{}, []any{}
	for _, key := range later.keys {
		one := later.values[key]
		was, held := earlier.values[key]
		if !held {
			fresh = append(fresh, retroJSCopy(one))
			continue
		}
		if retroJSToNumber(retroJSField(one, "ms")) > retroJSToNumber(retroJSField(was, "ms"))*(1+retroBatteryGrown) {
			copied := retroJSCopy(one)
			copied.set("before", retroJSField(was, "ms"))
			grown = append(grown, copied)
		}
	}
	for _, key := range earlier.keys {
		if _, held := later.values[key]; !held {
			gone = append(gone, retroJSCopy(earlier.values[key]))
		}
	}
	was := map[string]any{}
	for _, one := range retroJSList(retroJSField(before, "files")) {
		was[retroJSKeyOf(retroJSField(one, "name"))] = retroJSField(one, "ms")
	}
	files := []any{}
	for at, one := range retroJSList(retroJSField(now, "files")) {
		if at >= retroBatterySlowest {
			break
		}
		name := retroJSField(one, "name")
		files = append(files, retroJSObject("name", name, "before", retroJSOrZero(was[retroJSKeyOf(name)]), "now", retroJSField(one, "ms")))
	}
	return retroJSObject(
		"total", retroJSObject("before", retroJSOrZero(retroJSField(before, "total")), "now", retroJSOrZero(retroJSField(now, "total"))),
		"parts", parts,
		"fresh", fresh,
		"grown", grown,
		"gone", gone,
		"files", files,
		"unrun", append([]any{}, retroJSList(retroJSField(now, "unrun"))...),
		"red", append([]any{}, retroJSList(retroJSField(now, "red"))...),
		"spawns", retroJSObject("before", retroJSOrNull(retroJSField(before, "spawns")), "now", retroJSOrNull(retroJSField(now, "spawns"))),
	)
}

// A plain value as a Map key: its type and its text. [[spec/guidance/retro/effect]]
func retroJSKeyOf(value any) string {
	return fmt.Sprintf("%T %s", value, retroJSText(value))
}

// The two batteries side by side as the JSON the verb writes, or nil where this retro holds none. A retro with no last one reads against nothing, so its battery stands as the baseline. [[spec/guidance/retro/effect]]
func retroBatteryValue(disk diskDoors, root, name, last string) *retroJSDict {
	read := func(retro string) any {
		value, ok := retroJSParse(disk.text(filepath.Join(retroHome(root, retro), retroBattery)))
		if !ok {
			return nil
		}
		return value
	}
	now := read(name)
	if !retroJSTruthy(now) {
		return nil
	}
	var before any
	if last != "" {
		before = read(last)
	}
	out := retroJSObject("last", last)
	if !retroJSTruthy(before) {
		out.set("baseline", true)
	}
	delta := retroBatteryDelta(before, now)
	for _, key := range delta.order() {
		out.set(key, delta.get(key))
	}
	slowest := retroJSField(now, "slowest")
	if retroJSNullish(slowest) {
		slowest = []any{}
	}
	out.set("slowest", slowest)
	return out
}

// A retro's file: in its private home where it stands there, and in the tracked folder otherwise. [[spec/tickets/retro-read-reads-every-record]]
func retroKeptAt(disk diskDoors, root, name, file string) string {
	if private := filepath.Join(retroHome(root, name), file); disk.stands(private) {
		return private
	}
	return filepath.Join(root, filepath.FromSlash(retroKept), name, file)
}

// The retro before this one holding class fixes, by the time its collect ran, from its private home or the tracked folder. [[spec/tickets/retro-read-reads-every-record]]
func retroLastRetro(disk diskDoors, root, name string) string {
	when := func(one string) float64 {
		read, ok := retroJSParse(disk.text(retroKeptAt(disk, root, one, retroEffectCollected)))
		if !ok {
			return 0
		}
		if at := retroJSMillis(retroJSText(retroJSField(read, "at"))); !math.IsNaN(at) {
			return at
		}
		return 0
	}
	now := when(name)
	type found struct {
		name string
		at   float64
	}
	list, seen := []found{}, map[string]bool{name: true}
	for _, folder := range []string{retroFolder, retroKept} {
		entries := disk.listed(filepath.Join(root, filepath.FromSlash(folder)))
		for _, one := range entries {
			if !one.IsDir() || seen[one.Name()] {
				continue
			}
			if !disk.stands(retroKeptAt(disk, root, one.Name(), retroClassesFile)) || !disk.stands(retroKeptAt(disk, root, one.Name(), retroRatesFile)) {
				continue
			}
			seen[one.Name()] = true
			at := when(one.Name())
			if now != 0 && !(at < now) {
				continue
			}
			list = append(list, found{name: one.Name(), at: at})
		}
	}
	sort.SliceStable(list, func(i, j int) bool { return list[i].at > list[j].at })
	if len(list) == 0 {
		return ""
	}
	return list[0].name
}

// A class's verdict: gone, falls, holds or grows. [[spec/guidance/retro/effect]]
func retroVerdictOf(before, now retroRate) string {
	if now.Count == 0 {
		return "gone"
	}
	if now.Rate < before.Rate {
		return "falls"
	}
	if now.Rate == before.Rate {
		return "holds"
	}
	return "grows"
}

// The verb: counts the last retro's classes over this input, and writes each verdict. [[spec/guidance/retro/effect]]
func retroEffectVerb(box func() boxDoors) twin {
	return func(argv []string, _ bool, out, errs io.Writer) int {
		d := box()
		disk := d.disk
		base, name := retroRootOf(d), retroWordAt(argv, 2)
		if name == "" || !disk.stands(retroHome(base, name)) {
			fmt.Fprintln(errs, "retro effect names a retro whose collect stands: ./RUNME.sh retro effect <retro>")
			return 2
		}
		home := retroHome(base, name)
		last := retroLastRetro(disk, base, name)
		battery := retroBatteryValue(disk, base, name, last)
		var written any
		if battery != nil {
			written = battery
		}
		if last == "" {
			if err := retroJSWrite(disk, filepath.Join(home, retroEffectFile), retroJSObject("last", "", "classes", []any{}, "battery", written)); err != nil {
				fmt.Fprintln(errs, err)
				return 1
			}
			fmt.Fprintln(out, "No earlier retro holds class fixes, so nothing stands to measure.")
			if battery != nil {
				fmt.Fprintf(out, "battery  baseline %s ms, which the next retro reads against\n", retroJSText(retroJSField(battery.get("total"), "now")))
			}
			return 0
		}
		record := retroRecordOf(disk.text(retroKeptAt(disk, base, last, retroClassesFile)))
		before, ok := retroJSParse(disk.text(retroKeptAt(disk, base, last, retroRatesFile)))
		if record == nil || !ok {
			fmt.Fprintf(errs, "%s of %s reads as no JSON\n", retroClassesFile+" or "+retroRatesFile, last)
			return 1
		}
		now := retroRatesOf(disk, base, name, record.classes)
		rows, said := []any{}, []string{}
		for _, one := range record.classes {
			id := retroJSField(one, "id")
			key := retroJSText(id)
			was := retroJSField(retroJSField(before, "classes"), key)
			is := now.Classes[key]
			verdict := retroVerdictOf(retroRate{Rate: retroJSToNumber(retroJSField(was, "rate"))}, is)
			tickets := retroJSField(one, "tickets")
			if retroJSNullish(tickets) {
				tickets = []any{}
			}
			rows = append(rows, retroJSObject(
				"id", id,
				"class", retroJSField(one, "class"),
				"fix", retroJSField(one, "fix"),
				"tickets", tickets,
				"before", was,
				"now", retroJSObject("count", is.Count, "rate", is.Rate),
				"verdict", verdict,
			))
			said = append(said, fmt.Sprintf("%s  %s to %s an hour  %s  %s",
				key, retroJSText(retroJSField(was, "rate")), retroJSNumber(is.Rate), verdict, retroJSText(retroJSField(one, "class"))))
		}
		if err := retroJSWrite(disk, filepath.Join(home, retroEffectFile), retroJSObject("last", last, "classes", rows, "battery", written)); err != nil {
			fmt.Fprintln(errs, err)
			return 1
		}
		for _, line := range said {
			fmt.Fprintln(out, line)
		}
		if battery != nil {
			total := battery.get("total")
			fmt.Fprintf(out, "battery  %s to %s ms  %d new, %d grown, %d gone\n",
				retroJSText(retroJSField(total, "before")), retroJSText(retroJSField(total, "now")),
				len(retroJSList(battery.get("fresh"))), len(retroJSList(battery.get("grown"))), len(retroJSList(battery.get("gone"))))
		}
		return 0
	}
}
