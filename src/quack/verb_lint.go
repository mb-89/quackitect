// The lint verb: the rules over the tree, or over the paths named. The Go
// tools the lsp module runs read Vale, Biome and the code faults, the check
// module's sweep adds its rules, and the box answers the survey rule.
// [[spec/tickets/read-verbs-port-to-go]]
package main

import (
	"encoding/json"
	"fmt"
	"io"
	"path"
	"path/filepath"
	"slices"
	"sort"
	"strings"
	"time"

	"quackitect/src/index"
	"quackitect/src/modules/check"
	logmodule "quackitect/src/modules/log"
	"quackitect/src/modules/lsp"
)

// The path naming the whole tree, the rule the box decides in place of the sweep, the rows the warn row names, the width of a count, and the log row's kind, as cli-read.js named them. [[spec/design_output/lsp#the-lint-ends-on-findings]]
const (
	lintWhole   = "."
	lintBox     = "SurveyFindsNode"
	lintShown   = 3
	lintWidth   = 6
	lintKind    = "vale"
	logFloorKey = "log.level"
)

// What the lint reads: the root, the tools over the paths named, the check module's sweep, the box's survey rule, the session log and the clock. [[spec/tickets/read-verbs-port-to-go]]
type lintDoors struct {
	root  string
	tools func(where []string) []check.Finding
	sweep func() ([]check.Finding, error)
	box   func() []check.Finding
	log   func(row map[string]any) error
	now   func() time.Time
	disk  diskDoors
}

func init() { register("lint", lintVerb(lintHere)) }

// The doors over the tree's own root: the lsp module's tools, the index's sweep and the survey on this box. [[spec/tickets/read-verbs-port-to-go]]
func lintHere() (lintDoors, error) {
	root, err := index.Root()
	if err != nil {
		return lintDoors{}, err
	}
	hand := quietBox()
	return lintDoors{
		root:  root,
		tools: func(where []string) []check.Finding { return toolsOver(hand, root, where) },
		sweep: func() ([]check.Finding, error) { return sweepRows(askIndex) },
		box:   func() []check.Finding { return check.SurveyFindsNode(lintTree(hand, root)) },
		log:   keepsFloor(sliceMode(root, logFloorKey), appendsRow(hand.disk, root, wall.Now)),
		now:   wall.Now,
		disk:  hand.disk,
	}, nil
}

// The writer past the floor the box writes at, so a row below it lands nowhere, as the log door drops it. Rank reads an empty floor as info. [[spec/design_output/log#which-kind-says-what]]
func keepsFloor(floor string, write func(row map[string]any) error) func(row map[string]any) error {
	return func(row map[string]any) error {
		level, _ := row["level"].(string)
		if logmodule.Rank(level) < logmodule.Rank(floor) {
			return nil
		}
		return write(row)
	}
}

// The lint over the doors: the count a rule first and the finding lines last, a warning exiting 0 and a finding at error exiting 1. [[spec/design_output/lsp#the-lint-ends-on-findings]]
func lintVerb(doors func() (lintDoors, error)) twin {
	return func(argv []string, _ bool, out, errs io.Writer) int {
		d, err := doors()
		if err != nil {
			fmt.Fprintln(errs, err)
			return exitFailed
		}
		where := whereOf(argv[1:])
		began := d.now()
		found, fault := lintReading(d, where)
		if fault != "" {
			fmt.Fprintln(errs, fault)
			return exitFailed
		}
		ms := d.now().Sub(began).Milliseconds()
		// The rules passing is the expected road, so the row stands at debug and the floor hides it. [[spec/design_output/log#which-kind-says-what]]
		if len(found) == 0 {
			lintSays(d, errs, map[string]any{"level": "debug", "kind": lintKind, "said": "the rules pass over " + strings.Join(where, " "), "ms": ms})
			fmt.Fprintln(out, "The rules pass.")
			return 0
		}
		lintSays(d, errs, map[string]any{
			"level": "warn", "kind": lintKind, "said": fmt.Sprintf("%d line(s) break a rule", len(found)), "ms": ms,
			"detail": cutRunes(shownOf(found), logDetailCap),
		})
		refused := 0
		for _, one := range found {
			if one.Severity != check.SeverityWarning {
				refused++
			}
		}
		for _, row := range lintRows(found, refused) {
			fmt.Fprintln(out, row)
		}
		// A warning turns nothing red, because the doors let it land and the push waits on the panel. [[spec/design_output/config#the-engine-controls]]
		if refused > 0 {
			return exitFailed
		}
		return 0
	}
}

