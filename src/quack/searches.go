// The index a Grep or a Glob asks through the hooks door: the params in the
// wire shape se-index reads, decoded into the index's ask, and the answer
// encoded back into the shape it prints.
// [[spec/tickets/grep-glob-answer-off-index]]
package main

import (
	"encoding/json"
	"fmt"

	"quackitect/src/index"
)

// [[spec/tickets/grep-glob-answer-off-index]]
func indexAsk(reads index.Reads) func(method string, params map[string]any) (map[string]any, error) {
	return func(method string, params map[string]any) (map[string]any, error) {
		switch method {
		case "grep":
			var ask index.GrepAsk
			if err := recoded(params, &ask); err != nil {
				return nil, err
			}
			said, err := reads.Grep(ask)
			return wireOf(said, err)
		case "glob":
			var ask index.GlobAsk
			if err := recoded(params, &ask); err != nil {
				return nil, err
			}
			said, err := reads.Glob(ask)
			return wireOf(said, err)
		}
		return nil, fmt.Errorf("the index answers grep and glob, and no %s", method)
	}
}

func wireOf(said any, err error) (map[string]any, error) {
	if err != nil {
		return nil, err
	}
	var out map[string]any
	return out, recoded(said, &out)
}

func recoded(from, into any) error {
	text, err := json.Marshal(from)
	if err != nil {
		return err
	}
	return json.Unmarshal(text, into)
}
