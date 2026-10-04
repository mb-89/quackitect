// The config verb: every key, its value, and the layer answering it, or a
// write of one key into the local layer.
// [[spec/design_output/config#the-verb-names-the-layer]]
package main

import (
	"encoding/json"
	"fmt"
	"io"
	"math"
	"os"
	"path/filepath"
	"slices"
	"strconv"
	"strings"
	"time"

	"quackitect/src/index"
	"quackitect/src/modules/config"
	"quackitect/src/q"
)

// The columns a row pads its key and its value to, as COL in src/scripts/cli-doors.js names them. [[spec/design_output/config#the-verb-names-the-layer]]
const (
	configKeyColumn   = 22
	configValueColumn = 9
)

// The log levels below info, which a row of info passes. [[spec/design_output/log#a-setting-writes-a-line]]
var logsInfo = []string{"", "debug", "info"}

func init() { register("config", configVerb(index.Root, time.Now)) }

// config over the root: every row, one key's row, or a write of one key where a value follows it. [[spec/design_output/config#the-verb-names-the-layer]]
func configVerb(root func() (string, error), now func() time.Time) twin {
	return func(argv []string, dry bool, out, errs io.Writer) int {
		at, err := root()
		if err != nil {
			fmt.Fprintln(errs, err)
			return exitFailed
		}
		var words []string
		for _, one := range argv[1:] {
			if !strings.HasPrefix(one, "-") {
				words = append(words, one)
			}
		}
		if len(words) > 1 {
			return configWrites(at, words[0], strings.Join(words[1:], " "), dry, now, out, errs)
		}
		rows, err := configAt(at)
		if err != nil {
			fmt.Fprintln(errs, err)
			return exitFailed
		}
		if len(words) == 1 {
			one, ok := rows[words[0]]
			if !ok {
				fmt.Fprintf(errs, "No layer answers %s. Run ./RUNME.sh config to see every key.\n", words[0])
				return exitUsage
			}
			configRowLine(out, words[0], one)
			return 0
		}
		keys := make([]string, 0, len(rows))
		for key := range rows {
			keys = append(keys, key)
		}
		slices.Sort(keys)
		for _, key := range keys {
			configRowLine(out, key, rows[key])
		}
		faults, err := configFaults(at)
		if err != nil {
			fmt.Fprintln(errs, err)
			return exitFailed
		}
		for _, fault := range faults {
			fmt.Fprintf(errs, "%s, and the code reading it finds nothing.\n", fault)
		}
		fmt.Fprintf(out, "\nWrite one: ./RUNME.sh config <key> <value>, which lands in %s.\n", config.Local)
		return 0
	}
}

// One row: the key and the value padded to their columns, then the layer. [[spec/design_output/config#the-verb-names-the-layer]]
func configRowLine(out io.Writer, key string, one configRow) {
	fmt.Fprintf(out, "%-*s %-*s %s\n", configKeyColumn, key, configValueColumn, shownValue(one.Value), one.Layer)
}

// A literal as String(value) shows it in JavaScript: a string bare, a list joined by commas, and every other literal as it stands. [[spec/design_output/config#the-verb-names-the-layer]]
func shownValue(literal json.RawMessage) string {
	var said any
	if json.Unmarshal(literal, &said) != nil {
		return string(literal)
	}
	switch value := said.(type) {
	case string:
		return value
	case nil:
		return "null"
	case map[string]any:
		return "[object Object]"
	case []any:
		parts := make([]string, len(value))
		for i, one := range value {
			body, _ := json.Marshal(one)
			parts[i] = shownValue(body)
		}
		return strings.Join(parts, ",")
	}
	return string(literal)
}

// Each key the tracked file sets with a type apart from the one the catalog declares, as faultsIn in the level0 lib names it. [[spec/design_output/config#the-schema-says-the-type]]
func configFaults(root string) ([]string, error) {
	declared, err := declaredAt(root)
	if err != nil {
		return nil, err
	}
	tracked := orderedAt(filepath.Join(root, filepath.FromSlash(config.Tracked)))
	keys := make([]string, 0, len(declared))
	for key := range declared {
		keys = append(keys, key)
	}
	slices.Sort(keys)
	var out []string
	for _, key := range keys {
		value, ok := memberAt(tracked, strings.Split(key, "."))
		if !ok || declared[key].Type == "" {
			continue
		}
		if kind := jsKind(value); kind != declared[key].Type {
			out = append(out, fmt.Sprintf("%s carries a %s, and the schema says %s", key, kind, declared[key].Type))
		}
	}
	return out, nil
}

