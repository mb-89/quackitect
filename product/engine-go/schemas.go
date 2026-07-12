package main

// schemas.go — per-field schemas for node and item fields (adr-schema-format).
// The authored datum is JSON config files under method/config/schemas, one per
// node type, carrying sebot's flat shape: a fields list plus <attr>_<field> keys
// (type_, enum_, pattern_, min_, max_, tier_, default_) and an optional required
// list. A common schema merges into every per-type one. Defaults live IN the
// schema. Zero-dep: encoding/json + regexp are stdlib.

import (
	"encoding/json"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strconv"
	"strings"
)

// design: go-field-schemas  implements: req-field-schemas
// Load per-field schemas from the method layer, merge common with the per-type
// one, and report every node field value that breaks its schema — naming the
// node, the field, and the broken rule (req-field-schemas.1, req-field-schemas.2).
// Field-SHAPE checks only: enum membership, bool/int typing, pattern, min/max.
// Referential integrity stays the strict referee's job.

// schemaAttrs are the per-field attribute prefixes a schema key may carry.
var schemaAttrs = map[string]bool{
	"type": true, "enum": true, "pattern": true,
	"min": true, "max": true, "tier": true, "default": true,
}

// schemaValueTypes are the field value-types type_<field> may name.
var schemaValueTypes = map[string]bool{
	"enum": true, "bool": true, "string": true, "int": true, "pattern": true,
}

// fieldRule is one field's resolved schema.
type fieldRule struct {
	valType string   // enum | bool | string | int | pattern
	enum    []string // allowed values (valType enum)
	pattern string   // regex source (valType pattern)
	min     *float64 // numeric lower bound (valType int)
	max     *float64 // numeric upper bound (valType int)
	tier    string   // core | deferrable
	def     string   // the field's default, IN the schema
	defSet  bool
}

// typeSchema is the resolved schema for one node type (or "common").
type typeSchema struct {
	nodeType string
	required []string
	fields   map[string]*fieldRule
}

// schemaConfigDir resolves the schema home, under the i17 config home.
func schemaConfigDir() string {
	return filepath.Join(configDir(), "schemas")
}

// loadFieldSchemas reads every *.json schema in dir into a typeSchema keyed by
// its node type. A malformed file is skipped (the tester is the guard that
// reports it); this loader stays lenient so the lint runs on the good schemas.
func loadFieldSchemas(dir string) map[string]*typeSchema {
	out := map[string]*typeSchema{}
	ents, err := os.ReadDir(dir)
	if err != nil {
		return out
	}
	for _, e := range ents {
		if e.IsDir() || !strings.HasSuffix(e.Name(), ".json") {
			continue
		}
		raw, err := os.ReadFile(filepath.Join(dir, e.Name()))
		if err != nil {
			continue
		}
		var flat map[string]json.RawMessage
		if json.Unmarshal(raw, &flat) != nil {
			continue
		}
		ts := schemaFromFlat(flat)
		if ts.nodeType != "" {
			out[ts.nodeType] = ts
		}
	}
	return out
}

// schemaFromFlat interprets one flat sebot-shaped map into a typeSchema.
func schemaFromFlat(flat map[string]json.RawMessage) *typeSchema {
	ts := &typeSchema{fields: map[string]*fieldRule{}}
	asString := func(m json.RawMessage) string {
		var s string
		json.Unmarshal(m, &s)
		return s
	}
	asStrings := func(m json.RawMessage) []string {
		var xs []string
		json.Unmarshal(m, &xs)
		return xs
	}
	rule := func(field string) *fieldRule {
		if ts.fields[field] == nil {
			ts.fields[field] = &fieldRule{}
		}
		return ts.fields[field]
	}
	for _, f := range asStrings(flat["fields"]) {
		rule(f) // a declared field, even if it carries no attrs yet
	}
	ts.nodeType = asString(flat["type"])
	ts.required = asStrings(flat["required"])
	for key, val := range flat {
		if key == "type" || key == "fields" || key == "required" {
			continue
		}
		attr, field, ok := strings.Cut(key, "_")
		if !ok || !schemaAttrs[attr] {
			continue // unknown key — the tester reports it, the lint ignores it
		}
		r := rule(field)
		switch attr {
		case "type":
			r.valType = asString(val)
		case "enum":
			r.enum = asStrings(val)
		case "pattern":
			r.pattern = asString(val)
		case "tier":
			r.tier = asString(val)
		case "default":
			r.def, r.defSet = asString(val), true
		case "min":
			var n float64
			if json.Unmarshal(val, &n) == nil {
				r.min = &n
			}
		case "max":
			var n float64
			if json.Unmarshal(val, &n) == nil {
				r.max = &n
			}
		}
	}
	return ts
}

