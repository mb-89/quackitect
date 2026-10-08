// The layer a spawned helper reads before its task: the notes binding its kind
// beside the notes binding none, as LayerFor and ForHelper build it.
// [[spec/tickets/spawn-answers-off-the-door]]
package brief

import (
	"slices"
	"strconv"
	"strings"
)

// The chapter whose table rides the rules. [[spec/design_output/level0#the-examples-ride-the-rules]]
const examplesChapter = "Examples"

type note struct{ name, text string }

// The layer of the spawn's kind, or the helper layer where the kind holds none. A tree holding no rule answers none. [[spec/tickets/the-spawn-reaches-its-guidance]]
func LayerFor(tree Tree, env func(string) string, kind string) string {
	var top []note
	for _, one := range notesIn(tree, Guidance) {
		if bindsHere(one.text, env) {
			top = append(top, one)
		}
	}
	var free, held []note
	for _, one := range top {
		if len(kindsOf(one.text)) == 0 {
			free = append(free, one)
		}
	}
	for _, one := range append(top, notesBelow(tree, Guidance)...) {
		if kind != "" && slices.Contains(kindsOf(one.text), kind) && bindsHere(one.text, env) {
			held = append(held, one)
		}
	}
	if len(held) > 0 {
		return standing(append(free, held...))
	}
	return standing(free)
}

// The prompt under the layer, or the prompt alone where no layer stands. [[spec/design_output/level0#the-helper-takes-the-guidance]]
func ForHelper(layer, prompt string) string {
	if layer == "" {
		return prompt
	}
	return strings.Join([]string{
		"# How this tree is worked",
		"",
		"These rules reach you before your task does, and they hold over what you",
		"write. Vale holds the mechanical ones at the write door, so a write",
		"breaking one comes back with the reason and the line.",
		"",
		layer,
		"",
		"# Your task",
		"",
		prompt,
	}, "\n")
}

// Each note's title, its rules numbered, and its Examples table under them. [[spec/design_output/level0#the-standing-layer]]
func standing(notes []note) string {
	var said []string
	for _, one := range notes {
		rules := actionables(one.text)
		if len(rules) == 0 {
			continue
		}
		said = append(said, "### "+titleOf(one.name), "")
		for i, rule := range rules {
			said = append(said, strconv.Itoa(i+1)+". "+rule)
		}
		if shown := examplesOf(one.text); len(shown) > 0 {
			said = append(said, "")
			said = append(said, shown...)
		}
		said = append(said, "")
	}
	return strings.TrimSpace(strings.Join(said, "\n"))
}

// [[spec/design_output/level0#the-examples-ride-the-rules]]
func examplesOf(text string) []string {
	var out []string
	for _, line := range lines.Split(chapterOf(text, examplesChapter), -1) {
		if line = strings.TrimSpace(line); strings.HasPrefix(line, "|") {
			out = append(out, line)
		}
	}
	return out
}

// [[spec/design_output/level0#the-standing-layer]]
func titleOf(name string) string {
	return strings.NewReplacer("-", " ", "_", " ").Replace(strings.TrimSuffix(name, noteSuffix))
}

// The notes standing in the folder itself, drafts left out. [[spec/tickets/the-spawn-reaches-its-guidance]]
func notesIn(tree Tree, folder string) []note {
	var out []note
	for _, name := range sorted(tree.List(folder)) {
		if !strings.HasSuffix(name, noteSuffix) || strings.HasPrefix(name, draftMark) {
			continue
		}
		if text, ok := tree.Read(folder + "/" + name); ok {
			out = append(out, note{name, text})
		}
	}
	return out
}

// Every note in the folders under this one, each named by its path below it. [[spec/tickets/the-spawn-reaches-its-guidance]]
func notesBelow(tree Tree, folder string) []note {
	var out []note
	for _, name := range sorted(tree.List(folder)) {
		if strings.HasSuffix(name, noteSuffix) {
			continue
		}
		at := folder + "/" + name
		for _, one := range append(notesIn(tree, at), notesBelow(tree, at)...) {
			out = append(out, note{name + "/" + one.name, one.text})
		}
	}
	return out
}

func sorted(names []string) []string {
	out := slices.Clone(names)
	slices.Sort(out)
	return out
}
