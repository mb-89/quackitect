// quack sweep: the check module's sweep, settled, as JSON the lint reads in
// place of a second server's list.
// [[spec/tickets/the-lsp-server-leaves]]
package main

import (
	"encoding/json"
	"io"
)

// Prints the sweep's rows once the index settles, and an empty list where the sweep holds none. [[spec/tickets/the-lsp-server-leaves]]
func sweeps(out io.Writer, ask func(argv ...string) (any, error)) error {
	said, err := ask("value", sweepName)
	if err != nil {
		return err
	}
	if said == nil {
		said = []any{}
	}
	text, err := json.Marshal(said)
	if err != nil {
		return err
	}
	_, err = out.Write(append(text, '\n'))
	return err
}
