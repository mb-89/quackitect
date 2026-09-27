// se-front: the front writer on the command line. An op reads the note on
// stdin and answers it written; normalise over paths rewrites each in place.
// [[spec/tickets/go-writes-the-frontmatter]]
package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"

	"quackitect/src/front"
)

const (
	usage  = "usage: se-front <set <key> <value>|drop <key>|entry <json>|after <hash>|mint <json>|normalise [path...]|version>"
	failed = 1
	misuse = 2
)

type disk interface {
	read(path string) ([]byte, error)
	write(path string, said []byte) error
}

// A note with no front comes back as it stands, so a caller writes what it read. [[spec/tickets/go-writes-the-frontmatter]]
func run(argv []string, in io.Reader, out, errs io.Writer, paths disk) int {
	if len(argv) == 0 {
		fmt.Fprintln(errs, usage)
		return misuse
	}
	op, args := argv[0], argv[1:]
	switch {
	case op == "version":
		fmt.Fprintln(out, "se-front 1")
		return 0
	case op == "mint" && len(args) == 1:
		var fields front.Ordered
		if err := json.Unmarshal([]byte(args[0]), &fields); err != nil {
			fmt.Fprintln(errs, err)
			return failed
		}
		fmt.Fprint(out, front.Mint(fields))
		return 0
	case op == "normalise" && len(args) > 0:
		return normalises(args, errs, paths)
	}
	write, ok := opOf(op, args)
	if !ok {
		fmt.Fprintln(errs, usage)
		return misuse
	}
	said, err := io.ReadAll(in)
	if err != nil {
		fmt.Fprintln(errs, err)
		return failed
	}
	written, err := write(string(said))
	if err != nil && !errors.Is(err, front.ErrNoFront) {
		fmt.Fprintln(errs, err)
		return failed
	}
	fmt.Fprint(out, written)
	return 0
}

func opOf(op string, args []string) (func(string) (string, error), bool) {
	switch {
	case op == "set" && len(args) == 2:
		return func(text string) (string, error) { return front.Set(text, args[0], args[1]) }, true
	case op == "drop" && len(args) == 1:
		return func(text string) (string, error) { return front.Drop(text, args[0]) }, true
	case op == "after" && len(args) == 1:
		return func(text string) (string, error) { return front.After(text, args[0]) }, true
	case op == "normalise" && len(args) == 0:
		return front.Normalise, true
	case op == "entry" && len(args) == 1:
		var item front.Ordered
		if err := json.Unmarshal([]byte(args[0]), &item); err != nil {
			return func(string) (string, error) { return "", err }, true
		}
		return func(text string) (string, error) { return front.Entry(text, item) }, true
	}
	return nil, false
}

// Each path rewritten in place where its front moves, and a path with no front left alone. [[spec/tickets/go-writes-the-frontmatter]]
func normalises(args []string, errs io.Writer, paths disk) int {
	code := 0
	for _, path := range args {
		said, err := paths.read(path)
		if err != nil {
			fmt.Fprintln(errs, err)
			code = failed
			continue
		}
		written, err := front.Normalise(string(said))
		if err != nil || written == string(said) {
			continue
		}
		if err := paths.write(path, []byte(written)); err != nil {
			fmt.Fprintln(errs, err)
			code = failed
		}
	}
	return code
}