// The paths the words name, and the whole tree where they name none. [[spec/design_output/tree#the-tree-handed-in]]
func whereOf(words []string) []string {
	out := []string{}
	for _, one := range words {
		if !strings.HasPrefix(one, "-") {
			out = append(out, one)
		}
	}
	if len(out) == 0 {
		return []string{lintWhole}
	}
	return out
}

// Every finding over the paths the disk holds, past every closed ticket, and the fault that stops the reading. [[spec/design_output/lsp#one-checker-every-front-asks]]
func lintReading(d lintDoors, asked []string) ([]check.Finding, string) {
	where := []string{}
	for _, one := range asked {
		// A path the disk no longer holds carries no finding, so no source reads it. [[spec/design_output/level0#a-crash-writes-its-error]]
		if one == lintWhole || d.disk.stands(filepath.Join(d.root, filepath.FromSlash(one))) {
			where = append(where, one)
		}
	}
	if len(where) == 0 {
		return nil, ""
	}
	found := []check.Finding{}
	for _, one := range d.tools(where) {
		if one.Rule == lsp.ValeRuns {
			return nil, one.Message + "\nVale read no file, so every rule it holds stands unchecked."
		}
		found = append(found, one)
	}
	swept, err := d.sweep()
	if err != nil {
		return nil, "quack answers no check sweep, so every rule the check module holds stands unchecked. Run ./RUNME.sh, which builds the index.\n" + err.Error()
	}
	// The survey stands on this box alone, and the sweep reads the tracked files, so the rule reads the box here in place of the sweep. [[spec/tickets/the-lsp-server-leaves]]
	for _, one := range rowsUnder(swept, where) {
		if one.Rule != lintBox {
			found = append(found, one)
		}
	}
	found = append(found, rowsUnder(d.box(), where)...)
	return check.PastHistory(check.TreeOver(d.root, rootDisk{d.root}), found), ""
}

// The rows standing on a path asked or under a folder asked, and every row where the whole tree is asked. [[spec/tickets/the-lsp-server-leaves]]
func rowsUnder(rows []check.Finding, where []string) []check.Finding {
	if slices.Contains(where, lintWhole) {
		return rows
	}
	out := []check.Finding{}
	for _, row := range rows {
		for _, at := range where {
			if under(row.File, at) {
				out = append(out, row)
				break
			}
		}
	}
	return out
}

// Whether the file is the path, or stands under it. [[spec/tickets/the-lsp-server-leaves]]
func under(file, at string) bool {
	folder := path.Clean(filepath.ToSlash(at))
	file = filepath.ToSlash(file)
	return file == folder || strings.HasPrefix(file, folder+"/")
}

// The first rows as the warn row names them. [[spec/design_output/log#which-kind-says-what]]
func shownOf(found []check.Finding) string {
	shown := []string{}
	for _, one := range found[:min(lintShown, len(found))] {
		shown = append(shown, fmt.Sprintf("%s:%d %s", one.File, one.Line, one.Rule))
	}
	return strings.Join(shown, ", ")
}

// Appends the lint's row to the session log, and says the fault where the log takes none. [[spec/design_output/log#which-kind-says-what]]
func lintSays(d lintDoors, errs io.Writer, row map[string]any) {
	if err := d.log(row); err != nil {
		fmt.Fprintln(errs, err)
	}
}

