// The sweep answers the LSP's own rules over the files the index mirrors, and
// reads the name words off the layers the way src/config reads them.
// [[spec/tickets/lsp-rules-move-to-check]]
package check

import (
	"testing"

	"quackitect/src/q"
	"quackitect/src/q/qtest"
)

// What the sweep answers over the files and variables a case seeds, git tracking every file. [[spec/tickets/lsp-rules-move-to-check]]
func sweepOver(t *testing.T, files, env map[string]string) []Finding {
	t.Helper()
	return sweepSeeded(t, files, pathsOf(files), nil, env)
}

// What the sweep answers over the files, the paths git tracks, the buffers and the variables a case seeds. [[spec/tickets/check-sweep-reads-tracked]]
func sweepSeeded(t *testing.T, files map[string]string, tracked []string, buffers, env map[string]string) []Finding {
	t.Helper()
	var vars, git q.Writer
	index := qtest.New(t, func(c *q.Catalog) {
		Registers(c)
		vars = q.OutIn(c, "env/<name>", "", q.Doc("an SE_ variable, as the case seeds it"))
		git = q.OutIn(c, TrackedPort, []string{}, q.Doc("the paths git tracks, as the case seeds them"))
	})
	seeds := map[string]any{}
	for at, text := range files {
		seeds["files/"+at] = q.Content{Hash: "h", Text: text}
	}
	for at, text := range buffers {
		seeds["buffers/"+at] = text
	}
	index.Seed(seeds)
	index.SeedAs(git, map[string]any{TrackedPort: tracked})
	if len(env) > 0 {
		set := map[string]any{}
		for name, value := range env {
			set["env/"+name] = value
		}
		index.SeedAs(vars, set)
	}
	said, _ := index.Read("sweep").([]Finding)
	return said
}

func pathsOf(files map[string]string) []string {
	out := []string{}
	for at := range files {
		out = append(out, at)
	}
	return out
}

func holdsRule(found []Finding, rule, file string) bool {
	for _, one := range found {
		if one.Rule == rule && one.File == file {
			return true
		}
	}
	return false
}

func TestTheSweepAnswersADeadPointerOffTheFiles(t *testing.T) {
	found := sweepOver(t, map[string]string{"spec/a.md": "# A\n\nSee [[spec/nowhere]].\n"}, nil)
	if !holdsRule(found, "EveryPointerResolves", "spec/a.md") {
		t.Fatalf("the sweep answers %+v, and wants EveryPointerResolves on spec/a.md", found)
	}
}

// A file git tracks nowhere draws nothing, as the LSP's sweep reads tracked files alone. [[spec/tickets/check-sweep-reads-tracked]]
func TestTheSweepSkipsAFileGitTracksNowhere(t *testing.T) {
	files := map[string]string{"spec/a.md": "# A\n\nSee [[spec/nowhere]].\n", "spec/scratch.md": "# S\n\nSee [[spec/nowhere]].\n"}
	found := sweepSeeded(t, files, []string{"spec/a.md"}, map[string]string{"spec/ghost.md": "# G\n\nSee [[spec/nowhere]].\n"}, nil)
	if !holdsRule(found, "EveryPointerResolves", "spec/a.md") {
		t.Fatalf("the sweep answers %+v, and wants the dead pointer the tracked spec/a.md holds", found)
	}
	for _, one := range found {
		if one.File == "spec/scratch.md" || one.File == "spec/ghost.md" {
			t.Fatalf("the sweep answers %+v, and wants nothing on a path git tracks nowhere", found)
		}
	}
}

// The local layer counts, though git ignores the file holding it. [[spec/tickets/check-sweep-reads-tracked]]
func TestTheLocalLayerCountsUntracked(t *testing.T) {
	files := map[string]string{
		"spec/config/level0.json":  `{"names": {"words": 5}}`,
		".se/.runtime/config.json": `{"names": {"words": 2}}`,
		"spec/one-two-three.md":    "# One\n",
	}
	if found := sweepSeeded(t, files, []string{"spec/config/level0.json", "spec/one-two-three.md"}, nil, nil); !holdsRule(found, "NameHoldsTheWords", "spec/one-two-three.md") {
		t.Fatalf("the sweep answers %+v, and wants the untracked local cap of two words to draw NameHoldsTheWords", found)
	}
}

func TestTheSweepReadsTheWordsOffTheLocalLayer(t *testing.T) {
	files := map[string]string{
		"spec/config/level0.json":  `{"names": {"words": 5}}`,
		".se/.runtime/config.json": `{"names": {"words": 2}}`,
		"spec/one-two-three.md":    "# One\n",
	}
	if found := sweepOver(t, files, nil); !holdsRule(found, "NameHoldsTheWords", "spec/one-two-three.md") {
		t.Fatalf("the sweep answers %+v, and wants the local cap of two words to draw NameHoldsTheWords", found)
	}
	if found := sweepOver(t, files, map[string]string{"SE_NAMES_WORDS": "4"}); !holdsRule(found, "NameHoldsTheWords", "spec/one-two-three.md") {
		t.Fatalf("the sweep answers %+v, and wants the local file over the variable, as src/config reads it", found)
	}
}

func TestTheSweepReadsTheVariableOverTheTrackedFile(t *testing.T) {
	files := map[string]string{
		"spec/config/level0.json": `{"names": {"words": 5}}`,
		"spec/one-two-three.md":   "# One\n",
	}
	if found := sweepOver(t, files, nil); holdsRule(found, "NameHoldsTheWords", "spec/one-two-three.md") {
		t.Fatalf("the sweep answers %+v, and wants the tracked cap of five to pass three words", found)
	}
	if found := sweepOver(t, files, map[string]string{"SE_NAMES_WORDS": "2"}); !holdsRule(found, "NameHoldsTheWords", "spec/one-two-three.md") {
		t.Fatalf("the sweep answers %+v, and wants the variable over the tracked file, as src/config reads it", found)
	}
}

// A cap no file sets reads the schema's default, as src/config reads it. [[spec/tickets/the-config-schema-gets-generated]]
func TestTheTrackedFileBeatsTheBuiltIn(t *testing.T) {
	texts := Texts{
		"spec/config/level0.schema.json": `{"properties": {"names": {"properties": {"words": {"type": "number", "default": 7}}}}}`,
		trackedConfig:                    `{"names": {"words": 4}}`,
	}
	if said := countOf(texts, nil, wordsKey); said != 4 {
		t.Fatalf("the count answers %d, and wants the file's 4", said)
	}
}

func TestAKeyNoLayerNamesCountsNothing(t *testing.T) {
	texts := Texts{schemaConfig: `{"properties": {"names": {"properties": {}}}}`}
	if said := countOf(texts, nil, wordsKey); said != 0 {
		t.Fatalf("the count answers %d, and wants 0", said)
	}
}

func TestCountReadsTheBuiltIn(t *testing.T) {
	texts := Texts{"spec/config/level0.schema.json": `{"properties": {"names": {"properties": {"words": {"type": "number", "default": 7}}}}}`}
	if said := countOf(texts, nil, wordsKey); said != 7 {
		t.Fatalf("the count answers %d, and wants the default 7", said)
	}
}
