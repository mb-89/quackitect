package main

import (
	"encoding/json"
	"os"
	"path/filepath"
)

// EVERY MARK THIS WINDOW DRAWS COMES FROM util/icons.json, the same table the
// sidebar and the editor read. So the same mark is the same mark everywhere,
// and changing one is one edit in one file.
//
// A NAME THE TABLE DOES NOT HOLD FALLS BACK TO WHAT IS WRITTEN HERE. This
// window runs in a terminal and a blank column reads as a missing record, so a
// missing entry must not empty it.
type icon struct {
	Glyph string `json:"glyph"`
}

var icons map[string]icon

// ReadIcons loads the table once, found by walking up from the log this window
// is watching. The log sits under a project and the table sits at the method
// root, and this window is given only the log.
func ReadIcons(logPath string) {
	at, err := filepath.Abs(logPath)
	if err != nil {
		return
	}
	var b []byte
	for dir := filepath.Dir(at); ; {
		if b, err = os.ReadFile(filepath.Join(dir, "util", "icons.json")); err == nil {
			break
		}
		up := filepath.Dir(dir)
		if up == dir {
			return
		}
		dir = up
	}
	var raw map[string]json.RawMessage
	if json.Unmarshal(b, &raw) != nil {
		return
	}
	icons = map[string]icon{}
	for name, v := range raw {
		if name == "" || name[0] == '$' {
			continue
		}
		var i icon
		if json.Unmarshal(v, &i) == nil && i.Glyph != "" {
			icons[name] = i
		}
	}
}

func drawn(name, orElse string) string {
	if i, ok := icons[name]; ok {
		return i.Glyph
	}
	return orElse
}
