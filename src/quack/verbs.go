// quack verb: the road ./RUNME.sh hands every verb down. The verbs slice's
// mode picks the verb's program, a Go twin, or both with a shadow row where
// they differ. [[spec/tickets/cli-js-leaves]]
package main

import (
	"encoding/json"
	"fmt"
	"io"
	"path/filepath"
	"strings"
	"time"

	"quackitect/src/index"
	"quackitect/src/modules/migration"
	verbsmodule "quackitect/src/modules/verbs"
)

// The argument count below which quack verb names no scripts folder, the slice's dotted key, its modes, the log row's kind and slice, the stamp the session log writes, and the longest answer a row carries. [[spec/tickets/runme-hands-verbs-to-quack]]
const (
	verbArgs    = 2
	verbsKey    = "migration." + migration.VerbsKey
	modeShadow  = "shadow"
	modeNew     = "new"
	shadowKind  = "shadow"
	verbsSlice  = migration.VerbsKey
	logStamp    = "2006-01-02T15:04:05.000Z"
	answerCap   = 2000
	twinWordsAt = 3
)

// Where a verb goes: to its program, to quack, or to both with the old answer standing. [[spec/tickets/runme-hands-verbs-to-quack]]
type road int

const (
	toNode road = iota
	toQuack
	toBoth
)

// A Go answer to a verb a program answers too, which writes nothing where dry holds. [[spec/tickets/runme-hands-verbs-to-quack]]
type twin func(argv []string, dry bool, out, errs io.Writer) int

// What the road reaches: the mode, the verb's program writing its standard output into out, a verb quack answers alone, the twins, the session log and the caller's streams. [[spec/tickets/runme-hands-verbs-to-quack]]
type verbDoors struct {
	mode      string
	old       func(out io.Writer) int
	alone     func(argv []string) int
	twins     map[string]twin
	log       func(row map[string]any) error
	out, errs io.Writer
}

// The verbs a program answers under the same word, which keep its road. [[spec/tickets/quack-tools-spares-runme-tools]]
var programKeeps = map[string]bool{"help": true, "act": true}

// Whether quack answers the verb alone: a verb of the table past the ones a program keeps. [[spec/tickets/quack-alone-verbs-skip-mode]]
func aloneOf(argv []string, table map[string]bool) bool {
	return len(argv) > 0 && table[argv[0]] && !programKeeps[argv[0]] && !strings.HasPrefix(argv[0], "-")
}

// The twin the verb's words name, the most words first, and its key. [[spec/tickets/runme-hands-verbs-to-quack]]
func twinOf(argv []string, twins map[string]twin) (string, twin) {
	for words := min(len(argv), twinWordsAt); words > 0; words-- {
		key := strings.Join(argv[:words], " ")
		if one, ok := twins[key]; ok {
			return key, one
		}
	}
	return "", nil
}

// The road a verb takes under the mode: a verb Go registers whole takes quack under every mode, a twin of a verb's words runs beside the program in shadow and alone under new, ahead of quack's own verb of the same word, and a verb quack answers alone takes quack under every mode. [[spec/tickets/runme-hands-verbs-to-quack]] [[spec/tickets/box-verbs-port-to-go]] [[spec/tickets/registered-verb-skips-the-mode]]
func roadOf(mode string, argv []string, twins map[string]twin) road {
	if wholeOf(argv, twins) {
		return toQuack
	}
	if _, one := twinOf(argv, twins); one != nil {
		switch mode {
		case modeShadow:
			return toBoth
		case modeNew:
			return toQuack
		}
		return toNode
	}
	if aloneOf(argv, cliVerbs) {
		return toQuack
	}
	return toNode
}

// Whether Go registers the verb whole, under its one word, so no program stands beside it and no mode sends it to one. [[spec/tickets/registered-verb-skips-the-mode]]
func wholeOf(argv []string, twins map[string]twin) bool {
	return len(argv) > 0 && twins[argv[0]] != nil
}

