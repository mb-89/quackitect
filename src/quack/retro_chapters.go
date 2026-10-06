// The retro's chapters: the cuts a hand writes, checked for a gap and an
// overlap, and every timed line of the input handed to the chapter it falls in.
// [[spec/guidance/retro/chapter]]
package main

import (
	"fmt"
	"io"
	"math"
	"path/filepath"
	"strings"
)

// The cuts a hand writes, and the folder each chapter's lines land in. [[spec/guidance/retro/chapter]]
const (
	retroCutsFile       = "chapters.json"
	retroChaptersFolder = "chapters"
)

// One cut: its id, its title, and the times it opens and closes at. [[spec/guidance/retro/chapter]]
type retroCut struct {
	id    string
	title string
	from  float64
	to    float64
}

// One chapter's lines: the files in the order they arrive, the ranges of each, and their count. [[spec/guidance/retro/chapter]]
type retroHeld struct {
	paths  []string
	ranges map[string][][2]int
	count  int
}

func init() { register("retro chapters", retroChaptersVerb(retroBox)) }

// The cuts, read and checked: a start before an end, and each chapter opening where the one before closes. [[spec/guidance/retro/chapter]]
func retroCutsOf(text string) ([]retroCut, []string) {
	read, ok := retroJSParse(text)
	if !ok {
		return []retroCut{}, []string{retroCutsFile + " reads as no JSON"}
	}
	cuts := []retroCut{}
	for _, one := range retroJSList(read) {
		cuts = append(cuts, retroCut{
			id:    retroJSOr(retroJSField(one, "id")),
			title: retroJSOr(retroJSField(one, "title")),
			from:  retroJSMillis(retroJSOr(retroJSField(one, "from"))),
			to:    retroJSMillis(retroJSOr(retroJSField(one, "to"))),
		})
	}
	faults := []string{}
	if len(cuts) == 0 {
		faults = append(faults, retroCutsFile+" names no chapter")
	}
	for at, one := range cuts {
		if one.id == "" || one.title == "" {
			faults = append(faults, fmt.Sprintf("chapter %d carries no id or no title", at+1))
		}
		if !(one.from < one.to) {
			faults = append(faults, one.id+" ends before it starts")
		}
		if at+1 < len(cuts) && cuts[at+1].from != one.to {
			faults = append(faults, fmt.Sprintf("%s ends apart from where %s starts: a gap or an overlap", one.id, cuts[at+1].id))
		}
	}
	return cuts, faults
}

// Every timed line placed in its chapter, as line ranges per file, and the count of lines no chapter holds. [[spec/guidance/retro/chapter]]
func retroPlaced(cuts []retroCut, files []retroTimedFile) (map[string]*retroHeld, int) {
	held := map[string]*retroHeld{}
	for _, one := range cuts {
		held[one.id] = &retroHeld{ranges: map[string][][2]int{}}
	}
	outside := 0
	for _, file := range files {
		for at, when := range file.times {
			if math.IsNaN(when) {
				continue
			}
			var cut *retroCut
			for place := range cuts {
				if when >= cuts[place].from && when < cuts[place].to {
					cut = &cuts[place]
					break
				}
			}
			if cut == nil {
				outside++
				continue
			}
			one := held[cut.id]
			ranges, ok := one.ranges[file.path]
			if !ok {
				one.paths = append(one.paths, file.path)
			}
			line := at + 1
			if n := len(ranges); n > 0 && ranges[n-1][1] == line-1 {
				ranges[n-1][1] = line
			} else {
				ranges = append(ranges, [2]int{line, line})
			}
			one.ranges[file.path] = ranges
			one.count++
		}
	}
	return held, outside
}

// The commits of a chapter's window, each as its short hash and subject. [[spec/guidance/retro/chapter]]
func retroCommitsIn(run func(argv []string, o runOpts) ranResult, root, from, to string) []any {
	said := run([]string{"git", "log", "--format=%h %s", "--since=" + from, "--until=" + to}, runOpts{cwd: root}).stdout
	out := []any{}
	for _, line := range strings.Split(retroJSTrim(said), "\n") {
		if line != "" {
			out = append(out, line)
		}
	}
	return out
}

// The verb: refuses a gap, an overlap or a line past every chapter, and writes each chapter's lines. [[spec/guidance/retro/chapter]]
func retroChaptersVerb(box func() boxDoors) twin {
	return func(argv []string, _ bool, out, errs io.Writer) int {
		d := box()
		disk := d.disk
		base, name := retroRootOf(d), retroWordAt(argv, 2)
		home, at := "", ""
		if name != "" {
			home = retroHome(base, name)
			at = filepath.Join(home, retroCutsFile)
		}
		if at == "" || !disk.stands(at) {
			fmt.Fprintf(errs, "retro chapters reads %s in the retro's folder, and none stands.\n", retroCutsFile)
			fmt.Fprintln(errs, "Run ./RUNME.sh retro timeline <retro>, cut the window, and write the cuts there.")
			return 2
		}
		cuts, faults := retroCutsOf(disk.text(at))
		held, outside := map[string]*retroHeld{}, 0
		if len(faults) == 0 {
			held, outside = retroPlaced(cuts, retroTimedFiles(disk, base, name))
		}
		if outside > 0 {
			faults = append(faults, fmt.Sprintf("%d timed line(s) fall past every chapter", outside))
		}
		if len(faults) > 0 {
			for _, one := range faults {
				fmt.Fprintln(errs, one)
			}
			return 1
		}
		if err := disk.makeAll(filepath.Join(home, retroChaptersFolder), 0o777); err != nil {
			fmt.Fprintln(errs, err)
			return 1
		}
		for _, one := range cuts {
			said := held[one.id]
			from, to := retroJSISO(one.from), retroJSISO(one.to)
			lines := retroJSObject()
			for _, path := range said.paths {
				ranges := []any{}
				for _, pair := range said.ranges[path] {
					ranges = append(ranges, []any{pair[0], pair[1]})
				}
				lines.set(path, ranges)
			}
			record := retroJSObject("id", one.id, "title", one.title, "from", from, "to", to, "lines", lines, "commits", retroCommitsIn(d.run, base, from, to))
			if err := retroJSWrite(disk, filepath.Join(home, retroChaptersFolder, one.id+".json"), record); err != nil {
				fmt.Fprintln(errs, err)
				return 1
			}
			fmt.Fprintf(out, "%s  %s to %s  %d line(s)  %s\n", one.id, from, to, said.count, one.title)
		}
		return 0
	}
}
