package main

import (
	"reflect"
	"strings"
)

// A TOOL'S SCHEMA IS READ OFF THE REQUEST IT TAKES, IN ONE PLACE.
//
// Every tool declared its properties as a nested literal and its handler read
// the arguments back out of a map[string]any by string key. Two hand-written
// lists of the same names with nothing joining them, so a name in one and not
// the other was silent.
//
// MEASURED, AND IT WAS LIVE. se_work's schema grew tracked and the engine began
// refusing any standard token minted without it. The stub an agent was running
// had been built before the field existed, so the door advertised a schema with
// no tracked, the harness dropped the argument as unknown, and every standard
// mint through the door was refused for a field the caller had no way to send.
// The same mint through the CLI, which reads its flags from one list, worked.
//
// SO THERE IS ONE LIST, AND IT IS A STRUCT. The handler decodes into it and this
// reads the same type for what the door advertises, so the two cannot disagree.
// writing-go rule 4: map[string]any stops where the JSON is decoded.

// schemaOf answers the JSON Schema of one request, read off its type.
func schemaOf(v any) map[string]any {
	return typeSchema(reflect.TypeOf(v))
}

// typeSchema answers the schema for one Go type.
//
// A KIND IT DOES NOT KNOW ANSWERS NOTHING RATHER THAN GUESSING. A guess would
// advertise a type the handler will not decode, which is the drift this file
// exists to end, and a nil property is loud where a wrong one is quiet.
// TestToolSchemasComeFromTheirStructs refuses a property that came back nil.
func typeSchema(t reflect.Type) map[string]any {
	for t != nil && t.Kind() == reflect.Pointer {
		t = t.Elem()
	}
	if t == nil {
		return nil
	}
	switch t.Kind() {
	case reflect.String:
		return map[string]any{"type": "string"}
	case reflect.Bool:
		return map[string]any{"type": "boolean"}
	case reflect.Int, reflect.Int8, reflect.Int16, reflect.Int32, reflect.Int64,
		reflect.Uint, reflect.Uint8, reflect.Uint16, reflect.Uint32, reflect.Uint64:
		return map[string]any{"type": "integer"}
	case reflect.Float32, reflect.Float64:
		return map[string]any{"type": "number"}
	case reflect.Slice, reflect.Array:
		return map[string]any{"type": "array", "items": typeSchema(t.Elem())}
	case reflect.Map:
		return map[string]any{"type": "object", "additionalProperties": typeSchema(t.Elem())}
	case reflect.Struct:
		return structSchema(t)
	}
	return nil
}

// structSchema is one object: a property per json field, in the field's order.
func structSchema(t reflect.Type) map[string]any {
	props := map[string]any{}
	var required []string
	for i := 0; i < t.NumField(); i++ {
		f := t.Field(i)
		name, ok := jsonName(f)
		if !ok {
			continue
		}
		one := typeSchema(f.Type)
		// THE SENTENCE BESIDE THE FIELD IS THE ONE THE AGENT READS. It sits on
		// the field rather than in a second table, for the reason above.
		if says := f.Tag.Get("says"); says != "" && one != nil {
			one["description"] = says
		}
		props[name] = one
		if f.Tag.Get("must") == "true" {
			required = append(required, name)
		}
	}
	out := map[string]any{"type": "object", "properties": props}
	if len(required) > 0 {
		out["required"] = required
	}
	return out
}

// jsonName is the name a field goes by on the wire, and whether it goes at all.
func jsonName(f reflect.StructField) (string, bool) {
	if f.PkgPath != "" {
		return "", false // unexported, so encoding/json will not carry it either
	}
	tag := f.Tag.Get("json")
	if tag == "-" {
		return "", false
	}
	name, _, _ := strings.Cut(tag, ",")
	if name == "" {
		name = f.Name
	}
	return name, true
}
