// The command tree quack builds off the registry over /v1: each action a
// command of run, with help from its q.Doc and each field's doc tag.
// [[spec/design_input/the-index-holds-the-model#the-registry-builds-each-surface]]
package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"strings"
	"time"
)

// The wait run posts with, the one detached posts with, the pause between reads of a handle, and the exits. [[spec/tickets/the-quack-cli-gets-generated]]
const (
	followPrefer = "wait=1"
	detachPrefer = "wait=0"
	followPause  = 200 * time.Millisecond
	exitFailed   = 1
	exitUsage    = 2
	actionsPath  = "/values/index/actions"
	detachFlag   = "detach"
	toolsPath    = "/tools"
	actWords     = 3
)

// The states an operation ends in. [[spec/design_output/model#the-states]]
var ended = map[string]bool{"done": true, "failed": true, "cancelled": true}

// The verbs the tree answers, which main hands it. [[spec/tickets/the-quack-cli-gets-generated]]
var cliVerbs = map[string]bool{"help": true, "--help": true, "-h": true, "run": true, "get": true, "tools": true, "act": true}

// One row of index/actions: the action, its q.Doc and its input fields. [[spec/tickets/the-catalog-reads-as-rows]]
type actionRow struct {
	Name   string `json:"name"`
	Doc    string `json:"doc"`
	Fields []struct {
		Key string
		Doc string
	} `json:"fields"`
}

// What a post of an action answers. [[spec/design_output/model#a-caller-sets-its-wait]]
type called struct {
	Result   any     `json:"result"`
	Running  bool    `json:"running"`
	Handle   string  `json:"handle"`
	Fraction float64 `json:"fraction"`
}

// The value of ops/<id> a handle reads at. [[spec/design_output/model#the-handle-is-a-name]]
type opValue struct {
	Value struct {
		State    string `json:"state"`
		Result   any    `json:"result"`
		Error    string `json:"error"`
		Progress struct {
			Done  int `json:"done"`
			Known int `json:"known"`
		} `json:"progress"`
	} `json:"value"`
}

// Hands a verb of the tree to cli over the base V1 answers. [[spec/tickets/quack-main-routes-the-tree]]
func routes(out, errs io.Writer, v1 func() (string, error), argv []string) int {
	base, err := v1()
	if err != nil {
		fmt.Fprintln(errs, err)
		return exitFailed
	}
	return cli(out, errs, base, argv)
}

// Runs one command of the tree against the /v1 base, and answers its exit code. [[spec/tickets/the-quack-cli-gets-generated]]
func cli(out, errs io.Writer, base string, argv []string) int {
	if len(argv) == 0 {
		return usage(errs)
	}
	var err error
	switch {
	case argv[0] == "run" && len(argv) > 1:
		return runs(out, errs, base, argv[1], argv[2:])
	case argv[0] == "get" && len(argv) == 2:
		err = gets(out, base, argv[1])
	case argv[0] == "tools" && len(argv) == 1:
		err = lists(out, base)
	case argv[0] == "act" && len(argv) > 1 && len(argv) <= actWords:
		return acts(out, errs, base, argv[1:])
	case argv[0] == "help" || argv[0] == "--help" || argv[0] == "-h":
		err = helps(out, base)
	default:
		return usage(errs)
	}
	if err != nil {
		fmt.Fprintln(errs, err)
		return exitFailed
	}
	return 0
}

func usage(errs io.Writer) int {
	fmt.Fprintln(errs, "usage: quack --help | run <action> [--<field> <value>...] [--detach] | get <name> | tools | act <action> [<json>]")
	return exitUsage
}

// Prints each action beside its q.Doc. [[spec/tickets/the-quack-cli-gets-generated]]
func helps(out io.Writer, base string) error {
	rows, err := actionsOf(base)
	if err != nil {
		return err
	}
	fmt.Fprintln(out, "quack run <action> [--<field> <value>...] [--detach], or quack get <name>. The actions:")
	for _, row := range rows {
		fmt.Fprintf(out, "  %-28s %s\n", row.Name, row.Doc)
	}
	return nil
}

// Prints the value a name holds. [[spec/tickets/the-quack-cli-gets-generated]]
func gets(out io.Writer, base, name string) error {
	var said struct {
		Value any `json:"value"`
	}
	if err := reads(base+"/values/"+name, &said); err != nil {
		return err
	}
	return prints(out, said.Value)
}