// The keys the wiring under the root declares. [[spec/tickets/the-config-schema-gets-generated]]
func declaredAt(root string) (map[string]q.Key, error) {
	wiring, _ := os.ReadFile(filepath.Join(root, filepath.FromSlash(q.WiringFile)))
	return declaredKeys(string(wiring))
}

// The kind typeof names in JavaScript for a value a file holds. [[spec/design_output/config#the-schema-says-the-type]]
func jsKind(value q.Ordered) string {
	switch {
	case value.Object, value.Array, value.Literal == "null":
		return "object"
	case strings.HasPrefix(value.Literal, `"`):
		return "string"
	case value.Literal == "true", value.Literal == "false":
		return "boolean"
	}
	return "number"
}

// A file's JSON, or an empty object where it stands nowhere or reads as none. [[spec/design_output/config#the-resolver-holds-the-layers]]
func orderedAt(path string) q.Ordered {
	body, err := os.ReadFile(path)
	if err != nil || strings.TrimSpace(string(body)) == "" {
		return q.Ordered{Object: true}
	}
	parsed, err := q.JSON.Parse(body)
	if err != nil || !parsed.Object {
		return q.Ordered{Object: true}
	}
	return parsed
}

// The value under a path of member names. [[spec/design_output/config#a-key-names-a-path]]
func memberAt(value q.Ordered, path []string) (q.Ordered, bool) {
	for _, name := range path {
		at := slices.Index(value.Keys, name)
		if !value.Object || at < 0 {
			return q.Ordered{}, false
		}
		value = value.Fields[at]
	}
	return value, true
}

// The value set under a path, each object on the way made where it stands nowhere, as deeply over nest in the level0 lib writes it. [[spec/design_output/config#the-verb-writes-one-layer]]
func settingAt(value q.Ordered, path []string, leaf q.Ordered) q.Ordered {
	if len(path) == 0 {
		return leaf
	}
	if !value.Object {
		value = q.Ordered{Object: true}
	}
	value.Keys, value.Fields = slices.Clone(value.Keys), slices.Clone(value.Fields)
	if at := slices.Index(value.Keys, path[0]); at >= 0 {
		value.Fields[at] = settingAt(value.Fields[at], path[1:], leaf)
		return value
	}
	value.Keys = append(value.Keys, path[0])
	value.Fields = append(value.Fields, settingAt(q.Ordered{}, path[1:], leaf))
	return value
}

// The literal a typed text lands as, as coerce in the level0 lib reads it: a boolean where it reads true, a number where it reads as a finite one, and a string otherwise. [[spec/design_output/config#the-schema-says-the-type]]
func coerced(said, kind string) string {
	switch kind {
	case "boolean":
		return strconv.FormatBool(said == "true")
	case "number":
		if number, err := strconv.ParseFloat(strings.TrimSpace(said), 64); err == nil && !math.IsInf(number, 0) {
			body, _ := json.Marshal(number)
			return string(body)
		}
	}
	body, _ := json.Marshal(said)
	return string(body)
}

// Writes the key into the local layer, prints where it lands, and logs the setting. [[spec/design_output/config#the-verb-writes-one-layer]] [[spec/design_output/log#a-setting-writes-a-line]]
func configWrites(root, key, said string, dry bool, now func() time.Time, out, errs io.Writer) int {
	declared, err := declaredAt(root)
	if err != nil {
		fmt.Fprintln(errs, err)
		return exitFailed
	}
	literal := coerced(said, declared[key].Type)
	if !dry {
		local := filepath.Join(root, filepath.FromSlash(config.Local))
		body, err := q.JSON.Serialize(settingAt(orderedAt(local), strings.Split(key, "."), q.Ordered{Literal: literal}))
		if err == nil {
			err = os.MkdirAll(filepath.Dir(local), 0o755)
		}
		if err == nil {
			err = os.WriteFile(local, body, 0o644)
		}
		if err == nil && slices.Contains(logsInfo, configLevel(root)) {
			err = appendsRow(root, now)(map[string]any{"level": "info", "kind": "config", "said": key + " is " + shownValue(json.RawMessage(literal)), "detail": config.Local})
		}
		if err != nil {
			fmt.Fprintln(errs, err)
			return exitFailed
		}
	}
	fmt.Fprintf(out, "%s is %s in %s.\n", key, literal, config.Local)
	return 0
}

// The log level the config under the root names, or nothing where none answers. [[spec/design_output/log#a-setting-writes-a-line]]
func configLevel(root string) string {
	rows, err := configAt(root)
	if err != nil {
		return ""
	}
	var level string
	_ = json.Unmarshal(rows["log.level"].Value, &level)
	return level
}
