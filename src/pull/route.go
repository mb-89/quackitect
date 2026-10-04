// The reads the route, fill and update verbs share: a route a person edits
// past the pointer, the drift from the version a ticket copied, and a new
// route that keeps the leaves already reached, off ticket-route.js,
// ticket-drift.js and updated in ticket.js under src/scripts.
// [[spec/design_input/the-editor-draws-the-ticket#the-drawing-takes-an-edit]]
package pull

import (
	"encoding/json"
	"fmt"
	"math"
	"strconv"
	"strings"

	"quackitect/src/front"
	"quackitect/src/yaml"
)

// Why a route a person hands in breaks a leaf the ticket reached, and the step it names, or nothing where it opens on the reached leaves as they stood. [[spec/design_input/the-editor-draws-the-ticket#the-drawing-takes-an-edit]]
func RouteAheadOnly(held *yaml.Doc, steps []any) (why, at string) {
	pointer := strings.TrimSpace(yaml.AsString(held.Get("step")))
	fresh := EntriesIn(steps)
	if pointer != "" && !holdsLeaf(fresh, pointer) {
		return fmt.Sprintf("The route holds no %s, where the pointer stands. Keep the pointer's leaf.", pointer), pointer
	}
	reached := ReachedOf(held)
	old := EntriesIn(held.Get("steps"))
	var kept, leaves []Entry
	for _, one := range old {
		if one.Leaf && reached[one.Path] {
			kept = append(kept, one)
		}
	}
	for _, one := range fresh {
		if one.Leaf {
			leaves = append(leaves, one)
		}
	}
	for i, one := range kept {
		if i < len(leaves) && leaves[i].Path == one.Path && SameStep(leaves[i].Said, one.Said) {
			continue
		}
		return one.Path + " stands reached, so the route opens on it as it stood. Edit the steps past the pointer.", one.Path
	}
	byPath := entriesByPath(fresh)
	for _, one := range old {
		if one.Leaf || !holdsUnder(kept, one.Path) {
			continue
		}
		if got, ok := byPath[one.Path]; ok && SameStep(FieldsOf(got.Said), FieldsOf(one.Said)) {
			continue
		}
		return one.Path + " holds a reached leaf, so it keeps every field but steps.", one.Path
	}
	return "", ""
}

func holdsLeaf(walk []Entry, path string) bool {
	for _, one := range walk {
		if one.Leaf && one.Path == path {
			return true
		}
	}
	return false
}

func holdsUnder(walk []Entry, path string) bool {
	for _, one := range walk {
		if strings.HasPrefix(one.Path, path+"/") {
			return true
		}
	}
	return false
}

// Each step by its path, a later step of the same path standing over an earlier one. [[spec/design_input/the-editor-draws-the-ticket#the-drawing-takes-an-edit]]
func entriesByPath(walk []Entry) map[string]Entry {
	out := map[string]Entry{}
	for _, one := range walk {
		out[one.Path] = one
	}
	return out
}

// Each step past the reached leaves that stands added, changed, moved or dropped against the base. A phase compares every field but steps. [[spec/design_input/the-editor-draws-the-ticket#the-engine-answers-the-editor]]
func RouteDrift(held *yaml.Doc, base []any) []string {
	reached := ReachedOf(held)
	ahead := func(walk []Entry) []Entry {
		out := []Entry{}
		for _, one := range walk {
			if !reached[one.Path] {
				out = append(out, one)
			}
		}
		return out
	}
	mine, theirs := ahead(EntriesIn(held.Get("steps"))), ahead(EntriesIn(base))
	byPath := entriesByPath(theirs)
	out := []string{}
	for _, one := range mine {
		if was, ok := byPath[one.Path]; !ok || !sameEntry(one, was) {
			out = append(out, one.Path)
		}
	}
	kept := map[string]bool{}
	for _, one := range mine {
		kept[one.Path] = true
	}
	for _, one := range theirs {
		if !kept[one.Path] {
			out = append(out, one.Path)
		}
	}
	named := map[string]bool{}
	for _, path := range out {
		named[path] = true
	}
	var ours, copied []string
	for _, one := range mine {
		if _, ok := byPath[one.Path]; ok && !named[one.Path] {
			ours = append(ours, one.Path)
		}
	}
	for _, one := range theirs {
		if kept[one.Path] && !named[one.Path] {
			copied = append(copied, one.Path)
		}
	}
	for i, path := range ours {
		if i >= len(copied) || copied[i] != path {
			return append(out, path)
		}
	}
	return out
}