// mergedSchema returns the common schema merged with the per-type one. The
// per-type field wins on a name clash.
func mergedSchema(schemas map[string]*typeSchema, nodeType string) *typeSchema {
	out := &typeSchema{nodeType: nodeType, fields: map[string]*fieldRule{}}
	add := func(ts *typeSchema) {
		if ts == nil {
			return
		}
		out.required = append(out.required, ts.required...)
		for name, r := range ts.fields {
			out.fields[name] = r
		}
	}
	add(schemas["common"])
	if nodeType != "common" {
		add(schemas[nodeType])
	}
	return out
}

// frontmatterMap reads a node file's top-level frontmatter into a flat map. It
// mirrors ParseNodeBytes's split: the block between the first two '---' fences,
// simple key: value lines, indented map entries skipped (this lint reads scalar
// fields only).
func frontmatterMap(path string) map[string]string {
	out := map[string]string{}
	raw, err := os.ReadFile(path)
	if err != nil {
		return out
	}
	parts := strings.Split(string(raw), "---")
	if len(parts) < 3 {
		return out
	}
	for _, line := range strings.Split(parts[1], "\n") {
		if line == "" || line[0] == ' ' || line[0] == '\t' {
			continue // blank or an indented map entry
		}
		k, v, ok := strings.Cut(line, ":")
		if !ok {
			continue
		}
		out[strings.TrimSpace(k)] = strings.TrimSpace(v)
	}
	return out
}

// fieldSchemaFindings reports every node field value that breaks its schema,
// loading the schema set from the method layer.
func fieldSchemaFindings(nodes map[string]Node) []string {
	return fieldSchemaFindingsWith(nodes, loadFieldSchemas(schemaConfigDir()))
}

// fieldSchemaFindingsWith is the pure core: nodes against an in-memory schema set.
func fieldSchemaFindingsWith(nodes map[string]Node, schemas map[string]*typeSchema) []string {
	if len(schemas) == 0 {
		return nil
	}
	ids := make([]string, 0, len(nodes))
	for id := range nodes {
		ids = append(ids, id)
	}
	sort.Strings(ids)
	var finds []string
	for _, id := range ids {
		n := nodes[id]
		schema := mergedSchema(schemas, n.Type)
		if len(schema.fields) == 0 && len(schema.required) == 0 {
			continue
		}
		fm := frontmatterMap(n.Path)
		if fm["id"] != id {
			continue // a node whose OWN frontmatter file this is not: a design region
			// embedded in prose or code shares its host file — skip, not misread it
		}
		fields := make([]string, 0, len(schema.fields))
		for name := range schema.fields {
			fields = append(fields, name)
		}
		sort.Strings(fields)
		for _, r := range schema.required {
			if _, ok := fm[r]; !ok {
				finds = append(finds, id+": field \""+r+"\" required but missing")
			}
		}
		for _, name := range fields {
			val, ok := fm[name]
			if !ok || val == "" {
				continue // absent: a default or an optional deferrable field
			}
			if msg := ruleViolation(schema.fields[name], val); msg != "" {
				finds = append(finds, id+": field \""+name+"\" "+msg)
			}
		}
	}
	return finds
}

// ruleViolation returns the broken-rule text for a value, or "" when it holds.
func ruleViolation(r *fieldRule, val string) string {
	switch r.valType {
	case "bool":
		if val != "true" && val != "false" {
			return "value \"" + val + "\" is not a boolean"
		}
	case "enum":
		for _, e := range r.enum {
			if val == e {
				return ""
			}
		}
		return "value \"" + val + "\" not in enum [" + strings.Join(r.enum, " ") + "]"
	case "int":
		n, err := strconv.ParseFloat(val, 64)
		if err != nil {
			return "value \"" + val + "\" is not a number"
		}
		if r.min != nil && n < *r.min {
			return "value \"" + val + "\" below min " + strconv.FormatFloat(*r.min, 'f', -1, 64)
		}
		if r.max != nil && n > *r.max {
			return "value \"" + val + "\" above max " + strconv.FormatFloat(*r.max, 'f', -1, 64)
		}
	case "pattern":
		if r.pattern != "" {
			re, err := regexp.Compile(r.pattern)
			if err == nil && !re.MatchString(val) {
				return "value \"" + val + "\" does not match /" + r.pattern + "/"
			}
		}
	}
	return ""
}

