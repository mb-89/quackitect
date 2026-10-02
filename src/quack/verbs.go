// quack verb: the road ./RUNME.sh hands every verb down. The verbs slice's
// mode picks the verb's program, a Go twin, or both with a shadow row where
// they differ. [[spec/tickets/cli-js-leaves]]
package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"os"
	"os/exec"
	"os/signal"
	"path/filepath"
	"strings"
	"syscall"
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

// The twins each topic ports, keyed by the verb's words. [[spec/tickets/runme-hands-verbs-to-quack]]
var twinVerbs = map[string]twin{
	// [[spec/tickets/ticket-verbs-become-actions]]
	"ticket yours": ticketYours(index.V1),
	// [[spec/tickets/retro-verbs-become-actions]]
	"retro notes": retroNotes(index.V1),
	// [[spec/tickets/work-verbs-become-actions]]
	"branch list --queue": branchQueue(index.V1),
}

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
var programKeeps = map[string]bool{"help": true, "tools": true, "act": true}

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

// The road a verb takes under the mode: a verb quack answers alone takes quack under every mode, and a twin runs beside the program in shadow and alone under new. [[spec/tickets/runme-hands-verbs-to-quack]]
func roadOf(mode string, argv []string, twins map[string]twin) road {
	if aloneOf(argv, cliVerbs) {
		return toQuack
	}
	if _, one := twinOf(argv, twins); one != nil {
		switch mode {
		case modeShadow:
			return toBoth
		case modeNew:
			return toQuack
		}
	}
	return toNode
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

// The argv of a verb's program under the scripts folder: node, the program, and the words past the verb. [[spec/tickets/cli-js-leaves]]
func programOf(scripts string, argv []string) []string {
	return append([]string{"node", filepath.Join(scripts, "verbs", argv[0]+".js")}, argv[1:]...)
}

// The usage quack prints for help and for a verb it knows nowhere, off the one table. [[spec/tickets/cli-js-leaves]]
func usageText() string {
	var said strings.Builder
	said.WriteString("Usage: ./RUNME.sh <verb> [path ...]\n\n")
	for _, one := range verbsmodule.Commands {
		fmt.Fprintf(&said, "  %-*s %s\n", usageColumn, one.Name, one.Doc)
	}
	return said.String()
}

// Whether the table holds the verb. [[spec/tickets/cli-js-leaves]]
func isCommand(verb string) bool {
	for _, one := range verbsmodule.Commands {
		if one.Name == verb {
			return true
		}
	}
	return false
}

// The program door: the verb's program past any flag before it, or the usage where the words name help or no verb the table holds. [[spec/tickets/cli-js-leaves]]
func programDoor(scripts string, argv []string, stdin io.Reader, errs io.Writer, signals <-chan os.Signal) func(out io.Writer) int {
	return func(out io.Writer) int {
		at := 0
		for at < len(argv) && strings.HasPrefix(argv[at], "-") {
			at++
		}
		if at == len(argv) || argv[at] == "help" {
			fmt.Fprint(out, usageText())
			return 0
		}
		if !isCommand(argv[at]) {
			fmt.Fprintf(errs, "se: there is no verb called %s\n\n", argv[at])
			fmt.Fprint(out, usageText())
			return exitUsage
		}
		return oldDoor(programOf(scripts, argv[at:]), stdin, errs, signals)(out)
	}
}

func capped(text string) string {
	if len(text) <= answerCap {
		return text
	}
	return text[:answerCap]
}

// The verbs slice's mode off the config under the root, old where nothing answers it. [[spec/tickets/runme-hands-verbs-to-quack]]
func modeOf(root string) string { return sliceMode(root, verbsKey) }

// A slice's mode off the config under the root, by its dotted key, and empty where nothing answers it. [[spec/tickets/the-doors-process-stands]]
func sliceMode(root, key string) string {
	rows, err := configAt(root)
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
func appendsRow(root string, now func() time.Time) func(row map[string]any) error {
	return func(row map[string]any) error {
		row["at"] = now().UTC().Format(logStamp)
		line, err := json.Marshal(row)
		if err != nil {
			return err
		}
		at := filepath.Join(root, filepath.FromSlash(sessionLog))
		if err := os.MkdirAll(filepath.Dir(at), 0o755); err != nil {
			return err
		}
		file, err := os.OpenFile(at, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0o644)
		if err != nil {
			return err
		}
		defer file.Close()
		_, err = file.Write(append(line, '\n'))
		return err
	}
}

// The road over the real doors: each verb's program under node, the tree over V1, the twins and the session log under the root. [[spec/tickets/cli-js-leaves]]
func verbRoad(scripts string, argv []string) int {
	root, err := index.Root()
	if err != nil {
		root = "."
	}
	signals := make(chan os.Signal, 1)
	signal.Notify(signals, os.Interrupt, syscall.SIGTERM)
	return verbs(verbDoors{
		mode:  modeOf(root),
		old:   programDoor(scripts, argv, os.Stdin, os.Stderr, signals),
		alone: func(argv []string) int { return routes(os.Stdout, os.Stderr, index.V1, argv) },
		twins: twinVerbs,
		log:   appendsRow(root, time.Now),
		out:   os.Stdout,
		errs:  os.Stderr,
	}, argv)
}

// The line a failed start says: a runtime missing from the PATH names itself, since the install brings none. [[spec/tickets/bare-desk-names-missing-node]]
func startFault(runtime string, err error) string {
	if errors.Is(err, exec.ErrNotFound) {
		return fmt.Sprintf("No %s stands on the PATH, and every verb without a Go twin runs on it. Install %s, and run this again.", runtime, runtime)
	}
	return err.Error()
}

// The old road: the verb's program as a child holding the caller's stdin and error stream, its standard output written to out, each signal forwarded, and its exit code answered. An out that is the caller's own file hands the child the terminal itself. [[spec/tickets/verb-road-keeps-the-terminal]]
func oldDoor(command []string, stdin io.Reader, errs io.Writer, signals <-chan os.Signal) func(out io.Writer) int {
	return func(out io.Writer) int {
		child := exec.Command(command[0], command[1:]...)
		child.Stdin, child.Stdout, child.Stderr = stdin, out, errs
		if err := child.Start(); err != nil {
			fmt.Fprintln(errs, startFault(command[0], err))
			return exitFailed
		}
		ended := make(chan struct{})
		go func() {
			for {
				select {
				case one := <-signals:
					child.Process.Signal(one)
				case <-ended:
					return
				}
			}
		}()
		err := child.Wait()
		close(ended)
		var exit *exec.ExitError
		if errors.As(err, &exit) && exit.ExitCode() >= 0 {
			return exit.ExitCode()
		}
		if err != nil {
			fmt.Fprintln(errs, err)
			return exitFailed
		}
		return 0
	}
}