func sameEntry(one, was Entry) bool {
	if one.Leaf {
		return SameStep(one.Said, was.Said)
	}
	return SameStep(FieldsOf(one.Said), FieldsOf(was.Said))
}

// The steps a ticket's version of its process held, off the first commit the log names whose file answers the hash. The log and the show reach git, which the caller holds. [[spec/design_input/the-editor-draws-the-ticket#the-engine-answers-the-editor]]
func DriftBase(log func() (string, bool), show func(sha string) string, hash string) ([]any, bool) {
	if hash == "" {
		return nil, false
	}
	said, ok := log()
	if !ok {
		return nil, false
	}
	for _, sha := range strings.Split(said, "\n") {
		if sha = strings.TrimSpace(sha); sha == "" {
			continue
		}
		text := show(sha)
		if text == "" {
			continue
		}
		read := yaml.AsDoc(yaml.Read(text))
		if read == nil {
			read = yaml.New()
		}
		if ProcessHash(read) == hash {
			return flatOf(read.Get("steps")), true
		}
	}
	return nil, false
}

// The new route with every leaf the ticket reached keeping what it holds, or why the route holds no leaf where the ticket stands. [[spec/design_input/the-agent-pulls-tickets#processes-are-routes]]
func UpdatedRoute(held *yaml.Doc, route []any) ([]any, string) {
	steps, _, why := UpdatedRouteKept(held, route)
	return steps, why
}

// The new route as UpdatedRoute answers it, and how many leaves kept what they hold. [[spec/design_input/the-agent-pulls-tickets#processes-are-routes]]
func UpdatedRouteKept(held *yaml.Doc, route []any) ([]any, int, string) {
	step := strings.TrimSpace(yaml.AsString(held.Get("step")))
	if step != "" && !holdsLeaf(EntriesIn(route), step) {
		return nil, 0, fmt.Sprintf("This ticket stands at %s, and the new route holds no such leaf. Edit the route on the ticket, or close it.", step)
	}
	reached := ReachedOf(held)
	said := map[string]*yaml.Doc{}
	for _, one := range EntriesIn(held.Get("steps")) {
		said[one.Path] = one.Said
	}
	kept := 0
	steps := copiedRoute(route, "", func(one any, path string) any {
		was, ok := said[path]
		if !reached[path] || !ok {
			return one
		}
		kept++
		return was
	})
	return steps, kept, ""
}

// The route copied, each phase holding its steps copied, and each leaf what take answers for its path. [[spec/design_input/the-agent-pulls-tickets#processes-are-routes]]
func copiedRoute(list []any, parent string, take func(one any, path string) any) []any {
	out := make([]any, 0, len(list))
	for _, item := range list {
		one := yaml.AsDoc(item)
		path := yaml.AsString(one.Get("name"))
		if parent != "" {
			path = parent + "/" + templated(one, "name")
		}
		under := flatOf(one.Get("steps"))
		if len(under) == 0 {
			out = append(out, take(item, path))
			continue
		}
		phase := yaml.New()
		for _, key := range one.Keys() {
			phase.Set(key, one.Get(key))
		}
		phase.Set("steps", copiedRoute(under, path, take))
		out = append(out, phase)
	}
	return out
}

