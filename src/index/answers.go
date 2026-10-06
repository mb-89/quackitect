// The door's calls: each method a caller names, and the answer it reads.
// [[spec/design_output/index#the-door-owns-the-database]]
package index

import (
	"encoding/json"
	"strings"
)

// [[spec/design_output/index#the-door-owns-the-database]]
func (one *door) answers(said call) (any, error) {
	var asked struct {
		Words  string   `json:"words"`
		Name   string   `json:"name"`
		Target string   `json:"target"`
		Path   string   `json:"path"`
		Paths  []string `json:"paths"`
		Limit  int      `json:"limit"`
	}
	if len(said.Params) > 0 {
		json.Unmarshal(said.Params, &asked)
	}

	switch strings.ToLower(said.Method) {
	case "why":
		return one.store.Why(asked.Name)
	case "dump":
		// The door answers the text, and the root writes it through disk. [[spec/design_output/model#everything-on-disk-mirrors]]
		text, err := one.store.Dump(asked.Name)
		return string(text), err
	case "files":
		return Files(one.db)
	case "read":
		// A module in its own process reads a name at the latest revision. [[spec/tickets/files-topic-reads-the-rows]]
		if value := one.store.Snapshot().Read(asked.Name); value != nil {
			return value, nil
		}
		return nil, errorOf("no name called " + asked.Name)
	case "value":
		// A reader beside the old path compares the settled value, so the scheduler drains first. [[spec/tickets/open-tasks-run-in-shadow]]
		if one.drains != nil {
			one.drains()
		}
		if value := one.store.Snapshot().Read(asked.Name); value != nil {
			return value, nil
		}
		return nil, errorOf("no name called " + asked.Name)
	case "texts":
		return Texts(one.db, asked.Paths)
	case "hashes":
		// [[spec/design_output/pull#an-input-marks-its-steps]]
		var ask struct {
			Asks []HashAsk `json:"asks"`
		}
		if err := json.Unmarshal(said.Params, &ask); err != nil {
			return nil, err
		}
		return Hashes(one.db, ask.Asks)
	case "grep":
		var ask GrepAsk
		if err := json.Unmarshal(said.Params, &ask); err != nil {
			return nil, err
		}
		return Grep(one.db, ask)
	case "glob":
		var ask GlobAsk
		if err := json.Unmarshal(said.Params, &ask); err != nil {
			return nil, err
		}
		return Glob(one.db, ask)
	case "find":
		return Find(one.db, asked.Words, asked.Limit)
	case "notes":
		return Notes(one.db, asked.Words, asked.Limit)
	case "links":
		return Links(one.db, asked.Target)
	case "dangling":
		return Dangling(one.db)
	case "tickets":
		// The tickets module the wiring loads answers the list, and a catalog loading none answers it empty. [[spec/tickets/tickets-becomes-a-module]]
		if one.drains != nil {
			one.drains()
		}
		if value := one.store.Snapshot().Read(TicketsName); value != nil {
			return value, nil
		}
		return []any{}, nil
	case "same":
		return Same(one.db, asked.Path)
	case "reindex":
		// The verb sweeps now, so a reader asking it reads the disk as it stands, and nothing clears. [[spec/design_output/index#a-change-moves-its-rows]]
		count, moved, err := one.walks()
		if err == nil && moved > 0 {
			one.moved()
		}
		return map[string]int{"files": count}, err
	case "stop":
		go stopsSoon(one.root)
		return map[string]any{"stopping": one.root, "pid": pidOf()}, nil
	case "standing":
		var files int
		one.db.QueryRow(`SELECT count(*) FROM file`).Scan(&files)
		return map[string]any{"root": one.root, "files": files}, nil
	}
	return nil, errorOf("no method called " + said.Method)
}
