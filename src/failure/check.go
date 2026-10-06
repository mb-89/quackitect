// The faults the check names over the registry: a node with no remedy, a
// raised id with no node, and a refusal past the door in a moved file.
// [[spec/design_output/failures#the-check-holds-the-registry]]
package failure

import (
	"fmt"
	"regexp"
	"sort"
	"strings"
)

// Each moved file, and the refusal call it held before the move. [[spec/design_output/failures#the-check-holds-the-registry]]
var Moved = map[string]string{}

// A raise the scan reads: a Go call through the package, and a JavaScript call on a receiver whose name holds failure, the handle the door answers, so an engine's raise of an event stays out. [[spec/design_output/failures#the-check-holds-the-registry]] [[spec/tickets/raise-scan-keys-failure-door]]
var raiseCalls = []*regexp.Regexp{
	regexp.MustCompile(`\bfailure\.Raise\(\s*[^,()]+,\s*"([^"]+)"`),
	regexp.MustCompile("\\b\\w*[Ff]ailures?\\w*(?:\\([^()]*\\))?\\.raise\\(\\s*[\"'`]([^\"'`]+)[\"'`]"),
}

// Each fault NodeOf names over every node under the folder. [[spec/design_output/failures#the-check-holds-the-registry]]
func NodeFaults(from Reader) []string {
	out := []string{}
	for _, name := range from.Files(Folder) {
		id, ok := strings.CutSuffix(name, noteEnd)
		if !ok {
			continue
		}
		if text, ok := from.Read(Folder + "/" + name); ok {
			_, faults := NodeOf(id, text)
			out = append(out, faults...)
		}
	}
	return out
}

// Each literal id a Raise or a raise names in the texts handed in, where the registry holds no node for it. [[spec/design_output/failures#the-check-holds-the-registry]]
func RaiseFaults(registry Registry, files map[string]string) []string {
	out := []string{}
	for _, path := range sortedKeys(files) {
		for _, call := range raiseCalls {
			for _, found := range call.FindAllStringSubmatch(files[path], -1) {
				if _, ok := registry.Node(found[1]); !ok {
					out = append(out, fmt.Sprintf("%s raises %s, and no node under %s carries it", path, found[1], Folder))
				}
			}
		}
	}
	return out
}

// Each moved file whose text still holds the refusal call it held before the move. [[spec/design_output/failures#the-check-holds-the-registry]]
func DoorFaults(moved, files map[string]string) []string {
	out := []string{}
	for _, path := range sortedKeys(moved) {
		if text, ok := files[path]; ok && strings.Contains(text, moved[path]) {
			out = append(out, fmt.Sprintf("%s still writes %s past the failure door", path, moved[path]))
		}
	}
	return out
}

func sortedKeys(held map[string]string) []string {
	out := make([]string, 0, len(held))
	for key := range held {
		out = append(out, key)
	}
	sort.Strings(out)
	return out
}