// Runs the verb on its road, and answers the exit code the caller reads. In shadow the old answer stands, and the twin runs dry beside it. [[spec/tickets/runme-hands-verbs-to-quack]]
func verbs(d verbDoors, argv []string) int {
	key, one := twinOf(argv, d.twins)
	switch roadOf(d.mode, argv, d.twins) {
	case toQuack:
		if one == nil {
			return d.alone(argv)
		}
		return one(argv, false, d.out, d.errs)
	case toBoth:
		var old, now strings.Builder
		code := d.old(io.MultiWriter(d.out, &old))
		nowCode := one(argv, true, &now, io.Discard)
		if old.String() != now.String() || code != nowCode {
			row := map[string]any{
				"level": "info", "kind": shadowKind, "slice": verbsSlice, "verb": key,
				"said": fmt.Sprintf("%s in shadow: %s answers apart from its program", verbsSlice, key),
				"old":  capped(old.String()), "new": capped(now.String()), "oldExit": code, "newExit": nowCode,
			}
			if err := d.log(row); err != nil {
				fmt.Fprintln(d.errs, err)
			}
		}
		return code
	}
	return d.old(d.out)
}

// The width the usage pads a verb's name to. [[spec/tickets/cli-js-leaves]]
const usageColumn = 8

// The usage quack prints for help and for a verb it knows nowhere, off the one table. [[spec/tickets/cli-js-leaves]]
func usageText() string {
	var said strings.Builder
	said.WriteString("Usage: ./RUNME.sh <verb> [path ...]\n\n")
	for _, one := range verbsmodule.Commands {
		fmt.Fprintf(&said, "  %-*s %s\n", usageColumn, one.Name, one.Doc)
	}
	return said.String()
}

// The usage door, which stands where the program door stood: the usage where the words past any flag name help or nothing, and a refusal naming a word Go registers nowhere. [[spec/tickets/program-of-drops-node]]
func usageDoor(argv []string, errs io.Writer) func(out io.Writer) int {
	return func(out io.Writer) int {
		at := 0
		for at < len(argv) && strings.HasPrefix(argv[at], "-") {
			at++
		}
		if at == len(argv) || argv[at] == "help" {
			fmt.Fprint(out, usageText())
			return 0
		}
		fmt.Fprintf(errs, "se: there is no verb called %s\n\n", argv[at])
		fmt.Fprint(out, usageText())
		return exitUsage
	}
}

func capped(text string) string {
	if len(text) <= answerCap {
		return text
	}
	return text[:answerCap]
}

// The verbs slice's mode off the config under the root, old where nothing answers it. [[spec/tickets/runme-hands-verbs-to-quack]]
func modeOf(disk diskDoors, root string) string { return sliceMode(disk, root, verbsKey) }

// A slice's mode off the config under the root, by its dotted key, and empty where nothing answers it. [[spec/tickets/the-doors-process-stands]]
func sliceMode(disk diskDoors, root, key string) string {
	rows, err := configOn(disk, root)
	if err != nil {
		return ""
	}
	var mode string
	if json.Unmarshal(rows[key].Value, &mode) != nil {
		return ""
	}
	return mode
}

// Appends one row to the session log under the root, stamped as the log writes its rows. [[spec/design_output/log#what-one-line-looks-like]]
func appendsRow(disk diskDoors, root string, now func() time.Time) func(row map[string]any) error {
	return func(row map[string]any) error {
		row["at"] = now().UTC().Format(logStamp)
		line, err := json.Marshal(row)
		if err != nil {
			return err
		}
		return appendsLine(disk, filepath.Join(root, filepath.FromSlash(sessionLog)), string(line))
	}
}

// The road over the real doors: the usage door, the tree over V1, the registered verbs and the session log under the root. [[spec/tickets/quack-registers-each-verb]] [[spec/tickets/program-of-drops-node]]
func verbRoad(argv []string, out, errs io.Writer) int {
	root, err := index.Root()
	if err != nil {
		root = "."
	}
	return verbs(verbDoors{
		mode:  modeOf(realDisk(), root),
		old:   usageDoor(argv, errs),
		alone: func(argv []string) int { return routes(out, errs, reachV1, argv) },
		twins: registry,
		log:   appendsRow(realDisk(), root, wall.Now),
		out:   out,
		errs:  errs,
	}, argv)
}