// The count reads first, and the finding lines stand last, where the reader's eye lands. [[spec/design_output/lsp#the-lint-ends-on-findings]]
func lintRows(found []check.Finding, refused int) []string {
	per, order := map[string]int{}, []string{}
	for _, one := range found {
		if per[one.Rule] == 0 {
			order = append(order, one.Rule)
		}
		per[one.Rule]++
	}
	sort.SliceStable(order, func(a, b int) bool { return per[order[a]] > per[order[b]] })
	out := []string{}
	for _, rule := range order {
		out = append(out, fmt.Sprintf("%*d  %s", lintWidth, per[rule], rule))
	}
	out = append(out, fmt.Sprintf("%*d  in all", lintWidth, len(found)))
	// [[spec/design_output/schema#warning-now-and-error-later]]
	if refused == 0 {
		out = append(out, "", fmt.Sprintf("%d stand at warning. They stand in the Problems panel, and the push waits until the panel stands clear.", len(found)))
	}
	out = append(out, "")
	for _, one := range found {
		out = append(out, fmt.Sprintf("%s:%d:%d: %s: %s", one.File, one.Line, one.Column, one.Rule, one.Message))
	}
	return out
}

// The lsp module's tools over the paths named: the whole tree's sweep where the tree is asked, and the files under each path otherwise. [[spec/design_output/lsp#one-checker-every-front-asks]]
func toolsOver(hand boxDoors, root string, where []string) []check.Finding {
	tree := lintTree(hand, root)
	tools := lsp.ToolsAt(wall, root, lspChecks(root))
	defer tools.Halt()
	var said []lsp.Finding
	if slices.Contains(where, lintWhole) {
		said = tools.Sweep(tree)
	} else {
		said = tools.Over(tree, filesUnder(hand.disk, tree, root, where))
	}
	out := make([]check.Finding, 0, len(said))
	for _, one := range said {
		out = append(out, check.Finding(one))
	}
	return out
}

// Each file the paths name: a file itself, and every file the tree holds under a folder. [[spec/design_output/tree#the-tree-handed-in]]
func filesUnder(disk diskDoors, tree *check.Tree, root string, where []string) []string {
	out := []string{}
	add := func(file string) {
		if !slices.Contains(out, file) {
			out = append(out, file)
		}
	}
	for _, at := range where {
		if disk.standsFile(filepath.Join(root, filepath.FromSlash(at))) {
			add(path.Clean(filepath.ToSlash(at)))
			continue
		}
		for _, file := range tree.Paths() {
			if under(file, at) {
				add(file)
			}
		}
	}
	return out
}

// The tree on the disk under the root, its paths the files git lists, and the survey this box wrote. [[spec/design_output/tree#the-tree-handed-in]]
func lintTree(hand boxDoors, root string) *check.Tree {
	tree := check.TreeOver(root, listedDisk{rootDisk{root}, hand.run})
	if said, err := hand.disk.read(filepath.Join(root, filepath.FromSlash(check.ToolsAt))); err == nil {
		tree.Survey = string(said)
	}
	return tree
}

// The disk under the root, whose paths are the files git tracks and the ones it leaves unignored. [[spec/design_output/tree#the-tree-handed-in]]
type listedDisk struct {
	rootDisk
	run func(argv []string, o runOpts) ranResult
}

func (one listedDisk) Paths() []string {
	said := one.run([]string{"git", "-C", one.root, "ls-files", "-z", "--cached", "--others", "--exclude-standard"}, runOpts{})
	if said.code != 0 || said.fault != "" {
		return nil
	}
	out, seen := []string{}, map[string]bool{}
	for _, file := range strings.Split(said.stdout, "\x00") {
		if file != "" && !seen[file] && one.Exists(file) {
			seen[file] = true
			out = append(out, file)
		}
	}
	return out
}

// The check module's sweep off the index, settled. [[spec/tickets/the-lsp-server-leaves]]
func sweepRows(ask asker) ([]check.Finding, error) {
	said, err := ask("value", sweepName)
	if err != nil {
		return nil, err
	}
	out := []check.Finding{}
	if said == nil {
		return out, nil
	}
	text, err := json.Marshal(said)
	if err != nil {
		return nil, err
	}
	return out, json.Unmarshal(text, &out)
}
