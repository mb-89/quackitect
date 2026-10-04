// The config commands and the retro command: one slash command a value a key
// takes, and one that mints a retro. A command is the owner's button, so its
// frontmatter keeps it off the model's skill listing.
// [[spec/design_output/projection#the-first-target]] [[spec/tickets/config-verbs-port-to-go]]
package projection

import (
	"regexp"
	"strings"
)

const (
	commandPrefix = "se-"
	argument      = "$ARGUMENTS"
	configPart    = "config"
	// The widget a set of options takes a command a value under. [[spec/design_output/projection#a-widget-takes-its-path]]
	toggleWidget = "toggle"
	// The key a config file and a schema keep a note under, which names no key. [[spec/design_output/config#a-key-names-a-path]]
	commentKey = "comment"
	// The tracked file and the local one a command names. [[spec/design_output/config#the-layers]]
	trackedConfig = "spec/config/level0.json"
	localConfig   = ".se/.runtime/config.json"
	// The line that keeps a command off the model's skill listing. [[spec/design_output/projection#how-a-command-sets-it]]
	hidden    = "disable-model-invocation: true"
	retroFile = "se-retro.md"
)

// A key's declared fields: its type, its options and its help. [[spec/design_output/config#the-schema-says-the-type]]
type declared struct {
	key, typed, help any
	options          []any
	listed           bool
}

// A command's file name parts and the label its description opens with. [[spec/design_output/projection#a-name-carries-the-path]]
type commandPath struct{ stem, label []string }

// One file a command shape writes. [[spec/design_output/projection#the-first-target]]
type named struct{ name, text string }

// The commands a config file and its schema write. [[spec/design_output/projection#the-first-target]]
func commandsFrom(entry Entry, texts map[string]string) map[string]string {
	out := map[string]string{}
	said := flatten(parsed(texts[entry.shown("from")]), "")
	raw := parsed(texts[entry.shown("schema")])
	schema := keysOf(raw)
	put := func(files []named) {
		for _, one := range files {
			out[entry.folder()+"/"+one.name] = one.text
		}
	}
	known := map[string]declared{}
	for _, one := range schema {
		if _, held := known[jsString(one.key)]; !held {
			known[jsString(one.key)] = one
		}
	}
	declaredOf := func(key string) declared {
		parts := strings.Split(key, ".")
		leaf := "undefined"
		if len(parts) > 1 {
			leaf = parts[1]
		}
		one := known[key]
		one.help = dig(raw, "properties", parts[0], "properties", leaf, "help")
		return one
	}
	keys := newObject()
	builtIns := builtInsOf(raw, "")
	for _, key := range builtIns.order {
		if _, held := known[key]; held {
			keys.Set(key, builtIns.Get(key))
		}
	}
	for _, key := range said.order {
		keys.Set(key, said.Get(key))
	}
	for _, key := range keys.order {
		put(commandsFor(key, keys.Get(key), declaredOf(key), entry, configPath(key)))
	}
	for _, widget := range widgetsIn(raw) {
		put(commandsFor(widget.key, said.Get(widget.key), declaredOf(widget.key), entry, widget.path))
	}
	return out
}

// A config object's leaves by dotted key, the comment left out. [[spec/design_output/config#a-key-names-a-path]]
func flatten(said any, at string) *Object {
	out := &Object{at: map[string]any{}}
	object := asObject(said)
	for _, name := range object.Keys() {
		if name == commentKey {
			continue
		}
		key := name
		if at != "" {
			key = at + "." + name
		}
		value := object.Get(name)
		if inner := asObject(value); inner != nil {
			deeper := flatten(inner, key)
			for _, under := range deeper.order {
				out.Set(under, deeper.Get(under))
			}
			continue
		}
		out.Set(key, value)
	}
	return out
}

// The keys a schema declares, one a leaf under an object section. [[spec/design_output/config#the-schema-says-the-type]]
func keysOf(schema any) []declared {
	out := []declared{}
	sections := objectAt(schema, "properties")
	for _, section := range sections.Keys() {
		said := asObject(sections.Get(section))
		if section == commentKey || said == nil || said.Get("type") != "object" {
			continue
		}
		leaves := objectAt(said, "properties")
		for _, leaf := range leaves.Keys() {
			if leaf == commentKey {
				continue
			}
			one := leaves.Get(leaf)
			enum, listed := dig(one, "enum").([]any)
			out = append(out, declared{key: section + "." + leaf, typed: dig(one, "type"), options: enum, listed: listed})
		}
	}
	return out
}

// Each key's built-in value, the schema's default, by its dotted name. [[spec/design_output/config#the-layers]]
func builtInsOf(schema any, at string) *Object {
	out := newObject()
	properties := objectAt(schema, "properties")
	for _, name := range properties.Keys() {
		one := asObject(properties.Get(name))
		if name == commentKey || one == nil {
			continue
		}
		key := name
		if at != "" {
			key = at + "." + name
		}
		if one.Get("type") == "object" && truthy(one.Get("properties")) {
			deeper := builtInsOf(one, key)
			for _, under := range deeper.order {
				out.Set(under, deeper.Get(under))
			}
			continue
		}
		if one.Has("default") {
			out.Set(key, one.Get("default"))
		}
	}
	return out
}

// The name and label a key's command carries. [[spec/design_output/projection#a-name-carries-the-path]]
func configPath(key string) commandPath {
	parts := strings.Split(key, ".")
	section, leaf := parts[0], ""
	if len(parts) > 1 {
		leaf = parts[1]
	}
	return commandPath{stem: []string{configPart, section, leaf}, label: []string{configPart, section, leaf}}
}

// A toggle widget a schema groups, with the path its commands take. [[spec/design_output/projection#a-widget-takes-its-path]]
type widget struct {
	key, section, leaf, group string
	path                      commandPath
}