// enddesign

// design: go-schema-tester  implements: req-field-schemas
// Validate the SCHEMA SET itself — the contract test (req-field-schemas.3). A
// schema is a finding when it carries an unknown key, a field whose type is
// unknown, a malformed enum, a missing or bad tier, or a default that falls
// outside its own enum. Each finding names the schema file and the broken rule.

// schemaSetFindings validates every schema file in dir, returning sorted findings.
func schemaSetFindings(dir string) []string {
	ents, err := os.ReadDir(dir)
	if err != nil {
		return []string{"schemas: no schema home at " + dir}
	}
	names := []string{}
	for _, e := range ents {
		if !e.IsDir() && strings.HasSuffix(e.Name(), ".json") {
			names = append(names, e.Name())
		}
	}
	sort.Strings(names)
	var finds []string
	for _, name := range names {
		for _, f := range schemaFileFindings(filepath.Join(dir, name)) {
			finds = append(finds, name+": "+f)
		}
	}
	return finds
}

// schemaFileFindings validates one schema file against the contract.
func schemaFileFindings(path string) []string {
	raw, err := os.ReadFile(path)
	if err != nil {
		return []string{"unreadable"}
	}
	var flat map[string]json.RawMessage
	if json.Unmarshal(raw, &flat) != nil {
		return []string{"malformed JSON"}
	}
	var finds []string
	// the declared fields are the authority for key validation
	declared := map[string]bool{}
	var fieldList []string
	json.Unmarshal(flat["fields"], &fieldList)
	for _, f := range fieldList {
		declared[f] = true
	}
	if _, ok := flat["type"]; !ok {
		finds = append(finds, "no type declared")
	}
	// unknown-key sweep
	keys := make([]string, 0, len(flat))
	for k := range flat {
		keys = append(keys, k)
	}
	sort.Strings(keys)
	for _, key := range keys {
		if key == "type" || key == "fields" || key == "required" {
			continue
		}
		attr, field, ok := strings.Cut(key, "_")
		if !ok || !schemaAttrs[attr] || !declared[field] {
			finds = append(finds, "unknown key \""+key+"\"")
		}
	}
	// per-field contract
	sort.Strings(fieldList)
	for _, f := range fieldList {
		var valType string
		json.Unmarshal(flat["type_"+f], &valType)
		if valType != "" && !schemaValueTypes[valType] {
			finds = append(finds, "field \""+f+"\": unknown type \""+valType+"\"")
		}
		// tier is mandatory and constrained
		tierRaw, hasTier := flat["tier_"+f]
		var tier string
		json.Unmarshal(tierRaw, &tier)
		if !hasTier || tier == "" {
			finds = append(finds, "field \""+f+"\": tier missing")
		} else if tier != "core" && tier != "deferrable" {
			finds = append(finds, "field \""+f+"\": bad tier \""+tier+"\"")
		}
		// enum shape
		enumRaw, hasEnum := flat["enum_"+f]
		var enum []string
		enumMalformed := false
		if hasEnum {
			if json.Unmarshal(enumRaw, &enum) != nil || len(enum) == 0 {
				enumMalformed = true
				finds = append(finds, "field \""+f+"\": malformed enum")
			}
		}
		if valType == "enum" && !hasEnum {
			finds = append(finds, "field \""+f+"\": malformed enum")
		}
		// default must fall inside its own enum
		if defRaw, ok := flat["default_"+f]; ok && hasEnum && !enumMalformed {
			var def string
			json.Unmarshal(defRaw, &def)
			in := false
			for _, e := range enum {
				if def == e {
					in = true
				}
			}
			if !in {
				finds = append(finds, "field \""+f+"\": default \""+def+"\" outside its enum")
			}
		}
	}
	return finds
}

// enddesign
