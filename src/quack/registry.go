// The verb registry: each Go verb registers itself from an init in its own
// file, so a port adds one file and edits no shared line. The road and the
// node module refuse a verb nothing registers here.
// [[spec/tickets/quack-registers-each-verb]]
package main

import (
	"fmt"
	"strings"
)

// The Go verbs, keyed by the verb's words. [[spec/tickets/quack-registers-each-verb]]
var registry = map[string]twin{}

// Registers a verb's Go answer under its words. A second registration of the same words stops quack at start. [[spec/tickets/quack-registers-each-verb]]
func register(words string, one twin) {
	if _, taken := registry[words]; taken {
		panic(fmt.Sprintf("quack: the verb %q registers twice", words))
	}
	registry[words] = one
}

// A registered verb's answer as the node module answers a program's: its output, or an error carrying it. [[spec/tickets/quack-registers-each-verb]]
func goAnswer(args []string, one twin) (any, error) {
	var said strings.Builder
	code := one(args, false, &said, &said)
	text := strings.TrimRight(said.String(), "\n")
	if code != 0 {
		return nil, fmt.Errorf("%s answers exit status %d: %s", strings.Join(args, " "), code, text)
	}
	return text, nil
}
