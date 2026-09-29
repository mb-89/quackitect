// quack config: every key both config files hold, with the literal and the
// layer the config module resolves it to, as JSON. The config verb reads it
// beside its own answer while the config slice runs in shadow.
// [[spec/tickets/cfg-topic-holds-one-resolver]]
package main

import (
	"encoding/json"
	"sort"
	"strings"

	"quackitect/src/modules/config"
	"quackitect/src/q"
)

// The member a config file explains itself under, which names no key. [[spec/design_output/config#a-key-names-a-path]]
const explained = "comment"

// One key's answer off the config module: its JSON literal and its layer. [[spec/tickets/cfg-topic-holds-one-resolver]]
type configRow struct {
	Value json.RawMessage `json:"value"`
	Layer string          `json:"layer"`
}

// Every leaf key either file holds, dotted, and the answer the config module resolves for each. A key the catalog shares reads the default file alone. [[spec/tickets/cfg-topic-holds-one-resolver]]
func configRows(tracked, local []byte, env map[string]string, shared map[string]bool) (map[string]configRow, error) {
	files := make([]q.Ordered, 0, 2)
	for _, body := range [][]byte{tracked, local} {
		parsed := q.Ordered{}
		if strings.TrimSpace(string(body)) != "" {
			var err error
			if parsed, err = q.JSON.Parse(body); err != nil {
				return nil, err
			}
		}
		files = append(files, parsed)
	}
	keys := map[string]bool{}
	for _, file := range files {
		leavesOf(file, "", keys)
	}
	out := map[string]configRow{}
	for dotted := range keys {
		key := keyOfDotted(dotted, shared[dotted])
		if literal, layer, ok := config.Layered(key, files[0], files[1], env); ok {
			out[dotted] = configRow{Value: json.RawMessage(literal), Layer: layer}
		}
	}
	return out, nil
}

// The dotted names of every member of a file that holds no object, past the explaining member. [[spec/design_output/config#a-key-names-a-path]]
func leavesOf(value q.Ordered, at string, into map[string]bool) {
	if !value.Object {
		if at != "" {
			into[at] = true
		}
		return
	}
	for i, name := range value.Keys {
		if name == explained {
			continue
		}
		under := name
		if at != "" {
			under = at + "." + name
		}
		leavesOf(value.Fields[i], under, into)
	}
}

// A dotted key as the catalog names it: its first segment the instance, the rest its local name. [[spec/design_output/model#config-comes-off-the-registrations]]
func keyOfDotted(dotted string, shared bool) q.Key {
	instance, local, _ := strings.Cut(dotted, ".")
	local = strings.ReplaceAll(local, ".", "/")
	return q.Key{Name: instance + "/config/" + local, Instance: instance, Local: local, Shared: shared}
}

// The dotted names of the keys the modules the wiring loads declare shared. [[spec/design_output/model#config-comes-off-the-registrations]]
func sharedKeys(wiring string) (map[string]bool, error) {
	all, err := q.ReadWiring(wiring)
	if err != nil {
		return nil, err
	}
	c := q.New()
	if _, err := load(all, c); err != nil {
		return nil, err
	}
	out := map[string]bool{}
	for _, key := range c.Keys() {
		if key.Shared {
			out[key.Instance+"."+strings.ReplaceAll(key.Local, "/", ".")] = true
		}
	}
	return out, nil
}

// The rows as the verb prints them, one key a line in name order inside one object. [[spec/tickets/cfg-topic-holds-one-resolver]]
func configText(rows map[string]configRow) ([]byte, error) {
	names := make([]string, 0, len(rows))
	for name := range rows {
		names = append(names, name)
	}
	sort.Strings(names)
	var lines []string
	for _, name := range names {
		key, _ := json.Marshal(name)
		body, err := json.Marshal(rows[name])
		if err != nil {
			return nil, err
		}
		lines = append(lines, "  "+string(key)+": "+string(body))
	}
	return []byte("{\n" + strings.Join(lines, ",\n") + "\n}\n"), nil
}
