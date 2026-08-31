package main

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
)

// EVERY ICON THE SYSTEM DRAWS, FROM ONE TABLE.
//
// Nothing else carries a glyph. A control, a heading or a button names an icon,
// and util/icons.json decides what that name looks like. So the same mark is
// the same mark everywhere, and changing one is one edit in one file.
//
// A NAME THAT RESOLVES TO A GLYPH TODAY CAN RESOLVE TO A FILE TOMORROW, and
// nothing that uses the name has to change. That is the point of the name.

type Icon struct {
	Glyph string `json:"glyph"`
	At    string `json:"at,omitempty"`  // the code point, for a person to search for
	For   string `json:"for,omitempty"` // what it is drawn for
}

// Icons reads the table. Keys beginning with a dollar are the file's own notes.
// THE FOLDER BEING WORKED ON WINS, the same way it does for a view. A command
// told to work on one folder must not read the marks of another.
func Icons(r Roots) (map[string]Icon, error) {
	var b []byte
	var err error
	for _, dir := range []string{r.Work, r.Method} {
		if b, err = os.ReadFile(filepath.Join(dir, "util", "icons.json")); err == nil {
			break
		}
	}
	if err != nil {
		return nil, fmt.Errorf("util/icons.json is not readable: %w", err)
	}
	var raw map[string]json.RawMessage
	if err := json.Unmarshal(b, &raw); err != nil {
		return nil, fmt.Errorf("util/icons.json: %w", err)
	}
	out := map[string]Icon{}
	for name, v := range raw {
		if name != "" && name[0] == '$' {
			continue
		}
		var i Icon
		if json.Unmarshal(v, &i) == nil && i.Glyph != "" {
			out[name] = i
		}
	}
	return out, nil
}

// DrawnAs answers the glyph for one name.
//
// A NAME NOBODY DECLARED DRAWS ITSELF. A blank where an icon was wanted leaves
// a button a person cannot see, and the name on the face says which entry is
// missing from the table.
func DrawnAs(icons map[string]Icon, name string) string {
	if i, ok := icons[name]; ok {
		return i.Glyph
	}
	return name
}