// A field as a JavaScript template writes it: undefined where the key stands nowhere, and null where it holds nothing. [[spec/design_input/the-agent-pulls-tickets#processes-are-routes]]
func templated(one *yaml.Doc, key string) string {
	switch {
	case !one.Has(key):
		return "undefined"
	case one.Get(key) == nil:
		return "null"
	}
	return yaml.AsString(one.Get(key))
}

// A value as a list: none where it holds nothing, itself where it is one, and a list of one otherwise. [[spec/design_input/the-agent-pulls-tickets#processes-are-routes]]
func flatOf(said any) []any {
	switch one := said.(type) {
	case nil:
		return []any{}
	case []any:
		return one
	}
	return []any{said}
}

// The route a --steps flag hands in, read as JSON.parse reads it with each object's key order kept, or false where it holds no JSON list. [[spec/design_input/the-editor-draws-the-ticket#the-drawing-takes-an-edit]]
func RouteOf(said string) ([]any, bool) {
	if !json.Valid([]byte(said)) {
		return nil, false
	}
	var held front.Ordered
	if err := json.Unmarshal([]byte(`{"route":`+said+`}`), &held); err != nil || len(held) != 1 {
		return nil, false
	}
	list, ok := held[0].Value.([]any)
	if !ok {
		return nil, false
	}
	return routeValue(list).([]any), true
}

// A value off JSON as the front reads it: an object a document in its key order, a key twice keeping its first place and its last value, and a number an int where it is whole. [[spec/design_input/the-editor-draws-the-ticket#the-drawing-takes-an-edit]]
func routeValue(said any) any {
	switch one := said.(type) {
	case front.Ordered:
		out := yaml.New()
		for _, pair := range one {
			out.Set(pair.Key, routeValue(pair.Value))
		}
		return out
	case []any:
		out := make([]any, len(one))
		for i, each := range one {
			out[i] = routeValue(each)
		}
		return out
	case json.Number:
		number, _ := one.Float64()
		if number == math.Trunc(number) && math.Abs(number) <= 1<<safeBits {
			return int(number)
		}
		return number
	}
	return said
}

// A value as JSON.stringify writes it, each document in its key order. [[spec/design_input/the-editor-draws-the-ticket#the-drawing-takes-an-edit]]
func RouteJSON(said any) string {
	switch one := said.(type) {
	case nil:
		return "null"
	case bool:
		return strconv.FormatBool(one)
	case int:
		return strconv.Itoa(one)
	case float64:
		return jsNumber(one)
	case string:
		return jsQuote(one)
	case *yaml.Doc:
		parts := make([]string, 0, len(one.Keys()))
		for _, key := range one.Keys() {
			parts = append(parts, jsQuote(key)+":"+RouteJSON(one.Get(key)))
		}
		return "{" + strings.Join(parts, ",") + "}"
	case []any:
		parts := make([]string, len(one))
		for i, each := range one {
			parts[i] = RouteJSON(each)
		}
		return "[" + strings.Join(parts, ",") + "]"
	}
	return jsQuote(yaml.AsString(said))
}

// The bits a JavaScript number holds a whole number in, and the range it writes in full. [[spec/design_input/the-editor-draws-the-ticket#the-drawing-takes-an-edit]]
const (
	safeBits     = 53
	smallestFull = 1e-6
	largestFull  = 1e21
)

// A number as JavaScript writes it: whole digits, or an exponent past the range it writes in full. [[spec/design_input/the-editor-draws-the-ticket#the-drawing-takes-an-edit]]
func jsNumber(said float64) string {
	if size := math.Abs(said); size == 0 || (size >= smallestFull && size < largestFull) {
		return strconv.FormatFloat(said, 'f', -1, floatBits)
	}
	mantissa, exponent, _ := strings.Cut(strconv.FormatFloat(said, 'e', -1, floatBits), "e")
	sign, digits := exponent[:1], strings.TrimLeft(exponent[1:], "0")
	return mantissa + "e" + sign + digits
}