// The toggle widgets a schema groups, each with its path. [[spec/design_output/projection#a-widget-takes-its-path]]
func widgetsIn(schema any) []widget {
	out := []widget{}
	sections := objectAt(schema, "properties")
	for _, section := range sections.Keys() {
		leaves := objectAt(sections.Get(section), "properties")
		for _, leaf := range leaves.Keys() {
			one := leaves.Get(leaf)
			if !truthy(dig(one, "group")) || dig(one, "widget") != toggleWidget {
				continue
			}
			if _, listed := dig(one, "enum").([]any); !listed {
				continue
			}
			out = append(out, widget{key: section + "." + leaf, section: section, leaf: leaf, group: jsString(dig(one, "group"))})
		}
	}
	for i, one := range out {
		shared := 0
		for _, each := range out {
			if each.group == one.group && each.leaf == one.leaf {
				shared++
			}
		}
		tail := []string{one.leaf}
		if shared > 1 {
			tail = []string{one.section, one.leaf}
		}
		out[i].path = commandPath{
			stem:  append([]string{slug(one.group)}, tail...),
			label: append([]string{one.group}, tail...),
		}
	}
	return out
}

var (
	slugGaps  = regexp.MustCompile(`[^a-z0-9]+`)
	slugEdges = regexp.MustCompile(`^-|-$`)
)

// A group's name as a file name part. [[spec/design_output/projection#a-widget-takes-its-path]]
func slug(said string) string {
	return slugEdges.ReplaceAllString(slugGaps.ReplaceAllString(strings.ToLower(said), "-"), "")
}

// The values a key's commands set: its options, or true and false for a boolean. [[spec/design_output/projection#the-first-target]]
func optionsFor(value any, said declared) []string {
	if len(said.options) > 0 {
		out := make([]string, len(said.options))
		for i, one := range said.options {
			out[i] = jsString(one)
		}
		return out
	}
	typed := said.typed
	if absent(typed) {
		typed = typeOf(value)
	}
	if typed == "boolean" {
		return []string{"true", "false"}
	}
	return nil
}

// A value's kind, as typeof names it. [[spec/design_output/projection#the-first-target]]
func typeOf(said any) string {
	switch said.(type) {
	case nil:
		return "undefined"
	case bool:
		return "boolean"
	case float64:
		return "number"
	case string:
		return "string"
	}
	return "object"
}

// A command's file name: the prefix, the stem, and the option it sets. [[spec/design_output/projection#a-name-carries-the-path]]
func nameOf(stem []string, option string, given bool) string {
	path := commandPrefix + strings.Join(stem, "-")
	if given {
		path += "-" + option
	}
	return path + noteEnding
}

// The commands one key writes: one taking what the owner types, or one an option. [[spec/design_output/projection#the-first-target]]
func commandsFor(key string, value any, said declared, entry Entry, path commandPath) []named {
	options := optionsFor(value, said)
	opens := "The line above runs before this turn opens, so `" + key + "` reads"
	where := strings.Join(path.label, " / ")
	help := ""
	if truthy(said.help) {
		help = " " + jsString(said.help)
	}
	if len(options) == 0 {
		return []named{{
			name: nameOf(path.stem, "", false),
			text: fileFor(entry, key, argument, opens+" what you type after the name.",
				where+": sets "+key+" to what you type."+help, "<value>"),
		}}
	}
	out := make([]named, 0, len(options))
	for _, option := range options {
		out = append(out, named{
			name: nameOf(path.stem, option, true),
			text: fileFor(entry, key, option, opens+" `"+option+"` from here on.",
				where+": sets "+key+" to "+option+"."+help, ""),
		})
	}
	return out
}

// One command file: the line it runs, the sentence under it, and its frontmatter where the entry wraps one. [[spec/design_output/projection#how-a-command-sets-it]]
func fileFor(entry Entry, key, said, sentence, description, hint string) string {
	body := strings.Join([]string{
		"!`./RUNME.sh config " + key + " " + said + "`",
		"",
		wrapped(sentence+" Run `./RUNME.sh config` to read which layer answers a key: "+
			"`"+localConfig+"` beats the environment, and the environment beats `"+trackedConfig+"`.", bodyWidth),
		"",
	}, "\n")
	if entry.raw.Get("wrap") != frontmatterWrap {
		return body
	}
	lines := []string{"---", "description: " + quoted(description)}
	if hint != "" {
		lines = append(lines, "argument-hint: "+quoted(hint))
	}
	lines = append(lines,
		"allowed-tools: Bash(./RUNME.sh config:*)",
		hidden,
		"generated: "+quoted(saysGenerated(entry.shown("from"))),
		"---",
		"",
		body,
	)
	return strings.Join(lines, "\n")
}

// The one command that mints a retro. [[spec/design_input/the-agent-pulls-tickets]]
func retroFrom(entry Entry) map[string]string {
	body := strings.Join([]string{
		"!`./RUNME.sh retro new`",
		"",
		wrapped("The line above runs before this turn opens, so a retro stands open at its "+
			"first leaf, and the answer above holds that leaf. Run `./RUNME.sh branch "+
			"pull <name>` to read it again.", bodyWidth),
		"",
	}, "\n")
	text := body
	if entry.raw.Get("wrap") == frontmatterWrap {
		text = strings.Join([]string{
			"---",
			"description: " + quoted("retro: mints a retro off its route, opens it, and hands out its first leaf."),
			"allowed-tools: Bash(./RUNME.sh retro:*)",
			hidden,
			"generated: " + quoted(saysGenerated(entry.shown("from"))),
			"---",
			"",
			body,
		}, "\n")
	}
	return map[string]string{entry.folder() + "/" + retroFile: text}
}
