package main

import (
	"fmt"
	"os"
	"path/filepath"
)

// A PAYLOAD COMES FROM THE SCRATCHPAD, WHICH IS WHERE A LANE-LESS SESSION CAN PUT IT.
//
// run and apply read their payload from standard input, and a session whose tool
// lane never came up reaches them at a shell, where the Bash guard refuses a
// pipe. --command and --edits carry a payload inline, and a command line holds
// quotes, newlines and dollar signs that every layer between the agent and the
// engine reads its own way. The harness's own Write is let through for a path
// under .se/scratchpad with nothing in hand, so a file there is the one payload
// such a session can put down exactly. --from reads it whole.
//
// THE SCRATCHPAD ONLY, AND THE GATE'S OWN RULE DECIDES IT. insideTheScratchpad
// is what lets the Write through, so it is what lets the read through: one
// carve-out, asked twice, rather than two that drift apart. A path that climbs
// out is refused and told where the payload belongs.
func payloadFrom(r Roots, from string) ([]byte, error) {
	path := filepath.FromSlash(from)
	if !filepath.IsAbs(path) {
		path = filepath.Join(r.Work, path)
	}
	if !insideTheScratchpad(r, path) {
		return nil, fmt.Errorf("--from reads %s only, and %s is not under it. That folder is the one a "+
			"write with nothing in hand may reach, so put the payload there and name it. "+
			"Nothing was read and nothing ran", shortPath(r, r.Private("scratchpad")), from)
	}
	b, err := os.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("the payload at %s will not read: %w", from, err)
	}
	return b, nil
}

// twoPayloads is the refusal for a call that named its payload twice. Reading
// one of them silently is how the other is lost, so neither is.
func twoPayloads(named []string) error {
	return fmt.Errorf("%s are two payloads, so name one. --from names a file under .se/scratchpad, "+
		"and the other carries the payload itself", joinAnd(named))
}

// joinAnd writes a list the way a sentence does.
func joinAnd(words []string) string {
	switch len(words) {
	case 0:
		return ""
	case 1:
		return words[0]
	}
	out := ""
	for i, w := range words {
		switch {
		case i == 0:
			out = w
		case i == len(words)-1:
			out += " and " + w
		default:
			out += ", " + w
		}
	}
	return out
}
