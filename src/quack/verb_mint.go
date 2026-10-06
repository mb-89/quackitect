// The mint verb: a new note in the shape its schema names, with the route and
// its hash copied in off the process a ticket names, off the JavaScript
// mint verb.
// [[spec/design_input/the-agent-pulls-tickets#processes-are-routes]]
package main

import (
	"fmt"
	"io"
	"path"
	"regexp"
	"strings"

	"quackitect/src/index"
	"quackitect/src/modules/check"
	"quackitect/src/pull"
	"quackitect/src/yaml"
)

func init() { register("mint", mintVerb(index.Root)) }

// The kind whose mint joins the box's group. [[spec/tickets/a-box-keeps-its-tickets]]
const ticketKind = "ticket"

var fieldFlag = regexp.MustCompile(`(?s)^--([^=]+)=(.*)$`)

// [[spec/design_input/the-agent-pulls-tickets#processes-are-routes]]
func mintVerb(rootOf func() (string, error)) twin {
	return func(argv []string, _ bool, out, errs io.Writer) int {
		words := argv[1:]
		places := []string{}
		for _, one := range words {
			if !strings.HasPrefix(one, "-") {
				places = append(places, one)
			}
		}
		method, work, err := rootsOf(rootOf)
		if err != nil {
			fmt.Fprintln(errs, err)
			return exitFailed
		}
		schemas := check.SchemasIn(check.TreeOver(method, rootDisk{method}))
		kinds := strings.Join(schemas.Names(), ", ")
		if len(places) < 2 {
			fmt.Fprint(errs, "Usage: ./RUNME.sh mint <kind> <path> [--field=value ...]\n\n")
			fmt.Fprintf(errs, "%s holds %s.\n", check.Schemas, kinds)
			fmt.Fprintln(errs, "A ticket takes --process=<name>, and the route and its hash copy in. One off a handover line takes --from=handover.")
			return exitUsage
		}
		kind, where := places[0], places[1]
		schema := schemas.Get(kind)
		if schema == nil {
			fmt.Fprintf(errs, "%s holds no %s. It holds %s.\n", check.Schemas, kind, kinds)
			return exitUsage
		}
		// [[spec/tickets/the-owners-words-travel-verbatim]]
		handover := false
		handed := []string{}
		for _, one := range words {
			if one == pull.FromHandover {
				handover = true
				continue
			}
			handed = append(handed, one)
		}
		fields, why := fieldsIn(handed, schema)
		if why == "" {
			why = withRoute(pull.OSDisk{Root: method}, schema, fields)
		}
		if why != "" {
			fmt.Fprintln(errs, why)
			return exitUsage
		}
		disk := pull.OSDisk{Root: work}
		if disk.Exists(where) {
			fmt.Fprintf(errs, "%s stands already. Name a path nothing holds yet.\n", where)
			return exitUsage
		}
		if handover {
			fields[askField] = pull.HandedOver(yaml.AsString(fields[askField]))
		}
		name := strings.TrimSuffix(path.Base(where), ".md")
		// A ticket on a closed group's branch stands free. [[spec/design_output/pull#a-closed-group-takes-no-child]]
		freed := ""
		if kind == ticketKind {
			branch, _ := gitIn(work, "rev-parse", "--abbrev-ref", "HEAD")
			named := yaml.AsString(fields[pull.GroupField])
			if group := pull.JoinsGroup(named, yaml.AsString(fields["process"]), branch, name); group != "" {
				if named == "" && pull.GroupClosed(disk, group) {
					freed = group
				} else {
					fields[pull.GroupField] = group
				}
			}
		}
		text, why := check.Minted(schemas, kind, where, fields)
		if why == "" {
			// [[spec/design_output/work#a-group-is-a-ticket]]
			why = pull.EmptyGroup(disk, text, name)
		}
		if why == "" {
			why = pull.ClosedGroup(disk, text)
		}
		if why != "" {
			fmt.Fprintln(errs, why)
			return exitUsage
		}
		if err := disk.Write(where, text); err != nil {
			fmt.Fprintln(errs, err)
			return exitFailed
		}
		fmt.Fprintf(out, "%s stands, in the shape %s names.\n", where, kind)
		if freed != "" {
			fmt.Fprintf(out, "%s stands closed, so %s joins no group and stands free.\n", freed, where)
		}
		for _, one := range check.PlaceholderFaults(text, schema, where) {
			fmt.Fprintf(out, "%s:%d:%d: %s: %s\n", one.File, one.Line, one.Column, one.Rule, one.Message)
		}
		fmt.Fprintln(out, "Write it, then run ./RUNME.sh lint to read what is left.")
		return 0
	}
}

// The chapter a ticket's ask stands under. [[spec/design_input/the-agent-pulls-tickets#processes-are-routes]]
const askField = "Ask"

// The fields the --field=value words name, each under the key its schema spells, or why one names none, off fieldsIn in lib/schema-mint.js. [[spec/design_output/schema#the-fields-a-caller-names]]
func fieldsIn(words []string, schema *yaml.Doc) (map[string]any, string) {
	named, order := map[string]string{}, []string{}
	names := func(key string) {
		slug := check.SlugOf(key)
		if _, held := named[slug]; !held {
			order = append(order, slug)
		}
		named[slug] = key
	}
	for _, key := range yaml.AsDoc(yaml.AsDoc(schema.Get("frontmatter")).Get("properties")).Keys() {
		names(key)
	}
	for _, one := range yaml.AsList(yaml.AsDoc(schema.Get("body")).Get("sections")) {
		names(yaml.AsString(yaml.AsDoc(one).Get("header")))
	}
	fields := map[string]any{}
	for _, word := range words {
		pair := fieldFlag.FindStringSubmatch(word)
		if pair == nil {
			continue
		}
		key, ok := named[check.SlugOf(pair[1])]
		if !ok {
			takes := make([]string, 0, len(order))
			for _, slug := range order {
				takes = append(takes, named[slug])
			}
			return nil, fmt.Sprintf("%s names no field of a %s note. It takes %s.", pair[1], yaml.AsString(schema.Get("kind")), strings.Join(takes, ", "))
		}
		fields[key] = pair[2]
	}
	return fields, ""
}

// Copies the route, its hash and the process's ask in where the fields name a process and the schema takes steps, off withRoute in src/scripts/process.js. [[spec/design_input/the-agent-pulls-tickets#processes-are-routes]]
func withRoute(disk pull.Disk, schema *yaml.Doc, fields map[string]any) string {
	props := yaml.AsDoc(yaml.AsDoc(schema.Get("frontmatter")).Get("properties"))
	if yaml.AsString(fields["process"]) == "" || !props.Has("steps") {
		return ""
	}
	held, why := pull.ProcessAt(disk, yaml.AsString(fields["process"]))
	if why != "" {
		return why
	}
	fields["process"], fields["process_hash"], fields["steps"] = held.Link, held.Hash, held.Route
	if len(held.Ask) > 0 && strings.TrimSpace(yaml.AsString(fields[askField])) == "" {
		fields[askField] = pull.AskRows(held.Ask)
	}
	return ""
}