// Builds a flag set off the action's fields, posts the flags as its input, and follows the call to its end, or answers the handle at once under --detach. [[spec/tickets/the-quack-cli-gets-generated]]
func runs(out, errs io.Writer, base, name string, args []string) int {
	rows, err := actionsOf(base)
	if err != nil {
		fmt.Fprintln(errs, err)
		return exitFailed
	}
	var row *actionRow
	for i := range rows {
		if rows[i].Name == name {
			row = &rows[i]
		}
	}
	if row == nil {
		fmt.Fprintf(errs, "quack holds no action %s; quack --help lists them\n", name)
		return exitFailed
	}
	set := flag.NewFlagSet(name, flag.ContinueOnError)
	set.SetOutput(errs)
	detach := set.Bool(detachFlag, false, "answer the handle at once, and follow nothing")
	help := set.Bool("help", false, "print this help")
	for _, field := range row.Fields {
		set.String(field.Key, "", field.Doc)
	}
	if err := set.Parse(args); err != nil {
		return exitUsage
	}
	if *help {
		fmt.Fprintln(out, row.Doc)
		set.SetOutput(out)
		set.PrintDefaults()
		return 0
	}
	body, err := inputOf(set, len(row.Fields) > 0)
	if err != nil {
		fmt.Fprintln(errs, err)
		return exitUsage
	}
	return calls(out, errs, base, name, body, *detach)
}

// Prints the tool list the index generates, one tool an action. [[spec/tickets/the-hook-registers-index-tools]]
func lists(out io.Writer, base string) error {
	var said any
	if err := reads(base+toolsPath, &said); err != nil {
		return err
	}
	return prints(out, said)
}

// Posts the JSON past the action's name as its input, an empty object where none stands, and follows the call to its end. [[spec/tickets/the-hook-registers-index-tools]]
func acts(out, errs io.Writer, base string, args []string) int {
	body := []byte("{}")
	if len(args) > 1 {
		body = []byte(args[1])
	}
	if !json.Valid(body) {
		fmt.Fprintf(errs, "quack act %s reads no JSON in %s\n", args[0], body)
		return exitUsage
	}
	return calls(out, errs, base, args[0], body, false)
}

// Posts the body to the action, and prints its result once the call ends, or its handle at once where it detaches. [[spec/tickets/the-quack-cli-gets-generated]]
func calls(out, errs io.Writer, base, name string, body []byte, detach bool) int {
	prefer := followPrefer
	if detach {
		prefer = detachPrefer
	}
	said, err := posts(base+"/actions/"+name, prefer, body)
	if err == nil && detach {
		fmt.Fprintln(out, said.Handle)
		return 0
	}
	if err == nil && said.Running {
		said.Result, err = follows(errs, strings.TrimSuffix(base, "/v1")+said.Handle)
	}
	if err == nil {
		err = prints(out, said.Result)
	}
	if err != nil {
		fmt.Fprintln(errs, err)
		return exitFailed
	}
	return 0
}

// The input as JSON: the flags set, one key a field, or the one argument past the name where the action takes no struct. A value reads as JSON where it parses as a number, a boolean or null, and as a string otherwise. [[spec/tickets/the-quack-cli-gets-generated]]
func inputOf(set *flag.FlagSet, fielded bool) ([]byte, error) {
	if !fielded {
		if set.NArg() == 0 {
			return json.Marshal(nil)
		}
		return json.Marshal(valueOf(set.Arg(0)))
	}
	if set.NArg() > 0 {
		return nil, fmt.Errorf("%s takes its input as flags, and %q stands past them", set.Name(), set.Arg(0))
	}
	input := map[string]any{}
	set.Visit(func(one *flag.Flag) {
		if one.Name != detachFlag && one.Name != "help" {
			input[one.Name] = valueOf(one.Value.String())
		}
	})
	return json.Marshal(input)
}

func valueOf(text string) any {
	var parsed any
	if json.Unmarshal([]byte(text), &parsed) == nil {
		switch parsed.(type) {
		case float64, bool, nil:
			return parsed
		}
	}
	return text
}

// Reads the handle each pause until its operation ends, with the fraction done on the error stream, and answers its result. [[spec/tickets/the-quack-cli-gets-generated]]
func follows(errs io.Writer, handle string) (any, error) {
	for {
		var op opValue
		if err := reads(handle, &op); err != nil {
			return nil, err
		}
		if ended[op.Value.State] {
			if op.Value.State != "done" {
				return nil, fmt.Errorf("the action ends %s: %s", op.Value.State, op.Value.Error)
			}
			return op.Value.Result, nil
		}
		if op.Value.Progress.Known > 0 {
			fmt.Fprintf(errs, "%d of %d done\n", op.Value.Progress.Done, op.Value.Progress.Known)
		}
		time.Sleep(followPause)
	}
}

func actionsOf(base string) ([]actionRow, error) {
	var said struct {
		Value []actionRow `json:"value"`
	}
	err := reads(base+actionsPath, &said)
	return said.Value, err
}

func prints(out io.Writer, value any) error {
	text, err := json.MarshalIndent(value, "", "  ")
	if err != nil {
		return err
	}
	_, err = fmt.Fprintln(out, string(text))
	return err
}
