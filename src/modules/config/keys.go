// config/keys: every key with its value and the layer answering it, which the
// sidebar draws and quack config prints. The actions beside it set a key, hold
// a window's override, and drop the overrides other windows set.
// [[spec/tickets/config-answers-keys-and-overrides]]
package config

import (
	"encoding/json"
	"maps"
	"slices"

	"quackitect/src/q"
)

// The name of the rows, beside config/values. [[spec/tickets/config-answers-keys-and-overrides]]
const KeysName = "config/keys"

// The member a config file explains itself under, which names no key. [[spec/design_output/config#a-key-names-a-path]]
const Explained = "comment"

// The layer of a key no layer sets. src/config owns the name, and a module spells it again because it imports q alone. [[spec/design_output/config#the-layers]]
const BuiltIn = "built-in"

// One key's answer: its dotted name, its JSON literal, and its layer. [[spec/tickets/config-answers-keys-and-overrides]]
type Row struct {
	Key   string          `json:"key"`
	Value json.RawMessage `json:"value"`
	Layer string          `json:"layer"`
}

// The rows off both files and the variables, with no context or override open, as quack config reads a tree at rest. [[spec/tickets/cfg-topic-holds-one-resolver]]
func Rows(declared map[string]q.Key, tracked, local q.Ordered, env map[string]string) []Row {
	return rowsOf(declared, layersIn{Tracked: tracked, Local: local, Env: env})
}

// Every key the catalog declares, by its dotted name. [[spec/tickets/the-config-schema-gets-generated]]
func dottedIn(keys []q.Key) map[string]q.Key {
	out := map[string]q.Key{}
	for _, key := range keys {
		out[key.Dotted()] = key
	}
	return out
}

// Every leaf key either file holds and every key the catalog declares, in name order. A declared key no layer sets reads its built-in. [[spec/tickets/the-config-schema-gets-generated]]
func rowsOf(keys map[string]q.Key, in layersIn) []Row {
	names := map[string]bool{}
	for dotted := range keys {
		names[dotted] = true
	}
	for _, file := range []q.Ordered{in.Tracked, in.Local} {
		leavesOf(file, "", names)
	}
	out := []Row{}
	for _, dotted := range slices.Sorted(maps.Keys(names)) {
		key, ok := keys[dotted]
		if !ok {
			key = KeyOfDotted(dotted)
		}
		if literal, layer, ok := winning(key, in); ok {
			out = append(out, Row{Key: dotted, Value: json.RawMessage(literal), Layer: layer})
		} else if key.Default != "" {
			out = append(out, Row{Key: dotted, Value: json.RawMessage(key.Default), Layer: BuiltIn})
		}
	}
	return out
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
		if name == Explained {
			continue
		}
		under := name
		if at != "" {
			under = at + "." + name
		}
		leavesOf(value.Fields[i], under, into)
	}
}

// A dotted key as the catalog names it: its first segment the instance, the rest its local name, each segment in kebab case. [[spec/design_output/model#config-comes-off-the-registrations]]
func KeyOfDotted(dotted string) q.Key { return q.KeyOfDotted(dotted) }

// The input of a set: the dotted key and the value, as a person types them. [[spec/tickets/config-answers-keys-and-overrides]]
type Set struct {
	Key   string `json:"key" label:"key" doc:"the dotted key"`
	Value string `json:"value" label:"value" doc:"the value it takes"`
}

// The input of an override: the dotted key, the value, and the window holding it. [[spec/tickets/config-answers-keys-and-overrides]]
type Override struct {
	Key    string `json:"key" label:"key" doc:"the dotted key"`
	Value  string `json:"value" label:"value" doc:"the value it takes"`
	Window string `json:"window" label:"window" doc:"the window holding the override"`
}

// The input of an open: the window that opens. [[spec/tickets/config-answers-keys-and-overrides]]
type Opened struct {
	Window string `json:"window" label:"window" doc:"the window that opens"`
}

// The node module's name and its verb. src/modules/verbs owns both, and a module spells them again because it imports q alone. [[spec/tickets/ticket-verbs-become-actions]]
const (
	nodeModule = "node"
	nodeRun    = "run"
)

// The config actions: a set runs the config verb, which types the value, writes its layer and logs the line, and an override or an open lands a change on config/held. [[spec/tickets/config-answers-keys-and-overrides]]
func actions(c *q.Catalog) q.Writer {
	lands := func(change Change) []q.Request {
		return []q.Request{{Module: q.StoreModule, Verb: q.StoreLand, Args: q.Landing{Name: HeldName, Event: change}, NoUndo: "an override lives in memory, and a restart drops it"}}
	}
	return q.Join(
		q.ActionIn(c, "config/set", func(in Set) []q.Request {
			return []q.Request{{Module: nodeModule, Verb: nodeRun, Args: []string{"config", in.Key, in.Value}, NoUndo: "the config verb writes its layer, and keeps no undo"}}
		}, q.Doc("Write the key into its layer, typed by its declaration."), q.Label("Set a key"), q.Writes()),
		q.ActionIn(c, "config/override", func(in Override) []q.Request {
			name := fullNameOf(c, in.Key)
			return lands(Change{Kind: Overrides, Holder: in.Window, Values: map[string]string{name: q.LiteralOfText(in.Value)}})
		}, q.Doc("Hold the value as an override for the window, until another window opens."), q.Label("Override a key"), q.Writes()),
		q.ActionIn(c, "config/opened", func(in Opened) []q.Request {
			return lands(Change{Kind: Drops, Holder: in.Window})
		}, q.Doc("Drop every override another window holds."), q.Label("A window opens"), q.Writes()),
	)
}

// The full name of a dotted key, off the catalog where it declares the key. [[spec/tickets/config-answers-keys-and-overrides]]
func fullNameOf(c *q.Catalog, dotted string) string {
	for _, key := range c.Keys() {
		if key.Dotted() == dotted {
			return key.Name
		}
	}
	return KeyOfDotted(dotted).Name
}
