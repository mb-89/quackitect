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

// The member a config file explains itself under, which the config module names. [[spec/design_output/config#a-key-names-a-path]]
const explained = config.Explained

// One key's answer off the config module: its JSON literal and its layer. [[spec/tickets/cfg-topic-holds-one-resolver]]
type configRow struct {
	Value json.RawMessage `json:"value"`
	Layer string          `json:"layer"`
}

// Every leaf key either file holds and every key the catalog declares, dotted, and the answer the config module resolves for each. A key the catalog shares reads the default file alone, a declared key no layer sets reads its built-in, and a local file holding no JSON reads as empty. [[spec/design_output/config#the-layers]]
func configRows(tracked, local []byte, env map[string]string, declared map[string]q.Key) (map[string]configRow, error) {
	trackedFile, err := configParsed(tracked)
	if err != nil {
		return nil, err
	}
	localFile, err := configParsed(local)
	if err != nil {
		localFile = q.Ordered{}
	}
	out := map[string]configRow{}
	for _, row := range config.Rows(declared, trackedFile, localFile, env) {
		out[row.Key] = configRow{Value: row.Value, Layer: row.Layer}
	}
	return out, nil
}

// A config file as the layers read it, where a blank file reads as empty. [[spec/design_output/config#the-layers]]
func configParsed(body []byte) (q.Ordered, error) {
	if strings.TrimSpace(string(body)) == "" {
		return q.Ordered{}, nil
	}
	return q.JSON.Parse(body)
}

// A dotted key as the catalog names it, as the config module reads it. [[spec/design_output/model#config-comes-off-the-registrations]]
func keyOfDotted(dotted string) q.Key { return config.KeyOfDotted(dotted) }

// Every key the modules the wiring loads declare, by its dotted name. [[spec/tickets/the-config-schema-gets-generated]]
func declaredKeys(wiring string) (map[string]q.Key, error) {
	c, err := wiredCatalog(wiring)
	if err != nil {
		return nil, err
	}
	out := map[string]q.Key{}
	for _, key := range c.Keys() {
		out[key.Dotted()] = key
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
