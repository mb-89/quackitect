// quack verb: the road ./RUNME.sh hands every verb down. The verbs slice's
// mode picks cli.js, a Go twin, or both with a shadow row where they differ.
// [[spec/tickets/runme-hands-verbs-to-quack]]
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
)

// The argument count below which quack verb names no cli.js, the slice's dotted key, its modes, the log row's kind and slice, the stamp the session log writes, and the longest answer a row carries. [[spec/tickets/runme-hands-verbs-to-quack]]
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

// Where a verb goes: to cli.js, to quack, or to both with the old answer standing. [[spec/tickets/runme-hands-verbs-to-quack]]
type road int

const (
	toNode road = iota
	toQuack
	toBoth
)

// A Go answer to a verb cli.js answers too, which writes nothing where dry holds. [[spec/tickets/runme-hands-verbs-to-quack]]
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

// What the road reaches: the mode, cli.js writing its standard output into out, a verb quack answers alone, the twins, the session log and the caller's streams. [[spec/tickets/runme-hands-verbs-to-quack]]
type verbDoors struct {
	mode      string
	old       func(out io.Writer) int
	alone     func(argv []string) int
	twins     map[string]twin
	log       func(row map[string]any) error
	out, errs io.Writer
}

// The verbs cli.js answers under the same word, which keep its road. [[spec/tickets/quack-tools-spares-runme-tools]]
var cliJsKeeps = map[string]bool{"help": true, "tools": true, "act": true}

// Whether quack answers the verb alone: a verb of the table past the ones cli.js keeps. [[spec/tickets/quack-alone-verbs-skip-mode]]
func aloneOf(argv []string, table map[string]bool) bool {
	return len(argv) > 0 && table[argv[0]] && !cliJsKeeps[argv[0]] && !strings.HasPrefix(argv[0], "-")
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

// The road a verb takes under the mode: a verb quack answers alone takes quack under every mode, and a twin runs beside cli.js in shadow and alone under new. [[spec/tickets/runme-hands-verbs-to-quack]]
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
				"said": fmt.Sprintf("%s in shadow: %s answers apart from cli.js", verbsSlice, key),
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

// The argv of a verb's program under the scripts folder. [[spec/tickets/cli-js-leaves]]
func programOf(scripts string, argv []string) []string { return nil }

// The usage quack prints for help and for a verb it knows nowhere. [[spec/tickets/cli-js-leaves]]
func usageText() string { return "" }

func capped(text string) string {
	if len(text) <= answerCap {
		return text
	}
	return text[:answerCap]
}

// The verbs slice's mode off the config under the root, old where nothing answers it. [[spec/tickets/runme-hands-verbs-to-quack]]
func modeOf(root string) string {
	rows, err := configAt(root)
	if err != nil {
		return ""
	}
	var mode string
	if json.Unmarshal(rows[verbsKey].Value, &mode) != nil {
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

// The road over the real doors: cli.js under node, the tree over V1, the twins and the session log under the root. [[spec/tickets/runme-hands-verbs-to-quack]]
func verbRoad(cli string, argv []string) int {
	root, err := index.Root()
	if err != nil {
		root = "."
	}
	signals := make(chan os.Signal, 1)
	signal.Notify(signals, os.Interrupt, syscall.SIGTERM)
	return verbs(verbDoors{
		mode:  modeOf(root),
		old:   oldDoor(append([]string{"node", cli}, argv...), os.Stdin, os.Stderr, signals),
		alone: func(argv []string) int { return routes(os.Stdout, os.Stderr, index.V1, argv) },
		twins: twinVerbs,
		log:   appendsRow(root, time.Now),
		out:   os.Stdout,
		errs:  os.Stderr,
	}, argv)
}

// The old road: cli.js as a child holding the caller's stdin and error stream, its standard output written to out, each signal forwarded, and its exit code answered. An out that is the caller's own file hands the child the terminal itself. [[spec/tickets/verb-road-keeps-the-terminal]]
func oldDoor(command []string, stdin io.Reader, errs io.Writer, signals <-chan os.Signal) func(out io.Writer) int {
	return func(out io.Writer) int {
		child := exec.Command(command[0], command[1:]...)
		child.Stdin, child.Stdout, child.Stderr = stdin, out, errs
		if err := child.Start(); err != nil {
			fmt.Fprintln(errs, err)
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
